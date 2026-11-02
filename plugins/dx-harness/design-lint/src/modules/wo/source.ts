import fs from "node:fs";
import { combineRules } from "../../engines/combine.ts";
import { jsxRule } from "../../engines/jsx-a11y.ts";
import { isHtml } from "../../files.ts";
import { elements } from "../../html.ts";
import type { HtmlElement } from "../../html.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { message, runJsxWithOptions } from "./util.ts";

/* The source rules of WO that wrap jsx-a11y rules. Each is a plain HTML part
   and a jsx-a11y part, so that it works on an HTML project and on a React one.
   test/wo-axe.test.ts checks the jsx-a11y ids.

   WR-1d already reports a non-native element with a handler and no role, no
   tabindex, or no key handler. The HTML parts of WO-1a and WO-1b leave those
   elements to it and cover what it skips: an <a> with no href, and an element
   with an interactive role and no handler. */

export const WO_JSX_IDS: Record<string, string[]> = {
  "WO-1a": ["click-events-have-key-events", "no-static-element-interactions"],
  "WO-1b": ["interactive-supports-focus"],
  "WO-5a": ["no-distracting-elements"],
  "WO-10b": ["anchor-has-content"],
  "WO-10c": ["anchor-ambiguous-text"],
};

const POINTER = /^on(click|dblclick|mousedown|mouseup|pointerdown|pointerup)$/;
const KEY = ["onkeydown", "onkeyup", "onkeypress"];
const INTERACTIVE_ROLES = new Set([
  "button", "link", "checkbox", "radio", "switch", "tab", "menuitem", "menuitemcheckbox", "menuitemradio",
  "option", "textbox", "combobox", "slider", "spinbutton", "searchbox", "treeitem", "gridcell",
]);
/* The elements that WR-1d skips as natively interactive. */
const WR_NATIVE = new Set(["a", "button", "input", "select", "textarea", "summary", "option", "label"]);

function htmlRule(code: string, find: (els: HtmlElement[]) => { el: HtmlElement; message: string }[]): RuleModule {
  return {
    code,
    surface: "source",
    locate({ files }) {
      const out: Candidate[] = [];
      for (const file of files.filter(isHtml)) {
        for (const f of find(elements(fs.readFileSync(file, "utf8")))) {
          out.push({ file, line: f.el.line, column: f.el.column, data: { message: f.message } });
        }
      }
      return out;
    },
    decide: message,
  };
}

const noHref = (el: HtmlElement) => el.tag === "a" && !("href" in el.attrs);

const wo1aHtml = htmlRule("WO-1a", (els) =>
  els.filter(noHref).flatMap((el) => {
    const handlers = Object.keys(el.attrs).filter((a) => POINTER.test(a));
    if (handlers.length === 0) return [];
    if (!("role" in el.attrs)) return [{ el, message: 'An <a> element with no href has a pointer handler and no role. Use a <button>, or add href.' }];
    if ("onclick" in el.attrs && !KEY.some((k) => k in el.attrs)) {
      return [{ el, message: "The element handles a click and has no key handler. Use a <button>, or add onkeydown." }];
    }
    return [];
  }),
);

const wo1bHtml = htmlRule("WO-1b", (els) =>
  els.flatMap((el) => {
    const role = el.attrs.role?.toLowerCase();
    if (!role || !INTERACTIVE_ROLES.has(role) || "tabindex" in el.attrs) return [];
    if (el.tag !== "a" && WR_NATIVE.has(el.tag)) return [];
    if (el.tag !== "a" && Object.keys(el.attrs).some((a) => /^on(click|keydown|keyup|keypress|mousedown|mouseup|pointerdown|pointerup)$/.test(a))) return [];
    if (el.tag === "a" && "href" in el.attrs) return [];
    return [{ el, message: `The <${el.tag}> element has role="${role}" and cannot take focus. Use a native control, or add tabindex="0".` }];
  }),
);

export const wo1a = combineRules("WO-1a", [wo1aHtml, jsxRule("WO-1a", WO_JSX_IDS["WO-1a"])]);
export const wo1b = combineRules("WO-1b", [wo1bHtml, jsxRule("WO-1b", WO_JSX_IDS["WO-1b"])]);

const wo5aHtml = htmlRule("WO-5a", (els) =>
  els.filter((e) => e.tag === "marquee" || e.tag === "blink").map((el) => ({ el, message: `The <${el.tag}> element moves or blinks with no control. Use content that the user can pause.` })),
);
export const wo5a = combineRules("WO-5a", [wo5aHtml, jsxRule("WO-5a", WO_JSX_IDS["WO-5a"])]);

/* An anchor is empty when it has no child element, no text, and no label. */
const wo10bHtml = htmlRule("WO-10b", (els) =>
  els
    .filter((a) => a.tag === "a")
    .filter(
      (a) =>
        a.text.trim() === "" &&
        !els.some((e) => e.parent === a.index) &&
        !a.attrs["aria-label"]?.trim() &&
        !a.attrs["aria-labelledby"]?.trim(),
    )
    .map((el) => ({ el, message: "The <a> element has no content. Put the link text inside it." })),
);
export const wo10b = combineRules("WO-10b", [wo10bHtml, jsxRule("WO-10b", WO_JSX_IDS["WO-10b"])]);

const normalise = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

const wo10cHtml: RuleModule = {
  code: "WO-10c",
  surface: "source",
  locate({ files, params }) {
    const words = new Set((params.vagueLinkWords as string[]).map(normalise));
    const out: Candidate[] = [];
    for (const file of files.filter(isHtml)) {
      for (const el of elements(fs.readFileSync(file, "utf8"))) {
        if (el.tag !== "a") continue;
        const text = normalise(el.text);
        if (text !== "" && words.has(text)) {
          out.push({ file, line: el.line, column: el.column, data: { message: `The link text "${el.text.trim()}" is vague. Write text that makes sense on its own.` } });
        }
      }
    }
    return out;
  },
  decide: message,
};

/* The word list reaches the jsx-a11y rule as its "words" option. */
const wo10cJsx: RuleModule = {
  code: "WO-10c",
  surface: "source",
  async locate({ files, root, params }) {
    const found = await runJsxWithOptions(root, files, "anchor-ambiguous-text", { words: params.vagueLinkWords });
    return found.map((m) => ({ file: m.file, line: m.line, column: m.column, data: { message: `${m.message} (jsx-a11y anchor-ambiguous-text)` } }));
  },
  decide: message,
};
export const wo10c = combineRules("WO-10c", [wo10cHtml, wo10cJsx]);
