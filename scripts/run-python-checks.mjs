#!/usr/bin/env node
// The Python half of the build gate: every plugins/dx-harness/checks script this
// site gates on, with its arguments, held as one list instead of an && chain in
// package.json's check:python. Runs them in order, stops at the first failure,
// and names the command that failed.
//
//   node scripts/run-python-checks.mjs
//   node scripts/run-python-checks.mjs --list   # print the invocations, run none
//
// Add a check by adding a row. Put its --self-test row before the row that
// scans this repository with it, so a broken check reports itself rather than
// reporting the repository. validate.py's [WIRING-SYNC] reads this file for the
// check paths, because package.json now names the runner rather than them.

import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const PLUGIN_DIR = "plugins/dx-harness";

/* One row per invocation: the check path relative to PLUGIN_DIR, in the same
   notation the catalogue's `script:` field uses, then its arguments. Writing
   the paths out in full is what lets validate.py's [WIRING-SYNC] read this
   file and see that a control's claimed script runs. */
export const CHECKS = [
  ["checks/validate.py", "--self-test"],
  ["checks/validate.py"],
  ["checks/skill-locators.py", "--self-test"],
  ["checks/skill-locators.py"],
  ["checks/checklib.py", "--self-test"],
  ["checks/token-audit.py", "--self-test"],
  ["checks/type-scan.py", "--self-test"],
  ["checks/structure-scan.py", "--self-test"],
  ["checks/token-audit.py", "app", "components", "lib"],
  ["checks/a11y-eslint.py", "--self-test"],
  ["checks/a11y-static.py", "--self-test"],
  ["checks/a11y-static.py", "app", "components"],
  ["checks/a11y-eslint.py", "app", "components", "lib"],
  ["checks/type-scan.py", "app", "components"],
  ["checks/structure-scan.py", "app", "components", "lib"],
  ["checks/contrast.py", "--self-test"],
  ["checks/contrast.py", "--tokens", "app/globals.css", "."],
  ["checks/content-lint.py", "--self-test"],
  ["checks/content-lint.py", "app", "components", "content", "lib"],
];

export function commandFor([script, ...args]) {
  return ["python3", path.posix.join(PLUGIN_DIR, script), ...args];
}

/* A signal-killed check reports status null, which is not a failure a caller
   can exit with; report it as 1 so the gate still fails. */
function spawnCheck(command) {
  const { status, error } = spawnSync(command[0], command.slice(1), { stdio: "inherit" });
  if (error) {
    console.error(`ERROR cannot run ${command.join(" ")}: ${error.message}`);
    return 1;
  }
  return status === null ? 1 : status;
}

export function runChecks({ checks = CHECKS, run = spawnCheck } = {}) {
  for (const check of checks) {
    const command = commandFor(check);
    const status = run(command);
    if (status !== 0) {
      console.error(`FAILED ${command.join(" ")} (exit ${status})`);
      return status;
    }
  }
  console.log(`OK: ${checks.length} Python check invocations passed`);
  return 0;
}

export function main(argv = process.argv.slice(2)) {
  if (argv.length === 1 && argv[0] === "--list") {
    for (const check of CHECKS) console.log(commandFor(check).join(" "));
    return 0;
  }
  if (argv.length > 0) {
    console.error("Usage: node scripts/run-python-checks.mjs [--list]");
    return 1;
  }
  return runChecks();
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) process.exitCode = main();
