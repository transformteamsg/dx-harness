import type { Candidate, RenderedPage, RuleModule } from "../../types.ts";

/* WP-14a, WP-16a, and WP-18b: rendered checks on how the layout holds when the
   text grows, the spacing changes, or the window narrows. WP-14a and WP-18b share
   one measurement of lost content. Each takes the measurement before and after
   the change and reports only what the change causes, so a fault that the page
   already has at its normal size is left to the rules that own it. */

const HEIGHT = 800;

export interface Loss {
  key: string;
  kind: string;
  what: string;
  top: number;
  left: number;
}

/* Runs in the page. It is passed to the page as source, so it uses nothing from
   outside itself. */
function measureLoss(): Loss[] {
  const out: Loss[] = [];
  const all = Array.from(document.body.querySelectorAll("*")) as any[];
  const label = (el: any) => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : el.className && typeof el.className === "string" ? `.${el.className.trim().split(/\s+/).join(".")}` : "");
  const boxes: { el: any; i: number; rect: { left: number; right: number; top: number; bottom: number } }[] = [];
  all.forEach((el, i) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    const hasText = Array.from(el.childNodes).some((n: any) => n.nodeType === 3 && (n.nodeValue ?? "").trim() !== "");
    if (hasText) {
      const clipX = ["hidden", "clip"].includes(cs.overflowX);
      const clipY = ["hidden", "clip"].includes(cs.overflowY);
      if (cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) {
        out.push({ key: `${i}:truncated`, kind: "truncated", what: label(el), top: Math.round(r.top), left: Math.round(r.left) });
      } else if ((clipX && el.scrollWidth > el.clientWidth + 1) || (clipY && el.scrollHeight > el.clientHeight + 1)) {
        out.push({ key: `${i}:clipped`, kind: "clipped", what: label(el), top: Math.round(r.top), left: Math.round(r.left) });
      }
      /* The box of the text itself, from a range over the text nodes. */
      const range = document.createRange();
      range.selectNodeContents(el);
      const t = range.getBoundingClientRect();
      if (t.width > 0 && t.height > 0) boxes.push({ el, i, rect: { left: t.left, right: t.right, top: t.top, bottom: t.bottom } });
    }
    const control = el.matches("a[href], button, input:not([type=hidden]), select, textarea, [role=button]");
    if (control && (r.right > window.innerWidth + 1 || r.left < -1)) {
      out.push({ key: `${i}:outside`, kind: "outside", what: label(el), top: Math.round(r.top), left: Math.round(r.left) });
    }
  });
  /* Two text boxes overlap when they share a quarter of the smaller one. */
  for (let a = 0; a < boxes.length; a++) {
    for (let b = a + 1; b < boxes.length; b++) {
      const x = boxes[a];
      const y = boxes[b];
      if (x.el.contains(y.el) || y.el.contains(x.el)) continue;
      const w = Math.min(x.rect.right, y.rect.right) - Math.max(x.rect.left, y.rect.left);
      const h = Math.min(x.rect.bottom, y.rect.bottom) - Math.max(x.rect.top, y.rect.top);
      if (w <= 1 || h <= 1) continue;
      const small = Math.min((x.rect.right - x.rect.left) * (x.rect.bottom - x.rect.top), (y.rect.right - y.rect.left) * (y.rect.bottom - y.rect.top));
      if (w * h > small * 0.25) {
        out.push({ key: `${x.i}-${y.i}:overlap`, kind: "overlapped", what: `${label(x.el)} and ${label(y.el)}`, top: Math.round(x.rect.top), left: Math.round(x.rect.left) });
      }
    }
  }
  return out;
}

const MEASURE_SOURCE = String(measureLoss);

interface Change {
  /* Runs in the page, as source, before the second measurement. */
  apply: string;
}

