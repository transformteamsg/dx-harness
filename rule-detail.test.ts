import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* A rule's detail holds a normative part for the builder and an evaluator
   part for the reviewer. `scripts/rule-detail.py` prints the part that one
   reader needs, so a build does not read the rationale or the grading text.
   These run the command against the shipped detail files and throwaway ones,
   and guard the prose that tells each reader which part to read. See issue
   #451. */

const ROOT = process.cwd();
const HARNESS = "plugins/dx-harness";
const CONTROLS = path.join(ROOT, HARNESS, "standards/controls");
const SCRIPT = path.join(ROOT, HARNESS, "scripts/rule-detail.py");
const LIST = path.join(ROOT, HARNESS, "scripts/in-scope-rules.py");
const MECHANICS = `${HARNESS}/procedures/catalogue-mechanics.md`;
const AGENT = `${HARNESS}/agents/dx-design-review.md`;

function read(file: string) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function flat(file: string) {
  return read(file).replace(/\s+/g, " ");
}

function detail(file: string, reader: string) {
  const run = spawnSync("python3", [SCRIPT, file, "--for", reader], { cwd: ROOT, encoding: "utf8" });
  return { status: run.status, out: `${run.stdout ?? ""}${run.stderr ?? ""}`, stdout: run.stdout ?? "" };
}

