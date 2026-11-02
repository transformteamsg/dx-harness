import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* The reviewer agent grades a rule from the review part of its detail, which
   `scripts/rule-detail.py --for review` prints. These guard that the agent
   carries no grading text for a single rule, so a rule that is out of scope
   costs the reviewer nothing, and that each step the agent held now sits in
   its rule's review part. See issue #452. */

const ROOT = process.cwd();
const HARNESS = "plugins/dx-harness";
const CONTROLS = path.join(ROOT, HARNESS, "standards/controls");
const SCRIPT = path.join(ROOT, HARNESS, "scripts/rule-detail.py");
const VALIDATE = path.join(ROOT, HARNESS, "checks/design-catalog-validate.py");
const AGENT = `${HARNESS}/agents/dx-design-review.md`;
const BUDGET = `${HARNESS}/docs/token-budget-design.md`;

function read(file: string) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function flat(text: string) {
  return text.replace(/\s+/g, " ");
}

/* The review part of one rule, with the whitespace collapsed. */
function review(rule: string) {
  const run = spawnSync("python3", [SCRIPT, path.join(CONTROLS, `${rule}.md`), "--for", "review"],
    { cwd: ROOT, encoding: "utf8" });
  expect(run.status, `${run.stdout}${run.stderr}`).toBe(0);
  return flat(run.stdout);
}

/* The agent text a reviewer reads before the output format, less the two
   parts that name rules without grading one: the spot-check of every
   interactive control, and the four quality grades. */
function gradingText() {
  const agent = read(AGENT);
  const before = agent.slice(0, agent.indexOf("## Output format"));
  return before
    .replace(/\*\*independently enumerate[\s\S]*?\n\n/, "")
    .replace(/\*\*4\. Design quality[\s\S]*$/, "");
}

/* The evaluator sections of a review part: the guidance, how to verify, the
   deconfliction notes, and the "Do not flag" list. A step the reviewer takes
   belongs here, not in the requirement. */
function evaluator(rule: string) {
  return review(rule)
    .split(/(?=## )/)
    .filter((part) => /^## (Evaluator guidance|How to verify|Do not flag|Deconfliction)/.test(part))
    .join(" ");
}

const CODE = /\b[A-Z][A-Z0-9]*-\d+\b/g;

/* Contract item 1: CMP-8's grading steps come from its detail. */
describe("1. the reviewer grades CMP-8 from its detail", () => {
  it("the CMP-8 evaluator part walks the flow, interrupts it, and judges whether the input survives", () => {
    const part = evaluator("cmp-8");
    expect(part).toMatch(/Walk the flow map/);
    expect(part).toMatch(/Interrupt the flow/);
    expect(part).toMatch(/never silently lost/i);
  });

  it("the agent carries no CMP-8 grading text", () => {
    const agent = flat(gradingText());
    expect(agent).not.toContain("CMP-8");
    expect(agent).not.toMatch(/interrupt it at a plausible point/i);
  });
});

/* Contract item 2: an out-of-scope rule costs nothing. */
describe("2. an out-of-scope CMP-9 costs the reviewer nothing", () => {
  it("the agent carries no CMP-9 grading text", () => {
    const agent = flat(gradingText());
    expect(agent).not.toContain("CMP-9");
    expect(agent).not.toMatch(/sanitiser/i);
  });
});

/* Contract item 3: each step the agent held and the detail did not moves to
   the detail's review part, and leaves no copy in the agent. */
describe("3. no grading text is lost", () => {
  const MOVED = [
    { rule: "cmp-4", step: /shimmer/i, why: "a shimmer is loading chrome" },
    { rule: "cmp-7", step: /colour, contrast, or shape/i, why: "a shape override is a finding" },
    { rule: "idn-2", step: /no script checks either half/i, why: "both halves are graded by hand" },
    { rule: "idn-3", step: /every surface that carries copy/i, why: "IDN-3 applies to every copy-bearing surface" },
    { rule: "cnt-14", step: /nominalisation \(CNT-8\)/i, why: "a CNT-8 nominalisation is not double-flagged" },
  ];

  it.each(MOVED)("the $rule evaluator part holds the step: $why", ({ rule, step }) => {
    expect(evaluator(rule)).toMatch(step);
  });

  it.each(MOVED)("the agent has no copy of the $rule step", ({ rule }) => {
    expect(flat(gradingText())).not.toContain(rule.toUpperCase());
  });

  it("no detail claims a script that does not exist for IDN-2", () => {
    expect(fs.existsSync(path.join(ROOT, HARNESS, "checks/identity-scan.py"))).toBe(false);
    expect(review("idn-2")).not.toMatch(/identity-scan\.py/);
  });
});

/* Also true when done: the agent grades no single rule. */
describe("4. no section of the reviewer agent grades a single rule", () => {
  it("names no rule before the output format, outside the spot-check and the quality grades", () => {
    expect(gradingText().match(CODE) ?? []).toEqual([]);
  });

  it("keeps the rule codes in the output format examples", () => {
    const agent = read(AGENT);
    const format = agent.slice(agent.indexOf("## Output format"));
    expect(format.match(CODE)).toEqual(expect.arrayContaining(["TOK-1", "A11Y-1"]));
  });
});

/* Also true when done: the validator passes, with its checks on the agent
   changed to match it. */
describe("6. the catalogue validator matches the agent", () => {
  it("the agent carries no layout-controls fence", () => {
    expect(read(AGENT)).not.toContain("dx-sync:lay-controls");
  });

  it("the validator passes", () => {
    const run = spawnSync("python3", [VALIDATE], { cwd: ROOT, encoding: "utf8" });
    expect(run.status, `${run.stdout}${run.stderr}`).toBe(0);
  });

  it("the validator's self-test passes", () => {
    const run = spawnSync("python3", [VALIDATE, "--self-test"], { cwd: ROOT, encoding: "utf8" });
    expect(run.status, `${run.stdout}${run.stderr}`).toBe(0);
  }, 60_000);
});

/* Also true when done: the budget records the agent before and after. */
describe("7. the token budget records the agent's size", () => {
  it("a measured change names #452 with a before and an after figure", () => {
    const row = read(BUDGET).split("\n").find((line) => line.includes("#452")) ?? "";
    expect(row).toContain("agents/dx-design-review.md");
    expect(row).toMatch(/\| 4,641 \| [\d,]+ \| [\d,]+ \|$/);
  });
});
