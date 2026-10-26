import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* Each rule the design skills share has its text in one file, and every other
   file names that file. A skill run does the reading, so nothing here can
   exercise a live run. These guard the property that would silently regress
   instead: a second copy of a rule, which a run pays for and which drifts from
   the first. See issue #459. */

const ROOT = process.cwd();
const HARNESS = "plugins/dx-harness";
const DESIGN = `${HARNESS}/skills/design`;
const MECHANICS = `${HARNESS}/procedures/catalogue-mechanics.md`;
const CONTRACT = `${HARNESS}/procedures/return-to-caller.md`;
const REVIEW = `${HARNESS}/procedures/design-review.md`;
const CAPTURE = `${HARNESS}/procedures/capture.md`;
const IMPLEMENT = `${HARNESS}/procedures/implement.md`;
const EXECUTE = `${DESIGN}/dx-design-execute/SKILL.md`;
const VERIFY = `${DESIGN}/dx-design-execute/verify.md`;
const ORCHESTRATOR = `${DESIGN}/dx-design/SKILL.md`;
const PATTERN = `${DESIGN}/dx-design-pattern/SKILL.md`;
const PASS = `${DESIGN}/dx-design-critique/pass.md`;
const CRITIQUE = `${DESIGN}/dx-design-critique/critique.md`;
const VALIDATE = path.join(ROOT, HARNESS, "checks/design-catalog-validate.py");
const CHECKS_README = `${HARNESS}/checks/README.md`;

/* A tolerant read, because the implementation half creates the contract. A
   missing file reads as empty and fails an assertion, rather than throwing
   before the assertion runs. */
function read(file: string) {
  const full = path.join(ROOT, file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function flat(file: string) {
  return read(file).replace(/\s+/g, " ");
}

/* Every markdown file a design run can read: the design skills, the reviewer
   agent, and the shared procedures. Evals are test data, not run text. */
function runFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        if (entry.name !== "evals") walk(rel);
      } else if (entry.name.endsWith(".md")) {
        out.push(rel);
      }
    }
  };
  for (const dir of [DESIGN, `${HARNESS}/agents`, `${HARNESS}/procedures`]) walk(dir);
  return out.sort();
}

/* The run files whose flattened text matches a pattern. */
function holders(pattern: RegExp) {
  return runFiles().filter((file) => pattern.test(flat(file)));
}

/* The run files that name every id in a set. */
function namingAll(ids: string[]) {
  return runFiles().filter((file) => {
    const text = read(file);
    return ids.every((id) => new RegExp(`\\b${id}\\b`).test(text));
  });
}

/* One bullet of a markdown list, from its bold label to the next bold label. */
function bullet(file: string, label: string, next: string) {
  const text = flat(file);
  const start = text.indexOf(`**${label}**`);
  if (start === -1) return "";
  const end = text.indexOf(`**${next}**`, start);
  return end === -1 ? text.slice(start) : text.slice(start, end);
}

/* The rule sets come from the catalogue, not from the files under test. */
type Control = { id: string; tier: string };
const controls: Control[] = parse(read(`${HARNESS}/standards/catalog.yaml`)).controls;
const L0 = controls.filter((c) => c.tier === "L0").map((c) => c.id);
const LAY = controls.filter((c) => c.id.startsWith("LAY-")).map((c) => c.id);

/* A field list that each copy of the return-to-caller payload carried. */
const PAYLOAD = [
  { name: "the build input", pattern: /granted waivers and the L1 approver/i },
  { name: "the review bundle", pattern: /the waivers applied/i },
  { name: "the pass input", pattern: /capture set,? and (its|this pass's|that pass's) subset/i },
  { name: "the pass handoff", pattern: /the mode token, the accepted findings, and the design.ticket reference/i },
];

describe("the rule sets the tests compare against", () => {
  it("come from the catalogue", () => {
    expect(L0.length, "the catalogue has no L0 rule").toBeGreaterThan(0);
    expect(LAY.length, "the catalogue has no LAY rule").toBeGreaterThan(0);
  });
});

