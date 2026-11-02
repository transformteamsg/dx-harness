import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

/* The checks get the rules that apply from the resolution in checklib.py, the
   one the list command uses, so a design skill and a check agree on which
   rules apply. See issue #479. */

const ROOT = process.cwd();
const CHECKS = path.join(ROOT, "plugins/dx-harness/checks");

const read = (file: string) => fs.readFileSync(path.join(CHECKS, file), "utf8");

/* The checks that read the catalogue. */
const CHECKS_THAT_READ_RULES = [
  "audit-record.py",
  "detect.py",
  "reaudit-scope.py",
  "rendered-check.py",
  "type-scan.py",
  "waiver-reconcile.py",
];

/* Contract item 1: skills and checks use the same resolution. The list command
   also lists the base rules (#537), and it scopes the catalogue controls with
   the resolution that the checks use. */
describe("a check that reads which rules apply", () => {
  it("the list command resolves through checklib", () => {
    const list = fs.readFileSync(path.join(ROOT, "plugins/dx-harness/scripts/in-scope-rules.py"), "utf8");
    expect(list).toMatch(/checklib\.resolve_in_scope\(/);
  });

  it("the list scopes the catalogue controls through resolve_rules", () => {
    const lib = read("checklib.py");
    const scope = lib.match(/^def resolve_in_scope\([\s\S]*?(?=^def |^class |^# ──)/m)?.[0];
    expect(scope, "checklib.py has no resolve_in_scope()").toBeDefined();
    expect(scope).toMatch(/\bresolve_rules\(/);
  });

  it("checklib's door for the checks resolves through resolve_rules", () => {
    const lib = read("checklib.py");
    const door = lib.match(/^def rules_that_apply\([\s\S]*?(?=^def |^class |^# ──)/m)?.[0];
    expect(door, "checklib.py has no rules_that_apply()").toBeDefined();
    expect(door).toMatch(/\bresolve_rules\(/);
  });

  it.each(CHECKS_THAT_READ_RULES)("%s gets its rules from the shared resolution", (file) => {
    const source = read(file);
    expect(source).toMatch(/checklib\.(rules_that_apply|rule_tiers|base_rule_tiers|rule_categories)\(/);
  });

  it.each(CHECKS_THAT_READ_RULES)("%s has no catalogue reader of its own", (file) => {
    const source = read(file);
    expect(source, "opens the catalogue path itself").not.toMatch(/CATALOG_PATH/);
    expect(source, "parses the catalogue with yaml").not.toMatch(/yaml\.safe_load/);
    expect(source, "reads tiers outside the resolution").not.toMatch(/catalog_tiers\(/);
    expect(source, "reads controls outside the resolution").not.toMatch(/catalog_controls\(/);
  });

  it("detect.py keeps no hand-written copy of the L0 set", () => {
    expect(read("detect.py")).not.toMatch(/L0_CONTROL_IDS\s*=\s*frozenset\(\{/);
  });
});

/* Contract item 2: an unreadable catalogue stops the check. Each check runs
   from a copy of checks/ with no standards/ beside it, so the catalogue
   cannot be read. */
describe("a check whose catalogue cannot be read", () => {
  let work = "";
  let checks = "";

  beforeAll(() => {
    work = fs.mkdtempSync(path.join(os.tmpdir(), "check-rule-resolution-"));
    checks = path.join(work, "checks");
    fs.cpSync(CHECKS, checks, { recursive: true });
    fs.writeFileSync(path.join(work, "page.tsx"), "export const Page = () => <p>Hello</p>;\n");
    fs.mkdirSync(path.join(work, "docs", "decisions"), { recursive: true });
    fs.writeFileSync(path.join(work, "docs", "decisions", "0001-page.md"),
      "# 0001 page\n\n## Controls in scope\n\nA11Y-2, TOK-1.\n\n## Verify verdict\n\n" +
      "| Control | Method | Evidence |\n| --- | --- | --- |\n| A11Y-2 | unverified | |\n");
  });

  function run(file: string, ...args: string[]) {
    const env = { ...process.env, PATH: `${path.join(ROOT, "node_modules/.bin")}${path.delimiter}${process.env.PATH}` };
    const result = spawnSync("python3", [path.join(checks, file), ...args.map((a) => a.replace("<work>", work))],
      { cwd: work, encoding: "utf8", env, timeout: 60_000 });
    return { status: result.status, out: `${result.stdout ?? ""}${result.stderr ?? ""}` };
  }

  const cases: [string, string[]][] = [
    ["audit-record.py", ["--repo-root", "<work>", "<work>/docs/decisions/0001-page.md"]],
    ["detect.py", ["<work>/page.tsx"]],
    ["reaudit-scope.py", ["--repo-root", "<work>", "A11Y-2"]],
    ["rendered-check.py", []],
    ["type-scan.py", ["<work>/page.tsx"]],
    ["waiver-reconcile.py", ["--repo-root", "<work>", "--src", "<work>/page.tsx"]],
  ];

  it.each(cases)("%s says it could not resolve the rules", (file, args) => {
    const result = run(file, ...args);
    expect(result.out).toMatch(/ERROR [\w-]+: could not resolve the rules that apply/);
  });

  it.each(cases)("%s never guesses a tier and reports nothing as passed", (file, args) => {
    const result = run(file, ...args);
    expect(result.status, result.out).not.toBe(0);
    expect(result.out, "fell back to an embedded copy").not.toMatch(/embedded|fallback/i);
    expect(result.out, "crashed instead of saying why").not.toMatch(/Traceback/);
    expect(result.out, "reported a pass").not.toMatch(/^OK\b|passed/m);
  });
});
