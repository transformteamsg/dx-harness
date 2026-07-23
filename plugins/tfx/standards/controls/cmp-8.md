---
id: CMP-8
source: TFX-DS
title: A multi-step or data-entry task offers a non-destructive exit at every step, and in-progress work is preserved or explicitly discarded on interruption — never silently lost
tier: L1
check: hybrid
phase: [plan, implement, verify]
applies_to: [flow]
verify: "Deterministic: every step in a mapped flow has a reachable cancel/back affordance (planned, manual until a script exists). Judgment: evaluator walks the flow map, interrupts it, and confirms in-progress work survives the interruption or is explicitly, confirmably discarded — never silently lost"
waiver: documented
fails_when:
  - a wizard/dialog with no cancel/back at some step
  - navigation away silently drops typed content
  - an interrupted flow resumes from zero with no warning at exit time
  - escape/close discards a draft with no confirm (ties to CMP-2's mechanics)
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Every multi-step or data-entry task offers a non-destructive way to leave at each step
— a visible cancel or back, not a discovered one — and the teacher's in-progress work
is never silently lost. On interruption (a timeout, a network loss, an accidental
navigation, a browser back), the work is either preserved and resumable, or explicitly
discarded with a confirmation the teacher chose. "The draft is gone and nobody said so"
is always a fail, regardless of whether the loss was technically avoidable.

## Rationale

The harness's own `flow` pass advertises grading "escapability, and draft safety"
(`.claude/skills/flow/SKILL.md:3`), yet its dimension-controls list named only CMP-2
(destructive-action consequence/undo), CMP-3 (async states), A11Y-2, A11Y-11, and
SLP-10 — none of which governs draft preservation or a non-destructive exit per step.
This is a harness-internal audit finding: a pass claiming to grade a dimension the
catalog did not cover. Corroborating evidence: the Student Notes evaluator observed the
code preserves the draft on save-error (an ADVISORY finding riding entirely on CNT-1
copy, with no control cited for the structural preservation itself), and the golden
eval `evals/golden/003-broadcast-message.yaml` plants "draft is (saved|preserved)" copy
expectations while the structural guarantee behind that copy was ungoverned. CMP-8
names the structural guarantee so it is graded directly, not inferred from copy.

## Passes when

- Every step of a mapped flow has a reachable, visible cancel or back affordance.
- On interruption (timeout, network loss, accidental navigation), in-progress input is
  preserved and the teacher can resume where they left off, or is told plainly what
  happened to it.
- A discard action exists as an explicit, confirmable choice — never a silent side
  effect of navigating away.

## Fails when

- A wizard or dialog has no cancel/back at some step.
- Navigating away silently drops typed content with no warning.
- An interrupted flow resumes from zero with no notice that earlier input is gone.
- Escape or close discards a draft with no confirmation (the confirmation mechanics
  themselves are CMP-2's; see Deconfliction below).

## Deconfliction with CMP-2, A11Y-11, and SLP-10

CMP-8 sits close to three existing controls. Each keeps a distinct, non-overlapping
clause:

- **CMP-2 (destructive actions, L0)** keeps the *destructive-action* consequence/undo
  clause — deleting a thing, sending something irreversible. CMP-8 covers *the user's
  in-progress work* (drafts, wizard state) and *the ability to leave a flow at all*.
  The two meet at one seam: an explicit-discard confirmation ("Discard draft?") is
  **CMP-8's surface** — it is the thing CMP-8 requires exist — but its confirm
  mechanics (naming the object, stating the consequence, sober tone) **follow CMP-2**.
  Grade CMP-8 for whether a non-silent discard path exists; grade CMP-2 for whether
  that path's confirmation is built correctly.
- **A11Y-11 (transition focus/announcement)** keeps focus movement and live-region
  announcement per transition. CMP-8 does not grade *how* an exit is announced — only
  that an exit and a preservation/discard behaviour *exist* structurally.
- **SLP-10 (page vs. modal)** keeps the structural-container question — does a complex
  multi-section task get a page, not a modal. CMP-8 does not grade container choice; a
  page-based flow and a modal-based flow are equally in scope for "can the teacher
  leave without losing work."

## Evaluator guidance

Two halves, one hybrid check:

1. **Deterministic sub-check** (manual until a script exists): for each step in the
   flow map, confirm a cancel/back affordance is reachable and visible, not only
   discoverable via an unlabelled gesture.
2. **Judgment sub-check**: walk the flow, interrupt it at a plausible point
   (mid-step navigation away, a simulated timeout or network loss), and confirm the
   teacher's input is either still there on return, or the teacher was told plainly
   what happened to it. Quote the specific step and the observed behaviour.

When grading an explicit discard action, confirm it is CMP-8-in-scope (the option to
discard exists and is not a silent side effect) and separately confirm its
confirmation copy against CMP-2 (names the object, states the consequence). Do not
double-count the same finding under both controls — cite whichever clause the specific
defect actually violates.

## Do not flag

- A single-step, non-destructive form with an obvious cancel — CMP-8 targets
  *multi-step or data-entry* tasks specifically, not every form.
- An explicit, confirmed discard the teacher chose — CMP-8 requires the *option* to
  preserve or explicitly discard, not that discarding is always wrong.
- A flow whose deterministic per-step cancel/back check has not been run mechanically
  yet — say "verified manually" and name what you checked, per the planned-script
  precedent CMP-4/CMP-7 set.
