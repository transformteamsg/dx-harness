import fs from "node:fs";
import path from "node:path";
import type { Finding, RuleMeta } from "../src/types.ts";

export const BASE = path.resolve(import.meta.dirname, "../../../plugins/dx-harness/standards/rules");

export interface Expected {
  file: string;
  line?: number;
  column?: number;
  /* The rule of the finding. Defaults to the code that compare receives. */
  code?: string;
}

/* How a finding compares to an expectation. A source or project finding names a
   file, which the tests make relative to the site root. A rendered finding names
   a page path, which stays as it is. */
function normalise(f: Finding, root: string, surface: string | undefined) {
  const file = surface === "rendered" ? f.file : path.relative(root, f.file) || ".";
  return { file, line: f.line, column: f.column, code: f.code };
}

/* Matches each expectation to one finding. An expectation without a line or a
   column matches any. Reports what is missing and what is left over. */
export function compare(findings: Finding[], root: string, rules: RuleMeta[], expected: Expected[], code?: string) {
  const surface = new Map(rules.map((r) => [r.code, r.surface]));
  const left = findings.map((f) => normalise(f, root, surface.get(f.code)));
  const missing: Expected[] = [];
  for (const e of expected) {
    const i = left.findIndex(
      (a) =>
        a.file === e.file &&
        ((e.code ?? code) === undefined || a.code === (e.code ?? code)) &&
        (e.line === undefined || a.line === e.line) &&
        (e.column === undefined || a.column === e.column),
    );
    if (i === -1) missing.push(e);
    else left.splice(i, 1);
  }
  return { missing, extra: left };
}

/* The code of each rule that has no fixture pair under dir, except the codes in
   exempt. A fixture pair is pass/, fail/, and expected.json. */
export function missingFixtures(rules: RuleMeta[], dir: string, exempt: string[] = []): string[] {
  const complete = (code: string) =>
    ["pass", "fail", "expected.json"].every((part) => fs.existsSync(path.join(dir, code, part)));
  return rules.map((r) => r.code).filter((code) => !exempt.includes(code) && !complete(code));
}
