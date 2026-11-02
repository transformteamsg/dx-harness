import { matches } from "../html.ts";
import { readPages, resolveHref } from "../project.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* BD-3a: at least two locales are declared, and a language switcher links to
   each one, with a target that resolves. */

const SWITCHER = "[hreflang], [data-language-switcher]";

export const bd3a: RuleModule = {
  code: "BD-3a",
  surface: "project",

  locate({ files, root, params }) {
    const locales = params.locales as string[];
    const out: Candidate[] = [];
    const at = (message: string, file = root, line = 1, column = 1): Candidate => ({
      file,
      line,
      column,
      data: { message },
    });
    if (locales.length < 2) return [at(`Only ${locales.length} locale is declared. Declare at least two in locales.`)];

    const pages = readPages(files);
    const linked = new Set<string>();
    let switcher = false;
    for (const page of pages) {
      for (const el of page.els) {
        if (matches(el, SWITCHER)) switcher = true;
        if (el.tag === "a" && el.attrs.hreflang) {
          linked.add(el.attrs.hreflang.toLowerCase());
          const where = resolveHref(root, page.file, el.attrs.href ?? "");
          if (!where.exists) {
            out.push(at(`The ${el.attrs.hreflang} language link goes to ${el.attrs.href}, which does not exist.`, page.file, el.line, el.column));
          }
        }
      }
    }
    if (!switcher) return [at("No language switcher. Add links with an hreflang attribute.")];
    for (const locale of locales) {
      if (!linked.has(locale.toLowerCase())) out.push(at(`No language link for ${locale}. Add a link with hreflang="${locale}".`));
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};
