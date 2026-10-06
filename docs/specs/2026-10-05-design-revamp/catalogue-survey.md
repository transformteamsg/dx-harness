# Design revamp: catalogue survey

**Date:** 2026-10-06
**Issue:** [#427](https://github.com/transformteamsg/dx-harness/issues/427) (C0 in the [design revamp spec](README.md#catalogue))

This survey reads the current catalogue as a whole before C1 decides the category list, the tiers, and the code format. It covers the 72 controls in `plugins/dx-harness/standards/catalog.yaml` and the 57 detail files in `plugins/dx-harness/standards/controls/`.

The survey flags controls. It does not decide what happens to them. The category reviews, C4 to C13, decide whether to keep, change, merge, split, or drop each control.

## How to read this survey

Each control has one row. The rows are grouped by candidate category, and each category states its scope in one line. A control that fits no candidate category, or that seems to need a split across categories, is under [Open questions for C1](#open-questions-for-c1) instead.

A row carries these flags where they apply, each with a one-line reason:

- **Wrong:** the control contradicts itself, another control, or a check, or it cites something that does not exist.
- **Duplicated:** the control grades the same thing as another control. The flag names the other control IDs.
- **Portfolio-specific:** the requirement, a value it sets, or its scope names a portfolio product, the portfolio stack, or the teacher audience. A rationale that only mentions teachers does not earn the flag.

The **Detail file** column says **None** for the 15 controls with no file in `standards/controls/`. Those rows are surveyed from the catalogue entry alone.

## Candidate categories

| Category | Scope | Controls |
| --- | --- | --: |
| [`A11Y` Accessibility](#a11y-accessibility) | The surface meets WCAG 2.2 AA. | 12 |
| [`TOK` Tokens](#tok-tokens) | Colour and spacing values in code come from the declared token set. | 2 |
| [`COL` Colour](#col-colour) | Colour roles, such as the primary action and functional states, use the right colour. | 2 |
| [`TYP` Typography](#typ-typography) | Typefaces, sizes, the type scale, case, figures, and the prose measure. | 8 |
| [`CMP` Components and patterns](#cmp-components-and-patterns) | Component reuse, action weight, states, flows, cards, and the choice between a page and a modal. | 14 |
| [`CNT` Content](#cnt-content) | The words on the surface: errors, names, voice, clarity, terms, case, and spelling. | 15 |
| [`LAY` Layout](#lay-layout) | Grid, page template, density, alignment, focal hierarchy, and spacing rhythm. | 6 |
| [`MOT` Motion](#mot-motion) | Duration, easing, motion tokens, and meaning without motion. | 4 |
| [`SLP` Anti-slop](#slp-anti-slop) | Visual defaults that mark a surface as generated and have no other domain home. | 3 |
| [Portfolio, opt-in](#portfolio-opt-in) | Brand assets and voice registers of the Teacher & School products. C1 names the category. | 4 |
| [Open questions](#open-questions-for-c1) | Controls that are not placed. | 2 |

The candidates keep the current prefixes where the domain is unchanged. Three kinds of move change the current grouping:

- Eight `SLP` controls move to the domain that they grade. Only SLP-1, SLP-2, and SLP-3 have no other home.
- LAY-2 moves to `A11Y`, because 320 px reflow is WCAG success criterion 1.4.10.
- LAY-4 moves to `TYP`, beside TYP-6, which grades the same measure.

### `A11Y` Accessibility

Scope: the surface meets WCAG 2.2 AA.

| Control | Checks | Detail file | Flags |
| --- | --- | --- | --- |
| A11Y-1 | Text and UI contrast | None | **Duplicated** (COL-1, COL-2): COL-2's small-text clause and a COL-1 failure bullet restate this contrast floor for coloured text. |
| A11Y-2 | Keyboard reach and visible focus | None | None |
| A11Y-3 | Visible, associated form labels | None | None |
| A11Y-4 | Target size | None | **Wrong:** WCAG 2.2 AA sets 24 px (success criterion 2.5.8), so the 44 px mobile target is a house choice inside the floor category. |
| A11Y-5 | Reduced motion | None | None |
| A11Y-6 | Text alternatives | None | None |
| A11Y-7 | Semantic structure and descriptive labels | `a11y-7.md` | **Duplicated** (CMP-6, CNT-5): CMP-6 grades the same table headers with the same `structure-scan.py` rule, and CNT-5 grades link text that names its destination. |
| A11Y-8 | Name, role, and value of custom components | `a11y-8.md` | None |
| A11Y-9 | Page title and language | None | None |
| A11Y-10 | Bypass blocks | None | None |
| A11Y-11 | Announcements and focus for async changes | `a11y-11.md` | None |
| LAY-2 | Reflow at 320 px | `lay-2.md` | None |

### `TOK` Tokens

Scope: colour and spacing values in code come from the declared token set.

| Control | Checks | Detail file | Flags |
| --- | --- | --- | --- |
| TOK-1 | No raw colour values | `tok-1.md` | **Portfolio-specific:** the allowed values are shadcn semantic tokens and Radix scales, the portfolio stack. |
| TOK-2 | Spacing from the scale | None | **Portfolio-specific:** the allowed scale is the shadcn default. |

### `COL` Colour

Scope: colour roles, such as the primary action and functional states, use the right colour.

| Control | Checks | Detail file | Flags |
| --- | --- | --- | --- |
| COL-1 | The product's primary colour on primary actions | `col-1.md` | **Portfolio-specific:** the detail file holds the primary colours of Teacher Workspace, CaseSync, and Glow.<br>**Duplicated** (A11Y-1): a failure bullet restates the contrast floor for white text on a light primary. |
| COL-2 | Functional colours from the shared scales | `col-2.md` | **Wrong:** `token-audit.py` and `contrast.py` disagree with its step-12 rule ([#128](https://github.com/transformteamsg/dx-harness/issues/128), [#352](https://github.com/transformteamsg/dx-harness/issues/352), [#295](https://github.com/transformteamsg/dx-harness/issues/295)).<br>**Duplicated** (A11Y-1): the small-text clause restates the 4.5:1 floor.<br>**Portfolio-specific:** the functional colours must come from Radix Colors. |

### `TYP` Typography

Scope: typefaces, sizes, the type scale, case, figures, and the prose measure.

| Control | Checks | Detail file | Flags |
| --- | --- | --- | --- |
| TYP-1 | Allowed typefaces | `typ-1.md` | **Portfolio-specific:** names Plus Jakarta Sans and Inter, and holds a registry of product wordmark typefaces. |
| TYP-2 | Size floors and body line height | `typ-2.md` | **Wrong:** the title states a line-height band of 1.5 to 1.6, but `type-scan.py` enforces only the floor ([#203](https://github.com/transformteamsg/dx-harness/issues/203)). |
| TYP-3 | Sizes from the type scale | None | **Portfolio-specific:** the scale is Tailwind's default, written as a list in the `verify` text that `type-scan.py` parses. |
| TYP-4 | No all-caps text | None | None |
| TYP-5 | Tabular figures | `typ-5.md` | **Duplicated** (CMP-6): CMP-6 also requires tabular figures in numeric table columns. |
| TYP-6 | Prose measure | `typ-6.md` | **Duplicated** (LAY-4): both cap the prose measure, and one `type-scan.py` rule reports a long line under both IDs.<br>**Wrong:** its 75ch ceiling disagrees with LAY-4's 80ch, and its 40 to 60 target falls partly below its own 45 to 75 range. |
| LAY-4 | Prose measure | `lay-4.md` | **Duplicated** (TYP-6): both cap the prose measure.<br>**Wrong:** its 80ch ceiling and 66ch target disagree with TYP-6. |
| SLP-6 | Ratio between adjacent type sizes | `slp-6.md` | **Wrong:** every adjacent pair on the TYP-3 scale clears 1.10x, so a page that passes TYP-3 cannot fail this ratio. |

### `CMP` Components and patterns

Scope: component reuse, action weight, states, flows, cards, and the choice between a page and a modal.

| Control | Checks | Detail file | Flags |
| --- | --- | --- | --- |
| CMP-1 | Use the stack's component where one exists | `cmp-1.md` | **Portfolio-specific:** names the Base UI stack, Radix Colors, and shadcn tokens. |
| CMP-2 | Destructive actions show consequences | `cmp-2.md` | **Wrong:** it is L0 with no script. `standards/README.md` makes a script the only exit for L0, and `validate.py` still grandfathers it under [#158](https://github.com/transformteamsg/dx-harness/issues/158), which is closed. |
| CMP-3 | Loading, success, and error states | `cmp-3.md` | **Duplicated** (CMP-6): CMP-6 restates the designed empty and loading states for tables. |
| CMP-4 | Empty states that read as empty | `cmp-4.md` | None |
| CMP-5 | One primary action per view | `cmp-5.md` | None |
| CMP-6 | The data table pattern | `cmp-6.md` | **Duplicated** (A11Y-7, TYP-5, CMP-3): it bundles table semantics, tabular figures, and async states that those controls already grade. |
| CMP-7 | Consistency with component defaults and sibling pages | `cmp-7.md` | **Duplicated** (TOK-3): TOK-3 also requires peer containers to share one radius. |
| CMP-8 | Exits and draft safety in multi-step tasks | `cmp-8.md` | None |
| CMP-10 | Validation errors clear on correction | `cmp-10.md` | None |
| CMP-11 | Nested child traces its container's edge | `cmp-11.md` | **Duplicated** (TOK-3): TOK-3's concentric-nesting clause grades a nested child's radius against its container. |
| SLP-4 | No nested cards | None | **Duplicated** (SLP-11): a nested card is static content in card chrome, which SLP-11 already fails. |
| SLP-5 | No feature-card template or identical card grids | `slp-5.md` | **Wrong:** `verify` describes a layout scan, but the check is `judgment` and no scan exists. |
| SLP-10 | A page, not a modal, for complex tasks | `slp-10.md` | None |
| SLP-11 | Cards only for interactive units | `slp-11.md` | **Duplicated** (SLP-4): SLP-4's nested cards are a case of static content in card chrome. |

### `CNT` Content

Scope: the words on the surface: errors, names, voice, clarity, terms, case, and spelling.

| Control | Checks | Detail file | Flags |
| --- | --- | --- | --- |
| CNT-1 | Error messages | `cnt-1.md` | None |
| CNT-2 | Plain feature and page names | `cnt-2.md` | **Portfolio-specific:** the test in `verify` is whether a teacher understands the name. |
| CNT-3 | Second person, active voice, and sentence length | `cnt-3.md` | **Duplicated** (CNT-9): both fail passive constructions, and both bound sentence size. |
| CNT-4 | Fidelity to real-world artefacts | `cnt-4.md` | None |
| CNT-5 | Action words that name the action, not the device | `cnt-5.md` | **Duplicated** (A11Y-7): A11Y-7 also fails link text such as "click here" that does not name its destination. |
| CNT-6 | No low-information words | `cnt-6.md` | **Duplicated** (SLP-9): both claim filler words, and the two lint lists stay apart only by hand. |
| CNT-7 | Descriptive copy leads with purpose | `cnt-7.md` | **Portfolio-specific:** the title defines purpose as what the copy does for the teacher. |
| CNT-8 | Plain verbs, not nominalisations | `cnt-8.md` | None |
| CNT-9 | Clarity mechanics | `cnt-9.md` | **Duplicated** (CNT-3): both fail passive constructions, and both bound sentence size.<br>**Portfolio-specific:** it exempts established teacher terms, such as CCE and MOE. |
| CNT-10 | One term per thing within a product | `cnt-10.md` | None |
| CNT-11 | Established UI terms | `cnt-11.md` | **Portfolio-specific:** the convention is the word that teachers meet in other products. |
| CNT-12 | Sentence case | `cnt-12.md` | None |
| CNT-13 | Spelling and proofreading | `cnt-13.md` | **Portfolio-specific:** it sets Singapore English spelling. |
| CNT-14 | Voice and tone | `cnt-14.md` | **Portfolio-specific:** it grades against the DX voice: Kind Utility, with the attributes Clear, Thoughtful, and Approachable.<br>**Wrong:** `verify` cites `voice-tone.mdx`, a website page that left this repository in [#405](https://github.com/transformteamsg/dx-harness/pull/405).<br>**Duplicated** (IDN-3): IDN-3 grades the same copy against each product's register of this voice. |
| SLP-9 | No AI-writing tells | `slp-9.md` | **Duplicated** (CNT-6): both claim filler words, and the two lint lists stay apart only by hand. |

### `LAY` Layout

Scope: grid, page template, density, alignment, focal hierarchy, and spacing rhythm.

| Control | Checks | Detail file | Flags |
| --- | --- | --- | --- |
| LAY-1 | The declared column grid | `lay-1.md` | **Duplicated** (TOK-2): its gutter clause restates the TOK-2 spacing scale. |
| LAY-3 | A known page template | `lay-3.md` | **Wrong:** `verify` reads the page type from Phase 1 of the current design loop, which the skills rebuild retires. |
| LAY-5 | Density suits the task | `lay-5.md` | None |
| LAY-6 | Shared edges align | `lay-6.md` | None |
| LAY-7 | One focal region | `lay-7.md` | None |
| SLP-7 | Spacing rhythm | `slp-7.md` | **Wrong:** `verify` describes a spacing scan, but the check is `judgment` and no scan exists. |

### `MOT` Motion

Scope: duration, easing, motion tokens, and meaning without motion.

| Control | Checks | Detail file | Flags |
| --- | --- | --- | --- |
| MOT-1 | Duration and easing | `mot-1.md` | **Duplicated** (SLP-8): standard easing already excludes the bounce and elastic easing that SLP-8 bans. |
| MOT-2 | Motion values from tokens | `mot-2.md` | **Wrong:** a failure bullet names `--motion-story`, a token of the website, which left this repository in [#405](https://github.com/transformteamsg/dx-harness/pull/405). |
| MOT-3 | Meaning without motion | `mot-3.md` | None |
| SLP-8 | No bounce or elastic easing | None | **Duplicated** (MOT-1): MOT-1's standard easing already excludes it. |

### `SLP` Anti-slop

Scope: visual defaults that mark a surface as generated and have no other domain home.

| Control | Checks | Detail file | Flags |
| --- | --- | --- | --- |
| SLP-1 | No purple gradients, cyan on dark, or glow accents | `slp-1.md` | **Wrong:** the detail file calls `--glow` a declared product colour in this repository, and no file outside Markdown declares it.<br>**Portfolio-specific:** it exempts the Glow primary colour by name. |
| SLP-2 | No gradient text | None | None |
| SLP-3 | No thick side-tab borders on rounded cards | None | None |

### Portfolio, opt-in

Scope: brand assets and voice registers of the Teacher & School products. C1 names the category.

| Control | Checks | Detail file | Flags |
| --- | --- | --- | --- |
| IDN-1 | Logos from approved assets | `idn-1.md` | **Portfolio-specific:** the approved asset library is the portfolio's. |
| IDN-2 | Icons from the approved product-icon family | `idn-2.md` | **Portfolio-specific:** the icon family and the Icon Generator belong to the portfolio's product-icon guideline. |
| IDN-3 | Each product's tone register | `idn-3.md` | **Portfolio-specific:** the detail file holds a register table for each portfolio product.<br>**Duplicated** (CNT-14): CNT-14 grades the same copy against the shared voice. |
| IDN-4 | Restraint on CaseSync case data | `idn-4.md` | **Portfolio-specific:** it is scoped by `products: [casesync]`. [#285](https://github.com/transformteamsg/dx-harness/issues/285) is open to remove it. |

## Open questions for C1

### Controls that are not placed

| Control | Checks | Detail file | Flags | Question |
| --- | --- | --- | --- | --- |
| TOK-3 | Radii from the scale, concentric nesting, and one radius for peers | `tok-3.md` | **Duplicated** (CMP-7, CMP-11): CMP-7 grades consistency between peers, and CMP-11 grades a nested child against its container.<br>**Portfolio-specific:** the scale is the shadcn default radius scale.<br>**Wrong:** the detail file anchors the peer radius to "this product's `app/globals.css`", a website file that left this repository in [#405](https://github.com/transformteamsg/dx-harness/pull/405). | It holds three statements across two candidate categories. On-scale radii fit `TOK`. Concentric nesting and one radius for peers fit `CMP`. Does it split? |
| CMP-9 | Sanitisation of content that one user authors for another | `cmp-9.md` | **Wrong:** `verify` names `checks/cmp-scan.py`, which does not exist. | Render-time sanitisation is a security control, not a design rule, and it fits no candidate category. Does it stay in the design catalogue, or move to code review? |

### Questions about the categories

1. **Is `SLP` still a category?** The candidates move eight `SLP` controls to the domain that they grade. SLP-1, SLP-2, and SLP-3 could also move, to `COL`, `TYP`, and `CMP`, which would retire the prefix.
2. **How does a generic rule carry portfolio values?** These controls state a generic rule with portfolio values written in: TOK-1, TOK-2, TYP-1, TYP-3, COL-1, COL-2, CMP-1, CNT-13, and CNT-14. Each value can become a parameter that the portfolio selection sets, or the control can split into a generic rule and a portfolio rule.
3. **Who is the audience in a generic rule?** CNT-2, CNT-7, CNT-9, and CNT-11 state their test in terms of teachers. A generic rule could read the audience from `DESIGN.md` instead.
4. **Is IDN-1 generic?** Every product with a logo can use only its approved assets. If IDN-1 is generic, it needs a category other than the portfolio one, which bears on whether `IDN` survives.

## Other observations

These facts bear on C1 and the reviews, but they are not flags on one control.

- **Scope fields.** IDN-4 is the only control with a `products:` field. No control has an `audiences:` field.
- **Proposed controls.** CMP-10, CMP-11, MOT-2, and MOT-3 carry `status: proposed`. A design lead has not ratified them, and the catalogue still lists them beside ratified controls.
- **Grandfathered gaps.** `checks/validate.py` lists 18 controls in `GAP_GRANDFATHERED`: they are effectively manual and carry no `gap:` reason. Each entry names an issue from #155 to #162 that should remove it, and all of those issues are closed.
- **Missing change records.** The history comments in `catalog.yaml` cite change records in `docs/catalog-changes/`. Of the records they cite, only `cmp-10-input-validation-error-clearing.md` is in the repository.
- **Teacher rationale.** Most detail files argue from teachers and Kind Utility in their rationale. The portfolio-specific flag covers only requirements, so the rule-writing standard (C2) decides how a generic rule states its reason.
