import fs from "node:fs";
import { elements, matches } from "../../html.ts";
import { fileForPath } from "../../project.ts";
import type { Candidate, RuleModule } from "../../types.ts";

/* The rules that check one page of the product from the project: TX-8a and
   TX-15a. The selectors are one compound selector or a comma list, with no
   combinator (see src/html.ts). A page that a script builds after load shows
   its elements only in a rendered check, which these rules do not make. */

interface Facts {
  missingPage: string | null;
  /* One entry for each selector: whether any element matches. */
  hits: Record<string, boolean>;
}

function inspect(root: string, page: string, selectors: Record<string, string>): Candidate {
  const file = fileForPath(root, page);
  if (!file) return { file: root, line: 1, column: 1, data: { missingPage: page, hits: {} } satisfies Facts };
  const els = elements(fs.readFileSync(file, "utf8"));
  const hits = Object.fromEntries(Object.entries(selectors).map(([name, sel]) => [name, els.some((e) => matches(e, sel))]));
  const at = els.find((e) => e.tag === "main") ?? els[0];
  return { file, line: at?.line ?? 1, column: at?.column ?? 1, data: { missingPage: null, hits } satisfies Facts };
}

function verdict(candidate: Candidate, what: string, labels: Record<string, string>): string | null {
  const { missingPage, hits } = candidate.data as Facts;
  if (missingPage) return `The page ${missingPage} does not exist. Add the page where users ${what}.`;
  const missing = Object.entries(labels).filter(([name]) => !hits[name]).map(([, label]) => label);
  return missing.length > 0 ? `The page has no ${missing.join(" and no ")}.` : null;
}

/* TX-8a: applies when the product stores payment details. */
export const tx8a: RuleModule = {
  code: "TX-8a",
  surface: "project",

  locate({ root, params }) {
    if (params.storesPaymentDetails !== true) return [];
    return [inspect(root, String(params.managePage), { update: String(params.updateSelector), remove: String(params.removeSelector) })];
  },

  decide: (candidate) => verdict(candidate, "update and remove stored payment details", { update: "control to update payment details", remove: "control to remove payment details" }),
};

/* TX-15a: applies when the outcome is not immediate. */
export const tx15a: RuleModule = {
  code: "TX-15a",
  surface: "project",

  locate({ root, params }) {
    if (params.outcomeImmediate !== false) return [];
    return [inspect(root, String(params.trackingPage), { label: String(params.statusSelector), description: String(params.statusDescriptionSelector) })];
  },

  decide: (candidate) => verdict(candidate, "track the status of a transaction", { label: "status label", description: "status description" }),
};
