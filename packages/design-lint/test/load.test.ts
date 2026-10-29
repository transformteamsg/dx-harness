import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadRules, parseRuleFile } from "../src/rules/load.ts";
import { BASE } from "./helpers.ts";


describe("loadRules on the base layer", () => {
  const { rules, errors } = fs.existsSync(BASE) ? loadRules(BASE) : { rules: [], errors: [`no rules folder at ${BASE}`] };

  it("reads every rule file with no error", () => {
    expect(errors).toEqual([]);
    expect(rules.length).toBeGreaterThan(100);
  });

  it("reads all 158 lint rules", () => {
    expect(rules).toHaveLength(158);
  });

  it("gives each rule a unique code, and a file named by its slug in the folder of its prefix", () => {
    const codes = rules.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const r of rules) {
      expect(path.basename(r.file, ".md")).toBe(r.slug);
      expect(path.basename(path.dirname(r.file))).toBe(r.code.split("-")[0].toLowerCase());
    }
  });

  it("points each judgedRemainder at a code of the DSS format", () => {
    for (const r of rules) for (const j of r.judgedRemainder) expect(j).toMatch(/^[A-Z]{2}-\d+[a-z]$/);
  });
});

describe("parseRuleFile", () => {
  const valid = `---
code: XX-1a
slug: a-title
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
    const rule = parseRuleFile(valid, "a-title.md");
    expect(Array.isArray(rule)).toBe(false);
    expect(rule).toMatchObject({ code: "XX-1a", slug: "a-title", tier: "L1", title: "a title", parameters: { limit: 5 } });
  });

  it("reports a slug that does not match the file name", () => {
    expect(parseRuleFile(valid, "another-title.md")).toEqual([expect.stringContaining("does not match the file name")]);
  });

  it("reports a file named by its code", () => {
    expect(parseRuleFile(valid, "XX-1a.md")).toEqual([expect.stringContaining("does not match the file name")]);
  });

  it("reports a rule with no slug", () => {
    expect(parseRuleFile(valid.replace("slug: a-title\n", ""), "a-title.md")).toEqual([
      expect.stringContaining("slug is missing"),
    ]);
  });

  it("reports a judged rule, which has no file", () => {
    const judged = valid.replace("check: lint", "check: judged");
    expect(parseRuleFile(judged, "a-title.md")).toEqual([expect.stringContaining("only a lint rule has a file")]);
  });

  it("reports a file with no frontmatter", () => {
    expect(parseRuleFile("# XX-1a: a title\n", "XX-1a.md")).toEqual(["XX-1a.md: no frontmatter"]);
  });
});

describe("loadRules on a directory with a duplicate code", () => {
  it("reports the second file", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-"));
    const text = "---\ncode: XX-1a\nslug: a-title\ndss: XX-1\ntier: L1\ncheck: lint\nsurface: source\nengine: custom\nparameters: {}\n---\n";
    fs.mkdirSync(path.join(dir, "a"));
    fs.mkdirSync(path.join(dir, "b"));
    fs.writeFileSync(path.join(dir, "a", "a-title.md"), text);
    fs.writeFileSync(path.join(dir, "b", "a-title.md"), text);
    const { rules, errors } = loadRules(dir);
    expect(rules).toHaveLength(1);
    expect(errors).toEqual([expect.stringContaining("is also in")]);
  });
});
