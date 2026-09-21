# Issue and test plan check

Run as analysis step 1, before the review angles.

**"PR" below means the request on either forge.** The commands are GitHub's; the GitLab equivalent for each is in the command map of [../../../../procedures/pr-mechanics.md](../../../../procedures/pr-mechanics.md). Report to the developer in their platform's vocabulary.

**When the request and the issue live on different forges**, `closingIssuesReferences` resolves nothing. Read the request description for a `Closes` reference. If it names an issue on another forge, ask the reviewer for the number. If neither yields one, treat it as no issue linked and follow the branch below.

1. **Resolve the PR.** Already fetched in the sequence's steps 1–2, so use what those steps returned rather than fetching again.
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
   - **No contract at all** (the issue matches no shape, or its contract section is empty): print "#NNN carries no checkable contract, so the coverage check has nothing to run against" and continue to step 5.
   - Any uncovered → ask the reviewer:
     > "The test plan doesn't cover these contract items: <list>. Continue the review anyway?"
     - No → stop the review here; the reviewer should update the PR's test plan first.
     - Yes → continue to step 5, carrying the uncovered items forward to step 6 alongside the test plan's own scenarios.
5. **Read the coverage declaration.** Read it from the request, because this review checks out no branch. The command, the shape, and the rule for which commit wins are in [../../../../procedures/commit-discipline.md](../../../../procedures/commit-discipline.md) § Reading the declaration back.
   - **No commit carries one** → record that this branch has no declaration and continue to step 6. A branch that no harness skill produced carries none, so the absence is normal and never a finding.
   - **A commit carries one** → record every item it lists as manual, with the reason it gives.
6. **Check automated tests correspond to the test plan.** Look at the diff for test files added or modified. For each scenario from the test plan (plus any uncovered contract items carried from step 4), check whether an automated test exercises it.
   - All covered → done, continue to the review angles.
   - Any scenario with no automated test: the declaration from step 5 decides what happens next.
     - **Answered**: the declaration records the scenario as manual, and the request body names that scenario where a reviewer reads it, such as its test plan or its Manual verification section. File no finding, add no Reviewer To-Do bullet, and count the scenario for the summary's Declared manual line.
     - **Anything else**: file the finding below. Where the declaration omits the scenario from both headings, say it is incomplete. Where it records the scenario as manual and the request body names it nowhere, say the case reached no reviewer, because a declaration sits in a commit body.

     The finding has two parts:
     - A 🔴 **Important** finding — "Missing automated test for: <scenario>" — filed alongside the review angles' findings. It's a confirmed process gap, not a speculative candidate, so it skips the candidate-list dedup and the verification pass (analysis step 5), and the cap never counts it. Analysis step 3 still deduplicates it against the request's existing threads, like every other finding.
     - A bullet on the **Reviewer To-Do** list — "Manually test: <scenario>" — printed with the review summary (see Rules). Nothing else adds a bullet to that list.
