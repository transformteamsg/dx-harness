---
type: Sprint Log
title: "Sprint log — MySEI, 18–31 Aug 2026"
description: Squad Charlie's sprint log for MySEI. The primary-school pilot merged to main and the branch quarantine is over, TRA findings closed, and two blockers stand between the app and a production pilot — an academic level code mismatch that 403s every real primary student, and a production autoscaling target the app can never reach.
tags: [sprint-log, squad-charlie, mysei, my-sec, schools-and-educator-productivity, primary-school-pilot]
status: draft
generated: { by: claude-code/opus-5, at: "2026-08-30T13:45:00Z" }
sources:
  - id: my-sec-604
    resource: https://github.com/String-dxd/my-sec/pull/604
    title: "feat: primary school pilot"
    author: human:vlwk
    last_modified: 2026-08-21
  - id: my-sec-603
    resource: https://github.com/String-dxd/my-sec/pull/603
    title: "fix: TRA security findings R01, R04, R11, R15"
    author: human:cheellipadi
    last_modified: 2026-08-21
  - id: my-sec-612
    resource: https://github.com/String-dxd/my-sec/pull/612
    title: "feat(assign-survey): MP/UP picker + UX enhancements"
    author: human:darrenlee-dxd
    last_modified: 2026-08-24
  - id: my-sec-613
    resource: https://github.com/String-dxd/my-sec/pull/613
    title: "fix: enforce survey expiry in the submit action"
    author: human:cheellipadi
    last_modified: 2026-08-21
  - id: my-sec-614
    resource: https://github.com/String-dxd/my-sec/pull/614
    title: "chore: add prisma generate to console"
    author: human:vlwk
    last_modified: 2026-08-20
  - id: my-sec-616
    resource: https://github.com/String-dxd/my-sec/pull/616
    title: "chore: add linter, formatter, and unit test checks on CI"
    author: human:santosral
    last_modified: 2026-08-21
  - id: my-sec-617
    resource: https://github.com/String-dxd/my-sec/pull/617
    title: "feat(surveys): persist the P5 survey variant on student responses"
    author: human:cheellipadi
    last_modified: 2026-08-24
  - id: my-sec-621
    resource: https://github.com/String-dxd/my-sec/pull/621
    title: "perf(primary): pre-optimize and statically import primary-flow images"
    author: human:cheellipadi
    last_modified: 2026-08-26
  - id: my-sec-629
    resource: https://github.com/String-dxd/my-sec/pull/629
    title: "feat(observability): add OpenTelemetry instrumentation with Prisma tracing"
    author: human:vlwk
    last_modified: 2026-08-24
  - id: my-sec-631
    resource: https://github.com/String-dxd/my-sec/pull/631
    title: "chore: fix 403, 404 redirections"
    author: human:jeromekejh
    last_modified: 2026-08-25
  - id: my-sec-635
    resource: https://github.com/String-dxd/my-sec/pull/635
    title: "test: add primary schools load test"
    author: human:santosral
    last_modified: 2026-08-27
  - id: my-sec-638
    resource: https://github.com/String-dxd/my-sec/pull/638
    title: "feat(ui): close gaps in MySEI empty, error states"
    author: human:jeromekejh
    last_modified: 2026-08-28
  - id: my-sec-639
    resource: https://github.com/String-dxd/my-sec/pull/639
    title: "feat(primary): render per-band growth-tip art on the narrative"
    author: human:cheellipadi
    last_modified: 2026-08-27
  - id: my-sec-640
    resource: https://github.com/String-dxd/my-sec/pull/640
    title: "fix(metrics): name academic levels from the roster"
    author: human:cheellipadi
    last_modified: 2026-08-27
  - id: my-sec-641
    resource: https://github.com/String-dxd/my-sec/pull/641
    title: "fix(levels): resolve academic levels by roster name, not numeric code"
    author: human:cheellipadi
    last_modified: 2026-08-28
  - id: my-sec-643
    resource: https://github.com/String-dxd/my-sec/pull/643
    title: "chore: add primary pilot UAT key personnel and sort the mock user picker"
    author: human:cheellipadi
    last_modified: 2026-08-30
  - id: my-sec-476
    resource: https://github.com/String-dxd/my-sec/issues/476
    title: "chore: fix 403, 404 redirections"
    author: human:jeromekejh
    last_modified: 2026-08-25
  - id: my-sec-525
    resource: https://github.com/String-dxd/my-sec/issues/525
    title: "Importing Copy Changes for Primary School"
    author: human:yongggquannn
    last_modified: 2026-08-27
  - id: my-sec-541
    resource: https://github.com/String-dxd/my-sec/issues/541
    title: "Create Screen for MP/UP Selection when P5 Cohort is selected"
    author: human:darrenlee-dxd
    last_modified: 2026-08-24
  - id: my-sec-583
    resource: https://github.com/String-dxd/my-sec/issues/583
    title: "spike(perf): plan load testing and WAF limit checks before the primary pilot"
    author: human:santosral
    last_modified: 2026-08-27
  - id: my-sec-585
    resource: https://github.com/String-dxd/my-sec/issues/585
    title: "chore(content): Integrate pilot images from stakeholders"
    author: human:cheellipadi
    last_modified: 2026-08-26
  - id: my-sec-590
    resource: https://github.com/String-dxd/my-sec/issues/590
    title: "feat(primary): wire student-primary survey flow to the backend"
    author: human:vlwk
    last_modified: 2026-08-21
  - id: my-sec-591
    resource: https://github.com/String-dxd/my-sec/issues/591
    title: "Identify MySEI survey variant on P5 student responses and expose it"
    author: human:cheellipadi
    last_modified: 2026-08-26
  - id: my-sec-597
    resource: https://github.com/String-dxd/my-sec/issues/597
    title: "feat(ui): close gaps in MySEI empty, error states"
    author: human:jeromekejh
    last_modified: 2026-08-28
  - id: my-sec-615
    resource: https://github.com/String-dxd/my-sec/issues/615
    title: "chore: add linter, formatter, and unit test checks on CI"
    author: human:santosral
    last_modified: 2026-08-21
  - id: my-sec-622
    resource: https://github.com/String-dxd/my-sec/issues/622
    title: "fix(deps): bump next and sharp to clear four Next.js CVEs and the libvips advisory"
    author: human:cheellipadi
    last_modified: 2026-08-30
  - id: my-sec-624
    resource: https://github.com/String-dxd/my-sec/issues/624
    title: "feat(observability): add OpenTelemetry instrumentation to the Next.js app"
    author: human:vlwk
    last_modified: 2026-08-25
  - id: my-sec-625
    resource: https://github.com/String-dxd/my-sec/issues/625
    title: "feat(observability): add ADOT collector sidecar with X-Ray export"
    author: human:vlwk
    last_modified: 2026-08-25
  - id: my-sec-626
    resource: https://github.com/String-dxd/my-sec/issues/626
    title: "feat(load-test): create Locust load test script for primary pilot at 300 RPS"
    author: human:santosral
    last_modified: 2026-08-27
  - id: my-sec-645
    resource: https://github.com/String-dxd/my-sec/issues/645
    title: "chore(uat): make the dev environment usable for primary pilot UAT"
    author: human:cheellipadi
    last_modified: 2026-08-30
  - id: my-sec-611
    resource: https://github.com/String-dxd/my-sec/issues/611
    title: "feat(surveys): scope student survey list and submission by academic level"
    author: human:cheellipadi
    last_modified: 2026-08-20
  - id: my-sec-637
    resource: https://github.com/String-dxd/my-sec/issues/637
    title: "fix(e2e): run the firefox project on Firefox instead of Chromium"
    author: human:jeromekejh
    last_modified: 2026-08-26
  - id: my-sec-644
    resource: https://github.com/String-dxd/my-sec/issues/644
    title: "chore(deps): bump adm-zip to 0.6.0 to clear CVE-2026-39244"
    author: human:cheellipadi
    last_modified: 2026-08-30
  - id: honey-jar-100
    resource: https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/honey-jar/-/merge_requests/100
    title: "Trim cross-band roster from SC mock schools 1000 and 1002 via migration"
    author: human:teh_chee_yang
    last_modified: 2026-08-19
  - id: honey-jar-103
    resource: https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/honey-jar/-/merge_requests/103
    title: "Draft: Add dedicated P4 staff for MySEI primary pilot UAT"
    author: human:teh_chee_yang
    last_modified: 2026-08-30
  - id: dxd-transform-infrastructure-661
    resource: https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/dxd-transform-infrastructure/-/merge_requests/661
    title: "chore(mysec): add primary pilot env vars to dev/prd app service"
    author: human:teh_chee_yang
    last_modified: 2026-08-21
  - id: dxd-transform-infrastructure-662
    resource: https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/dxd-transform-infrastructure/-/merge_requests/662
    title: "Draft: feat(mysec): add ADOT collector sidecar for X-Ray tracing"
    author: human:victor_loh1
    last_modified: 2026-08-25
