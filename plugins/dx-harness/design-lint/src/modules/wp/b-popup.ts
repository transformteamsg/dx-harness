import type { Candidate, RenderedPage, RenderedSession, RuleModule } from "../../types.ts";

/* WP-19a, WP-19b, and WP-19e: scripted tests of content that appears on hover or
   focus. Each test runs on a page of its own, because the tests press keys, move
   the pointer, and change focus.

   How the content is found. The test records which elements are visible, shows
   the content through the trigger, and records again. Content is an element that
   became visible, or a ::before or ::after of the trigger that came into view. A
   trigger that shows nothing has no popup, and is skipped: aria-describedby, for
   example, also points at hint text that is always on the page.

   The rules do not overlap:
   - WP-19a: Escape hides the content while the pointer is on the trigger, or
     while focus is on it.
   - WP-19b: the content stays when the pointer moves onto it, and stays for
     minVisibleMs while the pointer rests on the trigger.
   - WP-19e: after the pointer moves onto the content, the content stays for
     waitMs without action and Escape hides it. Content that focus shows stays for
     waitMs without action. WP-19e skips content that already hid when the pointer
     reached it, because WP-19b reports that. */

const VIEWPORT = { width: 1280, height: 800 };
const SETTLE_MS = 200;
const POLL_MS = 250;

/* The in-page library. It is injected as source, so it uses nothing from outside. */
function library() {
  const visible = (el: any, pseudo: string | null): boolean => {
    const cs = getComputedStyle(el, pseudo);
    if (pseudo) {
      if (cs.content === "none" || cs.content === "normal" || cs.content === '""') return false;
    }
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    let opacity = 1;
    for (let n = el; n; n = n.parentElement) opacity *= parseFloat(getComputedStyle(n).opacity);
    if (opacity < 0.05) return false;
    if (pseudo) return true;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && el.getClientRects().length > 0;
  };
  const all = () => Array.from(document.body.querySelectorAll("*")) as any[];
  (window as any).__dxl = {
    mark(selector: string): number {
      const list = Array.from(document.querySelectorAll(selector)) as any[];
      list.forEach((el, i) => el.setAttribute("data-dxl-trigger", String(i)));
      return list.length;
    },
    /* The visible elements, by position in the document, and the visible pseudo-elements of the triggers. */
    snap(): string[] {
      const out: string[] = [];
      all().forEach((el, i) => {
        if (visible(el, null)) out.push(String(i));
        if (el.hasAttribute("data-dxl-trigger")) {
          for (const p of ["::before", "::after"]) if (visible(el, p)) out.push(`${i}${p}`);
        }
      });
      return out;
    },
    /* The content that appeared since `before`: the top-most new elements, and new pseudo-elements. Each is marked. */
    appeared(before: string[]): { keys: string[]; pseudo: boolean; elements: number } {
      const had = new Set(before);
      const now = this.snap() as string[];
      const list = all();
      const fresh = now.filter((k) => !had.has(k));
      const keys: string[] = [];
      for (const k of fresh) {
        if (k.includes("::")) {
          keys.push(k);
          continue;
        }
        const el = list[Number(k)];
        const parentKey = el.parentElement ? String(list.indexOf(el.parentElement)) : "";
        if (fresh.includes(parentKey)) continue;
        keys.push(k);
        el.setAttribute("data-dxl-content", k);
      }
      return { keys, pseudo: keys.some((k) => k.includes("::")), elements: keys.filter((k) => !k.includes("::")).length };
    },
    /* True when every key is visible. */
    allVisible(keys: string[]): boolean {
      const list = all();
      return keys.every((k) => {
        if (k.includes("::")) {
          const [i, p] = k.split("::");
          return visible(list[Number(i)], `::${p}`);
        }
        return visible(list[Number(k)], null);
      });
    },
    anyVisible(keys: string[]): boolean {
      const list = all();
      return keys.some((k) => {
        if (k.includes("::")) {
          const [i, p] = k.split("::");
          return visible(list[Number(i)], `::${p}`);
        }
        return visible(list[Number(k)], null);
      });
    },
    /* A control in the content that hides it, such as a close button. */
    hasCloseControl(keys: string[]): boolean {
      const list = all();
      return keys.some((k) => !k.includes("::") && list[Number(k)].querySelector("button, [role=button]") !== null);
    },
    label(i: number): string {
      const el: any = document.querySelector(`[data-dxl-trigger="${i}"]`);
      return el.tagName.toLowerCase() + (el.id ? `#${el.id}` : el.getAttribute("data-tooltip") !== null ? "[data-tooltip]" : "");
    },
    position(i: number): { top: number; left: number } {
      const r = (document.querySelector(`[data-dxl-trigger="${i}"]`) as any).getBoundingClientRect();
      return { top: Math.round(r.top), left: Math.round(r.left) };
    },
  };
}
const LIBRARY = `(${String(library)})()`;

