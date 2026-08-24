# Per-product design language: `DESIGN.md` + `.dx/design.json`

The control catalog is portfolio-wide and product-agnostic on purpose (see
`standards/README.md` rule 5). But real products differ in ways the catalog
deliberately does not encode: what they should feel like, which primary they anchor
on, how they weight tone, their motion signature, their column grid, and the few
standing deviations rule 5 sanctions. This layer gives each product repo one place
for "what makes this product this product":

- **`DESIGN.md`**: human-approved, at the product repo root. Written and revised by
  the `dx-design-language` skill through its guided walkthrough.
- **`.dx/design.json`**: its typed projection, **generated** from `DESIGN.md` by
  `scripts/generate-design-json.py`. Not a transcript: it carries only what the
  checks and the design reviewer consume, plus `catalog_version` for staleness
  detection. Never hand-edited.

Both are **optional**. A repo with neither gets portfolio defaults everywhere; that
is a valid, complete state. Never grade a missing context file as a failure.

**Precedence:** the catalogue governs portfolio rules; code governs implemented
primitives; `DESIGN.md` carries this product's decisions and deviations.

## The one rule: decisions, never catalog-rule restatements

`DESIGN.md` is reference-first. It carries only what *differs* from the portfolio
default or *specialises* a catalog rule for this product: the values and decisions,
not the rules. It must never restate a catalog control (that recreates exactly the
drift `docs/SYNC.md` exists to prevent). Say the decision and cite its normative
source:

- Good: `primary: --tw-blue #0064FF` (a value) with "Cites: COL-1".
- Bad: "Primary actions use the product's own primary brand colour". That is COL-1's
  rule restated; it will drift from the catalog and mislead.

Omit any section that does not differ from the portfolio default. An absent section
means "portfolio default applies", not "unspecified".

## `DESIGN.md`: the ten sections (all optional)

Each `## ` heading maps to one top-level key in `.dx/design.json`. Cite the
normative source in each section you keep. Template:
`docs/templates/DESIGN.md`.

| Section (`## `) | json key | Carries | Cites |
|---|---|---|---|
| `Essence` | `essence` | what the product should feel like, one or two sentences | (interview) |
| `Colour` | `colour` | primary + accent token/hex, usage beyond COL-1's table, and `pairs` (the declared [foreground, background] token pairs `checks/contrast.py` measures against AA) | COL-1, COL-2, A11Y-1 |
| `Typography` | `typography` | family, base size/leading, scale steps, tabular numerals | TYP controls |
| `Tokens` | `tokens` | source file, prefix, spacing base, dark-mode strategy (pointers into code; code is the authority) | TOK controls |
| `Motion` | `motion` | signature moves only (durations, easing) | MOT-1, SLP-8, A11Y-5 |
| `Voice & Tone` | `tone` | register, person, locale, empty-state behaviour; this product's weighting of content §6 | content skill §6 |
| `Layout system` | `layout_system` | the declared column grid; machine-read, keep bullets exact | LAY-1 |
| `Components` | `components` | manifest pointer + product-level component decisions | CMP-1, CMP-7 |
| `Guardrails` | `guardrails` | product-specific agent instructions no catalogue control covers (10 bullets max) | (interview) |
| `Overrides` | `overrides` | standing, product-level deviations, one structured line each | rule 5 |

The legacy heading `Tone weighting` still maps to `tone`.

### The Overrides section

One structured line per standing override:

```
- <CONTROL-ID> (<tier>): <adjusted rule> - reason: <why>[; approver: <name>]
```

The generator enforces the tier rules and refuses to write past a rejected line
(exit 3):

- **L0** lines are always rejected. If the rule seems wrong, start a rule proposal.
- **L1** needs a reason and a named approver (`; approver: <name>`).
- **L2** needs a reason.
- The control id must exist in `standards/catalog.yaml`, and the stated tier must
  match the catalogue's tier for that control.
- One control id may appear on at most one line; duplicate lines are rejected.

Checks (`checks/detect.py`) and the design reviewer load the overrides from
`.dx/design.json` and surface every active override. The design reviewer grades
against the adjusted rule, applying it only where its stated scope covers the
instance. `checks/detect.py` cannot judge scope: it annotates a finding on an
overridden control with the override and keeps it blocking until a manual check
against the adjusted rule (or a config ignoreValue, or a per-instance waiver)
clears it. Anything not listed binds as written. Overrides start empty on a first
definition: a deviation earns its place through the waiver promotion flow or is
volunteered, never fished for.

