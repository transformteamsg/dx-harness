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

A rendered finding names the page and the element, not a line and a column:

```
/ form[role=search]: BD-2d [L2] The search form is not in the header.
/ input (2nd on the page): BD-2e [L2] The search input is 59px wide. It needs 200px to fit 27 characters.
/: PR-7a [L2] The page takes 4.2 s to load under the network profile and CPU throttle, above the limit of 3 s.
```

The element name is the tag with its id, or the tag with up to two classes and its role. An element with no id, class, or role, or a name that more than one element shares, also gets its order on the page. A finding about the whole page names the page only. In the `--json` output, a rendered finding has an `element` with the `name` and the box of the element: `top`, `left`, `width`, and `height`, in CSS pixels from the top left of the page.

A rule that cannot run prints a note, not a finding:

```
note: BD-4a not configured: maxGrade, locale
note: WP-12a not run: no browser found
```

A rule whose own engine cannot start prints a finding that starts with "Not run" and says why. Examples are a browser engine of `PR-6b` and the OCR of `WP-15a`. This finding blocks at every tier:

```
/: WP-15a [L2] Not run: OCR did not start (no language data installed for fra. Install @tesseract.js-data/fra, ...). A page that did not run does not pass.
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

```
design-lint init [dir] [--config <file>]
```

1. Find the pages: every HTML file under `dir`, which defaults to the current directory. A file named `index.html` stands for its folder, and the home page comes first. The pages go in `pages.all`.
2. If it finds no pages, it says so and asks for a list of page paths, separated by commas or spaces. A blank answer leaves `pages.all` unset.
3. Ask for `serviceType`. A blank answer leaves it unset.
4. Write `design-lint.config.json` and list each rule that still has an unset value.

`design-lint init` never overwrites a value that the config already holds. It asks only for a value that the config, or a file that it extends, does not set, and adds only the missing keys to the file.

The first version reads static HTML files only. For a framework project with a router, such as Next.js or Vite, it finds no pages and asks for the list.

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
