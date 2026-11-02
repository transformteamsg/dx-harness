import fs from "node:fs";
import { isHtml } from "../../files.ts";
import { elements } from "../../html.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { customProperties, readInline, readSheets } from "../wp/b-css.ts";
import type { Declaration } from "../wp/b-css.ts";

/* COL-3a, COL-4a, CMP-12a, and MOT-4a: the source rules of the SLP controls. Each
   reads the rules of the style sheets, a .css file or a <style> block, and the
   style attribute of each HTML element, as one block of declarations. */

const message = (c: Candidate) => (c.data as { message: string }).message;

interface Block {
  file: string;
  line: number;
  column: number;
  declarations: Declaration[];
}

function blocks(files: string[]): Block[] {
  const out: Block[] = [];
  for (const sheet of readSheets(files)) {
    for (const rule of sheet.rules) out.push({ file: sheet.file, line: rule.line, column: rule.column, declarations: rule.declarations });
  }
  for (const file of files.filter(isHtml)) {
    for (const el of elements(fs.readFileSync(file, "utf8"))) {
      if (el.attrs.style) out.push({ file, line: el.line, column: el.column, declarations: readInline(el.attrs.style, el.line, el.column) });
    }
  }
  return out;
}

type Props = ReturnType<typeof customProperties>;
const VAR = /var\(\s*(--[\w-]+)\s*(?:,((?:[^()]|\([^()]*\))*))?\)/g;

/* The value with each var() replaced by its value, or by its fallback when the
   custom property is not declared. A cycle resolves to nothing. */
function resolveVars(value: string, props: Props, seen = new Set<string>()): string {
  return value.replace(VAR, (_, name: string, fallback?: string) => {
    const entry = props.get(name);
    if (entry && !seen.has(name)) return resolveVars(entry.value, props, new Set([...seen, name]));
    return fallback ? resolveVars(fallback, props, seen) : "";
  });
}

/* Each var() removed: a colour in a token is a product decision. */
const withoutVars = (value: string) => value.replace(/var\((?:[^()]|\([^()]*\))*\)/g, " ");

/* A length in pixels. A rem or an em counts as 16 pixels. A bare 0 is 0. */
function pixels(token: string): number | null {
  const m = /^(-?\d*\.?\d+)(px|rem|em)?$/i.exec(token.trim());
  if (!m) return null;
  if (!m[2]) return Number(m[1]) === 0 ? 0 : null;
  return Number(m[1]) * (m[2].toLowerCase() === "px" ? 1 : 16);
}

/* The parts of a value at the top level, split on commas. */
function layers(value: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "(") depth++;
    else if (value[i] === ")") depth--;
    else if (value[i] === "," && depth === 0) {
      out.push(value.slice(start, i));
      start = i + 1;
    }
  }
  out.push(value.slice(start));
  return out.map((s) => s.trim());
}

/* ── Colour ─────────────────────────────────────────────────────────────── */

/* The purple and violet colour names, as hue in degrees and saturation from 0 to 1. */
const PURPLE_NAMES: Record<string, [number, number]> = {
  purple: [300, 1],
  violet: [300, 0.76],
  indigo: [275, 1],
  darkviolet: [282, 1],
  blueviolet: [271, 0.76],
  mediumpurple: [260, 0.6],
  rebeccapurple: [270, 0.5],
  darkorchid: [280, 0.61],
  mediumorchid: [288, 0.59],
  darkmagenta: [300, 1],
};

const COLOUR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\([^)]*\)|\b[a-z]+\b/gi;

/* The hue in degrees and the HSL saturation of a raw colour, or null when the
   text is not one that the rule reads. */
