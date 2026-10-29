# BD: Baseline Design Practices

Source: [DSS Baseline Design Practices](https://info.standards.tech.gov.sg/control-catalog/dss/bd/). Status: draft.

The category has 9 DSS controls and 26 rules: 18 lintable and 8 judged. The rule format is in the [top-level README](../../rules.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

| Rule | Title | Surface |
| --- | --- | --- |
| [BD-1a](viewport-meta.md) | Viewport meta present and zoom allowed | source |
| [BD-1b](no-horizontal-scroll.md) | No horizontal scroll at each viewport width | rendered |
| [BD-1d](mobile-content-notice.md) | Content that is disabled on mobile has a notice with a way to reach it | rendered |
| [BD-2a](search-form-present.md) | A multi-page site has a search form | project |
| [BD-2c](search-visible-on-desktop.md) | The search form is visible in the first screen at desktop size | rendered |
| [BD-2d](search-in-header-on-every-page.md) | The search form is on every page, in the header, in the same place | rendered |
| [BD-2e](search-input-width-and-tab-order.md) | The search input is wide enough and early in the tab order | rendered |
| [BD-3a](locales-and-language-switcher.md) | At least two locales are declared and a language switcher links to each | project |
| [BD-3c](language-switcher-on-entry-pages.md) | The language switcher appears on each entry page | project |
| [BD-4a](readability-grade.md) | Readability grade of each text block is at or below the limit | rendered |
| [BD-4b](complex-words.md) | Words from the complex-word list are flagged | rendered |
| [BD-5a](title-description-canonical.md) | Title, meta description, and canonical link are present and within length | source |
| [BD-6a](design-system-imported.md) | The declared design system is imported | project |
| [BD-6b](token-values.md) | Values come from tokens, not raw values | source |
| [BD-7a](required-field-markers.md) | Every required control has a visible marker and a programmatic marker | source |
| [BD-7b](one-marker-style.md) | One marker style across the project | project |
| [BD-8a](account-identifier-in-header.md) | The account identifier is visible in the header of each authenticated page | rendered |
| [BD-9a](contact-channel.md) | At least one contact channel exists | project |

The 8 judged rules have no file yet. Each needs a rubric from `dx-design-judge`: `BD-1c`, `BD-2b`, `BD-3b`, `BD-4c`, `BD-5b`, `BD-6c`, `BD-8b`, and `BD-9b`.

## Decisions

- An exemption is a parameter in the product config. The inline waiver is not used for an exemption.
- `BD-8a` loads each page that the config lists in `authenticatedPages`. A product with no sign-in lists none, and the rule does not apply.
- `BD-1b` tests 320, 768, and 1280 pixels by default. A product can change the list.
- `BD-6b` points to the ported TOK rules and does not repeat them.
- Tiers are provisional until [#432](https://github.com/transformteamsg/dx-harness/issues/432) classifies which controls a script can decide.
- A letter suffix splits one DSS control into several rules. ADR 0001 uses `PREFIX-N`, so the ADR needs to cover the suffix.

## Built

All 18 lint rules of BD have a linter module in `packages/design-lint/`. Each has a fixture pair and a break patch. See [lint/testing.md](../../../../../packages/design-lint/docs/testing.md).

Decisions that the build forced:

- `BD-2c`, `BD-2d`, and `BD-2e` run only when the site has a search form. A site with none gets one finding from `BD-2a`, not one from each page.
- `BD-1b`, `BD-4a`, and `BD-4b` gained a `pages` parameter. A rendered rule cannot load a page without a list.
- `BD-8a` gained a default for `accountSelector`, `[data-account-name]`. A product with no sign-in lists no authenticated pages and needs no config for this rule.
- `BD-6b` ports only the raw colour part of TOK-1. TOK-2, TOK-3, and COL-2 are not ported.
- A break patch can name other rules that it also breaks. The patch of `BD-2d` also breaks `BD-2e`, because the moved form is a later tab stop. The patch of `BD-2a` is marked exclusive, because it removes the search form that the other search patches need.

## Open

- `BD-5a`: check whether a Lighthouse SEO audit covers the three conditions before a custom rule is written.
- `BD-4a`: the readability formula applies to English only. A rule for other locales needs another formula.

## Reviewed decisions

- `BD-4a`: kept at tier L2 and scoped to body copy through `contentSelector`. Legal text is exempt through `exemptSelector`. `maxGrade` stays unset.
- Second pass: `BD-2c` added as lint.
- Second pass: `BD-3c` added as lint.
- `BD-5b`: the lint part (unique, non-generic page titles) is `WO-8d` in the WO category.
- `BD-1d`: added as lint at tier L2 during the review of the judged rules. It finds candidates by comparing the page at the mobile and desktop widths. `BD-1c` stays judged for the quality of the explanation.
- `BD-2d` and `BD-2e`: added as lint for `BD-2b`. `BD-2d` is deterministic at tier L1. `BD-2e` rests on usability guidance, not on the DSS, so it is L2. The width of 27 characters is attributed to the Nielsen Norman Group in secondary sources. Verify it against NN/g.
- `BD-5a`: the length limits count characters. A Chinese title or description packs more into each character, so the limits suit English. The Chinese demo page needed a longer description to pass.
- `BD-4a`: a locale that is not English skips the rule with no note. The rule text says that it reports "not configured". The module does not yet.
- `BD-1d`, `BD-2e`, and `BD-4a` are heuristics that were tuned on the demo site only. They need the calibration corpus before the thresholds can be trusted.
