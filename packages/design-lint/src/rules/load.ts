import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { RuleMeta, Surface, Tier } from "../types.ts";

/* The category prefixes of ADR-0002: the nine of the DSS, then the eight of the catalogue. */
const PREFIXES = ["BD", "WP", "WO", "WU", "WR", "PR", "TX", "TL", "UU", "A11Y", "TOK", "COL", "TYP", "CMP", "CNT", "LAY", "MOT"];
const RULE_FILE = new RegExp(`^(?:${PREFIXES.join("|")})-\\d+[a-z]\\.md$`);
/* A category folder also holds these. They are not rules. */
const CATEGORY_DOCS = new Set(["README.md", "MAPPING.md"]);
const TIERS: Tier[] = ["L0", "L1", "L2"];
const SURFACES: Surface[] = ["source", "rendered", "project"];

export interface LoadResult {
  rules: RuleMeta[];
  errors: string[];
}

function asList(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]).map(String);
}

/* Returns the rule, or the list of problems with the file. */
export function parseRuleFile(text: string, file: string): RuleMeta | string[] {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) return [`${file}: no frontmatter`];
  const fm = parse(match[1]) as Record<string, unknown> | null;
  if (!fm || typeof fm !== "object") return [`${file}: frontmatter is not a map`];

  const errors: string[] = [];
  const expected = path.basename(file, ".md");
  if (fm.code !== expected) errors.push(`${file}: code "${String(fm.code)}" does not match the file name`);
  if (typeof fm.dss !== "string") errors.push(`${file}: dss is missing`);
  if (!TIERS.includes(fm.tier as Tier)) errors.push(`${file}: tier "${String(fm.tier)}" is not L0, L1, or L2`);
  if (fm.check !== "lint") errors.push(`${file}: check is "${String(fm.check)}", and only a lint rule has a file`);
  if (!SURFACES.includes(fm.surface as Surface)) errors.push(`${file}: surface "${String(fm.surface)}" is not valid`);
  if (typeof fm.engine !== "string") errors.push(`${file}: engine is missing`);
  if (!fm.parameters || typeof fm.parameters !== "object" || Array.isArray(fm.parameters)) {
    errors.push(`${file}: parameters is not a map`);
  }
  if (errors.length > 0) return errors;

  const heading = /^# [A-Z][A-Z0-9]+-\d+[a-z]: (.+)$/m.exec(text);
  return {
    code: fm.code as string,
    dss: fm.dss as string,
    tier: fm.tier as Tier,
    surface: fm.surface as Surface,
    engine: fm.engine as string,
    judgedRemainder: asList(fm.judgedRemainder),
    redirects: asList(fm.redirects),
    parameters: fm.parameters as Record<string, unknown>,
    title: heading ? heading[1] : (fm.code as string),
    file,
  };
}

/* Collects the rule files, and reports each other markdown file that is not a
   category document, so that a misnamed rule is not skipped without a word. */
function walk(dir: string, errors: string[]): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, errors);
    if (RULE_FILE.test(entry.name)) return [full];
    if (entry.name.endsWith(".md") && !CATEGORY_DOCS.has(entry.name)) {
      errors.push(`${full}: the name is not a rule code with a prefix of ${PREFIXES.join(", ")}`);
    }
    return [];
  });
}

export function loadRules(dir: string): LoadResult {
  const rules: RuleMeta[] = [];
  const errors: string[] = [];
  const seen = new Map<string, string>();
  for (const file of walk(dir, errors).sort()) {
    const result = parseRuleFile(fs.readFileSync(file, "utf8"), file);
    if (Array.isArray(result)) {
      errors.push(...result);
      continue;
    }
    const earlier = seen.get(result.code);
    if (earlier) {
      errors.push(`${file}: code ${result.code} is also in ${earlier}`);
      continue;
    }
    seen.set(result.code, file);
    rules.push(result);
  }
  return { rules, errors };
}
