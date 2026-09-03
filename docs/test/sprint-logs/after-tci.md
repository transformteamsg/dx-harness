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

**Sprint:** Tue 18 Aug → Mon 31 Aug 2026
**Workstream:** TCI dashboard: [`transformteamsg/wellbeing-viz`](https://github.com/transformteamsg/wellbeing-viz)
**Squad:** Charlie
**Sprint goal:** Term 4 dashboards ready before the 14 Sep go-live
**Goal met:** Yes for the main Term 4 content. All four dashboards are deployed to staging and under test. The hurtful behaviour tabs, which augment those same dashboards, move to the next sprint.

## Who worked on it

Squad Charlie held this workstream, alongside MySEI.

* Chee Yang / [@cheellipadi](https://github.com/cheellipadi) / `teh_chee_yang` (GitLab): Squad Lead
* Darren Lee / [@darrenlee-dxd](https://github.com/darrenlee-dxd): designer
* Jerome Ke / [@jeromekejh](https://github.com/jeromekejh) / `junhao_ke_from.tp` (GitLab)
* Victor Loh / [@vlwk](https://github.com/vlwk) / `victor_loh1` (GitLab)
* Yong Quan / [@yongggquannn](https://github.com/yongggquannn) / `yong_quan_tan2` (GitLab)
* Ralph / [@santosral](https://github.com/santosral): joined from the Professional Learning space for this sprint

Ralph joined for this sprint only and worked on MySEI, not here. Nobody left permanently.
Victor was on reservist training from 21 to 28 August, and Ralph was on leave from 26 to 28
August. Neither absence touched TCI, because neither of them worked on it. It cost MySEI
instead, which is where the effect is recorded.

In practice Yong Quan carried the Term 4 dashboard build. Chee Yang carried the tooling and
the two lower-primary dashboards. Charlie's other assigned workstream was MySEI, which took
the larger share of the squad. FSBB got reserve time and has its own log.

The squad ran this sprint closer to kanban than to a fixed commitment, starting urgent work
as it appeared rather than holding it for the next Sprint Planning. On TCI that shows up as
the two lower-primary dashboards, raised and delivered inside the sprint against a fixed
go-live date.

This is a reversal worth stating. The 4 to 17 Aug TCI log opened with "Nothing was
delivered", after TCI was named in that sprint's goal and then set down. This sprint it was
a full assigned workstream and closed eight issues.

## What was done this sprint

Everything merged to `main`. Twenty-one story points of planned work closed, plus three
unpointed issues added mid-sprint.

**All four Term 4 dashboards reached staging.** For Upper Primary, the epic
[#17](https://github.com/transformteamsg/wellbeing-viz/issues/17) broke into four pieces:

* [#18](https://github.com/transformteamsg/wellbeing-viz/issues/18) (`sp:2`) scaffolded the
  Term 4 tab structure and the hurtful behaviour placeholders.
* [#19](https://github.com/transformteamsg/wellbeing-viz/issues/19) (`sp:5`) built Students
  to Prioritise and populated the term columns.
* [#21](https://github.com/transformteamsg/wellbeing-viz/issues/21) (`sp:8`) built the Main
  TCI charts.
* [#20](https://github.com/transformteamsg/wellbeing-viz/issues/20) (`sp:3`) built the Main
  TCI Survey responses and For download tabs, via PR
  [#27](https://github.com/transformteamsg/wellbeing-viz/pull/27).

A Year Head opening either of the last two saw a blank tab before that. They now behave as
Terms 1 to 3 do: every student's twelve Term 4 answers, multi-select bulleted, free text
quoted, concerning options in red, and the names flagged on Students to Prioritise carrying
their priority colour across. That PR also fixed `TCI_P5_P6_Term4Data`, whose final SELECT
had dropped `responses`, so no question column could read an answer at all.

[#22](https://github.com/transformteamsg/wellbeing-viz/issues/22) (`sp:3`) populated the
Term 4 column on Risk and protective factors across terms, via PR
[#30](https://github.com/transformteamsg/wellbeing-viz/pull/30).

The two lower-primary dashboards were added mid-sprint and carry no points.
[#24](https://github.com/transformteamsg/wellbeing-viz/issues/24) and
[#25](https://github.com/transformteamsg/wellbeing-viz/issues/25) shipped as PRs
[#28](https://github.com/transformteamsg/wellbeing-viz/pull/28) and
[#29](https://github.com/transformteamsg/wellbeing-viz/pull/29), giving P1 to P2 and P3 to
P4 their Term 4 tabs. Both are **unplanned**.

**The dashboards are now under version control.** Epic
[#26](https://github.com/transformteamsg/wellbeing-viz/issues/26) closed via PR
[#23](https://github.com/transformteamsg/wellbeing-viz/pull/23), 68,764 lines across 360
files, merged 25 Aug. `main` was an empty root commit before it, so that PR is the whole
project. It captures the four live dashboards as Superset exports under
`superset/dashboards/`, covering layout, chart configs, dataset SQL and database connection.
It also adds a CLI that moves them between the repo and Superset. Dashboard changes become
reviewable diffs instead of clicks in a UI.

The structure matters for anyone extending it. `scripts/superset_cli.py` is a 13-line entry
point over `supersetlib/`, and imports run strictly downward through `plans.py`,
`bundles.py`, `api.py`, `deploy.py`, `commands.py` and `console.py`.

`plans.py` is dependency-free by design, because it holds every decision that can destroy
live work: UUID rewriting, the apply denylist, the delete cascade, cross-filter remapping
and the port mapping. Keeping it pure is what makes 116 offline tests possible with no
Superset and no credentials. The reasoning lives in `DECISIONS.md` as numbered ADRs that the
code points at, and the numbers are append-only. The workflow runs through `make`: pull,
fork, apply, review in Superset, then port.

PR [#31](https://github.com/transformteamsg/wellbeing-viz/pull/31) then made `make fork`
create the sandbox published rather than as a draft. Under Superset's
`DashboardAccessFilter` an unpublished dashboard is visible to its owners only, and fork
names exactly one owner, whoever ran it. So the reviewer the sandbox exists for got nothing.
The author had to publish by hand before every review, with nothing enforcing or recalling
that step. It was missed on #22's sandbox until the reviewer needed it, which is what
prompted the fix.

### What changed shape along the way

**Half this sprint's dashboard work has no repository trace, and half does.** #18, #19 and
#21 closed on 21 and 24 August with no pull request, because they were built directly in
Superset before the tooling existed. #23 merged on 25 August, and every dashboard change
after it went through a bundle diff. The dividing line is that merge. Anyone auditing what
changed in the first week has to read Superset, not the repo.

**The scope grew by two dashboards.** P1 to P2 and P3 to P4 were not in the sprint at the
start. They were added and delivered without estimation, which is where some of the
unmeasured capacity went.

**A dashboard facelift was explored outside the sprint.** Roughly 5 to 10 minutes of
thinking and 30 minutes of agentic work produced a demonstration of how much the Superset
dashboards' look and feel could improve. It was not sprint work, produced no issue and no
PR, and exists only in this log. It is recorded because it changes what is worth asking for
next: the visual quality of these dashboards is no longer expensive to move.

## Reserve work

| Item | What it did |
| --- | --- |
| [#23](https://github.com/transformteamsg/wellbeing-viz/pull/23), closing [#26](https://github.com/transformteamsg/wellbeing-viz/issues/26) | Put the four live dashboards under version control and added the sync CLI. |
| [#31](https://github.com/transformteamsg/wellbeing-viz/pull/31) | Made `make fork` publish the sandbox so reviewers can open it. |

The version-control work was committed as reserve and is by far the largest single item in
this log. Treating it as reserve is defensible, since it is tooling in the squad's own
domain rather than dashboard delivery. It still consumed more than a fifth of the sprint on
any reading. Worth naming at the next retrospective rather than repeating by accident.

## What spilled

Everything here was committed at Sprint Planning. The work raised mid-sprint on TCI, the two
lower-primary dashboards, all shipped, so nothing carries over from it.

**[#1](https://github.com/transformteamsg/wellbeing-viz/issues/1) tab restructure (`sp:2`)
and [#13](https://github.com/transformteamsg/wellbeing-viz/issues/13) FormSG feedback link
(`sp:1`) were dropped, not delayed.** Both spilled from the 4 to 17 Aug sprint unstarted,
and both moved from sprint to backlog on 18 August, the first day of this one. They were
never picked up.

State: not started, no branch, no draft, no design. #1 splits the dashboard into six tabs in
fixed order. It must render "Survey was not administered." on the two hurtful behaviour tabs
for schools that used the Term 4 form variant without the bullying questions. #13 adds a
feedback link to those same two tabs, and the link itself is still to be supplied by the
requesting stakeholder.

Neither is blocked by anything technical. **#1 remains the blocking dependency for ten other
issues in the epic**, so nothing else in that epic moves until it lands. Estimates on both
are from 4 August and have not been revisited across two sprints.

Re-estimate before committing. The dashboards they modify have changed underneath them: they
are now version-controlled bundles rather than live Superset objects, which changes how the
work is done even though the requirement is the same.

**[#17](https://github.com/transformteamsg/wellbeing-viz/issues/17), the Upper Primary Term
4 epic, is still open and in progress.** All four of its children closed. It stays open for
the hurtful behaviour tabs, which are the augmentation slated for next sprint.

## Decisions and their reasons

**Dashboards are version-controlled as Superset export bundles, synced by a purpose-built
CLI.** The alternative tools, `preset-cli` and `sup`, were considered and not used.
**The reason is not recorded anywhere, including in this log.** `DECISIONS.md` holds the
ADRs for choices made inside the tool, not the choice of building it. Whoever inherits this
should write that reason down before the question is asked again. The next person to meet it
will otherwise reopen it from scratch.

**`plans.py` stays dependency-free.** Every operation that can destroy live dashboards lives
there, and purity is what allows those operations to be tested without a live Superset. Do
not import `api.py` or `bundles.py` into it for convenience.

**Sandbox dashboards are created published.** Reviewability should not depend on the author
remembering a manual step, nor on the state of whatever was forked. Recorded as an
append-only decision in `DECISIONS.md` rather than as inline prose.

**#1 and #13 were moved to backlog rather than carried in the sprint.** They were
deprioritised in favour of Term 4, which has a fixed 14 September go-live. No reason was
recorded on either issue at the time.

## Known risks and traps

1. **Term 4 goes live on 14 September and the dashboards are only on staging.** They are
   under test, not signed off. That is the date the whole workstream is running against, and
   it falls inside the next sprint.

2. **The hurtful behaviour tabs do not exist yet.** #18 shipped placeholders. Schools using
   the Term 4 variant without the bullying questions must see "Survey was not administered."
   rather than an empty tab. That behaviour is specified in #1, which is in backlog. A Year
   Head opening a placeholder tab in production would see nothing explaining it.

3. **#1 blocks ten other issues and has been deprioritised twice.** It has now been set down
   in two consecutive sprints, with no reason recorded either time. The epic behind it
   cannot progress at all until it lands.

4. **The first week of dashboard work is invisible in the repository.** #18, #19 and #21
   closed before the version-control CLI merged, so their changes exist only in Superset.
   Reconstructing what changed means reading the live dashboards, not the git history. The
   captured bundles record the end state, not the path to it.

5. **Five closed issues still read `status: review`.** #20, #22, #24, #25 and #26 are all
   completed. A label-driven board will disagree with the repository.

6. **Dashboards still live in Superset, and the repo only knows what was pulled.** A change
   made directly in the Superset UI does not announce itself. The CLI makes drift
   detectable, but nothing prevents it, and nothing runs on a schedule to check.
