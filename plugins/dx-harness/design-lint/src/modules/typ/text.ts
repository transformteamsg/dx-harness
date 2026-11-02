import type { Candidate, RenderedSession, RuleModule } from "../../types.ts";
import { strings } from "../tx/util.ts";

/* TYP-2a, TYP-2b, TYP-4a, TYP-5a, and TYP-6a: rendered checks on the computed
   style of text. Each reads the computed value, so a value set in any unit,
   through var(), or by a utility class is read the same way. A finding sits on
   the element, at its top and left in CSS pixels. */

const VIEWPORT = { width: 1280, height: 800 };

interface Hit {
  top: number;
  left: number;
  message: string;
}

const message = (c: Candidate) => (c.data as { message: string }).message;

/* Opens each page and runs probe in it. probe runs in the page, so it uses
   nothing from outside itself, and arg carries the values that it needs. */
async function perElement<A>(
  rendered: RenderedSession | undefined,
  pages: unknown,
  probe: (arg: A) => Hit[],
  arg: A,
): Promise<Candidate[]> {
  const out: Candidate[] = [];
  if (!rendered) return out;
  for (const pagePath of strings(pages)) {
    const page = await rendered.open(pagePath, VIEWPORT);
    for (const hit of await page.evaluate(probe, arg)) {
      out.push({ file: pagePath, line: hit.top, column: hit.left, data: { message: hit.message } });
    }
  }
  return out;
}

/* TYP-2a. The floor of an element inside a label is the label floor. */
export const typ2a: RuleModule = {
  code: "TYP-2a",
  surface: "rendered",

  locate: ({ rendered, params }) =>
    perElement(
      rendered,
      params.pages,
      (a: { body: number; label: number; labelSelector: string }) => {
        const out: { top: number; left: number; message: string }[] = [];
        const inside = (el: any, sel: string) => {
          try {
            return sel !== "" && el.closest(sel) !== null;
          } catch {
            return false;
          }
        };
        for (const el of Array.from(document.body.querySelectorAll("*")) as any[]) {
          if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(el.tagName)) continue;
          if (!Array.from(el.childNodes).some((n: any) => n.nodeType === 3 && (n.nodeValue ?? "").trim() !== "")) continue;
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          if (cs.display === "none" || cs.visibility === "hidden" || (r.width === 0 && r.height === 0)) continue;
          const size = parseFloat(cs.fontSize);
          const label = inside(el, a.labelSelector);
          const floor = label ? a.label : a.body;
          if (size < floor - 0.01) {
            out.push({ top: Math.round(r.top), left: Math.round(r.left), message: `The <${el.tagName.toLowerCase()}> text is ${size}px. ${label ? "Label" : "Body"} text is at least ${floor}px.` });
          }
        }
        return out;
      },
      { body: Number(params.bodyMinSize), label: Number(params.labelMinSize), labelSelector: String(params.labelSelector) },
    ),

  decide: message,
};

/* TYP-2b. A line height of normal has no number in the computed style. */
export const typ2b: RuleModule = {
  code: "TYP-2b",
  surface: "rendered",

  locate: ({ rendered, params }) =>
    perElement(
      rendered,
      params.pages,
      (a: { selector: string; min: number; max: number }) => {
        const out: { top: number; left: number; message: string }[] = [];
        let list: any[] = [];
        try {
          list = Array.from(document.body.querySelectorAll(a.selector));
        } catch {
          /* an invalid selector matches nothing */
        }
        for (const el of list) {
          if (!Array.from(el.childNodes).some((n: any) => n.nodeType === 3 && (n.nodeValue ?? "").trim() !== "")) continue;
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          if (cs.display === "none" || cs.visibility === "hidden" || (r.width === 0 && r.height === 0)) continue;
          const at = { top: Math.round(r.top), left: Math.round(r.left) };
          const tag = el.tagName.toLowerCase();
          if (cs.lineHeight === "normal") {
            out.push({ ...at, message: `The <${tag}> text has a line height of normal. Set it from ${a.min} to ${a.max}.` });
            continue;
          }
          const ratio = Math.round((parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)) * 100) / 100;
          if (ratio < a.min || ratio > a.max) {
            out.push({ ...at, message: `The <${tag}> text has a line height of ${ratio}. Set it from ${a.min} to ${a.max}.` });
          }
        }
        return out;
      },
      { selector: String(params.bodySelector), min: Number(params.minLineHeight), max: Number(params.maxLineHeight) },
    ),

  decide: message,
};

/* TYP-4a. A child inherits the transform, so only the outermost element with
   text is reported. */