type Lib = {
  mark(selector: string): number;
  snap(): string[];
  appeared(before: string[]): { keys: string[]; pseudo: boolean; elements: number };
  allVisible(keys: string[]): boolean;
  anyVisible(keys: string[]): boolean;
  hasCloseControl(keys: string[]): boolean;
  label(i: number): string;
  position(i: number): { top: number; left: number };
};
declare global {
  interface Window {
    __dxl: Lib;
  }
}

const wait = (page: RenderedPage, ms: number) => page.evaluate((n: number) => new Promise<void>((resolve) => setTimeout(resolve, n)), ms);

async function open(rendered: RenderedSession, pagePath: string, selector: string): Promise<{ page: RenderedPage; before: string[] }> {
  const page = await rendered.open(pagePath, VIEWPORT, { fresh: true });
  await page.inject(LIBRARY);
  await page.evaluate((s: string) => window.__dxl.mark(s), selector);
  const before = await page.evaluate(() => window.__dxl.snap());
  return { page, before };
}

async function count(rendered: RenderedSession, pagePath: string, selector: string): Promise<number> {
  const page = await rendered.open(pagePath, VIEWPORT, { fresh: true });
  await page.inject(LIBRARY);
  return page.evaluate((s: string) => window.__dxl.mark(s), selector);
}

type Mode = "hover" | "focus";

/* Moves the pointer onto the content. When the content hides on the way, the
   browser cannot hover it, and that counts as the content hiding. */
async function hoverContent(page: RenderedPage): Promise<boolean> {
  /* The browser retries a hover on an element that is not visible for 30 seconds,
     so the test waits for 2 seconds and reads the page instead. */
  const done = page.hover("[data-dxl-content]").then(
    () => true,
    () => false,
  );
  const result = await Promise.race([done, wait(page, 2000).then(() => true)]);
  return result;
}

/* A page of its own, with content shown by the trigger. Null when the trigger shows nothing. */
async function show(rendered: RenderedSession, pagePath: string, selector: string, index: number, mode: Mode) {
  const { page, before } = await open(rendered, pagePath, selector);
  const trigger = `[data-dxl-trigger="${index}"]`;
  try {
    if (mode === "hover") await page.hover(trigger);
    else await page.focus(trigger);
  } catch {
    return null;
  }
  await wait(page, SETTLE_MS);
  const shown = await page.evaluate((b: string[]) => window.__dxl.appeared(b), before);
  if (shown.keys.length === 0) return null;
  return { page, trigger, shown };
}

/* One rule that loops over the pages and triggers, and collects problems. */
function popupRule(
  code: string,
  selectorParam: string,
  test: (rendered: RenderedSession, pagePath: string, selector: string, index: number, params: Record<string, unknown>) => Promise<string[]>,
): RuleModule {
  return {
    code,
    surface: "rendered",

    async locate({ rendered, params }) {
      const out: Candidate[] = [];
      if (!rendered) return out;
      const selector = String(params[selectorParam]);
      for (const pagePath of params.pages as string[]) {
        const n = await count(rendered, pagePath, selector);
        for (let i = 0; i < n; i++) {
          const problems = await test(rendered, pagePath, selector, i, params);
          if (problems.length === 0) continue;
          const where = await rendered.open(pagePath, VIEWPORT, { fresh: true });
          await where.inject(LIBRARY);
          const info = await where.evaluate(
            (a: { s: string; i: number }) => {
              window.__dxl.mark(a.s);
              return { label: window.__dxl.label(a.i), ...window.__dxl.position(a.i) };
            },
            { s: selector, i },
          ).catch(() => null);
          const lib = info ?? { label: `trigger ${i}`, top: 0, left: 0 };
          out.push({ file: pagePath, line: lib.top, column: lib.left, data: { message: `${lib.label}: ${problems.join(" ")}` } });
        }
      }
      return out;
    },

    decide(candidate) {
      return (candidate.data as { message: string }).message;
    },
  };
}

