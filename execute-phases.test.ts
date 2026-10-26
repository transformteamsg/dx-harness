import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for dx-design-execute after it moved each phase into a
   reference read on demand. A skill run decides what it reads, so nothing here
   exercises a live run; the eval suite does that. These guard the properties
   that would silently regress instead: that a modification never pays for the
   diverge or flow text, that a new page meets each phase file in phase order,
   and that the plan gate binds from SKILL.md alone. See issue #458. */

const SKILL_DIR = "plugins/dx-harness/skills/design/dx-design-execute";
const SKILL = `${SKILL_DIR}/SKILL.md`;
const REFS = `${SKILL_DIR}/references`;
const INTENT = `${REFS}/intent.md`;
const DIVERGE = `${REFS}/diverge.md`;
const FLOW = `${REFS}/flow.md`;
const PLAN = `${REFS}/plan.md`;
const IMPLEMENT = `${REFS}/implement.md`;
const VERIFY = `${SKILL_DIR}/verify.md`;
const RULE_PROPOSAL = `${REFS}/rule-proposal.md`;
const GRILL = `${SKILL_DIR}/grill.md`;
const CRAFT = `${SKILL_DIR}/implement-craft.md`;
const EVALS = `${SKILL_DIR}/evals/evals.json`;
const BUDGET = "plugins/dx-harness/docs/token-budget-design.md";

/* A tolerant read, because the implementation creates the references. A
   missing file reads as empty and fails an assertion rather than throwing. */
