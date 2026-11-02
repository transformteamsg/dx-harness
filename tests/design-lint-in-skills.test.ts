import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* An installed plugin is a copy of plugins/dx-harness/ and nothing else, so the
   design skills can run design-lint only when it ships inside that folder and
   reads the plugin's own rule files. See issue #538. */

const ROOT = process.cwd();
const PLUGIN = path.join(ROOT, "plugins/dx-harness");
const CLI = path.join(PLUGIN, "design-lint/src/cli.ts");
const RULES = path.join(PLUGIN, "standards/rules");

/* The rule codes, read from the rule files, not from the command under test. */
function ruleCodes(): string[] {
  const codes: string[] = [];
  for (const dir of fs.readdirSync(RULES, { withFileTypes: true })) {
    if (!dir.isDirectory() || dir.name.startsWith(".")) continue;
    for (const file of fs.readdirSync(path.join(RULES, dir.name)).filter((name) => name.endsWith(".md"))) {
      const text = fs.readFileSync(path.join(RULES, dir.name, file), "utf8");
      const code = /^---\n[\s\S]*?^code: (\S+)$/m.exec(text)?.[1];
      if (code && /^check: lint$/m.test(text)) codes.push(code);
    }
  }
  return codes.sort();
}

/* Every markdown file a design run can read. Evals are test data, not run text. */
function runFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "evals") walk(full);
      } else if (entry.name.endsWith(".md")) {
        out.push(full);
      }
    }
  };
  for (const dir of ["skills/design", "agents", "procedures"]) walk(path.join(PLUGIN, dir));
  return out.sort();
}

/* The controls a check declares in its COVERAGE, read with ast so the check is
   never imported. */
function declaredControls(script: string): string[] {
  const probe = [
    "import ast, json, sys",
    "tree = ast.parse(open(sys.argv[1], encoding='utf-8').read())",
    "decl = next((ast.literal_eval(n.value) for n in tree.body if isinstance(n, ast.Assign)",
    "             and any(getattr(t, 'id', None) == 'COVERAGE' for t in n.targets)), {})",
    "print(json.dumps(sorted(decl.get('controls', {}))))",
  ].join("\n");
  const run = spawnSync("python3", ["-c", probe, script], { encoding: "utf8" });
  expect(run.status, run.stderr).toBe(0);
  return JSON.parse(run.stdout);
}

/* The controls that a base rule replaces: the keys of `codes` in redirects.yaml. */
const replaced = new Set(Object.keys(parse(fs.readFileSync(path.join(RULES, "redirects.yaml"), "utf8")).codes ?? {}));

/* The checks whose every control a base rule replaces, so design-lint decides
   them. rendered-check.py stays for the live page until design-lint can open
   one, by the decision recorded on #538. */
const KEPT_FOR_THE_LIVE_PAGE = new Set(["rendered-check.py"]);
const covered = fs
  .readdirSync(path.join(PLUGIN, "checks"))
  .filter((file) => file.endsWith(".py") && !KEPT_FOR_THE_LIVE_PAGE.has(file))
  .filter((file) => {
    const controls = declaredControls(path.join(PLUGIN, "checks", file));
    return controls.length > 0 && controls.every((id) => replaced.has(id));
  });

describe("a design run decides the replaced controls with design-lint", () => {
  it("finds checks whose controls a base rule replaces, so the test has checks to look for", () => {
    expect(replaced.size).toBeGreaterThan(0);
    expect(covered.length).toBeGreaterThan(0);
  });

  it("no design run file runs a check that design-lint covers", () => {
    const files = runFiles();
    expect(files.length).toBeGreaterThan(0);
    const offenders = files.flatMap((file) => {
      const text = fs.readFileSync(file, "utf8");
      return covered.filter((check) => text.includes(check)).map((check) => `${path.relative(ROOT, file)} names ${check}`);
    });
    expect(offenders).toEqual([]);
  });

  /* The command is in one procedure, and each step that runs it names that
     procedure. */
  it("the design-lint procedure runs the plugin's own design-lint", () => {
    expect(fs.readFileSync(path.join(PLUGIN, "procedures/design-lint.md"), "utf8")).toMatch(/<harness>\/design-lint\/src\/cli\.ts/);
  });

  it.each(["skills/design/dx-design-execute/verify.md", "skills/design/dx-design-critique/critique.md", "agents/dx-design-review.md"])(
    "%s runs design-lint through the procedure",
    (file) => {
      expect(fs.readFileSync(path.join(PLUGIN, file), "utf8")).toMatch(/procedures\/design-lint\.md/);
    },
  );
});

describe("design-lint inside the plugin", () => {
  it("ships in the plugin folder", () => {
    expect(fs.existsSync(CLI), `${CLI} does not exist`).toBe(true);
  });

  /* A run from a product folder must find the rules without --rules. */
  it("lists every lint rule when it runs from a folder outside the repository", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-product-"));
    const run = spawnSync(process.execPath, [CLI, "list"], { cwd, encoding: "utf8" });
    expect(run.stderr).toBe("");
    expect(run.status).toBe(0);
    const listed = run.stdout.split("\n").filter(Boolean).map((line) => line.split(/\s+/)[0]).sort();
    const codes = ruleCodes();
    expect(codes.length).toBeGreaterThan(0);
    expect(listed).toEqual(codes);
  });
});
