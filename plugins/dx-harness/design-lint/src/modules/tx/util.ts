import { atElement } from "../../rendered.ts";
import type { Candidate, ElementRef, RenderedPage, RenderedSession } from "../../types.ts";

/* Helpers that the TX modules share. */

export const VIEWPORT = { width: 1280, height: 800 };

export const strings = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

/* A pattern parameter is a case-insensitive regular expression. */
export const pattern = (p: string): RegExp => new RegExp(p, "i");

/* A list of page paths without repeats, in order. */
export const unique = (...lists: unknown[]): string[] => [...new Set(lists.flatMap(strings))];

/* Opens each page and collects facts with probe. The finding sits on the main
   element, by its name, because a rendered finding has no source position. A rule decides
   from the facts, so that the policy stays in decide. */
export async function perPage(
  rendered: RenderedSession | undefined,
  pages: string[],
  probe: (page: RenderedPage) => Promise<Record<string, unknown>>,
): Promise<Candidate[]> {
  const out: Candidate[] = [];
  if (!rendered) return out;
  for (const pagePath of pages) {
    const page = await rendered.open(pagePath, VIEWPORT);
    const facts = await probe(page);
    const at = await page.evaluate((): ElementRef => window.__designLint.element(document.querySelector("main") ?? document.body));
    out.push(atElement(pagePath, at, facts));
  }
  return out;
}

/* The elements that match a selector, as text, from inside the page. A selector
   that the browser cannot parse matches nothing. */
export function textsOf(page: RenderedPage, selector: string): Promise<string[]> {
  return page.evaluate((sel: string) => {
    let list: any[] = [];
    try {
      list = Array.from(document.querySelectorAll(sel));
    } catch {
      /* an invalid selector matches nothing */
    }
    return list.map((el: any) => String(el.innerText ?? el.textContent ?? "").replace(/\s+/g, " ").trim());
  }, selector);
}

export function bodyText(page: RenderedPage): Promise<string> {
  return page.evaluate(() => String(document.body.innerText).replace(/\s+/g, " ").trim());
}
