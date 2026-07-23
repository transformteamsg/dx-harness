---
id: CNT-10
source: TFX-DS
title: One term per thing within a product — the same action, object, or state keeps a single name everywhere it appears in the interface
tier: L1
check: judgment
phase: [implement, verify]
applies_to: [content]
verify: "Evaluator reviews the product's surfaces for term drift — the same action, object, or state named two ways anywhere it appears (nav, buttons, labels, filters, dialogs, messages, tooltips, empty states, help text). The listed surfaces are examples, not the scope; the whole interface is in scope."
waiver: documented
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Use one term for one thing, everywhere it appears in the product. The same action,
object, or state must carry a single name across the **whole interface** — not "Edit"
on one screen, "Amend" on another, and "Modify" in a dialog. The scope is every
surface: navigation, buttons, labels, filters, dialog titles, messages, tooltips,
empty states, toasts, confirmations, and help text. Any list of surfaces in this
control is illustrative; drift anywhere in the interface is a finding.

This applies to user-facing terminology — the words that name what a teacher acts on
and what they do. It does not police prose style; it polices term drift.

## Rationale

Switching terms mid-product makes a teacher stop and wonder whether two words mean two
things. "Amend" and "Edit" for the same action force a re-read and a moment of doubt at
exactly the point where the product should be invisible. One term per thing removes
that friction, so consistency is mandatory, not a preference — a single drifted button
label undermines trust as surely as a drifted body sentence. Because the confusion is
inside one product's own vocabulary, this is L1: fixable, checkable, and worth blocking
on.

See also: CNT-2 grades whether a single name is plain language (no portmanteaus or
codenames); this control grades whether *one* name is used consistently. A product can
pass CNT-2 — every name is plain — and still fail CNT-10 by naming the same action two
ways. CNT-11 is the outward-facing sibling: CNT-10 is consistency *within* a product,
CNT-11 is agreement *with* the established terms teachers meet elsewhere.

## Passes when

- The same action reads "Edit" in the row menu, the toolbar button, and the
  confirmation toast.
- A "Draft" status is called "Draft" in the filter, the badge, and the empty-state
  message — never "Unsent" in one and "Draft" in another.
- The object a teacher works on is "student note" in the nav, the page title, the
  button, and the help text.

## Fails when

- The same action is named two or more ways anywhere in the product: "Edit" on one
  screen, "Amend" on another, "Modify" in a dialog.
- A term drifts between any two surfaces for the same thing — a button labelled
  "Delete" whose confirmation says "Remove"; a nav item "Reports" whose page title
  reads "Analytics"; a filter "Archived" whose help text says "Closed".
- A status, object, or state is renamed across screens without the underlying thing
  changing.

## How to verify

Judgment only. The evaluator collects the user-facing terms across the product's
surfaces — the whole interface, not a fixed subset — and looks for the same underlying
thing named more than one way. Nav, buttons, labels, filters, dialog titles, messages,
tooltips, empty states, and help text are all in scope; the surface list is a prompt,
not a boundary. For each drift, name the two (or more) terms, the surfaces they appear
on, and the single term that should win.

## Evaluator guidance

Quote both competing terms and both surfaces in every finding, and name the term that
should stand.

**Flag:**

- One action, object, or state carrying two names anywhere in the interface.
- A button/confirmation, nav/page-title, or filter/help-text pair that disagrees on the
  term for the same thing.

**Do not flag:**

- Two genuinely different things that happen to sound similar ("Save" a draft vs
  "Submit" for approval are distinct actions, not a drift).
- An established term teachers genuinely use even when it looks like jargon (e.g.
  "CCE", "Form Class") — provided it is used consistently.
- Product or programme identities that must appear verbatim and carry a documented
  waiver.

## Waiver

`documented` (L1) — a retained inconsistency needs a named human approver and the
reason recorded in the decision record and waiver registry (e.g. a ministry-mandated
term that must appear verbatim on one surface). An inline `tfx-waive CNT-10
reason="..."` alone is not sufficient at L1.
