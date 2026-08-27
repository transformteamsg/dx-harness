---
name: dx-code-review
description: Use when asked to review code changes — either posting findings as inline PR comments or running an interactive local branch review with optional report generation. Triggers on "review this", "give me feedback on", "review my changes", "review this PR", "post findings to PR", "add review comments to the pull request", or any request for a code review.
---

# Code Review

Reviews code changes using 7 structured angles across the diff. Posts findings as inline PR comments directly on GitHub, or runs an interactive triage session on a local working branch with optional report generation at the end.

---

## Mode Selection

**Before spawning a subagent**, ask the user:

> "Are you reviewing a PR or your local working branch?"
> - **PR** — if a PR link or number wasn't provided, ask for it now.
> - **Local branch** — proceed.

- **PR** → spawn a fresh subagent and pass it: this `SKILL.md`, [references/pr-review-path.md](references/pr-review-path.md), the selected mode, and the PR number. The subagent runs the PR Review Path from scratch — no user interaction is needed.
- **Local branch** → before doing anything else, explicitly state: *"Starting fresh local branch review — all prior session context discarded."* Then treat every subsequent step as if this were the first message in a new conversation: no prior analysis, no prior findings, no prior assumptions. Read [references/local-branch-review-path.md](references/local-branch-review-path.md) and run its Steps from step 1. (Interactive triage in step 4 means this path cannot run as a subagent.)

---

## The standard

A review exists to make a change better, not to make it perfect. Perfect is not on the table: there is only better code, and a review that holds out for more than better stops the work while teaching the author to expect that it will. The bar is whether the change leaves the system healthier than it found it.

Two things follow, and the severity table below is how they are expressed.

**Only an Important finding is ever blocking.** Everything else is a suggestion the author is free to decline without reply. A review that treats every observation as a requirement is indistinguishable from one that found something serious, and the author cannot tell which they are reading.

**This skill never issues a merge verdict.** It reports what it found and stops. "No blocking findings" is a statement about the findings; "good to merge" is a decision about the change, and that belongs to a person who is accountable for it. This is why the skill posts comments rather than approving or requesting changes.

## Severity Levels

| Level | Blocking | What it means |
|-------|----------|--------------|
| 🔴 **Important** | Yes | A bug that should be fixed before merging. |
| 🟡 **Nit** | No | A minor issue, worth fixing but not blocking. |
| 🟣 **Pre-existing** | No | A bug that exists in the codebase but was not introduced by this PR. |

The three markers stay as they are. They already match Claude Code's managed review exactly, so findings from both read consistently side by side, and adding a second vocabulary of prefixes on top would label every comment twice.

---

## PR Review Path

Source the diff from GitHub via `gh` — the branch does not need to be checked out locally. No report file is written; all findings are posted as inline PR comments. See [references/pr-review-path.md](references/pr-review-path.md) for the full steps.

---

## Local Branch Review Path

Run the review, triage each finding interactively with the user, then optionally generate a report at the end. See [references/local-branch-review-path.md](references/local-branch-review-path.md) for the full steps.

---

## Analysis Phase

Shared by both paths — run on the diff produced by that path's diff-sourcing step, then continue with the path's remaining steps.

**Before step 1, read the repository's review instructions.** Look for `REVIEW.md` at the repository root.

- **Present and readable**: apply it for the rest of the run. It can add rules this review must check, and list paths to skip.
- **Present but unreadable**: stop the review, name the file and the error, and leave the pull request untouched. Findings calibrated by rules that were never applied are worse than no review, because they read like a complete one.
- **Absent**: run exactly as this file describes and say nothing about it. A repository that has not opted in is not misconfigured.

Only the root file is read. A nested `REVIEW.md` deeper in the tree is ignored, so there is one file to find and one precedence rule.

Skip rules act on the diff, not on findings: remove every matching path before step 1, so no angle ever sees them. A skipped file must not consume an angle's candidate ceiling, or the nit budget the PR review path applies before it posts. Record which paths were skipped, because the summary reports them. A review that looked at nothing must never read as a review that found nothing.

A finding produced by a rule from this file names that rule, so the author can see what asked for it.

1. Run the PR & Issue Check (below) — this must complete before the review angles.
2. Run all 7 review angles (see Review Angles) on the diff; collect candidates with `file`, `line`, `summary`, `failure_scenario`, and assign a severity level (🔴 Important / 🟡 Nit / 🟣 Pre-existing) based on the Severity Levels table.
   - An angle stops at 6 candidates. If one reaches 6 with candidates it would still have raised, record the angle's name and how many it dropped, and carry that to the summary. A truncated review must never read like a complete one.
