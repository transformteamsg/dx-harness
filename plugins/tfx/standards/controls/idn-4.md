---
id: IDN-4
source: TFX-DS
title: "CaseSync surfaces treat casework as sensitive: restrained celebration, no gamified or playful elements around case data"
tier: L1
check: judgment
phase: [implement, verify]
applies_to: [content, page, component]
products: [casesync]
verify: "On CaseSync surfaces, the evaluator confirms case-data moments are treated with restraint — no confetti/celebration animations, streak/badge/points gamification, or exclamatory congratulatory copy around case outcomes; acknowledgement is calm and privacy-forward"
waiver: documented
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

CaseSync handles sensitive student casework. Its surfaces treat case data with restraint:
**no confetti or celebration animations, no streak/badge/points/leaderboard gamification,
and no exclamatory congratulatory copy around case outcomes.** Acknowledgement of a
completed case action is calm, neutral, and privacy-forward. This is the interface-level
hardening of CaseSync's tone row in IDN-3 — it governs not just the words but the *elements*
(motion, gamification patterns) around case data.

This is the portfolio's **first product-scoped control** (`products: [casesync]`). Scoping
is opt-in and used only where a control genuinely binds one product; CaseSync's sensitivity
is exactly that case — the privacy stakes are CaseSync-specific and concrete, not mere tone
weight. Every future scoped control follows the bar set here.

## Rationale

Casework is not an achievement to celebrate; treating a case closure like a game level
completed is tonally wrong and erodes the trust CaseSync depends on. Gamification patterns
that are appropriate encouragement in Glow become disrespectful around a student's case
record. Elevated to L1 (a firm must, not a strong default) because the stakes are privacy
and dignity, not preference — a deviation needs a named human's documented waiver, never a
silent call.

## Passes when

- A case action completes with a calm, neutral confirmation ("Case updated").
- Progress through casework is shown without streaks, badges, points, or leaderboards.
- Sensitive outcomes are acknowledged with restraint, privacy-forward.

## Fails when

- Celebratory or confetti-style motion fires on a case-closure or case-outcome moment.
- Streak / badge / points / leaderboard gamification is attached to casework.
- Exclamatory congratulatory copy ("🎉 Great job!") lands on a sensitive case outcome.

## How to verify

**Judgment.** On CaseSync surfaces, the evaluator confirms case-data moments are treated
with restraint across copy, motion, and interface pattern. This is scoped: it applies only
where the active product is CaseSync (Phase 1 records the product). On TW or Glow surfaces
it does not apply.

## Evaluator guidance

**Flag:** confetti/celebration animation on case closure; streak/badge/points gamification
on casework; exclamatory congratulations on a sensitive outcome.

**Do not flag:** a calm, neutral confirmation that a case action completed; a restrained
acknowledgement. Restraint is the target — not the absence of all feedback. A calm success
toast is correct; a celebration is not.

**Deconfliction.** IDN-3 (per-product tone) covers CaseSync's *copy* register; this control
adds the *element*-level prohibition (motion, gamification patterns) that IDN-3's
`[content]` scope cannot hold — kept as its own control for that reason. MOT-1 bans
decorative motion on critical paths portfolio-wide; this control's "no celebratory motion"
is CaseSync-scoped and broader (copy + playful UI patterns), so it complements MOT-1 rather
than duplicating it.
