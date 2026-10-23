import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* A control's `script:` field names a check that decides that control, so a
   reader who trusts the catalogue does not skip a manual pass the check never
   ran. The check's COVERAGE declaration is what it decides. See issue #477. */

const ROOT = process.cwd();
const PLUGIN = path.join(ROOT, "plugins/dx-harness");

type Control = { id: string; script?: string | string[] };

const controls: Control[] = parse(fs.readFileSync(path.join(PLUGIN, "standards/catalog.yaml"), "utf8")).controls;

/* The control ids a check's COVERAGE declares, read with ast so the check is
   never imported. */
function declaredControls(script: string): string[] {
  const probe = [
    "import ast, json, sys",
    "tree = ast.parse(open(sys.argv[1], encoding='utf-8').read())",
    "decl = next((ast.literal_eval(n.value) for n in tree.body if isinstance(n, ast.Assign)",
    "             and any(getattr(t, 'id', None) == 'COVERAGE' for t in n.targets)), {})",
    "print(json.dumps(sorted(decl.get('controls', {}))))",
  ].join("\n");
  const run = spawnSync("python3", ["-c", probe, path.join(PLUGIN, script)], { encoding: "utf8" });
  expect(run.status, run.stderr).toBe(0);
  return JSON.parse(run.stdout);
}

const claims = controls.flatMap((control) => {
  const scripts = typeof control.script === "string" ? [control.script] : (control.script ?? []);
  return scripts.map((script) => [control.id, script] as const);
});

describe("a control's script field", () => {
  it("is claimed by some control, so the test has pairs to check", () => {
    expect(claims.length).toBeGreaterThan(0);
  });

  it.each(claims)("%s names %s, which declares it", (id, script) => {
    expect(declaredControls(script)).toContain(id);
  });
});
