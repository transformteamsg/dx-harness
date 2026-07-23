# Design decision record — <page or change name>

> One record per page or significant change. Started at the Phase 3 plan gate (the
> approved plan is the fixed artifact the verify phase grades against), finished at
> Phase 6. Keeps the human approval, waivers, and verdict traceable.

- **Date:**
- **Product:** TW | CaseSync | Glow | TW surface (Posts / PG Staff Portal)
- **Change type:** new page | modification
- **Page type:** workspace view | form | flow step | dashboard | settings | empty state | onboarding
- **Run type:** attended | unattended (operator-proxy approvals)
- **The teacher and the moment:** (name the specific workflow this serves)

## Sprint contract (done-criteria)

1.
2.
3.

## Chosen approach

What was built, and the option chosen at diverge.

## Rejected options

- **Option B** — why not.
- **Option C** — why not.

## Tradeoffs, named

What this design sacrifices and why that's acceptable (TFX-DS principle 4: Name the
Tradeoff). A record without this section is incomplete.

## Controls in scope

List the catalog controls the changed surface pulls in (by id). Note: any surface
with an async or destructive action inherits the `applies_to: [flow]` controls
(CMP-2, CMP-3) even as a single page.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| | | | | inline `tfx-waive` / this record |

> L0 controls are never waivable. L1 waivers need a named human approver. L2 waivers
> need a specific, real reason.

## Plan approval

- **Approved by:**
- **Approved on:**

## Verify verdict

- **Screenshots:** (paths — width evidence at 360/768/1280, plus one frame per state
  asserted by each in-scope hybrid control, loading included)
- **REQUIRED when CMP-3 is in scope** (harness rule — see
  `docs/catalog-changes/evd-1-async-evidence.md`): the evidence listed above includes a
  loading-state frame, a success-state frame, and an error-state frame — not only the
  initial/empty state. Acceptable substitutes for any one frame: a video walkthrough
  covering all three states, or a named human reviewer's attestation that they witnessed
  the live render of all three. Note explicitly which of the three (frame / video /
  attestation) covers each state.
- **Token block line range:** (the `tfx-tokens` region exempt from token-audit, e.g.
  `attendance.html:12-68`)
- **Dark mode:** supported (dark frame captured at <path>) | N/A — product has no
  dark mode
- **Verification ledger** (one row per in-scope control):

  | Control | Method | Evidence |
  |---------|--------|----------|
  | A11Y-1  | manual | measured fg/bg with the picker — 5.1:1 at the smallest text |
  | TOK-1   | script | `checks/token-audit.py` clean |
  | A11Y-4  | unverified | needs computed layout — flag for a human |

  Method is one of `script` / `manual` / `unverified`. A `manual` row MUST name what was
  checked and how. A `script` row names the script/command. `unverified` says why.
- **Evaluator verdict:** paste the full `evaluator` verdict **verbatim** — a
  summary here is a defect; this record is the durable artifact.

## Ratchet

Any defect no control covered → the new control or anti-pattern proposed as a result,
marked `[proposed — pending design-lead approval]`. If nothing qualifies, record
"ratchet: no proposal — nothing uncovered" — a valid outcome, not a blank.
