import { readPages } from "../../project.ts";
import type { Candidate, Params, RuleModule } from "../../types.ts";
import { hostOf } from "./shared.ts";

/* TL-1a: the service uses an official domain. The host of productUrl is the
   check of the rule file. The module also checks the host of each canonical
   link, because a project check needs an input that a file can carry, and a
   page that declares another domain contradicts productUrl. A relative
   canonical link has no host and is skipped. */

const suffixes = (params: Params): string[] => {
  const list = [String(params.agencySuffix)];
  if (params.institutionType === "education") list.push(String(params.educationSuffix));
  return list;
};

export const tl1a: RuleModule = {
  code: "TL-1a",
  surface: "project",

  locate({ files, root, params }) {
    const out: Candidate[] = [
      { file: root, line: 1, column: 1, data: { kind: "product", url: String(params.productUrl), host: hostOf(params.productUrl) } },
    ];
    for (const page of readPages(files)) {
      for (const el of page.els) {
        const isCanonical = el.tag === "link" && (el.attrs.rel ?? "").toLowerCase().split(/\s+/).includes("canonical");
        const host = isCanonical ? hostOf(el.attrs.href) : null;
        if (host) out.push({ file: page.file, line: el.line, column: el.column, data: { kind: "canonical", url: el.attrs.href, host } });
      }
    }
    return out;
  },

  decide(candidate, params) {
    const { kind, url, host } = candidate.data as { kind: string; url: string; host: string | null };
    const type = params.institutionType;
    if (type !== "agency" && type !== "education") return `institutionType "${String(type)}" is not agency or education.`;
    if (host === null) return `productUrl "${url}" is not an absolute URL.`;
    const allowed = suffixes(params);
    if (allowed.some((s) => host.endsWith(s))) return null;
    const what = kind === "product" ? "productUrl" : "The canonical link";
    return `${what} host ${host} does not end with ${allowed.join(" or ")}. Use an official domain.`;
  },
};
