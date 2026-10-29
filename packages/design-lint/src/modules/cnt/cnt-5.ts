import type { Candidate, RuleModule } from "../../types.ts";
import { visibleText, wordsPattern } from "./text.ts";

/* CNT-5a: action words do not name the input device. Link text is left to WO-10c. */

export const cnt5a: RuleModule = {
  code: "CNT-5a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    const verbs = params.deviceVerbs as string[];
    if (!rendered || verbs.length === 0) return out;
    const pattern = wordsPattern(verbs);
    for (const b of await visibleText(rendered, params.pages as string[], { skipLinks: true })) {
      for (const m of b.text.matchAll(pattern)) out.push({ file: b.page, line: b.top, column: b.left, data: { word: m[0] } });
    }
    return out;
  },

  decide(candidate) {
    const { word } = candidate.data as { word: string };
    return `Name the action, not the device: replace "${word}" with a word such as "select" or "choose".`;
  },
};
