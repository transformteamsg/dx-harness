import type { Finding, Note, RuleMeta, Tier } from "./types.ts";

/* A finding about a rendered element names the page and the element. A
   rendered finding about the whole page has line 0 and column 0, and names the
   page only. Any other finding names a file, a line, and a column. */
export function formatFinding(f: Finding): string {
  const page = f.line === 0 && f.column === 0;
  const at = f.element ? `${f.file} ${f.element.name}` : page ? f.file : `${f.file}:${f.line}:${f.column}`;
  return `${at}: ${f.code} [${f.tier}] ${f.message}`;
}

const KIND: Record<Note["kind"], string> = {
  "not-configured": "not configured",
  "not-run": "not run",
  "no-module": "has no linter module yet",
  skipped: "is L0 and still runs. It skipped these preset lines",
};

export function formatNote(n: Note): string {
  const detail = n.detail.length > 0 ? `: ${n.detail.join(", ")}` : "";
  return `note: ${n.code} ${KIND[n.kind]}${detail}`;
}

/* Exit 1 when an L0 or L1 rule found a violation, or has no verdict. An L2
   finding or note only warns. A rule that did not run blocks at every tier,
   because a check that did not run does not pass. A skipped note does not
   count, because the rule still ran. A tool failure exits 2 before this runs. */
export function exitCode(findings: Finding[], notes: Note[], tiers: Map<string, Tier>): 0 | 1 {
  const blocks = (tier: Tier | undefined) => tier !== "L2";
  if (findings.some((f) => f.notRun || blocks(f.tier))) return 1;
  const noVerdict = (n: Note) => n.kind !== "no-module" && n.kind !== "skipped";
  if (notes.some((n) => n.kind === "not-run" || (noVerdict(n) && blocks(tiers.get(n.code))))) return 1;
  return 0;
}

/* One summary of the rules that need configuration, grouped by rule. The advice
   follows the count on the first line. */
export function summariseUnset(
  notes: Note[],
  rules: RuleMeta[],
  advice = "Run design-lint init, or set these values:",
): string[] {
  const missing = notes.filter((n) => n.kind === "not-configured");
  if (missing.length === 0) return [];
  const known = new Set(rules.map((r) => r.code));
  const noun = missing.length === 1 ? "rule needs" : "rules need";
  const lines = [`${missing.length} ${noun} configuration. ${advice}`];
  const shown = missing.filter((m) => known.has(m.code));
  const width = Math.max(8, ...shown.map((n) => n.code.length + 1));
  for (const n of shown) {
    lines.push(`  ${n.code.padEnd(width)}${n.detail.join(", ")}`);
  }
  return lines;
}
