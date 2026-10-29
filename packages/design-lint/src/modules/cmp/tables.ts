import type { Candidate, RuleModule } from "../../types.ts";
import { VIEWPORT, strings } from "../tx/util.ts";

/* The table rules of CMP: CMP-6a and CMP-6b. A finding sits on the table. */

interface TableFact {
  top: number;
  left: number;
  problems: string[];
}

/* CMP-6a: each cell of a numeric column is aligned right and has tabular
   figures. A column is numeric when every body cell with text matches
   numericPattern. */
export const cmp6a: RuleModule = {
  code: "CMP-6a",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of strings(params.pages)) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const tables = await page.evaluate(
        (arg: { pattern: string; skip: string }) => {
          const numeric = new RegExp(arg.pattern, "u");
          const facts: { top: number; left: number; problems: string[] }[] = [];
          for (const table of Array.from(document.querySelectorAll("table")) as any[]) {
            const bodyRows = (Array.from(table.querySelectorAll("tbody tr")) as any[]).filter((tr: any) => !Array.from(tr.children).every((c: any) => c.tagName === "TH"));
            const head = table.querySelector("thead tr") ?? (Array.from(table.rows) as any[]).find((tr: any) => Array.from(tr.children).every((c: any) => c.tagName === "TH"));
            const headCells = head ? (Array.from(head.children) as any[]) : [];
            const width = Math.max(0, ...bodyRows.map((tr: any) => tr.children.length));
            const problems: string[] = [];
            for (let col = 0; col < width; col++) {
              let skip = false;
              try {
                skip = headCells[col]?.matches(arg.skip) === true;
              } catch {
                /* an invalid selector matches nothing */
              }
              if (skip) continue;
              const cells = bodyRows.map((tr: any) => tr.children[col]).filter((c: any) => c && String(c.innerText).trim() !== "");
              if (cells.length === 0 || !cells.every((c: any) => numeric.test(String(c.innerText).trim()))) continue;
              const label = String(headCells[col]?.innerText ?? `column ${col + 1}`).replace(/\s+/g, " ").trim();
              for (const c of cells) {
                const s = getComputedStyle(c);
                const aligned = s.textAlign === "right" || s.textAlign === "end";
                const tabular = s.fontVariantNumeric.includes("tabular-nums") || /["']tnum["'](?!\s+(?:0|off))/.test(s.fontFeatureSettings);
                if (!aligned) problems.push(`"${label}" is not aligned right`);
                if (!tabular) problems.push(`"${label}" has no tabular figures`);
                if (!aligned || !tabular) break;
              }
            }
            const r = table.getBoundingClientRect();
            facts.push({ top: Math.round(r.top + window.scrollY), left: Math.round(r.left + window.scrollX), problems });
          }
          return facts;
        },
        { pattern: String(params.numericPattern), skip: String(params.identifierColumnSelector) },
      );
      for (const t of tables as TableFact[]) out.push({ file: pagePath, line: t.top, column: t.left, data: t });
    }
    return out;
  },

  decide(candidate) {
    const { problems } = candidate.data as TableFact;
    if (problems.length === 0) return null;
    return `A numeric column of this table breaks the alignment: ${problems.join("; ")}. Align the column right, and set font-variant-numeric: tabular-nums.`;
  },
};

/* CMP-6b: a table taller than the viewport keeps a header cell in view after
   the page scrolls 400 pixels past the top of the table. */
export const cmp6b: RuleModule = {
  code: "CMP-6b",
  surface: "rendered",

  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of strings(params.pages)) {
      const page = await rendered.open(pagePath, VIEWPORT, { fresh: true });
      const tables = await page.evaluate(() => {
        const facts: { top: number; left: number; problems: string[] }[] = [];
        for (const table of Array.from(document.querySelectorAll("table")) as any[]) {
          const head = table.querySelector("thead tr") ?? (Array.from(table.rows) as any[]).find((tr: any) => Array.from(tr.children).every((c: any) => c.tagName === "TH"));
          const box = table.getBoundingClientRect();
          const top = Math.round(box.top + window.scrollY);
          const left = Math.round(box.left + window.scrollX);
          if (!head || box.height <= window.innerHeight) continue;
          window.scrollTo(0, top + 400);
          const inView = (Array.from(head.children) as any[]).some((c: any) => {
            const r = c.getBoundingClientRect();
            return r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
          });
          window.scrollTo(0, 0);
          facts.push({ top, left, problems: inView ? [] : ["no header cell is in view"] });
        }
        return facts;
      });
      for (const t of tables as TableFact[]) out.push({ file: pagePath, line: t.top, column: t.left, data: t });
    }
    return out;
  },

  decide(candidate) {
    const { problems } = candidate.data as TableFact;
    if (problems.length === 0) return null;
    return "The header row of this long table scrolls out of view. Make the header cells sticky, with position: sticky and top: 0.";
  },
};
