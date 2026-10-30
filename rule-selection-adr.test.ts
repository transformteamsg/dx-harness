import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* ADR-0003 settles how a design run selects base rules: the dimension list,
   the fate of each selection flag, the judged rules, and the file that selects
   the rules for a product. scripts/in-scope-rules.py changes in #537. See
   issue #554. */

const ADR_DIR = path.join(process.cwd(), "docs/adr");

/* A tolerant read, so a missing record fails an assertion rather than
   throwing before the assertion runs. */
function readAdr(prefix: string) {
  const file = fs.existsSync(ADR_DIR) ? fs.readdirSync(ADR_DIR).find((name) => name.startsWith(prefix)) : undefined;
  return file ? fs.readFileSync(path.join(ADR_DIR, file), "utf8") : "";
}

const record = readAdr("0003-");
const lines = record.split("\n");

/* The table row whose first cell is the given text in code font. */
function row(first: string) {
  return lines.find((line) => line.startsWith(`| \`${first}\` |`)) ?? "";
}

describe("1. a pass gets the rules of its dimension", () => {
  it("ADR-0003 names DIMENSION_RULES as the list that a pass reads", () => {
    expect(record).toContain("`DIMENSION_RULES`");
    expect(record).toContain("`checks/checklib.py`");
  });

  it.each([
    ["copy", "CNT-2a"],
    ["flow", "CMP-2a"],
    ["motion", "MOT-1a"],
    ["pattern", "LAY-1a"],
    ["polish", "TYP-2a"],
  ])("ADR-0003 lists base rules for the %s pass", (dimension, code) => {
    expect(row(dimension), `no table row for ${dimension}`).toContain(`\`${code}\``);
  });

  it("ADR-0003 replaces a fully ported control with its base rules", () => {
    expect(row("flow")).toContain("`WO-1a`");
    expect(row("flow")).not.toContain("`A11Y-2`");
  });
});

describe("2. each selection flag maps to base rules or retires", () => {
  it.each(["--dimension", "--phase", "--surface", "--product", "--audience"])(
    "ADR-0003 settles %s",
    (flag) => {
      expect(row(flag), `no table row for ${flag}`).toMatch(/\| (Keeps|Retires)/);
    },
  );

  it.each(["--phase", "--surface"])("ADR-0003 retires %s", (flag) => {
    expect(row(flag)).toContain("| Retires");
  });
});

describe("3. one file selects the rules", () => {
  it("ADR-0003 says that design-lint.config.json wins over DESIGN.md", () => {
    const sentence = lines.find((line) => line.includes("`design-lint.config.json`") && line.includes("wins"));
    expect(sentence, "no line says which file wins").toBeDefined();
    expect(sentence).toContain("`DESIGN.md`");
  });
});

describe("4. the judged rules are on the list", () => {
  it("ADR-0003 takes the title and tier of a judged rule from MAPPING.md", () => {
    expect(record).toMatch(/judged rule[^.]*is on the in-scope list/i);
    expect(record).toContain("`Tier` column");
    expect(record).toContain("`MAPPING.md`");
  });
});
