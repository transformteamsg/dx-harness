import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/* ADR-0002 settles the rule categories and the rule file name. Each rule is
   standards/rules/<category>/<slug>.md, and pnpm check rejects a file named by
   its code. The rules move there in #536. See issue #542. */

const ROOT = process.cwd();
const ADR_DIR = path.join(ROOT, "docs/adr");
const PLUGIN = path.join(ROOT, "plugins/dx-harness");

const DSS = ["BD", "WP", "WO", "WU", "WR", "PR", "TX", "TL", "UU"];
const CATALOGUE = ["A11Y", "TOK", "COL", "TYP", "CMP", "CNT", "LAY", "MOT"];

/* A tolerant read, so a missing record fails an assertion rather than
   throwing before the assertion runs. */
function readAdr(prefix: string) {
  const file = fs.existsSync(ADR_DIR) ? fs.readdirSync(ADR_DIR).find((name) => name.startsWith(prefix)) : undefined;
  return file ? fs.readFileSync(path.join(ADR_DIR, file), "utf8") : "";
}

const revision = readAdr("0002-");

/* The table row for one category: the prefix in code font, then its folder. */
function categoryRow(prefix: string) {
  return revision.split("\n").find((line) => line.startsWith(`| \`${prefix}\` |`)) ?? "";
}

describe("1. a contributor who adds a rule finds its folder and its prefix", () => {
  it.each([...DSS, ...CATALOGUE])("ADR-0002 names the folder for %s", (prefix) => {
    expect(categoryRow(prefix), `no table row for ${prefix}`).toContain(`\`standards/rules/${prefix.toLowerCase()}/\``);
  });
});

describe("3. the ADR states one file-name convention", () => {
  it("ADR-0002 names a rule file by its slug", () => {
    expect(revision).toContain("`standards/rules/<category>/<slug>.md`");
  });

  it("ADR-0001 points to the revision", () => {
    expect(readAdr("0001-")).toMatch(/\*\*Amended by:\*\* \[ADR-0002\]\(0002-[^)]+\.md\)/);
  });
});

describe("4. the ADR states the DSS and the catalogue prefixes", () => {
  it("lists 17 categories", () => {
    const rows = [...DSS, ...CATALOGUE].filter((prefix) => categoryRow(prefix) !== "");
    expect(rows).toHaveLength(17);
  });

  it.each(["SLP", "IDN"])("gives %s no folder", (prefix) => {
    expect(categoryRow(prefix)).toBe("");
  });
});

describe("2. pnpm check catches a rule file named by the rejected convention", () => {
  let work = "";

  beforeAll(() => {
    work = fs.mkdtempSync(path.join(os.tmpdir(), "rule-file-names-"));
    fs.cpSync(PLUGIN, path.join(work, "dx-harness"), { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(work, { recursive: true, force: true });
  });

  function check(rules: Record<string, string>) {
    const plugin = path.join(work, "dx-harness");
    const dir = path.join(plugin, "standards/rules");
    fs.rmSync(dir, { recursive: true, force: true });
    for (const [file, text] of Object.entries(rules)) {
      fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      fs.writeFileSync(path.join(dir, file), text);
    }
    const run = spawnSync("python3", [path.join(plugin, "checks/design-catalog-validate.py")], {
      cwd: plugin,
      encoding: "utf8",
    });
    return { status: run.status, out: `${run.stdout ?? ""}${run.stderr ?? ""}` };
  }

  const rule = (code: string, slug: string) => `---\ncode: ${code}\nslug: ${slug}\n---\n\n# ${code}: ${slug}\n`;

  it("fails and names a file called by its code", () => {
    const result = check({ "bd/BD-1a.md": rule("BD-1a", "viewport-meta") });
    expect(result.status, result.out).toBe(1);
    expect(result.out).toMatch(/ERROR standards\/rules\/bd\/BD-1a\.md: /);
  });

  it("fails and names a file in a folder that is not a category", () => {
    const result = check({ "slp/no-gradient-text.md": rule("SLP-2a", "no-gradient-text") });
    expect(result.status, result.out).toBe(1);
    expect(result.out).toMatch(/ERROR standards\/rules\/slp\/no-gradient-text\.md: /);
  });

  it("passes a file called by its slug, beside the category README and MAPPING", () => {
    const result = check({ "bd/viewport-meta.md": rule("BD-1a", "viewport-meta"), "bd/README.md": "# BD\n", "bd/MAPPING.md": "# BD\n" });
    expect(result.status, result.out).toBe(0);
  });
});
