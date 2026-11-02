import type { Candidate, RenderedPage, RuleModule } from "../../types.ts";
import { VIEWPORT } from "../tx/util.ts";

/* CMP-10a: a corrected field clears its own error, and no other error. Each page
   of validationCases runs on a page of its own, because the rule types values
   and submits the form. A value goes in with an input event only, so that a
   check that waits for change or blur does not clear the error. */

interface Case {
  page: string;
  field: string;
  invalid: string;
  valid: string;
  error: string;
}

const SETTLE_MS = 100;

const asCases = (v: unknown): Case[] =>
  (Array.isArray(v) ? v : []).map((c: Record<string, unknown>) => ({
    page: String(c.page),
    field: String(c.field),
    invalid: String(c.invalid ?? ""),
    valid: String(c.valid ?? ""),
    error: String(c.error),
  }));

/* Sets the value of the field and fires an input event. It runs in the page. */
function enter(page: RenderedPage, field: string, value: string): Promise<boolean> {
  return page.evaluate(
    (arg: { field: string; value: string }) => {
      const el = document.querySelector(arg.field) as any;
      if (!el) return false;
      el.value = arg.value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    },
    { field, value },
  );
}

/* For each error selector, true when its message is shown. It runs in the page. */
function shown(page: RenderedPage, errors: string[], wait: number): Promise<boolean[]> {
  return page.evaluate(
    (arg: { errors: string[]; wait: number }) =>
      new Promise<boolean[]>((resolve) => {
        setTimeout(() => {
          resolve(
            arg.errors.map((sel) => {
              let list: any[] = [];
              try {
                list = Array.from(document.querySelectorAll(sel));
              } catch {
                /* an invalid selector matches nothing */
              }
              return list.some((el: any) => {
                const r = el.getBoundingClientRect();
                const s = getComputedStyle(el);
                return (
                  String(el.innerText ?? "").trim() !== "" &&
                  r.width > 0 &&
                  r.height > 0 &&
                  s.visibility !== "hidden" &&
                  s.display !== "none" &&
                  el.closest("[aria-hidden=true]") === null
                );
              });
            }),
          );
        }, arg.wait);
      }),
    { errors, wait },
  );
}

function position(page: RenderedPage, field: string): Promise<{ top: number; left: number }> {
  return page.evaluate((sel: string) => {
    const el = document.querySelector(sel) ?? document.querySelector("main") ?? document.body;
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), left: Math.round(r.left + window.scrollX) };
  }, field);
}

export const cmp10a: RuleModule = {
  code: "CMP-10a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    const cases = asCases(params.validationCases);
    for (const pagePath of [...new Set(cases.map((c) => c.page))]) {
      const list = cases.filter((c) => c.page === pagePath);
      const page = await rendered.open(pagePath, VIEWPORT, { fresh: true });
      const at = await Promise.all(list.map((c) => position(page, c.field)));
      const push = (i: number, message: string) => out.push({ file: pagePath, line: at[i].top, column: at[i].left, data: { message } });
      const entered: boolean[] = [];
      for (const c of list) entered.push(await enter(page, c.field, c.invalid));
      /* The submit control of the form of the first field, so that a search form in the header is not the one submitted. */
      const marked = await page.evaluate(
        (arg: { field: string; submit: string }) => {
          try {
            const form = (document.querySelector(arg.field) as any)?.form;
            const el = form?.querySelector(arg.submit) ?? document.querySelector(arg.submit);
            el?.setAttribute("data-dxl-submit", "");
            return Boolean(el);
          } catch {
            return false;
          }
        },
        { field: list[0].field, submit: String(params.submitSelector) },
      );
      if (marked) await page.click("[data-dxl-submit]").catch(() => undefined);
      const before = await shown(page, list.map((c) => c.error), SETTLE_MS);
      const open = new Set<number>();
      list.forEach((c, i) => {
        if (!entered[i]) push(i, `No element matches the field selector ${c.field}.`);
        else if (!before[i]) push(i, `The error ${c.error} does not show after "${c.invalid}" is submitted in ${c.field}, so the rule cannot test the correction.`);
        else open.add(i);
      });
      for (const i of [...open]) {
        /* A case whose error cleared early has its finding already. */
        if (!open.has(i)) continue;
        await enter(page, list[i].field, list[i].valid);
        open.delete(i);
        const now = await shown(page, list.map((c) => c.error), SETTLE_MS);
        if (now[i]) push(i, `The error ${list[i].error} stays after ${list[i].field} is corrected. Clear the error when the value becomes valid.`);
        for (const j of open) {
          if (!now[j]) push(j, `The error ${list[j].error} cleared when ${list[i].field} was corrected, before ${list[j].field} was. Clear each error only when its own field is valid.`);
        }
        for (const j of [...open]) if (!now[j]) open.delete(j);
      }
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};
