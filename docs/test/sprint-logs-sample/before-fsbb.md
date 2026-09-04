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

**Sprint:** Tue 18 Aug → Mon 31 Aug 2026
**Workstream:** FSBB Pathway Explorer — [`String-dxd/fsbb-calculator`](https://github.com/String-dxd/fsbb-calculator)
**Squad:** Charlie
**Sprint goal:** None. FSBB was not an assigned workstream this sprint.
**Goal met:** Not applicable.

## Who worked on it

Squad Charlie held this workstream nominally. Only Yong Quan worked on it, on reserve time.

* Chee Yang / [@cheellipadi](https://github.com/cheellipadi) / `teh_chee_yang` (GitLab) - Squad Lead
* Darren Lee / [@darrenlee-dxd](https://github.com/darrenlee-dxd) - designer
* Jerome Ke / [@jeromekejh](https://github.com/jeromekejh) / `junhao_ke_from.tp` (GitLab)
* Victor Loh / [@vlwk](https://github.com/vlwk) / `victor_loh1` (GitLab)
* Yong Quan / [@yongggquannn](https://github.com/yongggquannn) / `yong_quan_tan2` (GitLab)
* Ralph / [@santosral](https://github.com/santosral) - joined from the Professional Learning space for this sprint

Ralph joined for this sprint only and worked on MySEI. Nobody left permanently. Victor was
on reservist training from 21 to 28 August and Ralph was on leave from 26 to 28 August;
neither worked on FSBB, so neither absence explains anything here.

Charlie's assigned workstreams this sprint were MySEI and TCI, each with its own log. FSBB
received no assigned capacity at all. Everything below came out of the protected 20%
reserve, and it is one engineer's work. Read this log as a record that the workstream was
held rather than advanced.

Nothing this sprint moved the pilot closer. Every gate carried forward from the 4 to 17 Aug
log is exactly where it was.

## What was done this sprint

Nothing merged. The work is a new delivery model, complete in code and inert in practice.

PR [#67](https://github.com/String-dxd/fsbb-calculator/pull/67) and infra MR
[!650](https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/dxd-transform-infrastructure/-/merge_requests/650)
are both still open. Together they replace the scheduled ECR watcher with a mirror-driven
deployment. A merge to `main` on GitHub publishes one immutable
`transform/fsbb-calculator:sha-<commit>` image to the shared management ECR, and then GitHub
stops. It never calls GitLab and stores no GitLab credential. The SHA-preserving GitLab pull
mirror carries the same commit SHA across, so the mirrored application pipeline runs the
tests and triggers the infra pipeline with `sha-$CI_COMMIT_SHA`, the exact tag GitHub just
published. The infra pipeline waits for that tag to appear before planning, because a mirror
update can arrive before GitHub has finished pushing. Production is a protected manual job
that reads the immutable tag already running in dev, so promotion cannot pick up a different
build than the one that was tested.

Both were opened on 17 August, the last day of the previous sprint, and last touched on 21
August. Neither has moved since.

## Reserve work

This whole log is reserve work. The table would repeat the section above, so it is omitted.

## What spilled

**[#68](https://github.com/String-dxd/fsbb-calculator/issues/68) is the gap that matters,
and it is not a coding task.** It is in review. PR #67 and MR !650 land the code for the new
delivery model, but none of it does anything until someone configures and starts the GitLab
pipeline schedule. The schedule runs two jobs every ten minutes or so: one resolves the
image tag the dev ECS service is actually running, the other polls ECR for up to nine
minutes and triggers the deploy. Until that schedule exists, merges to `main` reach nothing.

State: in review, no branch needed, blocked on nobody. It needs someone with GitLab project
access to do it rather than more engineering.

**PR #67 and MR !650 are both unreviewed and unmerged** after two weeks open. Neither is
blocked. They stalled because the reserve that produced them was spent elsewhere once the
work was written.

**Everything from the previous sprint is untouched.**
[#64](https://github.com/String-dxd/fsbb-calculator/issues/64), the threat risk assessment,
was last updated on 14 August and is still in progress with no observable output. It remains
the sole gate on the pilot.
[#51](https://github.com/String-dxd/fsbb-calculator/issues/51), the BigQuery export where
the pathway diversity measure is actually computed, was last updated on 3 August and is
still iceboxed and unassigned. Epic
[#50](https://github.com/String-dxd/fsbb-calculator/issues/50) (`sp:8`) is still open,
pending GA setup against the production domain and verification that events arrive. None of
these were re-estimated, and their estimates predate this sprint.

## Decisions and their reasons

**Deployment is mirror-driven rather than watcher-driven, and GitHub holds no GitLab
credential.** GitHub's only job is to publish an immutable image and stop. GitLab owns every
ECS change. That keeps the deployment trigger inside the environment that has the AWS
permissions, and it means a compromised GitHub Actions run cannot reach the cluster.

**Production promotion is a protected manual gate that reuses the dev image tag.** It reads
the tag dev is running rather than rebuilding or re-resolving, so what reaches production is
the artifact that was tested, not a fresh build of the same commit.

**No decision was taken on the pilot, the TRA, or the school wifi allowlist**, because
nobody worked on them. The 4 to 17 Aug log remains the current record for all three.

## Known risks and traps

1. **The previous sprint's log points at the wrong merge request for the production stack.**
   The 4 to 17 Aug FSBB log cites infra MR !650 twice, for
   [#55](https://github.com/String-dxd/fsbb-calculator/issues/55) and for the note that the
   production stack is invisible in the GitHub repo. !650 is this sprint's CI merge request
   and is still open. The production environment was actually built by
   [!635](https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/dxd-transform-infrastructure/-/merge_requests/635),
   `!642` and
   [!645](https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/dxd-transform-infrastructure/-/merge_requests/645),
   all merged between 12 and 14 August. Anyone following the old citation lands on an open
   merge request and concludes production was never deployed. It was.

2. **The new deployment model is code with nothing running it.** Merging #67 and !650
   without doing #68 leaves FSBB in a worse state than today, because the old scheduled
   watcher is replaced by a schedule that does not exist. Land all three together or none.

3. **Production is still gated to SEED device CIDRs, not school wifi.** Carried forward
   unchanged. The school wifi block sits commented out as `school_wifi_cidrs` in
   `infra/states/provider.aws/acct.prd/env.prd/svc.fsbb-calculator/alb/https-listener-rules.hcl`.
   The gate is fail-closed at the ALB, so if the swap is missed the failure is a silent
   site-wide 404 for every pilot school with nothing in the application logs to explain it.
   It is a Terraform change rather than a code change, so it can be left late, but it is now
   two sprints since anyone touched it.

4. **The question the pilot exists to answer still has no analysis path.** #51 is iceboxed
   and unassigned, and it is where the pathway diversity measure is computed. Raw telemetry
   is being collected with nothing downstream to read it.

5. **PDPA and IT Security sign-off remains outstanding, with no issue tracking it.** Carried
   forward unchanged. The data is minors' subject and grade detail going to a third party.
   #64 feeds that review and does not conclude it.

6. **The pilot date of the week of 12 October appears nowhere in either repository.** The 4
   to 17 Aug log is still the only written record of it, and nothing this sprint confirmed
   or moved it. Treat it as unverified.

7. **Darren's GitLab merge requests were not searched.** His GitLab username is unknown, so
   the GitLab evidence behind this log covers Chee Yang, Victor, Yong Quan and Jerome only.
