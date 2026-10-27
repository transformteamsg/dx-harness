import fs from "node:fs";
import { isHtml } from "../../files.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { SCRIPT_FILE, message, position } from "./util.ts";

/* WO-13a: a style rule removes the focus outline with no replacement. Ported
   from plugins/dx-harness/checks/a11y-static.py, and extended to read a
   replacement in a separate :focus-visible rule of the same file. It reads CSS
   files, <style> blocks, inline style attributes, and Tailwind class tokens. A
   replacement in another file is not seen. */

const FOCUSABLE = /^(?:a|button|input|select|textarea|summary)\b|\[tabindex|\[role=["']?button/;
const REMOVAL = /\boutline\s*:\s*(?:none|0)\b/g;
const TAILWIND_REMOVAL = /(?<![\w-])(?:focus(?:-visible)?:)?outline-(?:none|0)\b/;
const TAILWIND_REPLACEMENT = /focus-visible:(?:outline|ring|border|shadow)|focus(?:-visible)?:ring-\w+|(?<![\w-])ring-\w+/;

interface Block {
  selector: string;
  body: string;
  bodyOffset: number;
}

/* The CSS blocks of a text, with the offset of each body. A block inside a
   media query is read as a block of its own. */
function blocks(css: string): Block[] {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  const out: Block[] = [];
  for (const m of clean.matchAll(/([^{}@;]+)\{([^{}]*)\}/g)) {
    out.push({ selector: m[1].trim(), body: m[2], bodyOffset: (m.index ?? 0) + m[0].indexOf("{") + 1 });
  }
  return out;
}

const hasReplacement = (body: string, props: string[]) =>
  props.some((p) => new RegExp(`(?:^|[;\\s])${p}\\s*:\\s*(?!none\\b|0\\b|transparent\\b)[^;]+`).test(body));

/* The part of a selector before its :focus or :focus-visible. */
const baseOf = (selector: string) => selector.replace(/:focus(?:-visible|-within)?/g, "").trim();

function cssCandidates(text: string, baseOffset: number, file: string, whole: string, props: string[]): Candidate[] {
  const all = blocks(text);
  const out: Candidate[] = [];
  for (const b of all) {
    const removal = [...b.body.matchAll(REMOVAL)];
    if (removal.length === 0) continue;
    const selectors = b.selector.split(",").map((s) => s.trim());
    const target = selectors.filter((s) => /:focus/.test(s) || FOCUSABLE.test(s));
    if (target.length === 0) continue;
    const covered = target.every((s) => {
      if (hasReplacement(b.body, props)) return true;
      const base = baseOf(s);
      return all.some((o) =>
        o !== b && o.selector.split(",").some((os) => /:focus-visible|:focus/.test(os) && baseOf(os) === base) && hasReplacement(o.body, props),
      );
    });
    if (covered) continue;
    const at = position(whole, baseOffset + b.bodyOffset + (removal[0].index ?? 0));
    out.push({ file, ...at, data: { message: `The rule for ${target.join(", ")} removes the focus outline with no replacement. Add a ${props.join(", ")} change on :focus-visible.` } });
  }
  return out;
}

export const wo13a: RuleModule = {
  code: "WO-13a",
  surface: "source",

  locate({ files, params }) {
    const props = (params.replacementProperties as string[]).map(String);
    const out: Candidate[] = [];
    for (const file of files.filter((f) => /\.css$/i.test(f) || SCRIPT_FILE.test(f))) {
      const text = fs.readFileSync(file, "utf8");
      if (/\.css$/i.test(file)) {
        out.push(...cssCandidates(text, 0, file, text, props));
        continue;
      }
      if (isHtml(file)) {
        for (const s of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
          out.push(...cssCandidates(s[1], (s.index ?? 0) + s[0].indexOf(">") + 1, file, text, props));
        }
        for (const s of text.matchAll(/\bstyle\s*=\s*"([^"]*)"/gi)) {
          if (new RegExp(REMOVAL.source).test(s[1]) && !hasReplacement(s[1], props)) {
            out.push({ file, ...position(text, s.index ?? 0), data: { message: "The inline style removes the outline with no replacement. Keep the outline, or change a visible property on focus." } });
          }
        }
      }
      for (const s of text.matchAll(/\bclass(?:Name)?\s*=\s*(?:"([^"]*)"|\{?`([^`]*)`\}?|'([^']*)')/g)) {
        const value = s[1] ?? s[2] ?? s[3] ?? "";
        if (TAILWIND_REMOVAL.test(value) && !TAILWIND_REPLACEMENT.test(value)) {
          out.push({ file, ...position(text, s.index ?? 0), data: { message: "The class list removes the focus outline with no focus-visible replacement. Add focus-visible:ring or focus-visible:outline." } });
        }
      }
    }
    return out;
  },
  decide: message,
};
