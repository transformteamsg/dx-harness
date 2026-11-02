import fs from "node:fs";
import { isHtml } from "../../files.ts";
import { elements } from "../../html.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { VIEWPORT, message } from "./util.ts";

/* The rules of A11Y-11: one channel for each state change. */

/* A11Y-11a: a focus target is not also a live region. The source shows both
   attributes on one element, so the module reads the HTML. */
export const a11y11a: RuleModule = {
  code: "A11Y-11a",
  surface: "source",

  locate({ files, params }) {
    const roles = (params.liveRoles as string[]).map((r) => r.toLowerCase());
    const out: Candidate[] = [];
    for (const file of files.filter(isHtml)) {
      for (const el of elements(fs.readFileSync(file, "utf8"))) {
        if (el.attrs.tabindex?.trim() !== "-1") continue;
        const role = (el.attrs.role ?? "").toLowerCase();
        const live = el.attrs["aria-live"];
        const channel = roles.includes(role) ? `role="${role}"` : live !== undefined && live.trim().toLowerCase() !== "off" ? `aria-live="${live}"` : null;
        if (!channel) continue;
        out.push({
          file,
          line: el.line,
          column: el.column,
          data: { message: `The <${el.tag}> is a focus target with tabindex="-1" and a live region with ${channel}, so a screen reader reads it twice. Remove the live region, or do not move focus to it.` },
        });
      }
    }
    return out;
  },
  decide: message,
};

interface Action {
  page: string;
  click: string;
}

/* A11Y-11b: focus is not lost after a state change. Each action opens its page
   fresh, because the click changes the page. */
export const a11y11b: RuleModule = {
  code: "A11Y-11b",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const action of params.actions as Action[]) {
      const page = await rendered.open(action.page, VIEWPORT, { fresh: true });
      await page.focus(action.click);
      const at = await page.evaluate((selector: string) => {
        const r = document.querySelector(selector)!.getBoundingClientRect();
        return { top: Math.round(r.top), left: Math.round(r.left) };
      }, action.click);
      await page.click(action.click);
      const lost = await page.evaluate((): string | null => {
        const a = document.activeElement as any;
        if (!a || a === document.body || a === document.documentElement) return "focus is on the page body";
        if (!a.isConnected) return "the focused element is no longer in the page";
        const r = a.getBoundingClientRect();
        const style = getComputedStyle(a);
        if (!r.width || !r.height || style.visibility === "hidden") return `the focused <${a.tagName.toLowerCase()}> is hidden`;
        return null;
      });
      if (lost) {
        out.push({
          file: action.page,
          line: at.top,
          column: at.left,
          data: { message: `After a click on ${action.click}, ${lost}. Move focus to the new content, or to the next control.` },
        });
      }
    }
    return out;
  },
  decide: message,
};
