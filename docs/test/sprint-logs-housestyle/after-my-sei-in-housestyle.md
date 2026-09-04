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

**Sprint:** Tue 18 Aug → Mon 31 Aug 2026
**Workstream:** MySEI: [`String-dxd/my-sec`](https://github.com/String-dxd/my-sec)
**Squad:** Charlie
**Sprint goal:** MySEI primary pilot readiness
**Goal met:** Partly. The pilot merged and the TRA findings closed, but internal testing never started and load testing has no environment to run in.

## Who worked on it

Squad Charlie held this workstream, alongside TCI.

* Chee Yang / [@cheellipadi](https://github.com/cheellipadi) / `teh_chee_yang` (GitLab): Squad Lead
* Darren Lee / [@darrenlee-dxd](https://github.com/darrenlee-dxd): designer
* Jerome Ke / [@jeromekejh](https://github.com/jeromekejh) / `junhao_ke_from.tp` (GitLab)
* Victor Loh / [@vlwk](https://github.com/vlwk) / `victor_loh1` (GitLab)
* Yong Quan / [@yongggquannn](https://github.com/yongggquannn) / `yong_quan_tan2` (GitLab)
* Ralph / [@santosral](https://github.com/santosral): joined from the Professional Learning space for this sprint

Ralph joined for this sprint only, so that capacity does not carry into the next one. Nobody
left permanently, but two people were away for much of the second week. Victor was on
reservist training from 21 to 28 August, and Ralph was on leave from 26 to 28 August.

That is roughly two engineer-weeks out of a fortnight, and it lands squarely on why OTEL and
the load test both stopped where they did. Victor owns the OTEL work and Ralph the load test.

Charlie held two assigned workstreams this sprint, MySEI and TCI, against the one the
[engineering operating model](../../../engineering-operating-model.md) assigns. MySEI took
most of the capacity and all of Ralph's. Yong Quan worked almost entirely on TCI, which is
why his name appears here only on the copy import. FSBB got reserve time only and has its
own log.

**The squad ran this sprint closer to kanban than to a fixed sprint commitment.** Deadlines
were tight enough that urgent work started the day it appeared rather than waiting for the
next Sprint Planning. That is a deliberate choice, and it shows in the numbers: seven of the
issues in flight at the end of the sprint were created after it began.

It bought speed on the level-code blocker, which was found and half fixed within four days.
It cost predictability, because the sprint commitment stopped describing the work partway
through. That is why the section below separates what spilled from what was inserted.

Unlike last sprint, a reserve was committed and spent. That closes one of the three
operating-model departures the 4 to 17 Aug overview recorded. Velocity is still not
measured, so the 80/20 split remains a judgement rather than a calculation.

## What was done this sprint

Everything below merged to `main`, which is what deploys dev. Last sprint's quarantine
branch is gone.

**The primary-school pilot left quarantine.**
[#590](https://github.com/String-dxd/my-sec/issues/590) (`sp:13`) closed via PR
[#604](https://github.com/String-dxd/my-sec/pull/604), which merged `pri-sch-pilot` into
`main` on 21 Aug at 13,373 insertions across 152 files. The branch has since been deleted.

That resolves the single largest risk the 4 to 17 Aug log recorded: the whole pilot sat
unreviewed and untested on a side branch behind an explicit merge gate. The gate was
satisfied rather than bypassed. The PR carries a completed review checklist split between
Victor and Ralph, covering auth and gating, profile, narrative, dashboard, the survey page,
the assignment flow and the survey wizard, with recorded walkthroughs against each.

**The TRA findings are closed on the application side.** PR
[#603](https://github.com/String-dxd/my-sec/pull/603) landed R01, R04, R11 and R15 from the
13 Aug threat risk assessment.

R15 was the likely blocker. Pino had no `redact` option while 11 call sites logged `uinfin`,
all on error paths hit in ordinary operation. NRIC was therefore accumulating in CloudWatch,
whose access scope is wider than the database's. Redaction alone had holes, because
`fast-redact` matches whole key names and left `studentUin` and `publisherUin` uncovered, so
the fix works in two layers.

The other three: R01 verifies roster response identity before deriving scope, R11 gates mock
login on `APP_ENV` as well as `CI`, and R04 drops `allow-top-navigation` from the Superset
iframe sandbox.

Read the merge, not the PR body, on this one. The body says it deliberately targets
`pri-sch-pilot`, and that was true when it was written. #604 merged three hours earlier, so
#603 was retargeted and went to `main`.

**The MP/UP selection screen shipped.**
[#541](https://github.com/String-dxd/my-sec/issues/541) (`sp:3`) closed via PR
[#612](https://github.com/String-dxd/my-sec/pull/612). This is the item that spilled from
the 4 to 17 Aug sprint having never started. It was blocked on Guidance Branch for five
weeks and bounced between backlog and sprint five times. It was unblocked at the end of that
sprint and delivered in this one. The PR adds `survey-type-selector.tsx` and reworks the
staff assignment action bar, header, wizard and checkbox group.

**A survey replay hole is closed.** PR
[#613](https://github.com/String-dxd/my-sec/pull/613) enforces expiry inside
`persistSurveyResponses`. `requirePrimarySurvey` applied the assignment window on all five
wizard pages and was called from nowhere else, so the submit action re-checked only school,
class and academic year.

A server action is directly invocable. A student who loaded the wizard before the window
closed could therefore replay the POST afterwards and have a full response set written and
banded into their profile.

The guard splits by flow, because prior rows mean different things either side. Secondary
writes answers as the student goes, so they signal a survey in progress and stay open.
Primary holds answers in sessionStorage and writes once, so expiry closes it outright. This
tightens the live secondary path too, which is the part that needed sign-off.

**The P5 population is now selectable with one filter.**
[#591](https://github.com/String-dxd/my-sec/issues/591) (`sp:2`) is half delivered by PR
[#617](https://github.com/String-dxd/my-sec/pull/617), which mirrors the survey's
`academic_level_override` onto each row of `student_responses`.

`academic_level` was overloaded: a P4 row is also `MIDDLE_PRIMARY`, so an analyst filtering
on `academic_level = 'MIDDLE_PRIMARY'` silently pulled P4 responses into a P5 population.
The value is copied rather than re-derived, since re-deriving would resolve P4 to
`MIDDLE_PRIMARY` too and lose the distinction the column exists to make. The migration is
additive with no backfill, because production holds no primary responses. The Superset half
landed too: MySEI's Superset dev instance now reads the override column, so #591 closed
whole on 26 Aug.

**403 and 404 render in place.** Issue
[#476](https://github.com/String-dxd/my-sec/issues/476) is closed, delivered by PR
[#631](https://github.com/String-dxd/my-sec/pull/631). Both were reached with `redirect()`,
which answers 200 and moves the browser, so the URL changed and no 403 existed anywhere in
the application to observe. `redirect('/not-found')` was wrong twice over, since
`/not-found` is not a route and only rendered `not-found.tsx` incidentally, by landing on a
path nothing matches. All 13 render-path sites now throw `forbidden()` or `notFound()`.

**Primary narrative art is per band.** PR
[#639](https://github.com/String-dxd/my-sec/pull/639) renders growth-tip art that varies by
band rather than a single asset.

### What changed shape along the way

The pilot merge changed what the level code problem means. While the work sat on
`pri-sch-pilot` it was a dev-only concern. On `main` it is the thing standing between the
app and production, and it was found by running the adoption report against production
rather than by review. See the spilled item below.

Empty and error states were cut back mid-sprint. #597 was scoped to primary only, after
Darren confirmed secondary was out of scope. Its text-only secondary narrative criterion was
dropped from the issue rather than left to imply work that will not happen.

Load testing changed shape three times. It began as a scheduling problem. It became an
environment problem once Guidance Branch took dev for testing and Superset visualisation.
It ended as a findings problem: two runs on 26 Aug produced a result that mattered more than
the test itself, and it took a further analysis pass to see what it meant. The tool changed
too, from the Locust the issue specifies to the Artillery the PR delivers.

## Reserve work

| Item | What it did |
| --- | --- |
| [#616](https://github.com/String-dxd/my-sec/pull/616), closing [#615](https://github.com/String-dxd/my-sec/issues/615) | Lint, format and unit-test checks now run on CI. |
| [#621](https://github.com/String-dxd/my-sec/pull/621) | Primary images cut from 9.32 MB to 281 KB, a 33x reduction. |
| [#614](https://github.com/String-dxd/my-sec/pull/614) | `prisma generate` added to the console container build. |

The image work is worth more than its one line. Images took seconds to appear on dev, and a
3.5s cold start against a 55 KB payload showed the cost was origin compute rather than
delivery: sharp decoding oversized PNGs on a 0.25 vCPU task, with a cache that empties on
every deploy.

Several assets were 5 to 13 times oversized, one at 1254x1254 for a 96 pixel slot. They
moved to `src/assets/primary/` as static imports, so they serve from `/_next/static/media/`
with immutable caching instead of `public/`, which forces `max-age=0`.

The change that moved the numbers was adding `sizes` to every `fill` usage, because there
were none. Next defaulted to `100vw`, so the browser fetched `w=1920` variants for slots a
few hundred pixels wide.

## What spilled

Two different things are unfinished at the end of this sprint, and conflating them would
misrepresent both. Work committed at Sprint Planning that did not finish is spillage. Work
raised after 18 August that did not finish was never in the commitment, carries no points,
and is where the kanban approach above shows up. Both are listed, separately.

### Committed at Sprint Planning, unfinished

**Internal testing never started.** It is behind schedule, and there is no branch, no draft
and no issue in progress against it. Nothing was descoped to make room for it. This is the
largest gap in pilot readiness that the sprint did not close, and it has no artefact of any
kind to hand over.

**Empty and error states, draft, blocked on assets.**
[#597](https://github.com/String-dxd/my-sec/issues/597) (`sp:3`) was raised on 11 Aug and
moved into this sprint on 18 Aug. PR
[#638](https://github.com/String-dxd/my-sec/pull/638) covers all four primary student routes
and all five survey form routes. One thing holds it in draft: the illustrations ship as 1.7
MB of raster SVG. It is rebased onto #621, so it also carries the static asset migration. It
does not need re-estimating, because the remaining work is asset optimisation, not design.

**Load testing, planned as a spike and still unresolved.**
[#583](https://github.com/String-dxd/my-sec/issues/583) was raised on 3 Aug and has now been
open across three sprints. It is in review. Its state, and the results of the one run that
happened, are below under the work it spawned.

**Pilot content, in progress.** [#585](https://github.com/String-dxd/my-sec/issues/585)
(`sp:3`, raised 3 Aug) tracks stakeholder content arriving.
[#525](https://github.com/String-dxd/my-sec/issues/525) (`sp:2`, raised 16 June) tracks the
copy import. Upper Primary survey questions are confirmed; Middle Primary questions were due
28 Aug. Both are gated on people outside the squad, so re-estimating them will not move them.

### Raised mid-sprint, unfinished

None of the following was committed at Sprint Planning. All of it started because it was
judged urgent enough not to wait.

**Academic level codes do not match production. This blocks the pilot.** PRs
[#640](https://github.com/String-dxd/my-sec/pull/640) and
[#641](https://github.com/String-dxd/my-sec/pull/641) are both open, with #641 stacked on
`fix/adoption-level-names` and needing a retarget to `main` once #640 merges.

`AcademicLevelCode` maps primary levels to `39`, `40` and `41`. That mapping came from
honey-jar's local mock seed,
`docker/sc-database/migrations/20260408021743_seed_level_and_school.sql`, which is the only
statement that ever populates `cp_arch_level`. It was never production's code book.

Running the adoption report against production settled it: `11` to `16` are P1 to P6, `31`
to `35` are S1 to S5, `41` to `43` are PRE-U 1 to 3, and `61` to `62` are K1 and K2. Codes
`36` to `40` do not exist.

Three consequences, all live:

* `requirePrimaryStudent()` 403s every P4 to P6 student in production.
* `getStudentLandingPath()` can never reach `/student-primary`.
* A pilot school's level `41` classes are offered to key personnel as "Primary 6", and River
  Valley High already has two surveys published to `26J07`, a PRE-U 1 class.

An earlier adoption run also labelled all 22 junior colleges, Millennia Institute and the IP
schools as P6, with correct counts and a wrong label.

State: in review, no blocker outstanding, and it does not need re-estimating. The approach
is settled, which the decisions section records.

**OpenTelemetry, in review and possibly unnecessary.** PR
[#629](https://github.com/String-dxd/my-sec/pull/629) closes
[#624](https://github.com/String-dxd/my-sec/issues/624) and instruments the Next.js request
lifecycle, outbound Honey Jar GraphQL calls and Prisma queries over OTLP/gRPC. Its collector
is [#625](https://github.com/String-dxd/my-sec/issues/625), an ADOT sidecar with X-Ray
export, which is draft infra MR
[!662](https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/dxd-transform-infrastructure/-/merge_requests/662).
Both stalled on 24 and 25 Aug, when Victor went on reservist training, and both are still
iceboxed.

The framing to carry forward: OTEL is a prerequisite for a *useful* load test, not a gate on
the pilot. Both issues are children of the load-test spike #583, and #624 says as much.
Artillery measures from outside and can say p95 went to 763 ms. It cannot say where the time
went. Traces would separate the app from honey-jar and the database, which is what turns a
re-run into an answer.

Two caveats. #624 alone only wires local development, so a deployed run needs the ADOT
sidecar in #625, which is the bigger lift because it crosses into another team's repository
and three AWS accounts. And tracing would not have confirmed the event-loop diagnosis on its
own: event-loop delay is a metric, and #625 scopes ADOT to X-Ray traces with no metrics
path. The 26 Aug runs reached that diagnosis without either, from the CPU plateau and the
latency curve.

So the decision left open is whether to pull #624 and #625 forward before the next load test,
or accept another externally-measured run. Decide before merging, rather than merging and
then deciding.

**Load testing ran twice on 26 Aug and produced the most important finding of the sprint.**
PR [#635](https://github.com/String-dxd/my-sec/pull/635) is a draft for
[#626](https://github.com/String-dxd/my-sec/issues/626), raised 23 Aug under spike
[#583](https://github.com/String-dxd/my-sec/issues/583). Two runs an hour apart, each about
ten minutes, 480 virtual students looping the primary survey journey ten times each. Roughly
13 server requests per journey, 4,757 successful submissions out of 4,800, request failures
at 0.07%.

None of what follows was captured at the time. It was worked out in analysis after the runs,
and written up on
[PR #635](https://github.com/String-dxd/my-sec/pull/635#issuecomment-5474013115) on 31 Aug,
the last day of the sprint. That comment and this log are the two records; #626 and #583
still show no results.

What the runs showed, at a flat ~93 RPS throughout:

| Measure | Start of run | End of run |
| --- | --- | --- |
| CPU utilisation | ~58% | ~58% |
| Memory utilisation | ~31% peak | ~31% peak |
| p50 latency | 179 ms | 247 ms |
| p95 latency | 587 ms | 763 ms |
| 503 responses | 3 | 20 |

Latency degraded by roughly 35% while throughput never moved and CPU never rose. That
signature is a single saturated thread. `node server.js` runs one JS event loop, so the app
can only use about 1.16 of the task's 2 vCPU no matter what it is given. CPU utilisation
plateaus at 58% because that is the ceiling of one thread, not because there is headroom.

**The consequence is that production autoscaling can never fire.** The prod app service sets
`autoscaling_min_capacity = 3` and `max = 6` with no explicit policies, so it inherits the
module default: target tracking on `ECSServiceAverageCPUUtilization` and
`ECSServiceAverageMemoryUtilization`, both at 75%. CPU tops out at 58% and memory at 31%, so
neither threshold is reachable.

Production is pinned at three tasks, the 3-to-6 range is decorative, and latency will degrade
exactly as it did in the test while every alarm reads nominal. This is a configuration
change, not an engineering project, and it is the highest value item to come out of the
sprint.

**The test is a soak test being read as a capacity test.** It uses a closed loop:
`arrivalCount: 480` with think times, so 480 students on a ~5.1 second cycle produce ~93 RPS
by arithmetic. The server has no vote. If the app got twice as slow, the headline number
would fall by about 5%, so this design cannot find a ceiling. It answers "does it degrade
over time", which it did. It cannot answer "what can it take". Converting it needs an
open-loop ramp, `arrivalRate` with `rampTo`, and shorter think times.

Four things qualify the numbers, and the next squad needs all four before quoting them:

- **Dev has drifted from its terraform.** The runs used a task at `cpu = 2048, memory = 4096`.
  Committed dev config is `cpu = 256, memory = 512` with `autoscaling_max_capacity = 1`.
  Someone hand-scaled dev for the test and it was never put back in code.
- **Production serves secondary, not primary.** `PRI_PILOT_ENABLED` is `false` in prod. The
  journey tested is roughly 13 server requests; a secondary journey is 4 to 5, with a
  different cost per request. The RPS figures do not convert between the two flows.
- **The 300 RPS target is a worst case, not a requirement.** It is the whole pilot cohort,
  1,680 students across seven schools, submitting simultaneously. A realistic peak is 50 to
  60 RPS, which one task already handles. Confirm with whoever set the figure, because the
  urgency of the whole capacity conversation depends on the answer.
- **Nothing tested the database.** Prod RDS is `db.t3.large`, burstable with a 30% CPU
  baseline that drains credits above it. The runs used dev with the roster mocked, so DB
  load was near zero.

Suggested next steps, in order:

1. Set the CPU autoscaling target to 45% as an immediate low-risk fix.
2. Then move to `ALBRequestCountPerTarget` at roughly 3000, with `max_capacity` raised to 10.
   Six tasks at 3000 is exactly 300 RPS with no headroom.

Both are infrastructure changes and need the DevOps team.

Note that #626 specifies Locust and PR #635 delivers Artillery, in
`tests/load/primary-pilot/` with YAML scenarios. Ralph chose Artillery for setup speed and
recorded on the issue that Locust or K6 is a later decision. The issue title was never
updated, so read the PR rather than the issue.

The environment problem also stands. Dev is the only place to run this, and Guidance Branch
is using it for testing and Superset visualisation, so repeat runs disrupt them.

**UAT support, in progress across two repositories.** PR
[#643](https://github.com/String-dxd/my-sec/pull/643) is a draft adding four key-personnel
testers to the seed. `getStaffAccessRole` looks key personnel up by uinfin. Without those
rows the testers fall through to the form-teacher path, and the key-personnel scenarios
cannot be exercised at all.

honey-jar MR
[!103](https://sgts.gitlab-dedicated.com/wog/moe/dxdtransform/dxd-transform/honey-jar/-/merge_requests/103)
is the other half, also draft. The School Cockpit mock cycles the same ten teachers across
P4 to P6 at Transform Primary School, and `GetClassByStaff` matches on either form teacher
column. So a P6 tester currently sees the P4 testers' assignments, and the levels cannot be
tested independently. [#645](https://github.com/String-dxd/my-sec/issues/645) records the
full set of reasons dev cannot support the tester plan, and is still iceboxed.

**Security updates, not started.**
[#622](https://github.com/String-dxd/my-sec/issues/622) covers four high-severity Next.js
CVEs, two of which are reachable in MySEI, plus the libvips advisory behind sharp. It is
labelled `priority: high` and sits in `status: backlog`, unassigned. Nothing in flight
touches it. Raised 23 Aug.

Three more were raised and iceboxed without being started:

* [#611](https://github.com/String-dxd/my-sec/issues/611), scoping the student survey list
  by academic level.
* [#637](https://github.com/String-dxd/my-sec/issues/637), running the Firefox e2e project
  on Firefox rather than Chromium.
* [#644](https://github.com/String-dxd/my-sec/issues/644), bumping adm-zip for
  CVE-2026-39244.

## Decisions and their reasons

**Academic levels are resolved by roster name, not numeric code.** Level `39` in dev and
level `14` in production are both P4, so reading the name makes one build correct in both
environments, with no data migration and no honey-jar change.

Two alternatives were rejected. Renumbering the constants to `14`, `15` and `16` fixes
production and breaks dev, which stays on `36` to `41`; no single set of codes is correct in
both. Having honey-jar expose a level mapping does not help either, because MySEI does not
know which codes correspond to which levels and would still have to match by name.

Names were also chosen for type safety. The ideal fix remains taking the codes from
production directly, so this is recorded as tech debt rather than a finished answer.

**The pilot merged rather than staying quarantined.** The 4 to 17 Aug log set the gate as
review and testing by an engineer, because most of the pilot was vibe-coded, largely by a
designer. The gate was met through the review checklist on #604 rather than waived.

**Empty and error states cover primary only.** Confirmed with Darren mid-sprint. #597 was
edited to record it, including removing the secondary narrative criterion, so the issue does
not imply work nobody intends to do.

**The survey expiry guard behaves differently for primary and secondary,** because prior
answers mean different things in each flow. That is deliberate, and it leaves an asymmetry
worth revisiting. See the risks.

**OTEL ownership passes to the next squad.** No decision was made on whether MySEI needs
distributed tracing. The PR and its infra MR are both left in review rather than merged, on
the assumption that they will be wanted.

## Known risks and traps

1. **The app cannot serve primary students in production.** Until #640 and #641 merge,
   `requirePrimaryStudent()` 403s every P4 to P6 student, and key personnel at pilot schools
   are shown PRE-U classes labelled as Primary 6. Two surveys are already published to a
   PRE-U class at River Valley High. This is the first thing to land next sprint.

2. **Production autoscaling cannot fire, and the pilot is what will expose it.** Min 3, max
   6, target tracking at 75% CPU and 75% memory, against an app that plateaus at 58% and
   31%. Fixing the target is a config change and should go in before anything else. The
   measurements are under "Load testing" above.

3. **The load test findings live on a PR comment and in this log, not on the issues.** They
   were written up on
   [PR #635](https://github.com/String-dxd/my-sec/pull/635#issuecomment-5474013115) on the
   last day of the sprint. #626 and #583 still show a draft PR and no results, so anyone
   planning from the issue list will not find them. Two consequences: the autoscaling and
   foreign-key items need their own issues rather than staying buried in a review thread,
   and if #635 is closed unmerged the comment goes with it.

4. **The load test cannot answer the question it is being asked.** It is closed-loop, so
   throughput is set by the think times and the virtual user count, not by the server. It is
   quoted as "93 RPS at 58% CPU", which reads as a capacity measurement and is not one.
   Nobody has yet measured what the app can take.

5. **`student_responses` has no foreign key to `survey_responses`.** Deleting from the source
   table leaves the reporting rows behind, and they keep being counted. This was found the
   hard way: 28,355 orphaned rows across 474 students, from an earlier load test run, were
   silently double-counting in the staff Insights dashboards. The cleanup is done and both
   tables now reconcile 1:1 at 29,654 rows, but nothing prevents a recurrence. It is a live
   defect on a reporting path, not a test artifact, and it needs an issue and an
   `ON DELETE CASCADE`.

6. **Dev has drifted from its committed terraform.** Dev ran the load test at
   `cpu = 2048, memory = 4096` while its terragrunt says `256` and `512`, with a max of one
   task. Whoever resized it did not put it back in code, so the environment and the
   repository disagree, and a future apply would silently undo it.

7. **PR #635 has unresolved merge conflict markers committed in `tests/load/README.md`, and
   the two sides disagree about credentials.** One says `config/base.yml` is gitignored and
   holds live cookies. The other says it is committed with placeholders. The `.gitignore`
   change in that PR only covers `reports/*.json`, so `base.yml` is **not** ignored. Anyone
   following the first instruction could commit a live TechPass session. Resolve before
   merging.

8. **#626 asks for Locust and PR #635 delivers Artillery.** Anyone planning from the issue
   title will expect a Python Locust suite and find YAML scenarios under
   `tests/load/primary-pilot/`. The choice was deliberate and is explained in a comment on
   the issue, but the title was never corrected.

9. **Four high-severity CVEs are unpatched with the pilot approaching.** #622 is
   `priority: high`, unassigned, and in backlog. Two of the four Next.js advisories are
   reachable from the request path.

10. **Internal testing never started.** Nothing was descoped to make room for it, and nothing
    records why it slipped, so the next squad inherits both the work and the unexplained
    absence.

11. **Primary and secondary disagree on partial submissions.** Secondary allows them and
    primary does not. Both behaviours are deliberate and neither is wrong on its own, but a
    student moving between the two flows meets different rules, and no issue tracks
    reconciling them. Worth a decision before the pilot widens rather than after.

12. **Three closed issues still read `status: review`.** #590, #541 and #476 are all
    completed. A board driven by labels disagrees with the repository, so plan from this log.

13. **Nine of ten competencies remain on interim banding.** Carried forward unchanged from
    the 4 to 17 Aug log. Only Emotion Regulation has published thresholds; the rest use
    interim quartile cuts with no logging, no CI guardrail and no `[TBD]` marker on the
    profile page. Nothing this sprint addressed it, and the pilot merging to `main` widens
    who can see it.

14. **Two security-critical paths still have no unit tests.** Also carried forward.
    `require-primary-survey.ts` and the pilot kill-switch in `create-survey.ts` were flagged
    HIGH in the #587 audit and merged anyway. They are now on `main` rather than on a
    quarantined branch.

15. **Darren's GitLab merge requests were not searched.** His GitLab username is unknown, so
    the GitLab evidence behind this log covers Chee Yang, Victor, Yong Quan and Jerome only.
    If he opened any, they are missing here.
