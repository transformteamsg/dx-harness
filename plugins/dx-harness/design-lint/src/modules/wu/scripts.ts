import fs from "node:fs";
import { isHtml } from "../../files.ts";
import { elements, matches } from "../../html.ts";
import { fileForPath } from "../../project.ts";
import { combineRules } from "../../engines/combine.ts";
import { jsxRule } from "../../engines/jsx-a11y.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { contextChanges, controlMatches, eventName, handlerSites, isScriptFile, jsxTags, parseScript, preventsDefault } from "./scan.ts";

/* The source rules of WU that read scripts and form markup: WU-5a, WU-6a,
   WU-14b, and WU-14d. They work on HTML, JSX, and TSX through ./scan.ts. */

const strings = (v: unknown) => (v as string[]).map(String);

/* WU-5a: a focus handler does not submit, open a window, navigate, or move focus. */
export const wu5a: RuleModule = {
  code: "WU-5a",
  surface: "source",

  locate({ files, params }) {
    const events = new Set(strings(params.focusHandlers).map(eventName));
    const calls = strings(params.contextChangeCalls);
    const out: Candidate[] = [];
    for (const s of handlerSites(files)) {
      if (!events.has(s.event) || !s.body) continue;
      const hit = contextChanges(s.body, calls)[0];
      if (hit) out.push({ file: s.file, line: s.line, column: s.column, data: { call: hit.getText(s.body.sf).split("(")[0].replace(/\s*=.*/s, "").trim(), event: s.event } });
    }
    return out;
  },

  decide(candidate) {
    const { call, event } = candidate.data as { call: string; event: string };
    return `The ${event} handler calls ${call}, which changes the context when the control gets focus. Run the action on a button press instead.`;
  },
};

/* WU-6a: an input handler does not change the context unless the form has a
   confirm control. A handler counts only when it sits on a control that
   inputControls matches: an on* attribute, or a JSX prop. */
export const wu6a: RuleModule = {
  code: "WU-6a",
  surface: "source",

  locate({ files, params }) {
    const events = new Set(strings(params.inputHandlers).map(eventName));
    const controls = strings(params.inputControls);
    const calls = strings(params.contextChangeCalls);
    const out: Candidate[] = [];
    for (const s of handlerSites(files)) {
      if (!events.has(s.event) || !s.body || !s.control) continue;
      if (!controlMatches(s.control, controls, matches)) continue;
      if (s.control.formHasSubmit) continue;
      const hit = contextChanges(s.body, calls)[0];
      if (hit) out.push({ file: s.file, line: s.line, column: s.column, data: { tag: s.control.tag, call: hit.getText(s.body.sf).split("(")[0].replace(/\s*=.*/s, "").trim(), inForm: s.control.inForm } });
    }
    return out;
  },

  decide(candidate) {
    const { tag, call, inForm } = candidate.data as { tag: string; call: string; inForm: boolean };
    return `A change to the <${tag}> control calls ${call}, and ${inForm ? "its form has no submit button" : "it is not in a form with a submit button"}. Add a button that confirms the action.`;
  },
};

/* WU-14b: password and code fields accept paste and carry an autofill hint. */

/* The autofill tokens of the HTML standard. jsx-a11y autocomplete-valid reports a
   value outside this set, so the custom part leaves that case to it on JSX. */
const AUTOFILL = new Set(
  ("name honorific-prefix given-name additional-name family-name honorific-suffix nickname username new-password current-password one-time-code organization-title organization street-address address-line1 address-line2 address-line3 address-level4 address-level3 address-level2 address-level1 country country-name postal-code cc-name cc-given-name cc-additional-name cc-family-name cc-number cc-exp cc-exp-month cc-exp-year cc-csc cc-type transaction-currency transaction-amount language bday bday-day bday-month bday-year sex url photo tel tel-country-code tel-national tel-area-code tel-local tel-local-prefix tel-local-suffix tel-extension email impp on off shipping billing home work mobile fax pager webauthn").split(" "),
);

const CODE_FIELD = /otp|one-?time|passcode|verif\w*-?code|security-?code|(^|[-_])pin($|[-_])/i;

