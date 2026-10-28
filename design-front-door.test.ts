import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for the trimmed dx-design front door. A skill run does the
   interview and the routing, so nothing here can exercise a live run. These
   guard the properties a later edit would silently regress instead: one
   question-pacing rule, one home for the return-to-caller mechanics, and no
   orphaned intake file. See issue #499. */

const HARNESS = "plugins/dx-harness";
const FRONT_DOOR = `${HARNESS}/skills/design/dx-design`;
const ORCHESTRATOR = `${FRONT_DOOR}/SKILL.md`;
const GRILLING = `${FRONT_DOOR}/grilling.md`;
const INTAKE = `${FRONT_DOOR}/issue-intake.md`;
const CONTRACT = `${HARNESS}/procedures/return-to-caller.md`;
const ENGINEERING_BUDGET = `${HARNESS}/docs/token-budget-engineering.md`;

/* A tolerant read. A missing file reads as empty and fails an assertion,
   rather than throwing before the assertion runs. */
function read(file: string) {
  const full = path.join(process.cwd(), file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function flat(file: string) {
  return read(file).replace(/\s+/g, " ");
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

/* Contract item 3: SKILL.md and grilling.md state one pacing rule. */
describe("3. one question-pacing rule", () => {
  const grill = section(read(ORCHESTRATOR), "## 2. Grill first").replace(/\s+/g, " ");

  it("the vendored grilling procedure asks the whole frontier in one round", () => {
    expect(flat(GRILLING), `${GRILLING} lost its pacing rule`).toMatch(/Ask the whole frontier in one round/);
  });

  it("the orchestrator's grill names the grilling procedure", () => {
    expect(grill.length, `${ORCHESTRATOR} has no grill section`).toBeGreaterThan(0);
    expect(grill, "the grill does not name grilling.md").toContain("grilling.md");
  });

  it("the orchestrator paces by the same rule", () => {
    expect(grill.length, `${ORCHESTRATOR} has no grill section`).toBeGreaterThan(0);
    expect(grill, "the grill does not ask the frontier in one round").toMatch(/whole frontier in one round/i);
  });

  it("the orchestrator states no second pacing rule", () => {
    const text = flat(ORCHESTRATOR);
    expect(text.length, `${ORCHESTRATOR} is missing or empty`).toBeGreaterThan(0);
    expect(text, "the orchestrator still paces one question at a time").not.toMatch(
      /one (question )?at a time|one question per turn/i,
    );
  });
});

/* Also true when done 1: the orphaned intake file is gone, and the token
   budget no longer counts it as a dx-design read. */
describe("4. the orphaned intake file is deleted", () => {
  it("issue-intake.md does not exist", () => {
    expect(fs.existsSync(path.join(process.cwd(), INTAKE)), `${INTAKE} still exists`).toBe(false);
  });

  it("the engineering token budget no longer says dx-design reads it", () => {
    const text = flat(ENGINEERING_BUDGET);
    expect(text.length, `${ENGINEERING_BUDGET} is missing or empty`).toBeGreaterThan(0);
    expect(text, "the budget still names issue-intake.md").not.toContain("issue-intake");
  });

  it("no plugin file outside the changelog names it", () => {
    const run = spawnSync("git", ["grep", "-l", "issue-intake", "--", HARNESS], { encoding: "utf8" });
    const files = run.stdout.split("\n").filter((file) => file && !file.endsWith("CHANGELOG.md"));
    expect(files, "a plugin file still names issue-intake").toEqual([]);
  });
});

/* Also true when done 2: the return-to-caller mechanics have one home. */
describe("5. the return-to-caller mechanics are only in the procedure", () => {
  const MECHANICS = [
    { name: "the interview suppression", pattern: /skips? (its|their) own interview|answers the same question twice/i },
    { name: "who spawns the reviewer", pattern: /spawns? (the design reviewer|its own reviewer|the reviewer) once|does not spawn its own reviewer/i },
  ];

  it.each(MECHANICS)("the procedure holds $name", ({ pattern }) => {
    expect(flat(CONTRACT), `${CONTRACT} lost a mechanic`).toMatch(pattern);
  });

  it.each(MECHANICS)("the orchestrator does not restate $name", ({ pattern }) => {
    const text = flat(ORCHESTRATOR);
    expect(text.length, `${ORCHESTRATOR} is missing or empty`).toBeGreaterThan(0);
    expect(text, "the orchestrator restates the mechanic").not.toMatch(pattern);
  });

  it("the orchestrator links to the procedure", () => {
    expect(flat(ORCHESTRATOR)).toContain("../../../procedures/return-to-caller.md");
  });
});
