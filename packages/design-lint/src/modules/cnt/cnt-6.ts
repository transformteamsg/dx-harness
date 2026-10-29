import type { Candidate, RuleModule } from "../../types.ts";
import { visibleText, wordsPattern } from "./text.ts";

/* CNT-6a: copy has no empty openers and no filler words. An opener counts at the
   start of a sentence only. */

export const cnt6a: RuleModule = {
  code: "CNT-6a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const openers = params.openers as string[];
    const filler = params.fillerWords as string[];
    const opener = openers.length > 0 ? new RegExp(`^${wordsPattern(openers).source}`, "i") : null;
    const fill = filler.length > 0 ? wordsPattern(filler) : null;
    for (const b of await visibleText(rendered, params.pages as string[])) {
      for (const sentence of b.text.split(/(?<=[.!?])\s+/)) {
        const at = { file: b.page, line: b.top, column: b.left };
        const start = opener?.exec(sentence);
        if (start) out.push({ ...at, data: { kind: "opener", word: start[0] } });
        for (const m of fill ? sentence.matchAll(fill) : []) out.push({ ...at, data: { kind: "filler", word: m[0] } });
      }
    }
    return out;
  },

  decide(candidate) {
    const { kind, word } = candidate.data as { kind: string; word: string };
    return kind === "opener"
      ? `Start the sentence with its subject and verb, not the empty opener "${word}".`
      : `Remove the filler word "${word}".`;
  },
};
