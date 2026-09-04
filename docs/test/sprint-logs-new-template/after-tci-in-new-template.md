---
type: Sprint Log
title: "Sprint log — TCI, 18–31 Aug 2026"
description: Squad Charlie's sprint log for the TCI dashboard workstream. All four Term 4 dashboards reached staging ahead of the 14 Sep go-live, the dashboards came under version control mid-sprint, and the hurtful behaviour tabs carry to the next sprint.
tags: [sprint-log, squad-charlie, tci, wellbeing-viz, schools-and-educator-productivity, superset]
status: draft
generated: { by: claude-code/opus-5, at: "2026-08-30T13:45:00Z" }
sources:
  - id: wellbeing-viz-23
    resource: https://github.com/transformteamsg/wellbeing-viz/pull/23
    title: "Version-control the TCI Superset dashboards, with a CLI to sync them"
    author: human:cheellipadi
    last_modified: 2026-08-25
  - id: wellbeing-viz-27
    resource: https://github.com/transformteamsg/wellbeing-viz/pull/27
    title: "feat(tci-dashboard): build Term 4 Main TCI Survey responses and For download tabs (P5/P6)"
    author: human:yongggquannn
    last_modified: 2026-08-26
  - id: wellbeing-viz-28
    resource: https://github.com/transformteamsg/wellbeing-viz/pull/28
    title: "feat(TCI P1-P2): add the Term 4 tab to the P1-P2 dashboard"
    author: human:cheellipadi
    last_modified: 2026-08-27
  - id: wellbeing-viz-29
    resource: https://github.com/transformteamsg/wellbeing-viz/pull/29
    title: "feat(TCI P3-P4): add the Term 4 tab to the P3-P4 dashboard"
    author: human:cheellipadi
    last_modified: 2026-08-27
  - id: wellbeing-viz-30
    resource: https://github.com/transformteamsg/wellbeing-viz/pull/30
    title: "feat(tci-dashboard): populate Term 4 column on Risk and protective factors across terms"
    author: human:yongggquannn
    last_modified: 2026-08-27
  - id: wellbeing-viz-31
    resource: https://github.com/transformteamsg/wellbeing-viz/pull/31
    title: "feat(scripts): fork publishes the sandbox so a reviewer can open it"
    author: human:yongggquannn
    last_modified: 2026-08-26
  - id: wellbeing-viz-1
    resource: https://github.com/transformteamsg/wellbeing-viz/issues/1
    title: "feat(tci-dashboard): restructure Superset tabs to separate main TCI and hurtful behaviour content"
    author: human:cheellipadi
    last_modified: 2026-08-18
  - id: wellbeing-viz-13
    resource: https://github.com/transformteamsg/wellbeing-viz/issues/13
    title: "feat(tci-dashboard): add FormSG feedback link to dashboard"
    author: human:cheellipadi
    last_modified: 2026-08-18
  - id: wellbeing-viz-17
    resource: https://github.com/transformteamsg/wellbeing-viz/issues/17
    title: "[Epic] feat(tci-dashboard): build Term 4 tab for the Upper Primary (P5/P6) TCI Superset dashboard"
    author: human:cheellipadi
    last_modified: 2026-08-27
  - id: wellbeing-viz-18
    resource: https://github.com/transformteamsg/wellbeing-viz/issues/18
    title: "feat(tci-dashboard): scaffold Term 4 tab structure and Hurtful Behaviour placeholders"
    author: human:yongggquannn
    last_modified: 2026-08-21
  - id: wellbeing-viz-19
    resource: https://github.com/transformteamsg/wellbeing-viz/issues/19
    title: "feat(tci-dashboard): build Term 4 Students to Prioritise and populate the term columns"
    author: human:yongggquannn
    last_modified: 2026-08-24
  - id: wellbeing-viz-20
    resource: https://github.com/transformteamsg/wellbeing-viz/issues/20
    title: "feat(tci-dashboard): build Term 4 Main TCI Survey responses and For download tabs"
    author: human:yongggquannn
    last_modified: 2026-08-26
  - id: wellbeing-viz-21
    resource: https://github.com/transformteamsg/wellbeing-viz/issues/21
    title: "feat(tci-dashboard): build Term 4 Main TCI charts (P5/P6)"
    author: human:yongggquannn
    last_modified: 2026-08-24
  - id: wellbeing-viz-22
    resource: https://github.com/transformteamsg/wellbeing-viz/issues/22
    title: "feat(tci-dashboard): populate Term 4 column on Risk and protective factors across terms"
    author: human:yongggquannn
    last_modified: 2026-08-27
  - id: wellbeing-viz-24
    resource: https://github.com/transformteamsg/wellbeing-viz/issues/24
    title: "feat(TCI P1-P2): Build P1-P2 term 4 dashboard"
    author: human:cheellipadi
    last_modified: 2026-08-27
  - id: wellbeing-viz-25
    resource: https://github.com/transformteamsg/wellbeing-viz/issues/25
    title: "feat(TCI P3-P4): Build P3-P4 term 4 dashboard"
    author: human:cheellipadi
    last_modified: 2026-08-27
  - id: wellbeing-viz-26
    resource: https://github.com/transformteamsg/wellbeing-viz/issues/26
    title: "[Epic] feat(scripts): version-control the TCI Superset dashboards and sync them with a CLI"
    author: human:cheellipadi
    last_modified: 2026-08-25
