# Run design-lint (shared procedure)

`design-lint` decides the lint rules on the in-scope list. It ships with the harness
in `<harness>/design-lint/`, where `<harness>` is the absolute path of the plugin
root. It reads the rules from `<harness>/standards/rules/` and the product's
selection from `design-lint.config.json` at the product root.

## Step 1: Confirm the linter can run

Run this from the product root:

```bash
node <harness>/design-lint/src/cli.ts --help
```

When the command fails, stop the step that called this procedure:

1. Name what is missing. "Cannot find package" means the linter's dependencies are not installed. A Node error about TypeScript syntax means Node is older than 22.18.
2. Give the fix: `dx-design-setup` installs both.
3. Report the page as not verified. Every lint rule on the in-scope list is unverified, and none is a pass.

Do not decide a lint rule by reading the code in its place.

## Step 2: Run the lint rules

Run the source and project rules on the product root:

```bash
node <harness>/design-lint/src/cli.ts . --json
```

Add `--rendered` when `design-lint.config.json` sets `serve`, the folder of a static
site. Without `serve`, the rendered rules do not run here. The rendered check in
step 2 of `../skills/design/dx-design-critique/critique.md` decides the rendered part
of each rule on the live page.

## Step 3: Read the result

The exit code and the JSON decide each lint rule on the in-scope list:

| Result | The rule is |
| --- | --- |
| A finding with the rule's code | Failed, at the tier in the finding. An L2 finding is advisory |
| A `not-configured` note | Unverified. Name the unset parameters, which `design-lint.config.json` sets |
| A `not-run` or `no-module` note | Unverified. Name the reason in the note |
| No finding and no note, for a rule that ran | Passed by `design-lint` |
| A `rendered` rule in a run without `--rendered` | Not decided by `design-lint`. The rendered check or a manual check decides it |

Exit code 2 is a tool failure. Show the error, and treat it as Step 1 does.

Record each rule that `design-lint` decided with the method `script` and the
command as the evidence.
