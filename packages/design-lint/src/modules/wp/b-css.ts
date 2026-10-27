import fs from "node:fs";
import { isHtml } from "../../files.ts";

/* A small CSS reader for the source rules of WP-14, WP-18, and WP-19, and the
   token rules WP-13b and WP-17c. It reads a style sheet and the <style> blocks
   of an HTML file. It returns style rules with the position of each selector and
   declaration. It is not a full parser: it handles nested at-rules by reading
   their blocks as rules, and skips a block that it cannot read. */

export interface Declaration {
  property: string;
  value: string;
  important: boolean;
  line: number;
  column: number;
}

export interface StyleRule {
  selector: string;
  line: number;
  column: number;
  declarations: Declaration[];
}

export interface Sheet {
  file: string;
  rules: StyleRule[];
}

const isCss = (file: string) => /\.css$/i.test(file);

/* Where an offset in `text` sits, given the position of the first character. */
function locate(text: string, offset: number, baseLine: number, baseColumn: number) {
  const before = text.slice(0, offset).split("\n");
  const line = baseLine + before.length - 1;
  const column = before.length === 1 ? baseColumn + offset : before[before.length - 1].length + 1;
  return { line, column };
}

const blank = (s: string) => s.replace(/[^\n]/g, " ");

function readDeclarations(body: string, bodyOffset: number, text: string, baseLine: number, baseColumn: number): Declaration[] {
  const out: Declaration[] = [];
  let depth = 0;
  let start = 0;
  const flush = (end: number) => {
    const chunk = body.slice(start, end);
    const m = /^(\s*)([-\w]+)\s*:\s*([\s\S]*?)\s*$/.exec(chunk);
    if (m) {
      const important = /!\s*important\s*$/i.test(m[3]);
      const value = m[3].replace(/\s*!\s*important\s*$/i, "");
      const { line, column } = locate(text, bodyOffset + start + m[1].length, baseLine, baseColumn);
      out.push({ property: m[2].startsWith("--") ? m[2] : m[2].toLowerCase(), value, important, line, column });
    }
    start = end + 1;
  };
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === ";" && depth === 0) flush(i);
  }
  flush(body.length);
  return out;
}

export function readRules(text: string, baseLine = 1, baseColumn = 1): StyleRule[] {
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, blank);
  const out: StyleRule[] = [];
  const read = (from: number, to: number) => {
    let i = from;
    while (i < to) {
      const open = clean.indexOf("{", i);
      if (open === -1 || open >= to) return;
      /* The matching close brace. */
      let depth = 1;
      let j = open + 1;
      while (j < to && depth > 0) {
        if (clean[j] === "{") depth++;
        else if (clean[j] === "}") depth--;
        j++;
      }
      const close = j - 1;
      const head = clean.slice(i, open);
      const trimmed = head.replace(/^[\s;}]+/, "");
      const selectorStart = i + (head.length - trimmed.length);
      const selector = trimmed.trim();
      if (selector.startsWith("@")) {
        /* @media, @supports, @layer: read the inside as rules. @font-face and the like have no rules in them. */
        read(open + 1, close);
      } else if (selector !== "") {
        const { line, column } = locate(text, selectorStart, baseLine, baseColumn);
        out.push({ selector, line, column, declarations: readDeclarations(clean.slice(open + 1, close), open + 1, text, baseLine, baseColumn) });
      }
      i = close + 1;
    }
  };
  read(0, clean.length);
  return out;
}

/* The style sheets of the files: each .css file, and each <style> block of an HTML file. */
export function readSheets(files: string[]): Sheet[] {
  const out: Sheet[] = [];
  for (const file of files) {
    if (isCss(file)) {
      out.push({ file, rules: readRules(fs.readFileSync(file, "utf8")) });
    } else if (isHtml(file)) {
      const text = fs.readFileSync(file, "utf8");
      const rules: StyleRule[] = [];
      for (const m of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
        const offset = (m.index ?? 0) + m[0].indexOf(">") + 1;
        const { line, column } = locate(text, offset, 1, 1);
        rules.push(...readRules(m[1], line, column));
      }
      if (rules.length > 0) out.push({ file, rules });
    }
  }
  return out;
}

/* The declarations of a style attribute, as one rule. */
export function readInline(style: string, line: number, column: number): Declaration[] {
  return readDeclarations(style, 0, style, line, column).map((d) => ({ ...d, line, column }));
}

/* Custom properties of every sheet, with the file and line of the last declaration. The later one wins. */
export function customProperties(sheets: Sheet[]): Map<string, { value: string; file: string; line: number; column: number }> {
  const map = new Map<string, { value: string; file: string; line: number; column: number }>();
  for (const sheet of sheets) {
    for (const rule of sheet.rules) {
      for (const d of rule.declarations) {
        if (d.property.startsWith("--")) map.set(d.property, { value: d.value.trim(), file: sheet.file, line: d.line, column: d.column });
      }
    }
  }
  return map;
}
