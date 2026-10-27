import { SEARCH_EXEMPT, hasSearch, readPages } from "../project.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* BD-2e: the search input is wide enough and early in the tab order. It finds
   candidates and does not decide. Applies only when the site has a search form. */

const VIEWPORT = { width: 1280, height: 800 };

export const bd2e: RuleModule = {
  code: "BD-2e",
  surface: "rendered",

  async locate({ rendered, files, params }) {
    const out: Candidate[] = [];
    if (!rendered || SEARCH_EXEMPT.includes(String(params.serviceType)) || !hasSearch(readPages(files))) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const result = await page.evaluate(
        (arg: { input: string; minChars: number }) => {
          const el: any = document.querySelector(arg.input);
          if (!el || !el.checkVisibility()) return null;
          const r = el.getBoundingClientRect();
          const canvas = document.createElement("canvas").getContext("2d");
          canvas.font = getComputedStyle(el).font;
          const needed = canvas.measureText("n".repeat(arg.minChars)).width;
          const tabbable = Array.from(
            document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary, [tabindex]:not([tabindex="-1"])'),
          ).filter((t: any) => !t.disabled && t.checkVisibility());
          return { width: Math.round(r.width), needed: Math.round(needed), stop: tabbable.indexOf(el) + 1, top: Math.round(r.top), left: Math.round(r.left) };
        },
        { input: String(params.searchInputSelector), minChars: params.minChars as number },
      );
      if (!result) continue;
      const max = params.maxTabStops as number;
      if (result.width < result.needed) {
        out.push({ file: pagePath, line: result.top, column: result.left, data: { message: `The search input is ${result.width}px wide. It needs ${result.needed}px to fit ${params.minChars} characters.` } });
      }
      if (result.stop > max) {
        out.push({ file: pagePath, line: result.top, column: result.left, data: { message: `The search input is tab stop ${result.stop}. Keep it within the first ${max}.` } });
      }
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};
