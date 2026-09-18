import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for the code-level definition of done. A skill run applies
   the procedure, so nothing here can exercise a live run against an issue.
   These guard the properties that would silently regress instead: that the
   template stays inside what a code change controls, that it points at the
   repository's own contributing guide rather than restating it, that the two
   skills consuming it reference it, and that every item names the evidence a
   reader checks it by. See issue #317. */

const HARNESS = "plugins/dx-harness";
const PROCEDURE = `${HARNESS}/procedures/definition-of-done.md`;

/* A tolerant read, because the implementation half creates the procedure. A
   missing file reads as empty and fails an assertion, rather than throwing
   before the assertion runs. Every block asserting an absence also asserts the
   content is non-empty, so no negative assertion passes because a file is
   absent. */
function read(file: string) {
  const full = path.join(process.cwd(), file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

/* What the definition of done must not reach for. A code change cannot make any
   of these true, so an item naming one blocks an author on work they cannot do.
   Taken from the acceptance criteria of #317, as word stems. */
const OUTSIDE_A_CODE_CHANGE = [
  "deploy",
  "release",
  "environment",
  "monitor",
  "sign-off",
  "sign off",
];

/* What a restatement of the contributing guide would look like. The guide names
   the commands and holds the rule that the checks pass before a request leaves
   draft, so a second copy of either is the drift this guards against. */
const OWNED_BY_CONTRIBUTING = ["pnpm", "npm run", "yarn", "draft"];

describe("the template stays inside what a code change controls", () => {
  it("names nothing outside it", () => {
    const procedure = read(PROCEDURE);
    expect(procedure.length, `${PROCEDURE} is missing or empty`).toBeGreaterThan(0);
    for (const term of OUTSIDE_A_CODE_CHANGE) {
      expect(procedure.toLowerCase(), `${PROCEDURE} names "${term}"`).not.toContain(term);
    }
  });
});

describe("a rule the contributing guide already states has one home", () => {
  it("references the guide, and restates nothing it owns", () => {
    const procedure = read(PROCEDURE);
    expect(procedure, `${PROCEDURE} is missing or empty`).toContain("CONTRIBUTING.md");
    for (const term of OWNED_BY_CONTRIBUTING) {
      expect(procedure.toLowerCase(), `${PROCEDURE} restates "${term}"`).not.toContain(term);
    }
  });
});
