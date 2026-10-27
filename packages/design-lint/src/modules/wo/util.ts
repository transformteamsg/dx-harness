import fs from "node:fs";
import { createRequire } from "node:module";
import type { AxeNode } from "../../engines/axe.ts";
import { runAxe } from "../../engines/axe.ts";
import type { Candidate, RenderedPage, RuleModule } from "../../types.ts";

/* Helpers that the rules of WO share. */

export const VIEWPORT = { width: 1280, height: 800 };

const require_ = createRequire(import.meta.url);
const AXE_SOURCE = fs.readFileSync(require_.resolve("axe-core/axe.min.js"), "utf8");

export interface Check {
  id: string;
  options: Record<string, unknown>;
}

/* Runs axe rules after setting the options of some of their checks. The shared
   wrapper cannot do this, and WO-4a and WO-18a read a parameter into an option.
   The options persist on a shared page, and only the rules of WO read these two checks. */
export async function runAxeWith(page: RenderedPage, ruleIds: string[], checks: Check[], reviewOnFail: string[] = []): Promise<AxeNode[]> {
  const loaded = await page.evaluate(() => typeof window.axe !== "undefined");
  if (!loaded) await page.inject(AXE_SOURCE);
  await page.evaluate((c: Check[]) => window.axe.configure({ checks: c }), checks);
  const nodes = await runAxe(page, ruleIds);
  if (reviewOnFail.length === 0) return nodes;
  /* A rule with reviewOnFail reports its failure as "incomplete", not as a violation. */
  const extra = await page.evaluate(async (ids: string[]) => {
    const result = await window.axe.run(document, { runOnly: { type: "rule", values: ids }, resultTypes: ["incomplete"] });
    return result.incomplete.map((v: any) => ({ ruleId: v.id, help: v.help, target: "html", html: "<html>", top: 0, left: 0 }));
  }, reviewOnFail);
  return [...nodes, ...(extra as AxeNode[])];
}

/* A rule that runs axe rules on each page of `pages`, with an optional guard
   and check options read from the parameters. */
export function axeWithParams(
  code: string,
  ruleIds: string[],
  options: { skip?: (params: Record<string, unknown>) => boolean; checks?: (params: Record<string, unknown>) => Check[]; reviewOnFail?: string[] } = {},
): RuleModule {
  return {
    code,
    surface: "rendered",
    async locate({ rendered, params }) {
      const out: Candidate[] = [];
      if (!rendered || options.skip?.(params)) return out;
      for (const pagePath of params.pages as string[]) {
        const page = await rendered.open(pagePath, VIEWPORT);
        for (const n of await runAxeWith(page, ruleIds, options.checks?.(params) ?? [], options.reviewOnFail)) {
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

/* The names that a message may carry. */
export const message = (candidate: Candidate): string => (candidate.data as { message: string }).message;

/* Source files that may hold script or markup. */
export const SCRIPT_FILE = /\.(?:html?|jsx?|tsx?|mjs|cjs|vue|svelte)$/i;

/* One-based line and column of an offset in a text. */
export function position(text: string, offset: number): { line: number; column: number } {
  const before = text.slice(0, offset);
  const line = before.split("\n").length;
  return { line, column: offset - before.lastIndexOf("\n") };
}

/* A selector for the elements that a keyboard can reach by default. */
export const TABBABLE =
  'a[href], button, input:not([type=hidden]), select, textarea, summary, [tabindex], [contenteditable=true], audio[controls], video[controls]';

/* jsx-a11y with rule options. The shared wrapper cannot pass options, and
   WO-10c reads its word list from a parameter. */
import { ESLint } from "eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

export async function runJsxWithOptions(
  root: string,
  files: string[],
  ruleId: string,
  options: unknown,
): Promise<{ file: string; line: number; column: number; message: string }[]> {
  const targets = files.filter((f) => /\.(?:jsx|tsx)$/i.test(f));
  if (targets.length === 0) return [];
  const eslint = new ESLint({
    overrideConfigFile: true,
    cwd: root,
    overrideConfig: [
      {
        files: ["**/*.{jsx,tsx}"],
        languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
        plugins: { "jsx-a11y": jsxA11y as never },
        rules: { [`jsx-a11y/${ruleId}`]: ["error", options] as never },
      },
    ],
    ignore: false,
  });
  const out: { file: string; line: number; column: number; message: string }[] = [];
  for (const r of await eslint.lintFiles(targets)) {
    for (const m of r.messages) if (m.ruleId) out.push({ file: r.filePath, line: m.line, column: m.column, message: m.message });
  }
  return out;
}
