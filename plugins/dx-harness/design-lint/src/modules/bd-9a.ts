import fs from "node:fs";
import { elements } from "../html.ts";
import { isHtml } from "../files.ts";
import type { Candidate, RuleModule } from "../types.ts";

/* BD-9a: at least one contact channel exists. A project rule: one verdict for
   the whole site. */

type Finder = (tag: string, attrs: Record<string, string>, text: string) => boolean;

const CHANNELS: Record<string, Finder> = {
  "mailto:": (tag, a) => tag === "a" && /^mailto:/i.test(a.href ?? ""),
  "tel:": (tag, a) => tag === "a" && /^tel:/i.test(a.href ?? ""),
  "contact page": (tag, a, text) =>
    tag === "a" && (/contact/i.test(a.href ?? "") || /^\s*contact( us)?\s*$/i.test(text)),
  "contact form": (tag, a) => tag === "form" && (/contact/i.test(a.action ?? "") || "data-contact-form" in a),
};

export const bd9a: RuleModule = {
  code: "BD-9a",
  surface: "project",

  locate({ files, root, params }) {
    const wanted = (params.channels as string[]).filter((c) => c in CHANNELS);
    const found = new Set<string>();
    for (const file of files.filter(isHtml)) {
      for (const el of elements(fs.readFileSync(file, "utf8"))) {
        for (const channel of wanted) {
          if (CHANNELS[channel](el.tag, el.attrs, el.text)) found.add(channel);
        }
      }
    }
    const candidate: Candidate = {
      file: root,
      line: 1,
      column: 1,
      data: { found: [...found], accepted: params.channels },
    };
    return [candidate];
  },

  decide(candidate) {
    const { found, accepted } = candidate.data as { found: string[]; accepted: string[] };
    if (found.length > 0) return null;
    return `No contact channel found. Add one of: ${accepted.join(", ")}.`;
  },
};
