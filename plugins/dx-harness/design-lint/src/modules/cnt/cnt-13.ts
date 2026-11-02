import type { Candidate, RuleModule } from "../../types.ts";
import { visibleText, wordsPattern } from "./text.ts";

/* CNT-13a: copy uses British spelling and has no common misspellings. Each map
   pairs a wrong spelling with the right one. */

export const cnt13a: RuleModule = {
  code: "CNT-13a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const right: Record<string, string> = {};
    for (const [wrong, fix] of Object.entries({ ...(params.usToUk as object), ...(params.typos as object) })) {
      right[wrong.toLowerCase()] = String(fix);
    }
    const words = Object.keys(right);
    if (words.length === 0) return out;
    const pattern = wordsPattern(words);
    for (const b of await visibleText(rendered, params.pages as string[])) {
      for (const m of b.text.matchAll(pattern)) {
        out.push({ file: b.page, line: b.top, column: b.left, data: { word: m[0], right: right[m[0].toLowerCase()] } });
      }
    }
    return out;
  },

  decide(candidate) {
    const { word, right } = candidate.data as { word: string; right: string };
    return `Write "${right}", not "${word}".`;
  },
};
