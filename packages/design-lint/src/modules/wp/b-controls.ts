import type { Candidate, RuleModule } from "../../types.ts";

/* WP-17a and WP-12d: rendered checks that read computed styles and the tab order. */

const VIEWPORT = { width: 1280, height: 800 };

interface Issue {
  message: string;
  top: number;
  left: number;
}

/* WP-17a. The boundary of a control is its border or its fill, tested against the
   background around it. The check reads the computed style in the default state,
   the focus state, and, for a checkbox, radio button, or switch, the checked state.

   Decisions that the category README records:
   - A control whose edge has two parts, a border and a fill, passes when the
     stronger part meets the ratio.
   - A native checkbox, radio button, or range input that keeps its default
     appearance is drawn by the browser, and passes. The check reads a control
     that sets appearance: none.
   - When the adjacent background, or the control, has an image or a gradient,
     the ratio cannot be computed. The rule reports the control and does not pass
     it. */
export const wp17a: RuleModule = {
  code: "WP-17a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const arg = {
      min: Number(params.minRatio),
      input: String(params.inputSelector),
      button: String(params.buttonSelector),
      state: String(params.stateSelector),
    };
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT, { fresh: true });
      const issues = await page.evaluate(async (a: typeof arg): Promise<Issue[]> => {
        type Rgba = [number, number, number, number];
        const parse = (c: string): Rgba | null => {
          let m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(c.trim());
          if (m) {
            const alpha = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
            return [Number(m[1]), Number(m[2]), Number(m[3]), alpha];
          }
          m = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/.exec(c.trim());
          if (m) return [Number(m[1]) * 255, Number(m[2]) * 255, Number(m[3]) * 255, m[4] === undefined ? 1 : Number(m[4])];
          return null;
        };
        const over = (top: Rgba, under: [number, number, number]): [number, number, number] => [
          top[0] * top[3] + under[0] * (1 - top[3]),
          top[1] * top[3] + under[1] * (1 - top[3]),
          top[2] * top[3] + under[2] * (1 - top[3]),
        ];
        const lum = (c: [number, number, number]) => {
          const f = (v: number) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
        };
        const ratio = (x: [number, number, number], y: [number, number, number]) => {
          const [hi, lo] = [lum(x), lum(y)].sort((p, q) => q - p);
          return (hi + 0.05) / (lo + 0.05);
        };
        /* The colour behind an element: its ancestors composited on white. null when one holds an image. */
        const behind = (el: any): [number, number, number] | null => {
          const chain: any[] = [];
          for (let n = el.parentElement; n; n = n.parentElement) chain.push(n);
          let colour: [number, number, number] = [255, 255, 255];
          for (const n of chain.reverse()) {
            const cs = getComputedStyle(n);
            if (cs.backgroundImage !== "none") return null;
            const bg = parse(cs.backgroundColor);
            if (!bg) return null;
            if (bg[3] > 0) colour = over(bg, colour);
          }
          return colour;
        };
        const name = (el: any) => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : el.getAttribute("name") ? `[name=${el.getAttribute("name")}]` : "");
        /* The strongest edge of the element in its current state: a ratio, "none", or "unknown". */
        const edge = (el: any): number | "none" | "unknown" => {
          const cs = getComputedStyle(el);
          const bg = behind(el);
          if (!bg || cs.backgroundImage !== "none") return "unknown";
          let best = 0;
          let any = false;
          const sides = ["Top", "Right", "Bottom", "Left"] as const;
          for (const s of sides) {
            const w = parseFloat((cs as any)[`border${s}Width`]);
            const st = (cs as any)[`border${s}Style`];
            const col = parse((cs as any)[`border${s}Color`]);
            if (w > 0 && st !== "none" && st !== "hidden" && col && col[3] > 0) {
              any = true;
              best = Math.max(best, ratio(over(col, bg), bg));
            }
          }
          const fill = parse(cs.backgroundColor);
          if (fill && fill[3] > 0) {
            const r = ratio(over(fill, bg), bg);
            if (r > 1.001) {
              any = true;
              best = Math.max(best, r);
            }
          }
          const ow = parseFloat(cs.outlineWidth);
          const oc = parse(cs.outlineColor);
          if (el === document.activeElement && ow > 0 && cs.outlineStyle !== "none" && oc && oc[3] > 0) {
            any = true;
            best = Math.max(best, ratio(over(oc, bg), bg));
          }
          return any ? best : "none";
        };
        const issues: Issue[] = [];
        const seen = new Set<any>();
        const report = (el: any, message: string) => {
          const r = el.getBoundingClientRect();
          issues.push({ message, top: Math.round(r.top), left: Math.round(r.left) });
        };
        const visible = (el: any) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
        };
        const nativeDrawn = (el: any) => {
          const type = (el.getAttribute("type") ?? "").toLowerCase();
          return ["checkbox", "radio", "range"].includes(type) && getComputedStyle(el).appearance !== "none";
        };
        const test = (el: any, isInput: boolean) => {
          if (nativeDrawn(el)) return;
          const states: [string, () => void, () => void][] = [
            ["default", () => {}, () => {}],
            [
              "focus",
              () => {
                el.focus();
              },
              () => {
                el.blur();
              },
            ],
          ];
          if (el.matches(a.state)) {
            const aria = el.getAttribute("role") !== null && el.getAttribute("type") === null;
            const was = aria ? el.getAttribute("aria-checked") : el.checked;
            states.push([
              "checked",
              () => {
                if (aria) el.setAttribute("aria-checked", "true");
                else el.checked = true;
              },
              () => {
                if (aria) {
                  if (was === null) el.removeAttribute("aria-checked");
                  else el.setAttribute("aria-checked", was);
                } else el.checked = was;
              },
            ]);
          }
          for (const [state, enter, leave] of states) {
            enter();
            const e = edge(el);
            leave();
            const label = `${name(el)} in the ${state} state`;
            if (e === "unknown") {
              report(el, `The boundary of ${label} sits on an image or a gradient, or has a colour that the check cannot read. Its contrast is not measured, so the control does not pass.`);
              return;
            }
            if (e === "none") {
              if (isInput) report(el, `${label} has no border and no fill that differs from the background. Give it a border with a contrast ratio of ${a.min}:1 or more.`);
              /* A button with no edge is tested by the text contrast rule. */
              if (isInput) return;
              continue;
            }
            if (e < a.min) {
              report(el, `The boundary of ${label} has a contrast ratio of ${e.toFixed(2)}:1. It needs ${a.min}:1.`);
              return;
            }
          }
        };
        for (const el of Array.from(document.querySelectorAll(a.input)) as any[]) {
          if (!visible(el)) continue;
          seen.add(el);
          test(el, true);
        }
        for (const el of Array.from(document.querySelectorAll(a.button)) as any[]) {
          if (seen.has(el) || !visible(el)) continue;
          test(el, false);
        }
        return issues;
      }, arg);
      for (const i of issues) out.push({ file: pagePath, line: i.top, column: i.left, data: { message: i.message } });
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};

