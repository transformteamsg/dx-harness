import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* The typography controls of catalog.yaml become base rules in
   standards/rules/typ/. LAY-4 states the measure of TYP-6 a second time, so it
   does not move and redirects to the TYP-6 rules. See issue #545. */

const ROOT = process.cwd();
const RULES = path.join(ROOT, "plugins/dx-harness/standards/rules");
const TYP = path.join(RULES, "typ");
const FIXTURES = path.join(ROOT, "packages/design-lint/fixtures");
const CONTROLS = ["TYP-2", "TYP-4", "TYP-5", "TYP-6"];
/* The catalogue check of each hybrid control. */
const HYBRID = ["TYP-5", "TYP-6"];

const read = (file: string) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "");

function frontmatter(file: string): Record<string, unknown> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(read(file));
  return match ? ((parse(match[1]) as Record<string, unknown> | null) ?? {}) : {};
}

/* The lint rules: one file each, keyed by code. */
const lintRules = new Map<string, Record<string, unknown>>(
  (fs.existsSync(TYP) ? fs.readdirSync(TYP) : [])
    .filter((f) => f.endsWith(".md") && !["README.md", "MAPPING.md"].includes(f))
    .map((f) => frontmatter(path.join(TYP, f)))
    .map((fm) => [String(fm.code), fm]),
);

/* The judged rules have no file. MAPPING.md lists each in a row whose check is judged. */
const judged = new Set(
  read(path.join(TYP, "MAPPING.md"))
    .split("\n")
    .filter((line) => /\|\s*judged\s*\|/.test(line))
    .flatMap((line) => [...line.matchAll(/`(TYP-\d+[a-z])`/g)].map((m) => m[1])),
);

const redirects = (parse(read(path.join(RULES, "redirects.yaml"))) ?? {}) as { codes?: Record<string, unknown> };
const codesOf = (control: string): string[] => {
  const target = redirects.codes?.[control];
  return Array.isArray(target) ? target.map(String) : [];
};

describe("1. a typography control becomes rules, and redirects.yaml maps it", () => {
  it.each(CONTROLS)("redirects.yaml maps %s to one or more rules", (control) => {
    expect(codesOf(control), `no codes entry for ${control}`).not.toEqual([]);
  });

  it.each(CONTROLS)("each rule of %s has a base code and a check of lint or judged", (control) => {
    expect(codesOf(control), `no codes entry for ${control}`).not.toEqual([]);
    for (const code of codesOf(control)) {
      expect(code).toMatch(new RegExp(`^${control}[a-z]$`));
      const lint = lintRules.get(code);
      if (lint) {
        expect(lint.check, `${code} check`).toBe("lint");
        expect(lint.dss, `${code} dss`).toBe(control);
      } else {
        expect(judged.has(code), `${code} is neither a lint rule file nor a judged row of MAPPING.md`).toBe(true);
      }
    }
  });

  it("maps LAY-4 to the rules of TYP-6, because TYP-6 moves and LAY-4 does not", () => {
    expect(codesOf("LAY-4")).not.toEqual([]);
    expect(codesOf("LAY-4")).toEqual(codesOf("TYP-6"));
  });

  it("lists every rule of the folder under the control that it comes from", () => {
    const mapped = CONTROLS.flatMap(codesOf).sort();
    expect(mapped).not.toEqual([]);
    expect([...lintRules.keys(), ...judged].sort()).toEqual(mapped);
  });
});

describe("2. each new lint rule has a fixture pair", () => {
  it("has lint rules", () => {
    expect([...lintRules.keys()]).not.toEqual([]);
  });

  it.each([...lintRules.keys()])("%s has a passing site, a failing site, and the expected findings", (code) => {
    for (const part of ["pass", "fail", "expected.json"]) {
      expect(fs.existsSync(path.join(FIXTURES, code, part)), `${code}: no ${part}`).toBe(true);
    }
  });
});

describe("also true when done", () => {
  it.each(HYBRID)("the lint rule of the hybrid control %s names its judged rule in judgedRemainder", (control) => {
    const lint = codesOf(control).filter((code) => lintRules.has(code));
    expect(lint, `${control} has no lint rule`).not.toEqual([]);
    for (const code of lint) {
      const remainder = lintRules.get(code)!.judgedRemainder;
      const list = Array.isArray(remainder) ? remainder.map(String) : remainder ? [String(remainder)] : [];
      expect(list, `${code} names no judged rule`).not.toEqual([]);
      for (const j of list) expect(judged.has(j), `${code} names ${j}, which is not a judged rule`).toBe(true);
    }
  });

  it("names no teacher where it means any user", () => {
    const files = fs.existsSync(TYP) ? fs.readdirSync(TYP).map((f) => path.join(TYP, f)) : [];
    expect(files).not.toEqual([]);
    const named = files.filter((f) => /teacher/i.test(read(f))).map((f) => path.basename(f));
    expect(named).toEqual([]);
  });
});
