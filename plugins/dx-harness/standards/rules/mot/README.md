# MOT: Motion

Source: the motion controls of `catalog.yaml`. Status: draft.

The category has three catalogue controls and five rules: two lintable and three judged. The rule format is in the [top-level README](../../rules.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

| Rule | Title | Surface |
| --- | --- | --- |
| [MOT-1a](interface-motion-duration.md) | Interface motion stays within the duration band and names its properties | source |
| [MOT-2a](motion-values-from-tokens.md) | Motion durations and easings come from the motion tokens | source |

The three judged rules have no file yet. Each needs a rubric from `dx-design-judge`: `MOT-1b`, `MOT-2b`, and `MOT-3a`.

## Decisions

- `MOT-1` and `MOT-2` are hybrid. Each becomes a lint rule for the literal values and a judged rule for the reading that a script cannot make. Each lint rule names its judged rule in `judgedRemainder`.
- `MOT-3` is judgment. Whether meaning survives with animations off is a reading task, so it becomes one judged rule.
- `MOT-2` and `MOT-3` are proposed in `catalog.yaml`, not ratified. Their rules are tier L2, so a finding is a warning that never blocks. This keeps the catalogue rule that the harness does not enforce a control that a design lead has not ratified.
- `MOT-1a` and `MOT-2a` can both report one raw duration: `MOT-1a` when it is outside the band, and `MOT-2a` when it is not a token. These are two faults with two fixes, so each rule reports its own.
- `MOT-1a` skips an animation that repeats with no end. The control does not flag a loading or progress indicator, and an endless animation is the common form of one. `WO-5b` checks that such an animation has a control to pause it.
- An easing counts as non-standard when it is a `cubic-bezier()` that overshoots. The keywords `ease`, `ease-in`, `ease-out`, `ease-in-out`, and `linear` pass. `SLP-8` forbids a bounce or elastic curve.
- The narrative surfaces that `MOT-1` excludes are a parameter, `narrativeFiles`. An unset list means that every file is interface.

## Open

- `MOT-1a` and `MOT-2a` do not resolve a `var()` to its value. A token with a duration outside the band is not seen.
- `MOT-1a` and `MOT-2a` read the JavaScript Web Animations API and animation libraries only where a value sits in a `style` string. A `duration:` option in script is not read.
- Judged rules need rubrics from `dx-design-judge`.