3. Deduplicate near-duplicates (same defect, same location → keep one).
4. Verify each candidate — label as **CONFIRMED**, **PLAUSIBLE**, or **REFUTED**, and carry the label through to the comment. The label is the work this step exists to do, so throwing it away before posting leaves a verified bug and a maybe reading identically to the author.
   - **CONFIRMED** needs evidence, not inference. For a claim about behaviour, hold the `file:line` in the source that establishes it. A name is not evidence: that a function is called `validateInput` does not establish that it validates anything.
   - **A behaviour claim with no citation is dropped**, not downgraded. It never posts and never reaches the summary counts. A finding the author has to disprove costs them a round trip, and the review had no grounds for it.
   - **PLAUSIBLE by default for**: races, nil on rare-but-reachable paths, falsy-zero, off-by-one, regex missing anchor. These stay, and post saying what they are, because they are the cases worth raising precisely when they cannot be settled by reading.
   - **A Removed behaviour finding cites the removal**, in the diff, since the line that carried the behaviour no longer exists in the file to point at.
   - **REFUTED only when provably wrong** — cite the exact line or invariant that rules it out.

   The citation requirement is for behaviour claims. A Simplification, Reuse, or Altitude finding is an argument about the change in front of you, and the diff is its evidence.
5. For each CONFIRMED or PLAUSIBLE finding, validate the suggestion:
   - Look for `package.json`, `go.mod`, `requirements.txt`, or `Gemfile` at the repo root
   - If found: verify any library referenced in the suggestion is available in the installed version; revise or note a required upgrade if not
   - If none found: note no manifest detected and mentally trace any shell commands against the failure modes described
6. Drop all REFUTED findings — see Rules › Refuted findings.
7. **Agent pattern classification** — for each remaining CONFIRMED or PLAUSIBLE finding, check it against the `Pattern name` / `Trigger` columns of two sources read together: the **reviewed repository's** `review/agent-patterns.md`, which holds only the patterns that repository has actually observed, and this skill's [references/agent-patterns.md](references/agent-patterns.md), which ships the universal ones. The reviewed repository is the one the work belongs to, never the one the reviewer's shell happens to be in: the local branch path reads the overlay from disk because it is checked out there, and the PR path fetches it from the pull request's own repository in its step 4. The repository's file is an overlay: where both carry the same `AP-NNN`, its row wins, because it holds this repository's counts and status. Tag matching findings `[AI-PATTERN]`.

   **This step only reads and tags. Nothing here writes a file, on either path.** What a review learned is recorded after the author has said which findings were real, which is the Local Branch Review Path's registry step, not this one. See [references/agent-pattern-registry.md](references/agent-pattern-registry.md) for what gets recorded, when it is committed, and why a newly discovered pattern is proposed as an issue rather than written.

   **A finding matching a row whose `Status` is suppressed is dropped here**, on both paths: not tagged, not verified further, not posted. Count the drops and carry the number to the summary, because a suppressed pattern hiding findings must not look like a review that found nothing.

   The PR review path has no triage, so it has no verdict to record. It reports the rows it would have added and writes nothing.

---

## PR & Issue Check

Run as Analysis Phase step 1, before the review angles. The goal: confirm the change is validated against the issue it addresses and that the test coverage matches what was promised. The four issue shapes state that contract under different headings, so step 4 reads the shape first.

1. **Resolve the PR.**
   - PR Review Path: already fetched in that path's steps 1–2.
   - Local Branch Review Path: check whether the current branch has an open PR: `gh pr view --json number,title,body,closingIssuesReferences`. If none exists, print "No PR found for this branch — skipping issue and test plan checks" and skip the rest of this section entirely.
2. **Resolve the linked issue(s).**
   - Read `closingIssuesReferences` from the PR — the issue(s) it will close via `Closes #NNN` / `Fixes #NNN` / `Resolves #NNN`. If more than one is linked, use all of them.
   - If one or more are linked, fetch each: `gh issue view {number} --json title,body`.
   - If none are linked, ask the reviewer:
     > "No issue is linked to this PR. Pass an issue number to check against, or reply 'proceed' to continue without an issue check."
     - Number provided → fetch it as above.
     - "Proceed" → no issue for the rest of this check; skip step 4 below.
