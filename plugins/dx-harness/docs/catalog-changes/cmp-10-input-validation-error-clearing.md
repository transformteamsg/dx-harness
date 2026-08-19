# Ratchet decision — input-validation error messages that outlive the error

- **Kind:** admit/reject decision on a ratchet candidate
  ([#190](https://github.com/transformteamsg/dx-harness/issues/190))
- **Decision:** **admitted** — a control will be drafted. Approval per
  `procedures/rule-proposal.md` lands with the merge of the PR carrying this
  record; the draft control ships separately as `status: proposed` (CMP-10).
- **Origin (evidence, not speculation):** a shipped build (String-dxd/
  teacher-workspace-pg-frontend, [PR #117](https://github.com/String-dxd/teacher-workspace-pg-frontend/pull/117))
  carried an input-validation error message that stayed visible after the
  teacher corrected the underlying input. Caught during manual review of a
  design-skill build; no catalog control covered the defect, so per
  `procedures/rule-proposal.md` this is a rule-proposal candidate, not harness
  friction.

## The gap

CNT-1 grades an error message's *wording* (what happened, what to do next) and
CMP-3 grades that an async transaction's error *state exists at all*. Nothing
in the catalog grades the error's *lifecycle once the underlying condition is
fixed*: a field can render a correct, well-worded error message, then leave it
on screen after the teacher has already corrected the input, with no control
flagging it. The trial surface's error copy would have passed CNT-1 and CMP-3
outright while still shipping a defect a teacher would notice on the very next
keystroke.

## Shape of the control to draft

- One statement: an input-validation error message clears as soon as the
  field's value satisfies the validation rule again — no separate action
  (submit, blur elsewhere, navigate away) required to dismiss it — and, where
  more than one field is invalid at once, correcting one field's input clears
  only that field's error while the others remain visible.
- Tier L1 (consistency/quality, alongside CMP-3, CMP-8, CMP-9), `check:
  hybrid` — a script can drive the interaction (type invalid, confirm the
  error renders, type valid, confirm the error node is gone) once a harness
  interaction-runner exists; judgment confirms independence across multiple
  simultaneous field errors. `phase: [implement, verify]`, `applies_to:
  [component]`.
- Client-side input validation only (explicitly out of scope: server-side /
  async validation errors, which follow CMP-3's async-state lifecycle
  instead).
- Sits beside CNT-1 (content of the message) and CMP-3 (existence of the
  error state); this control owns the message's *clearing behaviour*, not its
  wording or its initial appearance.

## Re-audit set

The origin surface is PR #117 in `String-dxd/teacher-workspace-pg-frontend`,
a repository outside this harness/catalog repo — re-auditing it is that
product's next design-loop run, not this repo's. No surface in this repo
(`atelier`) has an interactive validated form to re-audit: it is a
documentation/design-standards site with no `<form>` or field-level
validation anywhere under `app/` or `components/` (confirmed by search — see
issue #190 implementation notes). The re-audit list grows if a future run
finds another shipped surface with this shape of defect.
