import { SEARCH_EXEMPT, hasSearch, readPages } from "../project.ts";
import type { RuleModule } from "../types.ts";

/* BD-2a: a multi-page site has a search form. */

export const bd2a: RuleModule = {
  code: "BD-2a",
  surface: "project",

  locate({ files, root, params }) {
    if (SEARCH_EXEMPT.includes(String(params.serviceType))) return [];
    const pages = readPages(files);
    if (pages.length < 2) return [];
    return [{ file: root, line: 1, column: 1, data: { found: hasSearch(pages) } }];
  },

  decide(candidate) {
    const { found } = candidate.data as { found: boolean };
    return found ? null : 'No search form. Add an element with role="search", or an <input type="search">.';
  },
};