usage_window: { from: 2026-08-18, to: 2026-08-31 }
stale_after: 2026-09-14
---

# Sprint log — TCI

## Header

| Field | Entry |
|---|---|
| Log ID | `SL-tci-2026-08-31` |
| Sprint | 2026-08-18 to 2026-08-31 |
| Workstream | TCI dashboard — [`transformteamsg/wellbeing-viz`](https://github.com/transformteamsg/wellbeing-viz) |
| Squad | Charlie |
| Sprint goal | Term 4 dashboards ready before the 14 Sep go-live. |
| Goal met | Partly. All four dashboards are on staging and under test. The hurtful behaviour tabs move to the next sprint. |

## Delivered

| Item | Link | Points |
|---|---|---|
| Term 4 tab structure and hurtful behaviour placeholders, Upper Primary | [#18](https://github.com/transformteamsg/wellbeing-viz/issues/18) | `sp:2` |
| Students to Prioritise, with the Term 4 columns populated | [#19](https://github.com/transformteamsg/wellbeing-viz/issues/19) | `sp:5` |
| Main TCI charts | [#21](https://github.com/transformteamsg/wellbeing-viz/issues/21) | `sp:8` |
| Main TCI Survey responses and For download tabs. Fixed `TCI_P5_P6_Term4Data`, which dropped `responses`. | [#20](https://github.com/transformteamsg/wellbeing-viz/issues/20), [PR #27](https://github.com/transformteamsg/wellbeing-viz/pull/27) | `sp:3` |
| Term 4 column on Risk and protective factors across terms | [#22](https://github.com/transformteamsg/wellbeing-viz/issues/22), [PR #30](https://github.com/transformteamsg/wellbeing-viz/pull/30) | `sp:3` |
| P1 to P2 Term 4 tabs | [#24](https://github.com/transformteamsg/wellbeing-viz/issues/24), [PR #28](https://github.com/transformteamsg/wellbeing-viz/pull/28) | `unpointed` |
| P3 to P4 Term 4 tabs | [#25](https://github.com/transformteamsg/wellbeing-viz/issues/25), [PR #29](https://github.com/transformteamsg/wellbeing-viz/pull/29) | `unpointed` |
| Four live dashboards under version control, with a sync CLI | [#26](https://github.com/transformteamsg/wellbeing-viz/issues/26), [PR #23](https://github.com/transformteamsg/wellbeing-viz/pull/23) | `unpointed` |
| `make fork` publishes the sandbox, so the reviewer it exists for can open it | [PR #31](https://github.com/transformteamsg/wellbeing-viz/pull/31) | `unpointed` |

## Carried over

| Item | Link | Committed at planning? | Reason | Re-estimate? |
|---|---|---|---|---|
| Split the dashboard into six tabs in fixed order | [#1](https://github.com/transformteamsg/wellbeing-viz/issues/1) | Yes | Moved to backlog on 18 Aug for Term 4, which has a fixed go-live. | Yes. The dashboards are now version-controlled bundles. |
| FormSG feedback link on the two hurtful behaviour tabs | [#13](https://github.com/transformteamsg/wellbeing-viz/issues/13) | Yes | Moved to backlog with #1. The stakeholder has not supplied the link. | Yes. The estimate is from 4 Aug. |
| Upper Primary Term 4 epic | [#17](https://github.com/transformteamsg/wellbeing-viz/issues/17) | Yes | All four children closed. Open for the hurtful behaviour tabs. | No. Its children were pointed. |

## Decisions

| Decision | Record | Approver |
|---|---|---|
| Version-control the dashboards as Superset export bundles, synced by a purpose-built CLI. `preset-cli` and `sup` were rejected. | **No record.** See Finding 1. | Unrecorded |
| `plans.py` stays dependency-free, so the operations that can destroy live dashboards stay testable offline. | [`DECISIONS.md`](https://github.com/transformteamsg/wellbeing-viz/blob/main/DECISIONS.md) | Chee Yang |
| Sandbox dashboards are created published, not as drafts. | [`DECISIONS.md`](https://github.com/transformteamsg/wellbeing-viz/blob/main/DECISIONS.md) | Chee Yang |
| Move #1 and #13 to backlog rather than carry them in the sprint. | **No record.** See Finding 2. | Unrecorded |

## Risks handed over

| Risk | Issue | Owner |
|---|---|---|
| Term 4 goes live on 14 Sep. The dashboards are on staging, under test, not signed off. | **No issue.** See Finding 3. | Squad Charlie |
| The hurtful behaviour tabs are placeholders. A Year Head sees an empty tab with nothing to explain it. | [#1](https://github.com/transformteamsg/wellbeing-viz/issues/1) | Unassigned |
| #1 blocks ten issues in the epic and has been set down in two consecutive sprints. | [#1](https://github.com/transformteamsg/wellbeing-viz/issues/1) | Unassigned |
| #18, #19 and #21 closed before the CLI merged. Their changes exist only in Superset, not in git. | **No issue.** See Finding 4. | Unassigned |
| #20, #22, #24, #25 and #26 are closed but still read `status: review`. A board will disagree with the repository. | **No issue.** See Finding 5. | Unassigned |
| A change made in the Superset UI does not announce itself. The CLI makes drift detectable, not prevented. | **No issue.** See Finding 6. | Unassigned |

## Sign-off

| Field | Entry |
|---|---|
| From | Squad Charlie, Chee Yang |
| To | Squad Charlie, Chee Yang |
| Date | 2026-08-31 |
| Permanent link | `sprint-logs/2026-08-31_sprint_log_tci.md` |

---

## Step 5 report

Not part of the log. This is what the skill says aloud before it asks for
confirmation, per Step 5 of `dx-create-sprint-logs`.

**Rows with no link.** Each one needs something written before the log is honest.

1. The choice to build a CLI rather than use `preset-cli` or `sup` has no record. `DECISIONS.md` holds the decisions made inside the tool, not the decision to build it.
2. Neither #1 nor #13 records why it was deprioritised, in either of the two sprints that set it down.
3. Go-live readiness has no issue tracking sign-off against the 14 Sep date.
4. The first week's Superset-only changes have no issue. Recovering them means reading the live dashboards.
5. The five stale `status: review` labels have no issue.
6. Superset drift detection has no issue and nothing runs on a schedule.

**Content routed out of the log.** Three passages in the previous version have no
issue, no PR, and no decision record. Under this skill they do not go in the log.

- The dashboard facelift explored outside the sprint. Raise an issue or drop it, because a log entry cannot be assigned or scheduled.
- The observation that reserve work took more than a fifth of the sprint. This belongs on the retrospective.
- The description of how `supersetlib/` is layered. This belongs in the repository's own documentation, beside the code it describes.

**Sources not searched.** Darren's GitLab merge requests. His GitLab username is
unknown.