/* Opens each page at each width on a page of its own, measures, applies the change, measures again, and keeps the new losses. */
async function lossAfter(
  rendered: NonNullable<Parameters<RuleModule["locate"]>[0]["rendered"]>,
  pagePath: string,
  width: number,
  change: Change,
): Promise<Loss[]> {
  const page: RenderedPage = await rendered.open(pagePath, { width, height: HEIGHT }, { fresh: true });
  return page.evaluate(
    async (a: { measure: string; apply: string }) => {
      const measure = new Function(`return ${a.measure}`)() as () => any[];
      const before = new Set(measure().map((l) => l.key));
      new Function(a.apply)();
      /* Let the layout settle. */
      await new Promise((resolve) => setTimeout(resolve, 100));
      return measure().filter((l) => !before.has(l.key));
    },
    { measure: MEASURE_SOURCE, apply: change.apply },
  ) as Promise<Loss[]>;
}

function lossRule(code: string, describe: string, change: (params: Record<string, unknown>) => Change, widths: (params: Record<string, unknown>) => number[]): RuleModule {
  return {
    code,
    surface: "rendered",

    async locate({ rendered, params }) {
      const out: Candidate[] = [];
      if (!rendered) return out;
      const c = change(params);
      for (const pagePath of params.pages as string[]) {
        for (const width of widths(params)) {
          for (const l of await lossAfter(rendered, pagePath, width, c)) {
            out.push({ file: pagePath, line: l.top, column: l.left, data: { ...l, width } });
          }
        }
      }
      return out;
    },

    decide(candidate) {
      const d = candidate.data as Loss & { width: number };
      return `${describe}, ${d.what} is ${d.kind} at ${d.width}px wide.`;
    },
  };
}

export const wp14a = lossRule(
  "WP-14a",
  "With the text scaled up",
  (p) => ({ apply: `document.documentElement.style.setProperty("font-size", "${Number(p.scalePercent)}%", "important")` }),
  (p) => p.viewports as number[],
);

export const wp18b = lossRule(
  "WP-18b",
  "With the text spacing adjusted",
  (p) => ({
    apply: `const s = document.createElement("style"); s.textContent = "* { line-height: ${Number(p.lineHeight)} !important; letter-spacing: ${Number(p.letterSpacing)}em !important; word-spacing: ${Number(p.wordSpacing)}em !important; } p { margin-bottom: ${Number(p.paragraphSpacing)}em !important; }"; document.head.appendChild(s);`,
  }),
  () => [1280],
);

/* WP-16a shares its measurement with BD-1b: the scroll width of the document at a
   narrow width. BD-1b has no exemption and reads three widths. This rule reads
   one width and skips the overflow that comes only from an element that matches
   twoDimensionalSelector. */
export const wp16a: RuleModule = {
  code: "WP-16a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const width = Number(params.reflowWidth);
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, { width, height: HEIGHT });
      const result = await page.evaluate((exempt: string) => {
        const root = document.documentElement;
        if (root.scrollWidth <= root.clientWidth) return null;
        let widest: any = null;
        let right = 0;
        for (const el of Array.from(document.body.querySelectorAll("*")) as any[]) {
          if (exempt !== "" && el.closest(exempt)) continue;
          const r = el.getBoundingClientRect();
          if (r.right > right) {
            right = r.right;
            widest = el;
          }
        }
        /* The overflow comes only from exempt content. */
        if (exempt !== "" && right <= root.clientWidth + 1) return null;
        const box = widest ? widest.getBoundingClientRect() : { top: 0, left: 0 };
        const name = widest ? widest.tagName.toLowerCase() + (widest.className && typeof widest.className === "string" ? `.${widest.className.trim().split(/\s+/).join(".")}` : "") : "document";
        return { scrollWidth: root.scrollWidth, widest: name, top: Math.round(box.top), left: Math.round(box.left) };
      }, String(params.twoDimensionalSelector));
      if (result) out.push({ file: pagePath, line: result.top, column: result.left, data: { width, ...result } });
    }
    return out;
  },

  decide(candidate) {
    const d = candidate.data as { width: number; scrollWidth: number; widest: string };
    return `The page does not reflow at ${d.width}px: it scrolls sideways and is ${d.scrollWidth}px wide. The widest element is ${d.widest}.`;
  },
};
