import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for the trim of dx-design-critique, dx-design-language,
   dx-design-research-brief, and dx-design-feedback. A skill run does the
   reading, so nothing here exercises a live run; the behaviour baseline that
   dx-trim-doc builds does that. These guard what would silently regress
   instead: a second copy of a rule, and the one contradiction the trim
   settles. See issue #505. */

const DESIGN = "plugins/dx-harness/skills/design";
const CRITIQUE_DIR = `${DESIGN}/dx-design-critique`;
const CRITIQUE_SKILL = `${CRITIQUE_DIR}/SKILL.md`;
const CRITIQUE = `${CRITIQUE_DIR}/critique.md`;
const REPORT = `${CRITIQUE_DIR}/report.md`;
const LANGUAGE_DIR = `${DESIGN}/dx-design-language`;
const LANGUAGE = ["SKILL.md", "walkthrough.md", "health-scan.md"].map((f) => `${LANGUAGE_DIR}/${f}`);
const BRIEF = `${DESIGN}/dx-design-research-brief`;
const COMPONENTS = `${BRIEF}/references/components.md`;
const BRIEF_EVALS = `${BRIEF}/evals/evals.json`;
const FEEDBACK = `${DESIGN}/dx-design-feedback/SKILL.md`;

function read(file: string) {
  const full = path.join(process.cwd(), file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function flat(file: string) {
  return read(file).replace(/\s+/g, " ");
}

/* The files among `files` whose flattened text matches a pattern. */
function holders(files: string[], pattern: RegExp) {
  return files.filter((file) => pattern.test(flat(file)));
}

/* The text of one `### ` section of components.md, up to the next heading. */
function component(number: number) {
  const text = read(COMPONENTS);
  const start = text.search(new RegExp(`^### ${number}\\. `, "m"));
  if (start < 0) return "";
  const rest = text.slice(start);
  const body = rest.indexOf("\n");
  const end = body < 0 ? -1 : rest.slice(body).search(/^##/m) + body;
  return end < 0 ? rest : rest.slice(0, end);
}

describe("the research brief settles the discussion guide", () => {
  it("component 11 links to the guide and never puts it in the plan", () => {
    const guide = component(11).replace(/\s+/g, " ");
    expect(guide).not.toBe("");
    expect(guide).toMatch(/link/i);
    expect(guide, "component 11 still offers to hold the guide in the plan").not.toMatch(/in the plan|introduction, the questions/i);
  });

  it("the output format leaves the guide as a link, not as included text", () => {
    const format = read(COMPONENTS).split("DISCUSSION GUIDE / TASK SCRIPT\n")[1]?.split("\n")[0] ?? "";
    expect(format).toMatch(/link/i);
    expect(format, "the output format still offers to include the guide").not.toMatch(/included here/i);
  });

  it("SKILL.md states the same rule: no guide written, and component 11 links to it", () => {
    const rule = flat(`${BRIEF}/SKILL.md`);
    expect(rule).toMatch(/do not write[^.]*discussion guide/i);
    expect(rule).toMatch(/component 11 links to the guide/i);
  });

  it("components.md states rules without arguing for them", () => {
    expect(read(COMPONENTS)).not.toMatch(/\bbecause\b/i);
  });

  it("ships an eval case for an interview study's discussion guide", () => {
    const evals = JSON.parse(read(BRIEF_EVALS) || "{}");
    const names: string[] = (evals.evals ?? []).map((e: { name: string }) => e.name);
    expect(names).toContain("discussion-guide-linked-not-written");
  });
});

describe("the critique report is described by what the agent controls", () => {
  it("report.md does not describe the HTML the script builds", () => {
    const report = flat(REPORT);
    expect(report).not.toBe("");
    for (const layout of [
      /embedded as a base64/i,
      /prefers-color-scheme/i,
      /green left edge/i,
      /~?400px/i,
      /figcaption/i,
      /grid rows/i,
      /locked, in this order/i,
    ]) {
      expect(report, `report.md still describes the layout: ${layout}`).not.toMatch(layout);
    }
  });

  it("report.md keeps the agent's side: the findings file is what changes the report", () => {
    const report = flat(REPORT);
    expect(report).toMatch(/changing the findings file, not the HTML/i);
    expect(report).toMatch(/considered and declined/i);
    expect(report).toMatch(/keeps its S-number/i);
  });
});

describe("approval on the ticket is explained once in dx-design-critique", () => {
  const files = [CRITIQUE_SKILL, CRITIQUE, REPORT];

  it("only SKILL.md says how the human approves by S-number", () => {
    expect(holders(files, /(replies|approves?)[^.]*S-numbers?|S-numbers?[^.]*approv/i)).toEqual([CRITIQUE_SKILL]);
  });

  it("only SKILL.md sets the not accepted state", () => {
    expect(holders(files, /not accepted/i)).toEqual([CRITIQUE_SKILL]);
  });

  it("S names only a suggestion number, never a cost", () => {
    expect(holders(files, /\(S\/M\)/)).toEqual([]);
  });
});

describe("dx-design-language states each rule once", () => {
  it("only SKILL.md says the skill never writes product code", () => {
    expect(holders(LANGUAGE, /never write (product |the )?code/i)).toEqual([LANGUAGE[0]]);
  });

  it("only walkthrough.md carries the ten-section pass and the rejected-line rule", () => {
    expect(holders(LANGUAGE, /ten sections/i)).toEqual([LANGUAGE[1]]);
    expect(holders(LANGUAGE, /past a rejected line/i)).toEqual([LANGUAGE[1]]);
  });
});

describe("dx-design-feedback states each rule once", () => {
  it("the unattended rule appears once", () => {
    expect(flat(FEEDBACK).match(/unattended/gi) ?? []).toHaveLength(1);
  });

  it("step 1 does not restate the hold-and-finish rule", () => {
    expect(flat(FEEDBACK)).not.toMatch(/die with the session/i);
    expect(flat(FEEDBACK)).not.toMatch(/file paperwork/i);
  });
});
