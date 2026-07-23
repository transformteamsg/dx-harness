---
id: IDN-3
source: TFX-DS
title: Copy on a product's surface carries that product's calibrated tone register — same voice character, calibrated weight, never a switched voice system
tier: L2
check: judgment
phase: [implement, verify]
applies_to: [content]
verify: "Evaluator reads the surface's copy against the product's row in the per-product register table (controls/idn-3.md): does it hold the shared voice character at the product's calibrated weight, or switch systems?"
waiver: rationale
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Every product in the portfolio speaks with **one shared voice character** — the TFX
voice: plain, second person, active, kind. Products differ only in **weight**, not in
system. Copy on a product's surface carries that product's calibrated register; it must
not adopt another product's register (celebratory Glow warmth on a CaseSync case screen,
or CaseSync reserve on a Glow moment). This is the verbal twin of COL-1's per-product
colour rule — one control, a per-product table.

## Per-product tone register

| Surface | Register | Calibration |
|---|---|---|
| Teacher Workspace | Calm daily command centre | Neutral, steady, quietly confident |
| CaseSync | Higher gravity | More reserved, restrained celebration, privacy-forward (sensitive casework) |
| Glow | Lighter, encouraging | Warmer accents, more celebratory moments |
| TW surfaces (Posts / PG Staff Portal) | Pure TW | No nuance — plain Teacher Workspace voice |

Source of truth for this table is this file; the `copy` skill's per-product tone section
points here rather than restating it (per `docs/SYNC.md`). If the two drift in practice,
add a `tfx-sync:idn-register` block and a parity sub-check in `validate.py` — deferred for
v1, pointer suffices.

## Rationale

Voice is identity. A teacher recognises a product partly by how it talks to them; a page
that switches register reads as if a different team wrote it, and on CaseSync a bubbly
register is not just off-brand but tonally wrong for sensitive casework. The shared
character keeps the portfolio coherent; the calibrated weight keeps each product itself.
This is not CNT-2/CNT-3 (plain-language naming, lead-with-purpose) — those are the voice
*mechanics*, the same everywhere; this is the per-product *weighting* of that one voice.

## How to verify

**Judgment.** The evaluator reads the surface's copy against the product's row above.
Does it hold the shared character at that product's weight, or has it switched systems?
The failure is a *switched register*, not a shared voice — flag Glow-style celebration on
a CaseSync surface, CaseSync-style reserve on a Glow moment, or product nuance on a
Posts / PG Staff Portal surface that should read as plain TW.

## Evaluator guidance

**Flag:** copy that adopts another product's register (a switched voice system); a
TW-adjacent surface carrying nuance instead of plain TW voice.

**Do not flag:** a product using the shared voice character (that is correct, not a
finding); calibrated weight within the shared system; a deliberate, reasoned deviation
carrying an inline `tfx-waive IDN-3 reason="…"` (L2).

**Deconfliction.** COL-1 is the per-product *colour* register; this is the per-product
*tone* register — orthogonal (a surface can pass one and fail the other). CNT-2/CNT-3 are
portfolio-wide voice mechanics this control depends on, not restates. The CaseSync row
here is the calm parent register; IDN-4 hardens CaseSync's sensitivity into a concrete
prohibition on gamified/celebratory *elements* (not just copy) — this control covers the
words, IDN-4 covers the interface treatment.
