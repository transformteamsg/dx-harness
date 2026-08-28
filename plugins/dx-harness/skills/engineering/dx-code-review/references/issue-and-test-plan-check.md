# Issue and test plan check

Run as analysis step 1, before the review angles. Confirm the change is validated against the issue it addresses, and that the tests match what the pull request promised. The four issue shapes state that contract under different headings, so step 4 reads the shape first.

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
   - **No contract at all** (the issue matches no shape, or its contract section is empty): print "#NNN carries no checkable contract, so the coverage check has nothing to run against" and continue to step 5. Never pass this gate silently.
   - Any uncovered → ask the reviewer:
     > "The test plan doesn't cover these contract items: <list>. Continue the review anyway?"
     - No → stop the review here; the reviewer should update the PR's test plan first.
     - Yes → continue to step 5, carrying the uncovered items into it alongside the test plan's own scenarios.
5. **Check automated tests correspond to the test plan.** Look at the diff for test files added or modified. For each scenario from the test plan (plus any uncovered contract items carried from step 4), check whether an automated test exercises it.
   - All covered → done, continue to the review angles.
   - Any scenario with no automated test:
     - File it directly as a 🔴 **Important** finding — "Missing automated test for: <scenario>" — alongside the review angles' findings. It's a confirmed process gap, not a speculative candidate, so it skips dedup/verify (analysis steps 3–4) and goes straight into the final findings list.
     - Add the same scenario to the **Reviewer To-Do** list — "Manually test: <scenario>" — printed with the review summary (see Rules). This step is the list's only source.
