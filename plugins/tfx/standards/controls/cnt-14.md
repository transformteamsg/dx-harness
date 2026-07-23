---
id: CNT-14
source: TFX-DS
title: Copy embodies the TFX voice (Clear, Thoughtful, Approachable) and its tone fits the surface context
tier: L2
check: judgment
phase: [implement, verify]
applies_to: [content]
verify: "Evaluator reads the copy against the voice attributes and the tone-by-context table in voice-tone.mdx: does it sound Clear/Thoughtful/Approachable (not cold, robotic, patronising, alarmist, or sappy), and does the tone match the surface (affirming success, calm error, sober destructive, inviting empty state)?"
waiver: rationale
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Copy **embodies the TFX voice** and **fits its surface's tone**. The voice is guided by
**Kind Utility** — useful at the core, human at the surface. It is constant across
products; the tone adapts to the moment.

**Voice attributes** — copy should sound:

- **Clear** — plainspoken and precise; the teacher understands what something means and
  what to do next. Not cold, not robotic.
- **Thoughtful** — respects the teacher's time, attention, and context; the right amount
  of guidance, no noise. Not wordy, not patronising.
- **Approachable** — puts the teacher at ease, especially in unfamiliar or stressful
  flows. Not corporate, not careless, not sappy.

Restated as the boundary the copy must hold (from the voice guideline's "we are / we are
not" table): clear but not cold; simple but not simplistic; thoughtful but not wordy;
helpful but not overbearing; approachable but not careless; reassuring but not sappy.

**Tone by context** — the tone adapts to the surface:

| Context | Tone | Direction |
| --- | --- | --- |
| Success | Affirming, brief | Acknowledge, don't gush |
| Error | Calm, helpful | What happened → what it means → what to do next |
| Onboarding | Encouraging | Lower the stakes; show the quick win |
| Destructive action | Sober, precise | Plain consequences, no drama (CMP-2) |
| Empty state | Inviting | Lead with the next action |
| Permission / data request | Transparent, respectful | Say what's collected, why, and how it's used — before asking |

Applies to all user-facing copy: instructions, helper text, error messages, empty
states, success states, confirmations, onboarding.

## Rationale

The mechanical slices of voice are already owned by other controls — person, active
voice, and sentence length (CNT-3), filler words (CNT-6), nominalisations (CNT-8),
sentence case (CNT-12), spelling (CNT-13), and AI-writing tells (SLP-9). But copy can
pass every one of those and still be *tonally wrong*: an error that reads as alarmist, a
success that gushes, an empty state that patronises, a destructive confirmation written
for drama. That failure is the **gestalt** — how the copy sounds and whether its tone
matches the moment — and no static signal decides it.

This control makes that gestalt control-backed, the same move SLP made for slop and
CNT-7 made for lead-with-purpose: a quality that was previously only a soft
design-quality grade becomes a named, waivable finding pointing at a written standard
(`content/guidelines/voice-tone.mdx`).

## Passes when

- A success toast acknowledges and stops: "Marks saved." — not "Amazing! You've
  successfully saved all your marks! 🎉".
- An error stays calm and points forward: "Sync failed. Check your connection and try
  again." — plain cause, clear next step, no alarm.
- A destructive confirmation states the consequence soberly: "Deleting this class
  removes its marks for everyone. This can't be undone." — plain, no drama (CMP-2 governs
  the undo/confirm behaviour).
- An empty state invites the next action: "No classes yet. Add your first class to get
  started." — inviting, not apologetic.

## Fails when

- An error message is alarmist or dramatic where calm would serve: "Critical failure!
  Your data may be lost!" instead of what happened and what to do next.
- A success message gushes instead of acknowledging briefly.
- An empty state or onboarding step talks down to the teacher or is careless about a
  stressful moment.
- A destructive confirmation leans on drama ("This is dangerous!") rather than plain,
  sober consequences.
- Copy is technically correct but cold, robotic, or corporate — it passes the mechanical
  controls yet none of the voice attributes come through.

## How to verify

Judgment only — there is no deterministic half. The mechanical voice controls
(CNT-3/6/8/12/13, SLP-9) carry the lintable slices; this control is the holistic read the
evaluator performs against the voice attributes and the tone-by-context table.

## Evaluator guidance

Name the surface's context (success, error, onboarding, destructive, empty state,
permission) in every finding, quote the copy, and give the on-voice rewrite so the call
is judged against a concrete alternative.

**Flag:**

- Copy whose tone is wrong for its context per the table above — an alarmist error, a
  gushing success, a patronising empty state, a dramatic destructive confirmation.
- Copy that reads as cold, robotic, corporate, or careless — none of Clear / Thoughtful /
  Approachable come through, even though it is grammatically and mechanically clean.
- Reassurance that tips into sappiness, or guidance that tips into overbearing hand-
  holding.

**Do not flag:**

- A mechanical failure already owned elsewhere — a passive construction (CNT-3), a filler
  word (CNT-6), a buzzword or AI tell (SLP-9), Title Case (CNT-12), a misspelling
  (CNT-13). CNT-14 owns the gestalt, not the specific token; do not double-flag.
- The **behaviour** of a destructive action — whether it shows consequences and offers
  undo/confirm is CMP-2. CNT-14 governs only whether the *wording* is sober vs dramatic.
- Copy where a raised or firm tone is doing real work: a genuine warning that *should* be
  firm, a data/permission request that must be direct. Tone-fit is context-relative, not
  "always gentle" — Kind Utility is useful first.
- Copy inside quoted or waived text, code spans, and tables — the same exemptions the
  other content controls honour.

## Waiver

`rationale` (L2) — inline `tfx-waive CNT-14 reason="..."` at the deviation site.
