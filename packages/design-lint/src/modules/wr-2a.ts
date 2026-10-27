import fs from "node:fs";
import { isHtml } from "../files.ts";
import { elements, matches } from "../html.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* WR-2a: a status message sits in a live region. The product config names the
   status messages by selector, because no engine can find one by its purpose.
   The module checks that each named element is a live region in the source. It
   does not see an element that a script inserts later. */

export const wr2a: RuleModule = {
  code: "WR-2a",
  surface: "source",

  locate({ files, params }) {
    const selectors = (params.statusSelectors as string[]).join(",");
    const roles = (params.liveRoles as string[]).map((r) => r.toLowerCase());
    const out: Candidate[] = [];
    for (const file of files.filter(isHtml)) {
      for (const el of elements(fs.readFileSync(file, "utf8"))) {
        if (!matches(el, selectors)) continue;
        const live = roles.includes((el.attrs.role ?? "").toLowerCase()) || "aria-live" in el.attrs;
        if (!live) out.push({ file, line: el.line, column: el.column, data: { tag: el.tag, roles } });
      }
    }
    return out;
  },

  decide(candidate) {
    const { tag, roles } = candidate.data as { tag: string; roles: string[] };
    return `The status message <${tag}> is not a live region. Give it a role (${roles.join(", ")}) or aria-live.`;
  },
};
