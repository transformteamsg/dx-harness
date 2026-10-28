---
name: dx-design-copy
description: 'Use when the ask names the copy of an existing product surface but not the exact wording: user-facing text on a page, form, notification, or empty or error state, naming, error-message anatomy, or tone, with anti-AI-writing rules (SLP-9) applied. Propose-only: records up to five ranked findings on the surface''s design ticket for dx-design-execute to build. NOT for a stated wording edit, a whole-page review, or prose outside the product such as marketing or documentation.'
---

# Copy for Teacher & School products

**When the ask belongs to another skill:**

- A review of the whole page with no dimension named goes to `dx-design-critique`.
- Prose outside the product surface, such as site content, marketing, or documentation, is out of scope.

**Improve-the-copy pass.** For a scoped "improve / polish the copy on `<page>`" run,
follow `../dx-design-critique/pass.md` with this skill's dimension subset, in either entry
mode (called directly, or dispatched by the orchestrator with the `return-to-caller`
token; pass.md defines both and what the token suppresses). The pass judges a capture
of the surface for the wording only, and records up to five ranked findings on the
surface's design ticket; it proposes only and never edits the product. A stated
exact edit ("change the label to Save") is a dx-design-execute intent, not a pass
run. The dimension subset: **CNT-1, CNT-2, CNT-3,
CNT-4, CNT-5, CNT-6, CNT-7, CNT-8, CNT-9, CNT-10, CNT-11, CNT-12, CNT-13, CNT-14,
SLP-9, and IDN-3 (IDN-4 on CaseSync surfaces)**. Before you judge the copy,
read the writing rules in `../../../procedures/copy-rules.md`: they say what
"on-voice" means. The rest of this file is the review method. Catalogue mechanics (filtering, tiers, plain-title naming):
`../../../procedures/catalogue-mechanics.md`. Findings are recorded per
`../../../procedures/design-tickets.md`; accepted findings go to dx-design-execute,
which owns plan approval, implement, design review, and verify
(`../../../procedures/plan-approval.md`, `../../../procedures/implement.md`,
`../../../procedures/design-review.md`) and reads the writing rules at implement so
generated copy arrives on-voice. Uncovered gaps become rule proposals per
`../../../procedures/rule-proposal.md`.

## The editing sequence (method, not a control)

No step is a control, and none fails a check. Draft first, then edit in passes:

<!-- dx-sync:uitext-sequence source -->
1. **Draft.** Write what you want to say to the teacher. Don't polish yet.
2. **Purposeful.** Keep only words that serve the teacher's goal or the product's.
   Lead with the most important idea (CNT-7, lead with purpose).
3. **Concise.** Front-load the point; cut filler and empty openers (SLP-9). One idea
   per sentence, well under the 25-word ceiling (CNT-3).
4. **Conversational.** Second person, active voice; read it aloud (CNT-3). Name the
   action, not the device (CNT-5).
5. **Clear.** Simple words, simple present tense; no double negatives or noun
   stacks; every acronym defined on the surface (CNT-9).
<!-- /dx-sync:uitext-sequence -->
6. **Check.** One term per thing (CNT-10) using the word teachers already know
   (CNT-11), clear names (CNT-2), sentence case (CNT-12), Singapore English
   spelling and a proofread (CNT-13), plain error anatomy (CNT-1), and a last
   pass for AI-writing tells (SLP-9).

## Per-product tone

Judge the copy against the product's row in the
[IDN-3 tone register](../../../standards/controls/idn-3.md). On a CaseSync surface,
IDN-4 applies too.

## What to do on conflict

Mandated programme names and legally vetted text win over style rules — record a
waiver (`dx-waive CNT-2 reason="..."` inline, or in the decision record for
non-markup content) rather than rewording.
