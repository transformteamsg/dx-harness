import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* The generic CNT controls of catalog.yaml become base rules in
   standards/rules/cnt/, and redirects.yaml maps each old code to its new codes.
   See issue #547. */

const RULES = path.join(process.cwd(), "plugins/dx-harness/standards/rules");
const CNT = path.join(RULES, "cnt");

/* A tolerant read, so a missing file fails an assertion rather than throwing. */
function read(file: string) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function frontmatter(file: string) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(read(file));
  return match ? ((parse(match[1]) as Record<string, unknown> | null) ?? {}) : {};
}

const redirects = (parse(read(path.join(RULES, "redirects.yaml"))) ?? {}) as { codes?: Record<string, string[]> };
const codes = redirects.codes ?? {};
const mapping = read(path.join(CNT, "MAPPING.md"));

/* The check column of the MAPPING.md row that names the rule, or "" when no row names it. */
function checkOf(code: string) {
  const row = mapping.split("\n").find((line) => line.startsWith("|") && line.includes(`\`${code}\``));
  if (!row) return "";
  const cells = row.split("|").map((cell) => cell.trim());
  return cells[3] ?? "";
}

/* The rule file in cnt/ that carries the code, or undefined. */
function fileOf(code: string) {
  if (!fs.existsSync(CNT)) return undefined;
  return fs
    .readdirSync(CNT)
    .filter((name) => name.endsWith(".md") && !["README.md", "MAPPING.md"].includes(name))
    .map((name) => path.join(CNT, name))
    .find((file) => frontmatter(file).code === code);
}

/* Each control of the issue, with its rules. A hybrid control has a lint rule and its judged rule. */
const CONTROLS: { control: string; judged: string[]; lint?: string }[] = [
  { control: "CNT-2", judged: ["CNT-2a"] },
  { control: "CNT-3", judged: ["CNT-3a"] },
  { control: "CNT-4", judged: ["CNT-4a"] },
  { control: "CNT-5", lint: "CNT-5a", judged: ["CNT-5b"] },
  { control: "CNT-6", lint: "CNT-6a", judged: ["CNT-6b"] },
  { control: "CNT-7", judged: ["CNT-7a"] },
  { control: "CNT-8", judged: ["CNT-8a"] },
  { control: "CNT-9", judged: ["CNT-9a"] },
  { control: "CNT-11", judged: ["CNT-11a"] },
  { control: "CNT-12", lint: "CNT-12a", judged: ["CNT-12b"] },
  { control: "CNT-13", lint: "CNT-13a", judged: ["CNT-13b"] },
];
const HYBRIDS = CONTROLS.filter((c) => c.lint !== undefined);

describe("1. CNT-2 becomes rules", () => {
  it("maps CNT-2 to CNT-2a in redirects.yaml", () => {
    expect(codes["CNT-2"]).toEqual(["CNT-2a"]);
  });

  it("gives CNT-2a a check of judged in cnt/MAPPING.md", () => {
    expect(checkOf("CNT-2a")).toBe("judged");
  });
});

describe("4. each listed control has one or more rules", () => {
  it.each(CONTROLS)("maps $control to its base codes, each with a check", ({ control, lint, judged }) => {
    const expected = [...(lint ? [lint] : []), ...judged];
    expect(codes[control], `no redirect for ${control}`).toEqual(expected);
    for (const code of expected) {
      expect(checkOf(code), `${code} has the wrong check in cnt/MAPPING.md`).toBe(code === lint ? "lint" : "judged");
    }
  });

  it.each(HYBRIDS)("gives the lint rule of $control a rule file with its base code", ({ control, lint }) => {
    const file = fileOf(lint!);
    expect(file, `no rule file in cnt/ carries ${lint}`).toBeDefined();
    expect(frontmatter(file!)).toMatchObject({ code: lint, check: "lint", control });
  });
});

describe("5. the lint rule of each hybrid control names its judged rule", () => {
  it.each(HYBRIDS)("gives $lint a judgedRemainder of the judged rule of $control", ({ lint, judged }) => {
    const file = fileOf(lint!);
    expect(file, `no rule file in cnt/ carries ${lint}`).toBeDefined();
    expect(frontmatter(file!).judgedRemainder).toBe(judged[0]);
  });
});

describe("6. no rule names a teacher where it means any user", () => {
  it("has a cnt/ folder to read", () => {
    expect(fs.existsSync(CNT)).toBe(true);
  });

  it.each(fs.existsSync(CNT) ? fs.readdirSync(CNT) : [])("does not name a teacher in cnt/%s", (name) => {
    expect(read(path.join(CNT, name))).not.toMatch(/teacher/i);
  });
});