3. **Check the PR has a test plan.** Look for a "Test plan" / "Testing" / "How to test" section in the PR body. If missing, treat it as an empty test plan and continue.
4. **Check the test plan covers each linked issue's contract** (skip if no issue was resolved in step 2). What the contract is depends on the shape of the issue, so read the shape from its headings, which are authoritative. A shape label (`story`, `task`, `chore`, or `bug`) confirms the reading, and an issue written before the four shapes existed carries neither, so never depend on the label alone:

   | Shape | Heading that identifies it | Its contract |
   | --- | --- | --- |
   | Story | `## User story` | Each Given-When-Then scenario under `## Acceptance criteria` |
   | Task | `## Parent` | Each scenario under `## Acceptance criteria`, plus each item in the optional `### Also true when done` checklist |
   | Chore | `## What is changing` | Each item under `## Done when` |
   | Bug | `## Steps to reproduce` | The reproduction path, plus the gap between `## Expected behaviour` and `## Actual behaviour` |

   For each contract item across all linked issues, check whether the test plan describes exercising it (semantic match, not exact wording).
   - All covered → continue to step 5.
   - **No contract at all** (the issue matches no shape, or its contract section is empty): print "#NNN carries no checkable contract, so the coverage check has nothing to run against" and continue to step 5. Never pass this gate in silence: an issue with nothing to check against and an issue whose contract is fully covered are different outcomes, and they must not look the same.
   - Any uncovered → ask the reviewer:
     > "The test plan doesn't cover these contract items: <list>. Continue the review anyway?"
     - No → stop the review here; the reviewer should update the PR's test plan first.
     - Yes → continue to step 5, carrying the uncovered items into it alongside the test plan's own scenarios.
5. **Check automated tests correspond to the test plan.** Look at the diff for test files added or modified. For each scenario from the test plan (plus any uncovered contract items carried from step 4), check whether an automated test exercises it.
   - All covered → done, continue to the review angles.
   - Any scenario with no automated test:
     - File it directly as a 🔴 **Important** finding — "Missing automated test for: <scenario>" — alongside the review angles' findings. It's a confirmed process gap, not a speculative candidate, so it skips dedup/verify (Analysis Phase steps 3–4) and goes straight into the final findings list.
     - Add the same scenario to the **Reviewer To-Do** list — "Manually test: <scenario>" — printed with the review summary (see Rules).

---

## Review Angles

Shared by both paths. Run all seven; each surfaces up to 6 candidates. Work through each checklist item explicitly — don't just scan.

### Line-by-line

Look for defects in individual statements or small expressions.

- **Condition logic:** inverted `==`/`!=`, wrong boolean operator (`&&` vs `||`), missing negation, condition that is always-true or always-false
- **Off-by-one:** boundary comparisons (`<` vs `<=`), slice/index ranges, loop start/end values, fence-post in pagination or chunking
- **Null/nil safety:** value used before a null check, null returned by a function and immediately dereferenced by its caller, optional field accessed unconditionally
- **Async correctness:** async call made without `await`, `await` on a non-async value, fire-and-forget on a critical path with no error handling
- **Error handling:** catch block that swallows the error (no re-throw, no log, no observable side-effect), error return value ignored at the call site
- **Type coercion:** implicit comparison between incompatible types, string + number concatenation where arithmetic addition was intended
- **Mutation:** function modifying an argument it doesn't own, shared collection mutated during iteration

### Removed behavior

Look for functionality that was deleted but whose absence creates a gap.

- **Input validation:** was a null, length, type, or range check removed from an entry point or guard clause?
- **Error propagation:** was an error path dropped — try/catch added without re-throw, error return ignored, promise rejection left unhandled?
- **Test deletions:** were any tests deleted that cover code paths still present in production code?
- **Guards:** was a defensive condition removed or its predicate weakened (e.g. `> 0` changed to `>= 0`)?
- **Rate limiting / throttling:** was a call-frequency cap, debounce, or retry limit removed?
- **Observability:** was a log, metric, or trace statement removed from an error path or a significant state transition?

### Cross-file

Look for callers or dependents broken by changes in this diff.

- **Signature changes:** function/method signature changed — are all call sites updated to match?
- **Return type changes:** return shape or type changed — do all callers handle the new shape correctly?
- **Precondition strengthening:** function now requires a new invariant (non-null param, specific ordering, pre-initialised state) — do all callers satisfy it?
- **Interface / type changes:** a shared type, interface, or schema changed — are all implementations and consumers updated?
- **Shared utility changes:** a utility used in more than one place was changed — check every caller, not just the one that motivated the change