function hueAndSaturation(text: string): [number, number] | null {
  const v = text.toLowerCase();
  if (v in PURPLE_NAMES) return PURPLE_NAMES[v];
  let rgb: number[] | null = null;
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(v);
  if (hex) {
    const h = hex[1].length <= 4 ? [...hex[1].slice(0, 3)].map((c) => c + c).join("") : hex[1].slice(0, 6);
    rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const fn = /^(rgba?|hsla?)\(([^)]*)\)$/.exec(v);
  if (fn) {
    const parts = fn[2].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    if (fn[1].startsWith("hsl")) {
      const hue = ((parseFloat(parts[0]) % 360) + 360) % 360;
      return [hue, parseFloat(parts[1]) / 100];
    }
    rgb = parts.slice(0, 3).map((p) => (p.endsWith("%") ? (parseFloat(p) * 255) / 100 : parseFloat(p)));
  }
  if (!rgb || rgb.some((n) => Number.isNaN(n))) return null;
  const [r, g, b] = rgb.map((n) => n / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return [0, 0];
  const l = (max + min) / 2;
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return [h, s];
}

const colours = (value: string) => [...value.matchAll(COLOUR)].map((m) => ({ text: m[0], hs: hueAndSaturation(m[0]) })).filter((c) => c.hs !== null);

/* The gradient functions of a value, each with its arguments. */
function gradients(value: string): string[] {
  const out: string[] = [];
  for (const m of value.matchAll(/(?:repeating-)?(?:linear|radial|conic)-gradient\(/gi)) {
    let depth = 1;
    let j = (m.index ?? 0) + m[0].length;
    const start = j;
    while (j < value.length && depth > 0) {
      if (value[j] === "(") depth++;
      else if (value[j] === ")") depth--;
      j++;
    }
    out.push(value.slice(start, j - 1));
  }
  return out;
}

/* COL-3a. A purple gradient is two or more purple stops in one gradient. A glow
   is a box-shadow layer that is not inset, with no offset, a large blur, and a
   saturated colour. */
export const col3a: RuleModule = {
  code: "COL-3a",
  surface: "source",

  locate({ files, params }) {
    const [low, high] = params.hueRange as [number, number];
    const minSaturation = Number(params.minSaturation);
    const minGlowBlur = Number(params.minGlowBlur);
    const purple = ([h, s]: [number, number]) => h >= low && h <= high && s >= minSaturation;
    const out: Candidate[] = [];
    for (const block of blocks(files)) {
      for (const d of block.declarations) {
        if (d.property.startsWith("--")) continue;
        const value = withoutVars(d.value);
        for (const g of gradients(value)) {
          const stops = colours(g).filter((c) => purple(c.hs!));
          if (stops.length >= 2) {
            out.push({
              file: block.file,
              line: d.line,
              column: d.column,
              data: { message: `The ${d.property} gradient runs between the purple colours ${stops.map((s) => s.text).join(" and ")}. Use colours from the product palette.` },
            });
            break;
          }
        }
        if (d.property !== "box-shadow") continue;
        for (const layer of layers(value)) {
          if (/\binset\b/i.test(layer)) continue;
          const colour = colours(layer)[0];
          if (!colour || colour.hs![1] < minSaturation) continue;
          const lengths = layer
            .replace(colour.text, " ")
            .split(/\s+/)
            .filter(Boolean)
            .map(pixels);
          if (lengths.length < 3 || lengths.some((n) => n === null)) continue;
          const [x, y, blur] = lengths as number[];
          if (x === 0 && y === 0 && blur >= minGlowBlur) {
            out.push({
              file: block.file,
              line: d.line,
              column: d.column,
              data: { message: `The box-shadow "${layer}" is a glow: no offset, a blur of ${blur}px, and a saturated colour. Give a shadow a y offset and a neutral colour.` },
            });
            break;
          }
        }
      }
    }
    return out;
  },

  decide: message,
};

/* COL-4a. The background-clip and the gradient are in the same block. */
export const col4a: RuleModule = {
  code: "COL-4a",
  surface: "source",

  locate({ files }) {
    const sheets = readSheets(files);
    const props = customProperties(sheets);
    const out: Candidate[] = [];
    for (const block of blocks(files)) {
      const clip = block.declarations.find((d) => /^(-webkit-)?background-clip$/.test(d.property) && /\btext\b/i.test(d.value));
      if (!clip) continue;
      const fill = block.declarations.some(
        (d) => (d.property === "background" || d.property === "background-image") && /gradient\(/i.test(resolveVars(d.value, props)),
      );
      if (fill) {
        out.push({ file: block.file, line: clip.line, column: clip.column, data: { message: "The text has a gradient fill. Give the text a solid colour from the palette." } });
      }
    }
    return out;
  },

  decide: message,
};

const SIDES = /^border-(left|right|inline-start|inline-end)(-width)?$/;
const RADIUS = /^border(-(top|bottom|start|end)-(left|right|start|end))?-radius$/;
const KEYWORD_WIDTHS: Record<string, number> = { thin: 1, medium: 3, thick: 5 };

/* The width of a side border declaration in pixels, or null when it has none that the rule reads. */
function sideWidth(d: Declaration, props: Props): number | null {
  const tokens = resolveVars(d.value, props).replace(/\([^)]*\)/g, " ").split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    const keyword = KEYWORD_WIDTHS[t.toLowerCase()];
    if (keyword !== undefined) return keyword;
    const px = pixels(t);
    if (px !== null) return px;
  }
  return null;
}

/* CMP-12a. The side border and the radius are in the same block. */
export const cmp12a: RuleModule = {
  code: "CMP-12a",
  surface: "source",

  locate({ files, params }) {
    const minWidth = Number(params.minWidth);
    const props = customProperties(readSheets(files));
    const out: Candidate[] = [];
    for (const block of blocks(files)) {
      const rounded = block.declarations.some(
        (d) => RADIUS.test(d.property) && [...resolveVars(d.value, props).matchAll(/(\d*\.?\d+)/g)].some((m) => Number(m[1]) > 0),
      );
      if (!rounded) continue;
      const side = block.declarations.find((d) => SIDES.test(d.property) && (sideWidth(d, props) ?? 0) >= minWidth);
      if (side) {
        out.push({
          file: block.file,
          line: side.line,
          column: side.column,
          data: { message: `The rounded box has a ${sideWidth(side, props)}px ${side.property}. Remove the side accent, or mark the box with an icon, a label, or a full border.` },
        });
      }
    }
    return out;
  },

  decide: message,
};

const MOTION = new Set(["transition", "transition-timing-function", "animation", "animation-timing-function"]);

/* MOT-4a. A name is each identifier in the value outside a function. */
export const mot4a: RuleModule = {
  code: "MOT-4a",
  surface: "source",

  locate({ files, params }) {
    const patterns = (params.namePatterns as string[]).map((p) => String(p).toLowerCase());
    const props = customProperties(readSheets(files));
    const out: Candidate[] = [];
    for (const block of blocks(files)) {
      for (const d of block.declarations) {
        if (!MOTION.has(d.property)) continue;
        const value = resolveVars(d.value, props);
        let reason: string | null = null;
        for (const m of value.matchAll(/cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/gi)) {
          const [y1, y2] = [Number(m[2]), Number(m[4])];
          if (y1 < 0 || y1 > 1 || y2 < 0 || y2 > 1) {
            reason = `the curve ${m[0]} goes past its end point`;
            break;
          }
        }
        if (!reason) {
          const names = value.replace(/[\w-]+\([^)]*\)/g, " ").match(/[a-z_][\w-]*/gi) ?? [];
          const name = names.find((n) => patterns.some((p) => n.toLowerCase().includes(p)));
          if (name) reason = `the name ${name} is a bounce or elastic easing`;
        }
        if (reason) {
          out.push({
            file: block.file,
            line: d.line,
            column: d.column,
            data: { message: `The ${d.property} overshoots: ${reason}. Use an ease-out curve that stays between 0 and 1.` },
          });
        }
      }
    }
    return out;
  },

  decide: message,
};
