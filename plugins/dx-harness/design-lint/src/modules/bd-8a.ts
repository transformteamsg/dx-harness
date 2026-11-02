import type { Candidate, RuleModule } from "../types.ts";

/* BD-8a: the account identifier is visible in the header of each authenticated
   page. A product with no sign-in lists no authenticated pages, so nothing runs. */

const VIEWPORT = { width: 1280, height: 800 };
const TOP_LIMIT = 200;

export const bd8a: RuleModule = {
  code: "BD-8a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.authenticatedPages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const found = await page.evaluate((selector: string) => {
        const el: any = document.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          visible: el.checkVisibility() && r.width > 0 && r.height > 0,
          text: (el.innerText || "").trim(),
          inHeader: Boolean(el.closest("header, [role=banner]")),
          top: Math.round(r.top),
          left: Math.round(r.left),
        };
      }, String(params.accountSelector));
      let message: string | null = null;
      if (!found) message = "The account name is missing. Show who is signed in.";
      else if (!found.visible) message = "The account name is hidden. Show who is signed in.";
      else if (found.text === "") message = "The account name is empty.";
      else if (!found.inHeader && found.top > TOP_LIMIT) message = "The account name is not in the header or near the top of the page.";
      if (message) out.push({ file: pagePath, line: found?.top ?? 1, column: found?.left ?? 1, data: { message } });
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};
