# A11Y: Accessibility

Source: the generic A11Y controls of [`catalog.yaml`](../../catalog.yaml).

The category has 3 catalogue controls and 6 rules: 4 lintable and 2 judged. The other A11Y controls port in full to DSS rules, as the [catalogue retirement spec](../../../../../docs/specs/2026-10-28-catalogue-retirement.md) records. The rule format is in the [top-level README](../../rules.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

| Rule | Title | Surface |
| --- | --- | --- |
| [A11Y-3a](visible-field-label.md) | Every form field has a visible label | rendered |
| [A11Y-5a](reduced-motion.md) | No animation runs when the user asks for reduced motion | rendered |
| [A11Y-11a](focus-target-not-live-region.md) | A focus target is not also a live region | source |
| [A11Y-11b](focus-not-stranded.md) | Focus is not lost after a state change | rendered |

The 2 judged rules have no file yet. Each needs a rubric from `dx-design-judge`: `A11Y-5b` (an animation that still runs is essential) and `A11Y-11c` (each state change uses the right channel: a live region for a transient status, a focus move for a context replacement).

## Decisions

- A catalogue rule names its control in `control`, not `dss`.
- `A11Y-3a` reports a field that has a name but no visible label. A field with no name fails `WR-1a`, so no fault is reported twice.
- `A11Y-3a` is L0, as A11Y-3 is.
- `A11Y-5a` ports the reduced-motion evaluation of `checks/rendered-check.py`, with its 50 ms floor as `minDurationMs`.
- `A11Y-5` is `deterministic` in the catalogue, but whether an animation is essential is a judgment. The rule takes the essential animations from the product in `essentialSelectors`, and `A11Y-5b` judges that list.
- `A11Y-11b` reads its pages from `actions`, because each check needs a control to click and not only a page.
- The interaction of `A11Y-11b` is a click. A state change that a timer or a network reply starts is not checked, so `A11Y-11c` holds it.

## Built

All 4 lint rules have a module, a fixture pair, and a break patch.

## Open

- The retirement spec retires `checks/rendered-check.py` once `A11Y-5a` exists, and `checks/a11y-eslint.py` once `A11Y-3a` exists. Both scripts still run, because the live `dx-design-*` skills read them.
