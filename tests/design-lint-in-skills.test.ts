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

const CHECKS = fs.readdirSync(path.join(PLUGIN, "checks")).filter((file) => file.endsWith(".py"));

describe("a design run decides the replaced controls with design-lint", () => {
  /* A check retires when design-lint replaces it, so a run file that still
     names it would run nothing. */
  it("every check script a design run file names exists", () => {
    const files = runFiles();
    expect(files.length).toBeGreaterThan(0);
    const named = files.flatMap((file) =>
      [...fs.readFileSync(file, "utf8").matchAll(/checks\/([\w-]+\.py)/g)].map((m) => ({ file, check: m[1] })),
    );
    expect(named.length).toBeGreaterThan(0);
    const missing = named
      .filter(({ check }) => !CHECKS.includes(check))
      .map(({ file, check }) => `${path.relative(ROOT, file)} names ${check}`);
    expect(missing).toEqual([]);
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

/* A check retires when a base rule replaces every control it decides, and a
   check that stays decides no replaced control. rendered-check.py stays for
   the live page, so it reports the base rules instead. See issues #539 and
   #589. */
describe("a check that design-lint replaces", () => {
  it("no check that stays decides a control that a base rule replaces", () => {
    expect(replaced.size).toBeGreaterThan(0);
    expect(CHECKS.length).toBeGreaterThan(0);
    const offenders = CHECKS.flatMap((file) =>
      declaredControls(path.join(PLUGIN, "checks", file))
        .filter((id) => replaced.has(id))
        .map((id) => `${file} decides ${id}`),
    );
    expect(offenders).toEqual([]);
  });
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

/* dx-design-execute builds a new page from the base rules. In a project with no
   design-lint.config.json it asks for the service type before it writes one.
   See issue #509. */
describe("dx-design-execute builds from the base rules", () => {
  const EXECUTE = path.join(PLUGIN, "skills/design/dx-design-execute");

  /* The serviceType values that a rule file reads, from the rule files. */
  function serviceTypes(): string[] {
    const values = new Set<string>();
    for (const dir of fs.readdirSync(RULES, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      for (const file of fs.readdirSync(path.join(RULES, dir.name)).filter((name) => name.endsWith(".md"))) {
        const text = fs.readFileSync(path.join(RULES, dir.name, file), "utf8");
        for (const sentence of text.matchAll(/`serviceType` is ([^.\n]*)/g)) {
          for (const value of sentence[1].matchAll(/`([a-z][a-z-]*)`/g)) values.add(value[1]);
        }
      }
    }
    return [...values].sort();
  }

  /* A value that the question does not offer is a service type that a designer
     cannot record, so the rules that read it never apply. */
  it("asks for the service type with every value that a rule file reads", () => {
    const values = serviceTypes();
    expect(values.length).toBeGreaterThan(0);
    const files = [path.join(EXECUTE, "SKILL.md"), ...fs.readdirSync(path.join(EXECUTE, "references")).map((f) => path.join(EXECUTE, "references", f))];
    const asking = files.filter((file) => /`serviceType`/.test(fs.readFileSync(file, "utf8")));
    expect(asking.length, "no dx-design-execute file names serviceType").toBeGreaterThan(0);
    const text = asking.map((file) => fs.readFileSync(file, "utf8")).join("\n");
    const missing = values.filter((value) => !text.includes(`\`${value}\``));
    expect(missing).toEqual([]);
  });

  it("ships an eval case for each base-rule behaviour", () => {
    const evals = JSON.parse(fs.readFileSync(path.join(EXECUTE, "evals/evals.json"), "utf8"));
    const names: string[] = (evals.evals ?? []).map((e: { name: string }) => e.name);
    for (const name of ["new-page-reads-base-rules-first", "forbidden-request-is-flagged", "no-config-asks-service-type"]) {
      expect(names, name).toContain(name);
    }
  });
});
