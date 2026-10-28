import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* The pattern pass judges the line measure under LAY-4 and TYP-6, and the two
   controls state different numbers. The skill states the one range a surface
   is held to. A skill run does the judging, so nothing here exercises a live
   run. This guards the property that would silently regress instead: a second
   set of numbers in the skill, which leaves a run to pick one. See issue #503. */

const PATTERN = "plugins/dx-harness/skills/design/dx-design-pattern/SKILL.md";

function flat(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8").replace(/\s+/g, " ");
}

/* Every range of two-digit counts the skill states, such as 45–75. */
function ranges(text: string) {
  return [...text.matchAll(/\b(\d{2})\s*[–-]\s*(\d{2})\b/g)].map((m) => `${m[1]}–${m[2]}`);
}

/* Contract item 3: a surface whose body text runs 70 characters per line is
   held to the one range the skill states. */
describe("3. one line-length measure", () => {
  it("holds a 70-character line to the one range the skill states", () => {
    const stated = ranges(flat(PATTERN));
    expect(stated, "the skill states more than one range").toEqual(["45–75"]);
    const [low, high] = stated[0].split("–").map(Number);
    expect(70).toBeGreaterThanOrEqual(low);
    expect(70).toBeLessThanOrEqual(high);
  });
});

/* Contract item 4: the skill states one range and one target. */
describe("4. one range and one target", () => {
  const text = flat(PATTERN);

  it("states the 66-character target and not the 40–60 one", () => {
    expect(text, "the skill states no 66-character target").toMatch(/target[^.]*\b66\b/i);
    expect(text, "the skill keeps the 40–60 target").not.toMatch(/40\s*[–-]\s*60/);
  });

  it("states no 80ch ceiling beside the range", () => {
    expect(text, "the skill keeps LAY-4's 80ch ceiling").not.toMatch(/\b80\s*ch\b/);
  });
});
