import type { Candidate, RuleModule } from "../../types.ts";
import { VIEWPORT, message } from "./util.ts";

/* WO-5b: moving content that runs longer than maxAutoSeconds has a control.
   The rule samples each page for maxAutoSeconds. It cannot set
   prefers-reduced-motion, so it reads the page as a visitor with no preference. */

interface Moving {
  what: string;
  top: number;
  left: number;
}

export const wo5b: RuleModule = {
  code: "WO-5b",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const seconds = Number(params.maxAutoSeconds);
    const names = (params.pauseControlNames as string[]).map((n) => n.toLowerCase());
    /* The pages are sampled together, so the wait is one maxAutoSeconds, not one for each page. */
    const pages = params.pages as string[];
    const results = await Promise.all(
      pages.map(async (pagePath) => {
        const page = await rendered.open(pagePath, VIEWPORT, { fresh: true });
        const found = await page.evaluate(
          (arg: { seconds: number; names: string[] }): Promise<{ moving: Moving[]; control: boolean }> =>
            new Promise((resolve) => {
              const moving: Moving[] = [];
              const spot = (el: any): { top: number; left: number } => {
                const r = el.getBoundingClientRect();
                return { top: Math.round(r.top + window.scrollY), left: Math.round(r.left + window.scrollX) };
              };
              const seen = new Set<any>();
              const note = (el: any, what: string) => {
                if (!el || seen.has(el)) return;
                seen.add(el);
                moving.push({ what, ...spot(el) });
              };
              const slide = "[aria-roledescription=carousel], [class*=carousel], [class*=slider], [class*=swiper], [data-carousel]";
              const observer = new window.MutationObserver((records: any[]) => {
                for (const r of records) {
                  const target = r.type === "characterData" ? r.target.parentElement : r.target;
                  if (!target || target.closest("head")) continue;
                  if (r.type === "attributes") {
                    if (target.closest(slide)) note(target.closest(slide), "A carousel changes slide by itself.");
                  } else note(target, "Text changes with no user input.");
                }
              });
              observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["hidden", "aria-hidden", "aria-current", "aria-selected", "class"] });
              for (const a of document.getAnimations()) {
                const t: any = a.effect && (a.effect as any).target;
                if (t && a.playState === "running" && (a.effect as any).getComputedTiming().iterations === Infinity) {
                  note(t, "An animation repeats with no end.");
                }
              }
              window.setTimeout(() => {
                observer.disconnect();
                const control = Array.from(document.querySelectorAll("button, [role=button], a[href], input[type=button]")).some((c: any) => {
                  const name = ((c.getAttribute("aria-label") ?? "") + " " + (c.textContent ?? "") + " " + (c.value ?? "")).toLowerCase();
                  return arg.names.some((n) => new RegExp(`\\b${n}\\b`).test(name));
                });
                resolve({ moving, control });
              }, arg.seconds * 1000);
            }),
          { seconds, names },
        );
        return { pagePath, ...found };
      }),
    );
    for (const r of results) {
      if (r.control) continue;
      for (const m of r.moving) out.push({ file: r.pagePath, line: m.top, column: m.left, data: { message: `${m.what} The page has no ${(params.pauseControlNames as string[]).join(", ")} control. Let users pause, stop, or hide it.` } });
    }
    return out;
  },
  decide: message,
};
