import fs from "node:fs";
import { createRequire } from "node:module";
import type { AxeNode } from "../../engines/axe.ts";
import type { Candidate, Params, RuleModule } from "../../types.ts";

/* An axe-core rule with options. The shared wrapper in engines/axe.ts runs a rule
   with its default options. WP-12a and WP-13a pass options from the rule file,
   so this wrapper configures the check, runs the rules, and resets axe. */

const require_ = createRequire(import.meta.url);
const AXE_SOURCE = fs.readFileSync(require_.resolve("axe-core/axe.min.js"), "utf8");

const VIEWPORT = { width: 1280, height: 800 };

export interface AxeSetup {
  /* Check options by check id, for axe.configure. */
  checks?: Record<string, unknown>;
  /* Selectors to leave out of the run. */
  exclude?: string[];
  /* A rule with reviewOnFail reports its failures as "incomplete". These ids
     count an incomplete node as a failure. */
  incompleteFails?: string[];
  /* Wait for the metadata of autoplay media before the run. */
  waitForMedia?: boolean;
}

interface Arg {
  ids: string[];
  setup: AxeSetup;
}

export function axeRuleWith(code: string, ruleIds: string[], setup: (params: Params) => AxeSetup): RuleModule {
  return {
    code,
    surface: "rendered",

    async locate({ rendered, params }) {
      const out: Candidate[] = [];
      if (!rendered) return out;
      const arg: Arg = { ids: ruleIds, setup: setup(params) };
      for (const pagePath of params.pages as string[]) {
        const page = await rendered.open(pagePath, VIEWPORT);
        const loaded = await page.evaluate(() => typeof window.axe !== "undefined");
        if (!loaded) await page.inject(AXE_SOURCE);
        const nodes = (await page.evaluate(async (a: Arg) => {
          if (a.setup.waitForMedia) {
            const waits = Array.from(document.querySelectorAll("audio[autoplay], video[autoplay]")).map(
              (m: any) =>
                new Promise<void>((resolve) => {
                  if (m.readyState >= 1) return resolve();
                  m.addEventListener("loadedmetadata", () => resolve());
                  m.addEventListener("error", () => resolve());
                  setTimeout(resolve, 3000);
                }),
            );
            await Promise.all(waits);
          }
          const axe = window.axe;
          if (a.setup.checks) axe.configure({ checks: Object.entries(a.setup.checks).map(([id, options]) => ({ id, options })) });
          try {
            const context: any = a.setup.exclude && a.setup.exclude.length > 0 ? { exclude: a.setup.exclude } : document;
            const result = await axe.run(context, {
              runOnly: { type: "rule", values: a.ids },
              resultTypes: a.setup.incompleteFails ? ["violations", "incomplete"] : ["violations"],
            });
            const found: any[] = [];
            const add = (id: string, help: string, n: any) => {
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
              found.push({ ruleId: id, help, target: String(target), html: String(n.html || "").slice(0, 100), top, left });
            };
            for (const v of result.violations) for (const n of v.nodes) add(v.id, v.help, n);
            for (const v of result.incomplete) {
              if (!a.setup.incompleteFails || !a.setup.incompleteFails.includes(v.id)) continue;
              for (const n of v.nodes) {
                const el: any = document.querySelector(Array.isArray(n.target) ? n.target[0] : n.target);
                /* Media with no known length is a "cannot tell", not a failure. */
                if (el && "duration" in el && !(el.duration > 0)) continue;
                add(v.id, v.help, n);
              }
            }
            return found;
          } finally {
            axe.reset();
          }
        }, arg)) as AxeNode[];
        for (const n of nodes) out.push({ file: pagePath, line: n.top, column: n.left, data: n });
      }
      return out;
    },

    decide(candidate) {
      const n = candidate.data as AxeNode;
      return `${n.help} (axe ${n.ruleId}) at ${n.target}: ${n.html}`;
    },
  };
}
