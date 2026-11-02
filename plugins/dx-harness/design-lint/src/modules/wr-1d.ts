import fs from "node:fs";
import { isHtml } from "../files.ts";
import { elements } from "../html.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* WR-1d: a custom interactive element has a role and is focusable. This module
   reads plain HTML, where the handler is an on* attribute. The JSX and TSX path,
   through eslint-plugin-jsx-a11y, is not built yet. */

const NATIVE = new Set(["a", "button", "input", "select", "textarea", "summary", "option", "label"]);
const INTERACTIVE_ROLES = new Set(["button", "link", "checkbox", "radio", "switch", "tab", "menuitem", "option", "textbox", "combobox", "slider", "spinbutton"]);

export const wr1d: RuleModule = {
  code: "WR-1d",
  surface: "source",

  locate({ files }) {
    const out: Candidate[] = [];
    for (const file of files.filter(isHtml)) {
      for (const el of elements(fs.readFileSync(file, "utf8"))) {
        if (NATIVE.has(el.tag)) continue;
        const handlers = Object.keys(el.attrs).filter((a) => /^on(click|keydown|keyup|keypress|mousedown|mouseup|pointerdown|pointerup)$/.test(a));
        if (handlers.length === 0) continue;
        const role = el.attrs.role?.toLowerCase();
        const problems: string[] = [];
        if (!role) problems.push("has no role");
        else if (INTERACTIVE_ROLES.has(role) && !("tabindex" in el.attrs)) problems.push("is not focusable");
        if (el.attrs.onclick !== undefined && !("onkeydown" in el.attrs || "onkeyup" in el.attrs || "onkeypress" in el.attrs) && problems.length === 0) {
          problems.push("handles a click with no key handler");
        }
        if (problems.length > 0) out.push({ file, line: el.line, column: el.column, data: { tag: el.tag, problems } });
      }
    }
    return out;
  },

  decide(candidate) {
    const { tag, problems } = candidate.data as { tag: string; problems: string[] };
    return `The <${tag}> element handles a user action and ${problems.join(" and ")}. Use a <button> or <a href>, or give it a role, tabindex="0", and a key handler.`;
  },
};
