import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* The base rules moved from skills/design-restructure/base/ to
   standards/rules/<category>/<slug>.md, under ADR-0002 (#536).
   design-catalog-validate.py checks that each redirect target exists. These
   cases check what it does not. */

const ROOT = process.cwd();
const PLUGIN = path.join(ROOT, "plugins/dx-harness");
const RULES = path.join(PLUGIN, "standards/rules");

/* The code in a rule file's frontmatter, or null when the file has none. */
function codeOf(file: string) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(fs.readFileSync(file, "utf8"));
  const fm = match ? (parse(match[1]) as Record<string, unknown> | null) : null;
  return fm && typeof fm.code === "string" ? fm.code : null;
}

describe("a reference by the old file name resolves through redirects.yaml", () => {
  const file = path.join(RULES, "redirects.yaml");
  const redirects = fs.existsSync(file) ? (parse(fs.readFileSync(file, "utf8")) as { files?: Record<string, string> }) : {};
  const files = redirects.files ?? {};

  it("resolves BD-1a.md to the file that carries the code BD-1a", () => {
    const target = files["BD-1a.md"];
    expect(target, "no redirect for BD-1a.md").toBeDefined();
    expect(fs.existsSync(path.join(RULES, target))).toBe(true);
    expect(codeOf(path.join(RULES, target))).toBe("BD-1a");
  });
});

describe("the base-layer README names a home for each lint document", () => {
  const readme = path.join(PLUGIN, "standards/rules.md");
  const text = fs.existsSync(readme) ? fs.readFileSync(readme, "utf8") : "";

  it.each(["building-a-rule.md", "config.md", "run.md", "testing.md"])("links %s, and the file exists", (doc) => {
    const link = `../design-lint/docs/${doc}`;
    expect(text).toContain(`](${link})`);
    expect(fs.existsSync(path.resolve(path.dirname(readme), link))).toBe(true);
  });
});
