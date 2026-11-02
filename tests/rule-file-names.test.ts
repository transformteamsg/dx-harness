import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/* ADR-0002 names each rule file standards/rules/<category>/<slug>.md, and
   pnpm check rejects a file named by its code. The validator's self-test covers
   each case of the rule; this runs the validator end to end on a copy of the
   plugin to confirm that pnpm check exits non-zero on it. See issue #542. */

const PLUGIN = path.join(process.cwd(), "plugins/dx-harness");

describe("pnpm check catches a rule file named by its code", () => {
  let work = "";

  beforeAll(() => {
    work = fs.mkdtempSync(path.join(os.tmpdir(), "rule-file-names-"));
    fs.cpSync(PLUGIN, path.join(work, "dx-harness"), { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(work, { recursive: true, force: true });
  });

  it("fails and names a file called by its code", () => {
    const plugin = path.join(work, "dx-harness");
    const file = path.join(plugin, "standards/rules/bd/BD-1a.md");
    fs.writeFileSync(file, "---\ncode: BD-1a\nslug: viewport-meta\n---\n\n# BD-1a: viewport-meta\n");
    const run = spawnSync("python3", [path.join(plugin, "checks/design-catalog-validate.py")], {
      cwd: plugin,
      encoding: "utf8",
    });
    const out = `${run.stdout ?? ""}${run.stderr ?? ""}`;
    expect(run.status, out).toBe(1);
    expect(out).toMatch(/ERROR standards\/rules\/bd\/BD-1a\.md: /);
  });
});
