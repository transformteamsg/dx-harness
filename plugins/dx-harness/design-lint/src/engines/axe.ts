import fs from "node:fs";
import { createRequire } from "node:module";
import type { Candidate, RenderedPage, RuleModule } from "../types.ts";

/* The axe-core wrapper. A rule names axe rules by id. The wrapper injects axe
   into the page once, runs only those rules, and turns each failing element
   into a candidate. The rule decides nothing: an axe violation is a finding. */

const require_ = createRequire(import.meta.url);
const AXE_SOURCE = fs.readFileSync(require_.resolve("axe-core/axe.min.js"), "utf8");

/* The ids of the installed axe-core. Tests check that the ids a rule names exist. */
export function installedAxeRules(): string[] {
  return (require_("axe-core") as { getRules(): { ruleId: string }[] }).getRules().map((r) => r.ruleId);
}

export interface AxeNode {
  ruleId: string;
  help: string;
  target: string;
  html: string;
  top: number;
  left: number;
}

export async function runAxe(page: RenderedPage, ruleIds: string[]): Promise<AxeNode[]> {
  const loaded = await page.evaluate(() => typeof window.axe !== "undefined");
  if (!loaded) await page.inject(AXE_SOURCE);
  return page.evaluate(async (ids: string[]) => {
    const result = await window.axe.run(document, { runOnly: { type: "rule", values: ids }, resultTypes: ["violations"] });
    const out: any[] = [];
    for (const v of result.violations) {
      for (const n of v.nodes) {
        const target = Array.isArray(n.target) ? n.target[0] : n.target;
        let top = 0;
        let left = 0;
        try {
          const el = document.querySelector(target);
          if (el) {
            const b = el.getBoundingClientRect();
            top = Math.round(b.top);
            left = Math.round(b.left);
          }
        } catch {
          /* a selector that the page cannot use keeps the position 0,0 */
        }
        out.push({ ruleId: v.id, help: v.help, target: String(target), html: String(n.html || "").slice(0, 100), top, left });
      }
    }
    return out;
  }, ruleIds) as Promise<AxeNode[]>;
}

const VIEWPORT = { width: 1280, height: 800 };

/* A rule that is a set of axe rules, run on each page in `pages`. */
export function axeRule(code: string, ruleIds: string[]): RuleModule {
  return {
    code,
    surface: "rendered",

    async locate({ rendered, params }) {
      const out: Candidate[] = [];
      if (!rendered) return out;
      for (const pagePath of params.pages as string[]) {
        const page = await rendered.open(pagePath, VIEWPORT);
        for (const n of await runAxe(page, ruleIds)) {
          out.push({ file: pagePath, line: n.top, column: n.left, data: n });
        }
      }
      return out;
    },

    decide(candidate) {
      const n = candidate.data as AxeNode;
      return `${n.help} (axe ${n.ruleId}) at ${n.target}: ${n.html}`;
    },
  };
}
