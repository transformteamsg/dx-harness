import type { Candidate, RuleModule } from "../../types.ts";
import { VIEWPORT, message } from "./util.ts";

/* A11Y-5a: no animation runs when the user asks for reduced motion. A port of
   the reduced-motion evaluation of checks/rendered-check.py. Whether an
   animation is essential is a judgment, so the product names the essential ones
   and A11Y-5b judges the list. */

interface Issue {
  message: string;
  top: number;
  left: number;
}

export const a11y5a: RuleModule = {
  code: "A11Y-5a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const arg = { floor: Number(params.minDurationMs), essential: (params.essentialSelectors as string[]).join(",") };
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT, { reducedMotion: true });
      const issues = await page.evaluate(({ floor, essential }: { floor: number; essential: string }): Issue[] => {
        const found: Issue[] = [];
        const seen = new Set<any>();
        for (const animation of document.getAnimations() as any[]) {
          if (animation.playState !== "running") continue;
          const effect = animation.effect;
          const timing = effect?.getTiming ? effect.getTiming() : null;
          const duration = timing ? Number(timing.duration) || 0 : 0;
          if (duration < floor) continue;
          const el = effect?.target ?? document.documentElement;
          if (seen.has(el)) continue;
          seen.add(el);
          if (essential && el.closest?.(essential)) continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const style = getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden") continue;
          const looping = timing.iterations === Infinity ? "a looping " : "an ";
          found.push({
            message: `The <${el.tagName.toLowerCase()}> runs ${looping}animation of ${duration}ms under prefers-reduced-motion: reduce. Stop it in @media (prefers-reduced-motion: reduce), or name it in essentialSelectors.`,
            top: Math.round(r.top),
            left: Math.round(r.left),
          });
        }
        return found;
      }, arg);
      for (const i of issues) out.push({ file: pagePath, line: i.top, column: i.left, data: { message: i.message } });
    }
    return out;
  },
  decide: message,
};
