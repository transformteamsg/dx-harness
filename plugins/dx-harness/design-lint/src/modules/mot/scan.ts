import fs from "node:fs";
import { SCRIPT_FILE } from "../wo/util.ts";

/* The motion values of a source file, for MOT-1a and MOT-2a. It reads CSS files,
   <style> blocks, inline style attributes, and Tailwind class tokens. It is not
   a CSS parser, and it does not resolve a var() to its value. */

export interface MotionValue {
  /* The offset in the file. */
  offset: number;
  kind: "duration" | "all" | "easing";
  /* The text as written, such as 450ms or cubic-bezier(0.3, 1.6, 0.5, 1). */
  value: string;
  property: string;
  /* A duration in milliseconds. */
  ms?: number;
  /* An animation that repeats with no end. */
  infinite?: boolean;
  /* An easing whose curve goes below 0 or above 1. */
  overshoots?: boolean;
  /* A Tailwind class from the scale, such as duration-500, and not an arbitrary value. */
  scale?: boolean;
}

const blank = (s: string) => s.replace(/[^\n]/g, " ");
const TIME = /(?<![\w.-])(-?\d*\.?\d+)(ms|s)(?![\w-])/g;
const BEZIER = /cubic-bezier\(([^()]*)\)/g;
const toMs = (n: string, unit: string) => Number(n) * (unit === "s" ? 1000 : 1);

/* The items of a comma list, split outside parentheses, with the offset of each. */
function items(value: string): { text: string; offset: number }[] {
  const out: { text: string; offset: number }[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i <= value.length; i++) {
    const c = value[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if ((c === "," && depth === 0) || i === value.length) {
      out.push({ text: value.slice(start, i), offset: start });
      start = i + 1;
    }
  }
  return out;
}

function easings(value: string, base: number, property: string): MotionValue[] {
  return [...value.matchAll(BEZIER)].map((m) => {
    const [, y1, , y2] = m[1].split(",").map(Number);
    return { offset: base + (m.index ?? 0), kind: "easing", value: m[0], property, overshoots: y1 < 0 || y1 > 1 || y2 < 0 || y2 > 1 };
  });
}

/* The motion values in CSS text. base is the offset of the text in the file. */
export function cssMotion(css: string, base: number): MotionValue[] {
  /* A region between the dx-tokens and /dx-tokens comments defines tokens. */
  let clean = css.replace(/\/\*\s*dx-tokens\s*\*\/[\s\S]*?\/\*\s*\/dx-tokens\s*\*\//g, blank);
  clean = clean.replace(/\/\*[\s\S]*?\*\//g, blank);
  const out: MotionValue[] = [];
  for (const m of clean.matchAll(/([-\w]+)\s*:\s*([^;{}]+)(?=[;}]|$)/g)) {
    const property = m[1].toLowerCase();
    if (property.startsWith("--") || !/^(?:transition|animation)(?:-|$)/.test(property)) continue;
    /* A var() holds a token, not a raw value. */
    const value = m[2].replace(/var\((?:[^()]|\([^()]*\))*\)/g, blank);
    const at = base + (m.index ?? 0) + m[0].length - m[2].length;
    out.push(...easings(value, at, property));
    if (property === "transition-property" && /(?:^|,)\s*all\s*(?:,|$)/.test(value)) {
      out.push({ offset: at + value.search(/\ball\b/), kind: "all", value: "all", property });
    }
    if (!["transition", "animation", "transition-duration", "animation-duration"].includes(property)) continue;
    for (const item of items(value)) {
      /* The first time of an item is its duration. A second time is a delay. */
      const time = [...item.text.replace(BEZIER, blank).matchAll(TIME)][0];
      if (property === "transition" && /^\s*all\b/.test(item.text)) {
        out.push({ offset: at + item.offset + item.text.search(/\ball\b/), kind: "all", value: "all", property });
      }
      if (!time) continue;
      out.push({
        offset: at + item.offset + (time.index ?? 0),
        kind: "duration",
        value: time[0],
        property,
        ms: toMs(time[1], time[2]),
        infinite: property === "animation" && /\binfinite\b/.test(item.text),
      });
    }
  }
  return out;
}

/* The motion values in a Tailwind class list. base is the offset of the list in the file. */
export function classMotion(list: string, base: number): MotionValue[] {
  const out: MotionValue[] = [];
  for (const t of list.matchAll(/\S+/g)) {
    /* The utility after any variant, such as hover:transition-all. */
    const token = t[0];
    const utility = token.slice(token.lastIndexOf(":", token.indexOf("[") === -1 ? token.length : token.indexOf("[")) + 1);
    const at = base + (t.index ?? 0);
    let m: RegExpExecArray | null;
    if (utility === "transition-all") out.push({ offset: at, kind: "all", value: token, property: "class" });
    else if ((m = /^duration-(\d+)$/.exec(utility))) out.push({ offset: at, kind: "duration", value: token, property: "class", ms: Number(m[1]), scale: true });
    else if ((m = /^duration-\[(\d*\.?\d+)(ms|s)\]$/.exec(utility))) out.push({ offset: at, kind: "duration", value: token, property: "class", ms: toMs(m[1], m[2]) });
    else if (/^ease-\[.+\]$/.test(utility)) {
      const curve = utility.slice(6, -1).replace(/_/g, " ");
      out.push(...easings(curve, at, "class").map((e) => ({ ...e, offset: at, value: token })));
    }
  }
  return out;
}

/* The source files that may hold motion values. */
export const motionFile = (file: string) => /\.css$/i.test(file) || SCRIPT_FILE.test(file);

/* Every motion value of a file, sorted by offset, and the text of the file. */
export function motionValues(file: string): { text: string; values: MotionValue[] } {
  const text = fs.readFileSync(file, "utf8");
  if (/\.css$/i.test(file)) return { text, values: cssMotion(text, 0) };
  const values: MotionValue[] = [];
  for (const s of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    values.push(...cssMotion(s[1], (s.index ?? 0) + s[0].indexOf(">") + 1));
  }
  for (const s of text.matchAll(/\bstyle\s*=\s*"([^"]*)"/gi)) {
    values.push(...cssMotion(s[1], (s.index ?? 0) + s[0].indexOf('"') + 1));
  }
  for (const s of text.matchAll(/\bclass(?:Name)?\s*=\s*(?:"([^"]*)"|\{?`([^`]*)`\}?|'([^']*)')/g)) {
    const list = s[1] ?? s[2] ?? s[3] ?? "";
    values.push(...classMotion(list, (s.index ?? 0) + s[0].indexOf(list)));
  }
  return { text, values: values.sort((a, b) => a.offset - b.offset) };
}

/* The custom property definitions of a file whose name starts with a prefix. */
export function definesToken(file: string, prefixes: string[]): boolean {
  const text = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  return prefixes.some((p) => new RegExp(`(?:^|[\\s;{])${p.replace(/[-]/g, "\\-")}[\\w-]*\\s*:`).test(text));
}
