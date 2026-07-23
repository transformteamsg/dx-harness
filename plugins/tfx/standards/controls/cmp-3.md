---
id: CMP-3
source: TFX-DS
title: Every async transaction has visible loading, success, and error states
tier: L1
check: hybrid
phase: [plan, implement, verify]
applies_to: [flow]
verify: "Script confirms the three states exist per async action; evaluator judges each state communicates clearly"
waiver: documented
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Every async transaction — any action that triggers a network request or a
non-instant local operation — must have three visible states: loading, success, and
error. All three must be reachable by the user and by automated checks.

## Rationale

Teachers submit marks, notes, and attendance data mid-class. Ambiguity about whether
an action succeeded — "did that save?" — is a trust failure. Kind Utility demands
that every action is perceivable: the interface confirms the outcome so the teacher
can move on with confidence. Missing states are also the source of silent data loss:
an unhandled error state often means the user retries blindly or walks away thinking
the save succeeded.

## Passes when

- Every async action has a loading state that indicates what is happening.
- Every async action has a success state that is perceivable by the user.
- Every async action has an error state that communicates clearly (graded under CNT-1).
- All three states are reachable — either through normal use or via the script's
  state enumeration.

## Fails when

- Any of the three states is absent (no loading indicator, silent success, swallowed
  error).
- The loading state exists but does not indicate *what* is happening (e.g. a bare
  spinner covering the full page for a single-row save).
- The success state is present but imperceptible (e.g. a toast that appears
  off-screen or disappears before the user can read it).
- The error state shows a raw code or a generic message — graded under CNT-1.

## How to verify

Deterministic half — `checks/async-states` (planned): enumerate async actions in the
changed surface; assert all three states exist and are reachable in code. Judgment
half — the evaluator assesses whether each state *communicates clearly*, as described
below.

## Evaluator guidance

**Loading states** — Flag when:

- A bare spinner appears in a full-page overlay for a row-level or component-level
  action. The indicator must be scoped and contextual: a row-level save gets a
  row-level spinner, not a page takeover.
- The loading state provides no indication of *what* is happening. "Loading…" is
  acceptable for a page load; it is not acceptable for a form submission — prefer
  "Saving attendance…" or equivalent.

**Success states** — Flag when:

- Success is entirely invisible — no feedback of any kind.
- An interrupting success modal or blocking alert is used for a routine, non-blocking
  outcome. Reserve interruptions (toasts that demand acknowledgement, modals) for
  moments where the consequence matters and the user needs to act. Quiet feedback
  (inline tick, transient toast) is correct for routine saves.

**Error states** — Error copy anatomy is graded under **CNT-1** (what happened → what
it means → what to do next). Do not restate CNT-1's rubric here; cross-reference
`controls/cnt-1.md` and apply it. The CMP-3 judgment covers *state existence and
proportionality*, not copy grammar — CNT-1 covers copy.

**Do not flag**:

- Instant (< ~100 ms) local operations with no perceivable pending period. A client-
  side toggle that resolves synchronously does not need a loading state.
- Optimistic updates that revert on failure, provided the revert and error message are
  visible when failure occurs.

## Waiver

`documented` (L1) — unusual interaction patterns (e.g. a real-time collaborative
surface where conventional loading states conflict with the live-update model) may
be waived with a named approver and a stated alternative. Inline:
`<!-- tfx-waive CMP-3 approver="..." reason="..." -->`.
