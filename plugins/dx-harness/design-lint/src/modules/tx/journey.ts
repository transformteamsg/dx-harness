import fs from "node:fs";
import { controls } from "../../forms.ts";
import { isHtml } from "../../files.ts";
import { elements, matches } from "../../html.ts";
import type { HtmlElement } from "../../html.ts";
import { fileForPath, readPages } from "../../project.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { combineRules } from "../../engines/combine.ts";
import { jsxRule } from "../../engines/jsx-a11y.ts";
import { perPage, strings } from "./util.ts";

/* The rules that read the steps of a flow: TX-3a, TX-4a, TX-5a, and TX-6a. The
   linter does not pass the flows of the config to a rule, so each rule reads the
   product value `flowPages`: the pages of the flow, from the first step to the
   payment page, in order. */

export const TX_JSX_IDS: Record<string, string[]> = {
  "TX-6a": ["autocomplete-valid"],
};

const pagesOf = (root: string, params: Record<string, unknown>) =>
  strings(params.flowPages)
    .map((p) => fileForPath(root, p))
    .filter((f): f is string => f !== null);

/* A finding for a whole page sits on the main element, or on the first element. */
function anchor(els: HtmlElement[]): { line: number; column: number } {
  const el = els.find((e) => e.tag === "main") ?? els[0];
  return { line: el?.line ?? 1, column: el?.column ?? 1 };
}

/* TX-3a: a step has no more than the set number of controls. A step is the form,
   or the element that matches stepSelector inside a form. A radio group counts
   as one control, because the user makes one choice. The selector is one
   compound selector or a comma list, with no combinator (see src/html.ts). */
export const tx3a: RuleModule = {
  code: "TX-3a",
  surface: "source",

  locate({ root, params }) {
    const out: Candidate[] = [];
    const stepSelector = String(params.stepSelector);
    for (const file of pagesOf(root, params)) {
      const els = elements(fs.readFileSync(file, "utf8"));
      const page = { file, els };
      const steps = new Map<number, Set<string>>();
      for (const c of controls(page)) {
        if (c.formIndex === -1) continue;
        /* The nearest step element inside the form, or the form itself. */
        let owner = c.formIndex;
        let at = c.el.parent;
        while (at !== null && at !== c.formIndex) {
          if (matches(els[at], stepSelector)) {
            owner = at;
            break;
          }
          at = els[at].parent;
        }
        const type = (c.el.attrs.type ?? "").toLowerCase();
        const key = type === "radio" && c.el.attrs.name ? `radio:${c.el.attrs.name}` : `control:${c.el.index}`;
        steps.set(owner, (steps.get(owner) ?? new Set()).add(key));
      }
      for (const [owner, keys] of steps) {
        out.push({ file, line: els[owner].line, column: els[owner].column, data: { count: keys.size } });
      }
    }
    return out;
  },

  decide(candidate, params) {
    const max = Number(params.maxControlsPerStep);
    const { count } = candidate.data as { count: number };
    return count > max ? `This step has ${count} controls, and the limit is ${max}. Split it into more steps.` : null;
  },
};

/* TX-4a: each step shows a progress indicator that has a text equivalent. The
   flow applies when it has minStepsForIndicator steps or more. */
export const tx4a: RuleModule = {
  code: "TX-4a",
  surface: "source",

  locate({ root, params }) {
    const out: Candidate[] = [];
    const files = pagesOf(root, params);
    if (files.length < Number(params.minStepsForIndicator)) return out;
    const selector = String(params.progressSelector);
    for (const file of files) {
      const els = elements(fs.readFileSync(file, "utf8"));
      const found = els.filter((e) => matches(e, selector));
      const named = found.some(
        (e) => e.text.trim() !== "" || (e.attrs["aria-label"] ?? "").trim() !== "" || (e.attrs["aria-labelledby"] ?? "").trim() !== "" || (e.attrs["aria-valuetext"] ?? "").trim() !== "",
      );
      out.push({ file, ...anchor(els), data: { found: found.length, named } });
    }
    return out;
  },

  decide(candidate) {
    const { found, named } = candidate.data as { found: number; named: boolean };
    if (found === 0) return "This step shows no progress indicator. Show the current step and the number of steps.";
    return named ? null : "The progress indicator has no visible text and no accessible name. Give it text that names the step.";
  },
};

/* TX-5a: each step of a long flow has a visible save-draft control. A control is
   a button or a link, and its name matches one of saveDraftPatterns as a
   case-insensitive substring. */
