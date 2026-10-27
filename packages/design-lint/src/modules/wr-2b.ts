import type { Candidate, RuleModule } from "../types.ts";

/* WR-2b: live region values are valid. This module checks the live-region
   attributes only. WR-1c covers the general validity of ARIA attributes, so a
   bad value is reported once there, and here for the live attributes alone. */

const VIEWPORT = { width: 1280, height: 800 };

interface Issue {
  message: string;
  top: number;
  left: number;
}

export const wr2b: RuleModule = {
  code: "WR-2b",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const allowed = (params.allowedLiveValues as string[]).map(String);
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const issues = await page.evaluate((allowedLive: string[]): Issue[] => {
        const found: Issue[] = [];
        const add = (el: any, message: string) => {
          const r = el.getBoundingClientRect();
          found.push({ message, top: Math.round(r.top), left: Math.round(r.left) });
        };
        for (const el of Array.from(document.querySelectorAll("[aria-live], [aria-atomic], [aria-relevant], [aria-busy], [role=alert], [role=status]")) as any[]) {
          const live = el.getAttribute("aria-live");
          if (live !== null && !allowedLive.includes(live)) add(el, `aria-live="${live}" is not one of ${allowedLive.join(", ")}.`);
          for (const name of ["aria-atomic", "aria-busy"]) {
            const v = el.getAttribute(name);
            if (v !== null && v !== "true" && v !== "false") add(el, `${name}="${v}" must be true or false.`);
          }
          const rel = el.getAttribute("aria-relevant");
          if (rel !== null && !rel.split(/\s+/).every((t: string) => ["additions", "removals", "text", "all"].includes(t))) {
            add(el, `aria-relevant="${rel}" has a token that is not additions, removals, text, or all.`);
          }
          const role = el.getAttribute("role");
          if (live !== null && ((role === "alert" && live !== "assertive") || (role === "status" && live !== "polite"))) {
            add(el, `role="${role}" conflicts with aria-live="${live}". Remove aria-live, or use ${role === "alert" ? "assertive" : "polite"}.`);
          }
        }
        return found;
      }, allowed);
      for (const i of issues) out.push({ file: pagePath, line: i.top, column: i.left, data: { message: i.message } });
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};
