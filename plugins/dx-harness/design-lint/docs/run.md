# The design-lint command

Status: draft. `design-lint` is one command in the style of ESLint and flake8.

## Commands

| Command | Does |
| --- | --- |
| `design-lint [path...]` | Runs the `source` and `project` rules. The default for a pre-commit hook. |
| `design-lint --rendered` | Adds the `rendered` rules. The default for a pre-push hook. |
| `design-lint --ci` | Adds the rules that run only in continuous integration, such as `PR-6b`. |
| `design-lint init` | Finds pages and writes `design-lint.config.json`. |
| `design-lint --json` | Prints the findings as JSON. The verify skill reads this. |
| `design-lint --select <codes>` | Runs only these rules, or the rules of one category. |
| `design-lint --ignore <codes>` | Skips these rules. Invalid for an L0 rule. |
| `design-lint --fix` | Applies the mechanical fixes that a rule offers. |

## Output

One finding per line:

```
path/to/file.html:12:5: BD-1a [L1] Viewport meta tag blocks zoom. Remove user-scalable=no.
```

For a rendered finding, the path is the page and the line and column are the element position.

A rule that cannot run prints a note, not a finding:

```
note: BD-4a not configured: maxGrade, locale
note: WP-15a not run: OCR is not installed
```

When the domain preset tries to override or ignore an L0 rule, the rule runs, and a note names each line of the preset that it skipped. This note does not change the exit code:

```
note: WU-1a is L0 and still runs. It skipped these preset lines: presets/teacher.md:4 ignore WU-1a
```

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Every selected rule passed. |
| 1 | A rule found a violation, or a rule is "not configured" or "not run". |
| 2 | The tool failed. For example, the config names a preset that no file defines. |

A rule that is "not configured" or "not run" never passes (D13). L2 findings are warnings. They print and do not change the exit code. A "not configured" or "not run" note on an L2 rule also does not change the exit code.

## First run

When the config has unset parameters, the run prints one summary before the findings:

```
7 rules need configuration. Run design-lint init, or set these values:
  BD-4a   maxGrade, locale
  BD-3a   locales
  ...
```

The summary groups by rule and lists each unset parameter once.

## `design-lint init`

1. Find the pages: from the file tree for static HTML, or from the router for a framework project.
2. Ask for the values that cannot be found: `serviceType` first.
3. Write `design-lint.config.json` and report what is still unset.

`design-lint init` never overwrites a value that the config already holds.

## Hooks

| Hook | Runs |
| --- | --- |
| Pre-commit | `design-lint` on the staged files |
| Pre-push | `design-lint --rendered` |
| Continuous integration | `design-lint --rendered --ci` |

`dx-design-setup` installs the hooks, so a designer never edits a hook file.

## Open

- The exit code for a "not configured" note on an L2 rule needs a decision. The draft keeps it at 0 so that a warning rule cannot block, which differs from D13 for L1 rules.
- `--fix` needs a list of the rules that offer a mechanical fix.
- The `rendered` rules need a way to serve the pages. A static HTML prototype defaults to serving its folder.
