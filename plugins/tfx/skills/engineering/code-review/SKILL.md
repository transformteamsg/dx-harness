---
name: code-review
description: Use when asked to review code changes — either posting findings as inline PR comments or running an interactive local branch review with optional report generation. Triggers on "review this", "give me feedback on", "review my changes", "review this PR", "post findings to PR", "add review comments to the pull request", or any request for a code review.
---

# Code Review

Reviews code changes using 7 structured angles across the diff. Posts findings as inline PR comments directly on GitHub, or runs an interactive triage session on a local working branch with optional report generation at the end.

---

## Mode Selection

The two paths source their diff differently and end differently, so the mode has to be settled before anything else happens. Read the request first and take the mode from it when it is there:

- **Names a PR** — a PR number or URL, "review this PR", "post findings to the pull request", "add review comments" → PR Review Path. If the mode is clear but the PR number isn't, ask for the number rather than the mode.
- **Names local work** — "my local working branch", "my working copy", "this branch", "my changes before I push" → Local Branch Review Path. State in one line which path you're taking, then run it.
- **Names neither** — "review my code", "review my changes", "give me feedback on this", with nothing pointing either way → **ask, and stop there.** Wait for the answer before you read a diff or produce a single finding:

  > "Are you reviewing a PR or your local working branch?"
  > - **PR** — if a PR link or number wasn't provided, ask for it now.
  > - **Local branch** — proceed.

This split matters in both directions, and the two mistakes look nothing alike.

Re-asking a reviewer who already said "my local working branch" reads as though you didn't read the request, and when this skill runs non-interactively it is fatal: nobody is there to answer, so the question ends the turn and no review happens at all.

Guessing on a bare request is the opposite failure and just as real. The reviewer may have a PR open and want these findings posted as inline comments on it; running a local review instead hands them the wrong artefact and quietly wastes the pass. A bare "review my code changes" is genuinely underdetermined, and the question is the correct output for it, not a dead end to be avoided.

So infer only from what the request actually says. When it says neither, ask.

- **PR** → spawn a fresh subagent and pass it: this `SKILL.md`, [references/pr-review-path.md](references/pr-review-path.md), the selected mode, and the PR number. The subagent runs the PR Review Path from scratch — no user interaction is needed.
- **Local branch** → before doing anything else, explicitly state: *"Starting fresh local branch review — all prior session context discarded."* Then treat every subsequent step as if this were the first message in a new conversation: no prior analysis, no prior findings, no prior assumptions. Read [references/local-branch-review-path.md](references/local-branch-review-path.md) and run its Steps from step 1. (Interactive triage in step 4 means this path cannot run as a subagent.)

---

## Severity Levels

| Level | What it means |
|-------|--------------|
| 🔴 **Important** | A bug that should be fixed before merging. |
| 🟡 **Nit** | A minor issue, worth fixing but not blocking. |
| 🟣 **Pre-existing** | A bug that exists in the codebase but was not introduced by this PR. |

---

## PR Review Path

Source the diff from GitHub via `gh` — the branch does not need to be checked out locally. No report file is written; all findings are posted as inline PR comments. See [references/pr-review-path.md](references/pr-review-path.md) for the full steps.

---

## Local Branch Review Path

Run the review, triage each finding interactively with the user, then optionally generate a report at the end. See [references/local-branch-review-path.md](references/local-branch-review-path.md) for the full steps.

---

## Analysis Phase

Shared by both paths — run on the diff produced by that path's diff-sourcing step, then continue with the path's remaining steps.

1. Run the PR & Issue Check (below) — this must complete before the review angles.
2. Run all 7 review angles (see Review Angles) on the diff; collect candidates with `file`, `line`, `summary`, `failure_scenario`, and assign a severity level (🔴 Important / 🟡 Nit / 🟣 Pre-existing) based on the Severity Levels table.
3. Deduplicate near-duplicates (same defect, same location → keep one).
4. Verify each candidate — label as **CONFIRMED**, **PLAUSIBLE**, or **REFUTED**.
   - PLAUSIBLE by default for: races, nil on rare-but-reachable paths, falsy-zero, off-by-one, regex missing anchor
   - REFUTED only when provably wrong — cite the exact line or invariant that rules it out
