# Ratchet decision — error content reaching only one perception channel

- **Kind:** admit/reject decision on a ratchet candidate
  ([#123](https://github.com/transformteamsg/dx-harness/issues/123), candidate 5)
- **Decision:** **admitted** — a control will be drafted. Approval per
  `procedures/rule-proposal.md` lands with the merge of the PR carrying this
  record; the draft control ships separately as `status: proposed`.
- **Origin (evidence, not speculation):** in the first end-to-end run's test
  build, the error state's recovery sentence rendered only inside an `sr-only`
  span — assistive-technology users received it and sighted users did not.

## The gap

A11Y-11 names the mirror case (a state change visible on screen but silent to
assistive technology) and requires one announcement channel per state. Nothing in
the catalog names the inverse: actionable content that reaches *only* the
assistive-technology channel (or only the visual channel) when the state itself
concerns every user. The trial surface passed every in-scope A11Y control while
half its users could not see how to recover from the error.

## Shape of the control to draft

- One statement: actionable state content (what happened / what to do next) must
  be perceivable through both the visual and the programmatic channel — `sr-only`
  is for *supplementary* context, never for the only copy of a recovery action.
- Tier L1, `check: hybrid` (a static scan can flag recovery verbs inside
  `sr-only`; judgment grades whether the visible state carries equivalent
  content), `phase: [implement, verify]`, `applies_to: [component, page]`.
- Sits beside A11Y-11 as its inverse; the pair should cross-reference.

## Re-audit set

The trial surface from the first end-to-end run (see the efficacy report
referenced in [#38](https://github.com/transformteamsg/dx-harness/issues/38)).
No other shipped surface is known to hit this; the re-audit list grows if the
draft control's static scan finds more.