function read(file: string) {
  const full = path.join(process.cwd(), file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

/* The phase files in run order, each with a phrase only its phase body
   carries, and the name SKILL.md links it by. */
const PHASES = [
  { file: INTENT, link: "references/intent.md", term: "Component inventory" },
  { file: DIVERGE, link: "references/diverge.md", term: "visual thesis" },
  { file: PLAN, link: "references/plan.md", term: "Plan summary table" },
  { file: IMPLEMENT, link: "references/implement.md", term: "implement-craft.md" },
  { file: VERIFY, link: "verify.md", term: "Deterministic controls" },
  { file: RULE_PROPOSAL, link: "references/rule-proposal.md", term: "rejected directions" },
];

/* Phrases only the diverge or the flow text carries. Finding one in a file a
   modification reads means that run pays for the text it skips. */
const DIVERGE_TERMS = ["visual thesis", "Compose, don't fill", "self-contained HTML"];
const FLOW_TERMS = ["returns tomorrow", "Escapability", "A flow with only its happy path"];

/* The files a modification with a fixed structure reads. */
const MODIFICATION_READS = [SKILL, INTENT, PLAN, GRILL, IMPLEMENT, CRAFT, VERIFY, RULE_PROPOSAL];

function lines(text: string) {
  return text.split("\n");
}

function linkLines(text: string, name: string) {
  return lines(text).filter((line) => line.includes(name));
}

describe("item 1: a modification with a fixed structure skips the diverge and flow text", () => {
  it("holds the diverge and flow text in their own references", () => {
    for (const term of DIVERGE_TERMS) expect(read(DIVERGE), term).toContain(term);
    for (const term of FLOW_TERMS) expect(read(FLOW), term).toContain(term);
  });

  it("keeps the diverge and flow text out of every file a modification reads", () => {
    for (const file of MODIFICATION_READS) {
      const text = read(file);
      expect(text, `${file} is missing`).not.toBe("");
      for (const term of [...DIVERGE_TERMS, ...FLOW_TERMS]) expect(text, `${file}: ${term}`).not.toContain(term);
    }
  });

  it("names the diverge file only on a line that skips it when the structure is fixed", () => {
    const named = linkLines(read(SKILL), "references/diverge.md");
    expect(named.length).toBeGreaterThan(0);
    for (const line of named) expect(line).toMatch(/skip/i);
    for (const line of named) expect(line).toMatch(/structure is fixed/i);
  });

  it("names the diverge file from SKILL.md only", () => {
    for (const file of MODIFICATION_READS.filter((f) => f !== SKILL)) {
      expect(read(file), file).not.toContain("diverge.md");
    }
  });

  it("names the flow file only on a line that limits it to a flow or a multi-step interaction", () => {
    const named = MODIFICATION_READS.flatMap((file) => linkLines(read(file), "references/flow.md"));
    expect(named.length).toBeGreaterThan(0);
    for (const line of named) expect(line).toMatch(/multi-step/i);
  });
});

describe("item 2: a new page reads each phase file when it enters that phase, in order", () => {
  it("gives each phase its own file with its phase body", () => {
    for (const { file, term } of PHASES) expect(read(file), file).toContain(term);
  });

  it("links each phase file from SKILL.md in phase order", () => {
    const skill = read(SKILL);
    const positions = PHASES.map(({ link }) => skill.indexOf(`](${link})`));
    positions.forEach((position, i) => expect(position, PHASES[i].link).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("tells the run to read a phase file when it enters that phase", () => {
    expect(read(SKILL).replace(/\s+/g, " ")).toMatch(/read (each|a) phase file when the run enters (that|its) phase/i);
  });

  it("does not send a phase file to a later phase file", () => {
    PHASES.forEach(({ file }, i) => {
      const text = read(file);
      for (const later of PHASES.slice(i + 1)) {
        const name = later.link.split("/").pop() ?? "";
        expect(text, `${file} names ${name}`).not.toMatch(new RegExp(`(references/|\\()${name.replace(".", "\\.")}`));
      }
    });
  });
});

describe("item 3: the plan gate holds without the implement file", () => {
  const gates = (() => {
    const text = read(SKILL);
    const start = text.indexOf("## Gates");
    const end = text.indexOf("\n## ", start + 1);
    return start === -1 ? "" : text.slice(start, end === -1 ? undefined : end).replace(/\s+/g, " ");
  })();

  it("has a Gates section in SKILL.md", () => {
    expect(gates).not.toBe("");
  });

  it("stops any product edit before plan approval", () => {
    expect(gates).toMatch(/edit no product file before (the )?plan (is )?approv/i);
  });

  it("runs the branch guard before any edit", () => {
    expect(gates).toMatch(/branch guard/i);
    expect(gates).toContain("dx-design-git");
  });

  it("states the gates before the run order sends the run to the implement file", () => {
    const skill = read(SKILL);
    expect(skill.indexOf("## Gates")).toBeGreaterThan(-1);
    expect(skill.indexOf("## Gates")).toBeLessThan(skill.indexOf("](references/implement.md)"));
  });
});

describe("also true when done", () => {
  it("SKILL.md holds no phase body", () => {
    const skill = read(SKILL);
    expect(skill).not.toBe("");
    expect(skill).not.toMatch(/^## Phase/m);
    for (const { term } of PHASES.filter(({ file }) => file !== IMPLEMENT && file !== VERIFY)) {
      expect(skill, term).not.toContain(term);
    }
    for (const term of ["Interaction plan", "Interface craft", "Clarify the ask"]) expect(skill, term).not.toContain(term);
  });

  it("SKILL.md frontmatter holds a name and a single-quoted description only", () => {
    const frontmatter = read(SKILL).match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    const keys = frontmatter.split("\n").map((line) => line.split(":")[0]);
    expect(keys).toEqual(["name", "description"]);
    expect(frontmatter).toMatch(/^description: '/m);
  });

  it("dx-design-flow points at the flow reference, not at SKILL.md", () => {
    const flow = read("plugins/dx-harness/skills/design/dx-design-flow/SKILL.md");
    expect(flow).toContain("../dx-design-execute/references/flow.md");
    expect(flow).not.toMatch(/section of `\.\.\/dx-design-execute\/SKILL\.md`/);
  });

  it("ships an eval suite with a case for each run behaviour", () => {
    const evals = JSON.parse(read(EVALS) || "{}");
    expect(evals.skill_name).toBe("dx-design-execute");
    const names: string[] = (evals.evals ?? []).map((e: { name: string }) => e.name);
    for (const name of [
      "modification-skips-diverge-and-flow",
      "new-page-reads-each-phase-in-order",
      "gate-holds-before-plan-approval",
    ]) {
      expect(names, name).toContain(name);
    }
  });

  it("records a modification run and a new-page run against the 83,037-token baseline", () => {
    const row = read(BUDGET)
      .split("\n")
      .find((line) => line.startsWith("|") && line.includes("issues/458"));
    expect(row).toBeDefined();
    expect(row).toContain("83,037");
    expect(row).toMatch(/modification/i);
    expect(row).toMatch(/new page/i);
  });
});
