import tseslint from "typescript-eslint";
import type { HtmlElement } from "../../html.ts";

/* A small reader of JSX and TSX for the rules of WP-1 to WP-9 that jsx-a11y does
   not decide: WP-1e, WP-3a, and the selector exemption of WP-2b. It returns each
   JSX element with its static attributes. An attribute whose value is an
   expression is dynamic, and a spread attribute makes every attribute unknown, so
   a check treats both as a pass and never guesses. */

export const JSX_FILE = /\.(?:jsx|tsx)$/i;

export interface JsxEl {
  tag: string;
  /* Static string values. A bare attribute is the empty string. */
  attrs: Record<string, string>;
  dynamic: Set<string>;
  spread: boolean;
  /* One-based, the same as an ESLint message. */
  line: number;
  column: number;
  children: JsxEl[];
  /* True when the element has text or an expression child. */
  hasText: boolean;
}

const RENAMED: Record<string, string> = { className: "class", htmlFor: "for" };

function staticString(value: any): string | null {
  if (value === null) return "";
  if (value.type === "Literal") return String(value.value);
  if (value.type === "JSXExpressionContainer") {
    const e = value.expression;
    if (e.type === "Literal" && e.value !== null) return String(e.value);
    if (e.type === "TemplateLiteral" && e.expressions.length === 0) return e.quasis.map((q: any) => q.value.cooked).join("");
  }
  return null;
}

function tagName(name: any): string {
  if (name.type === "JSXIdentifier") return name.name;
  if (name.type === "JSXNamespacedName") return `${name.namespace.name}:${name.name.name}`;
  return `${tagName(name.object)}.${name.property.name}`;
}

/* Every element of the source, in document order. A file that does not parse has none. */
export function jsxElements(source: string): JsxEl[] {
  let ast: any;
  try {
    ast = (tseslint.parser as any).parseForESLint(source, { ecmaFeatures: { jsx: true }, loc: true, range: true }).ast;
  } catch {
    return [];
  }
  const out: JsxEl[] = [];
  const build = (node: any): JsxEl => {
    const opening = node.openingElement;
    const el: JsxEl = {
      tag: tagName(opening.name),
      attrs: {},
      dynamic: new Set(),
      spread: false,
      line: opening.loc.start.line,
      column: opening.loc.start.column + 1,
      children: [],
      hasText: false,
    };
    out.push(el);
    for (const a of opening.attributes) {
      if (a.type === "JSXSpreadAttribute") {
        el.spread = true;
        continue;
      }
      const raw = a.name.type === "JSXNamespacedName" ? `${a.name.namespace.name}:${a.name.name.name}` : a.name.name;
      const name = RENAMED[raw] ?? raw;
      const value = staticString(a.value);
      if (value === null) el.dynamic.add(name);
      else el.attrs[name] = value;
    }
    for (const child of node.children) {
      if (child.type === "JSXText") {
        if (child.value.trim() !== "") el.hasText = true;
      } else if (child.type === "JSXExpressionContainer") {
        if (child.expression.type !== "JSXEmptyExpression") el.hasText = true;
        walk(child.expression, el);
      } else if (child.type === "JSXElement") {
        el.children.push(build(child));
      } else if (child.type === "JSXFragment") {
        walk(child, el);
      }
    }
    return el;
  };
  /* A fragment and a nested expression can hold elements. They join the nearest parent. */
  const walk = (node: any, parent: JsxEl | null) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const n of node) walk(n, parent);
      return;
    }
    if (node.type === "JSXElement") {
      const el = build(node);
      parent?.children.push(el);
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === "parent" || key === "loc" || key === "range") continue;
      walk(value, parent);
    }
  };
  walk(ast, null);
  return out;
}

/* The shape that html.ts matches selectors against. */
export function asHtml(el: JsxEl): HtmlElement {
  return { index: 0, parent: null, tag: el.tag, attrs: el.attrs, line: el.line, column: el.column, contentLine: el.line, contentColumn: el.column, text: "" };
}
