# EVD-1 — async-state evidence gate (harness rule)

- **Kind:** harness rule — binds the design loop's verify phase and the decision
  record. Not a catalog control: it governs *evidence about* CMP-3's states, not
  the states themselves, so it carries no tier and cannot be waived through the
  catalog's waiver syntax.
- **Status:** settled
- **Origin:** both pilot runs shipped a loading state that existed in code but was
  never photographed — the build claimed all three CMP-3 states while only the
  initial/empty state was ever captured. Code-level reachability is not
  perceptibility.
- **Consumers:** `skills/design/dx-design-execute/verify.md` (state-evidence
  bullet), `docs/decisions/TEMPLATE.md` (verify-verdict section),
  `agents/dx-design-review.md` (evidence the reviewer may demand).

## The rule

When **CMP-3 is in scope** (the changed surface has any async transaction), the
verify-phase evidence set MUST cover each of the three CMP-3 states — loading,
success, and error — with one of these outcomes per state, recorded explicitly in
the decision record:

1. **Frame** — a screenshot of the state as rendered, captured per the verify
   procedure's capture conventions (real viewport, demo-only hooks where needed).
2. **Video** — a walkthrough that demonstrably passes through the state.
3. **Attestation** — a named human reviewer's statement that they witnessed the
   live render of the state.
4. **State does not exist** — an explicit `N/A — state does not exist: <reason>`
   entry, permitted **only** when CMP-3's own "Do not flag" clause applies to the
   action (an instant, < ~100 ms local operation with no perceivable pending
   period has no loading state to photograph). This is a truthful outcome, never
   a pass: it records a fact about the surface, exactly as the dark-mode
   `N/A — product has no dark mode` outcome does. If the action later becomes
   async (a network call is added), the outcome is stale and the record must be
   re-run.

A state covered by none of the four outcomes blocks the verify phase. Faking a
frame, substituting the empty state, or silently skipping the state are all
defects; `checks/audit-record.py` audits the record's evidence listing.

## Why outcome 4 exists

EVD-1 as first shipped demanded a loading frame whenever CMP-3 was in scope, while
CMP-3's "Do not flag" clause exempts instant local operations from having a
loading state at all. A correct build of such a surface could satisfy neither: no
loading state exists to photograph, and the gate offered no outcome for that
(found by the first end-to-end run,
[#123](https://github.com/transformteamsg/dx-harness/issues/123)). Outcome 4
closes the contradiction without weakening the gate for genuinely async actions.
