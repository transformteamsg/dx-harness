---
id: CNT-11
source: TFX-DS
title: UI terms match the established word teachers already meet across other products — "Search" not "Find", "Settings" not "Preferences"
tier: L2
check: judgment
phase: [implement, verify]
applies_to: [content]
verify: "Evaluator checks common UI terms against the convention teachers see across the web and other products; an invented or unfamiliar synonym for a standard term is a finding"
waiver: rationale
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Use the term teachers already meet elsewhere for a common UI element or action. When a
convention is established across the web and other products, match it — a search
field's placeholder says "Search", not "Find"; a settings area is "Settings", not
"Preferences". Established terms are easier to recognise and navigate; a coined synonym
makes a teacher re-learn a word they already know.

This applies to terms with a settled outside convention — search, settings, sign in,
filter, sort, download, share, and the like. It does not force a house term onto a
concept that has no external standard.

## Rationale

Teachers move across dozens of platforms. Reusing the familiar word means a teacher
arrives already knowing what it does; inventing one adds a small tax on every visit.
This is a strong default rather than an absolute: a product sometimes has a genuine
reason to differ (a domain term more precise than the generic one, or a ministry term
that must appear verbatim). So it is L2 — deviate deliberately, with the reason
recorded at the deviation site, not silently.

See also: CNT-2 grades whether a feature/page *name* is plain language; this control
grades whether a common UI term matches the outside convention. CNT-10 is the
inward-facing sibling: CNT-10 keeps one term per thing *within* a product, CNT-11 keeps
that term in agreement *with* the established word teachers meet elsewhere.

## Passes when

- A search field's placeholder or button reads "Search".
- The account/configuration area is labelled "Settings".
- The entry action reads "Sign in" (the prevailing web convention), used consistently.

## Fails when

- An invented or unfamiliar synonym stands in for a standard UI term: "Find" for a
  search field, "Preferences" for settings, "Locate" for search.
- A coined product term is used where an established web convention already exists and
  no reason is recorded.

## How to verify

Judgment only. The evaluator lists the product's common UI terms — search, settings,
filter, sort, sign in, download, share, and similar — and compares each against the
established convention teachers meet across the web and other government/education
products. A synonym for a standard term, used without a recorded reason, is a finding.

## Evaluator guidance

Quote the term used and name the established convention it should match.

**Flag:**

- A generic UI element or action given a coined or unusual synonym: "Find" for search,
  "Preferences" for settings, "Dispatch" for send.

**Do not flag:**

- A domain term teachers genuinely use that is more precise than the generic web word
  (e.g. "Form Class" rather than "Group").
- A concept with no settled external convention, where the product's own plain term is
  reasonable.
- A term dictated by a ministry or programme that must appear verbatim and carries an
  inline `tfx-waive CNT-11 reason="..."`.

## Waiver

`rationale` (L2) — inline `tfx-waive CNT-11 reason="..."` at the deviation site. A
domain term more precise than the generic convention, or a mandated programme term, is
the canonical waiver case.
