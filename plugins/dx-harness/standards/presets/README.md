# Domain presets

A domain preset sets the parameter values for every product in one domain. `design-lint` reads the presets in this directory. The directory holds no preset yet. The first presets, such as `teacher`, are their own work.

## A preset file

A preset is `<name>.md`. It is named for its domain, never for a product. The YAML frontmatter holds the values, and the body is prose for people.

```markdown
---
name: teacher
parameters:
  maxGrade: 9
  locale: en-SG
rules:
  BD-4a:
    contentSelector: "main p"
ignore:
  - TX
---

# Teacher domain preset

Why the domain uses these values.
```

| Key | Holds |
| --- | --- |
| `name` | The name of the domain. It matches the file name. |
| `parameters` | Values by parameter name. One value serves every rule that reads that name. |
| `rules` | Overrides for one rule. The key is the rule code, and the value is a map of parameters. |
| `ignore` | Rules to skip, as codes or category prefixes. |

A preset sets values and skips rules. It does not select rules or add rules. Any other key is an error.

## How a product names a preset

The product sets `preset` in `design-lint.config.json`:

```json
{ "preset": "teacher" }
```

If no file defines that preset, the command stops with exit code 2. The `--presets <dir>` flag reads presets from another directory.

For the order in which a rule gets a value, see [How a rule gets a value](../../../../packages/design-lint/docs/config.md#how-a-rule-gets-a-value).

## The L0 floor

A preset cannot relax an L0 rule. An `ignore` entry or a `rules` override that names an L0 rule is skipped. The rule runs with its own values, and the command prints a note that names each skipped line of the preset:

```
note: WU-1a is L0 and still runs. It skipped these preset lines: presets/teacher.md:4 ignore WU-1a
```

The note does not change the exit code.