usage_window: { from: 2026-08-18, to: 2026-08-31 }
stale_after: 2026-09-14
---

# Sprint log — MySEI

## Header

| Field | Entry |
|---|---|
| Log ID | `SL-mysei-2026-08-31` |
| Sprint | 2026-08-18 to 2026-08-31 |
| Workstream | MySEI — [`String-dxd/my-sec`](https://github.com/String-dxd/my-sec) |
| Squad | Charlie |
| Sprint goal | MySEI primary pilot readiness. |
| Goal met | Partly. The pilot merged and the TRA findings closed. Internal testing never started, and load testing has no environment. |
| Next holder | Squad Charlie, Chee Yang |

## Delivered

| Item | Link | Points |
|---|---|---|
| Primary-school pilot merged to `main`, leaving quarantine | [#590](https://github.com/String-dxd/my-sec/issues/590), [PR #604](https://github.com/String-dxd/my-sec/pull/604) | `sp:13` |
| TRA findings R01, R04, R11 and R15 closed on the application side | [PR #603](https://github.com/String-dxd/my-sec/pull/603) | `unpointed` |
| MP/UP survey type selection screen | [#541](https://github.com/String-dxd/my-sec/issues/541), [PR #612](https://github.com/String-dxd/my-sec/pull/612) | `sp:3` |
| Survey expiry enforced in `persistSurveyResponses`, closing a replay hole | [PR #613](https://github.com/String-dxd/my-sec/pull/613) | `unpointed` |
| `academic_level_override` mirrored onto `student_responses`, so P5 is one filter | [#591](https://github.com/String-dxd/my-sec/issues/591), [PR #617](https://github.com/String-dxd/my-sec/pull/617) | `sp:2` |
| 403 and 404 render in place at all 13 sites, instead of redirecting | [#476](https://github.com/String-dxd/my-sec/issues/476), [PR #631](https://github.com/String-dxd/my-sec/pull/631) | `unpointed` |
| Primary growth-tip art varies by band | [PR #639](https://github.com/String-dxd/my-sec/pull/639) | `unpointed` |
| Lint, format and unit-test checks run on CI | [#615](https://github.com/String-dxd/my-sec/issues/615), [PR #616](https://github.com/String-dxd/my-sec/pull/616) | `unpointed` |
| Primary images cut from 9.32 MB to 281 KB | [PR #621](https://github.com/String-dxd/my-sec/pull/621) | `unpointed` |
| `prisma generate` added to the console container build | [PR #614](https://github.com/String-dxd/my-sec/pull/614) | `unpointed` |

## Carried over

| Item | Link | Committed at planning? | Reason | Re-estimate? |
|---|---|---|---|---|
| Internal testing | **No issue** | Yes | Never started. Nothing was descoped for it, and nothing records why. | Cannot. It has no issue. |
| Empty and error states, primary routes | [#597](https://github.com/String-dxd/my-sec/issues/597), [PR #638](https://github.com/String-dxd/my-sec/pull/638) | Yes | Draft. The illustrations ship as 1.7 MB of raster SVG. | No. The remaining work is asset optimisation. |
| Load testing spike | [#583](https://github.com/String-dxd/my-sec/issues/583) | Yes | Open across three sprints. In review. Dev is the only environment. | No |
| Pilot content from stakeholders | [#585](https://github.com/String-dxd/my-sec/issues/585) | Yes | Middle Primary questions were due 28 Aug. Gated outside the squad. | No. Re-estimating will not move it. |
| Copy import | [#525](https://github.com/String-dxd/my-sec/issues/525) | Yes | Gated on content arriving. | No. Re-estimating will not move it. |
| Academic level codes do not match production | [#640](https://github.com/String-dxd/my-sec/pull/640), [#641](https://github.com/String-dxd/my-sec/pull/641) | Raised mid-sprint | In review. #641 needs a retarget to `main` once #640 merges. | No. The approach is settled. |
| OpenTelemetry instrumentation | [#624](https://github.com/String-dxd/my-sec/issues/624), [PR #629](https://github.com/String-dxd/my-sec/pull/629) | Raised mid-sprint | Iceboxed on 24 Aug when Victor went on reservist training. | No |
| ADOT collector sidecar with X-Ray export | [#625](https://github.com/String-dxd/my-sec/issues/625), [!662](https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/dxd-transform-infrastructure/-/merge_requests/662) | Raised mid-sprint | Draft. Crosses into another team's repository and three AWS accounts. | Yes. It is larger than #624. |
| Load test run and its findings | [#626](https://github.com/String-dxd/my-sec/issues/626), [PR #635](https://github.com/String-dxd/my-sec/pull/635) | Raised mid-sprint | Draft. Two runs on 26 Aug. Findings are on a PR comment, not the issue. | No |
| UAT key-personnel seed data | [#643](https://github.com/String-dxd/my-sec/pull/643), [!103](https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/honey-jar/-/merge_requests/103) | Raised mid-sprint | Both draft. Dev cannot support the tester plan. | No |
| Reasons dev cannot support the tester plan | [#645](https://github.com/String-dxd/my-sec/issues/645) | Raised mid-sprint | Iceboxed. | No |
| Four high-severity Next.js CVEs, and the libvips advisory behind sharp | [#622](https://github.com/String-dxd/my-sec/issues/622) | Raised mid-sprint | `priority: high`, unassigned, in backlog. Nothing in flight touches it. | No |
| Scope the student survey list by academic level | [#611](https://github.com/String-dxd/my-sec/issues/611) | Raised mid-sprint | Iceboxed, never started. | No |
| Run the Firefox e2e project on Firefox, not Chromium | [#637](https://github.com/String-dxd/my-sec/issues/637) | Raised mid-sprint | Iceboxed, never started. | No |
| Bump adm-zip for CVE-2026-39244 | [#644](https://github.com/String-dxd/my-sec/issues/644) | Raised mid-sprint | Iceboxed, never started. | No |

## Decisions

| Decision | Record | Approver |
|---|---|---|
| Resolve academic levels by roster name, not numeric code. Renumbering the constants and a honey-jar mapping were both rejected. | **No record** | Unrecorded |
| Merge the pilot rather than keep it quarantined. The gate was met, not waived. | [PR #604 review checklist](https://github.com/String-dxd/my-sec/pull/604) | Victor and Ralph |
| Cover primary only for empty and error states. The secondary narrative criterion was removed. | [#597](https://github.com/String-dxd/my-sec/issues/597) | Darren |
| Expire surveys differently for primary and secondary, because prior answers mean different things. | [PR #613](https://github.com/String-dxd/my-sec/pull/613) | Unrecorded |
| Use Artillery rather than the Locust that #626 specifies. Locust or K6 is a later decision. | [#626 comment](https://github.com/String-dxd/my-sec/issues/626) | Ralph |
| Leave OTEL in review and pass ownership on. Whether MySEI needs tracing is undecided. | **No record** | Unrecorded |

## Risks handed over

| Risk | Issue | Owner |
|---|---|---|
| The app cannot serve real primary students. `requirePrimaryStudent()` 403s every P4 to P6 student in production. | [#640](https://github.com/String-dxd/my-sec/pull/640) | Squad Charlie |
| Key personnel at pilot schools see PRE-U classes labelled Primary 6. River Valley High has two surveys already published there. | [#641](https://github.com/String-dxd/my-sec/pull/641) | Squad Charlie |
| Production autoscaling cannot fire. CPU plateaus at 58% against a 75% target, so it stays at three tasks. | **No issue** | Unassigned |
| The load test findings live on a PR comment. Anyone planning from the issue list will not find them. | **No issue** | Unassigned |
| The load test is closed-loop, so it measures degradation over time. Nobody has measured capacity. | [#626](https://github.com/String-dxd/my-sec/issues/626) | Unassigned |
| `student_responses` has no foreign key to `survey_responses`. Orphaned rows double-count in the staff Insights dashboards. | **No issue** | Unassigned |
| Dev has drifted from its terraform. It ran at `cpu = 2048` against a committed `256`. A future apply undoes it. | **No issue** | Unassigned |
| PR #635 has merge conflict markers committed in `tests/load/README.md`. The two sides disagree about credentials. | [PR #635](https://github.com/String-dxd/my-sec/pull/635) | Ralph |
| Four high-severity CVEs are unpatched with the pilot approaching. Two Next.js advisories are reachable from the request path. | [#622](https://github.com/String-dxd/my-sec/issues/622) | Unassigned |
| Internal testing never started, and nothing records why it slipped. The next squad inherits both. | **No issue** | Unassigned |
| Primary and secondary disagree on partial submissions. A student moving between flows meets different rules. | **No issue** | Unassigned |
| #590, #541 and #476 are closed but still read `status: review`. A label-driven board disagrees with the repository. | **No issue** | Unassigned |
| Nine of ten competencies remain on interim banding, with no logging, no CI guardrail, and no `[TBD]` marker. | **No issue** | Unassigned |
| `require-primary-survey.ts` and the pilot kill-switch have no unit tests. Both were flagged HIGH and merged. | [#587](https://github.com/String-dxd/my-sec/issues/587) | Unassigned |
