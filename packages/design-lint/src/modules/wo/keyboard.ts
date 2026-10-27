import type { Candidate, RenderedPage, RuleModule } from "../../types.ts";
import { VIEWPORT, message } from "./util.ts";

/* The rendered rules of WO that press Tab: WO-2a, WO-9c, WO-9e, and WO-13b. Each
   opens a page of its own with { fresh: true }, because pressing a key changes the page. */

export interface Stop {
  /* The index of the focused element among all elements of the page. */
  index: number;
  tag: string;
  /* Page coordinates, so that scrolling does not change them. */
  top: number;
  left: number;
  width: number;
  height: number;
}

/* The focused element, or null when focus is on the page itself, which is where
   Tab goes after the last element, on the way to the browser interface. */
function focused(page: RenderedPage): Promise<Stop | null> {
  return page.evaluate((): any => {
    const a = document.activeElement;
    if (!a || a === document.body || a === document.documentElement) return null;
    const r = a.getBoundingClientRect();
    return {
      index: Array.from(document.querySelectorAll("*")).indexOf(a),
      tag: a.tagName.toLowerCase(),
      top: Math.round(r.top + window.scrollY),
      left: Math.round(r.left + window.scrollX),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
  });
}

/* Presses Tab up to `limit` times. Stops when focus leaves the page elements,
   and when it returns to an element that it already visited, which a trap does. */
export async function tabSequence(page: RenderedPage, limit: number, onStop?: (stop: Stop) => Promise<void>): Promise<{ stops: Stop[]; left: boolean }> {
  const stops: Stop[] = [];
  for (let i = 0; i < limit; i++) {
    await page.press("Tab");
    const stop = await focused(page);
    if (!stop) return { stops, left: true };
    if (stops.some((s) => s.index === stop.index)) return { stops, left: false };
    stops.push(stop);
    if (onStop) await onStop(stop);
  }
  return { stops, left: false };
}

/* WO-2a: Tab leaves every component. A trap is the same element for three
   presses in a row, or a return to an element that was already focused before
   focus left the page. A component that traps and closes on Escape passes. */
export const wo2a: RuleModule = {
  code: "WO-2a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT, { fresh: true });
      const seen = new Map<number, Stop>();
      let run = 0;
      let last = -1;
      let trapped: Stop | null = null;
      for (let i = 0; i < Number(params.tabLimit) && !trapped; i++) {
        await page.press("Tab");
        const stop = await focused(page);
        if (!stop) break;
        run = stop.index === last ? run + 1 : 1;
        last = stop.index;
        /* Three presses on one element means two repeats after the first. */
        if (run >= 3 || (seen.has(stop.index) && run === 1)) trapped = stop;
        seen.set(stop.index, stop);
      }
      if (!trapped) continue;
      /* The members of the trap: where focus goes in the next presses. */
      const members = new Set<number>([trapped.index]);
      for (let i = 0; i < 6; i++) {
        await page.press("Tab");
        const stop = await focused(page);
        if (!stop) break;
        members.add(stop.index);
      }
      await page.press("Escape");
      let escaped = false;
      for (let i = 0; i < 4 && !escaped; i++) {
        await page.press("Tab");
        const after = await focused(page);
        if (after === null || !members.has(after.index)) escaped = true;
      }
      if (escaped) continue;
      out.push({ file: pagePath, line: trapped.top, column: trapped.left, data: { message: `Focus is trapped at a <${trapped.tag}>. Tab and Escape do not move it out. Let Tab leave the component.` } });
    }
    return out;
  },
  decide: message,
};

/* WO-9e: the tab sequence does not jump far up or to the left. A move to the
   left counts only when the next element is not below the current one, because
   a wrap to the next row of a layout goes left and down. */
export const wo9e: RuleModule = {
  code: "WO-9e",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const max = Number(params.maxJumpPixels);
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT, { fresh: true });
      const { stops } = await tabSequence(page, 500);
      for (let i = 1; i < stops.length; i++) {
        const a = stops[i - 1];
        const b = stops[i];
        const up = a.top - b.top;
        const left = a.left - b.left;
        const below = b.top >= a.top + a.height;
        if (up > max || (left > max && !below)) {
          out.push({ file: pagePath, line: b.top, column: b.left, data: { message: `Focus moves ${up > max ? `${up}px up` : `${left}px left`} from a <${a.tag}> to a <${b.tag}>. Check that the source order matches the visual order.` } });
        }
      }
    }
    return out;
  },
  decide: message,
};

