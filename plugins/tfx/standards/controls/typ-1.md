---
id: TYP-1
source: TFX-DS
title: Display text is Plus Jakarta Sans (600); body/UI text is Inter (400/500/600); no other typefaces
tier: L1
check: deterministic
phase: [implement, verify]
applies_to: [page, component]
verify: "Font-family scan; only Plus Jakarta Sans + Inter at approved weights, plus each product's registered brand-wordmark typeface used solely for its wordmark/logo lockup (see controls/typ-1.md); checks/type-scan"
waiver: documented
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Product UI is set in **Plus Jakarta Sans** (600, display) and **Inter** (400/500/600,
body/UI). No third typeface — with one registered exception: a product's **brand
wordmark** may use its own settled wordmark typeface, **confined to the wordmark/logo
lockup** (the product name / masthead mark), never for running display, headings, or
body text.

This is the typographic analogue of COL-1's per-product primary colour: a wordmark is
a brand asset (cf. IDN-1 for logo *images*), and a settled wordmark typeface is
registered here rather than re-flagged as a violation on every surface that renders
the mark.

## Per-product registered brand wordmark

| Product | Wordmark typeface | Token | Scope |
|---|---|---|---|
| Glow | Inria Sans | `--font-logo` | Wordmark/logo lockup only (e.g. the "glow" masthead + tagline lockup) |
| Teacher Workspace | — (Plus Jakarta Sans) | — | No separate wordmark face |
| CaseSync | — (proposed) | — | Awaiting design-lead settle |

A typeface not in this table, or the registered wordmark face used **outside** its
lockup (as heading or body type), is a TYP-1 finding.

## Rationale

Glow pilot (2026-07-01): the `--font-logo: Inria Sans` wordmark is a deliberate brand
lockup, but TYP-1 as written ("no other typefaces") flagged it as a hard L1 violation
requiring a hand-written waiver on every surface that renders the mark. COL-1 already
registers each product's primary *colour* in a per-product table; IDN-1 protects logo
*images*; TYP-1 had no analogue for a wordmark *typeface*. Registering the settled
wordmark face — scoped to the lockup — stops the recurring waiver while keeping the
"no third typeface in running UI" rule intact.

Note the failure mode this does **not** excuse: a dead font `@import` (a typeface
loaded but used by nothing — e.g. Glow's shipped-but-unused Geist import) is still a
TYP-1 finding. The exception covers a *used* wordmark face, not loaded dead bytes.

## How to verify

**Deterministic:** the `checks/type-scan` font-family scan allowlists Plus Jakarta
Sans, Inter, and each product's registered wordmark token from this table. A
font-family outside the allowlist, or a loaded-but-unreferenced `@import`, is flagged.

**Scope check (evaluator):** confirm the registered wordmark face appears only in the
wordmark/logo lockup — not promoted to headings or body. Wordmark-in-lockup passes;
wordmark-as-heading is a finding.
