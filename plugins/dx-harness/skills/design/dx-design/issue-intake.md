# Issue-initiated intake (procedure)

Read this when the ask names a GitHub issue ("design issue #123") or arrives as a
pasted issue body, instead of a described goal. Feeds Phase 1's sprint contract;
everything downstream (Diverge, Plan, Implement, Verify) is unchanged — the issue
just supplies the raw material Phase 1 would otherwise pull from a conversation.

## Fetch and parse

Determine the input type:

- **Issue number** (e.g. `123`): attempt
  `gh issue view $ARGUMENTS --json number,title,body,labels,state,comments`.
  - `gh` not found, or fails with "command not found": ask the user to paste the
    issue body directly. Treat it as a pasted markdown body — there is no issue
    number to derive a branch name or a `Closes #NNN` line from.
  - Any other failure: surface the real error and stop.
- **Pasted markdown body**: use it directly. Same no-issue-number consequence as
  above.

**Check for a pre-loop design-routing flag before anything else.** If the fetched
issue carries the `needs-design-review` label or a "Design routing: needs designer
input before an engineer starts" line (written by `create-issue`'s or
`groom-issue`'s design-need triage step), surface it immediately, before Diverge —
put a structured question to the human: proceed solo anyway (record why), or switch
to hand-off mode ("Who implements this" below) so Plan and Implement route to a
designer instead of being carried through by an engineer alone. This is the coarse,
issue-level version of the finer-grained per-AC-scenario reviewer-routing table
below (Phase 3) — it has to run first, because Phase 3 is too late to change who does
Diverge and Plan. No flag on the issue means this step is silent; the Phase 3 table
still runs regardless.

From the body and comments, extract three things before doing anything else:

1. **Acceptance criteria scenarios** — the Given/When/Then blocks (`create-issue`'s
   template shape, `../../engineering/create-issue/issue-template.md`).
2. **Design assets** — screenshots, prototype links, Figma links named in the issue.
3. **Technical context** — any components or patterns already named during grooming
   (the implementer sections, if the issue went through `groom-issue`).

**Read the acceptance criteria before looking at any reference screenshot.** The AC
scenarios are the source of truth for what to design; a screenshot anchors visual
choices before you know what the scenario actually requires. Reversing this ordering
is what produced options built around a screenshot's incidental choices rather than
the stated outcome, in the skill this was ported from.

**Do not gate on a grooming checklist here.** An ungroomed issue is fine —
`tfx:design`'s own Phase 3 human gate (grill + structured approve/adjust) is the
enforcement point. Re-checking a generic checklist ahead of it, the way
`implement-issue` does, adds nothing here and inherits harness-feedback issue #10's
unresolved template mismatch.

## Still run "clarify the ask"

Run Phase 1's "Clarify the ask before you scope it" exactly as for a conversational
ask, even when the input is an issue. A PM-written issue names *what* to build, never
*which dimension* (visual/layout/UX/copy/compliance-only) or *how ambitiously*. Do
not skip the question because the issue looks specific — issues describe outcomes,
not scope of change.

## Who implements this

Before Diverge, establish whether the person running this loop will carry it through
to Phase 4 themselves, or is planning it for someone else to implement — infer it
when the framing already answers it (e.g. "design issue #123, I'll build it"), ask
only when genuinely unclear. Record the answer; it decides which structured ask
Phase 3 Stage 3 shows:

- **Solo**: Phase 3 Stage 3 is Approve / Adjust, as today.
- **Hand-off**: Phase 3 Stage 3 is Approve-and-hand-off / Adjust.

This question is not specific to issue-initiated runs — a conversational run with no
issue can be hand-off mode too (a designer planning for an engineer to build).

## Resuming an approved plan

Only treat a run as **resuming** a hand-off — skipping straight to Phase 4 with the
decision record's approved plan as fixed — on **explicit framing**: "resume design
issue #123", "implement the approved plan for #123". Naming an issue number alone
("design issue #123") always starts a fresh Phase 1, even when that issue already has
a decision record. Guessing wrong here would silently skip Intent/Diverge/Plan on a
run the user meant to revisit.

## AC scenario → E2E test mapping (feeds Phase 3's plan)

