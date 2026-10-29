# WR: WCAG Robust

Source: [DSS WCAG Robust](https://info.standards.tech.gov.sg/control-catalog/dss/wr/). Status: draft.

The category has 2 DSS controls and 8 rules: 6 lintable and 2 judged. The rule format is in the [top-level README](../../rules.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

| Rule | Title | Surface |
| --- | --- | --- |
| [WR-1a](control-accessible-name.md) | Every control has an accessible name | rendered |
| [WR-1b](valid-roles.md) | Roles are valid and carry their required properties | rendered |
| [WR-1c](valid-aria-attributes.md) | ARIA attributes are valid and supported | rendered |
| [WR-1d](custom-control-role-and-focus.md) | A custom interactive element has a role and is focusable | source |
| [WR-2a](status-message-live-region.md) | A status message sits in a live region | source |
| [WR-2b](valid-live-region.md) | Live region values are valid | rendered |

The 2 judged rules have no file yet. Each needs a rubric from `dx-design-judge`: `WR-1e` (the name describes the purpose, and states update on change) and `WR-2c` (the message content and timing suit the user).

## Decisions

- Neither control lists a "Not required for" case, so the category has no exemption parameter.
- axe-core does the rendered work and `eslint-plugin-jsx-a11y` the source work. A rule maps to the engine rules by DSS code.
- `WR-1a` to `WR-1c` are L0. An engine can decide each one, and a failure is a defect.
- `WR-2a` is a custom rule. No engine finds a status message by purpose, so the product config names the selectors in `statusSelectors`.
- A native control passes `WR-1d` without further checks, because the DSS says standard HTML controls already meet the criterion.
- Tiers are provisional until [#432](https://github.com/transformteamsg/dx-harness/issues/432) classifies which controls a script can decide.

## Open

Verify each engine rule name against the installed version:

- axe: `aria-prohibited-attr`, `aria-allowed-role`, `aria-hidden-body`, `aria-tooltip-name`, `aria-meter-name`, `aria-progressbar-name`, `nested-interactive`.
- jsx-a11y: `role-supports-aria-props`, `no-noninteractive-element-interactions`, `aria-unsupported-elements`.
- `WR-2b`: the role conflict check has no engine rule. Confirm that a custom rule is needed.
- `WR-2a`: confirm that the product config is the right place for `statusSelectors`, or whether a framework adapter can find status components.
- Runtime state changes, such as `aria-expanded` updating on click, need an interaction script. No rule covers them yet, so `WR-1e` holds them.

## Built

All six lint rules of WR have a linter module in `packages/design-lint/`, with a fixture pair and a break patch each.

- `WR-1a`, `WR-1b`, and `WR-1c` are sets of axe rules. One wrapper, `src/engines/axe.ts`, injects axe-core, runs the named rules, and turns each failing element into a finding. The other WCAG categories reuse it.
- `test/axe.test.ts` checks that every axe rule id that a WR rule names exists in the installed axe-core. They all exist in 4.14.0. A rename in a new version fails the test, and the rule does not go silent.
- `WR-1d` reads plain HTML, where the handler is an `on*` attribute. The JSX and TSX path, through `eslint-plugin-jsx-a11y`, is not built. The same holds for the jsx-a11y twins of `WR-1a`, `WR-1b`, and `WR-1c`.
- `WR-2a` checks the source only. It does not see a status element that a script inserts later.
- `WR-2b` checks the live-region attributes and the role conflict. It no longer runs axe, because `WR-1c` already reports a general invalid ARIA value, and two rules would report one fault.
- `WR-1a`, `WR-1b`, `WR-1c`, and `WR-2b` gained a `pages` parameter, as every rendered rule needs one.
- A break patch can name other rules that it also breaks. The patches of WR need none.

