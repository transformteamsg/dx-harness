import type { Candidate, RuleModule } from "../../types.ts";
import { visibleText } from "./text.ts";

/* CNT-12a: headings, labels, and buttons use sentence case. A proper noun from
   the list, an acronym, "I", and the first word of a sentence keep a capital. */

/* The first word that breaks sentence case, or null. */
export function titleCaseWord(text: string, properNouns: string[]): string | null {
  let rest = text;
  /* The longest name first, so that a name inside a longer name does not split it. */
  for (const name of [...properNouns].sort((a, b) => b.length - a.length)) rest = rest.split(name).join("x");
  for (const sentence of rest.split(/(?<=[.!?:])\s+/)) {
    const words = sentence.match(/[\p{L}][\p{L}'’-]*/gu) ?? [];
    for (const word of words.slice(1)) {
      if (/^\p{Lu}\p{Ll}/u.test(word) && !/^I['’]/.test(word)) return word;
    }
  }
  return null;
}

export const cnt12a: RuleModule = {
  code: "CNT-12a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const names = params.properNouns as string[];
    for (const b of await visibleText(rendered, params.pages as string[], { selector: params.labelSelector as string })) {
      const word = titleCaseWord(b.text, names);
      if (word) out.push({ file: b.page, line: b.top, column: b.left, data: { word, text: b.text } });
    }
    return out;
  },

  decide(candidate) {
    const { word, text } = candidate.data as { word: string; text: string };
    return `Use sentence case in "${text}": "${word}" is not the first word, an acronym, or a name in properNouns.`;
  },
};
