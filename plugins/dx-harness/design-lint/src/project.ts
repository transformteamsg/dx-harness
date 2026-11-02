import fs from "node:fs";
import path from "node:path";
import { elements, matches } from "./html.ts";
import type { HtmlElement } from "./html.ts";
import { isHtml } from "./files.ts";

/* A page path such as "/", "/login.html", or "/zh/" maps to a file under root:
   the path itself, its index.html, or the path with .html added. */
export function fileForPath(root: string, pagePath: string): string | null {
  const base = path.join(root, pagePath.split(/[?#]/)[0]);
  const candidates = [base, path.join(base, "index.html"), `${base}.html`];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
}

/* Where a link goes: a file under root, or null for an external link. A link
   that goes nowhere returns the path that it names with exists set to false. */
export function resolveHref(root: string, fromFile: string, href: string): { exists: boolean; external: boolean } {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return { exists: true, external: true };
  const clean = href.split(/[?#]/)[0];
  if (clean === "") return { exists: true, external: false };
  const target = clean.startsWith("/") ? fileForPath(root, clean) : fileForPath(path.dirname(fromFile), clean);
  return { exists: target !== null, external: false };
}

export interface Page {
  file: string;
  els: HtmlElement[];
}

export function readPages(files: string[]): Page[] {
  return files.filter(isHtml).map((file) => ({ file, els: elements(fs.readFileSync(file, "utf8")) }));
}

export const SEARCH = "[role=search], input[type=search]";

export function hasSearch(pages: Page[]): boolean {
  return pages.some((p) => p.els.some((e) => matches(e, SEARCH)));
}

/* DSS exemptions that a product sets once, as the serviceType parameter. */
export const SEARCH_EXEMPT = ["mobile-app", "transactional", "search-service"];
