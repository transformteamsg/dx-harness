# Per-product context layer — `DESIGN.md` + `.tfx/design.json`

The control catalog is portfolio-wide and product-agnostic on purpose (see
`standards/README.md` rule 5: no per-product control overlays). But real products differ
in ways the catalog deliberately does not encode: which primary they anchor on, how they
weight tone, their motion conventions, their column grid. Those **parameters** used to be
scattered — per-product primary in `standards/controls/col-1.md`, tone weighting in the
content skill's §6, motion nowhere, grid in a separate proposed `.tfx/layout-system.json`.

This layer gives each product repo one place for "what makes this product this product":

- **`DESIGN.md`** — human-owned, at the product repo root. Per-product visual parameters.
- **`.tfx/design.json`** — its machine twin, **generated** from `DESIGN.md` by
  `scripts/generate-design-json.py`, so checks and hooks can read the same parameters the
  agent reads. Never hand-edited.

Both are **optional**. A repo with neither gets portfolio defaults everywhere; that is a
valid, complete state — never grade a missing context file as a failure.

## The one rule: parameters, never catalog-rule restatements

`DESIGN.md` carries only what *differs* from the portfolio default or *specialises* a
catalog rule for this product — the values, not the rules. It must never restate a catalog
control (that recreates exactly the drift `docs/SYNC.md` exists to prevent). Say the
parameter and cite its normative source:

- Good: `Primary: --tw-blue #0064FF` (a value) with "Normative source: COL-1".
- Bad: "Primary actions use the product's own primary brand colour" — that is COL-1's rule
  restated; it will drift from the catalog and mislead.

Omit any section that does not differ from the portfolio default. An absent section means
"portfolio default applies", not "unspecified".

## `DESIGN.md` — sections (all optional)

Each `## ` heading below maps to one top-level key in `.tfx/design.json`. Cite the
normative source in each section you keep.

| Section (`## `) | json key | Carries | Normative source to cite |
|---|---|---|---|
| `Colour` | `colour` | primary + accent token/hex, usage beyond COL-1's table | COL-1 |
| `Tone weighting` | `tone` | pointer to content §6 + this product's weighting note | content skill §6 |
| `Motion` | `motion` | product motion conventions (durations, signature moves) | MOT-1, SLP-8, A11Y-5 |
| `Layout system` | `layout_system` | the declared column grid (see below) | LAY-1 proposal (`docs/catalog-changes/lay-1-grid.md`) |
| `Components` | `components` | product-specific component notes (e.g. AvatarFallback default) | CMP-1, CMP-7 |

**Layout system** absorbs the `.tfx/layout-system.json` proposed in
`docs/catalog-changes/lay-1-grid.md` (plan 053): its object (`columns`, `gutter`,
`margins`, `breakpoints`, `maxContentWidth`) becomes the `layout_system` key here.
That control's gate status is unchanged — it still grades **N/A where no grid is
declared**; declaring one here only moves the declaration's location.

A `register:` field (brand-register impact) is **reserved for the future** and is not used
today — brand impact is carried by the colour parameters plus COL-1. Do not add it now.

## `.tfx/design.json` — the generated twin

Generated only, never hand-edited. Shape:

```json
{
  "generated_from": "DESIGN.md",
  "generated_at": "2026-07-03T00:00:00Z",
  "colour": { "primary": "--tw-blue #0064FF" },
  "layout_system": { "columns": 12, "gutter": "space-4" },
  "tone": "Follows content §6. Teacher Workspace: neutral, steady, quietly confident."
}
```

- `generated_from` is always `"DESIGN.md"`; `generated_at` is an ISO-8601 UTC timestamp.
- One top-level key per `DESIGN.md` section present (omitted sections produce no key).
- A section's value is **structured data** when the section carries `- key: value` lines
  (hex/token strings, scale numbers, arrays), else the **prose verbatim** as a string.

### How the generator parses `DESIGN.md`

`scripts/generate-design-json.py` (stdlib-only) does a deterministic parse:

1. Split on `## ` headings; map each heading to its json key (`Colour`/`Color` → `colour`,
   `Tone weighting`/`Tone` → `tone`, `Motion` → `motion`, `Layout system` → `layout_system`,
   `Components` → `components`; any other heading is slugified so nothing is dropped).
2. Strip HTML comments (`<!-- ... -->`) from the section body — comments are guidance and
   never reach the json.
3. In the remaining body, a bulleted line of the form `- key: value` becomes a structured
   field. `value` is coerced: an integer literal → int, a `[…]` JSON array → list, else the
   string verbatim (so `space-4`, `#0064FF`, and `1280px` survive intact). Field keys keep
   their written casing (so `maxContentWidth` matches the LAY-1 schema).
4. A section with **no** field lines becomes its prose (non-comment, non-blank lines joined),
   verbatim. A section that is empty after comment-stripping produces no key.

Use `- key: value` bullets for parameters you want machine-readable; use prose (or `—`
bullets) for narrative notes.

## Loading rules (for the design skill)

- Read `DESIGN.md` at **intent** (once the product is identified) and implement against its
  parameters for the rest of the loop — it calibrates colour/tone/motion/layout downstream.
- **Absent file → portfolio defaults apply.** Do not grade missing context as a failure.
- **Code overrides stale docs.** When `DESIGN.md` disagrees with the product's *implemented*
  conventions, the code wins: follow the implemented convention and tell the user that
  `DESIGN.md` has drifted (so a human can reconcile it). `DESIGN.md` is a pointer to intent,
  not an authority over shipped code.

## Regenerating

After editing `DESIGN.md`, regenerate and commit both files:

```
python3 scripts/generate-design-json.py <product-repo-root>
```

CI can assert freshness with `--check` (exit 2 when `.tfx/design.json` is stale vs the
markdown).

The unified detector consumes this: `checks/detect.py` (plan 059) runs the generator in
`--check` mode whenever a `.tfx/design.json` exists at the target repo root, so a stale
twin surfaces as a detector finding (exit 2), never a crash. A repo with no
`.tfx/design.json` skips the check entirely — a missing context layer is a valid, complete
state, never graded as a failure.
