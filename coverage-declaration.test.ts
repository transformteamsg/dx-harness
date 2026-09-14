import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for the seam between the coverage declaration and
   `dx-code-review`. The declaration is written by `dx-write-tests` into a commit
   body and read back by the review, so nothing here can exercise a live review
   against a pull request. These guard the properties that would silently
   regress instead: that the declaration's shape stays in one file, and that the
   review names it as a source. See issue #319. */

const HARNESS = "plugins/dx-harness";
const REVIEW = `${HARNESS}/skills/engineering/dx-code-review`;

function read(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

/* The two headings that make up the declaration's shape. */
const SHAPE_HEADINGS = [
  "Covered by an automated test:",
  "Recorded as manual, no automated test written:",
];

describe("the declaration's shape has one home", () => {
  it("commit-discipline.md holds the shape", () => {
    const procedure = read(`${HARNESS}/procedures/commit-discipline.md`);
    for (const heading of SHAPE_HEADINGS) {
      expect(procedure).toContain(heading);
    }
    expect(procedure).toContain("Written by dx-write-tests");
  });

  it("the review's check refers to commit-discipline.md", () => {
    const check = read(`${REVIEW}/references/issue-and-test-plan-check.md`);
    expect(check).toContain("commit-discipline.md");
  });

  it("no review file restates the shape", () => {
    const files = fs
      .readdirSync(path.join(process.cwd(), `${REVIEW}/references`))
      .map((name) => `${REVIEW}/references/${name}`)
      .concat(`${REVIEW}/SKILL.md`);
    for (const file of files) {
      const body = read(file);
      for (const heading of SHAPE_HEADINGS) {
        expect(body, `${file} restates "${heading}"`).not.toContain(heading);
      }
    }
  });
});

describe("the Reviewer To-Do list names both of its sources", () => {
  const check = read(`${REVIEW}/references/issue-and-test-plan-check.md`);
  const skill = read(`${REVIEW}/SKILL.md`);

  /* The rule bullet in SKILL.md's Rules section, read on its own so the
     assertion cannot be satisfied by a mention somewhere else in the file. */
  const todoRule = skill.split("\n").find((line) => line.startsWith("**Reviewer To-Do:**")) ?? "";

  it("SKILL.md carries the rule bullet", () => {
    expect(todoRule).not.toBe("");
  });

  it("neither file claims a single source", () => {
    expect(todoRule).not.toContain("only source");
    expect(check).not.toContain("only source");
  });

  it("the rule names the coverage declaration", () => {
    expect(todoRule).toContain("declaration");
  });
});

describe("the summary reports what the declaration answered", () => {
  const summary = read(`${REVIEW}/references/summary-format.md`);

  it("carries a Declared manual line", () => {
    expect(summary).toContain("**Declared manual:**");
  });

  it("governs that line by the same non-empty rule as the others", () => {
    const rule = summary.split("\n").find((line) => line.includes("only when they are non-empty")) ?? "";
    expect(rule).toContain("Declared manual");
  });
});

describe("the eval suite covers both declaration states", () => {
  const suite = JSON.parse(read(`${REVIEW}/evals/evals.json`));
  const names: string[] = suite.evals.map((evalCase: { name: string }) => evalCase.name);

  it("has a case for a declaration that answers a scenario", () => {
    expect(names).toContain("declaration-answers-scenario");
  });

  it("has a case for a branch that carries no declaration", () => {
    expect(names).toContain("no-declaration-keeps-todo");
  });

  it("gives every case the four fields a reader grades it by", () => {
    for (const evalCase of suite.evals) {
      expect(evalCase.fixture_setup, `case ${evalCase.name}`).toBeTruthy();
      expect(evalCase.prompt, `case ${evalCase.name}`).toBeTruthy();
      expect(evalCase.expected_output, `case ${evalCase.name}`).toBeTruthy();
      expect(evalCase.assertions.length, `case ${evalCase.name}`).toBeGreaterThan(0);
    }
  });

  it("gives every case a unique id", () => {
    const ids = suite.evals.map((evalCase: { id: number }) => evalCase.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
