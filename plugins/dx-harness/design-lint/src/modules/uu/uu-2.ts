import fs from "node:fs";
import path from "node:path";
import type { Candidate, RuleModule } from "../../types.ts";

/* UU-2d: a findings report exists at findingsReportPath and each finding has a
   severity from the scale. The report is JSON (a list, or an object with a
   "findings" list), or Markdown, where each level-3 heading is a finding and a
   line "severity: value" in its section carries the severity. The check tests
   structure, not judgment. */

interface Finding {
  title: string;
  line: number;
  severity: string | null;
}

function parseJson(text: string, field: string): Finding[] | null {
  try {
    const json = JSON.parse(text);
    const list: unknown = Array.isArray(json) ? json : (json as { findings?: unknown })?.findings;
    if (!Array.isArray(list)) return null;
    return list.map((f, i) => {
      const v = (f as Record<string, unknown>)?.[field];
      return { title: String((f as { title?: unknown })?.title ?? `finding ${i + 1}`), line: 1, severity: typeof v === "string" ? v : null };
    });
  } catch {
    return null;
  }
}

function parseMarkdown(text: string, field: string): Finding[] {
  const lines = text.split(/\r?\n/);
  const out: Finding[] = [];
  const re = new RegExp(`^\\s*(?:[-*]\\s*)?\\**${field}\\**\\s*:\\s*\\**\`?([^*\`]+?)\`?\\**\\s*$`, "i");
  let current: Finding | null = null;
  lines.forEach((l, i) => {
    const h = /^(#{1,6})\s+(.*)$/.exec(l);
    if (h && h[1].length <= 3) {
      current = h[1].length === 3 ? { title: h[2].trim(), line: i + 1, severity: null } : null;
      if (current) out.push(current);
    } else if (current && current.severity === null) {
      const m = re.exec(l);
      if (m) current.severity = m[1].trim();
    }
  });
  return out;
}

export const uu2d: RuleModule = {
  code: "UU-2d",
  surface: "project",

  locate({ root, params }) {
    const file = path.join(root, String(params.findingsReportPath));
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      return [{ file: root, line: 1, column: 1, data: { kind: "missing" } }];
    }
    const text = fs.readFileSync(file, "utf8");
    const field = String(params.severityField);
    const findings = file.toLowerCase().endsWith(".json") ? parseJson(text, field) : parseMarkdown(text, field);
    if (findings === null) return [{ file, line: 1, column: 1, data: { kind: "unreadable" } }];
    if (findings.length === 0) return [{ file, line: 1, column: 1, data: { kind: "none" } }];
    const out: Candidate[] = findings.map((f) => ({ file, line: f.line, column: 1, data: { kind: "finding", ...f } }));
    return out;
  },

  decide(candidate, params) {
    const d = candidate.data as { kind: string; title: string; severity: string | null };
    const where = String(params.findingsReportPath);
    if (d.kind === "missing") return `No findings report at ${where}. Add one.`;
    if (d.kind === "unreadable") return `${where} is not a list of findings.`;
    if (d.kind === "none") return `${where} holds no findings.`;
    const scale = (params.severityScale as string[]).map((s) => String(s).toLowerCase());
    if (d.severity === null) return `The finding "${d.title}" has no ${String(params.severityField)}.`;
    return scale.includes(d.severity.toLowerCase()) ? null : `The finding "${d.title}" has severity "${d.severity}", which is not one of ${scale.join(", ")}.`;
  },
};
