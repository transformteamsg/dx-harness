import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* Invariants of the base rules in standards/rules/ that design-catalog-validate.py
   does not check. Each walks every category, so a new rule or category is
   checked with no change here.

   Scope: a DSS category is one whose MAPPING.md table starts "| DSS control".
   Every other category holds rules made from catalogue controls (#544 to #550),
   and only those take part in the redirect and teacher checks. */

const RULES = path.join(process.cwd(), "plugins/dx-harness/standards/rules");
const DOCS = new Set(["README.md", "MAPPING.md"]);
const CODE = /`([A-Z][A-Z0-9]*-\d+[a-z])`/;

interface RuleFile {
  category: string;
  name: string;
  fm: Record<string, unknown>;
}

interface Row {
  category: string;
  /* The control in the first cell, carried down to the rows that leave it empty. */
  control: string;
  /* The rule's own code: the first code in the Rule cell. A later code in that
     cell is a cross-reference, such as "Lint part: `CNT-15a`". */
  code: string;
  rule: string;
  check: string;
}

const read = (file: string) => fs.readFileSync(file, "utf8");

function frontmatter(text: string): Record<string, unknown> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  return match ? ((parse(match[1]) as Record<string, unknown> | null) ?? {}) : {};
}

/* The rows of each table in MAPPING.md whose header is "| <control> | Rule | Check |".
   Other tables, such as "| Rule | Reason |", are skipped. */
function mappingRows(category: string): Row[] {
  const rows: Row[] = [];
  let control = "";
  let inTable = false;
  for (const line of read(path.join(RULES, category, "MAPPING.md")).split("\n")) {
    if (!line.startsWith("|")) {
      inTable = false;
      continue;
    }
    const cells = line.split("|").map((cell) => cell.trim());
    if (cells[2] === "Rule" && cells[3] === "Check") {
      inTable = true;
      continue;
    }
    if (!inTable || /^-+$/.test(cells[1] ?? "")) continue;
    if (cells[1]) control = cells[1].split(/\s+/)[0];
    rows.push({ category, control, code: CODE.exec(cells[2])?.[1] ?? "", rule: cells[2], check: cells[3] });
  }
  return rows;
}

