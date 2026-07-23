# Control Catalog — Format Spec

Every standard the harness enforces is a **control**: one YAML entry in
`catalog.yaml` (the index, always loaded) and optionally one markdown file in
`controls/` (the detail, loaded on demand). This mirrors skill progressive
disclosure: the agent always knows *what* controls exist; it reads *how to satisfy
one* only when relevant.

The normative source is the **TFX Design Standard (TFX-DS)**. The litmus test for
what belongs here: *if you can't check it, it's a principle or a guideline — not a
standard.* Standards are the only layer the harness can enforce automatically. Run `python3 checks/validate.py` to verify the catalog, detail files, and all cross-references are consistent.

## Schema

```yaml
- id: TYP-2                     # TFX-DS control id (category prefix + number)
  source: TFX-DS                # TFX-DS (the normative source); WCAG/SGDS/GOVUK are
                                # references noted in rationale, not sources
  title: Body text at least 14px; labels at least 12px; body line-height 1.5-1.6
  tier: L1                      # see Tiers
  check: deterministic          # deterministic | judgment | hybrid
  phase: [implement, verify]    # loop phases where it applies:
                                #   intent | plan | implement | verify
  applies_to: [page, component] # page | component | flow | content
  products: [glow]              # OPTIONAL — subset of tw | casesync | glow.
                                # Absent = global (all products). Never [].
  audiences: [students-primary] # OPTIONAL — teachers | students-primary |
                                # students-secondary | parents. Absent = global.
  verify: "Type-scale scan; checks/type-scan"
  waiver: documented            # none | documented | rationale  (follows tier)
  detail: controls/typ-2.md     # omit if the index entry is self-sufficient
  enforced: partial             # OPTIONAL — script | partial | manual | evaluator.
                                # See Enforcement below. Absent = default.
  script: checks/type-scan.py   # OPTIONAL — only valid when enforced is script
                                # or partial. String or list of repo-relative paths.
  refs:
    - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
```

Category prefixes: `A11Y` accessibility · `TOK` tokens & theming ·
`TYP` typography · `COL` colour · `CMP` components & patterns · `CNT` content &
naming · `MOT` motion · `IDN` identity · `SLP` anti-slop (adopted from the
TFX-DS site seed catalog in the 2026-06-11 consolidation).

Two optional elements exist for the website (the human presentation layer,
which renders this same file):

- `fails_when:` — per-control list of short anti-pattern bullets. For controls
  with a detail file these summarise the detail's "Fails when" section; the
  detail file remains the fuller account.
- a top-level `meta:` block — `version`, `updated`, `waiver_syntax`, a
  `categories` map from prefix to display name, and `products` / `audiences`
  maps from scope value to display name (see Scope below).

## Scope

Two optional per-control fields scope a control to part of the portfolio:
`products:` (subset of `tw | casesync | glow`) and `audiences:` (subset of
`teachers | students-primary | students-secondary | parents`).

- **Absent = global.** A control without a scope field applies to every
  product / every audience. Never write an empty list — the validators reject
  `products: []`; omit the field instead.
- **Filtering is an intersection.** A control is in scope for a run when its
  `phase` matches AND `applies_to` (the *surface* dimension — page /
  component / flow / content, unchanged and distinct from these fields)
  matches AND (`products` absent OR contains the active product) AND
  (`audiences` absent OR contains the active audience).
- **Audience defaults to `teachers`** at the intent phase when unstated —
  today's live surfaces are teacher-facing. The design loop asks when a
  surface could plausibly serve students or parents.
- Age bands: `students-primary` = primary school; `students-secondary` =
  secondary school and up.
- **Do not stamp scope onto floor controls.** Stamping
  `audiences: [teachers]` onto existing global controls would *exempt* future
  student and parent surfaces from the accessibility floor, anti-slop, and
  tokens — the opposite of safe. The safety net travels to every audience by
  default; scoping is opt-in per control, used only when a control genuinely
  binds one product or audience.
- TW-adjacent surfaces (Posts, PG Staff Portal) count as `tw` — the same rule
  the content skill's tone table uses.

## Tiers → enforcement

