import path from "node:path";
import { matches } from "../../html.ts";
import { hasSearch, readPages } from "../../project.ts";
import type { Page } from "../../project.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { message } from "./util.ts";

/* The project rules of WO: they read every page of the site together. */

const titleOf = (page: Page) => page.els.find((e) => e.tag === "title");

/* WO-8d: no two pages share a title, and no title is a generic word. A page
   with no title is left to WO-8a and BD-5a. */
export const wo8d: RuleModule = {
  code: "WO-8d",
  surface: "project",

  locate({ files, params }) {
    const generic = new Set((params.genericTitles as string[]).map((t) => t.toLowerCase()));
    const pages = readPages(files);
    const byTitle = new Map<string, Page[]>();
    for (const page of pages) {
      const t = titleOf(page)?.text.trim();
      if (!t) continue;
      const key = t.toLowerCase();
      byTitle.set(key, [...(byTitle.get(key) ?? []), page]);
    }
    const out: Candidate[] = [];
    for (const page of pages) {
      const title = titleOf(page);
      const text = title?.text.trim();
      if (!title || !text) continue;
      const key = text.toLowerCase();
      const at = { file: page.file, line: title.line, column: title.column };
      if (generic.has(key)) out.push({ ...at, data: { message: `The title "${text}" is generic. Start the title with the purpose of the page.` } });
      else if ((byTitle.get(key) ?? []).length > 1) {
        out.push({ ...at, data: { message: `The title "${text}" is also the title of another page. Give each page its own title.` } });
      }
    }
    return out;
  },
  decide: message,
};

/* WO-11b: a multi-page site offers at least minWays kinds of way to reach content. */
export const wo11b: RuleModule = {
  code: "WO-11b",
  surface: "project",

  locate({ files, root, params }) {
    if (params.serviceType === "single-page" || params.serviceType === "transactional") return [];
    const pages = readPages(files);
    if (pages.length < 2) return [];
    const kinds = new Set((params.wayKinds as string[]).map(String));
    const named = (re: RegExp) =>
      pages.some((p) => re.test(path.relative(root, p.file).toLowerCase()) || re.test(titleOf(p)?.text.toLowerCase() ?? ""));
    const provided: Record<string, boolean> = {
      navigation: pages.some((p) => p.els.some((e) => e.tag === "nav" || matches(e, "[role=navigation]"))),
      search: hasSearch(pages),
      sitemap: named(/site[- ]?map/),
      index: named(/\ba[- ]?(?:to|-)?[- ]?z\b|\ba-z\b/),
    };
    const have = Object.entries(provided).filter(([k, v]) => v && kinds.has(k)).map(([k]) => k);
    if (have.length >= Number(params.minWays)) return [];
    return [
      {
        file: root,
        line: 1,
        column: 1,
        data: { message: `The site offers ${have.length} way${have.length === 1 ? "" : "s"} to reach content${have.length ? ` (${have.join(", ")})` : ""}. It needs ${params.minWays}. Add ${[...kinds].filter((k) => !have.includes(k)).join(", or ")}.` },
      },
    ];
  },
  decide: message,
};
