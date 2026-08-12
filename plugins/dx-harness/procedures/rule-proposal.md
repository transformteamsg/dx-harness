# Rule proposal (shared procedure)

The catalogue grows only from evidence: a defect no control caught, a recurring
waiver, or a standard update. Never from speculation.

## How the catalogue grows

- Propose a new control as a draft detail file in `../standards/controls/`, per the
  format and authoring rules in `../standards/README.md`.
- Name the **re-audit set**: which shipped surfaces the new control affects. Those
  surfaces are silently non-compliant until re-run through the design loop (a
  catalogue-update re-audit: the "change" is the catalogue delta, the scoped plan is
  the audit findings against the new controls only).
- **You propose; the design lead approves** by lightweight PR. The bar for L0/L1 is
  high; the bar for L2 is evidence.
- Never silently ignore a control, and never edit the catalogue to make a failing
  check pass. A control that seems wrong follows the escalation in
  `catalogue-mechanics.md` (beside this file), not a quiet local fix.

## When to propose

At the end of a run, after the person accepts the result: any failure the design
review or the person caught that no control covered becomes a rule proposal.
Record it in the decision record as a proposed control or anti-pattern entry,
marked pending design-lead approval.

## Routing note

**Harness friction is a feedback issue, not a rule proposal.** A confusing gate, a
missing or unbuilt check, a process or onboarding nit: none of these is a control
gap. File those as a GitHub issue via the feedback skill
(`docs/harness-feedback.md` in the harness repo is the spec). A rule proposal is
only for a gap in what the catalogue can check.