/* Contract item 1: each rule has its text in one file, and every other file
   that needs it names that file. */
describe("1. one copy of each rule", () => {
  /* The L0 floor is the catalogue's L0 set, so no run file types it out. */
  it("no run file lists the whole L0 floor", () => {
    expect(namingAll(L0), "these files type out the L0 floor").toEqual([]);
  });

  /* The pattern pass names the LAY rules as its dimension subset, which
     checklib's DIMENSION_RULES self-test holds it to. That is the one copy. */
  it("only the pattern pass lists the whole layout-controls block", () => {
    expect(namingAll(LAY), "these files type out the layout controls").toEqual([PATTERN]);
  });

  it("the capture mechanism order is only in the critique", () => {
    expect(holders(/Claude-in-Chrome/), "the mechanism order has more than one copy").toEqual([CRITIQUE]);
  });

  it("verify points at the critique for the mechanism order", () => {
    expect(flat(VERIFY), `${VERIFY} does not name critique.md`).toContain("critique.md");
  });

  /* verify.md held two capture lines the critique did not. They move, so the
     one copy loses nothing. */
  it("the critique keeps the capture lines that only verify had", () => {
    const critique = flat(CRITIQUE);
    expect(critique, "the critique lost the agent-browser fallback").toMatch(/os error 35/);
    expect(critique, "the critique lost the any-source rule").toMatch(/any source is fine/i);
  });

  it("the async evidence gate (EVD-1) is only in the design review procedure", () => {
    expect(holders(/the success state,? and the error state/i), "EVD-1 has more than one copy").toEqual([REVIEW]);
  });

  it("verify points at the design review procedure for EVD-1", () => {
    expect(flat(VERIFY), `${VERIFY} does not send EVD-1 to design-review.md`).toMatch(
      /EVD-1[^.]*design-review\.md|design-review\.md[^.]*EVD-1/,
    );
  });

  /* verify.md's copy held the N/A outcome. It moves, so the one copy loses
     nothing. */
  it("the design review procedure keeps the N/A outcome that only verify had", () => {
    expect(flat(REVIEW), "design-review.md lost the N/A outcome").toMatch(/state does not exist/);
  });

  it.each(PAYLOAD)("$name is only in the return-to-caller contract", ({ pattern }) => {
    expect(read(CONTRACT).length, `${CONTRACT} is missing or empty`).toBeGreaterThan(0);
    expect(holders(pattern), "the payload has more than one copy").toEqual([CONTRACT]);
  });

  it.each([EXECUTE, ORCHESTRATOR, PASS, CAPTURE])("%s names the return-to-caller contract", (file) => {
    expect(flat(file), `${file} does not name return-to-caller.md`).toContain("return-to-caller.md");
  });
});

/* Contract item 2: a skill gets the L0 floor from the catalogue by tier, and
   the skill text names no L0 rule. A file that names one L0 rule for its own
   reason, such as the flow pass naming CMP-2, is not a copy of the floor. */
