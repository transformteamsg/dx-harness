/* A small CSS scanner for the token rules. It finds raw colour values, and
   spacing and radius values that are not on the scale, in declarations. It is
   not a CSS parser: a value in an unusual layout may be missed, and the Python
   token-audit.py stays the reference. */

export interface RawColour {
  line: number;
  column: number;
  value: string;
  property: string;
}

export interface OffScaleValue {
  line: number;
  column: number;
  value: string;
  property: string;
  kind: "spacing" | "radius";
  /* The nearest value on the scale, in px. */
  nearest: number;
}

const COLOUR_PROPERTIES =
  /^(color|background|background-color|border(-[a-z]+)*|outline(-[a-z]+)*|fill|stroke|box-shadow|text-shadow|text-decoration-color|caret-color|accent-color)$/;
const COLOUR_VALUE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/g;
const NAMED = /\b(?:white|black|red|green|blue|gray|grey|orange|yellow|purple)\b/gi;

/* The scales of token-audit.py: the shadcn defaults, in px. A rem value counts
   at 16px to the rem. */
export const SPACING_SCALE = [0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96, 112, 128];
export const RADIUS_SCALE = [0, 2, 4, 6, 8, 12, 16, 24, 9999];

const SPACING_PROPERTIES = /^(?:(?:margin|padding)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?|gap|column-gap|row-gap|top|left|right|bottom)$/;
const RADIUS_PROPERTIES = /^border(?:-[a-z]+)*-radius$/;
const LENGTH = /(?<![\w.#-])-?(\d*\.?\d+)(px|rem)\b/g;

/* The palette classes of Tailwind, which name a colour of the palette and not a
   role, such as bg-red-500. */
const PALETTE_CLASS =
  /\b(?:bg|text|border)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-(\d{1,3})\b/g;
const THEME_COLOUR = /--color-([\w-]+)\s*:/g;

const blank = (s: string) => s.replace(/[^\n]/g, " ");

/* Where an offset in the text sits in the file. baseLine and baseColumn are the
   position of the first character of the text. */
function position(text: string, offset: number, baseLine: number, baseColumn: number) {
  const before = text.slice(0, offset);
  const lines = before.split("\n");
  const line = baseLine + lines.length - 1;
  const column = lines.length === 1 ? baseColumn + offset : lines[lines.length - 1].length + 1;
  return { line, column };
}

interface Declaration {
  property: string;
  /* The value, with each var() and url() blanked. A blank keeps the offsets. */
  value: string;
  /* The offset of the value in the text. */
  start: number;
}

/* Each declaration that is not a token definition. A custom property definition
   and the region between the dx-tokens and /dx-tokens comments define tokens,
   so they are left out. */
function declarations(text: string): Declaration[] {
  let clean = text.replace(/\/\*\s*dx-tokens\s*\*\/[\s\S]*?\/\*\s*\/dx-tokens\s*\*\//g, blank);
  clean = clean.replace(/\/\*[\s\S]*?\*\//g, blank);

  const out: Declaration[] = [];
  const declaration = /([-\w]+)\s*:\s*([^;{}]+)(?=[;}]|$)/g;
  for (const m of clean.matchAll(declaration)) {
    const property = m[1].toLowerCase();
    if (property.startsWith("--")) continue;
    /* A var() or url() holds a token or a path, not a raw value. */
    const value = m[2].replace(/(?:var|url)\((?:[^()]|\([^()]*\))*\)/g, blank);
    out.push({ property, value, start: m.index + m[0].length - m[2].length });
  }
  return out;
}

export function rawColours(text: string, baseLine = 1, baseColumn = 1): RawColour[] {
  const out: RawColour[] = [];
  for (const { property, value, start } of declarations(text)) {
    const hits = [...value.matchAll(COLOUR_VALUE)];
    if (COLOUR_PROPERTIES.test(property)) hits.push(...value.matchAll(NAMED));
    for (const hit of hits) {
      const { line, column } = position(text, start + (hit.index ?? 0), baseLine, baseColumn);
      out.push({ line, column, value: hit[0].replace(/\($/, ""), property });
    }
  }
  return out.sort((a, b) => a.line - b.line || a.column - b.column);
}

/* The value on the scale that is nearest to px. On a tie, the smaller one, as in token-audit.py. */
export function nearest(scale: number[], px: number): number {
  return scale.reduce((best, s) => (Math.abs(s - px) < Math.abs(best - px) ? s : best));
}

/* Each px or rem value of a spacing or radius property that is not on its
   scale. A value in calc() is a computation, not a step of the scale, so it is
   left out. Zero, auto, percentages, and viewport units have no px or rem, so
   they pass. */
export function offScaleValues(text: string, baseLine = 1, baseColumn = 1): OffScaleValue[] {
  const out: OffScaleValue[] = [];
  for (const { property, value, start } of declarations(text)) {
    const kind = SPACING_PROPERTIES.test(property) ? "spacing" : RADIUS_PROPERTIES.test(property) ? "radius" : null;
    if (!kind) continue;
    const scale = kind === "spacing" ? SPACING_SCALE : RADIUS_SCALE;
    const lengths = value.replace(/calc\((?:[^()]|\([^()]*\))*\)/g, blank);
    for (const hit of lengths.matchAll(LENGTH)) {
      const px = Math.abs(Number(hit[1])) * (hit[2] === "rem" ? 16 : 1);
      if (scale.includes(Math.round(px))) continue;
      const { line, column } = position(text, start + (hit.index ?? 0), baseLine, baseColumn);
      out.push({ line, column, value: hit[0], property, kind, nearest: nearest(scale, px) });
    }
  }
  return out.sort((a, b) => a.line - b.line || a.column - b.column);
}

/* The colour names that a theme defines as tokens, from each --color-<name>
   definition, such as amber-11 from --color-amber-11. A palette class that uses
   one of them names a token of the project. */
export function themeColours(text: string): string[] {
  return [...text.matchAll(THEME_COLOUR)].map((m) => m[1]);
}

/* Each palette class in a class list whose colour the theme does not define. */
export function paletteClasses(classes: string, theme: ReadonlySet<string>): string[] {
  return [...classes.matchAll(PALETTE_CLASS)]
    .filter((m) => !theme.has(m[1]) && !theme.has(`${m[1]}-${m[2]}`))
    .map((m) => m[0]);
}
