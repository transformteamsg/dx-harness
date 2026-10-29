import { matches } from "../../html.ts";
import type { HtmlElement } from "../../html.ts";
import { readPages } from "../../project.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { VIEWPORT, perPage, strings, unique } from "../tx/util.ts";

/* The action rules of CMP: CMP-2a, CMP-5a, and CMP-8a. */

const CONTROLS = "button, a[href], input[type=button], input[type=submit], [role=button]";
const BUTTONS = "button, input[type=button], input[type=submit], [role=button]";

/* CMP-2a: each visible destructive button asks for confirmation or offers undo.
   The rule clicks each button on a page of its own. window.confirm is replaced,
   so that a native confirmation is recorded and answers "cancel". */
export const cmp2a: RuleModule = {
  code: "CMP-2a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const patterns = strings(params.destructivePatterns).map((p) => p.toLowerCase());
    for (const pagePath of strings(params.pages)) {
      const first = await rendered.open(pagePath, VIEWPORT);
      const count = await first.evaluate(markDestructive, { selector: BUTTONS, patterns });
      for (let i = 0; i < count; i++) {
        const page = await rendered.open(pagePath, VIEWPORT, { fresh: true });
        const before = await page.evaluate(
          (arg: { selector: string; patterns: string[]; i: number }) => {
            (window as any).__dxlConfirmed = false;
            window.confirm = () => {
              (window as any).__dxlConfirmed = true;
              return false;
            };
            const list = Array.from(document.querySelectorAll(arg.selector)) as any[];
            const visible = list.filter((el: any) => {
              const r = el.getBoundingClientRect();
              const s = getComputedStyle(el);
              return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
            });
            const name = (el: any) =>
              String(el.getAttribute("aria-label") || el.innerText || el.value || "").replace(/\s+/g, " ").trim();
            const hits = visible.filter((el: any) => arg.patterns.some((p) => name(el).toLowerCase().includes(p)));
            const el = hits[arg.i];
            if (!el) return null;
            el.setAttribute("data-dxl-destructive", "");
            const r = el.getBoundingClientRect();
            return { href: window.location.href, name: name(el), top: Math.round(r.top + window.scrollY), left: Math.round(r.left + window.scrollX) };
          },
          { selector: BUTTONS, patterns, i },
        );
        if (!before) continue;
        await page.click("[data-dxl-destructive]");
        /* A click that goes to another page destroys the context of the evaluation. */
        const after = await page.evaluate(
          (arg: { confirmSelector: string; undo: string[]; controls: string }) =>
            new Promise((resolve) => {
              setTimeout(() => {
                const shown = (el: any) => {
                  const r = el.getBoundingClientRect();
                  const s = getComputedStyle(el);
                  return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
                };
                let dialog = false;
                try {
                  dialog = (Array.from(document.querySelectorAll(arg.confirmSelector)) as any[]).some(shown);
                } catch {
                  /* an invalid selector matches nothing */
                }
                const undo = (Array.from(document.querySelectorAll(arg.controls)) as any[]).some((el: any) => {
                  const name = String(el.getAttribute("aria-label") || el.innerText || el.value || "").toLowerCase();
                  return shown(el) && arg.undo.some((p) => name.includes(p));
                });
                resolve({ href: window.location.href, confirmed: (window as any).__dxlConfirmed === true, dialog, undo });
              }, 150);
            }) as Promise<{ href: string; confirmed: boolean; dialog: boolean; undo: boolean }>,
          { confirmSelector: String(params.confirmSelector), undo: strings(params.undoPatterns).map((p) => p.toLowerCase()), controls: CONTROLS },
        ).catch(() => ({ href: "", confirmed: false, dialog: false, undo: false }));
        out.push({
          file: pagePath,
          line: before.top,
          column: before.left,
          data: { name: before.name, navigated: after.href !== before.href, ...after },
        });
      }
    }
    return out;
  },

  decide(candidate) {
    const d = candidate.data as { name: string; navigated: boolean; confirmed: boolean; dialog: boolean; undo: boolean };
    if (d.navigated || d.confirmed || d.dialog || d.undo) return null;
    return `"${d.name}" runs a destructive action with no confirmation and no undo. Ask the user to confirm, or offer an undo after the action.`;
  },
};