5. For each CONFIRMED or PLAUSIBLE finding, validate the suggestion:
   - Look for `package.json`, `go.mod`, `requirements.txt`, or `Gemfile` at the repo root
   - If found: verify any library referenced in the suggestion is available in the installed version; revise or note a required upgrade if not
   - If none found: note no manifest detected and mentally trace any shell commands against the failure modes described
6. Drop all REFUTED findings — see Rules › Refuted findings.
7. **Agent pattern classification** — for each remaining CONFIRMED or PLAUSIBLE finding, check it against the `Pattern name` / `Trigger` columns in `review/agent-patterns.md`. If the file doesn't exist yet, create it by copying this skill's [assets/agent-patterns-seed.md](assets/agent-patterns-seed.md). Tag matching findings `[AI-PATTERN]`.

   For each tagged finding, look for the matching row in the Pattern name column (case-insensitive substring):
   - **Seed row, unobserved** (`Confirmed by: 0`) — fill in `First seen` (today), `Concrete example` (this instance), `Severity` (this finding's severity), and set `Confirmed by` to `1 review`.
   - **Already observed** (`Confirmed by` ≥ 1) — increment `Confirmed by` and append `(also seen: <file>)` to the `Concrete example`.
   - **No match at all** (a pattern outside the 9 seeds) — append a new row: next sequential `AP-NNN` ID, directive Pattern name, one-sentence Trigger, one-sentence Prevention instruction, one project-anchored Concrete example, today's ISO date, severity, `1 review`.

   Commit the file: `docs(review): update agent-patterns.md [skip ci]`

   For any pattern whose `Confirmed by` count has just reached 3, evaluate it against the programmability criteria (Specificity, Repeatability, Speed, Tool availability, Semantic dependency — see [references/agent-pattern-registry.md](references/agent-pattern-registry.md)). If it passes:
   - Implement the guard using `lint-setup` (lint rule) or `git-hooks-setup` (hook script) as appropriate.
   - Remove the pattern's row from `review/agent-patterns.md`.
   - Prepend a promotion comment above the table: `<!-- AP-NNN "<Pattern name>" promoted to <tool> (<tier>) on <date> -->`
   - If the guard requires CI pipeline changes, surface a recommendation to the developer instead of implementing directly.

---

## PR & Issue Check

Run as Analysis Phase step 1, before the review angles. The goal: confirm the change is validated against the issue it addresses and that the test coverage matches what was promised.

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
4. **Check the test plan covers the linked issue(s)' acceptance criteria** (skip if no issue was resolved in step 2). Each issue follows the `create-issue` template — each entry under `## Acceptance criteria` is a Given-When-Then scenario. For each scenario across all linked issues, check whether the test plan describes exercising it (semantic match, not exact wording).
   - All covered → continue to step 5.
   - Any uncovered → ask the reviewer:
     > "The test plan doesn't cover these acceptance criteria scenarios: <list>. Continue the review anyway?"
     - No → stop the review here; the reviewer should update the PR's test plan first.
     - Yes → continue to step 5, carrying the uncovered scenarios into it alongside the test plan's own scenarios.
5. **Check automated tests correspond to the test plan.** Look at the diff for test files added or modified. For each scenario from the test plan (plus any uncovered acceptance-criteria scenarios carried from step 4), check whether an automated test exercises it.
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

Used by the Analysis Phase (shared by both review paths) to persist and promote AI-characteristic findings, seeded from [assets/agent-patterns-seed.md](assets/agent-patterns-seed.md). See [references/agent-pattern-registry.md](references/agent-pattern-registry.md) for the file schema and the programmability-promotion criteria.

---

## Rules

**Code excerpts:** 5–15 lines of context · correct language fence identifier · mark problem line with `// ←`

**Problem statements:** name the concrete failure — inputs → wrong output/crash/data loss; never "this could be a problem"

**Fix suggestions:** always show corrected code; if no single fix is right, show two options with a one-line tradeoff note

**What looks good:** always include; specifics only; 2–4 bullets max

**Scope:** every confirmed or plausible finding regardless of severity — no cap

**Refuted findings:** drop silently — no struck-through text, no "considered but dismissed" note, no mention at all

**Reviewer To-Do:** one bullet per scenario with no automated test, phrased as an action ("Manually test: ..."); include the section in every summary/report where it's non-empty, omit it entirely when empty — never print an empty heading
