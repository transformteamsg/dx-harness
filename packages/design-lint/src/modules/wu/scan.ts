import fs from "node:fs";
import ts from "typescript";
import { isHtml } from "../../files.ts";
import { elements } from "../../html.ts";
import type { HtmlElement } from "../../html.ts";

/* A small reader for the scripts that the source rules of WU look at: on*
   attributes and inline scripts in HTML, and JSX, TSX, JS, and TS files. It
   parses with the TypeScript compiler, which is installed for the project.
   It follows a handler that is a function expression or an identifier that
   names a function in the same file. A handler that it cannot trace is skipped,
   which is the limit that WU-5b and WU-6b judge. */

const SCRIPT_FILE = /\.(?:jsx|tsx|js|mjs|cjs|ts)$/i;
export const isScriptFile = (f: string) => SCRIPT_FILE.test(f);

/* "onFocus", "onfocus", and "focus" all name the event "focus". */
export const eventName = (name: string) => name.toLowerCase().replace(/^on/, "");

export interface Body {
  node: ts.Node;
  sf: ts.SourceFile;
}

/* The element that a handler sits on, reduced to what a selector needs. */
export interface ControlRef {
  tag: string;
  attrs: Record<string, string>;
  /* Whether the control sits in a form, and whether that form has a submit control. */
  inForm: boolean;
  formHasSubmit: boolean;
}

export interface HandlerSite {
  file: string;
  line: number;
  column: number;
  event: string;
  body: Body | null;
  /* Set for a handler on an element or a JSX tag. Not set for addEventListener. */
  control?: ControlRef;
}

const kindOf = (file: string): ts.ScriptKind => {
  if (/\.tsx$/i.test(file)) return ts.ScriptKind.TSX;
  if (/\.ts$/i.test(file)) return ts.ScriptKind.TS;
  if (/\.jsx$/i.test(file)) return ts.ScriptKind.JSX;
  return ts.ScriptKind.JS;
};

export const parseScript = (text: string, file: string) =>
  ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kindOf(file));

export function position(sf: ts.SourceFile, node: ts.Node): { line: number; column: number } {
  const p = sf.getLineAndCharacterOfPosition(node.getStart(sf));
  return { line: p.line + 1, column: p.character + 1 };
}

const squash = (s: string) => s.replace(/\s+/g, "");

/* The calls and the assignments in the body whose target is one of the names. A
   name matches the whole target or its tail, so "location.href" matches
   "window.location.href" and "submit" matches "form.submit". */
export function contextChanges(body: Body, names: string[]): ts.Node[] {
  const wanted = names.map(squash);
  const hit = (target: string) => wanted.some((n) => target === n || target.endsWith(`.${n}`));
  const out: ts.Node[] = [];
  const walk = (n: ts.Node) => {
    if (ts.isCallExpression(n) && hit(squash(n.expression.getText(body.sf)))) out.push(n);
    else if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && hit(squash(n.left.getText(body.sf)))) out.push(n);
    ts.forEachChild(n, walk);
  };
  walk(body.node);
  return out;
}

/* A body that stops the default action: a preventDefault call or `return false`. */
export function preventsDefault(body: Body): boolean {
  let found = false;
  const walk = (n: ts.Node) => {
    if (ts.isCallExpression(n) && /(^|\.)preventDefault$/.test(squash(n.expression.getText(body.sf)))) found = true;
    if (ts.isReturnStatement(n) && n.expression?.kind === ts.SyntaxKind.FalseKeyword) found = true;
    ts.forEachChild(n, walk);
  };
  walk(body.node);
  return found;
}

function resolveBody(expr: ts.Expression | undefined, sf: ts.SourceFile): Body | null {
  if (!expr) return null;
  if (ts.isParenthesizedExpression(expr)) return resolveBody(expr.expression, sf);
  if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)) return { node: expr.body, sf };
  if (ts.isIdentifier(expr)) {
    let found: Body | null = null;
    const walk = (n: ts.Node) => {
      if (found) return;
      if (ts.isFunctionDeclaration(n) && n.name?.text === expr.text && n.body) found = { node: n.body, sf };
      else if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === expr.text && n.initializer) {
        if (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer)) found = { node: n.initializer.body, sf };
      }
      ts.forEachChild(n, walk);
    };
    walk(sf);
    return found;
  }
  return null;
}

/* addEventListener("x", fn) and el.onx = fn, in any script. */
function scriptSites(sf: ts.SourceFile, file: string, shift: (line: number, column: number) => { line: number; column: number }): HandlerSite[] {
  const out: HandlerSite[] = [];
  const walk = (n: ts.Node) => {
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === "addEventListener") {
      const [type, fn] = n.arguments;
      if (type && ts.isStringLiteralLike(type)) {
        const p = position(sf, n);
        out.push({ file, ...shift(p.line, p.column), event: eventName(type.text), body: resolveBody(fn, sf) });
      }
    } else if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(n.left) && /^on[a-z]+$/.test(n.left.name.text)) {
      const p = position(sf, n);
      out.push({ file, ...shift(p.line, p.column), event: eventName(n.left.name.text), body: resolveBody(n.right, sf) });
    }
    ts.forEachChild(n, walk);
  };
  walk(sf);
  return out;
}

const SUBMIT = (tag: string, attrs: Record<string, string>) => {
  const type = (attrs.type ?? "").toLowerCase();
  return (tag === "button" && (type === "" || type === "submit")) || (tag === "input" && (type === "submit" || type === "image"));
};