/* WO-13b: a fixed or sticky element does not cover the focused element. */
export const wo13b: RuleModule = {
  code: "WO-13b",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const maxRatio = Number(params.maxObscuredRatio);
    for (const pagePath of params.pages as string[]) {
      for (const width of params.viewports as number[]) {
        const page = await rendered.open(pagePath, { width, height: VIEWPORT.height }, { fresh: true });
        const reported = new Set<number>();
        await tabSequence(page, 500, async (stop) => {
          const covered = await page.evaluate((): any => {
            const a = document.activeElement;
            const r = a.getBoundingClientRect();
            const area = r.width * r.height;
            if (area === 0) return null;
            let hidden = 0;
            for (const el of Array.from(document.querySelectorAll("body *")) as any[]) {
              const s = getComputedStyle(el);
              if ((s.position !== "fixed" && s.position !== "sticky") || s.display === "none" || s.visibility === "hidden") continue;
              if (el === a || el.contains(a)) continue;
              const o = el.getBoundingClientRect();
              const w = Math.min(r.right, o.right) - Math.max(r.left, o.left);
              const h = Math.min(r.bottom, o.bottom) - Math.max(r.top, o.top);
              if (w > 0 && h > 0) hidden += w * h;
            }
            return { ratio: Math.min(1, hidden / area) };
          });
          if (covered && covered.ratio > maxRatio && !reported.has(stop.index)) {
            reported.add(stop.index);
            out.push({
              file: pagePath,
              line: stop.top,
              column: stop.left,
              data: { message: `A fixed or sticky element covers ${Math.round(covered.ratio * 100)}% of the focused <${stop.tag}> at ${width}px wide. Keep focused elements in view, for example with scroll-padding.` },
            });
          }
        });
      }
    }
    return out;
  },
  decide: message,
};

/* WO-9c: focus moves into a modal and returns to its trigger. A trigger is an
   element whose aria-controls names a dialog. */
export const wo9c: RuleModule = {
  code: "WO-9c",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const selector = String(params.modalSelector);
    for (const pagePath of params.pages as string[]) {
      const probe = await rendered.open(pagePath, VIEWPORT);
      const triggers = await probe.evaluate((sel: string): string[] => {
        const found: string[] = [];
        document.querySelectorAll("[aria-controls]").forEach((t: any, i: number) => {
          const m = document.getElementById(t.getAttribute("aria-controls"));
          if (m && (m.matches(sel) || m.tagName === "DIALOG" || m.getAttribute("role") === "dialog" || m.getAttribute("aria-modal") === "true")) {
            found.push(String(i));
          }
        });
        return found;
      }, selector);
      for (const id of triggers) {
        const page = await rendered.open(pagePath, VIEWPORT, { fresh: true });
        const trigger = await page.evaluate((n: string): any => {
          const t: any = document.querySelectorAll("[aria-controls]")[Number(n)];
          const r = t.getBoundingClientRect();
          t.setAttribute("data-wo-trigger", n);
          return { top: Math.round(r.top + window.scrollY), left: Math.round(r.left + window.scrollX) };
        }, id);
        await page.focus(`[data-wo-trigger="${id}"]`);
        await page.press("Enter");
        const state = () =>
          page.evaluate((n: string): any => {
            const t: any = document.querySelector(`[data-wo-trigger="${n}"]`);
            const m: any = document.getElementById(t.getAttribute("aria-controls"));
            const a = document.activeElement;
            /* Focus on the page itself is focus that has gone to the browser interface, and a modal lets it. */
            return { inside: !!m && (m.contains(a) || a === document.body), onTrigger: a === t, open: !!m && (m.open === true || (!m.hidden && getComputedStyle(m).display !== "none")) };
          }, id);
        let problem: string | null = null;
        const opened = await state();
        if (!opened.inside) problem = "Focus is not inside the modal after it opens.";
        else {
          for (let i = 0; i < 12 && !problem; i++) {
            await page.press("Tab");
            if (!(await state()).inside) problem = "Tab moves focus outside the modal while it is open.";
          }
        }
        if (!problem) {
          await page.press("Escape");
          const closed = await state();
          let after = closed;
          if (closed.open) {
            /* Escape did not close it, so the close control does. */
            const found = await page.evaluate((n: string): boolean => {
              const t: any = document.querySelector(`[data-wo-trigger="${n}"]`);
              const m: any = document.getElementById(t.getAttribute("aria-controls"));
              const b = Array.from(m.querySelectorAll("button, [role=button]")).find((x: any) => /close|cancel|dismiss/i.test(x.textContent + (x.getAttribute("aria-label") ?? ""))) as any;
              if (b) b.setAttribute("data-wo-close", "1");
              return !!b;
            }, id);
            if (found) {
              await page.click("[data-wo-close]");
              after = await state();
            }
          }
          if (after.open) problem = "Neither Escape nor a close control closes the modal.";
          else if (!after.onTrigger) problem = "Focus does not return to the trigger when the modal closes.";
        }
        if (problem) out.push({ file: pagePath, line: trigger.top, column: trigger.left, data: { message: problem } });
      }
    }
    return out;
  },
  decide: message,
};
