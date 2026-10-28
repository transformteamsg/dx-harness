import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for the copy rules after they split into the writing
   rules, which a build reads, and the review method, which stays with the copy
   pass. A skill run decides what it reads, so nothing here exercises a live
   run. These guard the properties that would silently regress instead: that a
   build never pays for the review method, that the pass still reaches both
   parts, that a build with no copy reads neither, and that no rule sits in
   both parts. See issue #460. */

const HARNESS = "plugins/dx-harness";
const RULES = `${HARNESS}/procedures/copy-rules.md`;
const COPY_SKILL = `${HARNESS}/skills/design/dx-design-copy/SKILL.md`;
const EXECUTE_DIR = `${HARNESS}/skills/design/dx-design-execute`;
const EXECUTE_IMPLEMENT = `${EXECUTE_DIR}/references/implement.md`;
const SHARED_IMPLEMENT = `${HARNESS}/procedures/implement.md`;
const BUDGET = `${HARNESS}/docs/token-budget-design.md`;

/* The files a build reads from entry to the end of implement. */
const BUILD_READS = [
  `${EXECUTE_DIR}/SKILL.md`,
  `${EXECUTE_DIR}/references/intent.md`,
  `${EXECUTE_DIR}/references/plan.md`,
  `${EXECUTE_DIR}/grill.md`,
  EXECUTE_IMPLEMENT,
  `${EXECUTE_DIR}/implement-craft.md`,
  SHARED_IMPLEMENT,
  `${HARNESS}/procedures/plan-approval.md`,
  `${HARNESS}/procedures/catalogue-mechanics.md`,
];

/* A tolerant read, because the implementation creates the rules file. A
   missing file reads as empty and fails an assertion rather than throwing. */
function read(file: string) {
  const full = path.join(process.cwd(), file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

/* Phrases only the writing rules carry. */
const WRITING_TERMS = [
  "Kind Utility",
  "Clear but not cold",
  "Affirming, brief",
  "Lead with purpose, not mechanism",
  "Copula avoidance",
  "what happened, what it means for the teacher, what to do next",
  "A name that requires explanation has already failed",
];

/* Phrases only the review method carries. */
const REVIEW_TERMS = [
  "**Purposeful.**",
  "**Conversational.**",
  "IDN-3 tone register",
  "Mandated programme names",
  "dimension subset",
  "return-to-caller",
];

function linkLines(text: string, name: string) {
  return text.split("\n").filter((line) => line.includes(name));
}

describe("item 1: a build reads the writing rules only", () => {
  it("holds the writing rules in procedures/copy-rules.md", () => {
    const rules = read(RULES);
    for (const term of WRITING_TERMS) expect(rules, term).toContain(term);
  });

  it("keeps the review method out of the writing rules", () => {
    const rules = read(RULES);
    expect(rules).not.toBe("");
    for (const term of REVIEW_TERMS) expect(rules, term).not.toContain(term);
  });

  it("sends the implement phase to the writing rules", () => {
    expect(read(EXECUTE_IMPLEMENT)).toContain("procedures/copy-rules.md");
  });

  it("names the copy skill in no file a build reads", () => {
    for (const file of BUILD_READS) {
      const text = read(file);
      expect(text, `${file} is missing`).not.toBe("");
      expect(text, file).not.toContain("dx-design-copy/SKILL.md");
      expect(text, file).not.toMatch(/copy pass skill/i);
    }
  });
});

describe("item 2: the copy review reads the writing rules and the review method", () => {
  it("keeps the review method in the copy skill", () => {
    const skill = read(COPY_SKILL);
    for (const term of REVIEW_TERMS) expect(skill, term).toContain(term);
  });

  it("tells the pass to read the writing rules", () => {
    const named = linkLines(read(COPY_SKILL), "../../../procedures/copy-rules.md");
    expect(named.length).toBeGreaterThan(0);
    expect(named.join(" ")).toMatch(/read/i);
  });
});

describe("item 3: a build with no copy reads no copy rules", () => {
  it("names the writing rules only on a line about user-facing text", () => {
    const named = BUILD_READS.flatMap((file) => linkLines(read(file), "copy-rules.md"));
    expect(named.length).toBeGreaterThan(0);
    for (const line of named) expect(line).toMatch(/user-facing text/i);
  });

  it("says a build that changes no user-facing text reads no copy rules", () => {
    expect(read(EXECUTE_IMPLEMENT).replace(/\s+/g, " ")).toMatch(/no user-facing text[^.]*reads? no copy rules/i);
  });
});

describe("also true when done", () => {
  it("puts no rule in both parts", () => {
    const skill = read(COPY_SKILL);
    expect(skill).not.toBe("");
    for (const term of WRITING_TERMS) expect(skill, term).not.toContain(term);
    const ruleLines = new Set(
      read(RULES)
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 40),
    );
    expect(ruleLines.size).toBeGreaterThan(0);
    for (const line of skill.split("\n").map((l) => l.trim())) expect(ruleLines.has(line), line).toBe(false);
  });

  it("moves each synced block with its rule", () => {
    const rules = read(RULES);
    const skill = read(COPY_SKILL);
    for (const name of ["voice-attributes", "tone-context", "slp9-buzzwords"]) {
      expect(rules, name).toContain(`<!-- dx-sync:${name}`);
      expect(skill, name).not.toContain(`<!-- dx-sync:${name}`);
    }
    expect(skill).toContain("<!-- dx-sync:uitext-sequence");
    expect(rules).not.toContain("<!-- dx-sync:uitext-sequence");
  });

  it("records the copy-rule tokens one build reads against the 3,728-token baseline", () => {
    const row = read(BUDGET)
      .split("\n")
      .find((line) => line.startsWith("|") && line.includes("issues/460"));
    expect(row).toBeDefined();
    expect(row).toContain("3,728");
  });
});
