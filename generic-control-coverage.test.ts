import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/* Each generic control in catalog.yaml has an entry under `codes` or
   `notMoved` in standards/rules/redirects.yaml. See issue #541. */

const ROOT = process.cwd();
const PLUGIN = path.join(ROOT, "plugins/dx-harness");

function check(plugin: string) {
  const run = spawnSync("python3", [path.join(plugin, "checks/design-catalog-validate.py")], {
    cwd: plugin,
    encoding: "utf8",
  });
  return { status: run.status, out: `${run.stdout ?? ""}${run.stderr ?? ""}` };
}

describe("1. a generic control with no rule fails the gate", () => {
  let work = "";

  beforeAll(() => {
    work = fs.mkdtempSync(path.join(os.tmpdir(), "generic-control-coverage-"));
    fs.cpSync(PLUGIN, path.join(work, "dx-harness"), { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(work, { recursive: true, force: true });
  });

  it("fails pnpm check and names the control", () => {
    const plugin = path.join(work, "dx-harness");
    const file = path.join(plugin, "standards/rules/redirects.yaml");
    const text = fs.readFileSync(file, "utf8");
    expect(text).toMatch(/^ {2}CNT-12: \[.*\]\n/m);
    fs.writeFileSync(file, text.replace(/^ {2}CNT-12: \[.*\]\n/m, ""));
    const { status, out } = check(plugin);
    expect(status, out).toBe(1);
    expect(out).toMatch(/ERROR standards\/rules\/redirects\.yaml: .*'CNT-12'/);
  });
});

describe("2. every generic control has a rule or a recorded decision", () => {
  it("passes pnpm check on the repository", () => {
    const { status, out } = check(PLUGIN);
    expect(status, out).toBe(0);
  });
});
