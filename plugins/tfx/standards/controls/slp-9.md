---
id: SLP-9
source: TFX-DS
title: Copy carries no AI-writing tells — marketing buzzwords, em-dash chains, filler, or redundant label/helper pairs
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [content]
verify: "Lint for the buzzword, filler, and chatbot-artifact lists and em-dash chains; evaluator judges structural tells (negative parallelism, forced triads, copula avoidance, significance inflation), redundant label/helper pairs, and marketing tone"
waiver: rationale
fails_when:
  - streamline/empower/supercharge/world-class
  - label, sublabel, and helper saying the same thing
  - chatbot artifacts ("Great question!", "I hope this helps")
  - '"It''s not just X, it''s Y" / "serves as a" / forced triads doing rhetoric, not enumeration'
enforced: partial
script: checks/content-lint.py
refs:
  - https://github.com/transformteamsg/tfx-design-standard
---

## Requirement

Write copy that says what the thing does, once, in a human register. No marketing
buzzwords, no chains of em-dash clauses standing in for structure, no
label/sublabel/helper triplets that restate each other, and no AI-writing tells —
the structural patterns that make text read as generated. Applies to all prose the
harness produces or reviews: UI strings, site and marketing content, documentation,
decision records.

## Rationale

Buzzword copy is the written form of AI slop: it reads as generated, erodes
trust, and tells the teacher nothing. Kind Utility means the copy works —
"Save marks" beats "Effortlessly streamline your assessment workflow" every
time. The same applies to structure: negative parallelisms, forced triads, and
copula avoidance are statistical filler, not meaning. Redundant helper text is
not kindness; it is noise the teacher must scan past between classes.

Evidence for the 2026-06-12 broadening: a site-wide audit found em-dash chains
throughout the TFX-DS site's own prose (despite this control's ban), plus tells no
control covered — verbatim sentence duplication, rule-of-three padding, and
negative-parallelism density. See `docs/catalog-changes/slp-9-ai-writing-tells.md`.

## Passes when / Fails when

**Passes:**

- Button: "Save marks". Helper (only if needed): "Marks are saved as a draft
  until you submit."
- A field label that names the field; helper text that adds something the label
  cannot ("DD/MM/YYYY").
- "Centre optically, not mathematically." — an "X, not Y" that IS the rule.
- "Colour, type, spacing, icons." — a list of the actual four things.

**Fails:**

- "Empower your teaching with streamlined, world-class mark entry."
- "Supercharge productivity — effortlessly — seamlessly — at scale."
  (em-dash chain doing the work sentence structure should)
- Label "Class notes", sublabel "Notes for your class", helper "Add notes about
  your class here" — three lines, one meaning.
- "Glow serves as a testament to our commitment to empowering teachers."
  (copula avoidance + significance inflation + buzzword)
- "It's not just a gradebook, it's a teaching companion." (negative parallelism
  as rhetoric)
- "Plan lessons, track progress, and unlock insights." (forced triad; the third
  item is decoration)
- "Great question! Here's your class list. I hope this helps!" (chatbot
  artifacts shipped as UI copy)
- "This could potentially possibly affect some submissions." (hedging stack)
- "Marks sync automatically, ensuring a seamless experience." (superficial -ing
  tail asserting an unearned outcome)

## How to verify

**Deterministic half (lint):** case-insensitive scan of user-facing strings for:

- the buzzword list — <!-- tfx-sync:slp9-buzzwords source --> streamline(d), empower, supercharge, effortless(ly),
  seamless(ly), world-class, revolutionise, leverage, unlock, elevate <!-- /tfx-sync:slp9-buzzwords --> — plus the
  AI-vocabulary list: delve, robust, intricate, foster, vibrant, pivotal,
  testament, "landscape" as an abstract noun;
- the filler list — "in order to", "it is important to note", "at this point in
  time", "due to the fact that";
- the chatbot-artifact list — "great question", "i hope this helps", "let me
  know if", "certainly!", "you're absolutely right";
- two or more em dashes inside one sentence.

Each hit is a finding.

**Evaluator half:** structural tells need judgment — see below.

## Evaluator guidance

Quote the offending sentence in every finding. Do not paraphrase.

**Flag:**

- Negative parallelism used as rhetoric: "It's not just X, it's Y", "X isn't
  about Y, it's about Z" — and any screen or page where "X, not Y" appears more
  than once or twice.
- Copula avoidance: "serves as", "acts as", "functions as", "stands as" where
  "is" carries the meaning.
- Forced triads: three-item lists where an item is synonym padding or
  decoration, not a real third thing.
- Significance inflation and generic upbeat closers: "a major step forward",
  "exciting times ahead", claims of importance with no concrete referent.
- Hedging stacks: two or more qualifiers on one claim.
- Superficial -ing tails: a trailing participle clause asserting an outcome the
  sentence didn't earn ("…, ensuring/enabling/fostering …").
- In long-form prose, em-dash clustering: 2–3 per short paragraph is a finding
  even when no single sentence has two (density is the tell, not any one dash).
- Redundant label/sublabel/helper sets: if removing one line loses no
  information, flag the redundancy.

**Do not flag:**

- A genuine enumeration that happens to have three items ("Colour, type,
  spacing, icons" lists the actual foundations — count is not the tell,
  padding is).
- "X, not Y" when the contrast IS the rule being taught: "optically, not
  mathematically", "name by function, not metaphor", "fix the drawing, not the
  report".
- Single em dashes doing real work (one nested clause), and structural dashes
  in headings, table cells, and labels ("01 — Utility by Default").
- Settled product names and quoted ministry/programme text carrying a waiver
  (`tfx-waive SLP-9 reason="..."`).
- "Unlock" and kin used literally (a locked record, a locked term) — close
  calls are advisories, not blocks.

Judge overall register: copy should describe function in a teacher's vocabulary,
not sell, and prose should read as written, not generated. This is L2 — deviation
needs an inline rationale, not a rewrite war.