For each AC scenario, name the E2E test that will verify it: what it navigates to,
what it interacts with, what observable outcome it asserts. Write this into the plan
*before* implementation — it becomes a row in Phase 3's plan summary table ("AC
scenario → E2E test mapping"), not something discovered after the fact.

At Phase 4, each scenario gets its own E2E test asserting **user-observable
outcomes** (what appears on screen, what the user can do) — never implementation
details — committed together with the UI change for that scenario, not batched at
the end.

## Reviewer-routing (feeds Phase 3's plan and Phase 6's PR body)

Flag, per AC scenario, whether it needs a human designer's review before merge —
this is the piece with no prior `tfx:design` analog, and the part that actually
answers "can an engineer implement a PM-written UI issue without designer input":

| Criterion | Recommendation |
|---|---|
| New pattern not seen elsewhere in the codebase | Strongly recommended — route to designer |
| New user flow (not just a new component) | Strongly recommended — route to designer |
| Destructive or irreversible action | Strongly recommended — route to designer |
| Modification to existing UI with clear AC | Can defer — engineer reviews and ships directly |

This extends the validation-needs flagging Phase 3 already does for a CMP-1 waiver
(a new component not in the manifest) — the missing piece was turning that flag into
an explicit who-reviews-this-PR decision, written into the PR body and the decision
record rather than left implicit. Write the recommendation and its reason into both.

This flags for review; it does not schedule an actual user-test session — that
scheduling mechanism does not exist in atelier today, and building one is out of
scope here (an open question for a future, separate decision, not a side effect of
this loop).

## Branch (both solo and hand-off runs)

Create the branch right after Phase 3 approval — never before, since nothing durable
happens ahead of the human gate. Name it `<type>/<short-description>`, the same
convention `implement-issue` Step 4 uses (`<type>` matches the product repo's own
CLAUDE.md convention and the issue title's prefix): `<short-description>` is a
kebab-case summary of the issue title when one exists, or of the Phase 1 feature name
(CNT-2 already requires naming the feature in plain language) when the run started
from a conversation with no issue.

## On hand-off approval

1. If no GitHub issue exists yet for this plan, create one from the approved plan,
   reusing `create-issue`'s template shape
   (`../../engineering/create-issue/issue-template.md`) — Design assets carries the
   decision record and the chosen option; Technical context carries anything the
   plan already named; everything else follows the template's own N/A convention.
2. Add a status line to the decision record:
   `Hand-off: pending engineer implementation — issue #NNN, branch <name>`.
3. Report the issue and branch to the user. Phase 4 does not run in this session.

## On solo approval

Create the branch (above), then continue straight to Phase 4 in the same session.

## Designer walkthrough (feeds Phase 6's PR body)

Alongside the screenshots, give a reviewer with no engineering background a way to
see the change running, not just in stills. Two parts:

**A ready-to-paste setup prompt.** Fill in this repo's remote URL, the branch just
created, and the exact route/page this change touches, then include it in the PR
body as a fenced block — something a designer pastes into an AI coding assistant
(e.g. Claude Code) with no terminal commands typed by hand:

```
Set up and open this PR's changes for me to review.

1. Check whether this repository is already cloned somewhere on this machine. If
   so, cd into it, fetch, and check out the branch `<branch-name>`.
2. If it isn't cloned anywhere, create `/environment` if it doesn't already exist,
   clone `<repo-url>` into `/environment/<repo-name>`, and check out the branch
   `<branch-name>`.
3. Install dependencies and start the local dev server — read the repo's README or
   package.json scripts for the exact command; do not guess one that isn't
   documented there.
4. Once the server is running, open `<route>` in a browser — the exact page this PR
   changes.

Tell me the local URL once it's open, and flag anything that goes wrong at any step
rather than skipping it.
```

Never hardcode a dev-server command in this template — product repos differ (this is
why `DESIGN-CONTEXT.md`'s parameters stay per-repo too); the pasted-in agent reads
the target repo's own README/package.json at run time, and only falls back to
`/environment` when no existing clone is found anywhere else.

**A step-by-step test plan**, plain language, one entry per AC scenario in journey
order — what to click, what should appear, what would indicate a problem. This is
not the AC→E2E table (that is for the engineer); it is the same scenarios
translated for someone clicking through the running app instead of reading test
code. Pair each step with the screenshot(s) it corresponds to.