export const tx5a: RuleModule = {
  code: "TX-5a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const pages = strings(params.flowPages);
    if (pages.length < Number(params.minStepsForDraft)) return [];
    return perPage(rendered, pages, (page) =>
      page.evaluate(() => {
        const list = Array.from(document.querySelectorAll("button, a[href], input[type=button], input[type=submit], [role=button]")) as any[];
        return {
          controls: list.map((el: any) => {
            const name = String(el.getAttribute("aria-label") || el.innerText || el.value || el.getAttribute("title") || "")
              .replace(/\s+/g, " ")
              .trim();
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            return { name, visible: r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" };
          }),
        };
      }),
    );
  },

  decide(candidate, params) {
    const wanted = strings(params.saveDraftPatterns).map((p) => p.toLowerCase());
    const { controls: list } = candidate.data as { controls: { name: string; visible: boolean }[] };
    const hits = list.filter((c) => wanted.some((w) => c.name.toLowerCase().includes(w)));
    if (hits.length === 0) return "This step has no save-draft control. Add a button or a link such as \"Save draft\".";
    return hits.some((c) => c.visible) ? null : "The save-draft control is hidden at the default viewport. Make it visible.";
  },
};

/* TX-6a: a personal or payment field carries a valid autocomplete token. The
   plain HTML part checks the token against the WHATWG list, because axe runs
   only in a browser page and this rule reads source. The JSX part is
   jsx-a11y autocomplete-valid, which checks an invalid token and not a missing
   attribute. */
const FIELD_TOKENS = new Set([
  "name", "honorific-prefix", "given-name", "additional-name", "family-name", "honorific-suffix", "nickname",
  "username", "new-password", "current-password", "one-time-code", "organization-title", "organization",
  "street-address", "address-line1", "address-line2", "address-line3", "address-level4", "address-level3",
  "address-level2", "address-level1", "country", "country-name", "postal-code",
  "cc-name", "cc-given-name", "cc-additional-name", "cc-family-name", "cc-number", "cc-exp", "cc-exp-month",
  "cc-exp-year", "cc-csc", "cc-type", "transaction-currency", "transaction-amount", "language",
  "bday", "bday-day", "bday-month", "bday-year", "sex", "url", "photo",
]);
const CONTACT_TOKENS = new Set(["tel", "tel-country-code", "tel-national", "tel-area-code", "tel-local", "tel-local-prefix", "tel-local-suffix", "tel-extension", "email", "impp"]);
const CONTACT_HINTS = new Set(["home", "work", "mobile", "fax", "pager"]);

export function validAutocomplete(value: string): boolean {
  const tokens = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  if (tokens.length === 1 && (tokens[0] === "on" || tokens[0] === "off")) return true;
  let i = 0;
  while (i < tokens.length && tokens[i].startsWith("section-")) i++;
  if (tokens[i] === "shipping" || tokens[i] === "billing") i++;
  let hint = false;
  if (CONTACT_HINTS.has(tokens[i])) {
    hint = true;
    i++;
  }
  const field = tokens[i];
  if (field === undefined) return false;
  if (!(CONTACT_TOKENS.has(field) || (!hint && FIELD_TOKENS.has(field)))) return false;
  i++;
  if (tokens[i] === "webauthn") i++;
  return i === tokens.length;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const tx6aHtml: RuleModule = {
  code: "TX-6a",
  surface: "source",

  locate({ root, params }) {
    const keys = Object.entries(params.autocompleteFields as Record<string, string>);
    const out: Candidate[] = [];
    const files = pagesOf(root, params).filter(isHtml);
    for (const page of readPages(files)) {
      for (const c of controls(page)) {
        const hay = [c.el.attrs.type, c.el.attrs.name, c.el.attrs.id].filter(Boolean).map((s) => norm(String(s)));
        const hit = keys.find(([key]) => hay.includes(norm(key)));
        if (!hit) continue;
        const value = c.el.attrs.autocomplete;
        out.push({
          file: page.file,
          line: c.el.line,
          column: c.el.column,
          data: { key: hit[0], expected: hit[1], value: value ?? null, payment: hit[0].toLowerCase().startsWith("cc-") },
        });
      }
    }
    return out;
  },

  decide(candidate) {
    const { key, expected, value, payment } = candidate.data as { key: string; expected: string; value: string | null; payment: boolean };
    if (value === null) return `The ${key} field has no autocomplete attribute. Add autocomplete="${expected}".`;
    if (!validAutocomplete(value)) return `autocomplete="${value}" is not a valid token for the ${key} field. Use "${expected}".`;
    if (payment && value.trim().toLowerCase() === "off") return `autocomplete="off" on the payment field ${key} blocks pre-fill. Use "${expected}".`;
    return null;
  },
};

export const tx6a = combineRules("TX-6a", [tx6aHtml, jsxRule("TX-6a", TX_JSX_IDS["TX-6a"])]);
