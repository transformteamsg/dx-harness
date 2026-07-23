---
id: CNT-7
source: TFX-DS
title: Descriptive copy leads with its purpose — what it does for the teacher and when to reach for it — before the mechanism
tier: L2
check: judgment
phase: [implement, verify]
applies_to: [content]
verify: "Evaluator reads the first line of titles, descriptions, section intros, empty states, and feature blurbs: purpose or role first, mechanism after"
waiver: rationale
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Descriptive copy **leads with its purpose** — what it does for the teacher and when
to reach for it — before the mechanism. State the *why* first; the *what* (the tool,
token, or library) follows, or lives in the body. A reader should know why a thing
exists, and when they would need it, from its first line.

This binds hardest on descriptive prose: page titles, descriptions, section intros,
empty states, and feature blurbs — the surfaces where it is easy to state the *what*
and skip the *why*. Instructional copy and running body prose are governed by CNT-3
(voice mechanics), not this control.

## Rationale

Teachers scan descriptive copy to decide whether a thing is for them. A description
that opens with the mechanism ("shadcn/ui default token scales, unmodified") makes
the reader do the translation from implementation to value; purpose-first copy does
that work for them.

Split out of CNT-3 on 2026-07-03, during the HDB writing-guide port: the purpose
clause is pure judgment while CNT-3's other clauses (person, voice, sentence length)
are mechanical, and the bundle kept straddling guideline sections — the mechanics
under "Concise"/"Conversational", this clause under "Clarity". One ID for both made
findings ambiguous and meant a waiver on sentence length could silently cover a
purpose failure. One control, one verifiable failure mode.

## Passes when

- A description or intro opens with its purpose: "Consistent spacing is what makes a
  screen feel calm instead of busy. One shared scale." — the mechanism (the token
  scale) comes second.
- An empty state opens with what the teacher can do next, not with the name of the
  feature that is empty.
- A feature blurb's first line answers "why would I use this?".

## Fails when

- A title, description, or intro opens with the mechanism (the tool, token, or
  library) instead of what it does for the teacher: "shadcn/ui default token scales,
  unmodified" as a section's first line.
- A page description that only names the page's parts, with no line about who it
  serves or when to reach for it.

## How to verify

Judgment only — there is no deterministic half. The evaluator reads the first line
of each title, description, section intro, empty state, and feature blurb in scope
and asks: does this state the purpose or role before the mechanism?

## Evaluator guidance

Quote the offending first line in every finding, and give the purpose-first rewrite.

**Flag:**

- Mechanism-first descriptive copy: a title, description, or section intro whose
  first clause names the tool, token, library, or data structure instead of the
  purpose or role it serves.
- A description that is only a scope list ("Labels, buttons, helper text") with no
  purpose line anywhere.

**Do not flag:**

- Mechanism named first when the mechanism *is* the point: a spec table, an API
  reference, or a row whose job is to state a value ("Radius: 8px"). This control
  governs prose that introduces or explains, not reference data.
- Body prose that explains the mechanism *after* the purpose has been stated — the
  control binds on the first line, not the whole passage.
- Settled product names (Teacher Workspace, CaseSync, Glow) opening a line — an
  identity is not a mechanism.

## Waiver

`rationale` (L2) — inline `tfx-waive CNT-7 reason="..."` at the deviation site.
