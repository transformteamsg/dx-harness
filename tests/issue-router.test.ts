import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for the dx-create-issue router. A skill run does the
   routing, so nothing here exercises a live run. These guard the handoff: every
   issue type the router hands over goes to a skill that exists. See issue #606. */

const ENGINEERING = "plugins/dx-harness/skills/engineering";
const ROUTER = `${ENGINEERING}/dx-create-issue/SKILL.md`;

/* A missing file throws, so a negative assertion cannot pass on it. */
function read(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

/* The rows of the router's handoff table: issue type and skill name. */
function handoffRows() {
  const body = read(ROUTER);
  const start = body.indexOf("## 5. Load skills for execution");
  expect(start, `${ROUTER} has no handoff step`).toBeGreaterThan(-1);
  const rest = body.slice(start);
  const end = rest.indexOf("\n## ", 4);
  const step = end === -1 ? rest : rest.slice(0, end);
  return [...step.matchAll(/^\|\s*([A-Za-z]+)\s*\|\s*(dx-[a-z-]+)\s*\|$/gm)].map((m) => ({
    type: m[1],
    skill: m[2],
  }));
}

describe("the router hands each issue type to a skill that exists", () => {
  const rows = handoffRows();

  it("reads a non-empty handoff table", () => {
    expect(rows.length, "the handoff table has no rows").toBeGreaterThan(0);
  });

  it.each(rows)("$type goes to $skill, which has a SKILL.md named after its folder", ({ skill }) => {
    const file = `${ENGINEERING}/${skill}/SKILL.md`;
    expect(fs.existsSync(path.join(process.cwd(), file)), `${file} does not exist`).toBe(true);
    expect(read(file), `${file} has a different name:`).toMatch(new RegExp(`^name: ${skill}$`, "m"));
  });
});

describe("the router sends an investigation to dx-create-spike", () => {
  it("hands Spike over to dx-create-spike", () => {
    expect(handoffRows(), "the handoff table has no Spike row").toContainEqual({
      type: "Spike",
      skill: "dx-create-spike",
    });
  });
});
