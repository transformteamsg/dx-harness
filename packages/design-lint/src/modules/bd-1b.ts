import type { Candidate, RuleModule } from "../types.ts";

/* BD-1b: no horizontal scroll at each viewport width. A rendered rule: it
   loads each page at each width and measures the document. */

const HEIGHT = 800;

interface Overflow {
  scrollWidth: number;
  clientWidth: number;
  widest: string;
  top: number;
  left: number;
}

export const bd1b: RuleModule = {
  code: "BD-1b",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      for (const width of params.viewports as number[]) {
        const page = await rendered.open(pagePath, { width, height: HEIGHT });
        const result = await page.evaluate((): Overflow | null => {
          const root = document.documentElement;
          if (root.scrollWidth <= root.clientWidth) return null;
          let widest: any = null;
          let right = 0;
          for (const el of Array.from(document.body.querySelectorAll("*")) as any[]) {
            const r = el.getBoundingClientRect();
            if (r.right > right) {
              right = r.right;
              widest = el;
            }
          }
          const box = widest ? widest.getBoundingClientRect() : { top: 0, left: 0 };
          const name = widest
            ? widest.tagName.toLowerCase() + (widest.className ? `.${String(widest.className).trim().split(/\s+/).join(".")}` : "")
            : "document";
          return {
            scrollWidth: root.scrollWidth,
            clientWidth: root.clientWidth,
            widest: name,
            top: Math.round(box.top),
            left: Math.round(box.left),
          };
        });
        if (result) {
          out.push({
            file: pagePath,
            line: result.top,
            column: result.left,
            data: { width, ...result },
          });
        }
      }
    }
    return out;
  },

  decide(candidate) {
    const d = candidate.data as { width: number } & Overflow;
    return `The page scrolls sideways at ${d.width}px: it is ${d.scrollWidth}px wide. The widest element is ${d.widest}.`;
  },
};