| Tier | Meaning | Enforcement | Waiver |
|---|---|---|---|
| **L0** | Non-negotiable — trust, safety, accessibility floor | Blocking — a failed check stops the loop; output cannot ship | `none`. Ever. |
| **L1** | Mandatory — consistency and quality | Must pass in the verify phase; failure sends the agent back to implement | `documented` — named human approver, recorded in the decision record and waiver registry |
| **L2** | Recommended — strong default, deliberate deviation allowed | Finding, not a block | `rationale` — inline waiver at the deviation site, like an eslint-disable: `<!-- tfx-waive CNT-3 reason="ministry programme name must appear verbatim" -->` |

A waiver without a specific reason is a violation, not a waiver. L0+L1 are the
*required* contents of the standard; L2 (plus the TFX-DS guidelines) are the
*recommended* contents.

## Check types → who verifies

| Check | Verified by | Examples |
|---|---|---|
| `deterministic` | Script / scanner (`checks/`, axe). Binary pass/fail; non-skippable. | Contrast ratio, raw colour detection, label presence, reduced-motion support |
| `judgment` | `evaluator` subagent (or human), graded with quoted evidence. | Plain-language naming, tone in error copy, pattern appropriateness |
| `hybrid` | Script narrows the surface, evaluator judges the remainder. | Script proves error states exist; evaluator confirms the copy says what happened, what it means, what's next |

## Enforcement — `enforced:` / `script:`

`check:` says *who in principle* verifies a control (script / evaluator / both).
`enforced:` says *what actually runs today* — orthogonal, because a
`deterministic` control can still have no script built yet, and a `hybrid`
control's judgment half is evaluator-verified by design, not a gap.

Two OPTIONAL per-control fields (see the schema example above):

- `enforced`: one of `script` | `partial` | `manual` | `evaluator`.
  - `script` — a `checks/` script fully covers the control's deterministic claim.
  - `partial` — a script covers a subset; the rest is manual or evaluator.
  - `manual` — deterministic in principle, no script yet (the honest gap).
  - `evaluator` — a judgment control; the `evaluator` subagent IS the
    enforcement (not a gap to close).
  - **Absent = default**: `manual` for `deterministic`/`hybrid` controls,
    `evaluator` for `judgment` controls. Validators apply the default; never
    write it back into the catalog.
- `script`: repo-relative path(s) (string or list) to the covering script(s),
  e.g. `checks/token-audit.py`. Only valid when `enforced` is `script` or
  `partial`.

Query the live picture with `python3 checks/validate.py --coverage` — a table
of every control's `enforced` state (defaulted) and `script:` path, plus a
summary count. This replaces hand-maintained gap lists, which drift.

## Authoring rules

1. **One control = one verifiable statement.** If reasonable people could disagree
   about whether work passes it, it isn't a standard yet — split it, or mark it
   `judgment` and write evaluator guidance in the detail file.
2. **Keep TFX-DS ids.** Controls trace back to the standard by id; the website will
   give each a stable anchor. New proposals take the next number in their category.
3. **Anti-patterns are the most powerful instruction.** Every detail file has a
   "Fails when" section with concrete negative examples — agents follow "never do X
   with example" more reliably than positive guidance.
4. **The catalog only grows through the ratchet.** A new control traces back to an
   observed failure, audit finding, or adopted standard — never speculation. Entry is
   a lightweight PR with design-lead approval; the bar for L0/L1 is high, the bar for
   L2 is evidence. Citizen-service patterns (one-thing-per-page, government banners)
   enter only via ratchet evidence — these products are professional daily-use
   workspaces, not transactional citizen services.
5. **One catalog for the whole portfolio.** No per-product control overlays;
   per-product difference is nuance calibration, never separate rules.

## Detail file format (`controls/<id>.md`)

```markdown
---
id: TYP-2
# frontmatter repeats the catalog entry verbatim. catalog.yaml is the source
# of truth; checks/validate.py fails if a detail file drifts from it.
---

## Requirement
One paragraph, imperative voice.

## Rationale
Why this exists — re-anchors the agent across sessions. (TFX-DS example:
"Readability is kindness. Teachers scan between classes.")

## Passes when / Fails when
Concrete examples, code where useful.

## How to verify
Exact command, selector, or evaluator instructions.
```
