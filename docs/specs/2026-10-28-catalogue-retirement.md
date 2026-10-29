# Retiring the control catalogue

This document maps each of the 72 controls in `plugins/dx-harness/standards/catalog.yaml` to the base layer in `plugins/dx-harness/skills/design-restructure/base/`, and gives each Python check under `plugins/dx-harness/checks/` its fate. It records what the migration has to do. The migration itself is done in follow-up issues (#526).

The base layer is the source of truth. No base rule is removed. Each base rule ports into the existing `dx-design-*` skills, and a control or a check that a base rule covers is removed from the catalogue.

Mapped against `main` at `357c9de`.

## Fates

| Fate | Meaning | Controls |
| --- | --- | --: |
| Ports | Base rules cover the whole control. The control retires. | 12 |
| Ports in part | Base rules cover part of the control. The rest moves by its scope. | 14 |
| Home named, not built | A base rule names the control as part of itself, and `design-lint` does not check it yet. The control moves by its scope until the rule is built. | 2 |
| No base rule | The Digital Service Standards (DSS) have no matching control. The control moves by its scope. | 44 |

## Scopes

The scope says who a control applies to. It decides where the control goes when `catalog.yaml` retires. A control that ports in part takes the scope of the part that stays.

| Scope | Meaning | Where it goes | Controls |
| --- | --- | --- | --: |
| None | The control ports in full | Nowhere. It retires | 12 |
| Generic | Any product, on any stack | A new folder under `base/` for its catalogue category | 47 |
| Stack | One technology set: shadcn tokens, the Tailwind type scale, Radix Colors, or Base UI | The placeholder catalogue, until the stack is decided | 6 |
| Domain | The design language of one domain | The placeholder catalogue, until the domain preset exists | 1 |
| Product | One product or its own values | The placeholder catalogue, until the domain preset exists | 6 |

Several generic controls describe their user as a teacher, for example CNT-7 and CNT-11. That wording is an example, not a scope. It changes to the user when the control moves.

## Control mapping

### Accessibility (A11Y)

| Control | Fate | Scope | Catalogue check | Base rules | What stays |
| --- | --- | --- | --- | --- | --- |
| A11Y-1 Text contrast | Ports | None | `deterministic` | `WP-13a`, `WP-13b`, `WP-17a`, `WP-17c` | None |
| A11Y-2 Keyboard reach and visible focus | Ports | None | `deterministic` | `WO-1a`, `WO-1b`, `WO-1c`, `WO-13a`, `WO-13b` | None |
| A11Y-3 Programmatic, visible form label | Ports in part | Generic | `deterministic` | `WR-1a`, `WP-6c`, `WO-16a` | A visible label: axe `label` accepts a placeholder as a name, so a placeholder-only field passes `WR-1a` |
| A11Y-4 Target size | Ports | None | `deterministic` | `WO-18a`, with `minSize` set to 44 for mobile | None |
| A11Y-5 Reduced motion | No base rule | Generic | `deterministic` | None | The whole control. WCAG 2.3.3 is AAA, outside the DSS |
| A11Y-6 Text alternatives, decorative content hidden | Ports | None | `deterministic` | `WP-1a`, `WP-1b`, `WP-1c`, `WP-1d`, `WP-1e` | None |
| A11Y-7 Programmatic structure | Ports | None | `hybrid` | `WP-6a`, `WP-6b`, `WP-6d`, `WP-6e`, `WO-12d` | None |
| A11Y-8 Name, role, and value | Ports | None | `hybrid` | `WR-1a`, `WR-1b`, `WR-1c`, `WR-1d`, `WR-1e` | None |
| A11Y-9 Page title and page language | Ports | None | `deterministic` | `WO-8a`, `WO-8b`, `WO-8c`, `WO-8d`, `WU-1a`, `WU-1b` | None |
| A11Y-10 Bypass repeated blocks | Ports | None | `deterministic` | `WO-7a`, `WO-7b` | None |
| A11Y-11 Announced async changes and focus management | Ports in part | Generic | `hybrid` | `WR-2a`, `WR-2b`, `WR-2c`, `WO-9c` | Focus moves to a replaced context, and one message is never both announced and focused |

### Tokens (TOK) and colour (COL)

| Control | Fate | Scope | Catalogue check | Base rules | What stays |
| --- | --- | --- | --- | --- | --- |
| TOK-1 No raw colour values | Ports in part | Stack | `deterministic` | `BD-6b` | Raw colour in Tailwind arbitrary-value classes and component code: `BD-6b` scans CSS, `<style>` blocks, and `style` attributes only |
| TOK-2 Spacing from the token scale | Home named, not built | Stack | `deterministic` | `BD-6b` | The whole control until `BD-6b` ports it |
| TOK-3 Radius from the token scale | Home named, not built | Stack | `deterministic` | `BD-6b` | The whole control until `BD-6b` ports it |
| COL-1 Product primary colour for primary actions | No base rule | Product | `hybrid` | None | The whole control |
| COL-2 Functional colours from the shared scales | Ports in part | Stack | `deterministic` | `BD-6b` (named, not built), `WP-13a` | The functional-colour scales until `BD-6b` ports them. The small-text contrast part ports to `WP-13a` |

### Typography (TYP)

| Control | Fate | Scope | Catalogue check | Base rules | What stays |
| --- | --- | --- | --- | --- | --- |
| TYP-1 Approved typefaces | No base rule | Product | `deterministic` | None | The whole control |
| TYP-2 Minimum body size and line height | No base rule | Generic | `deterministic` | None | The whole control |
| TYP-3 Type sizes from the scale | No base rule | Stack | `deterministic` | None | The whole control. `BD-6b` covers colour, spacing, and radius only |
| TYP-4 No all-caps text | No base rule | Generic | `deterministic` | None | The whole control |
| TYP-5 Tabular figures | No base rule | Generic | `hybrid` | None | The whole control |
| TYP-6 Comfortable measure | No base rule | Generic | `hybrid` | None | The whole control. WCAG 1.4.8 is AAA. It duplicates LAY-4 |

### Components (CMP)

| Control | Fate | Scope | Catalogue check | Base rules | What stays |
| --- | --- | --- | --- | --- | --- |
| CMP-1 Use the design-system component | Ports in part | Stack | `hybrid` | `BD-6a`, `WP-6e` | Use of the design-system component for each need: `BD-6a` checks only that the system is imported |
| CMP-2 Destructive actions confirm or undo | Ports in part | Generic | `hybrid` | `WU-12a`, `WU-12b`, `WO-15b` | The confirmation names what will be lost |
| CMP-3 Async loading, success, and error states | Ports in part | Generic | `hybrid` | `TX-9a`, `WR-2a` | A visible loading state with a minimum display time |
| CMP-4 Empty state distinct from loading and error | No base rule | Generic | `judgment` | None | The whole control |
| CMP-5 One primary action per view | No base rule | Generic | `hybrid` | None | The whole control |
| CMP-6 Data table pattern | Ports in part | Generic | `hybrid` | `WP-6a` | Right-aligned numeric columns, tabular figures, and a header that stays visible |
| CMP-7 Consistent with design-system defaults | Ports | None | `judgment` | `BD-6c` | None |
| CMP-8 Exit at every step, work preserved | Ports in part | Generic | `judgment` | `TX-5a`, `TX-5b` | A non-destructive exit at each step, and a warning before work is lost |
| CMP-9 Sanitise user content at render | No base rule | Generic | `hybrid` | None | The whole control. It is a security rule, outside the design standard |
| CMP-10 Error clears on correction | No base rule | Generic | `hybrid` | None | The whole control |
| CMP-11 Nested child traces the container | No base rule | Generic | `judgment` | None | The whole control |

### Content (CNT)

| Control | Fate | Scope | Catalogue check | Base rules | What stays |
| --- | --- | --- | --- | --- | --- |
| CNT-1 Error messages state what happened and what to do | Ports | None | `hybrid` | `WU-10c`, `WU-10d`, `WU-11a`, `WU-11b`, `TX-10a`, `TX-10b` | None |
| CNT-2 Plain feature and page names | Ports in part | Generic | `judgment` | `BD-4b`, `WU-3a` | No invented portmanteaus or internal codenames |
| CNT-3 Second person, active voice, short sentences | Ports in part | Generic | `hybrid` | `BD-4a` | Second person and active voice |
| CNT-4 Faithful real-world content | No base rule | Generic | `judgment` | None | The whole control |
| CNT-5 Device-neutral action words | Ports in part | Generic | `hybrid` | `WO-10c`, `WP-8a` | Device verbs outside link text |
| CNT-6 No low-information words | No base rule | Generic | `hybrid` | None | The whole control |
| CNT-7 Purpose before mechanism | No base rule | Generic | `judgment` | None | The whole control |
| CNT-8 Plain verbs, not nominalisations | No base rule | Generic | `judgment` | None | The whole control |
| CNT-9 Clear copy | Ports in part | Generic | `hybrid` | `BD-4a`, `BD-4b`, `WU-3a`, `WU-4a` | One idea per sentence, no double negatives, and no noun stacks |
| CNT-10 One term per thing | Ports | None | `judgment` | `WU-8a`, `WU-8b`, `WU-8c` | None |
| CNT-11 Established UI terms | No base rule | Generic | `judgment` | None | The whole control |
| CNT-12 Sentence case | No base rule | Generic | `hybrid` | None | The whole control |
| CNT-13 Spelling and Singapore English | No base rule | Generic | `hybrid` | None | The whole control |
| CNT-14 DX voice and tone | No base rule | Domain | `judgment` | None | The whole control |

### Motion (MOT)

| Control | Fate | Scope | Catalogue check | Base rules | What stays |
| --- | --- | --- | --- | --- | --- |
| MOT-1 Interface motion timing | No base rule | Generic | `hybrid` | None | The whole control |
| MOT-2 Motion values from tokens | No base rule | Generic | `hybrid` | None | The whole control |
| MOT-3 Motion never carries meaning alone | No base rule | Generic | `judgment` | None | The whole control |

### Identity (IDN)

| Control | Fate | Scope | Catalogue check | Base rules | What stays |
| --- | --- | --- | --- | --- | --- |
| IDN-1 Approved logos and lockups | Ports in part | Product | `hybrid` | `TL-2b`, `TL-2c`, `TL-2d` | Product lockups: `TL-2` covers the agency or initiative logo |
| IDN-2 Approved product icons | No base rule | Product | `hybrid` | None | The whole control |
| IDN-3 Product tone register | No base rule | Product | `judgment` | None | The whole control |
| IDN-4 CaseSync treats casework as sensitive | No base rule | Product | `judgment` | None | The whole control. It is scoped to CaseSync |

### Anti-slop (SLP)

The DSS have no matching control for any SLP control, so none ports to the base layer. [ADR-0001](../adr/0001-rule-set-and-presets.md) already decides that SLP is not a category and that each anti-slop rule moves to the category it grades (D10). Each SLP control therefore moves to the folder of the category it grades.

| Control | Fate | Scope | Catalogue check | Base rules | What stays |
| --- | --- | --- | --- | --- | --- |
| SLP-1 No purple gradients, cyan-on-dark, or glow accents | No base rule | Generic | `hybrid` | None | The whole control |
| SLP-2 No gradient text | No base rule | Generic | `deterministic` | None | The whole control |
| SLP-3 No side-tab accent borders on rounded cards | No base rule | Generic | `deterministic` | None | The whole control |
| SLP-4 No nested cards | No base rule | Generic | `deterministic` | None | The whole control |
| SLP-5 No icon-tile feature-card template | No base rule | Generic | `judgment` | None | The whole control |
| SLP-6 Adjacent type-scale steps differ by 1.10x | No base rule | Generic | `hybrid` | None | The whole control |
| SLP-7 Spacing has rhythm | No base rule | Generic | `judgment` | None | The whole control |
| SLP-8 No bounce or elastic easing | No base rule | Generic | `deterministic` | None | The whole control |
| SLP-9 No AI-writing tells | No base rule | Generic | `hybrid` | None | The whole control |
| SLP-10 Complex tasks get a page, not a modal | No base rule | Generic | `judgment` | None | The whole control |
| SLP-11 A card only for an interactive unit | No base rule | Generic | `judgment` | None | The whole control |

### Layout (LAY)

| Control | Fate | Scope | Catalogue check | Base rules | What stays |
| --- | --- | --- | --- | --- | --- |
| LAY-1 Declared column grid | No base rule | Generic | `hybrid` | None | The whole control |
| LAY-2 Reflow at 320 px | Ports | None | `judgment` | `WP-16a`, `WP-16b`, `BD-1b`, `WP-7b` | None |
| LAY-3 Known page template | No base rule | Generic | `judgment` | None | The whole control |
| LAY-4 Body-text measure | No base rule | Generic | `hybrid` | None | The whole control. It duplicates TYP-6 |
| LAY-5 Density suits the task | No base rule | Generic | `judgment` | None | The whole control |
| LAY-6 Shared edges align | No base rule | Generic | `judgment` | None | The whole control |
| LAY-7 One primary focal region | No base rule | Generic | `judgment` | None | The whole control |

## Python checks

A check retires when the lint parts of every control it decides are `design-lint` rules. A check that decides a stack or a product control stays with the placeholder catalogue.

| Check | Controls it decides | Fate |
| --- | --- | --- |
| `contrast.py` | A11Y-1 | Retires |
| `a11y-static.py` | A11Y-2 | Retires |
| `rendered-check.py` | A11Y-1, A11Y-3 to A11Y-10 | Retires once the reduced-motion part of A11Y-5 is a lint rule in `base/a11y/` |
| `a11y-eslint.py` | A11Y-2, A11Y-3, A11Y-6, A11Y-8 | Retires once a lint rule covers the placeholder-only label that A11Y-3 keeps |
| `structure-scan.py` | A11Y-7, CMP-6 | Retires once the CMP-6 remainder is a lint rule. A11Y-7 ports |
| `token-audit.py` | TOK-1, TOK-2, TOK-3, COL-1, COL-2 | Stays with the placeholder catalogue. Each of its controls is a stack or a product control |
| `type-scan.py` | TYP-1 to TYP-4, TYP-6, LAY-4 | Narrows to TYP-1 and TYP-3 once the generic controls are lint rules |
| `content-lint.py` | CNT-1, CNT-3, CNT-5, CNT-6, CNT-13, SLP-9 | Retires once the generic controls are lint rules. CNT-1 ports |
| `component-manifest.py` | CMP-1 | Stays with the placeholder catalogue |
| `audit-record.py`, `waiver-reconcile.py`, `reaudit-scope.py` | None: they validate catalogue decision records and waivers | Retire when `catalog.yaml` retires |
| `detect.py` | None: it runs the other checks | Narrows with the checks it runs |
| `design-catalog-validate.py`, `checklib.py` | None: the catalogue validator and its library | Stay while `catalog.yaml` exists |
| `skill-audit.py`, `skill-locators.py` | None: they check every skill | Stay. They do not depend on the catalogue |

## Where the remaining controls go

`catalog.yaml` does not keep the generic controls. Each generic control becomes a rule in a new folder under `base/`, one folder for each catalogue category, for example `cmp/`, `cnt/`, and `lay/`. These folders sit beside the DSS folders, such as `bd/` and `wp/`, and keep the catalogue prefix. The prefix shows whether a rule came from the DSS or from the catalogue. Each SLP control goes to the folder of the category it grades, under ADR-0001 D10.

The stack, domain, and product controls go to a placeholder catalogue: `catalog.yaml`, cut down to those 13 controls. The placeholder stays until the stack is decided and the domain presets exist. Then each control moves to a preset or to the `DESIGN.md` of its product, and `catalog.yaml` retires. ADR-0001 D1 already says that a domain with no preset keeps its values in the `DESIGN.md` of each product.

| Scope | Controls |
| --- | --- |
| Stack | TOK-1, TOK-2, TOK-3, COL-2, TYP-3, CMP-1 |
| Domain | CNT-14 |
| Product | COL-1, TYP-1, IDN-1, IDN-2, IDN-3, IDN-4 |

Three generic controls need a decision before they move. CMP-9 is a security rule, outside the design standard. TYP-6 and LAY-4 are one control stated twice, so only one of them moves.

### Lint and judged rules

A base rule is either `lint` or `judged`. A catalogue control is `deterministic`, `hybrid`, or `judgment`, so each control is re-evaluated before it moves. The re-evaluation covers the 47 generic controls, including the remainders of the controls that port in part.

- A `deterministic` control usually becomes one lint rule.
- A `hybrid` control usually becomes a lint rule and a judged rule. The lint rule names the judged rule in `judgedRemainder`.
- A `judgment` control usually becomes one judged rule.

The catalogue check is where the re-evaluation starts, not its result. LAY-2 is a `judgment` control, but it ports to four lint rules. Among the 47 generic controls, the catalogue lists 8 as `deterministic`, 22 as `hybrid`, and 17 as `judgment`.

Each new rule takes a code in the base format, such as `CMP-4a`. `redirects.yaml` maps each old catalogue code to its new codes.

## End state

After the migration, `skills/design-restructure/` no longer exists. [ADR-0001](../adr/0001-rule-set-and-presets.md) places each part:

| Part | Location after the migration |
| --- | --- |
| Base rules, from the DSS and from the catalogue | `plugins/dx-harness/standards/rules/<category>/<slug>.md` |
| Presets | `plugins/dx-harness/standards/presets/` |
| Renamed and retired rule codes | `plugins/dx-harness/standards/rules/redirects.yaml` |
| Design skills | `plugins/dx-harness/skills/design/`, reading the base rules |
| `design-lint` | `packages/design-lint/`, unchanged |

Four placements are open:

- ADR-0001 names a rule file by its slug, and the base layer names each file by its code, such as `BD-1a.md`. The migration settles one convention.
- No document places the `lint/` documents: `building-a-rule.md`, `config.md`, `run.md`, and `testing.md`.
- ADR-0001 D12 sets eight categories: `A11Y`, `TOK`, `COL`, `TYP`, `CMP`, `CNT`, `LAY`, and `MOT`. The base uses the nine DSS prefixes, and the new folders add the catalogue prefixes. A revision of ADR-0001 settles the category list and the meaning of `<category>`.
- The `design-restructure` README defines the base layer as the DSS only. The README changes to include the catalogue folders.

### What the move changes

- `design-lint` loads only files that match `^[A-Z]{2}-\d+[a-z]\.md$`, in `packages/design-lint/src/rules/load.ts`. The pattern rejects a prefix that is not two letters, such as `A11Y` or `CMP`. It must change before a catalogue rule can load.
- These files read `catalog.yaml` and change with it: `scripts/in-scope-rules.py`, `scripts/generate-design-json.py`, `procedures/catalogue-mechanics.md`, `docs/DESIGN-CONTEXT.md`, and the design skills that call them.
- The design standard website renders `catalog.yaml` as it is. A control that leaves the file leaves the website, unless the website also reads the base folders.

## Owner and timing

Not decided: who owns the migration, and when the live `dx-design-*` skills stop being the default.
