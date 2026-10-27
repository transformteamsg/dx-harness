import fs from "node:fs";
import path from "node:path";
import type { RuleModule } from "../../types.ts";

/* PR-6a: the project declares its supported browsers. The rule reads Browserslist
   queries from the listed sources and counts the browser families that the
   queries name. Without the browserslist data, a query that names no browser,
   such as "defaults" or "> 0.5%", cannot resolve to a family, so it counts for
   none. Name the browsers in the list. */

const FAMILY: Record<string, string> = {
  chrome: "chrome", and_chr: "chrome", chromium: "chrome",
  firefox: "firefox", ff: "firefox", and_ff: "firefox",
  safari: "safari", ios_saf: "safari", ios: "safari",
  edge: "edge", ie: "ie",
  opera: "opera", op_mob: "opera", op_mini: "opera",
  samsung: "samsung",
};

export function familiesOf(queries: string[]): Set<string> {
  const out = new Set<string>();
  for (const q of queries) {
    if (/^\s*not\s/i.test(q)) continue;
    for (const word of q.toLowerCase().split(/[^a-z_]+/)) if (FAMILY[word]) out.add(FAMILY[word]);
  }
  return out;
}

function queriesOf(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*/, "").trim())
    .filter(Boolean)
    .flatMap((l) => l.split(/,|\sor\s/i))
    .map((q) => q.trim())
    .filter(Boolean);
}

/* Returns null when the source declares no list. */
function read(file: string): string[] | null {
  const base = path.basename(file);
  if (base === "package.json") {
    const pkg = JSON.parse(fs.readFileSync(file, "utf8")) as { browserslist?: string[] | string | Record<string, string[]> };
    const list = pkg.browserslist;
    if (list === undefined) return null;
    if (typeof list === "string") return queriesOf(list);
    if (Array.isArray(list)) return list.flatMap((q) => queriesOf(q));
    return Object.values(list).flat().flatMap((q) => queriesOf(q));
  }
  return queriesOf(fs.readFileSync(file, "utf8"));
}

export const pr6a: RuleModule = {
  code: "PR-6a",
  surface: "project",
  locate({ root, params }) {
    const min = Number(params.minBrowsers);
    const sources = (params.browserSupportSource as string[]).map((s) => path.join(root, s)).filter((f) => fs.existsSync(f));
    let problem: string | null = null;
    let queries: string[] | null = null;
    for (const file of sources) {
      try {
        queries = read(file);
      } catch {
        queries = null;
      }
      if (queries) break;
    }
    if (!queries) problem = `No browser support list is declared. Add a browserslist to one of: ${(params.browserSupportSource as string[]).join(", ")}.`;
    else {
      const families = familiesOf(queries);
      if (families.size < min) {
        problem = `The browser support list names ${families.size} browser families (${[...families].join(", ") || "none"}) and the minimum is ${min}. Name each browser in the list.`;
      }
    }
    return [{ file: root, line: 1, column: 1, data: { problem } }];
  },
  decide(candidate) {
    return (candidate.data as { problem: string | null }).problem;
  },
};