function htmlSites(file: string, source: string): HandlerSite[] {
  const els = elements(source);
  const out: HandlerSite[] = [];
  const formOf = (el: HtmlElement): HtmlElement | null => {
    let at = el.parent;
    while (at !== null) {
      if (els[at].tag === "form") return els[at];
      at = els[at].parent;
    }
    return null;
  };
  const hasSubmit = (form: HtmlElement) =>
    els.some((e) => SUBMIT(e.tag, e.attrs) && formOf(e)?.index === form.index);
  for (const el of els) {
    if (el.tag === "script" && !el.attrs.src && el.text.trim() !== "") {
      const sf = parseScript(el.text, "inline.js");
      out.push(
        ...scriptSites(sf, file, (line, column) => ({
          line: el.contentLine + line - 1,
          column: line === 1 ? el.contentColumn + column - 1 : column,
        })),
      );
    }
    const form = formOf(el);
    const control: ControlRef = { tag: el.tag, attrs: el.attrs, inForm: form !== null, formHasSubmit: form ? hasSubmit(form) : false };
    for (const [name, value] of Object.entries(el.attrs)) {
      if (!/^on[a-z]+$/.test(name)) continue;
      const sf = parseScript(value, "attr.js");
      out.push({ file, line: el.line, column: el.column, event: eventName(name), body: { node: sf, sf }, control });
    }
  }
  return out;
}

const jsxName = (n: ts.JsxTagNameExpression) => n.getText().toLowerCase();

function attrMap(open: ts.JsxOpeningLikeElement): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const a of open.attributes.properties) {
    if (!ts.isJsxAttribute(a)) continue;
    const name = a.name.getText();
    const init = a.initializer;
    if (!init) attrs[name] = "";
    else if (ts.isStringLiteral(init)) attrs[name] = init.text;
    else if (ts.isJsxExpression(init) && init.expression && ts.isStringLiteralLike(init.expression)) attrs[name] = init.expression.text;
    else attrs[name] = "\0expression";
  }
  return attrs;
}

export interface JsxControl {
  tag: string;
  attrs: Record<string, string>;
  line: number;
  column: number;
  /* The expression of each attribute, by name. */
  props: Map<string, ts.Expression | undefined>;
  sf: ts.SourceFile;
  inForm: boolean;
  formHasSubmit: boolean;
}

/* Every JSX tag with its attributes and its form context. */
export function jsxTags(sf: ts.SourceFile): JsxControl[] {
  const out: JsxControl[] = [];
  const submitIn = (n: ts.Node): boolean => {
    let found = false;
    const walk = (c: ts.Node) => {
      if ((ts.isJsxOpeningElement(c) || ts.isJsxSelfClosingElement(c)) && SUBMIT(jsxName(c.tagName), attrMap(c))) found = true;
      ts.forEachChild(c, walk);
    };
    walk(n);
    return found;
  };
  const walk = (n: ts.Node, form: ts.JsxElement | null) => {
    let next = form;
    if (ts.isJsxElement(n) && jsxName(n.openingElement.tagName) === "form") next = n;
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const props = new Map<string, ts.Expression | undefined>();
      for (const a of n.attributes.properties) {
        if (!ts.isJsxAttribute(a)) continue;
        const init = a.initializer;
        props.set(a.name.getText(), init && ts.isJsxExpression(init) ? init.expression : init && ts.isStringLiteral(init) ? init : undefined);
      }
      const p = position(sf, n);
      out.push({ tag: jsxName(n.tagName), attrs: attrMap(n), ...p, props, sf, inForm: form !== null, formHasSubmit: form ? submitIn(form) : false });
    }
    ts.forEachChild(n, (c) => walk(c, next));
  };
  walk(sf, null);
  return out;
}

function jsxSites(file: string, sf: ts.SourceFile): HandlerSite[] {
  const out: HandlerSite[] = [];
  for (const t of jsxTags(sf)) {
    for (const [name, expr] of t.props) {
      if (!/^on[A-Z]/.test(name)) continue;
      out.push({
        file,
        line: t.line,
        column: t.column,
        event: eventName(name),
        body: resolveBody(expr, sf),
        control: { tag: t.tag, attrs: t.attrs, inForm: t.inForm, formHasSubmit: t.formHasSubmit },
      });
    }
  }
  return out;
}

/* Every handler in the files. */
export function handlerSites(files: string[]): HandlerSite[] {
  const out: HandlerSite[] = [];
  for (const file of files) {
    if (isHtml(file)) out.push(...htmlSites(file, fs.readFileSync(file, "utf8")));
    else if (isScriptFile(file)) {
      const sf = parseScript(fs.readFileSync(file, "utf8"), file);
      out.push(...scriptSites(sf, file, (line, column) => ({ line, column })), ...jsxSites(file, sf));
    }
  }
  return out;
}

/* A control as a selector sees it: the tag and the attributes. A JSX attribute
   that is an expression has no known value, so it never matches a value test. */
export function controlMatches(c: { tag: string; attrs: Record<string, string> }, selectors: string[], match: (el: HtmlElement, sel: string) => boolean): boolean {
  const fake = { index: 0, parent: null, tag: c.tag, attrs: c.attrs, line: 0, column: 0, contentLine: 0, contentColumn: 0, text: "" } as HtmlElement;
  return selectors.some((s) => match(fake, s));
}
