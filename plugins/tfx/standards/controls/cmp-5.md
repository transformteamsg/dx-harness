---
id: CMP-5
source: TFX-DS
title: Each view has at most one primary (filled) action; secondary and tertiary actions step down to outline, ghost, or link styling
tier: L2
check: hybrid
phase: [plan, implement, verify]
applies_to: [page, component]
verify: "Script counts filled/primary-variant buttons per view; evaluator judges view/region boundaries and any deliberately co-equal actions"
waiver: rationale
fails_when:
  - two or more filled/primary buttons competing in one view with no deliberate co-equal reason
  - a destructive action styled as the primary instead of a distinct destructive variant (CMP-2)
  - every button rendered at the same weight, so nothing reads as the main action
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Give each view one clear primary action, rendered as the single filled/solid button,
and step every other action down a level: secondary actions take an outline or tonal
button, tertiary actions a ghost or link. A region with its own task (a card that is a
unit of work, a toolbar, a dialog) may carry its own one primary. Destructive actions
are never the primary — they take a distinct destructive variant and the CMP-2
consequence + undo/confirm treatment.

This control governs **how many** primaries and their **weight hierarchy**; COL-1
governs the primary's **colour** (the product's own brand primary). They are
complementary, not duplicative.

## Rationale

The primary button answers "what does this view want me to do next?" When two or three
buttons all shout, that answer disappears and the teacher has to stop and choose —
exactly the decision load Kind Utility exists to remove (Hick's law: fewer competing
choices, faster action). One filled button against quieter siblings is the cheapest,
most reliable way to make the main path obvious without a word of instruction. It also
protects safety: a delete styled identically to "Save" invites the misclick CMP-2
is meant to prevent.

## Passes when

- A form with **"Save"** as the one filled button and **"Cancel"** as a ghost/outline.
- An empty state with a single filled CTA ("Add a note") and no competing button.
- A toolbar where the main action is filled and the rest are icon/ghost buttons.
- A page with two genuinely co-equal actions (e.g. "Approve" / "Reject" on a review
  queue) rendered as two deliberate, balanced buttons — recorded as the co-equal
  exception, not an accident.
- A destructive action ("Delete class") rendered in the destructive variant, visually
  distinct from the view's primary, with CMP-2 confirm/undo.

## Fails when

- Two filled brand-colour buttons side by side with no co-equal rationale, so neither
  reads as the main action.
- A "Save" and a "Save and add another" both filled — one should step down.
- Every button on the surface at the same weight (all filled, or all ghost), so
  hierarchy is flat and nothing leads.
- "Delete" styled as the filled primary.

## How to verify

**Deterministic half** (`checks/` — planned): count filled/primary-variant buttons
within a view's DOM subtree (e.g. `<Button variant="default">` / the product's solid
button class). More than one in a single view is a flag pending the judgment read.
Until the script exists, count by hand against the rendered output and label it
"verified manually".

**Judgment half:** the evaluator sets the view/region boundaries (a dialog or a
self-contained card is its own region and may have its own primary) and judges whether
multiple primaries are a deliberate co-equal pair or an accident.

## Evaluator guidance

**Flag:** a view (or region) with more than one filled/primary button where the
actions are not genuinely co-equal; a destructive action wearing the primary style; a
surface where every button is the same weight.

**Do not flag:**

- One primary per **distinct region** — a page primary plus a different primary inside
  a self-contained dialog or work-unit card is correct, not a violation.
- A deliberate co-equal pair (Approve/Reject, Accept/Decline) where the task genuinely
  has two balanced outcomes — provided it reads as intentional.

This is L2: a reasoned deviation (the co-equal pair above, a platform pattern) takes an
inline `tfx-waive CMP-5 reason="…"`. "Both felt important" is not a reason — decide
which one leads.
