import { SEARCH, SEARCH_EXEMPT, hasSearch, readPages } from "../project.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* BD-2c: the search form is visible in the first screen at desktop size. It
   applies only when the site has a search form, so BD-2a reports a site with no
   search once. */

export const bd2c: RuleModule = {
  code: "BD-2c",
  surface: "rendered",

  async locate({ rendered, files, params }) {
    const out: Candidate[] = [];
    if (!rendered || SEARCH_EXEMPT.includes(String(params.serviceType)) || !hasSearch(readPages(files))) return out;
    const viewport = { width: params.desktopViewport as number, height: params.desktopHeight as number };
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, viewport);
      const visible = await page.evaluate(
        (selector: string) =>
          Array.from(document.querySelectorAll(selector)).some((el: any) => {
            const r = el.getBoundingClientRect();
            return el.checkVisibility() && r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight;
          }),
        String(params.searchSelector),
      );
      if (!visible) out.push({ file: pagePath, line: 1, column: 1 });
    }
    return out;
  },

  decide() {
    return "The search form is not visible in the first screen at desktop size. Do not hide it behind a toggle or below the fold.";
  },
};
