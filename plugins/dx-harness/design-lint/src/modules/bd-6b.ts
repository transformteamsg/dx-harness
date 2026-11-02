import fs from "node:fs";
import { offScaleValues, paletteClasses, rawColours, themeColours } from "../css.ts";
import { isHtml } from "../files.ts";
import { elements } from "../html.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* BD-6b: values come from tokens, not raw values. This module ports TOK-1 (raw
   colours), TOK-2 (spacing), TOK-3 (radius), and COL-2 (palette classes) of
   token-audit.py. It scans .css files, <style> blocks, style attributes, and
   class attributes. The allow list and the waiver comments are not ported. */

type Value =
  | { kind: "colour"; value: string; property: string }
  | { kind: "spacing" | "radius"; value: string; property: string; nearest: number }
  | { kind: "palette"; value: string };

export const bd6b: RuleModule = {
  code: "BD-6b",
  surface: "source",

  locate({ files }) {
    const out: Candidate[] = [];
    const add = (file: string, line: number, column: number, data: Value) => out.push({ file, line, column, data });
    const scan = (file: string, css: string, line?: number, column?: number, at?: { line: number; column: number }) => {
      for (const c of rawColours(css, line, column)) add(file, at?.line ?? c.line, at?.column ?? c.column, { kind: "colour", value: c.value, property: c.property });
      for (const v of offScaleValues(css, line, column))
        add(file, at?.line ?? v.line, at?.column ?? v.column, { kind: v.kind, value: v.value, property: v.property, nearest: v.nearest });
    };

    const sources = files.map((file) => ({ file, text: fs.readFileSync(file, "utf8") }));
    /* A palette class that the theme of the project defines is a token. */
    const theme = new Set<string>();
    for (const { file, text } of sources) {
      if (/\.css$/i.test(file)) for (const name of themeColours(text)) theme.add(name);
      else if (isHtml(file)) for (const el of elements(text)) if (el.tag === "style") for (const name of themeColours(el.text)) theme.add(name);
    }

    for (const { file, text } of sources) {
      if (/\.css$/i.test(file)) {
        scan(file, text);
      } else if (isHtml(file)) {
        for (const el of elements(text)) {
          if (el.tag === "style") scan(file, el.text, el.contentLine, el.contentColumn);
          if (el.attrs.style) scan(file, el.attrs.style, 1, 1, el);
          if (el.attrs.class) for (const value of paletteClasses(el.attrs.class, theme)) add(file, el.line, el.column, { kind: "palette", value });
        }
      }
    }
    return out;
  },

  decide(candidate) {
    const found = candidate.data as Value;
    switch (found.kind) {
      case "colour":
        return `Raw colour ${found.value} in ${found.property}. Use a colour token, such as var(--color-text).`;
      case "spacing":
        return `Spacing ${found.value} in ${found.property} is not on the spacing scale. Use a spacing token, such as var(--space-4), or the nearest step, ${found.nearest}px.`;
      case "radius":
        return `Radius ${found.value} in ${found.property} is not on the radius scale. Use a radius token, such as var(--radius-md), or the nearest step, ${found.nearest}px.`;
      case "palette":
        return `Palette class ${found.value} names a raw colour. Use a semantic colour class, such as bg-primary or text-destructive.`;
    }
  },
};
