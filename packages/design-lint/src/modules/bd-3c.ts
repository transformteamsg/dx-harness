import { matches } from "../html.ts";
import { fileForPath, readPages } from "../project.ts";
import type { RuleModule } from "../types.ts";

/* BD-3c: the language switcher appears on each entry page. */

export const bd3c: RuleModule = {
  code: "BD-3c",
  surface: "project",

  locate({ files, root, params }) {
    const entries = params.entryPages as string[];
    const selector = String(params.switcherSelector);
    const pages = new Map(readPages(files).map((p) => [p.file, p]));
    return entries.map((pagePath) => {
      const file = fileForPath(root, pagePath);
      const page = file ? pages.get(file) : undefined;
      const found = page ? page.els.some((e) => matches(e, selector)) : false;
      return { file: file ?? root, line: 1, column: 1, data: { pagePath, found, exists: Boolean(page) } };
    });
  },

  decide(candidate) {
    const d = candidate.data as { pagePath: string; found: boolean; exists: boolean };
    if (!d.exists) return `The entry page ${d.pagePath} does not exist.`;
    return d.found ? null : `The entry page ${d.pagePath} has no language switcher.`;
  },
};
