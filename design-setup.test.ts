import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for dx-design-setup after it stopped restating setup.md.
   A skill run does the setup, so nothing here exercises a live run; the eval
   suite does that. These guard the properties that would silently regress
   instead: a second copy of a rule that setup.md states, and a description
   that offers what the body does not do. See issue #501. */

const SKILL_DIR = "plugins/dx-harness/skills/design/dx-design-setup";
const SKILL = `${SKILL_DIR}/SKILL.md`;
const SETUP = `${SKILL_DIR}/setup.md`;
const EVALS = `${SKILL_DIR}/evals/evals.json`;
const HARNESS = "plugins/dx-harness";

/* A tolerant read, because the implementation creates the eval suite. A
   missing file reads as empty and fails an assertion rather than throwing. */
function read(file: string) {
  const full = path.join(process.cwd(), file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function flat(file: string) {
  return read(file).replace(/\s+/g, " ");
}

/* Every markdown file a design run can read. Evals are test data, not run text. */
function runFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(path.join(process.cwd(), dir), { withFileTypes: true })) {
      const rel = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        if (entry.name !== "evals") walk(rel);
      } else if (entry.name.endsWith(".md")) {
        out.push(rel);
      }
    }
  };
  for (const dir of [`${HARNESS}/skills/design`, `${HARNESS}/agents`, `${HARNESS}/procedures`]) walk(dir);
  return out.sort();
}

function description(file: string) {
  return read(file).match(/^description: '(.*)'$/m)?.[1] ?? "";
}

/* The phrases that carry the install-consent rule. */
const CONSENT = [/ask before (you )?install/i, /install nothing/i, /missing, not installed/i, /once you have a yes/i];

describe("item 3: an unattended run installs nothing and reports the tool as missing", () => {
  it("setup.md states the unattended branch of the install-consent rule", () => {
    const setup = flat(SETUP);
    expect(setup).toMatch(/In an unattended run, install nothing/);
    expect(setup).toMatch(/marked "missing, not installed"/);
  });

  it("SKILL.md sends the run to the setup.md checklist", () => {
    expect(read(SKILL)).toMatch(/`setup\.md`/);
  });

  it("ships an eval case for an unattended run with a missing tool", () => {
    const evals = JSON.parse(read(EVALS) || "{}");
    const unattended = (evals.evals ?? []).find((e: { name: string }) => e.name === "unattended-missing-tool");
    expect(unattended, "no unattended-missing-tool case").toBeDefined();
    const items = unattended.assertions.map((a: { text: string }) => a.text).join(" ");
    expect(items).toMatch(/installs nothing|runs no install/i);
    expect(items).toMatch(/missing, not installed/);
  });
});

describe("item 4: the install-consent rule appears only in setup.md", () => {
  it("no run file other than setup.md carries the rule", () => {
    for (const phrase of CONSENT) {
      const holders = runFiles().filter((file) => file !== SETUP && phrase.test(flat(file)));
      expect(holders, String(phrase)).toEqual([]);
    }
  });

  it("SKILL.md does not restate the verify rule or the close-out of setup.md", () => {
    const skill = flat(SKILL);
    expect(skill).not.toMatch(/Verify, then say so/);
    expect(skill).not.toMatch(/what passed, what was installed, and what is still missing/);
    expect(skill).not.toMatch(/if it passes, move on/);
  });
});

describe("item 5: the description offers only what the body does", () => {
  it("does not offer to teach or orient someone in the harness", () => {
    const offer = description(SKILL);
    expect(offer).not.toBe("");
    expect(offer).not.toMatch(/teach me the harness/i);
    expect(offer).not.toMatch(/orient/i);
  });

  /* A guard, not a change: the body routes this ask today, and the trim keeps it. */
  it("still routes a request to learn the harness to dx-design", () => {
    const body = flat(SKILL).replace(/^---.*?---/, "");
    expect(body).toMatch(/(new to|learn|orientation)[^.]*`(\/dx-harness:)?dx-design`/i);
  });
});

describe("item 1: an eval suite records the behaviour the trim must keep", () => {
  it("ships a case for each gate in the skill", () => {
    const evals = JSON.parse(read(EVALS) || "{}");
    expect(evals.skill_name).toBe("dx-design-setup");
    const names: string[] = (evals.evals ?? []).map((e: { name: string }) => e.name);
    for (const name of [
      "attended-missing-tool",
      "unattended-missing-tool",
      "design-md-ask",
      "repo-adoption-ask",
      "page-design-ask",
      "learn-the-harness-ask",
    ]) {
      expect(names, name).toContain(name);
    }
  });
});
