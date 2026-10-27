import fs from "node:fs";
import { isHtml } from "../../files.ts";
import { elements } from "../../html.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { JSX_FILE, jsxElements } from "./a-jsx.ts";
import { customProperties, readInline, readSheets } from "./b-css.ts";
import type { Declaration } from "./b-css.ts";

/* WP-12b, WP-14b, WP-18c, and WP-19c: source checks on HTML, JSX and TSX, and
   style sheets. A style sheet is a .css file or a <style> block of an HTML file. */

const message = (c: Candidate) => (c.data as { message: string }).message;

/* WP-12b. An attribute that is a boolean is present when it is bare, or has any
   value other than the string "false". In JSX, an expression other than a literal
   is dynamic, and the check treats it as present for muted and controls and as
   absent for nothing: a dynamic autoplay is not read. */
export const wp12b: RuleModule = {
  code: "WP-12b",
  surface: "source",

  locate({ files }) {
    const out: Candidate[] = [];
    const add = (file: string, line: number, column: number, tag: string) =>
      out.push({ file, line, column, data: { message: `The <${tag}> element has autoplay and has neither muted nor controls. Add controls, or mute it.` } });
    for (const file of files) {
      if (isHtml(file)) {
        for (const el of elements(fs.readFileSync(file, "utf8"))) {
          if (el.tag !== "audio" && el.tag !== "video") continue;
          if (!("autoplay" in el.attrs)) continue;
          if ("muted" in el.attrs || "controls" in el.attrs) continue;
          add(file, el.line, el.column, el.tag);
        }
      } else if (JSX_FILE.test(file)) {
        for (const el of jsxElements(fs.readFileSync(file, "utf8"))) {
          if (el.tag !== "audio" && el.tag !== "video") continue;
          const on = (name: string) => (name in el.attrs && el.attrs[name] !== "false") || el.dynamic.has(name) || el.spread;
          const autoplay = ("autoPlay" in el.attrs && el.attrs.autoPlay !== "false") || ("autoplay" in el.attrs && el.attrs.autoplay !== "false");
          if (!autoplay) continue;
          if (on("muted") || on("controls")) continue;
          add(file, el.line, el.column, el.tag);
        }
      }
    }
    return out;
  },

  decide: message,
};

/* WP-14b. A unit is each number with a suffix in the value, so calc() and clamp()
   are read part by part. A keyword such as medium or larger is relative to the
   user's setting and passes. var() resolves through the custom properties of the
   project's style sheets; one that does not resolve is not read. A value of 0 has
   no unit. The font shorthand is read for the first size in it. Inline styles in
   HTML are read. JSX style objects are not read. */
export const wp14b: RuleModule = {
  code: "WP-14b",
  surface: "source",

  locate({ files, params }) {
    const allowed = new Set((params.allowedUnits as string[]).map((u) => String(u).toLowerCase()));
    const sheets = readSheets(files);
    const props = customProperties(sheets);
    const out: Candidate[] = [];

    const badUnit = (value: string, seen = new Set<string>()): string | null => {
      for (const ref of value.matchAll(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g)) {
        const entry = props.get(ref[1]);
        const inner = entry && !seen.has(ref[1]) ? entry.value : ref[2];
        if (inner) {
          const bad = badUnit(inner, new Set([...seen, ref[1]]));
          if (bad) return bad;
        }
      }
      const bare = value.replace(/var\([^)]*\)/g, " ");
      for (const m of bare.matchAll(/(?<![\w.-])(\d*\.?\d+)([a-z%]+)/gi)) {
        if (!allowed.has(m[2].toLowerCase())) return m[2].toLowerCase();
      }
      return null;
    };

    const check = (file: string, d: Declaration) => {
      let value: string | null = null;
      if (d.property === "font-size") value = d.value;
      else if (d.property === "font") {
        const m = /(?:^|\s)(\d*\.?\d+[a-z%]+)(?=\s|\/|$)/i.exec(d.value);
        value = m ? m[1] : null;
      }
      if (value === null) return;
      const unit = badUnit(value);
      if (unit) {
        out.push({ file, line: d.line, column: d.column, data: { message: `The ${d.property} value "${value.trim()}" uses the unit ${unit}. Use ${[...allowed].join(", ")}.` } });
      }
    };

    for (const sheet of sheets) for (const rule of sheet.rules) for (const d of rule.declarations) check(sheet.file, d);
    for (const file of files.filter(isHtml)) {
      for (const el of elements(fs.readFileSync(file, "utf8"))) {
        if (el.attrs.style) for (const d of readInline(el.attrs.style, el.line, el.column)) check(file, d);
      }
    }
    return out;
  },

  decide: message,
};

