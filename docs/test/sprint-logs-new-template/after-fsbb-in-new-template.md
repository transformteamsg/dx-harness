---
type: Sprint Log
title: "Sprint log — FSBB, 18–31 Aug 2026"
description: Squad Charlie's sprint log for the FSBB Pathway Explorer, which had no assigned capacity this sprint. A mirror-driven deployment model was built on reserve time and is not yet running, and every pilot gate from the previous sprint is untouched.
tags: [sprint-log, squad-charlie, fsbb, fsbb-calculator, schools-and-educator-productivity, ci-cd]
status: draft
generated: { by: claude-code/opus-5, at: "2026-08-30T13:45:00Z" }
sources:
  - id: fsbb-calculator-67
    resource: https://github.com/String-dxd/fsbb-calculator/pull/67
    title: "ci: auto build/deploy dev + prod on every merge"
    author: human:yongggquannn
    last_modified: 2026-08-21
  - id: fsbb-calculator-68
    resource: https://github.com/String-dxd/fsbb-calculator/issues/68
    title: "chore(ci): enable the GitLab ECR watcher deployment pipeline"
    author: human:yongggquannn
    last_modified: 2026-08-21
  - id: fsbb-calculator-50
    resource: https://github.com/String-dxd/fsbb-calculator/issues/50
    title: "feat(analytics): instrument FSBB Pathway Explorer with GA4"
    author: human:cheellipadi
    last_modified: 2026-08-14
  - id: fsbb-calculator-51
    resource: https://github.com/String-dxd/fsbb-calculator/issues/51
    title: "feat(analytics): export GA4 events to BigQuery for pathway diversity analysis"
    author: human:cheellipadi
    last_modified: 2026-08-03
  - id: fsbb-calculator-64
    resource: https://github.com/String-dxd/fsbb-calculator/issues/64
    title: "spike(security): complete threat risk assessment for FSBB Pathway Explorer"
    author: human:cheellipadi
    last_modified: 2026-08-14
  - id: dxd-transform-infrastructure-650
    resource: https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/dxd-transform-infrastructure/-/merge_requests/650
    title: "ci(fsbb): require manual production deploy"
    author: human:yong_quan_tan2
    last_modified: 2026-08-21
  - id: dxd-transform-infrastructure-635
    resource: https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/dxd-transform-infrastructure/-/merge_requests/635
    title: "feat(prd/fsbb-calculator): stand up prod stack with SSOE IP gating"
    author: human:teh_chee_yang
    last_modified: 2026-08-12
  - id: dxd-transform-infrastructure-645
    resource: https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/dxd-transform-infrastructure/-/merge_requests/645
    title: "chore(prd/fsbb-calculator): gate on seed cidrs, stage school wifi for pilot"
    author: human:teh_chee_yang
    last_modified: 2026-08-14
usage_window: { from: 2026-08-18, to: 2026-08-31 }
stale_after: 2026-09-14
---

# Sprint log — FSBB

## Header

| Field | Entry |
|---|---|
| Log ID | `SL-fsbb-2026-08-31` |
| Sprint | 2026-08-18 to 2026-08-31 |
| Workstream | FSBB Pathway Explorer — [`String-dxd/fsbb-calculator`](https://github.com/String-dxd/fsbb-calculator) |
| Squad | Charlie |
| Sprint goal | None. FSBB held no assigned capacity this sprint. |
| Goal met | Not applicable. All work came from the protected 20% reserve. |

## Delivered

| Item | Link | Points |
|---|---|---|
| None. Nothing merged. | — | — |

## Carried over

| Item | Link | Committed at planning? | Reason | Re-estimate? |
|---|---|---|---|---|
| Mirror-driven deployment, application side | [#67](https://github.com/String-dxd/fsbb-calculator/pull/67) | Carried in | Open since 17 Aug, unreviewed. Reserve went elsewhere. | No, unpointed |
| Mirror-driven deployment, infrastructure side | [!650](https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/dxd-transform-infrastructure/-/merge_requests/650) | Carried in | Same as #67. Must land with it. | No, unpointed |
| Start the GitLab pipeline schedule | [#68](https://github.com/String-dxd/fsbb-calculator/issues/68) | Carried in | In review. Needs GitLab project access, not engineering. | No, unpointed |
| Threat risk assessment | [#64](https://github.com/String-dxd/fsbb-calculator/issues/64) | Carried in | No output since 14 Aug. Sole gate on the pilot. | No, estimate predates the sprint |
| BigQuery export for pathway diversity | [#51](https://github.com/String-dxd/fsbb-calculator/issues/51) | Carried in | Iceboxed and unassigned since 3 Aug. | No, estimate predates the sprint |
| GA4 instrumentation | [#50](https://github.com/String-dxd/fsbb-calculator/issues/50) | Carried in | Pending GA setup on the production domain and event verification. | No, `sp:8` predates the sprint |

## Decisions

| Decision | Record | Approver |
|---|---|---|
| Deploy by mirror, not by watcher. GitHub publishes an image and holds no GitLab credential. | **No record.** See Finding 1. | None. #67 is unreviewed. |
| Promote to production by protected manual job, reusing the image tag dev runs. | **No record.** See Finding 1. | None. !650 is unreviewed. |
| Nothing decided on the pilot, the threat risk assessment, or the school wifi allowlist. | [4–17 Aug FSBB log](https://github.com/String-dxd/fsbb-calculator) | Not applicable |

## Risks handed over

| Risk | Issue | Owner |
|---|---|---|
| The 4–17 Aug log cites the wrong merge request for the production stack. A reader concludes production was never deployed. | **No issue.** See Finding 2. | Unassigned |
| Merging #67 and !650 without #68 replaces a working watcher with a schedule that does not exist. | [#68](https://github.com/String-dxd/fsbb-calculator/issues/68) | Yong Quan |
| Production is gated to SEED CIDRs, not school wifi. A missed swap gives every pilot school a silent 404. | **No issue.** See Finding 3. | Unassigned |
| Pathway diversity has no analysis path. Telemetry accrues with nothing downstream to read it. | [#51](https://github.com/String-dxd/fsbb-calculator/issues/51) | Unassigned |
| PDPA and IT Security sign-off is outstanding on minors' subject and grade data. | **No issue.** See Finding 4. | Unassigned |
| The pilot date, the week of 12 October, appears in no repository. Treat it as unverified. | **No issue.** See Finding 5. | Unassigned |

## Sign-off

| Field | Entry |
|---|---|
| From | Squad Charlie, Chee Yang |
| To | Unassigned |
| Date | 2026-08-31 |
| Permanent link | `sprint-logs/2026-08-31_sprint_log_fsbb.md` |

---

## Step 5 report

Not part of the log. This is what the skill says aloud before it asks for
confirmation, per Step 5 of `dx-create-sprint-logs`.

**Rows with no link.** Each one needs something written before the log is honest.

1. Both deployment decisions have no decision record. Two weeks of design sit in a PR description. Write the record, then link it.
2. The wrong-citation correction has no issue. Raise one against the 4–17 Aug log. Do not edit that log.
3. The school wifi CIDR swap has no issue. It is a Terraform change in `https-listener-rules.hcl`, and it is now two sprints old.
4. PDPA and IT Security sign-off has no issue. #64 feeds that review and does not conclude it.
5. The pilot date has no issue and no repository record.

**Sources not searched.** Darren's GitLab merge requests. His GitLab username is
unknown, so GitLab evidence covers Chee Yang, Victor, Yong Quan, and Jerome only.
