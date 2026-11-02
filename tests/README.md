# Tests

This folder holds the root Vitest tests. Read this file before you add or change a test anywhere in the repository.

## Where a test goes

| What you test | Where the test goes | How it runs |
| --- | --- | --- |
| A skill, a procedure, a script under `plugins/dx-harness/scripts/`, the rule files, or the CI workflow | `tests/` | `pnpm run test:root` |
| The `design-lint` package | `plugins/dx-harness/design-lint/test/` | `pnpm run test:design-lint` |
| A check script under `plugins/dx-harness/checks/` | The script's own `--self-test` | `pnpm run test:checks` |

Don't add a test file at the repository root. The root Vitest config includes `tests/**/*.test.ts` only, so a test at the root does not run.

The tests in `tests/` run from the repository root. Resolve paths from `process.cwd()`.

## The bar for a test

A test earns its place when it fails on a realistic defect and passes on every correct change. Each rule below follows from that bar.

### Test behaviour or a lasting property, not wording

- Run the code, or check a property that every file of one kind must have, such as every rule file or every `SKILL.md`.
- Don't match exact sentences in a `SKILL.md`, a procedure, an ADR, a doc, or the CI workflow. A reworded sentence that keeps the rule must not fail a test.
- One exception: you can check that a rule is stated in one file only and that the other files link to it. Match the shortest phrase that identifies the rule.
- To check the CI workflow, find a step by the command it runs, not by its name. Run the step's script where you can, as `ci-design-lint.test.ts` does.

### Don't commit a one-time check

A test that confirms a trim or a migration happened has no value after the merge. Examples are "this sentence is gone", "folder X no longer exists", and "the old term is not used". Confirm it by hand and record it in the pull request's test plan. If the defect can come back, add a general check, such as a dead-reference check, instead.

### Don't pin counts or lists

- Don't assert a count, such as 187 rules, or an exact list of codes. A correct new rule must not fail a test.
- Assert the property that each item must have.
- Put a non-empty guard on the list.

### Don't duplicate a check

Before you write a test, look for one that already covers the property:

- `plugins/dx-harness/checks/design-catalog-validate.py` and its `--self-test`
- The self-tests of the other check scripts
- `plugins/dx-harness/design-lint/test/fixtures.test.ts` and `patches.test.ts`
- `tests/rule-invariants.test.ts` for the rule files, `MAPPING.md`, and `redirects.yaml`
- `tests/shared-rules-once.test.ts` for a rule stated in one place

If the property belongs in one of these, add a case there. Don't add a test that runs `pnpm check` on the repository, because CI already runs it.

### Group by behaviour, not by issue

- Don't add a file for each issue or pull request. Add the case to the file that already tests that behaviour.
- Make a new file only for a new unit, such as a new script.
- Name each file and `describe` block after the behaviour it tests, not "item 3" or "contract item 4". Name the issue in a comment if a reader needs it.
- An acceptance criterion does not need its own test. Map it to a case, new or existing, or record in the test plan how you confirmed it.

### Make sure the test can fail

- Reading a missing file must throw. Don't return `""` for a missing file, because then every `.not.toMatch` passes.
- A loop or an `it.each` over a list needs a non-empty guard.
- A negative assertion, such as "no findings", needs proof that the run happened.
- A case that needs a browser skips when no browser is present. It must not pass.
- Before you commit, break the thing the test protects. Confirm that the test fails with a message that names the cause, then revert the break.

### Keep the test cheap

- Don't copy the whole plugin to a temporary folder to run the full validator. A self-test with a small fixture does the same job.
- If a test needs a tool that is not in `package.json`, such as a Python package or a browser, add the tool to the table in [CONTRIBUTING.md](../CONTRIBUTING.md).
