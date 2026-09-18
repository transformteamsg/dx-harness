import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Guards for issue #306: the harness must not ship a brand essence. A product's
   essence comes from its own DESIGN.md, and the harness's own is a worked
   example in docs/, never a rule an adopter is graded by.

   What is NOT tested here: the conversational fallback itself. "Interactive
   skills ask, once" is behaviour an agent performs in a live session, so no
   unit test can exercise it. These guard the written instruction that behaviour
   reads from, which is where it broke in this PR: pass.md stated the
   dispatched-only rule unconditionally and silently removed the ask branch from
   all five passes. */

const HARNESS = path.join(process.cwd(), "plugins", "dx-harness");

/* The directories an agent loads at runtime. docs/ is deliberately absent: it
   holds the DESIGN.md spec and template, where the portfolio's own essence is
   the worked example. */
const AGENT_FACING = ["skills", "agents", "procedures", "standards"];

function markdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return markdownFiles(entryPath);
    return entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

function agentFacingFiles(): string[] {
  return AGENT_FACING.flatMap((dir) => markdownFiles(path.join(HARNESS, dir)));
}

function read(...segments: string[]): string {
  return fs.readFileSync(path.join(HARNESS, ...segments), "utf8");
}

describe("design essence", () => {
  it("is never asserted by a skill, agent, or control", () => {
    const files = agentFacingFiles();

    /* Assert the walk found something before asserting what it did not find:
       a broken glob would otherwise pass this test by reading nothing. */
    expect(files.length).toBeGreaterThan(50);

    const offenders = files
      .filter((file) => fs.readFileSync(file, "utf8").includes("Kind Utility"))
      .map((file) => path.relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });

  it("has both fallback branches written down, for the two kinds of caller", () => {
    const procedure = read("procedures", "design-essence.md");

    expect(procedure).toContain("Interactive skills ask");
    expect(procedure).toContain("Subagents say so");
  });

  it("keeps the cannot-ask rule scoped to the dispatched entry", () => {
    const pass = read("skills", "design", "dx-design-critique", "pass.md");

    /* pass.md serves both entries, so a flat "you cannot ask" reaches the
       direct one too. The paragraph that says so has to name which entry it
       means. Scoped to the paragraph, not a character window: the "Two entries"
       heading follows close behind, and a window wide enough to reach it would
       pass on the broken wording too. */
    const paragraph = pass
      .split(/\n\s*\n/)
      .find((block) => block.includes("cannot ask"));

    expect(paragraph, "no paragraph states the cannot-ask rule").toBeDefined();
    expect(paragraph).toMatch(/direct/i);
  });
});
