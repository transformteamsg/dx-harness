import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for dx-design-research-brief after it moved its guidance
   into references read on demand. A skill run writes the plan, so nothing here
   exercises a live run; the eval suite does that. These guard the properties
   that would silently regress instead: that the 12 components keep their order
   and their guidance, that the goal gate sits before any writing, and that a
   run reads only the guidance its study type and its inputs need. See issue
   #462. */

const SKILL_DIR = "plugins/dx-harness/skills/design/dx-design-research-brief";
const SKILL = `${SKILL_DIR}/SKILL.md`;
const COMPONENTS = `${SKILL_DIR}/references/components.md`;
const GENERATIVE = `${SKILL_DIR}/references/generative.md`;
const EVALUATIVE = `${SKILL_DIR}/references/evaluative.md`;
const INTAKE = `${SKILL_DIR}/references/intake.md`;
const EVALS = `${SKILL_DIR}/evals/evals.json`;
const BUDGET = "plugins/dx-harness/docs/token-budget-design.md";

/* A tolerant read, because the implementation creates the references. A
   missing file reads as empty and fails an assertion rather than throwing. */
function read(file: string) {
  const full = path.join(process.cwd(), file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

/* The 12 components in plan order, each with the output heading that carries
   it. Hypotheses and assumptions share one component and take two headings. */
const PLAN = [
  { component: "Project background", headings: ["PROJECT BACKGROUND"] },
  { component: "Internal stakeholders", headings: ["INTERNAL STAKEHOLDERS"] },
  { component: "Hypotheses and assumptions", headings: ["HYPOTHESES", "ASSUMPTIONS"] },
  { component: "Research statement and goals", headings: ["RESEARCH STATEMENT", "RESEARCH GOALS"] },
  { component: "Success criteria", headings: ["SUCCESS CRITERIA"] },
  { component: "Methodology", headings: ["METHODOLOGY"] },
  { component: "UX metrics", headings: ["UX METRICS"] },
  { component: "Participants and recruitment", headings: ["PARTICIPANTS AND RECRUITMENT"] },
  { component: "Deliverables and next steps", headings: ["DELIVERABLES AND NEXT STEPS"] },
  { component: "Approximate timeline", headings: ["APPROXIMATE TIMELINE"] },
  { component: "Discussion guide or task script", headings: ["DISCUSSION GUIDE / TASK SCRIPT"] },
  { component: "Resources", headings: ["RESOURCES"] },
];

/* Phrases only one conditional reference carries. Finding one in a file every
   run reads means a run that skips that reference pays for it again. */
const EVALUATIVE_TERMS = ["Single Ease Question", "UMUX", "Time on task", "tree testing"];
const GENERATIVE_TERMS = ["diary studies", "Discover people's current processes"];
const INTAKE_TERMS = ["What led you to request research support now?"];

function headingLines(text: string) {
  return text.split("\n").filter((line) => /^#{2,3} /.test(line));
}

function linkLines(text: string, file: string) {
  return text.split("\n").filter((line) => line.includes(`](references/${file})`));
}

describe("item 1: the plan has all 12 components", () => {
  it("gives each component a guidance section in components.md, in plan order", () => {
    const guidance = headingLines(read(COMPONENTS));
    const positions = PLAN.map(({ component }) => guidance.findIndex((line) => line.includes(component)));
    positions.forEach((position, i) => expect(position, PLAN[i].component).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("gives each component its output heading, in plan order", () => {
    const components = read(COMPONENTS);
    const positions = PLAN.flatMap(({ headings }) =>
      headings.map((heading) => components.search(new RegExp(`^${heading.replace("/", "\\/")}$`, "m"))),
    );
    positions.forEach((position) => expect(position).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("keeps the guidance and the output format out of SKILL.md", () => {
    const skill = read(SKILL);
    expect(skill).not.toBe("");
    expect(skill).not.toMatch(/^RESEARCH PLAN: /m);
    expect(skill).not.toMatch(/^PROJECT BACKGROUND$/m);
  });
});

describe("item 2: a request with no research goal gets a question first", () => {
  it("stops for the research goal before the step that writes the plan", () => {
    const skill = read(SKILL);
    const gate = skill.search(/no research goal/i);
    const write = skill.indexOf("](references/components.md)");
    expect(gate).toBeGreaterThan(-1);
    expect(write).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(write);
  });

  it("links the intake form once, from the branch that asks for the goal", () => {
    const links = linkLines(read(SKILL), "intake.md");
    expect(links).toHaveLength(1);
    expect(links[0]).toMatch(/stakeholder/i);
  });
});

describe("item 3: a run reads only the guidance its study type needs", () => {
  it("holds the conditional guidance in its own references", () => {
    for (const term of EVALUATIVE_TERMS) expect(read(EVALUATIVE), term).toContain(term);
    for (const term of GENERATIVE_TERMS) expect(read(GENERATIVE), term).toContain(term);
    for (const term of INTAKE_TERMS) expect(read(INTAKE), term).toContain(term);
  });

  it("keeps the conditional guidance out of the files every run reads", () => {
    const always = read(SKILL) + read(COMPONENTS);
    expect(always).not.toBe("");
    for (const term of [...EVALUATIVE_TERMS, ...GENERATIVE_TERMS, ...INTAKE_TERMS]) {
      expect(always, term).not.toContain(term);
    }
  });

  it("links each study-type reference once, on the line for its study type", () => {
    const skill = read(SKILL);
    const evaluative = linkLines(skill, "evaluative.md");
    const generative = linkLines(skill, "generative.md");
    expect(evaluative.filter((line) => /^- .*-> evaluative/.test(line))).toHaveLength(1);
    expect(generative.filter((line) => /^- .*-> generative/.test(line))).toHaveLength(1);
    const generativeLine = generative.find((line) => /-> generative/.test(line)) ?? "";
    expect(generativeLine).not.toContain("evaluative.md");
  });

  it("checks for a hybrid study before an evaluative one, so a hybrid study reads both references", () => {
    const skill = read(SKILL);
    const hybrid = skill.search(/^- .*-> hybrid/m);
    const evaluative = skill.search(/^- .*-> evaluative/m);
    expect(hybrid).toBeGreaterThan(-1);
    expect(evaluative).toBeGreaterThan(-1);
    expect(hybrid).toBeLessThan(evaluative);
  });

  it("gives a hybrid study its own timeline", () => {
    expect(read(EVALUATIVE)).toMatch(/^\*\*Hybrid timeline\*\*/m);
  });

  it("links the components reference", () => {
    expect(read(SKILL)).toContain("](references/components.md)");
  });
});

describe("also true when done", () => {
  it("SKILL.md frontmatter holds a name and a single-quoted description only", () => {
    const skill = read(SKILL);
    const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    const keys = frontmatter.split("\n").map((line) => line.split(":")[0]);
    expect(keys).toEqual(["name", "description"]);
    expect(frontmatter).toMatch(/^description: '/m);
  });

  it("ships an eval suite with a case for each run behaviour", () => {
    const evals = JSON.parse(read(EVALS) || "{}");
    expect(evals.skill_name).toBe("dx-design-research-brief");
    const names: string[] = (evals.evals ?? []).map((e: { name: string }) => e.name);
    for (const name of [
      "plan-has-all-twelve-components",
      "missing-goal-asked-first",
      "evaluative-skips-generative-guidance",
      "generative-skips-evaluative-guidance",
      "hybrid-reads-both-references",
    ]) {
      expect(names, name).toContain(name);
    }
  });

  it("records the run tokens against the 3,667-token baseline", () => {
    const row = read(BUDGET)
      .split("\n")
      .find((line) => line.startsWith("|") && line.includes("issues/462"));
    expect(row).toBeDefined();
    expect(row).toContain("3,667");
  });
});
