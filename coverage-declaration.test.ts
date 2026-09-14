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
