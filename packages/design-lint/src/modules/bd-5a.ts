import { isHtml } from "../files.ts";
import { readPages } from "../project.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* BD-5a: title, meta description, and canonical link are present and within
   length. One candidate for each issue, so each message is exact. */

const EXEMPT_AUDIENCES = ["restricted", "beta"];

export const bd5a: RuleModule = {
  code: "BD-5a",
  surface: "source",

  locate({ files, params }) {
    if (EXEMPT_AUDIENCES.includes(String(params.audience))) return [];
    const [minTitle, maxTitle] = params.titleLength as [number, number];
    const [minDesc, maxDesc] = params.descriptionLength as [number, number];
    const out: Candidate[] = [];
    for (const page of readPages(files.filter(isHtml))) {
      const head = page.els.find((e) => e.tag === "head") ?? page.els.find((e) => e.tag === "html");
      const at = (message: string, line = head?.line ?? 1, column = head?.column ?? 1): Candidate => ({
        file: page.file,
        line,
        column,
        data: { message },
      });

      const title = page.els.find((e) => e.tag === "title");
      const titleText = title?.text.trim() ?? "";
      if (!title || titleText === "") out.push(at("No title. Add a <title> element."));
      else if (titleText.length < minTitle || titleText.length > maxTitle) {
        out.push(at(`The title is ${titleText.length} characters. Keep it between ${minTitle} and ${maxTitle}.`, title.line, title.column));
      }

      const desc = page.els.find((e) => e.tag === "meta" && e.attrs.name?.toLowerCase() === "description");
      const descText = desc?.attrs.content?.trim() ?? "";
      if (!desc || descText === "") out.push(at('No meta description. Add <meta name="description" content="...">.'));
      else if (descText.length < minDesc || descText.length > maxDesc) {
        out.push(at(`The meta description is ${descText.length} characters. Keep it between ${minDesc} and ${maxDesc}.`, desc.line, desc.column));
      }

      const canonical = page.els.find((e) => e.tag === "link" && e.attrs.rel?.toLowerCase().split(/\s+/).includes("canonical"));
      if (!canonical) out.push(at('No canonical link. Add <link rel="canonical" href="...">.'));
    }
    return out;
  },

  decide(candidate) {
    return (candidate.data as { message: string }).message;
  },
};
