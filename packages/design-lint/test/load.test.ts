import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadRules, parseRuleFile } from "../src/rules/load.ts";
import { run } from "../src/run.ts";
import type { RuleModule } from "../src/types.ts";

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
    const text = "---\ncode: BD-1a\ndss: BD-1\ntier: L1\ncheck: lint\nsurface: source\nengine: custom\nparameters: {}\n---\n";
    fs.mkdirSync(path.join(dir, "a"));
    fs.mkdirSync(path.join(dir, "b"));
    fs.writeFileSync(path.join(dir, "a", "BD-1a.md"), text);
    fs.writeFileSync(path.join(dir, "b", "BD-1a.md"), text);
    const { rules, errors } = loadRules(dir);
    expect(rules).toHaveLength(1);
    expect(errors).toEqual([expect.stringContaining("is also in")]);
  });
});

describe("loadRules on a rule with a catalogue prefix", () => {
  /* A module that flags every HTML file with no lang attribute. */
  const noLang: RuleModule = {
    code: "CMP-4a",
    surface: "source",
    locate: ({ files }) => files.map((file) => ({ file, line: 1, column: 1 })),
    decide: (c) => (/<html lang=/.test(fs.readFileSync(c.file, "utf8")) ? null : "the page has no lang"),
  };

  it("loads the rule and reports its finding on the failing fixture", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-"));
    fs.mkdirSync(path.join(dir, "cmp"));
    fs.writeFileSync(
      path.join(dir, "cmp", "CMP-4a.md"),
      "---\ncode: CMP-4a\ndss: CMP-4\ntier: L1\ncheck: lint\nsurface: source\nengine: custom\nparameters: {}\n---\n\n# CMP-4a: a page sets its language\n",
    );
    const fail = path.join(dir, "fail.html");
    const pass = path.join(dir, "pass.html");
    fs.writeFileSync(fail, "<html><body></body></html>\n");
    fs.writeFileSync(pass, "<html lang=\"en\"><body></body></html>\n");

    const { rules, errors } = loadRules(path.join(dir, "cmp"));
    expect(errors).toEqual([]);
    expect(rules).toEqual([expect.objectContaining({ code: "CMP-4a", title: "a page sets its language" })]);

    const options = { surfaces: ["source" as const], select: [], ignore: [], ci: false, root: dir };
    const failed = await run(rules, [noLang], null, { ...options, files: [fail] });
    expect(failed.findings).toEqual([expect.objectContaining({ code: "CMP-4a", file: fail, message: "the page has no lang" })]);
    const passed = await run(rules, [noLang], null, { ...options, files: [pass] });
    expect(passed.findings).toEqual([]);
  });
});

describe("loadRules on a rule file with a prefix that is not a category", () => {
  it("reports the file, and not the README or the MAPPING beside it", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-"));
    const text = "---\ncode: XX-1a\ndss: XX-1\ntier: L1\ncheck: lint\nsurface: source\nengine: custom\nparameters: {}\n---\n";
    fs.mkdirSync(path.join(dir, "xx"));
    fs.writeFileSync(path.join(dir, "xx", "XX-1a.md"), text);
    fs.writeFileSync(path.join(dir, "xx", "README.md"), "# xx\n");
    fs.writeFileSync(path.join(dir, "xx", "MAPPING.md"), "# xx\n");
    const { rules, errors } = loadRules(dir);
    expect(rules).toEqual([]);
    expect(errors).toEqual([expect.stringContaining("XX-1a.md")]);
  });
});

describe("loadRules on a file that is not markdown", () => {
  it("does not report it, so redirects.yaml can sit beside the categories", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-"));
    fs.writeFileSync(path.join(dir, "redirects.yaml"), "{}\n");
    expect(loadRules(dir)).toEqual({ rules: [], errors: [] });
  });
});
