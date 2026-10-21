import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for capturing the surface once in a run that judges several
   dimensions. A skill run does the capture, so nothing here can exercise a live
   run. These guard the properties that would silently regress instead: that the
   run that sends out the dimensions owns the capture and the rule resolution,
   that a dispatched pass judges from what it receives, and that the capture
   mechanism order keeps one home. See issue #453. */

const HARNESS = "plugins/dx-harness";
const PROCEDURE = `${HARNESS}/procedures/capture.md`;
const ORCHESTRATOR = `${HARNESS}/skills/design/dx-design/SKILL.md`;
const PASS = `${HARNESS}/skills/design/dx-design-critique/pass.md`;
const CRITIQUE = `${HARNESS}/skills/design/dx-design-critique/critique.md`;

/* A tolerant read, because the implementation half creates the procedure. A
   missing file reads as empty and fails an assertion, rather than throwing
   before the assertion runs. Every block asserting an absence also asserts the
   content is non-empty, so no negative assertion passes because a file is
   absent. */
function read(file: string) {
  const full = path.join(process.cwd(), file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

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

/* One numbered item of a markdown list, from its number to the next item at the
   same indent. */
function listItem(body: string, number: number) {
  const start = body.search(new RegExp(`^${number}\\. `, "m"));
  if (start === -1) return "";
  const rest = body.slice(start);
  const end = rest.slice(1).search(/^\d+\. /m);
  return end === -1 ? rest : rest.slice(0, end + 1);
}

const IMPROVE = "## 4. Improve what exists";

/* The one term every file uses for the files a run captured. */
const TERM = "capture set";

/* Contract item 1: one capture for each run. */
describe("the run captures each width once", () => {
  const procedure = read(PROCEDURE);

  it("has a procedure that captures each width once", () => {
    expect(procedure.length, `${PROCEDURE} is missing or empty`).toBeGreaterThan(0);
    expect(procedure, "the procedure does not capture each width once").toMatch(
      /each width once/i,
    );
  });

  it("the orchestrator's improve mode runs it", () => {
    const improve = section(read(ORCHESTRATOR), IMPROVE);
    expect(improve.length, `${ORCHESTRATOR} has no improve section`).toBeGreaterThan(0);
    expect(improve, "improve mode does not run the capture procedure").toContain("capture.md");
  });

  it("a dispatched pass judges from the capture set", () => {
    const pass = read(PASS);
    expect(pass.length, `${PASS} is missing or empty`).toBeGreaterThan(0);
    expect(pass, `${PASS} does not point at the capture procedure`).toContain("capture.md");
    expect(pass.toLowerCase(), `${PASS} does not name the capture set`).toContain(TERM);
  });

  it("the critique's capture step records a capture set", () => {
    const capture = listItem(read(CRITIQUE), 2);
    expect(capture.length, `${CRITIQUE} has no step 2`).toBeGreaterThan(0);
    expect(capture.toLowerCase(), "critique step 2 does not name the capture set").toContain(TERM);
  });

  /* #459 moves the capture mechanism order into one place. A second copy here
     would give it two places to reconcile. */
  it("points at the critique for the mechanism order and does not copy it", () => {
    expect(procedure.length, `${PROCEDURE} is missing or empty`).toBeGreaterThan(0);
    expect(procedure, "the procedure does not point at critique.md").toContain("critique.md");
    expect(procedure, "the procedure copies the mechanism order").not.toMatch(/playwright/i);
  });
});

/* Contract item 2: one rule resolution for each run. */
describe("the run resolves the rules once", () => {
  const procedure = read(PROCEDURE);

  it("loads the catalogue once", () => {
    expect(procedure.length, `${PROCEDURE} is missing or empty`).toBeGreaterThan(0);
    expect(procedure, "the procedure does not load the catalogue once").toMatch(
      /catalog\.yaml[^\n]*once/i,
    );
  });

  it("gives each dimension its subset", () => {
    expect(procedure, "the procedure does not hand each dimension its subset").toMatch(
      /each dimension[^\n]*subset/i,
    );
  });

  it("a dispatched pass reads no other rules", () => {
    expect(read(PASS), `${PASS} lets a dispatched pass read more rules`).toMatch(
      /reads? no other rules/i,
    );
  });
});
