import type { Candidate, RuleModule } from "../../types.ts";
import { VIEWPORT, message } from "./util.ts";

/* A11Y-3a: every form field has a visible label. WR-1a reports a field with no
   accessible name, so this module reports a field that has a name and no label
   on the screen. */

interface Issue {
  message: string;
  top: number;
  left: number;
}

export const a11y3a: RuleModule = {
  code: "A11Y-3a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const issues = await page.evaluate((): Issue[] => {
        const found: Issue[] = [];
        const skip = ["hidden", "submit", "button", "reset", "image"];
        /* A box of 2 by 2 pixels or less, a clip, or a box off the screen is visually hidden. */
        const shown = (el: any): boolean => {
          const style = getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden") return false;
          const r = el.getBoundingClientRect();
          if (r.width <= 2 || r.height <= 2) return false;
          if (r.right <= 0 || r.bottom <= 0) return false;
          return !/rect\(\s*0(px)?[\s,]+0(px)?[\s,]+0(px)?[\s,]+0(px)?\s*\)/.test(style.clip) && style.clipPath !== "inset(50%)";
        };
        const text = (el: any): string => (el.textContent ?? "").replace(/\s+/g, " ").trim();
        for (const el of Array.from(document.querySelectorAll("input, select, textarea")) as any[]) {
          if (el.tagName === "INPUT" && skip.includes((el.getAttribute("type") ?? "text").toLowerCase())) continue;
          if (!shown(el)) continue;
          const labels = [
            ...Array.from(el.labels ?? []),
            ...(el.getAttribute("aria-labelledby") ?? "").split(/\s+/).filter(Boolean).map((id: string) => document.getElementById(id)).filter(Boolean),
          ] as any[];
          const named = labels.some((l) => text(l) !== "") || ["aria-label", "placeholder", "title"].some((a) => (el.getAttribute(a) ?? "").trim() !== "");
          /* A field with no name fails WR-1a. */
          if (!named) continue;
          if (labels.some((l) => text(l) !== "" && shown(l))) continue;
          const tag = el.tagName.toLowerCase();
          const r = el.getBoundingClientRect();
          const hidden = labels.find((l) => text(l) !== "");
          const why = hidden
            ? `its label "${text(hidden)}" is visually hidden`
            : `its name comes from ${["aria-label", "placeholder", "title"].filter((a) => el.hasAttribute(a)).join(" and ")} only`;
          found.push({ message: `The <${tag}> has no visible label: ${why}. Show a <label> beside the field.`, top: Math.round(r.top), left: Math.round(r.left) });
        }
        return found;
      });
      for (const i of issues) out.push({ file: pagePath, line: i.top, column: i.left, data: { message: i.message } });
    }
    return out;
  },
  decide: message,
};
