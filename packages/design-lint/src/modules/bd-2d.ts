import { SEARCH_EXEMPT, hasSearch, readPages } from "../project.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* BD-2d: the search form is on every page, in the header, in the same place.
   Applies only when the site has a search form. */

const VIEWPORT = { width: 1280, height: 800 };

export const bd2d: RuleModule = {
  code: "BD-2d",
  surface: "rendered",

  async locate({ rendered, files, params }) {
    const out: Candidate[] = [];
    if (!rendered || SEARCH_EXEMPT.includes(String(params.serviceType)) || !hasSearch(readPages(files))) return out;
    const tolerance = params.positionTolerancePx as number;
    let reference: { x: number; y: number } | null = null;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const found = await page.evaluate(
        (arg: { search: string; header: string }) => {
          const el: any = document.querySelector(arg.search);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { inHeader: Boolean(el.closest(arg.header)), x: Math.round(r.left), y: Math.round(r.top) };
        },
        { search: String(params.searchSelector), header: String(params.headerSelector) },
      );
      const at = (message: string): Candidate => ({ file: pagePath, line: found?.y ?? 1, column: found?.x ?? 1, data: { message } });
      if (!found) {
        out.push(at("The page has no search form."));
        continue;
      }
      if (!found.inHeader) out.push(at("The search form is not in the header."));
      if (reference === null) reference = found;
      else if (Math.abs(found.x - reference.x) > tolerance || Math.abs(found.y - reference.y) > tolerance) {
        out.push(at(`The search form is at ${found.x},${found.y}. On the first page it is at ${reference.x},${reference.y}. Keep it in the same place.`));
      }
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};
