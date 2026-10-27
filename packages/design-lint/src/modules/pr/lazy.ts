import type { Candidate, RuleModule } from "../../types.ts";
import fs from "node:fs";
import { isHtml } from "../../files.ts";
import { elements } from "../../html.ts";

/* PR-7e: images and frames below the fold load lazily. Source has no layout, so
   the first <img> or <iframe> in document order stands for the first viewport
   and the others count as below the fold. The rendered cross-check that would
   use foldViewports is not built. */

export const pr7e: RuleModule = {
  code: "PR-7e",
  surface: "source",
  locate({ files }) {
    const out: Candidate[] = [];
    for (const file of files.filter(isHtml)) {
      const media = elements(fs.readFileSync(file, "utf8")).filter((e) => e.tag === "img" || e.tag === "iframe");
      media.forEach((el, i) => {
        const lazy = el.attrs.loading?.toLowerCase() === "lazy";
        const above = i === 0;
        if (above && lazy) out.push({ file, line: el.line, column: el.column, data: { tag: el.tag, kind: "above-lazy" } });
        if (!above && !lazy) out.push({ file, line: el.line, column: el.column, data: { tag: el.tag, kind: "below-eager" } });
      });
    }
    return out;
  },
  decide(candidate) {
    const { tag, kind } = candidate.data as { tag: string; kind: string };
    return kind === "above-lazy"
      ? `The first <${tag}> is in the first viewport and has loading="lazy", which delays the largest paint. Remove loading="lazy".`
      : `This <${tag}> is below the first viewport and does not load lazily. Add loading="lazy".`;
  },
};
