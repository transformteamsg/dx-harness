# IDN-4 removed: CaseSync celebration restraint moves to DESIGN.md

Date: 2026-08-14. Approved: harness lead (Reza Ilmi, in-session).

## What changed

Control IDN-4 ("CaseSync surfaces treat casework as sensitive", L1, judgment,
`products: [casesync]`) left the catalogue. It was the first and only product-scoped
control. Its constraint moves to the CaseSync repo's DESIGN.md as a guardrail.

## Why

The catalogue's own authoring rule 5 (`standards/README.md`): one catalogue for the whole
portfolio — no per-product control overlays; per-product difference is nuance
calibration or a standing override declared in that product's DESIGN.md. IDN-4 broke
that rule. Guardrails in DESIGN.md are the stated home for product-specific
instructions no portfolio control covers.

The per-control `products:` scope field in `catalog.yaml` now has **zero users**. The
field stays in the schema for now; removing it is a schema change that touches the
website, and no decision on that has been made.

## What must happen in the CaseSync repo

The constraint exists nowhere until CaseSync's DESIGN.md gains it. Paste this into
that file's Guardrails section:

> **Casework is sensitive — restrained celebration only.** No confetti or celebration
> animations, no streak/badge/points/leaderboard gamification, and no exclamatory
> congratulatory copy around case outcomes. Acknowledge a completed case action calmly,
> neutrally, and privacy-forward ("Case updated" — never "🎉 Great job!"). Restraint is
> the target, not the absence of feedback: a calm success toast is correct; a
> celebration is not. This governs elements (motion, gamification patterns), not just
> the words — the words are IDN-3's CaseSync row. Deviation needs a named human's
> documented approval.

## Where the old text pointed

- Full former control text: `standards/controls/idn-4.md`, in this repo's history at any
  commit before the one that removed it.
- IDN-3's detail file keeps the tone half and now points at the guardrail for the
  element half.
- The design reviewer checks CaseSync DESIGN.md guardrails where it used to grade IDN-4.
