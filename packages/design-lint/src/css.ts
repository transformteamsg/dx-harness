/* A small CSS scanner for the token rules. It finds raw colour values in
   declarations. It is not a CSS parser: a value in an unusual layout may be
   missed, and the Python token-audit.py stays the reference. */

export interface RawColour {
  line: number;
  column: number;
  value: string;
  property: string;
}

const COLOUR_PROPERTIES =
  /^(color|background|background-color|border(-[a-z]+)*|outline(-[a-z]+)*|fill|stroke|box-shadow|text-shadow|text-decoration-color|caret-color|accent-color)$/;
const COLOUR_VALUE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/g;
const NAMED = /\b(?:white|black|red|green|blue|gray|grey|orange|yellow|purple)\b/gi;

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

export function rawColours(text: string, baseLine = 1, baseColumn = 1): RawColour[] {
  // A region between the dx-tokens and /dx-tokens comments defines tokens.
  let clean = text.replace(/\/\*\s*dx-tokens\s*\*\/[\s\S]*?\/\*\s*\/dx-tokens\s*\*\//g, blank);
  clean = clean.replace(/\/\*[\s\S]*?\*\//g, blank);

  const out: RawColour[] = [];
  const declaration = /([-\w]+)\s*:\s*([^;{}]+)(?=[;}]|$)/g;
  for (const m of clean.matchAll(declaration)) {
    const property = m[1].toLowerCase();
    if (property.startsWith("--")) continue;
    /* A var() or url() holds a token or a path, not a raw value. */
    const value = m[2].replace(/(?:var|url)\((?:[^()]|\([^()]*\))*\)/g, blank);
    const valueStart = m.index + m[0].length - m[2].length;
    const hits = [...value.matchAll(COLOUR_VALUE)];
    if (COLOUR_PROPERTIES.test(property)) hits.push(...value.matchAll(NAMED));
    for (const hit of hits) {
      const { line, column } = position(text, valueStart + (hit.index ?? 0), baseLine, baseColumn);
      out.push({ line, column, value: hit[0].replace(/\($/, ""), property });
    }
  }
  return out.sort((a, b) => a.line - b.line || a.column - b.column);
}
