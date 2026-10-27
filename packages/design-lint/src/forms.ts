import { closest } from "./html.ts";
import type { HtmlElement } from "./html.ts";
import type { Page } from "./project.ts";

export interface Control {
  el: HtmlElement;
  /* The visible text of its label, or null when it has none. */
  label: string | null;
  required: boolean;
  formIndex: number;
}

const SKIP_TYPES = new Set(["hidden", "submit", "button", "reset", "image"]);

export function controls(page: Page): Control[] {
  const out: Control[] = [];
  for (const el of page.els) {
    const isField = el.tag === "select" || el.tag === "textarea" || (el.tag === "input" && !SKIP_TYPES.has((el.attrs.type ?? "text").toLowerCase()));
    if (!isField) continue;
    const byFor = el.attrs.id ? page.els.find((l) => l.tag === "label" && l.attrs.for === el.attrs.id) : undefined;
    const label = byFor ?? closest(page.els, el, "label");
    out.push({
      el,
      label: label ? label.text.replace(/\s+/g, " ").trim() : null,
      required: "required" in el.attrs || el.attrs["aria-required"] === "true",
      formIndex: closest(page.els, el, "form")?.index ?? -1,
    });
  }
  return out;
}

/* A login form that asks only for an identifier and a password. */
export function isLoginForm(group: Control[]): boolean {
  const password = group.some((c) => (c.el.attrs.type ?? "").toLowerCase() === "password");
  const identifier = group.some((c) => /^(username|email)$/i.test(c.el.attrs.autocomplete ?? ""));
  return password && identifier && group.length <= 2;
}

export function byForm(list: Control[]): Map<number, Control[]> {
  const groups = new Map<number, Control[]>();
  for (const c of list) groups.set(c.formIndex, [...(groups.get(c.formIndex) ?? []), c]);
  return groups;
}