describe("2. a skill reads the L0 floor from the catalogue", () => {
  const floor = bullet(MECHANICS, "L0", "L1");

  it("the catalogue mechanics put every L0 rule on every list", () => {
    expect(flat(MECHANICS)).toMatch(/every L0 rule is on every list/i);
  });

  /* pass.md held the one rule about the floor that the catalogue does not:
     a pass records an L0 failure outside its dimension. It moves here. */
  it("the mechanics bind the floor whatever the dimension", () => {
    expect(floor.length, `${MECHANICS} has no L0 bullet`).toBeGreaterThan(0);
    expect(floor, "the L0 bullet does not bind every dimension").toMatch(/dimension/i);
    expect(floor, "the L0 bullet does not forbid a silent drop").toMatch(/record/i);
  });

  /* execute's block bound the floor before the run had its list. */
  it("the mechanics bind the floor before the run has its list", () => {
    expect(floor, "the L0 bullet does not bind before the list").toMatch(/before/i);
  });

  it.each([EXECUTE, PASS, IMPLEMENT])("%s names no L0 rule in a floor statement", (file) => {
    const text = flat(file);
    expect(text.length, `${file} is missing or empty`).toBeGreaterThan(0);
    expect(text, `${file} still carries an L0 block`).not.toMatch(/Non-negotiables|L0 is never scoped out/);
    const named = L0.filter((id) => new RegExp(`\\b${id}\\b`).test(read(file)));
    if (file !== EXECUTE) expect(named, `${file} names L0 rules`).toEqual([]);
  });

  it.each([EXECUTE, PASS])("%s takes the floor from the catalogue mechanics", (file) => {
    expect(flat(file), `${file} does not name the catalogue mechanics`).toContain("catalogue-mechanics.md");
  });

  it("the capture procedure takes the floor from the mechanics, not from pass.md", () => {
    expect(flat(CAPTURE), "capture.md still sends the floor to pass.md").not.toMatch(/L0 section of `pass\.md`/);
    expect(flat(CAPTURE), "capture.md does not name the mechanics").toContain("catalogue-mechanics.md");
  });
});

/* Contract item 3: a payload field a skill needs goes into the contract. */
describe("3. a skill that needs a new payload field adds it to the contract", () => {
  const contract = flat(CONTRACT);

  it("the contract says a new field goes into it", () => {
    expect(contract.length, `${CONTRACT} is missing or empty`).toBeGreaterThan(0);
    expect(contract, "the contract does not own new fields").toMatch(/field[^.]*(add|goes)[^.]*(here|this (file|contract))/i);
  });

  /* The review bundle that execute returned had seven parts. Each one is in
     the contract, so no caller depends on execute's own text. */
  it.each([
    "built changes", "sprint contract", "approved plan", "component inventory",
    "judgment and hybrid", "waivers applied", "evidence captured",
  ])("the contract's review bundle carries %s", (part) => {
    expect(contract, `the review bundle lost ${part}`).toContain(part);
  });

  it.each([EXECUTE, ORCHESTRATOR, PASS])("%s defines no payload field of its own", (file) => {
    const text = flat(file);
    expect(text.length, `${file} is missing or empty`).toBeGreaterThan(0);
    for (const { name, pattern } of PAYLOAD) expect(text, `${file} lists ${name}`).not.toMatch(pattern);
    expect(text, `${file} lists the review bundle`).not.toMatch(/component inventory, the in-scope judgment/i);
  });

  /* Five references point at execute's "Two ways in" and at pass.md's two
     entries. They must still land on a section that exists. */
  it("execute keeps the section its own references name", () => {
    expect(read(EXECUTE)).toMatch(/^## Two ways in/m);
  });

  it("pass.md keeps the two entries the pass skills name", () => {
    expect(read(PASS)).toMatch(/^## Two entries/m);
  });
});

/* Also true when done: the validator passes, and each dx-sync check whose
   copies are gone goes with them. The validator run itself is in
   grading-text.test.ts. */
describe("4. the sync checks for the removed copies are gone", () => {
  const validator = fs.readFileSync(VALIDATE, "utf8");

  it.each(["L0-SYNC", "LAY-SYNC"])("the validator has no %s check", (tag) => {
    expect(validator, `the validator still runs [${tag}]`).not.toContain(`[${tag}]`);
  });

  it.each(["L0-SYNC", "LAY-SYNC"])("checks/README.md documents no %s check", (tag) => {
    expect(read(CHECKS_README), `the README still documents [${tag}]`).not.toContain(`[${tag}]`);
  });

  it("no run file carries a dx-sync fence for the removed copies", () => {
    expect(holders(/dx-sync:(L0|lay-controls)\b/), "a fence is left behind").toEqual([]);
  });

  it("the validator passes", () => {
    const run = spawnSync("python3", [VALIDATE], { cwd: ROOT, encoding: "utf8" });
    expect(run.status, `${run.stdout}${run.stderr}`).toBe(0);
  });
});
