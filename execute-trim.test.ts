import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for the dx-design-execute trim (issue #500). Whether the
   trimmed skill behaves as before is a property of a live run, which the eval
   suite settles. These guard what a later edit could quietly undo: the routing
   name for the critique, one statement of the gates, and one name for the
   review phase. */

const SKILL_DIR = "plugins/dx-harness/skills/design/dx-design-execute";
const SKILL = `${SKILL_DIR}/SKILL.md`;
const PLAN = `${SKILL_DIR}/references/plan.md`;
const IMPLEMENT = `${SKILL_DIR}/references/implement.md`;
const VERIFY = `${SKILL_DIR}/verify.md`;
const EVALS = `${SKILL_DIR}/evals/evals.json`;

function read(file: string) {
  const full = path.join(process.cwd(), file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function flat(text: string) {
  return text.replace(/\s+/g, " ");
}

function markdownFiles(dir: string): string[] {
  return fs.readdirSync(path.join(process.cwd(), dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return markdownFiles(rel);
    return entry.name.endsWith(".md") ? [rel] : [];
  });
}

/* A section from its heading to the next heading of the same level or higher. */
function section(text: string, heading: string) {
  const start = text.indexOf(heading);
  if (start === -1) return "";
  const level = heading.match(/^#+/)?.[0].length ?? 2;
  const rest = text.slice(start + heading.length);
  const next = rest.search(new RegExp(`\\n#{1,${level}} `));
  return heading + (next === -1 ? rest : rest.slice(0, next));
}

const FILES = markdownFiles(SKILL_DIR);

describe("item 3: a restyle of an existing surface routes to dx-design-critique", () => {
  const existing = flat(section(read(SKILL), "### Existing surfaces"));

  it("has the existing-surfaces section", () => {
    expect(existing).not.toBe("");
  });

  it("invokes the critique by its skill name", () => {
    expect(existing).toMatch(/invoke `dx-design-critique`/i);
  });

  it("names no skill called `critique` anywhere in the skill", () => {
    for (const file of FILES) expect(read(file), file).not.toMatch(/`critique`/);
  });

  it("ships an eval case for a restyle of an existing page", () => {
    const evals = JSON.parse(read(EVALS) || "{}");
    const restyle = (evals.evals ?? []).find(
      (e: { name: string }) => e.name === "restyle-existing-routes-to-critique",
    );
    expect(restyle, "no restyle eval case").toBeDefined();
    expect(JSON.stringify(restyle.assertions)).toContain("dx-design-critique");
  });
});

describe("also true: the gates are stated once", () => {
  const gates = section(read(SKILL), "## Gates");

  /* Phrases that state a gate rather than point at one. Each must sit in the
     Gates section of SKILL.md and nowhere else in the skill. */
  const GATE_STATEMENTS = [
    { name: "the approval forms in return-to-caller mode", pattern: /only these forms count as approval|payload carries (a real|an) approval/i },
    { name: "the branch guard in both modes", pattern: /branch guard[^.]*both modes|both modes[^.]*branch guard/i },
    { name: "the stop-once rule", pattern: /never stop twice|exactly one stop at plan approval/i },
    { name: "the no-output-while-failing rule", pattern: /do not present output to the user while/i },
  ];

  it.each(GATE_STATEMENTS)("$name is stated in the Gates section only", ({ pattern }) => {
    expect(flat(gates), "the Gates section does not state it").toMatch(pattern);
    const outside = FILES.filter((file) => {
      const text = file === SKILL ? read(SKILL).replace(gates, "") : read(file);
      return pattern.test(flat(text));
    });
    expect(outside, "a file outside the Gates section restates it").toEqual([]);
  });

  it.each([PLAN, IMPLEMENT, VERIFY])("%s links to the Gates section", (file) => {
    expect(flat(read(file)), file).toMatch(/"Gates" in `(\.\.\/)?SKILL\.md`/);
  });
});

describe("also true: one name for the review phase", () => {
  it.each(FILES)("%s does not call the design review an evaluator or a verify phase", (file) => {
    const text = read(file);
    expect(text).not.toMatch(/evaluator/i);
    expect(text).not.toMatch(/verify phase|Phase 5[^\n]*Verify/i);
  });

  it("titles verify.md as the design review phase", () => {
    expect(read(VERIFY).split("\n")[0]).toMatch(/^# Phase 5: Design review$/);
  });

  it("names the phase Design review in the run order", () => {
    expect(section(read(SKILL), "## Run order")).toMatch(/\*\*Design review\*\*: read \[verify\.md\]/);
  });
});
