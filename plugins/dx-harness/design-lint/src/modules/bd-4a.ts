import { fleschKincaid, wordCount } from "../readability.ts";
import { atElement } from "../rendered.ts";
import type { Candidate, ElementRef, RuleModule } from "../types.ts";

/* BD-4a: the readability grade of each text block is at or below the limit. The
   formula is for English, so another locale is not configured. It finds
   candidates and does not decide. */

const VIEWPORT = { width: 1280, height: 800 };
const MIN_WORDS = 20;

export const bd4a: RuleModule = {
  code: "BD-4a",
  surface: "rendered",

  unconfigured: (params) => (/^en/i.test(String(params.locale)) ? [] : ["locale"]),

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const blocks = await page.evaluate(
        (arg: { content: string; skip: string }) =>
          Array.from(document.querySelectorAll(arg.content))
            .filter((el: any) => el.checkVisibility() && !(arg.skip && el.closest(arg.skip)))
            .map((el: any) => {
              return { text: (el.innerText || "").trim(), element: window.__designLint.element(el) as ElementRef };
            }),
        { content: String(params.contentSelector), skip: String(params.exemptSelector) },
      );
      for (const b of blocks) {
        if (wordCount(b.text) < MIN_WORDS) continue;
        out.push(atElement(pagePath, b.element, { grade: fleschKincaid(b.text), max: params.maxGrade }));
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