### Reuse

Look for new code that duplicates something already available.

- **Utility duplication:** does this logic already exist in a shared, utils, or helpers module?
- **Custom error types:** does this code define a new error class or sentinel value that already exists elsewhere in the codebase?
- **Parsing / serialisation:** does this code re-implement data transformation that a shared formatter or library already provides?
- **Validation:** does this code validate inputs in a way an existing validator already handles?

### Simplification

Look for complexity that doesn't pay for itself.

- **Redundant variable:** variable assigned once and used once — could inline it without losing clarity
- **Dead branch:** a condition provably always true or always false given surrounding invariants
- **Copy-paste variation:** two or more blocks doing nearly the same thing with minor differences — could be parameterised
- **Deep nesting:** three or more levels of `if`/loop nesting that a guard clause or extracted function would flatten
- **Unnecessary intermediate:** value transformed through multiple named steps that could be composed directly

### Efficiency

Look for performance problems on reachable paths.

- **Loop-internal constant:** value that doesn't change across iterations computed inside the loop body
- **N+1 I/O:** database query, network call, or file read inside a loop over a result set
- **Sequential I/O:** multiple independent I/O operations run in series when they could run concurrently
- **Over-fetching:** loading a full record or collection when only a small subset of fields or items is needed downstream
- **Blocking hot path:** synchronous or CPU-heavy work on a latency-sensitive request path that should be deferred or offloaded

### Altitude

Look for band-aid patches to shared infrastructure instead of fixing the underlying problem.

- **Special-case parameter:** new parameter added to a shared function whose only purpose is to change behaviour for one specific caller
- **Caller-specific branch:** `if (callerContext === 'X')` or equivalent inside shared infrastructure — shared code shouldn't know about its callers
- **Output patching:** post-processing the result of a shared function at the call site to fix a problem that belongs inside the function itself
- **Layered duplication:** the same logic implemented at multiple layers (e.g. controller + service + repo) because no single layer owns it

---

## Inline Comment Format

Used by the PR Review Path (step 8). See [references/inline-comment-format.md](references/inline-comment-format.md) for the exact `gh api` invocation and fallback.

---

## Report Template

*(Local Branch Review Path only)* See [references/report-template.md](references/report-template.md) for the full template.

---

## Agent Pattern Registry

Used by the Analysis Phase (shared by both review paths) to persist and promote AI-characteristic findings, with the shipped standard in [references/agent-patterns.md](references/agent-patterns.md). See [references/agent-pattern-registry.md](references/agent-pattern-registry.md) for the file schema and the programmability-promotion criteria.

---

## Rules

**Code excerpts:** 5–15 lines of context · correct language fence identifier · mark problem line with `// ←`

**Address the code, never the author:** describe what the code does and what follows from it. A candidate phrased at the developer ("why did you", "you forgot to") is rewritten before it posts, and the original phrasing is never submitted

**Blocking:** only 🔴 Important blocks. A 🟡 or 🟣 comment says on its face that it does not block, so declining it needs no reply and no justification

**Problem statements:** name the concrete failure — inputs → wrong output/crash/data loss; never "this could be a problem"

**Fix suggestions:** always show corrected code; if no single fix is right, show two options with a one-line tradeoff note

**What looks good:** always include; specifics only; 2–4 bullets max

**Scope:** every confirmed or plausible finding survives the Analysis Phase, at every severity. Volume control is a posting concern and belongs to the path that posts: the PR review path caps nits at 5 and suppresses new ones on a re-review, and its summary carries the count held back. The local branch path posts nothing and triages everything, so no cap applies there

**Repository instructions:** `REVIEW.md` at the repository root tunes the review, and only the root file is read. A finding produced by one of its rules names that rule. Skipped paths leave the diff before any angle sees them, and the summary reports them

**Repository identity on the PR path:** the reviewed repository comes from the pull request, never from the working directory. Every `gh` call carries `--repo`, and the pattern overlay is fetched from that repository rather than read from disk

**Working tree on the PR path:** a PR review reads and reports only — it never edits, creates, or commits a file, including `review/agent-patterns.md`

**Refuted findings:** drop silently — no struck-through text, no "considered but dismissed" note, no mention at all

**Reviewer To-Do:** one bullet per scenario with no automated test, phrased as an action ("Manually test: ..."); include the section in every summary/report where it's non-empty, omit it entirely when empty — never print an empty heading
