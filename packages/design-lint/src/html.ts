import { parse } from "parse5";
import type { DefaultTreeAdapterMap } from "parse5";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];

export interface HtmlElement {
  /* The position in the list that elements() returns. */
  index: number;
  /* The index of the nearest ancestor that has a position, or null. */
  parent: number | null;
  tag: string;
  attrs: Record<string, string>;
  /* One-based, from the start tag. */
  line: number;
  column: number;
  /* Where the content starts, after the start tag. */
  contentLine: number;
  contentColumn: number;
  text: string;
}

const isElement = (n: Node): n is Element => "tagName" in n;

function textOf(n: Node): string {
  if ("value" in n && n.nodeName === "#text") return n.value;
  const kids = "childNodes" in n ? n.childNodes : [];
  return kids.map(textOf).join("");
}

/* Every element of the document, in document order, with its position. An
   element that the parser adds itself, such as an implied head, has no
   position and is left out. */
export function elements(source: string): HtmlElement[] {
  const out: HtmlElement[] = [];
  const walk = (n: Node, parent: number | null) => {
    let next = parent;
    if (isElement(n)) {
      const loc = n.sourceCodeLocation;
      if (loc) {
        const index = out.length;
        out.push({
          index,
          parent,
          tag: n.tagName,
          attrs: Object.fromEntries(n.attrs.map((a) => [a.name, a.value])),
          line: loc.startLine,
          column: loc.startCol,
          contentLine: loc.startTag?.endLine ?? loc.startLine,
          contentColumn: loc.startTag?.endCol ?? loc.startCol,
          text: textOf(n),
        });
        next = index;
      }
    }
    const kids = "childNodes" in n ? n.childNodes : [];
    for (const k of kids) walk(k, next);
  };
  walk(parse(source, { sourceCodeLocationInfo: true }), null);
  return out;
}

export function hasAncestor(list: HtmlElement[], el: HtmlElement, test: (e: HtmlElement) => boolean): boolean {
  let at = el.parent;
  while (at !== null) {
    const e = list[at];
    if (test(e)) return true;
    at = e.parent;
  }
  return false;
}

export function closest(list: HtmlElement[], el: HtmlElement, tag: string): HtmlElement | null {
  let at = el.parent;
  while (at !== null) {
    if (list[at].tag === tag) return list[at];
    at = list[at].parent;
  }
  return null;
}

/* One compound selector: a tag, #id, .class, and [attr] or [attr=value] parts.
   A list of them may be separated by commas. A combinator is not supported. */
function compound(el: HtmlElement, sel: string): boolean {
  const re = /^([a-zA-Z][a-zA-Z0-9-]*)?((?:[#.][\w-]+|\[[^\]]+\])*)$/;
  const m = re.exec(sel.trim());
  if (!m) return false;
  if (m[1] && m[1].toLowerCase() !== el.tag) return false;
  for (const part of m[2].match(/[#.][\w-]+|\[[^\]]+\]/g) ?? []) {
    if (part[0] === "#") {
      if (el.attrs.id !== part.slice(1)) return false;
    } else if (part[0] === ".") {
      if (!(el.attrs.class ?? "").split(/\s+/).includes(part.slice(1))) return false;
    } else {
      const a = /^\[\s*([\w-]+)\s*(?:=\s*"?([^"\]]*)"?\s*)?\]$/.exec(part);
      if (!a) return false;
      if (!(a[1] in el.attrs)) return false;
      if (a[2] !== undefined && el.attrs[a[1]] !== a[2]) return false;
    }
  }
  return true;
}

export function matches(el: HtmlElement, selector: string): boolean {
  return selector.split(",").some((s) => compound(el, s));
}
