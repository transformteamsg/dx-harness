import fs from "node:fs";
import { isHtml } from "../../files.ts";
import { elements } from "../../html.ts";
import type { Candidate, RuleModule } from "../../types.ts";

/* LAY-1a: each grid uses a column count that divides gridColumns. It reads
   grid-template-columns declarations and Tailwind grid-cols-N classes. A value
   whose track count the source does not show is not counted. */

const blank = (s: string) => s.replace(/[^\n]/g, " ");

/* The number of tracks in a grid-template-columns value, or null when the
   source does not show it. */
export function trackCount(value: string): number | null {
  const v = value.trim().toLowerCase();
  if (v === "" || v === "none" || /auto-fill|auto-fit|var\(|subgrid|masonry|inherit|initial|unset|revert/.test(v)) return null;
  let count = 0;
  let rest = v.replace(/\[[^\]]*\]/g, " ");
  rest = rest.replace(/repeat\(\s*(\d+)\s*,((?:[^()]|\([^()]*\))*)\)/g, (_m, n: string, tracks: string) => {
    count += Number(n) * (trackCount(tracks) ?? 1);
    return " ";
  });
  if (/repeat\(/.test(rest)) return null;
  rest = rest.replace(/[a-z-]+\((?:[^()]|\([^()]*\))*\)/g, " x ");
  count += rest.split(/\s+/).filter(Boolean).length;
  return count;
}

/* Where an offset in the text sits in the file. */
function position(text: string, offset: number, baseLine: number, baseColumn: number) {
  const lines = text.slice(0, offset).split("\n");
  const line = baseLine + lines.length - 1;
  const column = lines.length === 1 ? baseColumn + offset : lines[lines.length - 1].length + 1;
  return { line, column };
}

interface Grid {
  line: number;
  column: number;
  tracks: number;
}

function cssGrids(text: string, baseLine = 1, baseColumn = 1): Grid[] {
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, blank);
  const out: Grid[] = [];
  for (const m of clean.matchAll(/(grid-template-columns)\s*:\s*([^;{}]+)(?=[;}]|$)/gi)) {
    const tracks = trackCount(m[2]);
    if (tracks === null) continue;
    const start = m.index + m[0].length - m[2].length;
    out.push({ ...position(text, start, baseLine, baseColumn), tracks });
  }
  return out;
}

export const lay1a: RuleModule = {
  code: "LAY-1a",
  surface: "source",

  locate({ files }) {
    const out: Candidate[] = [];
    const add = (file: string, g: Grid) => out.push({ file, line: g.line, column: g.column, data: { tracks: g.tracks } });

    for (const file of files) {
      if (/\.css$/i.test(file)) {
        for (const g of cssGrids(fs.readFileSync(file, "utf8"))) add(file, g);
      } else if (isHtml(file)) {
        for (const el of elements(fs.readFileSync(file, "utf8"))) {
          if (el.tag === "style") for (const g of cssGrids(el.text, el.contentLine, el.contentColumn)) add(file, g);
          const at = { line: el.line, column: el.column };
          if (el.attrs.style) for (const g of cssGrids(el.attrs.style)) add(file, { ...at, tracks: g.tracks });
          for (const m of (el.attrs.class ?? "").matchAll(/(?:^|\s)(?:[\w-]+:)*grid-cols-(\d+)(?=\s|$)/g)) {
            add(file, { ...at, tracks: Number(m[1]) });
          }
        }
      }
    }
    return out;
  },

  decide(candidate, params) {
    const { tracks } = candidate.data as { tracks: number };
    const columns = Number(params.gridColumns);
    if (tracks > 0 && columns % tracks === 0) return null;
    return `A grid of ${tracks} columns does not fit the declared ${columns}-column grid. Use a count that divides ${columns}.`;
  },
};
