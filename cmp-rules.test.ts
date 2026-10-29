import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* The generic CMP controls of catalog.yaml become base rules in
   standards/rules/cmp/. See issue #546. */

const ROOT = process.cwd();
const RULES = path.join(ROOT, "plugins/dx-harness/standards/rules");
const CMP = path.join(RULES, "cmp");
const FIXTURES = path.join(ROOT, "packages/design-lint/fixtures");
const PATCHES = path.join(ROOT, "packages/design-lint/demo/patches");

const MOVED = ["CMP-2", "CMP-3", "CMP-4", "CMP-5", "CMP-6", "CMP-8", "CMP-10", "CMP-11"];
const HYBRID = ["CMP-2", "CMP-3", "CMP-5", "CMP-6", "CMP-10"];

const read = (file: string) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "");

function frontmatter(file: string): Record<string, unknown> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(read(file));
  return match ? ((parse(match[1]) as Record<string, unknown> | null) ?? {}) : {};
}

const lintRules = fs.existsSync(CMP)
  ? fs
      .readdirSync(CMP)
      .filter((f) => f.endsWith(".md") && !["README.md", "MAPPING.md"].includes(f))
      .map((f) => ({ file: f, fm: frontmatter(path.join(CMP, f)) }))
  : [];
const lintCodes = new Map(lintRules.map((r) => [String(r.fm.code), r]));

/* The judged rules have no file. MAPPING.md lists each one in a row whose
   Check column is "judged". */
const judgedCodes = new Set(
  read(path.join(CMP, "MAPPING.md"))
    .split("\n")
    .filter((line) => /\|\s*judged\s*\|/.test(line))
    .flatMap((line) => [.../`(CMP-\d+[a-z])`/.exec(line) ?? []].slice(1)),
);

const redirects = (parse(read(path.join(RULES, "redirects.yaml"))) ?? {}) as {
  codes?: Record<string, string[]>;
  notMoved?: Record<string, string>;
};
const codes = redirects.codes ?? {};

describe("1. each control becomes rules, and redirects.yaml maps it to them", () => {
  it.each(MOVED)("maps %s to one or more rules of the base format", (control) => {
    const list = codes[control];
    expect(list, `no codes entry for ${control}`).toBeDefined();
    expect(list.length).toBeGreaterThan(0);
    for (const code of list) expect(code).toMatch(new RegExp(`^${control}[a-z]$`));
  });

  it.each(MOVED)("resolves each rule of %s to a lint file for that control or a judged rule", (control) => {
    for (const code of codes[control] ?? []) {
      const lint = lintCodes.get(code);
      if (lint) {
        expect(lint.fm.check).toBe("lint");
        expect(lint.fm.dss).toBe(control);
      } else {
        expect(judgedCodes.has(code), `${code} is neither a lint file nor a judged row in MAPPING.md`).toBe(true);
      }
    }
  });

  it("lists every rule file and every judged rule under its control", () => {
    const mapped = Object.values(codes).flat();
    for (const code of [...lintCodes.keys(), ...judgedCodes]) expect(mapped).toContain(code);
  });

  it("records the decision not to move CMP-9, and gives it no rule", () => {
    expect(redirects.notMoved?.["CMP-9"], "no notMoved entry for CMP-9").toMatch(/\S/);
    expect(codes["CMP-9"]).toBeUndefined();
    expect(read(path.join(CMP, "README.md"))).toMatch(/CMP-9/);
  });

  it("writes CMP-10a as a lint rule at tier L2, because the control is proposed", () => {
    expect(lintCodes.get("CMP-10a")?.fm.tier).toBe("L2");
  });
});

