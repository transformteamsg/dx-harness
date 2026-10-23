import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* The checks get the rules that apply from the resolution in checklib.py, the
   one the list command uses, so a design skill and a check agree on which
   rules apply. See issue #479. */

const ROOT = process.cwd();
const CHECKS = path.join(ROOT, "plugins/dx-harness/checks");

const read = (file: string) => fs.readFileSync(path.join(CHECKS, file), "utf8");

/* The ten checks that read the catalogue, named in the issue. */
const CHECKS_THAT_READ_RULES = [
  "a11y-eslint.py",
  "audit-record.py",
  "content-lint.py",
  "contrast.py",
  "detect.py",
  "reaudit-scope.py",
  "rendered-check.py",
  "structure-scan.py",
  "type-scan.py",
  "waiver-reconcile.py",
];

/* Contract item 1: skills and checks use the same resolution. */
describe("a check that reads which rules apply", () => {
  it("the list command resolves through checklib.resolve_rules", () => {
    const list = fs.readFileSync(path.join(ROOT, "plugins/dx-harness/scripts/in-scope-rules.py"), "utf8");
    expect(list).toMatch(/checklib\.resolve_rules\(/);
  });

  it("checklib's door for the checks resolves through resolve_rules", () => {
    const lib = read("checklib.py");
    const door = lib.match(/^def rules_that_apply\([\s\S]*?(?=^def |^class |^# ──)/m)?.[0];
    expect(door, "checklib.py has no rules_that_apply()").toBeDefined();
    expect(door).toMatch(/\bresolve_rules\(/);
  });

  it.each(CHECKS_THAT_READ_RULES)("%s gets its rules from the shared resolution", (file) => {
    const source = read(file);
    expect(source).toMatch(/checklib\.(rules_that_apply|rule_tiers|rule_categories)\(/);
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
