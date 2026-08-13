# Adopting the DX design harness — product team guide

**Audience:** an engineer or designer preparing a product repo to use the harness.

**Time:** approximately one hour plus team decisions (mainly items 5 and 6 below).

This guide walks through the six harness-ready checklist items in order. Work through them
once per product repo, not once per page. After setup, every design session runs the
same loop automatically.

---

## 0. Install the plugin

Follow the two commands in the [README Install section](../README.md#install):

```
/plugin marketplace add transformteamsg/dx-harness
/plugin install dx-harness@dx-harness
```

This installs the design skills (`dx-design`, `dx-design-setup`, `dx-design-execute`,
`dx-design-critique`, `dx-design-copy`, `dx-design-polish`,
`dx-design-motion`, `dx-design-flow`, `dx-design-pattern`, `dx-design-feedback`,
`dx-design-language`, `dx-design-git`, `dx-design-research-brief`), the `dx-design-review`
subagent (which carries its own review procedure), and the control catalog
(`standards/`) — the catalog ships with the
plugin, not with your repo. `/dx-harness:dx-design` is the front door: it orients you and routes to
the right skill.

If you are working on the harness itself (not a product repo), open a Claude Code
session in this repository directly: the skills load from `plugins/dx-harness/skills/`
automatically and no install step is needed.

**Per-user tools.** The plugin install is per-repo; the capture and
filing tools are per-person. Each teammate runs `/dx-harness:dx-design` (or invokes the `dx-design-setup`
skill directly), which follows the checklist (`plugins/dx-harness/skills/design/dx-design-setup/setup.md` in this
repo): the agent-browser CLI + skill for screenshots, an authenticated `gh` for
harness feedback, Python with PyYAML for the check scripts.

---

## 1. Product context

**What it means:** The harness needs to know the design decisions your product already
implements. Record any differences from the portfolio defaults in a `DESIGN.md` at the
repo root. Its Typography, Tokens, and Components sections are where you declare your
actual interface stack. The generated `.dx/design.json` lets the checks and design loop
read the same decisions.

**The concrete step:** Run `dx-design-language`, which walks you through the decisions
and writes `DESIGN.md`. You can also start from `docs/templates/DESIGN.md`. Keep only
values that differ from the portfolio defaults; do not restate catalog rules. Generate
the machine twin and commit both files:

```
python3 <harness>/scripts/generate-design-json.py .
```

Regenerate the twin whenever `DESIGN.md` changes. CI can check freshness with
`--check`. The full format and loading rules live in `docs/DESIGN-CONTEXT.md`.

**Current limitation:** The catalog and deterministic checks still assume Base UI,
Radix Colors, shadcn/ui default tokens, Plus Jakarta Sans, and Inter in several places.
Do not migrate a product to that stack just to install the harness. Record the product's
implemented choices in `DESIGN.md`, then have a named design lead interpret any verdict
that depends on the hard-coded defaults. Generalising those catalog and check assumptions
is tracked separately.

---

## 2. Component manifest

**What it means:** CMP-1 requires that when the agent proposes components, it only
uses components that exist in your product's library. A component manifest is the
machine-readable list the agent reads to satisfy that requirement.

**The concrete step:** Create `.dx/component-manifest.json` at your repo root and
list your components, marking each entry's `status` (the loop composes only from
`status: "stable"` entries). Validate it with the shipped check:
`python3 <harness>/checks/component-manifest.py .dx/component-manifest.json` — it
verifies required keys, enum values, and date format. When your manifest declares
`coverage: "complete"`, the check also diffs component imports in changed source
against the manifest (the CMP-1 import-diff); with `coverage: "partial"` the diff
stays off.

**No manifest yet?** The loop falls back to reading your component source directory
directly, per the v0-limit procedure in `standards/controls/cmp-1.md`. Expect CMP-1
verdicts to be marked "asserted, no manifest" — a known fallback state, not a
misconfiguration or a skipped control.

---

## 3. Skills installed

**What it means:** The DX skills (`dx-design`, `dx-design-setup`, `dx-design-execute`,
`dx-design-critique`, `dx-design-copy`, `dx-design-polish`,
`dx-design-motion`, `dx-design-flow`, `dx-design-pattern`, `dx-design-feedback`,
`dx-design-language`, `dx-design-git`, `dx-design-research-brief`) and the
`dx-design-review` subagent must be
active in the product repo's Claude session for the harness to work. Without them, the agent
has no loop structure, no catalog filters, and no design-review procedure to follow.

**The concrete step:** After running the install commands in item 0, verify the skills
loaded. Open a Claude Code session in your product repo and ask: "design a test page."
The `dx-design` orchestrator must trigger and ask intent questions — purpose, the person
and moment, page type, done-criteria. If it does not, run `/plugin list` and confirm
`dx-harness` is enabled. If the plugin appears but the skill does not trigger,
check that the session is open in the product repo root, not in a subdirectory.

---

## 4. Deterministic checks

**What it means:** Harness-ready item 4 calls for the deterministic check scripts —
scripts that verify a control's statically-checkable half without waiting for agent
judgment. You run them at the implement and verify phases.

**Status today:** 10 check scripts are built and self-tested — `token-audit.py`, `a11y-static.py`, `contrast.py`, `content-lint.py`, `type-scan.py`, `component-manifest.py`, `audit-record.py`, `waiver-reconcile.py`, `reaudit-scope.py`, and the catalog validator `validate.py` — plus `detect.py`, a unified front-end that runs the relevant subset for a given file. See `checks/README.md` for exactly which controls each script covers. Run the ones that apply manually today; a deterministic control covered by a built script is checked by running that script. The controls with no script yet (listed in `checks/README.md`) are still verified manually: you run checks by hand or by reading the code, then record the result. Never report an unbuilt or un-run check as "passed" — say "verified manually" or "unverified" and name what a human should re-check.

