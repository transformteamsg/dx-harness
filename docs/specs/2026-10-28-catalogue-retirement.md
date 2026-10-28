# Retiring the control catalogue

This document maps each of the 72 controls in `plugins/dx-harness/standards/catalog.yaml` to the base layer in `plugins/dx-harness/skills/design-restructure/base/`, and gives each Python check under `plugins/dx-harness/checks/` its fate. It records what the migration has to do. The migration itself is done in follow-up issues (#526).

The base layer is the source of truth. No base rule is removed. Each base rule ports into the existing `dx-design-*` skills, and a control or a check that a base rule covers is removed from the catalogue.

Mapped against `main` at `357c9de`.

## Fates

| Fate | Meaning | Controls |
| --- | --- | --: |
| Ports | Base rules cover the whole control. The control retires. | 12 |
| Ports in part | Base rules cover part of the control. The rest stays in `catalog.yaml` for evaluation. | 14 |
| Home named, not built | A base rule names the control as part of itself, and `design-lint` does not check it yet. The control stays until the rule is built. | 2 |
| No base rule | The Digital Service Standards (DSS) have no matching control. The control stays in `catalog.yaml` for evaluation. | 44 |

## Control mapping

### Accessibility (A11Y)

| Control | Fate | Base rules | What stays |
| --- | --- | --- | --- |
| A11Y-1 Text contrast | Ports | `WP-13a`, `WP-13b`, `WP-17a`, `WP-17c` | None |
| A11Y-2 Keyboard reach and visible focus | Ports | `WO-1a`, `WO-1b`, `WO-1c`, `WO-13a`, `WO-13b` | None |
| A11Y-3 Programmatic, visible form label | Ports in part | `WR-1a`, `WP-6c`, `WO-16a` | A visible label: axe `label` accepts a placeholder as a name, so a placeholder-only field passes `WR-1a` |
| A11Y-4 Target size | Ports | `WO-18a`, with `minSize` set to 44 for mobile | None |
| A11Y-5 Reduced motion | No base rule | None | The whole control. WCAG 2.3.3 is AAA, outside the DSS |
| A11Y-6 Text alternatives, decorative content hidden | Ports | `WP-1a`, `WP-1b`, `WP-1c`, `WP-1d`, `WP-1e` | None |
| A11Y-7 Programmatic structure | Ports | `WP-6a`, `WP-6b`, `WP-6d`, `WP-6e`, `WO-12d` | None |
| A11Y-8 Name, role, and value | Ports | `WR-1a`, `WR-1b`, `WR-1c`, `WR-1d`, `WR-1e` | None |
| A11Y-9 Page title and page language | Ports | `WO-8a`, `WO-8b`, `WO-8c`, `WO-8d`, `WU-1a`, `WU-1b` | None |
| A11Y-10 Bypass repeated blocks | Ports | `WO-7a`, `WO-7b` | None |
| A11Y-11 Announced async changes and focus management | Ports in part | `WR-2a`, `WR-2b`, `WR-2c`, `WO-9c` | Focus moves to a replaced context, and one message is never both announced and focused |

### Tokens (TOK) and colour (COL)

| Control | Fate | Base rules | What stays |
| --- | --- | --- | --- |
| TOK-1 No raw colour values | Ports in part | `BD-6b` | Raw colour in Tailwind arbitrary-value classes and component code: `BD-6b` scans CSS, `<style>` blocks, and `style` attributes only |
| TOK-2 Spacing from the token scale | Home named, not built | `BD-6b` | The whole control until `BD-6b` ports it |
| TOK-3 Radius from the token scale | Home named, not built | `BD-6b` | The whole control until `BD-6b` ports it |
| COL-1 Product primary colour for primary actions | No base rule | None | The whole control. It is product-specific, so it belongs to a domain or custom layer |
| COL-2 Functional colours from the shared scales | Ports in part | `BD-6b` (named, not built), `WP-13a` | The functional-colour scales until `BD-6b` ports them. The small-text contrast part ports to `WP-13a` |

### Typography (TYP)

| Control | Fate | Base rules | What stays |
| --- | --- | --- | --- |
| TYP-1 Approved typefaces | No base rule | None | The whole control. It is product-specific |
| TYP-2 Minimum body size and line height | No base rule | None | The whole control |
| TYP-3 Type sizes from the scale | No base rule | None | The whole control. `BD-6b` covers colour, spacing, and radius only |
| TYP-4 No all-caps text | No base rule | None | The whole control |
| TYP-5 Tabular figures | No base rule | None | The whole control |
| TYP-6 Comfortable measure | No base rule | None | The whole control. WCAG 1.4.8 is AAA. It duplicates LAY-4 |

### Components (CMP)

| Control | Fate | Base rules | What stays |
| --- | --- | --- | --- |
| CMP-1 Use the design-system component | Ports in part | `BD-6a`, `WP-6e` | Use of the design-system component for each need: `BD-6a` checks only that the system is imported |
| CMP-2 Destructive actions confirm or undo | Ports in part | `WU-12a`, `WU-12b`, `WO-15b` | The confirmation names what will be lost |
| CMP-3 Async loading, success, and error states | Ports in part | `TX-9a`, `WR-2a` | A visible loading state with a minimum display time |
| CMP-4 Empty state distinct from loading and error | No base rule | None | The whole control |
| CMP-5 One primary action per view | No base rule | None | The whole control |
| CMP-6 Data table pattern | Ports in part | `WP-6a` | Right-aligned numeric columns, tabular figures, and a header that stays visible |
| CMP-7 Consistent with design-system defaults | Ports | `BD-6c` | None |
| CMP-8 Exit at every step, work preserved | Ports in part | `TX-5a`, `TX-5b` | A non-destructive exit at each step, and a warning before work is lost |
| CMP-9 Sanitise user content at render | No base rule | None | The whole control. It is a security rule, outside the design standard |
| CMP-10 Error clears on correction | No base rule | None | The whole control |
| CMP-11 Nested child traces the container | No base rule | None | The whole control |

### Content (CNT)

| Control | Fate | Base rules | What stays |
| --- | --- | --- | --- |
| CNT-1 Error messages state what happened and what to do | Ports | `WU-10c`, `WU-10d`, `WU-11a`, `WU-11b`, `TX-10a`, `TX-10b` | None |
| CNT-2 Plain feature and page names | Ports in part | `BD-4b`, `WU-3a` | No invented portmanteaus or internal codenames |
| CNT-3 Second person, active voice, short sentences | Ports in part | `BD-4a` | Second person and active voice |
| CNT-4 Faithful real-world content | No base rule | None | The whole control |
| CNT-5 Device-neutral action words | Ports in part | `WO-10c`, `WP-8a` | Device verbs outside link text |
| CNT-6 No low-information words | No base rule | None | The whole control |
| CNT-7 Purpose before mechanism | No base rule | None | The whole control |
| CNT-8 Plain verbs, not nominalisations | No base rule | None | The whole control |
| CNT-9 Clear copy | Ports in part | `BD-4a`, `BD-4b`, `WU-3a`, `WU-4a` | One idea per sentence, no double negatives, and no noun stacks |
| CNT-10 One term per thing | Ports | `WU-8a`, `WU-8b`, `WU-8c` | None |
| CNT-11 Established UI terms | No base rule | None | The whole control |
| CNT-12 Sentence case | No base rule | None | The whole control |
| CNT-13 Spelling and Singapore English | No base rule | None | The whole control |
| CNT-14 DX voice and tone | No base rule | None | The whole control. It belongs to a domain or custom layer |

### Motion (MOT)

| Control | Fate | Base rules | What stays |
| --- | --- | --- | --- |
| MOT-1 Interface motion timing | No base rule | None | The whole control |
| MOT-2 Motion values from tokens | No base rule | None | The whole control |
| MOT-3 Motion never carries meaning alone | No base rule | None | The whole control |

### Identity (IDN)

| Control | Fate | Base rules | What stays |
| --- | --- | --- | --- |
| IDN-1 Approved logos and lockups | Ports in part | `TL-2b`, `TL-2c`, `TL-2d` | Product lockups: `TL-2` covers the agency or initiative logo |
| IDN-2 Approved product icons | No base rule | None | The whole control. It is product-specific |
| IDN-3 Product tone register | No base rule | None | The whole control. It belongs to a domain or custom layer |
| IDN-4 CaseSync treats casework as sensitive | No base rule | None | The whole control. It is scoped to CaseSync |

### Anti-slop (SLP)

The DSS have no matching control for any SLP control. All 11 stay in `catalog.yaml` for evaluation: SLP-1 to SLP-11.

### Layout (LAY)

| Control | Fate | Base rules | What stays |
| --- | --- | --- | --- |
| LAY-1 Declared column grid | No base rule | None | The whole control |
| LAY-2 Reflow at 320 px | Ports | `WP-16a`, `WP-16b`, `BD-1b`, `WP-7b` | None |
| LAY-3 Known page template | No base rule | None | The whole control |
| LAY-4 Body-text measure | No base rule | None | The whole control. It duplicates TYP-6 |
| LAY-5 Density suits the task | No base rule | None | The whole control |
| LAY-6 Shared edges align | No base rule | None | The whole control |
| LAY-7 One primary focal region | No base rule | None | The whole control |

## Python checks

| Check | Controls it decides | Fate |
| --- | --- | --- |
| `contrast.py` | A11Y-1 | Retires |
| `a11y-static.py` | A11Y-2 | Retires |
| `rendered-check.py` | A11Y-1, A11Y-3 to A11Y-10 | Retires. It covers A11Y-5, which has no base rule, so the reduced-motion part needs a home first |
| `a11y-eslint.py` | A11Y-2, A11Y-3, A11Y-6, A11Y-8 | Retires once a rule covers the placeholder-only label that A11Y-3 keeps |
| `structure-scan.py` | A11Y-7, CMP-6 | Narrows to CMP-6. A11Y-7 ports |
| `token-audit.py` | TOK-1, TOK-2, TOK-3, COL-1, COL-2 | Stays until `BD-6b` ports TOK-2, TOK-3, and COL-2. COL-1 stays with it |
| `type-scan.py` | TYP-1 to TYP-4, TYP-6, LAY-4 | Stays. None of its controls has a base rule |
| `content-lint.py` | CNT-1, CNT-3, CNT-5, CNT-6, CNT-13, SLP-9 | Narrows. CNT-1 ports, and the rest stays |
| `component-manifest.py` | CMP-1 | Stays for the part of CMP-1 that `BD-6a` does not check |
| `audit-record.py`, `waiver-reconcile.py`, `reaudit-scope.py` | None: they validate catalogue decision records and waivers | Retire when `catalog.yaml` retires |
| `detect.py` | None: it runs the other checks | Narrows with the checks it runs |
| `design-catalog-validate.py`, `checklib.py` | None: the catalogue validator and its library | Stay while `catalog.yaml` exists |
| `skill-audit.py`, `skill-locators.py` | None: they check every skill | Stay. They do not depend on the catalogue |

## What stays in `catalog.yaml`

After the ports, `catalog.yaml` keeps the 44 controls with no base rule, the 14 remainders of controls that port in part, and TOK-2 and TOK-3 until `BD-6b` ports them. Each one needs a decision: move it to a domain or custom layer, propose it as a base rule, or retire it.

The controls that name a product or its voice fit a domain or custom layer: COL-1, TYP-1, CNT-14, IDN-2, IDN-3, and IDN-4. CMP-9 is a security rule, outside the design standard. TYP-6 and LAY-4 are one control stated twice.

## Owner and timing

Not decided: who owns the migration, and when the live `dx-design-*` skills stop being the default.
