import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for the code-level definition of done. A skill run applies
   the procedure, so nothing here can exercise a live run against an issue.
   These guard the properties that would silently regress instead: that the
   template stays inside what a code change controls, that it points at the
   repository's own contributing guide rather than restating it, that the two
   skills consuming it reference it, and that every item names the evidence a
   reader checks it by. See issue #317. */

const HARNESS = "plugins/dx-harness";
const PROCEDURE = `${HARNESS}/procedures/definition-of-done.md`;

/* A tolerant read, because the implementation half creates the procedure. A
   missing file reads as empty and fails an assertion, rather than throwing
   before the assertion runs. Every block asserting an absence also asserts the
   content is non-empty, so no negative assertion passes because a file is
   absent. */
function read(file: string) {
  const full = path.join(process.cwd(), file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

/* What the definition of done must not reach for. A code change cannot make any
   of these true, so an item naming one blocks an author on work they cannot do.
   Taken from the acceptance criteria of #317, as word stems. */
const OUTSIDE_A_CODE_CHANGE = [
  "deploy",
  "release",
  "environment",
  "monitor",
  "sign-off",
  "sign off",
];

/* What a restatement of the contributing guide would look like. The guide names
   the commands and holds the rule that the checks pass before a request leaves
   draft, so a second copy of either is the drift this guards against. */
const OWNED_BY_CONTRIBUTING = ["pnpm", "npm run", "yarn", "draft"];

/* The two skills #317 names as consumers. `dx-write-implementation` is not one
   of them: it hands its branch on, and the request opens through dx-create-pr,
   which applies the procedure there. */
const ROUTER = `${HARNESS}/skills/engineering/dx-implement-issue/SKILL.md`;
const PULL_REQUEST = `${HARNESS}/skills/engineering/dx-create-pr/SKILL.md`;

/* The seven items, from the in-scope list in #310. Each one is a literal here
   and a row in the procedure, so the row assertions read one source and the
   file reads another. */
const ITEMS = [
  { id: "DoD-1", text: "covered by a test or by a written manual case" },
  { id: "DoD-2", text: "boundaries, error paths and concurrent writes" },
  { id: "DoD-3", text: "the repository's own checks pass" },
  { id: "DoD-4", text: "the diff touches only what the issue names" },
  { id: "DoD-5", text: "one contract item per commit" },
  { id: "DoD-6", text: "documentation and comments the change made wrong" },
  { id: "DoD-7", text: "every new dependency has a stated reason" },
];

/* An item resting on the author's word rather than on the branch. A reviewer
   cannot check any of these by looking, so an evidence cell carrying one gives
   the item back to whoever wrote it. */
const SELF_ATTESTATION = [
  "you believe",
  "you are satisfied",
  "state that you",
  "confirm that you",
  "in your judgement",
];

/* The item rows of the procedure's table, as cells. */
function rows(procedure: string) {
  return procedure
    .split("\n")
    .filter((line) => line.startsWith("| DoD-"))
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    );
}

/* One section of a skill file, from its heading to the next heading at the same
   level. */
function section(body: string, heading: string) {
  const start = body.indexOf(heading);
  if (start === -1) return "";
  const rest = body.slice(start + heading.length);
  const end = rest.indexOf("\n### ");
  return end === -1 ? rest : rest.slice(0, end);
}

describe("the template stays inside what a code change controls", () => {
  it("names nothing outside it", () => {
    const procedure = read(PROCEDURE);
    expect(procedure.length, `${PROCEDURE} is missing or empty`).toBeGreaterThan(0);
    for (const term of OUTSIDE_A_CODE_CHANGE) {
      expect(procedure.toLowerCase(), `${PROCEDURE} names "${term}"`).not.toContain(term);
    }
  });
});

describe("a rule the contributing guide already states has one home", () => {
  it("references the guide, and restates nothing it owns", () => {
    const procedure = read(PROCEDURE);
    expect(procedure, `${PROCEDURE} is missing or empty`).toContain("CONTRIBUTING.md");
    for (const term of OWNED_BY_CONTRIBUTING) {
      expect(procedure.toLowerCase(), `${PROCEDURE} restates "${term}"`).not.toContain(term);
    }
  });
});

describe("the skills that consume the definition of done reference it", () => {
  it("the router names the procedure", () => {
    expect(read(ROUTER), `${ROUTER} does not name the procedure`).toContain(
      "definition-of-done.md",
    );
  });

  it("dx-create-pr names it where its test plan sits", () => {
    const body = read(PULL_REQUEST);
    const step = section(body, "### Step 4: Write the body");
    expect(step.length, `${PULL_REQUEST} has no Step 4 section`).toBeGreaterThan(0);
    expect(step, "Step 4 does not name the procedure").toContain("definition-of-done.md");
  });

  it("neither skill restates the item list", () => {
    for (const consumer of [ROUTER, PULL_REQUEST]) {
      const body = read(consumer);
      expect(body.length, `${consumer} is missing or empty`).toBeGreaterThan(0);
      for (const item of ITEMS) {
        expect(body, `${consumer} restates "${item.text}"`).not.toContain(item.text);
      }
    }
  });
});

describe("every item names the evidence a reader checks it by", () => {
  const table = rows(read(PROCEDURE));

  it("carries a row for each of the seven items, in order", () => {
    expect(table.map((row) => row[0])).toEqual(ITEMS.map((item) => item.id));
  });

  for (const item of ITEMS) {
    it(`${item.id} names its item and how it is checked`, () => {
      const row = table.find((cells) => cells[0] === item.id) ?? [];
      expect(row.length, `${item.id} has no row of three cells`).toBe(3);
      expect(row[1], `${item.id} does not name its item`).toContain(item.text);
      expect(row[2].length, `${item.id} names no evidence`).toBeGreaterThan(0);
      for (const phrase of SELF_ATTESTATION) {
        expect(
          row[2].toLowerCase(),
          `${item.id} rests on the author's word: "${phrase}"`,
        ).not.toContain(phrase);
      }
    });
  }
});
