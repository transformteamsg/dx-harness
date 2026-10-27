# TX: Transactions and Payments

Source: [DSS Transactions and Payments](https://info.standards.tech.gov.sg/control-catalog/dss/tx/). Status: draft.

The category has 15 DSS controls and 29 rules: 16 lintable, 11 judged, and 2 out of scope for the design linter. The rule format is in the [top-level README](../../README.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

| Rule | Title | Surface |
| --- | --- | --- |
| [TX-2a](TX-2a.md) | Each start page states the prerequisites that the config lists | rendered |
| [TX-3a](TX-3a.md) | A step has no more than the set number of controls | source |
| [TX-4a](TX-4a.md) | A multi-step flow shows a progress indicator on each step | source |
| [TX-5a](TX-5a.md) | A long flow offers a save-draft control on each step | rendered |
| [TX-6a](TX-6a.md) | Personal and payment fields carry a valid autocomplete token | source |
| [TX-7a](TX-7a.md) | Each payment page shows the amount payable | rendered |
| [TX-7b](TX-7b.md) | Refund information is on each payment page and each start page | rendered |
| [TX-8a](TX-8a.md) | A product that stores payment details has a page to update and remove them | project |
| [TX-9a](TX-9a.md) | Each outcome page has a status message | rendered |
| [TX-10a](TX-10a.md) | Each failure page states the reason for the failure | rendered |
| [TX-10b](TX-10b.md) | Each failure page offers an alternative action and a channel for appeals or enquiries | rendered |
| [TX-11a](TX-11a.md) | Each success page shows the payment details | rendered |
| [TX-11b](TX-11b.md) | Each success page offers a download or print option | rendered |
| [TX-12a](TX-12a.md) | A delayed outcome comes with an estimated timeframe | rendered |
| [TX-13a](TX-13a.md) | Each success page offers an acknowledgement to download or names the channel that carries it | rendered |
| [TX-15a](TX-15a.md) | A product with a delayed outcome has a tracking page with status labels | project |

The 11 judged rules have no file yet. Each needs a rubric from `dx-design-judge`: `TX-1a`, `TX-2b`, `TX-3b`, `TX-4b`, `TX-5b`, `TX-6b`, `TX-7c`, `TX-8b`, `TX-9b`, `TX-10c`, and `TX-15b`.

The 2 out-of-scope rules are `TX-13b` and `TX-14a`. Both test message delivery, which only the back end shows.

## Decisions

- The DSS lists no exemption for any TX control. An unset parameter reports "not configured". A product config answers applicability with `storesPaymentDetails` and `outcomeImmediate`, or with an empty page list.
- A rule reads the pages that the config names in `startPages`, `paymentPages`, `successPages`, and `failurePages`. The linter does not guess which page is which.
- A threshold that the DSS does not set has no default. `maxControlsPerStep`, `minStepsForIndicator`, and `minStepsForDraft` are `null` until the product sets them.
- Selector parameters that identify product-specific elements have no default. Patterns and tokens that are common across products have defaults.
- Idempotency, duplicate-submission handling, and receipts sent by email have no design check. They are out of scope.
- The DSS does not require a review step before submit, a cancel path, or a separate visible total. No rule invents one. `TX-7a` covers the visible amount.
- `TX-4a` applies to a flow with `minStepsForIndicator` or more steps. `TX-5a` applies from `minStepsForDraft`. The DSS says "long" and gives no number.
- `TX-1a` is judged. The legal-exception clause needs a human reading of the regulation.
- Tiers are provisional until [#432](https://github.com/transformteamsg/dx-harness/issues/432) classifies which controls a script can decide. Source and project rules start at L1, and text-pattern rules on rendered pages at L2.

## Open

- A rendered text-pattern rule (`TX-2a`, `TX-7b`, `TX-11a`, `TX-12a`) depends on English patterns. A product in another locale needs its own patterns.
- `TX-9a` and `TX-10a` need a way to reach a failure state in a fixture. The config format for that is not designed.
- `TX-5a`, `TX-12a`, and `TX-15a` ask the product for the number of steps or the outcome type. Check whether a flow declaration in the config can supply this for every rule.
- `TX-6a`: check whether axe `autocomplete-valid` covers the invalid-token condition before a custom rule is written for it.
- `TX-8a` and `TX-15a` check a declared page. A product that offers the function in a modal or panel has no page to declare.
- A card payment may run on a hosted page that the linter cannot load. `TX-7a` and `TX-6a` cannot test that page.

## Built

All 16 lint rules have a module, a fixture pair, and a break patch. The modules are in `packages/design-lint/src/modules/tx/`. Every rule that is not listed below was built as its rule file states.

- `TX-3a`, `TX-4a`, `TX-5a`, and `TX-6a` gain the parameter `flowPages`, a product value that lists the pages of a flow in order. The runner does not pass `flows` to a rule, so a rule cannot find the steps without it. A flow has as many steps as `flowPages` has pages. These four rules read only those pages, so a form elsewhere on the site is not a step.
- `TX-3a` counts a radio group as one control. `stepSelector` and every selector that a project or source rule reads allow one compound selector or a comma list, with no combinator. A rendered rule uses the full CSS selector.
- `TX-4a` passes a page when any matched element has visible text, `aria-label`, `aria-labelledby`, or `aria-valuetext`. A finding for a page sits on its `<main>` element.
- `TX-5a` matches `saveDraftPatterns` as case-insensitive substrings of the accessible name. A control with `display: none` or zero size counts as hidden.
- `TX-6a` changed engine. axe runs only in a browser page, and this rule reads source, so the HTML part checks the token against the WHATWG list in code. The JSX part is jsx-a11y `autocomplete-valid`, which finds an invalid token and not a missing attribute. A missing attribute in JSX and TSX is not checked. A control matches a key of `autocompleteFields` when its `type`, `name`, or `id` equals the key after case and punctuation are removed. A token that is valid but differs from the mapped token passes.
- `TX-7a` accepts the currency forms `S$25`, `$25`, `25 SGD`, and `25 dollars`, and the symbols for USD, euro, and pound. The submit control is the first submit button in `<main>`.
- `TX-2a`, `TX-7b`, `TX-11a`, `TX-12a`, and `TX-13a` match English text. `TX-2a`, `TX-11a`, and `TX-12a` read their patterns as case-insensitive regular expressions. `TX-7b`, `TX-5a`, and `TX-10b` read theirs as case-insensitive substrings. A product in another locale sets its own patterns.
- `TX-2a`, `TX-11a`, and `TX-3a` report one finding for each page, and the message lists every missing item. `TX-12a` reports one finding for the product, on the first start page, or on the first success page when the list of start pages is empty.
- `TX-9a` cannot tell that a word states the outcome. It fails a status message that has no letters, which is a symbol or icon alone.
- `TX-10b` reads a page-wide match. A `mailto:` link in a footer satisfies the channel check.
- `TX-8a` and `TX-15a` apply only when the parameter is `true` or `false` as the rule file states. The runner reports "not configured" for any `null` parameter, even where the rule does not apply, so a product that does not store payment details still sets `managePage` and the selectors to any value.
- The demo site sets `acknowledgementControlSelector` to an attribute that no page has, so `TX-13a` passes through the channel text on the success page. Its patch removes that text.
- The demo site is a hall booking, under `demo/site/tx/`. It sets `outcomeImmediate` to `false` and `storesPaymentDetails` to `true`, so that `TX-8a`, `TX-12a`, and `TX-15a` run on their applicable path. The not-applicable paths are in `test/tx-rules.test.ts`.

Not built: none of the 16 lint rules. The judged rules and `TX-13b` and `TX-14a` have no file, as before.
