import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for when a design run reads the waiver rules in
   `standards/README.md`. A skill run decides what it reads, so nothing here
   can exercise a live run. These guard the prose that decides it: that every
   pointer to the file waits for a waiver, that applicability is answered from
   the catalogue rather than from the file, and that a waiver question or a
   proposed waiver reads the file before anyone answers. See issue #454. */

const HARNESS = "plugins/dx-harness";
const README = "standards/README.md";
const MECHANICS = `${HARNESS}/procedures/catalogue-mechanics.md`;
const PLAN_APPROVAL = `${HARNESS}/procedures/plan-approval.md`;
const ORCHESTRATOR = `${HARNESS}/skills/design/dx-design/SKILL.md`;
const EXECUTE = `${HARNESS}/skills/design/dx-design-execute/SKILL.md`;
const CRITIQUE = `${HARNESS}/skills/design/dx-design-critique/SKILL.md`;

function read(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

function markdownUnder(dir: string): string[] {
  return fs.readdirSync(path.join(process.cwd(), dir), { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(dir, file));
}

/* Every place a design run is sent to the waiver rules, with the line before
   and after it, because the condition often sits on a neighbouring line of the
   same wrapped sentence. */
const POINTERS = [
  ...markdownUnder(`${HARNESS}/skills/design`),
  ...markdownUnder(`${HARNESS}/procedures`),
  ...markdownUnder(`${HARNESS}/agents`),
].flatMap((file) => {
  const lines = read(file).split("\n");
  return lines.flatMap((line, i) =>
    line.includes(README)
      ? [{ at: `${file}:${i + 1}`, text: lines.slice(Math.max(0, i - 1), i + 2).join(" ") }]
      : [],
  );
});

/* The text of one `## ` section, from its heading to the next. */
function section(file: string, heading: string) {
  const text = read(file);
  const start = text.indexOf(`## ${heading}`);
  expect(start, `${file} has no "## ${heading}" section`).toBeGreaterThanOrEqual(0);
  const end = text.indexOf("\n## ", start + 1);
  return text.slice(start, end === -1 ? undefined : end);
}

describe("1. a build with no waiver never reads the waiver rules", () => {
  it("finds the pointers it checks", () => {
    expect(POINTERS.length).toBeGreaterThan(5);
  });

  it("sends a run to the waiver rules only on a waiver or a rule proposal", () => {
    const unconditioned = POINTERS.filter(({ text }) => !/waiver|propose a new control/i.test(text));
    expect(unconditioned.map(({ at }) => at)).toEqual([]);
  });

  it("does not send an applicability question to the waiver rules", () => {
    const applicability = POINTERS.filter(({ text }) => /applicability/i.test(text));
    expect(applicability.map(({ at }) => at)).toEqual([]);
  });

  it("does not read the waiver rules every time", () => {
    const always = POINTERS.filter(({ text }) => /every time/i.test(text));
    expect(always.map(({ at }) => at)).toEqual([]);
  });

  it("answers applicability from the scope fields and DESIGN.md", () => {
    const mechanics = read(MECHANICS).replace(/\s+/g, " ");
    expect(mechanics).toMatch(/applicability comes from the catalogue's scope fields and the product's DESIGN\.md/i);
  });
});

describe("2. a waiver question reads the waiver rules in that turn, before the answer", () => {
  const files = [ORCHESTRATOR, EXECUTE, CRITIQUE, MECHANICS];

  it.each(files)("%s reads them in that turn", (file) => {
    const pointers = POINTERS.filter(({ at }) => at.startsWith(`${file}:`));
    expect(pointers.some(({ text }) => /in that turn/.test(text)), `${file} never says "in that turn"`).toBe(true);
  });

  it.each(files)("%s never answers from memory", (file) => {
    expect(read(file).replace(/\s+/g, " ")).toMatch(/never answer (a waiver question )?from memory/i);
  });

  it("the orchestrator's waiver section reads them before it answers", () => {
    const questions = section(ORCHESTRATOR, "6. Rule and waiver questions").replace(/\s+/g, " ");
    expect(questions).toMatch(/Read before you answer, in that turn\*\*: `\.\.\/\.\.\/\.\.\/standards\/README\.md`/);
  });
});

describe("3. a proposed waiver reads the waiver rules before the plan gate asks", () => {
  it("reads them before the structured ask", () => {
    const waivers = section(PLAN_APPROVAL, "L1 waiver approval happens here").replace(/\s+/g, " ");
    expect(waivers).toMatch(/read `\.\.\/standards\/README\.md` before the structured ask when the plan proposes a waiver/);
  });
});
