# Harness feedback — GitHub issues are the system of record

Harness *feedback* and *friction* — a confusing step, a missing or unbuilt check, a
process gap, an onboarding nit — is filed as a **GitHub issue** on
`transformteamsg/tfx-design-standard`. Issues are the system of record. Do not append to
a markdown feedback log; the old logs are archived (see "Archived logs" below).

## What goes here vs. the ratchet

Keep the boundary clear:

- **Harness feedback / friction → a GitHub issue** (this doc). Skill confusion, a missing
  check, a process or onboarding gap, a reliability nit.
- **A control proposal** (a new or revised catalog control) → a **decision /
  catalog-change record** through the ratchet, per `CONTRIBUTING.md`. Unchanged.

A feedback issue may *spawn* a control proposal — but the issue tracks the feedback, and
the record specs the control. Don't file a control spec as an issue, and don't record a
feedback nit as a catalog change.

## Filing an issue

- **One issue per feedback item.** Group trivial nits from a single run into one issue.
- **Title marker:** `[harness-feedback] <summary>` — the marker makes the set findable
  and lets the helper (below) dedup.
- **Body:** the ask + the source context — which skill / check / phase surfaced it, and
  the evidence (quote it, link the run or record).
- **Labels for triage** — one severity + one or more category:
  - severity: `L0-risk`, `high`, `med`, `low`
  - category: `a11y`, `tooling`, `standards`, `harness-ux`, `onboarding`
  - The colour + description each label carries is defined in the label-creation step of
    plan 030 (`harness/plans/030-feedback-as-issues-process.md`).

## Dedup before filing

Search before you file so the tracker doesn't accumulate duplicates:

```
gh issue list --search "[harness-feedback] <keywords>" --state all
```

`--state all` catches closed items too. GitHub `--search` is **fuzzy full-text**, so
`[harness-feedback]` is a search *term*, not an exact-match qualifier — re-filter the
results by the exact marker prefix before deciding. If a match exists, comment on or
reopen it instead of opening a duplicate. (The helper does this filtering in code.)

## Honest failure

If `gh` is unauthenticated or the repo is unreachable, **report it clearly** — print the
issue body that *would* have been filed and the failure reason, and exit non-zero. Never
silently skip. This mirrors the harness rule: never overstate enforcement, never claim a
side effect that didn't happen.

## The mechanism

Use the helper — it adds the marker, validates the labels, dedups, and fails honestly:

```
python3 scripts/file-feedback-issue.py \
  --severity <L0-risk|high|med|low> \
  --category <a11y|tooling|standards|harness-ux|onboarding> \
  --title "<summary>" \
  --body "<ask + source context>"
```

Rehearse with `--dry-run` (prints the `gh` command + body, files nothing); test the pure
logic with `--self-test` (never touches the network). The title marker is added
automatically and is idempotent. See `scripts/README.md` for the full flag list. If `gh`
is unavailable the helper prints the would-be issue + the reason and exits non-zero.

## Mid-session capture — the `feedback` skill

The `feedback` skill routes a user's harness feedback to this process the moment it
surfaces — even mid-task while another skill is running — instead of letting it
evaporate when the session ends. It carries the capture-classify-confirm-file
procedure; this doc stays the spec for the marker, labels, and dedup rule. Any
change to those stays here and in the helper — the skill needs no edit.

## Archived logs

The markdown feedback logs are read-only historical archives — do not append to them:

- `docs/loop-run/FRICTION-REPORT.md` (upstream, loop run 004).
- `docs/decisions/HARNESS-FEEDBACK.md` (the consumer repo, Teacher Workspace) — archived
  there, in that repo; named here only for completeness.

If a file view of open feedback is still wanted, generate a thin index *from* issues
(`gh issue list --label …`) — never hand-maintain a list, which reintroduces the drift
issues remove. The one-time backfill of historical items is plan 032.
