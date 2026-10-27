import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadRules, parseRuleFile } from "../src/rules/load.ts";

const BASE = path.resolve(import.meta.dirname, "../../../plugins/dx-harness/skills/design-restructure/base");

describe("loadRules on the base layer", () => {
  const { rules, errors } = loadRules(BASE);

  it("reads every rule file with no error", () => {
    expect(errors).toEqual([]);
    expect(rules.length).toBeGreaterThan(100);
  });

  it("gives each rule a unique code that matches its file name", () => {
    const codes = rules.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const r of rules) expect(path.basename(r.file, ".md")).toBe(r.code);
  });

  it("points each judgedRemainder at a code of the DSS format", () => {
    for (const r of rules) for (const j of r.judgedRemainder) expect(j).toMatch(/^[A-Z]{2}-\d+[a-z]$/);
  });
});

describe("parseRuleFile", () => {
  const valid = `---
code: XX-1a
dss: XX-1
tier: L1
check: lint
surface: source
engine: custom
parameters:
  limit: 5
---

# XX-1a: a title
`;

  it("parses a valid rule", () => {
    const rule = parseRuleFile(valid, "XX-1a.md");
    expect(Array.isArray(rule)).toBe(false);
    expect(rule).toMatchObject({ code: "XX-1a", tier: "L1", title: "a title", parameters: { limit: 5 } });
  });

  it("reports a code that does not match the file name", () => {
    expect(parseRuleFile(valid, "XX-1b.md")).toEqual([expect.stringContaining("does not match the file name")]);
  });

  it("reports a judged rule, which has no file", () => {
    const judged = valid.replace("check: lint", "check: judged");
    expect(parseRuleFile(judged, "XX-1a.md")).toEqual([expect.stringContaining("only a lint rule has a file")]);
  });

  it("reports a file with no frontmatter", () => {
    expect(parseRuleFile("# XX-1a: a title\n", "XX-1a.md")).toEqual(["XX-1a.md: no frontmatter"]);
  });
});

describe("loadRules on a directory with a duplicate code", () => {
  it("reports the second file", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-"));
    const text = "---\ncode: XX-1a\ndss: XX-1\ntier: L1\ncheck: lint\nsurface: source\nengine: custom\nparameters: {}\n---\n";
    fs.mkdirSync(path.join(dir, "a"));
    fs.mkdirSync(path.join(dir, "b"));
    fs.writeFileSync(path.join(dir, "a", "XX-1a.md"), text);
    fs.writeFileSync(path.join(dir, "b", "XX-1a.md"), text);
    const { rules, errors } = loadRules(dir);
    expect(rules).toHaveLength(1);
    expect(errors).toEqual([expect.stringContaining("is also in")]);
  });
});
