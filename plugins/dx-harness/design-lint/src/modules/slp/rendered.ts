import type { Candidate, RuleModule } from "../../types.ts";

/* CMP-13a, TYP-7a, and CNT-15a: the rendered rules of the SLP controls. A finding
   is at the top and the left of the element, on the page path. */

const VIEWPORT = { width: 1280, height: 800 };

const message = (c: Candidate) => (c.data as { message: string }).message;

/* CMP-13a. A card-styled element is a visible block with a border on all four
   sides or a shadow, a radius, and a background. */
export const cmp13a: RuleModule = {
  code: "CMP-13a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const hits = await page.evaluate((ignore: string) => {
        const isCard = (el: any) => {
          if (ignore && el.matches(ignore)) return false;
          if (!el.checkVisibility()) return false;
          const s = getComputedStyle(el);
          if (!["block", "flex", "grid", "flow-root", "list-item"].includes(s.display)) return false;
          const bordered = ["Top", "Right", "Bottom", "Left"].every(
            (side) => parseFloat((s as any)[`border${side}Width`]) > 0 && (s as any)[`border${side}Style`] !== "none",
          );
          const shadow = s.boxShadow !== "none";
          const radius = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"].some(
            (p) => parseFloat((s as any)[p]) > 0,
          );
          const background = s.backgroundImage !== "none" || !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(s.backgroundColor);
          return (bordered || shadow) && radius && background;
        };
        const found: { tag: string; outer: string; top: number; left: number }[] = [];
        const cards = ([...document.body.querySelectorAll("*")] as any[]).filter(isCard);
        for (const card of cards) {
          const outer = cards.find((c) => c !== card && c.contains(card));
          if (!outer) continue;
          const r = card.getBoundingClientRect();
          found.push({ tag: card.tagName.toLowerCase(), outer: outer.tagName.toLowerCase(), top: Math.round(r.top + window.scrollY), left: Math.round(r.left + window.scrollX) });
        }
        return found;
      }, String(params.ignoreSelector ?? ""));
      for (const h of hits) {
        out.push({
          file: pagePath,
          line: h.top,
          column: h.left,
          data: { message: `The card <${h.tag}> sits inside the card <${h.outer}>. Flatten the inner card, and group its content with spacing, a heading, and a divider.` },
        });
      }
    }
    return out;
  },

  decide: message,
};

/* TYP-7a. Sizes are compared to two decimal places, so a size that the browser
   rounds is one size. Text in a form control is not read: a button keeps the
   13.33px of the browser unless the product sets its font. */
export const typ7a: RuleModule = {
  code: "TYP-7a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const minRatio = Number(params.minRatio);
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const sizes = await page.evaluate((ignore: string) => {
        const first = new Map<number, { top: number; left: number }>();
        const walker = document.createTreeWalker(document.body, 4);
        let node: any;
        while ((node = walker.nextNode())) {
          const parent = node.parentElement;
          if (!parent || /^(script|style|noscript)$/i.test(parent.tagName) || !parent.checkVisibility()) continue;
          if (!(node.textContent || "").trim()) continue;
          if (ignore && parent.closest(ignore)) continue;
          const size = Math.round(parseFloat(getComputedStyle(parent).fontSize) * 100) / 100;
          if (!first.has(size)) {
            const r = parent.getBoundingClientRect();
            first.set(size, { top: Math.round(r.top + window.scrollY), left: Math.round(r.left + window.scrollX) });
          }
        }
        return [...first.entries()].map(([size, at]) => ({ size, ...at }));
      }, String(params.ignoreSelector ?? ""));
      sizes.sort((a, b) => a.size - b.size);
      for (let i = 1; i < sizes.length; i++) {
        const [small, large] = [sizes[i - 1], sizes[i]];
        const ratio = large.size / small.size;
        if (ratio < minRatio) {
          out.push({
            file: pagePath,
            line: large.top,
            column: large.left,
            data: { message: `The text sizes ${large.size}px and ${small.size}px differ by ${ratio.toFixed(3)}, less than ${minRatio}. Use sizes further apart, or one size for both.` },
          });
        }
      }
    }
    return out;
  },

  decide: message,
};

/* CNT-15a. Each text node is read on its own. A sentence ends at ".", "!", or "?". */
export const cnt15a: RuleModule = {
  code: "CNT-15a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const lower = (key: string) => ((params[key] as string[] | undefined) ?? []).map((w) => String(w).toLowerCase());
    const arg = {
      words: [...lower("buzzwords"), ...lower("aiVocabulary")],
      phrases: [...lower("filler"), ...lower("chatbot")],
      maxEmDashes: Number(params.maxEmDashes),
    };
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const hits = await page.evaluate((a: { words: string[]; phrases: string[]; maxEmDashes: number }) => {
        const found: { kind: string; text: string; top: number; left: number }[] = [];
        const walker = document.createTreeWalker(document.body, 4);
        let node: any;
        while ((node = walker.nextNode())) {
          const parent = node.parentElement;
          if (!parent || /^(script|style|noscript)$/i.test(parent.tagName) || !parent.checkVisibility()) continue;
          const text: string = node.textContent || "";
          const low = text.toLowerCase();
          const r = parent.getBoundingClientRect();
          const at = { top: Math.round(r.top + window.scrollY), left: Math.round(r.left + window.scrollX) };
          for (const m of low.match(/[a-z][a-z'-]*/g) || []) if (a.words.includes(m)) found.push({ kind: "word", text: m, ...at });
          for (const p of a.phrases) if (low.includes(p)) found.push({ kind: "phrase", text: p, ...at });
          for (const s of text.split(/(?<=[.!?])\s+/)) {
            if ((s.match(/—/g) || []).length > a.maxEmDashes) found.push({ kind: "dashes", text: s.trim().slice(0, 60), ...at });
          }
        }
        return found;
      }, arg);
      for (const h of hits) {
        const text =
          h.kind === "word"
            ? `The copy uses the buzzword "${h.text}". Say what the product does in plain words.`
            : h.kind === "phrase"
              ? `The copy uses the phrase "${h.text}". Remove it, or say the thing directly.`
              : `The sentence "${h.text}" has more than ${arg.maxEmDashes} em dash. Split it into separate sentences.`;
        out.push({ file: pagePath, line: h.top, column: h.left, data: { message: text } });
      }
    }
    return out;
  },

  decide: message,
};
