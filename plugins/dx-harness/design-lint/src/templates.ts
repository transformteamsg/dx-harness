import fs from "node:fs";
import { NodeTypes, parse as parseVue } from "@vue/compiler-dom";
import type { ElementNode, RootNode, TemplateChildNode } from "@vue/compiler-dom";
import { parse as parseSvelte } from "svelte/compiler";
import type { Candidate } from "./types.ts";

/* A reader of Vue and Svelte single-file components for the source rules. It
   returns each element of the template with its static attributes, and each
   style block with its position. An attribute whose value is an expression is
   dynamic, and a spread makes every attribute unknown, so a check treats both
   as a pass and never guesses. A file that does not parse has an error, and a
   rule reports it as unreadable rather than as a pass. */

export const TEMPLATE_FILE = /\.(?:vue|svelte)$/i;
export const isTemplate = (file: string) => TEMPLATE_FILE.test(file);

export interface TemplateElement {
  tag: string;
  /* Static string values. A bare attribute is the empty string. */
  attrs: Record<string, string>;
  dynamic: Set<string>;
  spread: boolean;
  /* True when the element has text or an expression child. */
  hasText: boolean;
  /* One-based, from the start tag. */
  line: number;
  column: number;
}

export interface StyleBlock {
  text: string;
  /* One-based, where the content starts, after the start tag. */
  line: number;
  column: number;
}

export interface Template {
  elements: TemplateElement[];
  styles: StyleBlock[];
  /* The first syntax error, or null when the file parses. */
  error: { line: number; column: number; message: string } | null;
}

/* One-based line and column of an offset in the source. */
function position(source: string, offset: number) {
  const before = source.slice(0, offset).split("\n");
  return { line: before.length, column: before[before.length - 1].length + 1 };
}

function readVue(source: string): Template {
  const out: Template = { elements: [], styles: [], error: null };
  let root: RootNode;
  try {
    root = parseVue(source, {
      parseMode: "sfc",
      onError: (e) => {
        out.error ??= { line: e.loc?.start.line ?? 1, column: e.loc?.start.column ?? 1, message: e.message };
      },
    });
  } catch (e) {
    return { ...out, error: { line: 1, column: 1, message: e instanceof Error ? e.message : String(e) } };
  }
  if (out.error) return out;

  const walk = (node: TemplateChildNode) => {
    if (node.type !== NodeTypes.ELEMENT) return;
    const el: TemplateElement = { tag: node.tag, attrs: {}, dynamic: new Set(), spread: false, hasText: false, line: node.loc.start.line, column: node.loc.start.column };
    for (const prop of node.props) {
      if (prop.type === NodeTypes.ATTRIBUTE) {
        el.attrs[prop.name] = prop.value?.content ?? "";
      } else if (prop.name === "bind") {
        /* :alt="x" binds one attribute. v-bind="obj" binds any of them. */
        const arg = prop.arg;
        if (arg && arg.type === NodeTypes.SIMPLE_EXPRESSION && arg.isStatic) el.dynamic.add(arg.content);
        else el.spread = true;
      }
    }
    el.hasText = node.children.some((c) => (c.type === NodeTypes.TEXT && c.content.trim() !== "") || c.type === NodeTypes.INTERPOLATION);
    out.elements.push(el);
    for (const child of node.children) walk(child);
  };

  for (const block of root.children) {
    if (block.type !== NodeTypes.ELEMENT) continue;
    const element = block as ElementNode;
    if (element.tag === "template") {
      for (const child of element.children) walk(child);
    } else if (element.tag === "style" && element.innerLoc) {
      const { start, end } = element.innerLoc;
      out.styles.push({ text: source.slice(start.offset, end.offset), line: start.line, column: start.column });
    }
  }
  return out;
}

/* The nodes of the Svelte AST that this reader reads. */
interface SvelteNode {
  type: string;
  start: number;
  name?: string;
  attributes?: SvelteNode[];
  value?: true | SvelteNode | SvelteNode[];
  data?: string;
  nodes?: SvelteNode[];
  [key: string]: unknown;
}