export const typ4a: RuleModule = {
  code: "TYP-4a",
  surface: "rendered",

  locate: ({ rendered, params }) =>
    perElement(
      rendered,
      params.pages,
      (a: { exempt: string }) => {
        const out: { top: number; left: number; message: string }[] = [];
        const reported: any[] = [];
        const exempt = (el: any) => {
          try {
            return a.exempt !== "" && el.closest(a.exempt) !== null;
          } catch {
            return false;
          }
        };
        for (const el of Array.from(document.body.querySelectorAll("*")) as any[]) {
          if (!Array.from(el.childNodes).some((n: any) => n.nodeType === 3 && (n.nodeValue ?? "").trim() !== "")) continue;
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          if (cs.display === "none" || cs.visibility === "hidden" || (r.width === 0 && r.height === 0)) continue;
          if (cs.textTransform !== "uppercase" || exempt(el)) continue;
          if (reported.some((p) => p.contains(el))) continue;
          reported.push(el);
          out.push({ top: Math.round(r.top), left: Math.round(r.left), message: `The <${el.tagName.toLowerCase()}> text is set in capitals by text-transform: uppercase. Use sentence case.` });
        }
        return out;
      },
      { exempt: String(params.exemptSelector) },
    ),

  decide: message,
};

/* TYP-5a. A number is digits with separators, an optional sign, an optional
   currency prefix, and an optional percent sign. */
export const typ5a: RuleModule = {
  code: "TYP-5a",
  surface: "rendered",

  locate: ({ rendered, params }) =>
    perElement(
      rendered,
      params.pages,
      (a: { selector: string; minRows: number }) => {
        const out: { top: number; left: number; message: string }[] = [];
        const isNumber = (t: string) => /\d/.test(t) && /^[-+−]?(?:[A-Z]{1,3}\$|[$€£¥])?\s?[-+−]?[\d.,\s]+%?$/.test(t);
        const tabular = (el: any) =>
          [el, ...Array.from(el.querySelectorAll("*"))].every((x: any) => getComputedStyle(x).fontVariantNumeric.includes("tabular-nums"));
        let tables: any[] = [];
        try {
          tables = Array.from(document.body.querySelectorAll(a.selector));
        } catch {
          /* an invalid selector matches nothing */
        }
        for (const table of tables) {
          const rows = (Array.from(table.querySelectorAll("tbody > tr")) as any[]).filter((row) =>
            Array.from(row.cells).every((c: any) => c.colSpan === 1),
          );
          const width = Math.max(0, ...rows.map((row) => row.cells.length));
          for (let c = 0; c < width; c++) {
            const cells = rows
              .map((row) => row.cells[c])
              .filter((cell: any) => cell && cell.tagName === "TD" && String(cell.innerText ?? "").trim() !== "");
            if (cells.length < a.minRows) continue;
            if (!cells.every((cell: any) => isNumber(String(cell.innerText).trim()))) continue;
            if (cells.every(tabular)) continue;
            const r = cells[0].getBoundingClientRect();
            out.push({ top: Math.round(r.top), left: Math.round(r.left), message: `Column ${c + 1} of the table holds numbers in proportional figures. Set font-variant-numeric: tabular-nums.` });
          }
        }
        return out;
      },
      { selector: String(params.tableSelector), minRows: Number(params.minRows) },
    ),

  decide: message,
};

/* TYP-6a. A line is the group of text boxes that share a bottom edge, and its
   width runs from the leftmost box to the rightmost one. 1ch is measured in the
   font of the element. */
export const typ6a: RuleModule = {
  code: "TYP-6a",
  surface: "rendered",

  locate: ({ rendered, params }) =>
    perElement(
      rendered,
      params.pages,
      (a: { selector: string; max: number }) => {
        const out: { top: number; left: number; message: string }[] = [];
        let list: any[] = [];
        try {
          list = Array.from(document.body.querySelectorAll(a.selector));
        } catch {
          /* an invalid selector matches nothing */
        }
        for (const el of list) {
          if (el.parentElement?.closest(a.selector)) continue;
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          if (cs.display === "none" || cs.visibility === "hidden" || (r.width === 0 && r.height === 0)) continue;
          const probe = document.createElement("span");
          probe.style.cssText = "position:absolute;visibility:hidden;width:1ch;height:0;padding:0;border:0";
          el.appendChild(probe);
          const ch = probe.getBoundingClientRect().width;
          probe.remove();
          if (ch === 0) continue;
          const range = document.createRange();
          range.selectNodeContents(el);
          const lines: { bottom: number; left: number; right: number }[] = [];
          for (const box of Array.from(range.getClientRects()) as any[]) {
            if (box.width === 0) continue;
            const line = lines.find((l) => Math.abs(l.bottom - box.bottom) < 4);
            if (line) {
              line.left = Math.min(line.left, box.left);
              line.right = Math.max(line.right, box.right);
            } else lines.push({ bottom: box.bottom, left: box.left, right: box.right });
          }
          const widest = Math.max(0, ...lines.map((l) => l.right - l.left));
          if (widest > a.max * ch + 1) {
            out.push({ top: Math.round(r.top), left: Math.round(r.left), message: `A line of the <${el.tagName.toLowerCase()}> text is ${Math.round(widest / ch)}ch wide. Keep running prose to ${a.max}ch, with a max-width in ch.` });
          }
        }
        return out;
      },
      { selector: String(params.proseSelector), max: Number(params.maxMeasure) },
    ),

  decide: message,
};
