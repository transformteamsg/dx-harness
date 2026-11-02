import { atElement } from "../rendered.ts";
import type { Candidate, ElementRef, RuleModule } from "../types.ts";

/* BD-4b: words from the complex-word list are flagged. The list is a map from a
   complex word to a simpler one, or a plain list. */

const VIEWPORT = { width: 1280, height: 800 };

export const bd4b: RuleModule = {
  code: "BD-4b",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const list = params.complexWords;
    const simpler: Record<string, string> = Array.isArray(list) ? {} : (list as Record<string, string>);
    const words = (Array.isArray(list) ? (list as string[]) : Object.keys(simpler)).map((w) => w.toLowerCase());
    if (words.length === 0) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const hits = await page.evaluate((list: string[]) => {
        const found: { word: string; element: ElementRef }[] = [];
        const walker = document.createTreeWalker(document.body, 4);
        let node: any;
        while ((node = walker.nextNode())) {
          const parent = node.parentElement;
          if (!parent || /^(script|style|noscript)$/i.test(parent.tagName) || !parent.checkVisibility()) continue;
          for (const m of (node.textContent || "").toLowerCase().match(/[a-z']+/g) || []) {
            if (list.includes(m)) found.push({ word: m, element: window.__designLint.element(parent) });
          }
        }
        return found;
      }, words);
      for (const h of hits) out.push(atElement(pagePath, h.element, { word: h.word, simpler: simpler[h.word] }));
    }
    return out;
  },

  decide(candidate) {
    const { word, simpler } = candidate.data as { word: string; simpler?: string };
    return simpler ? `Use "${simpler}" instead of "${word}".` : `Use a simpler word than "${word}".`;
  },
};