## `.dx/design.json`: the generated typed projection

Generated only, never hand-edited. Shape:

```json
{
  "generated_from": "DESIGN.md",
  "generated_at": "2026-08-12T00:00:00Z",
  "catalog_version": "0.1",
  "essence": "Kind Utility: useful first, kind at the surface.",
  "colour": { "primary": "--tw-blue #0064FF", "pairs": [["--foreground", "--background"]] },
  "layout_system": { "columns": 12, "gutter": "space-4", "breakpoints": [360, 768, 1280] },
  "tone": "Neutral, steady, quietly confident.",
  "guardrails": ["Check the component manifest before building anything new."],
  "overrides": [
    { "control": "MOT-1", "tier": "L2", "rule": "entrances may run to 240ms on full-page loads", "reason": "staged hydration causes pop-in" }
  ]
}
```

- `generated_from` is always `"DESIGN.md"`; `generated_at` is an ISO-8601 UTC
  timestamp; `catalog_version` is stamped from `standards/catalog.yaml`
  `meta.version` so staleness against the catalogue is detectable.
- One top-level key per `DESIGN.md` section present (omitted sections produce no
  key; comments never reach the json).
- Prose sections (Essence, Voice & Tone) project as strings; Guardrails projects as
  a list of strings, one per bullet; Overrides projects as a list of objects
  (`control`, `tier`, `rule`, `reason`, and `approver` on L1).

### How the generator parses `DESIGN.md`

`scripts/generate-design-json.py` (stdlib-only) does a deterministic parse:

1. Split on `## ` headings; map each heading to its json key (the table above; any
   other heading is slugified so nothing is dropped).
2. Strip HTML comments (`<!-- ... -->`) from the section body. Comments are guidance
   and never reach the json.
3. In the remaining body, a bulleted line of the form `- key: value` becomes a
   structured field. `value` is coerced: an integer literal to int, a `[...]` JSON
   array to list, else the string verbatim (so `space-4`, `#0064FF`, and `1280px`
   survive intact). Field keys keep their written casing (so `maxContentWidth`
   matches the LAY-1 schema).
4. A section with **no** field lines becomes its prose (non-comment, non-blank lines
   joined), verbatim. A section with field lines AND prose keeps both: the fields,
   plus the prose under a reserved `prose` key (so avoid a field literally named
   `prose`). A section that is empty after comment-stripping produces no key.
5. Guardrails and Overrides are special-cased as described above; a colon inside a
   guardrail bullet never splits it into a field.

Use `- key: value` bullets for parameters you want machine-readable; use prose for
narrative notes.

## Loading rules (for the design skills)

- Read `DESIGN.md` at **intent** (once the product is identified) and implement
  against its decisions for the rest of the loop.
- **Absent file: portfolio defaults apply.** Do not grade missing context as a
  failure.
- **Code overrides stale docs.** When `DESIGN.md` disagrees with the product's
  *implemented* conventions, the code wins: follow the implemented convention and
  tell the user that `DESIGN.md` has drifted so `dx-design-language` can reconcile
  it. `DESIGN.md` records intent and deviations; it is not an authority over shipped
  code.
- **Drift is a start-of-session banner, not a flow.** A stale `catalog_version` or a
  dead token pointer surfaces as a banner at the start of a design session;
  regeneration re-stamps. Staleness is never a hard failure of a design run.

## Regenerating

After any `DESIGN.md` edit, regenerate and commit both files:

```
python3 scripts/generate-design-json.py <product-repo-root>
```

Exit codes: 0 ok; 1 no `DESIGN.md` (not a failure); 2 (`--check`) stale against
`DESIGN.md` or the catalogue version; 3 the Overrides section did not validate,
nothing written.

CI can assert freshness with `--check`. The unified detector consumes this:
`checks/detect.py` runs the generator in `--check` mode whenever a `.dx/design.json`
exists at the target repo root, so a stale or rejected projection surfaces as a
detector finding (exit 2), never a crash. A repo with no `.dx/design.json` skips the
check entirely.