function readSvelte(source: string): Template {
  const out: Template = { elements: [], styles: [], error: null };
  let ast: { fragment: SvelteNode; css: { content: { start: number; styles: string } } | null };
  try {
    ast = parseSvelte(source, { modern: true }) as never;
  } catch (e) {
    const err = e as { message?: string; start?: { line: number; column: number } };
    /* The parser gives a one-based line and a zero-based column. */
    const at = err.start ? { line: err.start.line, column: err.start.column + 1 } : { line: 1, column: 1 };
    return { ...out, error: { ...at, message: String(err.message ?? e) } };
  }

  const element = (node: SvelteNode) => {
    const el: TemplateElement = { tag: node.name ?? "", attrs: {}, dynamic: new Set(), spread: false, hasText: false, ...position(source, node.start) };
    for (const attr of node.attributes ?? []) {
      if (attr.type === "SpreadAttribute") el.spread = true;
      else if (attr.type === "BindDirective") el.dynamic.add(attr.name ?? "");
      else if (attr.type === "Attribute") {
        const value = attr.value;
        const parts = value === true ? [] : Array.isArray(value) ? value : [value!];
        if (parts.every((p) => p.type === "Text")) el.attrs[attr.name ?? ""] = parts.map((p) => p.data ?? "").join("");
        else el.dynamic.add(attr.name ?? "");
      }
    }
    const children = (node.fragment as SvelteNode | undefined)?.nodes ?? [];
    el.hasText = children.some((c) => (c.type === "Text" && (c.data ?? "").trim() !== "") || c.type === "ExpressionTag");
    out.elements.push(el);
  };
  /* Each block, such as {#if} or {#each}, and each element keeps its children
     in a fragment, so a walk over the fragments reaches every element. */
  const walk = (node: SvelteNode) => {
    if (node.type === "RegularElement") element(node);
    for (const value of Object.values(node)) {
      const fragment = value as SvelteNode | null;
      if (fragment && typeof fragment === "object" && fragment.type === "Fragment") for (const child of fragment.nodes ?? []) walk(child);
    }
  };
  for (const node of ast.fragment.nodes ?? []) walk(node);

  if (ast.css) out.styles.push({ text: ast.css.content.styles, ...position(source, ast.css.content.start) });
  return out;
}

export function readTemplate(file: string): Template {
  const source = fs.readFileSync(file, "utf8");
  return /\.vue$/i.test(file) ? readVue(source) : readSvelte(source);
}

/* The candidate of a template that does not parse. The rule did not run on the
   file, so the finding blocks at every tier. */
export function unreadable(file: string, error: NonNullable<Template["error"]>): Candidate {
  return { file, line: error.line, column: error.column, notRun: true, data: { unreadable: error.message } };
}

export function unreadableMessage(code: string, data: unknown): string | null {
  const reason = (data as { unreadable?: string } | null)?.unreadable?.split("\n")[0];
  if (reason === undefined) return null;
  return `The template is unreadable, so ${code} could not check the file: ${reason}. Fix the syntax error.`;
}

/* The image elements of a template that have no text alternative: the elements
   and the attributes that jsx-a11y alt-text checks in JSX. A dynamic value may
   hold text, so it passes. */
export function missingAlt(el: TemplateElement): string | null {
  if (el.spread) return null;
  const has = (name: string) => el.dynamic.has(name) || (name in el.attrs && el.attrs[name].trim() !== "");
  const labelled = has("aria-label") || has("aria-labelledby");
  const tag = el.tag.toLowerCase();
  if (tag === "img") {
    if ("alt" in el.attrs || el.dynamic.has("alt") || labelled) return null;
    const role = el.attrs.role;
    if (role === "presentation" || role === "none") return 'Prefer alt="" over a presentational role on <img>.';
    return "<img> elements must have an alt attribute, either with meaningful text, or an empty string for decorative images.";
  }
  if (tag === "input" && el.attrs.type?.toLowerCase() === "image") {
    if (has("alt") || labelled) return null;
    return '<input> elements with type="image" must have a text alternative through the `alt`, `aria-label`, or `aria-labelledby` attribute.';
  }
  if (tag === "area") {
    if (has("alt") || labelled) return null;
    return "Each area of an image map must have a text alternative through the `alt`, `aria-label`, or `aria-labelledby` attribute.";
  }
  if (tag === "object") {
    if (labelled || has("title") || el.hasText) return null;
    return "Embedded <object> elements must have alternative text by providing inner text, aria-label or aria-labelledby attributes.";
  }
  return null;
}
