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
