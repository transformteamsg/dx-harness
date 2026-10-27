import fs from "node:fs";
import { rawColours } from "../css.ts";
import { isHtml } from "../files.ts";
import { elements } from "../html.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* BD-6b: values come from tokens, not raw values. This module ports the raw
   colour part of TOK-1 only. TOK-2, TOK-3, and COL-2 of token-audit.py are not
   ported yet. */

export const bd6b: RuleModule = {
  code: "BD-6b",
  surface: "source",

  locate({ files }) {
    const out: Candidate[] = [];
    const add = (file: string, line: number, column: number, value: string, property: string) =>
      out.push({ file, line, column, data: { value, property } });

    for (const file of files) {
      if (/\.css$/i.test(file)) {
        for (const c of rawColours(fs.readFileSync(file, "utf8"))) add(file, c.line, c.column, c.value, c.property);
      } else if (isHtml(file)) {
        for (const el of elements(fs.readFileSync(file, "utf8"))) {
          if (el.tag === "style") {
            for (const c of rawColours(el.text, el.contentLine, el.contentColumn)) add(file, c.line, c.column, c.value, c.property);
          }
          if (el.attrs.style) {
            for (const c of rawColours(el.attrs.style)) add(file, el.line, el.column, c.value, c.property);
          }
        }
      }
    }
    return out;
  },

  decide(candidate) {
    const { value, property } = candidate.data as { value: string; property: string };
    return `Raw colour ${value} in ${property}. Use a colour token, such as var(--color-text).`;
  },
};
