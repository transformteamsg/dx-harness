import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for the surface assessment: whether an issue's work touches
   the frontend, the backend, both, or neither. A skill run makes the assessment,
   so nothing here can exercise a live run against an issue. These guard the
   properties that would silently regress instead: that the vocabulary and the
   rule for deriving it have one home, that the assessment is derived before the
   code is read rather than after, that it reaches both halves and the request
   body, and that the design loop's own procedure keeps its rules rather than
   growing a second copy of these. See issue #318. */

const HARNESS = "plugins/dx-harness";
const PROCEDURE = `${HARNESS}/procedures/surface-assessment.md`;
const CONTRACT = `${HARNESS}/procedures/issue-contract.md`;
const ROUTER = `${HARNESS}/skills/engineering/dx-implement-issue/SKILL.md`;

/* A tolerant read, because the implementation half creates the procedure. A
   missing file reads as empty and fails an assertion, rather than throwing
   before the assertion runs. Every block asserting an absence also asserts the
   content is non-empty, so no negative assertion passes because a file is
   absent. */
function read(file: string) {
  const full = path.join(process.cwd(), file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

/* The closed set of values an assessment can take. `neither` is in the set
   because a change to tooling, to a shared procedure, or to documentation
   touches no product surface, and a vocabulary of three would force that work
   into a bucket it does not belong in. */
const VALUES = ["frontend", "backend", "both", "neither"];

/* The term every consumer refers to the assessment by. Matching the bare word
   "surface" would match the verb, which these files already use for reporting an
   error, so the term is what the assertions look for. */
const TERM = "surface assessment";

/* One section of a markdown file, from its heading to the next heading at the
   same level. */
function section(body: string, heading: string) {
  const start = body.indexOf(heading);
  if (start === -1) return "";
  const rest = body.slice(start + heading.length);
  const level = heading.slice(0, heading.indexOf(" ")).length;
  const end = rest.indexOf(`\n${"#".repeat(level)} `);
  return end === -1 ? rest : rest.slice(0, end);
}

/* The numbered steps of a procedure or skill, as integers. */
function steps(body: string) {
  return [...body.matchAll(/^#{2,3} Step (\d+):/gm)].map((match) => Number(match[1]));
}

/* Contract item 1: the assessment is made and stated. */
describe("the assessment has a value and a home", () => {
  const procedure = read(PROCEDURE);

  it("names the closed set of values", () => {
    expect(procedure.length, `${PROCEDURE} is missing or empty`).toBeGreaterThan(0);
    for (const value of VALUES) {
      expect(procedure, `${PROCEDURE} does not name \`${value}\``).toContain(`\`${value}\``);
    }
  });

  it("the issue contract runs it", () => {
    const contract = read(CONTRACT);
    expect(contract.length, `${CONTRACT} is missing or empty`).toBeGreaterThan(0);
    expect(contract, `${CONTRACT} does not run the procedure`).toContain(
      "surface-assessment.md",
    );
  });

  it("the router states it in the report", () => {
    const report = section(read(ROUTER), "## Step 8: Report");
    expect(report.length, `${ROUTER} has no Step 8 report section`).toBeGreaterThan(0);
    expect(report.toLowerCase(), "the report does not name the assessment").toContain(TERM);
  });

  it("the router sends it to the request body", () => {
    const handoff = section(read(ROUTER), "## Step 7: Open a draft pull request");
    expect(handoff.length, `${ROUTER} has no Step 7 section`).toBeGreaterThan(0);
    expect(
      handoff.toLowerCase(),
      "Step 7 does not pass the assessment to dx-create-pr",
    ).toContain(TERM);
  });
});

/* Contract item 2: the assessment changes what the run does. It has to be
   derived before the code is read, because a frontend-only assessment narrows
   the exploration. Derived after, it could only describe a run that had already
   happened. */
describe("the assessment is derived before it is acted on", () => {
  const contract = read(CONTRACT);

  it("comes before the step that reads the code", () => {
    const assess = contract.indexOf("surface-assessment.md");
    const code = contract.indexOf("Read the code you are about to change");
    expect(assess, `${CONTRACT} does not run the procedure`).toBeGreaterThan(-1);
    expect(code, `${CONTRACT} has no step that reads the code`).toBeGreaterThan(-1);
    expect(assess).toBeLessThan(code);
  });

  it("numbers its steps in one unbroken sequence", () => {
    /* Only the count comes from the file. The expected values are generated, so
       a duplicated or skipped number fails this. Inserting the assessment
       renumbers every step after it. */
    const numbers = steps(contract);
    expect(numbers.length, `${CONTRACT} has no numbered steps`).toBeGreaterThan(0);
    expect(numbers).toEqual(numbers.map((_, index) => index + 1));
  });

  it("a frontend-only assessment plans no backend work", () => {
    const procedure = read(PROCEDURE);
    expect(procedure.length, `${PROCEDURE} is missing or empty`).toBeGreaterThan(0);
    expect(procedure, "the procedure does not bind the plan to the assessment").toMatch(
      /plan no backend work/i,
    );
  });

  it("says what the run would have needed from the surface it left out", () => {
    expect(read(PROCEDURE), "the procedure asks for no statement of what was left out").toMatch(
      /would have needed/i,
    );
  });

  it("the router's plan step reads the assessment", () => {
    const plan = section(read(ROUTER), "## Step 2: Plan");
    expect(plan.length, `${ROUTER} has no Step 2 plan section`).toBeGreaterThan(0);
    expect(plan.toLowerCase(), "the plan step does not name the assessment").toContain(TERM);
  });
});