export const wp19a = popupRule("WP-19a", "popupTriggerSelector", async (rendered, pagePath, selector, index) => {
  const problems: string[] = [];
  for (const mode of ["hover", "focus"] as Mode[]) {
    const s = await show(rendered, pagePath, selector, index, mode);
    if (!s) continue;
    await s.page.press("Escape");
    await wait(s.page, SETTLE_MS);
    const stays = await s.page.evaluate((k: string[]) => window.__dxl.anyVisible(k) && !window.__dxl.hasCloseControl(k), s.shown.keys);
    if (stays) problems.push(`The content that ${mode} shows stays after Escape.`);
  }
  return problems;
});

export const wp19b = popupRule("WP-19b", "popupTriggerSelector", async (rendered, pagePath, selector, index, params) => {
  const problems: string[] = [];
  const minVisible = Number(params.minVisibleMs);
  const s = await show(rendered, pagePath, selector, index, "hover");
  if (s) {
    /* The content can be hovered when it is an element. Pseudo-element content cannot take a pointer of its own. */
    if (s.shown.elements > 0) {
      const target = await s.page.evaluate(() => (document.querySelector("[data-dxl-content]") ? true : false));
      if (target) {
        const reached = await hoverContent(s.page);
        await wait(s.page, SETTLE_MS);
        if (!reached || !(await s.page.evaluate((k: string[]) => window.__dxl.anyVisible(k), s.shown.keys))) problems.push("The content hides when the pointer moves onto it.");
      }
    }
  }
  const t = await show(rendered, pagePath, selector, index, "hover");
  if (t) {
    let waited = 0;
    while (waited < minVisible) {
      await wait(t.page, POLL_MS);
      waited += POLL_MS;
      if (!(await t.page.evaluate((k: string[]) => window.__dxl.anyVisible(k), t.shown.keys))) {
        problems.push(`The content hides after ${waited} ms while the pointer stays on the trigger. It must stay for ${minVisible} ms.`);
        break;
      }
    }
  }
  return problems;
});

export const wp19e = popupRule("WP-19e", "triggerSelector", async (rendered, pagePath, selector, index, params) => {
  const problems: string[] = [];
  const waitMs = Number(params.waitMs);
  const key = String(params.dismissKey);
  const h = await show(rendered, pagePath, selector, index, "hover");
  if (h && h.shown.elements > 0) {
    const reached = await hoverContent(h.page);
    await wait(h.page, SETTLE_MS);
    if (reached && (await h.page.evaluate((k: string[]) => window.__dxl.anyVisible(k), h.shown.keys))) {
      let waited = 0;
      let gone = false;
      while (waited < waitMs) {
        await wait(h.page, POLL_MS);
        waited += POLL_MS;
        if (!(await h.page.evaluate((k: string[]) => window.__dxl.anyVisible(k), h.shown.keys))) {
          gone = true;
          problems.push(`The content that hover shows disappears after ${waited} ms with the pointer on it and no user action.`);
          break;
        }
      }
      if (!gone) {
        await h.page.press(key);
        await wait(h.page, SETTLE_MS);
        if (await h.page.evaluate((k: string[]) => window.__dxl.anyVisible(k) && !window.__dxl.hasCloseControl(k), h.shown.keys)) {
          problems.push(`${key} does not hide the content while the pointer is on it.`);
        }
      }
    }
  }
  const f = await show(rendered, pagePath, selector, index, "focus");
  if (f) {
    let waited = 0;
    while (waited < waitMs) {
      await wait(f.page, POLL_MS);
      waited += POLL_MS;
      if (!(await f.page.evaluate((k: string[]) => window.__dxl.anyVisible(k), f.shown.keys))) {
        problems.push(`The content that focus shows disappears after ${waited} ms with no user action.`);
        break;
      }
    }
  }
  return problems;
});
