import { fleschKincaid, wordCount } from "../readability.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* BD-4a: the readability grade of each text block is at or below the limit. The
   formula is for English, so another locale is skipped. It finds candidates and
   does not decide. */

const VIEWPORT = { width: 1280, height: 800 };
const MIN_WORDS = 20;

export const bd4a: RuleModule = {
  code: "BD-4a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered || !/^en/i.test(String(params.locale))) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const blocks = await page.evaluate(
        (arg: { content: string; skip: string }) =>
          Array.from(document.querySelectorAll(arg.content))
            .filter((el: any) => el.checkVisibility() && !(arg.skip && el.closest(arg.skip)))
            .map((el: any) => {
              const r = el.getBoundingClientRect();
              return { text: (el.innerText || "").trim(), top: Math.round(r.top), left: Math.round(r.left) };
            }),
        { content: String(params.contentSelector), skip: String(params.exemptSelector) },
      );
      for (const b of blocks) {
        if (wordCount(b.text) < MIN_WORDS) continue;
        out.push({ file: pagePath, line: b.top, column: b.left, data: { grade: fleschKincaid(b.text), max: params.maxGrade } });
      }
    }
    return out;
  },

  decide(candidate) {
    const { grade, max } = candidate.data as { grade: number; max: number };
    if (grade <= max) return null;
    return `The reading grade is ${grade.toFixed(1)}, above ${max}. Use shorter sentences and simpler words.`;
  },
};