const categories = fs
  .readdirSync(RULES, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const isDss = (category: string) => /^\| DSS control \|/m.test(read(path.join(RULES, category, "MAPPING.md")));
const catalogueCategories = categories.filter((category) => !isDss(category));

const files: RuleFile[] = categories.flatMap((category) =>
  fs
    .readdirSync(path.join(RULES, category))
    .filter((name) => name.endsWith(".md") && !DOCS.has(name))
    .map((name) => ({ category, name, fm: frontmatter(read(path.join(RULES, category, name))) })),
);
const rows = categories.flatMap(mappingRows);
const rowOf = new Map(rows.map((row) => [row.code, row]));

const codeOf = (file: RuleFile) => String(file.fm.code);
const controlOf = (file: RuleFile) => String(file.fm.control ?? file.fm.dss);
const remainderOf = (file: RuleFile) => ([] as unknown[]).concat(file.fm.judgedRemainder ?? []).map(String);
const label = (file: RuleFile) => `${file.category}/${file.name}`;

const catalogueFiles = files.filter((file) => catalogueCategories.includes(file.category));
const withRemainder = files.filter((file) => remainderOf(file).length > 0);
const catalogueJudged = rows.filter((row) => catalogueCategories.includes(row.category) && row.check === "judged");

const redirects = parse(read(path.join(RULES, "redirects.yaml"))) as {
  codes?: Record<string, string[]>;
  notMoved?: Record<string, string>;
};
const codes = redirects.codes ?? {};
const notMoved = Object.keys(redirects.notMoved ?? {});

describe("the rules to check", () => {
  it("finds rule files, MAPPING.md rows, and both kinds of category", () => {
    expect(files.length).toBeGreaterThan(0);
    expect(rows.length).toBeGreaterThan(0);
    expect(catalogueCategories.length).toBeGreaterThan(0);
    expect(categories.length).toBeGreaterThan(catalogueCategories.length);
  });

  it("reads a code from every MAPPING.md row, and no code twice", () => {
    expect(rows.filter((row) => !row.code).map((row) => `${row.category}: ${row.rule}`)).toEqual([]);
    expect(rowOf.size).toBe(rows.length);
  });
});

describe("each rule file agrees with its MAPPING.md row", () => {
  it.each(files.map((file) => [label(file), file] as const))("%s", (_, file) => {
    const row = rowOf.get(codeOf(file));
    expect(row, `${codeOf(file)} has no MAPPING.md row`).toBeDefined();
    expect(row?.category, "the folder of the file").toBe(file.category);
    expect(row?.check, "the check").toBe(file.fm.check);
    expect(row?.control, "the control").toBe(controlOf(file));
    expect(row?.rule, "the link to the file").toContain(`[\`${codeOf(file)}\`](${file.name})`);
  });
});

describe("each rule's control matches its code", () => {
  it.each(files.map((file) => [label(file), file] as const))("%s", (_, file) => {
    expect(file.category, "the folder").toBe(codeOf(file).split("-")[0].toLowerCase());
    /* An SLP control maps to rules in the category that it grades (ADR-0001 D10). */
    if (!controlOf(file).startsWith("SLP-")) expect(codeOf(file).replace(/[a-z]$/, "")).toBe(controlOf(file));
  });
});

describe("judgedRemainder names a rule that a judge or a human settles", () => {
  it.each(withRemainder.map((file) => [label(file), file] as const))("%s", (_, file) => {
    for (const code of remainderOf(file)) {
      const row = rowOf.get(code);
      expect(row, `${codeOf(file)} names ${code}, which has no MAPPING.md row`).toBeDefined();
      expect(row?.check, `${codeOf(file)} names ${code}`).not.toBe("lint");
      /* A DSS rule can name the judged rule of another control, as WO-8d names BD-5b. */
      if (file.fm.control) {
        expect(row?.check, `${codeOf(file)} names ${code}`).toBe("judged");
        expect(row?.control, `${codeOf(file)} names ${code}, a rule of another control`).toBe(controlOf(file));
      }
    }
  });

  const hybridLint = catalogueFiles.filter((file) =>
    rows.some((row) => row.check === "judged" && row.control === controlOf(file)),
  );
  it.each(hybridLint.map((file) => [label(file), file] as const))(
    "%s has a judgedRemainder, because its control also has a judged rule",
    (_, file) => {
      expect(remainderOf(file).length, `${codeOf(file)} has no judgedRemainder`).toBeGreaterThan(0);
    },
  );
});

describe("redirects.yaml lists each catalogue rule under its control", () => {
  it.each(catalogueFiles.map((file) => [label(file), file] as const))("%s", (_, file) => {
    expect(file.fm.control, "a catalogue rule names its control").toBeDefined();
    expect("dss" in file.fm, "a catalogue rule has no dss field").toBe(false);
    expect(codes[controlOf(file)] ?? [], `codes.${controlOf(file)}`).toContain(codeOf(file));
  });

  it.each(catalogueJudged.map((row) => [row.code, row] as const))("the judged rule %s", (_, row) => {
    expect(codes[row.control] ?? [], `codes.${row.control}`).toContain(row.code);
  });

  it.each(notMoved)("names %s, which does not move, in the README of its category", (control) => {
    const readme = path.join(RULES, control.split("-")[0].toLowerCase(), "README.md");
    expect(fs.existsSync(readme) ? read(readme) : "", readme).toContain(control);
  });
});

describe("no catalogue rule names a teacher where it means any user", () => {
  const docs = catalogueCategories.flatMap((category) =>
    fs
      .readdirSync(path.join(RULES, category))
      .filter((name) => name.endsWith(".md"))
      .map((name) => `${category}/${name}`),
  );

  it.each(docs)("%s", (doc) => {
    expect(read(path.join(RULES, doc))).not.toMatch(/\bteachers?\b/i);
  });
});
