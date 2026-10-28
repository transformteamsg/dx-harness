import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for the trim of the copy skill. The behaviour baseline
   that dx-trim-doc builds decides whether the trim changed what a run does;
   these guard the properties that would silently regress instead: that the
   per-product tone has one home, and that no section reference points at
   nothing. See issue #502. */

const HARNESS = "plugins/dx-harness";
const COPY_SKILL = `${HARNESS}/skills/design/dx-design-copy/SKILL.md`;
const IDN3 = `${HARNESS}/standards/controls/idn-3.md`;

function read(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

/* The register and calibration cells of the IDN-3 table. */
const REGISTER_PHRASES = [
  "command centre",
  "quietly confident",
  "higher gravity",
  "privacy-forward",
  "warmer accents",
  "more celebratory",
  "pure TW",
];

describe("the per-product tone appears only in idn-3.md", () => {
  it("keeps the register table in idn-3.md", () => {
    const control = read(IDN3).toLowerCase();
    for (const phrase of REGISTER_PHRASES) expect(control, phrase).toContain(phrase.toLowerCase());
  });

  it("carries none of the register phrases in the copy skill", () => {
    const skill = read(COPY_SKILL).toLowerCase();
    for (const phrase of REGISTER_PHRASES) expect(skill, phrase).not.toContain(phrase.toLowerCase());
  });

  it("links the copy skill to idn-3.md", () => {
    expect(read(COPY_SKILL)).toMatch(/\]\(\.\.\/\.\.\/\.\.\/standards\/controls\/idn-3\.md\)/);
  });
});

describe("no section reference remains without a link", () => {
  it("puts a link on every line of the copy skill that cites a section", () => {
    const cited = read(COPY_SKILL)
      .split("\n")
      .filter((line) => line.includes("§"));
    for (const line of cited) expect(line, line).toMatch(/\]\([^)]+\)/);
  });
});
