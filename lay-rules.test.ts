import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* The generic LAY controls of catalog.yaml become base rules in
   standards/rules/lay/, and redirects.yaml maps each old code to its new codes.
   LAY-4 waits for the decision of #545, which moves TYP-6 or LAY-4. See issue
   #549. */

const RULES = path.join(process.cwd(), "plugins/dx-harness/standards/rules");
const LAY = path.join(RULES, "lay");

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
const mapping = read(path.join(LAY, "MAPPING.md"));

/* The check column of the MAPPING.md row that names the rule, or "" when no row names it. */
function checkOf(code: string) {
  const row = mapping.split("\n").find((line) => line.startsWith("|") && line.includes(`\`${code}\``));
  if (!row) return "";
  const cells = row.split("|").map((cell) => cell.trim());
  return cells[3] ?? "";
}

/* The rule file in lay/ that carries the code, or undefined. */
function fileOf(code: string) {
  if (!fs.existsSync(LAY)) return undefined;
  return fs
    .readdirSync(LAY)
    .filter((name) => name.endsWith(".md") && !["README.md", "MAPPING.md"].includes(name))
    .map((name) => path.join(LAY, name))
    .find((file) => frontmatter(file).code === code);
}

describe("1. LAY-1 becomes rules", () => {
  it("maps LAY-1 to LAY-1a and LAY-1b in redirects.yaml", () => {
    expect(codes["LAY-1"]).toEqual(["LAY-1a", "LAY-1b"]);
  });

  it.each(["LAY-1a", "LAY-1b"])("gives %s a check of lint or judged in lay/MAPPING.md", (code) => {
    expect(["lint", "judged"]).toContain(checkOf(code));
  });

  it("gives the lint rule LAY-1a a rule file with the base code and a check of lint", () => {
    const file = fileOf("LAY-1a");
    expect(file, "no rule file in lay/ carries LAY-1a").toBeDefined();
    expect(frontmatter(file!)).toMatchObject({ code: "LAY-1a", check: "lint", dss: "LAY-1" });
  });
});

describe("4. each listed control has rules, or a recorded decision not to move", () => {
  it.each(["LAY-1", "LAY-3", "LAY-5", "LAY-6", "LAY-7"])("maps %s to base codes with a check", (control) => {
    const targets = codes[control] ?? [];
    expect(targets.length, `no redirect for ${control}`).toBeGreaterThan(0);
    for (const code of targets) {
      expect(code).toMatch(new RegExp(`^${control}[a-z]$`));
      expect(["lint", "judged"], `${code} has no check in lay/MAPPING.md`).toContain(checkOf(code));
    }
  });

  it("records that LAY-4 waits for the decision of #545, and maps no code for it", () => {
    expect(codes["LAY-4"]).toBeUndefined();
    const readme = read(path.join(LAY, "README.md"));
    const line = readme.split("\n").find((l) => l.includes("LAY-4")) ?? "";
    expect(line, "lay/README.md does not mention LAY-4").not.toBe("");
    expect(line).toContain("#545");
  });
});

describe("5. each hybrid control's lint rule names its judged rule", () => {
  it("gives LAY-1a a judgedRemainder of LAY-1b, a judged rule", () => {
    const file = fileOf("LAY-1a");
    expect(file, "no rule file in lay/ carries LAY-1a").toBeDefined();
    expect(frontmatter(file!).judgedRemainder).toBe("LAY-1b");
    expect(checkOf("LAY-1b")).toBe("judged");
  });
});

describe("6. no rule names a teacher where it means any user", () => {
  it("has a lay/ folder to read", () => {
    expect(fs.existsSync(LAY)).toBe(true);
  });

  it.each(fs.existsSync(LAY) ? fs.readdirSync(LAY) : [])("does not name a teacher in lay/%s", (name) => {
    expect(read(path.join(LAY, name))).not.toMatch(/teacher/i);
  });
});
