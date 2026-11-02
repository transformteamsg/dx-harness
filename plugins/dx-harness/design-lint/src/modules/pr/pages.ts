import fs from "node:fs";
import { fileForPath } from "../../project.ts";
import { elements } from "../../html.ts";
import type { HtmlElement } from "../../html.ts";

/* Shared by the source rules of PR that read a list of page paths. A path that
   names no file is skipped: a missing page is the business of the link rule. */
export interface SourcePage {
  path: string;
  file: string;
  els: HtmlElement[];
}

export function sourcePages(root: string, paths: string[]): SourcePage[] {
  const out: SourcePage[] = [];
  for (const p of paths) {
    const file = fileForPath(root, p);
    if (file) out.push({ path: p, file, els: elements(fs.readFileSync(file, "utf8")) });
  }
  return out;
}

/* A finding about a whole page sits on the <html> element, or on 1:1. */
export function pageStart(els: HtmlElement[]): { line: number; column: number } {
  const html = els.find((e) => e.tag === "html");
  return { line: html?.line ?? 1, column: html?.column ?? 1 };
}