/* WP-12d. A page plays audio automatically when it has an audio or video element
   with autoplay that is not muted. The tab test presses Tab up to maxTabStops
   times on a page of its own. A focused element passes when its accessible name
   holds a word of audioControlNames, or when it is the autoplaying element with
   its native controls, because those hold the pause control. */
export const wp12d: RuleModule = {
  code: "WP-12d",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const words = (params.audioControlNames as string[]).map((w) => String(w).toLowerCase());
    const max = Number(params.maxTabStops);
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT, { fresh: true });
      const audio = await page.evaluate(() => {
        const el: any = Array.from(document.querySelectorAll("audio[autoplay], video[autoplay]")).find((m: any) => !m.muted && !m.hasAttribute("muted"));
        if (!el) return null;
        el.setAttribute("data-dxl-autoplay", "");
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top), left: Math.round(r.left) };
      });
      if (!audio) continue;
      let found = false;
      for (let i = 0; i < max && !found; i++) {
        await page.press("Tab");
        found = await page.evaluate((w: string[]) => {
          const el: any = document.activeElement;
          if (!el || el === document.body) return false;
          if (el.hasAttribute("data-dxl-autoplay") && el.hasAttribute("controls")) return true;
          const name = [el.getAttribute("aria-label"), el.innerText, el.getAttribute("title"), el.value, el.getAttribute("alt")].filter(Boolean).join(" ").toLowerCase();
          return w.some((word) => name.includes(word));
        }, words);
      }
      if (!found) out.push({ file: pagePath, line: audio.top, column: audio.left, data: { max, words } });
    }
    return out;
  },

  decide(candidate) {
    const d = candidate.data as { max: number; words: string[] };
    return `The page plays audio automatically, and none of the first ${d.max} tab stops is a control named ${d.words.join(", ")}. Place the audio control at the start of the page.`;
  },
};
