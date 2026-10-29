import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* The motion controls MOT-1, MOT-2, and MOT-3 leave catalog.yaml as base rules
   in standards/rules/mot/. See issue #548. */

const ROOT = process.cwd();
const RULES = path.join(ROOT, "plugins/dx-harness/standards/rules");
const MOT = path.join(RULES, "mot");

/* A tolerant read, so a missing file fails an assertion rather than throwing
   before the assertion runs. */
const read = (file: string) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "");

function frontmatter(text: string): Record<string, unknown> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  return match ? ((parse(match[1]) as Record<string, unknown> | null) ?? {}) : {};
}

/* The lint rules have a file. The judged rules have a row in MAPPING.md only. */
const ruleFiles = fs.existsSync(MOT)
  ? fs.readdirSync(MOT).filter((name) => name.endsWith(".md") && !["README.md", "MAPPING.md"].includes(name))
  : [];
const lintRules = ruleFiles.map((name) => ({ name, text: read(path.join(MOT, name)), fm: frontmatter(read(path.join(MOT, name))) }));
const mapping = read(path.join(MOT, "MAPPING.md"));

/* The check of a rule, read from its row in MAPPING.md: `| ... | CODE ... | check | ...`. */
function mappedCheck(code: string): string | undefined {
  const row = mapping.split("\n").find((line) => new RegExp(`\\|[^|]*\`${code}\`[^|]*\\|`).test(line));
  return row?.split("|").map((cell) => cell.trim())[3];
}

const redirects = (parse(read(path.join(RULES, "redirects.yaml"))) ?? {}) as { codes?: Record<string, string[]> };

describe("1. each motion control becomes rules", () => {
  it.each(["MOT-1", "MOT-2", "MOT-3"])("redirects.yaml maps %s to one or more base codes", (control) => {
    const codes = redirects.codes?.[control] ?? [];
    expect(codes.length, `no redirect for ${control}`).toBeGreaterThan(0);
    for (const code of codes) expect(code).toMatch(new RegExp(`^${control}[a-z]$`));
  });

  it.each(["MOT-1", "MOT-2", "MOT-3"])("each new code of %s has a check of lint or judged", (control) => {
    for (const code of redirects.codes?.[control] ?? []) {
      expect(mappedCheck(code), `${code} has no row in MAPPING.md`).toMatch(/^(?:lint|judged)$/);
    }
  });

  it("gives each lint rule a file whose code and check match its row", () => {
    expect(lintRules.length).toBeGreaterThan(0);
    for (const rule of lintRules) {
      expect(rule.fm.check, rule.name).toBe("lint");
      expect(mappedCheck(String(rule.fm.code)), rule.name).toBe("lint");
      expect(rule.fm.dss, rule.name).toMatch(/^MOT-[123]$/);
    }
  });
});

describe("5. a hybrid control's lint rule names its judged rule", () => {
  /* MOT-1 and MOT-2 are hybrid in catalog.yaml. */
  it.each(["MOT-1", "MOT-2"])("the lint rule of %s names a judged rule of the same control in judgedRemainder", (control) => {
    const lint = lintRules.filter((r) => r.fm.dss === control);
    expect(lint.length, `${control} has no lint rule`).toBeGreaterThan(0);
    for (const rule of lint) {
      const remainder = [rule.fm.judgedRemainder].flat().filter(Boolean).map(String);
      expect(remainder.length, `${rule.name} has no judgedRemainder`).toBeGreaterThan(0);
      for (const code of remainder) {
        expect(code).toMatch(new RegExp(`^${control}[a-z]$`));
        expect(mappedCheck(code), `${code} is not a judged rule in MAPPING.md`).toBe("judged");
      }
    }
  });
});