/* The `## ` headings a part prints. */
function headings(stdout: string) {
  return [...stdout.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
}

/* A throwaway detail file with the given check type and sections. */
function detailFile(check: string, sections: string[]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rule-detail-"));
  const file = path.join(dir, "tst-1.md");
  const body = sections.map((s) => `## ${s}\n\nText for ${s}.\n`).join("\n");
  fs.writeFileSync(file, `---\nid: TST-1\ntitle: A test rule\ntier: L1\ncheck: ${check}\n---\n\n${body}`);
  return file;
}

/* The files that tell a builder to apply a rule, and the files that tell a
   reviewer or a verify step to grade one. */
const BUILD_FILES = [
  MECHANICS,
  `${HARNESS}/procedures/implement.md`,
  `${HARNESS}/skills/design/dx-design-execute/SKILL.md`,
];
const REVIEW_FILES = [
  MECHANICS,
  AGENT,
  `${HARNESS}/skills/design/dx-design-critique/SKILL.md`,
  `${HARNESS}/skills/design/dx-design-critique/pass.md`,
  `${HARNESS}/procedures/capture.md`,
  `${HARNESS}/skills/design/dx-design-execute/verify.md`,
];

/* Contract item 1: the builder reads the rule only. */
describe("1. a build reads the normative part of a rule", () => {
  const build = detail(path.join(CONTROLS, "cmp-8.md"), "build");

  it("prints the requirement and the pass and fail conditions", () => {
    expect(build.status, build.out).toBe(0);
    expect(headings(build.stdout)).toEqual(expect.arrayContaining(["Requirement", "Passes when", "Fails when"]));
  });

  it("leaves out the rationale, the evaluator guidance, and the Do not flag list", () => {
    expect(build.status, build.out).toBe(0);
    const got = headings(build.stdout);
    for (const left of ["Rationale", "Evaluator guidance", "Do not flag", "Why this is judgment"]) {
      expect(got, `the build part prints ${left}`).not.toContain(left);
    }
    expect(build.stdout).not.toMatch(/Walk the flow map/);
  });

  it("keeps a section that states part of the rule itself", () => {
    const col = detail(path.join(CONTROLS, "col-1.md"), "build");
    expect(col.status, col.out).toBe(0);
    expect(headings(col.stdout)).toContain("Per-product primary");
    expect(headings(col.stdout)).not.toContain("How to verify");
  });

  it.each(BUILD_FILES)("%s reads a rule with the build part", (file) => {
    expect(flat(file), `${file} does not name the build part`).toContain("rule-detail.py");
    expect(flat(file), `${file} does not pass --for build`).toContain("--for build");
  });

  it.each(BUILD_FILES)("%s no longer reads the whole detail file", (file) => {
    expect(flat(file)).not.toMatch(/read (a|each) listed (rule|control)'s detail file/i);
  });
});

/* Contract item 2: the reviewer reads the evaluator part. */
describe("2. a review reads the evaluator part of a rule", () => {
  it("prints the rule, the evaluator guidance, and the Do not flag list", () => {
    const review = detail(path.join(CONTROLS, "cmp-8.md"), "review");
    expect(review.status, review.out).toBe(0);
    expect(headings(review.stdout)).toEqual(
      expect.arrayContaining(["Requirement", "Fails when", "Evaluator guidance", "Do not flag"]));
    expect(review.stdout).toMatch(/Walk the flow map/);
  });

  it("takes How to verify as the evaluator part where a rule has no guidance section", () => {
    const review = detail(path.join(CONTROLS, "cmp-2.md"), "review");
    expect(review.status, review.out).toBe(0);
    expect(headings(review.stdout)).toContain("How to verify");
  });

  it.each(REVIEW_FILES)("%s grades a rule with the review part", (file) => {
    expect(flat(file), `${file} does not name the review part`).toContain("rule-detail.py");
    expect(flat(file), `${file} does not pass --for review`).toContain("--for review");
  });
});

/* Contract item 3: a judgment or hybrid rule with no evaluator part. */
describe("3. a missing evaluator part is a catalogue defect", () => {
  const NO_EVALUATOR = ["Requirement", "Rationale", "Passes when", "Fails when"];

  it.each(["judgment", "hybrid"])("a %s rule with no evaluator part stops the review part", (check) => {
    const review = detail(detailFile(check, NO_EVALUATOR), "review");
    expect(review.status).not.toBe(0);
    expect(review.out).toMatch(/catalogue defect/i);
    expect(review.out).toContain("TST-1");
    expect(headings(review.stdout)).toEqual([]);
  });

  it("a deterministic rule with no evaluator part is not a defect", () => {
    const review = detail(detailFile("deterministic", NO_EVALUATOR), "review");
    expect(review.status, review.out).toBe(0);
  });

  it("every shipped judgment and hybrid rule has an evaluator part", () => {
    const failing = fs.readdirSync(CONTROLS)
      .filter((file) => file.endsWith(".md"))
      .filter((file) => detail(path.join(CONTROLS, file), "review").status !== 0);
    expect(failing).toEqual([]);
  }, 20_000);

  it("the reviewer reports the defect and writes no rubric of its own", () => {
    const agent = flat(AGENT);
    expect(agent).toMatch(/catalogue defect/i);
    expect(agent).toMatch(/write no rubric of your own/i);
  });
});

/* Contract item 4: a rule a check covers fully, and the check ran clean. */
describe("4. a rule a clean check covers fully needs no detail", () => {
  const run = spawnSync("python3", [LIST, fs.mkdtempSync(path.join(os.tmpdir(), "rule-detail-repo-")),
    "--product", "tw"], { cwd: ROOT, encoding: "utf8" });
  const row = (id: string) => (run.stdout ?? "").split("\n").find((line) => line.startsWith(`- ${id} `)) ?? "";

  it("the list names the check that covers a rule fully, and none for a rule a check covers in part", () => {
    expect(run.status, run.stderr).toBe(0);
    expect(row("TOK-1")).toContain("Covered by: checks/token-audit.py");
    expect(row("TYP-3")).toContain("Covered by: checks/type-scan.py");
    expect(row("TYP-2")).not.toBe("");
    expect(row("TYP-2")).not.toContain("Covered by");
  });

  it("the mechanics tell the builder to read no detail when that check is clean", () => {
    const mechanics = flat(MECHANICS);
    expect(mechanics).toContain("`Covered by:`");
    expect(mechanics).toMatch(/no findings/i);
    expect(mechanics).toMatch(/read no detail for (that|the) rule/i);
  });
});

/* Paths the command itself introduced. */
describe("the detail command", () => {
  it("stops as a tool failure when the detail file cannot be read", () => {
    const run = detail(path.join(CONTROLS, "no-such-rule.md"), "build");
    expect(run.status).toBe(4);
    expect(run.out).toMatch(/cannot read/);
  });

  it("keeps a heading inside a code fence as text of its section", () => {
    const file = detailFile("hybrid", ["Requirement", "Evaluator guidance"]);
    fs.appendFileSync(file, "\n## Fails when\n\n```markdown\n## Rationale\nquoted\n```\n");
    const build = detail(file, "build");
    expect(build.status, build.out).toBe(0);
    expect(build.stdout).toContain("quoted");
  });

  it("keeps the status note that sits before the first section", () => {
    const build = detail(path.join(CONTROLS, "mot-2.md"), "build");
    expect(build.status, build.out).toBe(0);
    expect(build.stdout).toMatch(/Status: proposed/);
  });
});