/* WP-18c. Style sheets only. An inline style that forces spacing is WP-18a. */
export const wp18c: RuleModule = {
  code: "WP-18c",
  surface: "source",

  locate({ files, params }) {
    const props = new Set((params.properties as string[]).map((p) => String(p).toLowerCase()));
    const out: Candidate[] = [];
    for (const sheet of readSheets(files)) {
      for (const rule of sheet.rules) {
        for (const d of rule.declarations) {
          if (props.has(d.property) && d.important) {
            out.push({ file: sheet.file, line: d.line, column: d.column, data: { message: `${d.property} is set with !important in ${rule.selector}. A user style sheet cannot override it.` } });
          }
        }
      }
    }
    return out;
  },

  decide: message,
};

/* WP-19c. A rule reveals content when it sets display, visibility, or opacity to
   a shown value, and its target is hidden by another rule. The target is the
   last compound selector, without its pseudo-class. The rule needs a twin in
   which each :hover is :focus, :focus-within, or :focus-visible, and that sets a
   shown value too. A hover rule whose target is never hidden, such as a link
   colour change, is not a reveal. */
export const wp19c: RuleModule = {
  code: "WP-19c",
  surface: "source",

  locate({ files }) {
    const sheets = readSheets(files);
    const norm = (s: string) => s.replace(/\s+/g, " ").replace(/\s*([>+~])\s*/g, "$1").trim();
    const lastCompound = (s: string) => {
      const parts = norm(s).split(/[\s>+~]/);
      return parts[parts.length - 1].replace(/:(hover|focus|focus-within|focus-visible|active)/g, "");
    };
    const shows = (d: Declaration) => {
      const v = d.value.trim().toLowerCase();
      if (d.property === "display") return v !== "none";
      if (d.property === "visibility") return v === "visible";
      if (d.property === "opacity") return parseFloat(v) > 0;
      return false;
    };
    const hides = (d: Declaration) => {
      const v = d.value.trim().toLowerCase();
      return (d.property === "display" && v === "none") || (d.property === "visibility" && (v === "hidden" || v === "collapse")) || (d.property === "opacity" && parseFloat(v) === 0);
    };
    const hidden = new Set<string>();
    const focusRules = new Set<string>();
    for (const sheet of sheets) {
      for (const rule of sheet.rules) {
        for (const sel of rule.selector.split(",")) {
          if (rule.declarations.some(hides) && !/:hover/.test(sel)) hidden.add(lastCompound(sel));
          if (/:focus/.test(sel) && rule.declarations.some(shows)) focusRules.add(norm(sel));
        }
      }
    }
    const out: Candidate[] = [];
    for (const sheet of sheets) {
      for (const rule of sheet.rules) {
        if (!rule.declarations.some(shows)) continue;
        for (const sel of rule.selector.split(",")) {
          if (!/:hover/.test(sel)) continue;
          if (!hidden.has(lastCompound(sel))) continue;
          const twins = ["focus", "focus-within", "focus-visible"].map((p) => norm(sel).replace(/:hover/g, `:${p}`));
          if (twins.some((t) => focusRules.has(t))) continue;
          out.push({ file: sheet.file, line: rule.line, column: rule.column, data: { message: `${norm(sel)} reveals content on hover and has no :focus or :focus-within rule for the same target.` } });
        }
      }
    }
    return out;
  },

  decide: message,
};