interface FieldLike {
  tag: string;
  attrs: Record<string, string>;
}
const attr = (f: FieldLike, ...names: string[]) => {
  for (const n of names) if (n in f.attrs) return f.attrs[n];
  return undefined;
};
export function isCredentialField(f: FieldLike): boolean {
  if (f.tag !== "input") return false;
  const type = (attr(f, "type") ?? "text").toLowerCase();
  if (type === "password") return true;
  if (!["text", "tel", "number", "", "\0expression"].includes(type)) return false;
  const ac = (attr(f, "autocomplete", "autoComplete") ?? "").toLowerCase();
  return ac.split(/\s+/).includes("one-time-code") || CODE_FIELD.test(`${attr(f, "name") ?? ""} ${attr(f, "id") ?? ""}`);
}

const wu14bCustom: RuleModule = {
  code: "WU-14b",
  surface: "source",

  locate({ files, params }) {
    const paste = new Set(strings(params.blockedPasteHandlers).map(eventName));
    const allowed = strings(params.passwordAutocomplete).map((v) => v.toLowerCase());
    const out: Candidate[] = [];
    const checkAutocomplete = (file: string, f: FieldLike, line: number, column: number, jsx: boolean) => {
      const raw = attr(f, "autocomplete", "autoComplete");
      if (raw === "\0expression") return;
      const tokens = (raw ?? "").toLowerCase().split(/\s+/).filter(Boolean);
      if (raw !== undefined && jsx && tokens.some((t) => !AUTOFILL.has(t) && !t.startsWith("section-"))) return;
      if (!tokens.some((t) => allowed.includes(t))) {
        out.push({ file, line, column, data: { message: raw === undefined || tokens.length === 0 ? `The credential field has no autocomplete value. Set one of ${allowed.join(", ")}.` : `The autocomplete value "${raw}" is not one of ${allowed.join(", ")}.` } });
      }
    };
    for (const file of files) {
      if (isHtml(file)) {
        for (const el of elements(fs.readFileSync(file, "utf8"))) {
          if (isCredentialField(el)) checkAutocomplete(file, el, el.line, el.column, false);
        }
      } else if (isScriptFile(file)) {
        const sf = parseScript(fs.readFileSync(file, "utf8"), file);
        for (const t of jsxTags(sf)) if (isCredentialField(t)) checkAutocomplete(file, t, t.line, t.column, true);
      }
    }
    for (const s of handlerSites(files)) {
      if (!paste.has(s.event) || !s.control || !s.body || !isCredentialField(s.control)) continue;
      if (preventsDefault(s.body)) out.push({ file: s.file, line: s.line, column: s.column, data: { message: "The paste handler of this credential field calls preventDefault or returns false. Let users paste." } });
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};

export const wu14b = combineRules("WU-14b", [wu14bCustom, jsxRule("WU-14b", ["autocomplete-valid"])]);

/* WU-14d: the login page loads no known CAPTCHA. The paste and autocomplete
   conditions of the rule file are reported by WU-14b on the same field, so
   this module does not repeat them. */
export const wu14d: RuleModule = {
  code: "WU-14d",
  surface: "source",

  locate({ root, params }) {
    const patterns = strings(params.captchaPatterns).map((p) => p.toLowerCase());
    const out: Candidate[] = [];
    for (const page of strings(params.loginPages)) {
      const file = fileForPath(root, page);
      if (!file) {
        out.push({ file: root, line: 1, column: 1, data: { message: `The login page ${page} does not exist under the project root.` } });
        continue;
      }
      for (const el of elements(fs.readFileSync(file, "utf8"))) {
        const url = (el.tag === "script" || el.tag === "iframe" ? el.attrs.src : undefined)?.toLowerCase();
        const hit = url === undefined ? undefined : patterns.find((p) => url.includes(p));
        if (hit) out.push({ file, line: el.line, column: el.column, data: { message: `The login page loads a CAPTCHA (${hit}) from ${el.attrs.src}. A CAPTCHA is a cognitive test. Offer a login that needs none.` } });
      }
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};

