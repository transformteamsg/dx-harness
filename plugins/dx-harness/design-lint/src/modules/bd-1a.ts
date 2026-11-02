import fs from "node:fs";
import { elements } from "../html.ts";
import { isHtml } from "../files.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* BD-1a: the viewport meta tag is present and does not block zoom. */

function readContent(content: string): Map<string, string> {
  const pairs = new Map<string, string>();
  for (const part of content.split(/[,;]/)) {
    const [key, value = ""] = part.split("=").map((s) => s.trim().toLowerCase());
    if (key) pairs.set(key, value);
  }
  return pairs;
}

export const bd1a: RuleModule = {
  code: "BD-1a",
  surface: "source",

  locate({ files }) {
    const out: Candidate[] = [];
    for (const file of files.filter(isHtml)) {
      const els = elements(fs.readFileSync(file, "utf8"));
      const meta = els.find((e) => e.tag === "meta" && e.attrs.name?.toLowerCase() === "viewport");
      /* A page with no tag is reported at its head, so the author sees where to add it. */
      const anchor = meta ?? els.find((e) => e.tag === "head") ?? els.find((e) => e.tag === "html");
      out.push({
        file,
        line: anchor?.line ?? 1,
        column: anchor?.column ?? 1,
        data: { content: meta ? (meta.attrs.content ?? "") : null },
      });
    }
    return out;
  },

  decide(candidate) {
    const { content } = candidate.data as { content: string | null };
    if (content === null) {
      return 'No viewport meta tag. Add <meta name="viewport" content="width=device-width, initial-scale=1">.';
    }
    const pairs = readContent(content);
    const scalable = pairs.get("user-scalable");
    if (scalable === "no" || scalable === "0") {
      return "The viewport meta tag blocks zoom with user-scalable=no. Remove it.";
    }
    const max = Number.parseFloat(pairs.get("maximum-scale") ?? "");
    if (!Number.isNaN(max) && max < 2) {
      return `The viewport meta tag limits zoom with maximum-scale=${max}. Set it to 2 or more, or remove it.`;
    }
    return null;
  },
};