Manual verification is the protocol.
`python3 <harness>/checks/detect.py <path>` is the unified entry point —
it runs the curated, low-false-positive subset (token audit, contrast, static a11y,
TYP-1) over a file or directory in one command; `--all` widens it to every built
page check. A clean detect run is the curated subset's clean, not a whole-catalog
pass, so the manual verification protocol above still stands.

---

## 5. Record locations

**What it means:** Decision records and waivers must live in a defined, findable
location in your repo. The harness does not dictate your full directory structure, but
it needs to know where to point humans for approval and audit.

**The concrete step:**

1. Create a `docs/decisions/` directory in your product repo.
2. Copy the decision-record template from the harness:
   `docs/decisions/TEMPLATE.md` → `your-repo/docs/decisions/TEMPLATE.md`.
3. Start one record per page or significant change, beginning at Phase 3 (plan
   approval). Do not start it at Phase 6 — the approved plan is the fixed artifact
   that the verify phase grades against.

Alongside decision records, every surface gets a **design ticket** — one long-lived
issue per page or flow (`Design: <surface>`, label `design`) where runs, findings
from the passes and critique, and waivers are recorded as typed comments. The
conventions live in `procedures/design-tickets.md` (ships with the plugin);
`dx-design-setup` wires your tracker, and a repo without a tracker falls back to
local markdown at `docs/design-tickets/<surface-slug>.md`.

L1 waivers live in the decision records until a central waiver registry exists. When
you grant a waiver, record it in the `## Waivers granted` table of the decision record
with a named approver, a specific reason, and the `dx-waive` inline marker in the
code. L0 controls are never waivable. A waiver without a named human approver is not a
valid L1 waiver.

---

## 6. Named L1 approver

**What it means:** L1 waivers require a named human approver. Without one, L1 waivers
cannot be granted and the harness has no human gate for the most consequential
decisions.

**The concrete step:** Name a specific person — not a role, not a team, not
"the design lead in general." Record the name and date in
`docs/decisions/APPROVER.md` in your product repo, for example:

```
L1 waiver approver: Jane Doe (jane.doe@example.gov.sg)
Recorded: 2026-06-10
```

**No dedicated designer on your team?** Name a design lead who can hold the plan and
review gates asynchronously. That person can sit outside the product team, but the
record still needs their name. Do not use a role or team name as the approver.

---

## First real page — what to expect

Once the six items above are satisfied, run `/dx-harness:dx-design` on your first real
page. The orchestrator routes a build ask to `dx-design-execute` — the only skill that
edits the product — and hands over your answers so you are never interviewed twice.
Here is what the six phases feel like in practice:

1. **Intent** — the agent asks four questions (purpose, the person and moment, page
   type, done-criteria) and locks in a sprint contract. Resist the urge to rush past
   this phase; the contract is what the design review grades against.
2. **Diverge** — 2–3 clearly different directions are rendered as real, self-contained
   HTML pages (published as Claude Artifacts in Claude Code), composed from your
   manifest components. You pick one; the pick becomes part of the contract. No
   product code yet.
3. **Plan** — a detailed plan names the components, the controls in scope, the tradeoffs,
   and any proposed waivers. **You approve this before implementation begins**, via a
   three-stage gate: the plan is exposed in full, then grilled — the agent asks you
   pointed questions about it one at a time — then you approve via a structured
   Approve/Adjust turn. Plan approval happens once per run; an explicit ask to build a
   specific plan or chosen direction counts as approval. In an unattended run the
   record shows proxy approval.
4. **Implement** — the branch guard runs first (on `main` or behind the remote, the
   run hands off to `dx-design-git` before any edit), then the agent implements
   against the approved plan with catalog controls active. You should not need to
   intervene unless the plan was ambiguous.
5. **Design review** — the deterministic checks run (built scripts; the rest verified
   manually), screenshots are captured at 360/768/1280 px, and the `dx-design-review`
   agent — fresh context, never the builder — grades the judgment controls against
   your contract. After fixes, new screenshots go back to the same reviewer, which
   marks each fix resolved, partial, or unresolved. Whoever started the run spawns
   the reviewer, exactly once: the executor does it in a session you run directly;
   an orchestrator dispatches it when it started the run.
6. **Rule proposal** — the decision record is finished and the run is recorded on the
   surface's design ticket. Any defect no control covered becomes a proposed new
   control, pending design-lead approval; harness friction goes to
   `dx-design-feedback` instead.

---

## When something fails

**L0 block** — stop, fix the violation, and re-verify before proceeding. L0 controls
(A11Y-1, A11Y-2, A11Y-3, CMP-2) are never waivable. There is no path forward that
leaves an L0 violation unresolved.

**A control seems wrong for your context** — use the waiver protocol in
`standards/README.md` and `procedures/catalogue-mechanics.md` (both ship with the
plugin), not silent deviation. A silent deviation is a compliance gap;
a waiver with a reason and a named approver is an intentional decision. The catalog is
built to evolve — if a control is wrong in principle, raise it via a rule proposal.
A waiver that keeps repeating can be promoted into a standing override in your
product's `DESIGN.md` Overrides section (L0 never; L1 needs a named approver; L2
needs a reason).

**A defect that no control covers** — propose a rule. Follow
`procedures/rule-proposal.md` (ships with the plugin): record the gap in the decision
record as a proposed new control or anti-pattern, marked pending design-lead
approval. Harness friction — the harness itself confused you or got in the way — is
a feedback issue, not a rule proposal: file it with `/dx-harness:dx-design-feedback`.
