import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { CHECKS, PLUGIN_DIR, commandFor, runChecks } from "./run-python-checks.mjs";

const root = path.resolve(import.meta.dirname, "..");

describe("CHECKS", () => {
  it("names a check script that exists", () => {
    const missing = CHECKS.map(([script]) => script).filter(
      (script) => !fs.existsSync(path.join(root, PLUGIN_DIR, script)),
    );

    expect(missing).toEqual([]);
  });

  it("passes only paths that exist", () => {
    const targets = CHECKS.flatMap(([, ...args]) => args).filter((arg) => !arg.startsWith("--"));
    const missing = targets.filter((target) => !fs.existsSync(path.join(root, target)));

    expect(missing).toEqual([]);
  });

  it("runs each script's self-test before it scans the repository", () => {
    const outOfOrder = [];
    for (const [index, [script, ...args]] of CHECKS.entries()) {
      if (args[0] === "--self-test") continue;
      const selfTest = CHECKS.findIndex(
        ([other, flag]) => other === script && flag === "--self-test",
      );
      if (selfTest === -1 || selfTest > index) outOfOrder.push(script);
    }

    expect(outOfOrder).toEqual([]);
  });
});

describe("runChecks", () => {
  it("runs every invocation in order and returns 0", () => {
    const run = vi.fn(() => 0);

    expect(runChecks({ run })).toBe(0);
    expect(run.mock.calls.map(([command]) => command)).toEqual(CHECKS.map(commandFor));
  });

  it("stops at the first failure, names the command, and returns its exit status", () => {
    const stderr = vi.spyOn(console, "error").mockImplementation(() => {});
    const checks = [
      ["checks/validate.py", "--self-test"],
      ["checks/contrast.py", "app"],
      ["checks/content-lint.py"],
    ];
    const run = vi.fn((command) => (command.at(1).endsWith("contrast.py") ? 3 : 0));

    expect(runChecks({ checks, run })).toBe(3);
    expect(run).toHaveBeenCalledTimes(2);
    expect(stderr).toHaveBeenCalledWith(
      "FAILED python3 plugins/dx-harness/checks/contrast.py app (exit 3)",
    );

    stderr.mockRestore();
  });
});
