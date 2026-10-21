import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for dx-design-research-brief after it moved its guidance
   into references read on demand. A skill run writes the plan, so nothing here
   exercises a live run; the eval suite does that. These guard the properties
   that would silently regress instead: that the 12 components keep their order
   and their guidance, that the goal gate sits before any writing, and that only
   a study type that needs it reaches the UX metrics guidance. See issue #462. */

const SKILL_DIR = "plugins/dx-harness/skills/design/dx-design-research-brief";
const SKILL = `${SKILL_DIR}/SKILL.md`;
const COMPONENTS = `${SKILL_DIR}/references/components.md`;
const UX_METRICS = `${SKILL_DIR}/references/ux-metrics.md`;
const OUTPUT_FORMAT = `${SKILL_DIR}/references/output-format.md`;
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

/* Phrases only the UX metrics guidance carries. Finding one in a file every
   run reads means a generative run pays for it again. */
const UX_METRIC_TERMS = ["Single Ease Question", "UMUX", "Time on task"];

function headingLines(text: string) {
  return text.split("\n").filter((line) => /^#{2,3} /.test(line));
}

describe("item 1: the plan has all 12 components", () => {
  it("lists the 12 components in plan order in SKILL.md", () => {
    const skill = read(SKILL);
    expect(skill).not.toBe("");
    const positions = PLAN.map(({ component }) => skill.indexOf(component));
    positions.forEach((position, i) => expect(position, PLAN[i].component).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("gives each component a guidance section in a reference", () => {
    const guidance = headingLines(read(COMPONENTS) + "\n" + read(UX_METRICS));
    for (const { component } of PLAN) {
      expect(guidance.some((line) => line.includes(component)), component).toBe(true);
    }
  });

  it("gives each component a heading in the output format", () => {
    const format = read(OUTPUT_FORMAT);
    expect(format).not.toBe("");
    for (const { component, headings } of PLAN) {
      for (const heading of headings) {
        expect(format, `${component}: ${heading}`).toMatch(new RegExp(`^${heading.replace("/", "\\/")}`, "m"));
      }
    }
  });

  it("keeps the guidance and the output format out of SKILL.md", () => {
    const skill = read(SKILL);
    expect(skill).not.toBe("");
    expect(skill).not.toMatch(/^RESEARCH PLAN: /m);
    expect(skill).not.toContain("Bad vs. better goal examples");
  });
});

describe("item 2: a request with no research goal gets a question first", () => {
  it("stops for the research goal before the step that writes the plan", () => {
    const skill = read(SKILL);
    const gate = skill.search(/no research goal/i);
    const write = skill.indexOf(PLAN[0].component);
    expect(gate).toBeGreaterThan(-1);
    expect(write).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(write);
  });
});

describe("item 3: only a study that needs it reads the UX metrics guidance", () => {
  it("holds the UX metrics guidance in its own reference", () => {
    const metrics = read(UX_METRICS);
    for (const term of UX_METRIC_TERMS) expect(metrics, term).toContain(term);
  });

  it("keeps the UX metrics guidance out of the files every run reads", () => {
    const always = read(SKILL) + read(COMPONENTS) + read(OUTPUT_FORMAT);
    expect(always).not.toBe("");
    for (const term of UX_METRIC_TERMS) expect(always, term).not.toContain(term);
  });

  it("links the UX metrics reference once, under the evaluative branch, and skips it for generative", () => {
    const skill = read(SKILL);
    const links = skill.split("\n").filter((line) => line.includes("](references/ux-metrics.md)"));
    expect(links).toHaveLength(1);
    expect(links[0]).toMatch(/evaluative/i);
    expect(skill).toMatch(/generative[^\n]*(do not|does not|skip)[^\n]*ux-metrics\.md|ux-metrics\.md[^\n]*generative/i);
  });

  it("links the components and the output format references", () => {
    const skill = read(SKILL);
    expect(skill).toContain("](references/components.md)");
    expect(skill).toContain("](references/output-format.md)");
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
      "evaluative-reads-ux-metrics",
      "generative-skips-ux-metrics",
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
