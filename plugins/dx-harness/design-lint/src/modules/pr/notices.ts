import type { Candidate, RuleModule } from "../../types.ts";

const VIEWPORT = { width: 1280, height: 800 };

/* PR-3c: when the service is not available 24/7, a page states the hours. The
   rule checks that an element marked by hoursSelector carries text that matches
   hoursPattern, on at least one page of pages. It does not judge the hours. */
export const pr3c: RuleModule = {
  code: "PR-3c",
  surface: "rendered",
  async locate({ rendered, params }) {
    if (!rendered || String(params.availability).trim() === "24/7") return [];
    const pages = params.pages as string[];
    for (const pagePath of pages) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const found = await page.evaluate(
        (a: { sel: string; pattern: string }) =>
          (Array.from(document.querySelectorAll(a.sel)) as any[]).some((el) => new RegExp(a.pattern).test(el.textContent ?? "")),
        { sel: String(params.hoursSelector), pattern: String(params.hoursPattern) },
      );
      if (found) return [];
    }
    return [{ file: pages[0], line: 0, column: 0, data: { selector: String(params.hoursSelector), availability: String(params.availability) } }];
  },
  decide(candidate) {
    const d = candidate.data as { selector: string; availability: string };
    return `The service is available "${d.availability}", but no page states the operational hours. Add an element that matches ${d.selector} with the hours as text.`;
  },
};

/* PR-4c: a downtime notice carries each required field. A field is present when
   a child marked data-field="<name>" has text, or when the notice text has the
   label of the field, the camelCase name split into words, followed by a colon
   and text. The rule finds the gap and does not read the meaning. */
export const pr4c: RuleModule = {
  code: "PR-4c",
  surface: "rendered",
  async locate({ rendered, params }) {
    const out: Candidate[] = [];
    if (!rendered) return out;
    for (const pagePath of params.pages as string[]) {
      const page = await rendered.open(pagePath, VIEWPORT);
      const notices = await page.evaluate(
        (a: { sel: string; fields: string[] }) =>
          (Array.from(document.querySelectorAll(a.sel)) as any[]).map((el) => {
            const text = el.textContent ?? "";
            const missing = a.fields.filter((f) => {
              const marked = (Array.from(el.querySelectorAll("[data-field]")) as any[]).some(
                (c) => c.getAttribute("data-field") === f && (c.textContent ?? "").trim() !== "",
              );
              const label = f.replace(/([A-Z])/g, " $1").toLowerCase();
              const labelled = new RegExp(`${label}\\s*:\\s*\\S`, "i").test(text);
              return !marked && !labelled;
            });
            const b = el.getBoundingClientRect();
            return { missing, top: Math.round(b.top), left: Math.round(b.left) };
          }),
        { sel: String(params.noticeSelector), fields: params.requiredFields as string[] },
      );
      for (const n of notices) if (n.missing.length > 0) out.push({ file: pagePath, line: n.top, column: n.left, data: { missing: n.missing } });
    }
    return out;
  },
  decide(candidate) {
    const { missing } = candidate.data as { missing: string[] };
    return `The downtime notice has no text for: ${missing.join(", ")}. Name each field, for example "Duration: 2 hours".`;
  },
};