/* The number of visible buttons whose name holds a destructive pattern. It runs in the page. */
function markDestructive(arg: { selector: string; patterns: string[] }): number {
  const list = Array.from(document.querySelectorAll(arg.selector)) as any[];
  return list.filter((el: any) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if (!(r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none")) return false;
    const name = String(el.getAttribute("aria-label") || el.innerText || el.value || "").toLowerCase();
    return arg.patterns.some((p) => name.includes(p));
  }).length;
}

const nameOf = (e: HtmlElement) => `${e.text} ${e.attrs["aria-label"] ?? ""} ${e.attrs.value ?? ""}`.replace(/\s+/g, " ").trim();

/* CMP-5a: a region holds one primary action at most, and no primary action is
   destructive. The region of a primary action is its nearest ancestor that
   matches regionSelector, or the page. */
export const cmp5a: RuleModule = {
  code: "CMP-5a",
  surface: "source",

  locate({ files, params }) {
    const out: Candidate[] = [];
    const primary = String(params.primarySelector);
    const region = String(params.regionSelector);
    const patterns = strings(params.destructivePatterns).map((p) => p.toLowerCase());
    for (const { file, els } of readPages(files)) {
      const groups = new Map<number, HtmlElement[]>();
      for (const e of els.filter((x) => matches(x, primary))) {
        let at = e.parent;
        while (at !== null && !matches(els[at], region)) at = els[at].parent;
        const key = at ?? -1;
        groups.set(key, [...(groups.get(key) ?? []), e]);
        const name = nameOf(e);
        if (patterns.some((p) => name.toLowerCase().includes(p))) {
          out.push({ file, line: e.line, column: e.column, data: { kind: "destructive", name } });
        }
      }
      for (const [key, list] of groups) {
        if (list.length < 2) continue;
        const at = key === -1 ? list[1] : els[key];
        out.push({ file, line: at.line, column: at.column, data: { kind: "many", count: list.length, names: list.map(nameOf) } });
      }
    }
    return out;
  },

  decide(candidate) {
    const d = candidate.data as { kind: string; name?: string; count?: number; names?: string[] };
    if (d.kind === "destructive") return `The primary action "${d.name}" is destructive. Make the safe action primary, and style the destructive one as secondary.`;
    return `This region has ${d.count} primary actions: ${d.names!.map((n) => `"${n}"`).join(", ")}. Keep one, and make the others secondary.`;
  },
};

/* CMP-8a: each page of each flow has a visible exit. An exit is a button or a
   link whose name holds one of exitPatterns. */
export const cmp8a: RuleModule = {
  code: "CMP-8a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const flows = (params.flows ?? {}) as Record<string, string[]>;
    return perPage(rendered, unique(...Object.values(flows)), (page) =>
      page.evaluate((selector: string) => {
        const list = Array.from(document.querySelectorAll(selector)) as any[];
        return {
          controls: list.map((el: any) => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            return {
              name: String(el.getAttribute("aria-label") || el.innerText || el.value || el.getAttribute("title") || "").replace(/\s+/g, " ").trim(),
              visible: r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none",
            };
          }),
        };
      }, CONTROLS),
    );
  },

  decide(candidate, params) {
    const wanted = strings(params.exitPatterns).map((p) => p.toLowerCase());
    const { controls } = candidate.data as { controls: { name: string; visible: boolean }[] };
    const hits = controls.filter((c) => wanted.some((w) => c.name.toLowerCase().includes(w)));
    if (hits.length === 0) return "This step has no exit. Add a visible button or link such as \"Cancel\" or \"Back\".";
    return hits.some((c) => c.visible) ? null : "The exit of this step is hidden at the default viewport. Make it visible.";
  },
};
