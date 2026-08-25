# Local Branch Review Path

Run the review, triage each finding interactively with the user, then optionally generate a report at the end. Every invocation is treated as a fresh review of the full branch.

## Steps

1. Get branch name: `git rev-parse --abbrev-ref HEAD`
   - If the branch is `main`, `master`, `develop`, or `dev`, **stop immediately** and tell the user: "Code reviews are for feature branches only — switch to a feature branch and re-run."
   - Sanitise the branch name for use as a directory: replace `/` with `-`, strip characters outside `[a-zA-Z0-9._-]`. Store as `<safe-branch>` — used for the report path in step 7 if the user requests one.
2. Get the diff:
   - **Detect the default branch:** try `main`, then `master`, then `develop`, then `dev` — use whichever resolves as a local ref (`git rev-parse --verify <name>`). If none resolve, stop and tell the user: "Cannot find a base branch — please run: `git fetch origin` and ensure the default branch is checked out locally".
   - `git diff $(git merge-base HEAD <base>)...HEAD` for the full diff.
3. Run the Analysis Phase (see `SKILL.md` § Analysis Phase) on the diff from step 2.
4. Triage each finding with the user — if no findings remain after the Analysis Phase, skip to the next step. Otherwise present findings one at a time in severity order (🔴 Important → 🟡 Nit → 🟣 Pre-existing). For each, show the full finding details (file, line, code excerpt, problem, suggestion) and ask:

   For a finding the Analysis Phase tagged `[AI-PATTERN]`, show the recurring-pattern line above the question: the row's ID, `Pattern name`, its `Confirmed by` and `Rejected by` counts, and the Prevention. The author is about to decide whether this finding was real, and that answer is what step 5 records against the pattern, so they need to know whether they are judging something seen five times before or a one-off, and whether others already rejected it. Omit the line entirely when the finding matched nothing.

   > "Fix now, fix later, or not a problem?"

   Record the user's answer against each finding. If the user wants to fix it now, assist with the fix before moving to the next finding — mark it **Fixed** once done. If later, mark it **To be fixed**. If not a problem, mark it **Rejected** and move on without arguing: the author knows the code, and a finding they threw out is the signal the registry needs in step 5.

5. Record what the review learned, now that the author has said which findings were real. Follow [agent-pattern-registry.md](agent-pattern-registry.md) § Recording what a review learned.
   - Fix now and fix later are both acceptances, so both increment `Confirmed by`. **Rejected** increments `Rejected by` instead, and never proposes anything upstream. A rejection is recorded when the finding matched a pattern, creating the overlay row if the match came from a seed; a rejected finding that matched nothing creates no row, because it established no pattern to disconfirm.
   - A pattern whose `Rejected by` reaches 2 and exceeds its `Confirmed by` is marked suppressed, and is not raised by later reviews.
   - A finding that matched an existing row updates it, and commits only when `review/agent-patterns.md` is already tracked by git. Nothing is asked here.
   - A finding that matched **nothing at all**, neither a row here nor a shipped seed, is a newly discovered pattern. Write nothing. State whether it reads as universal or project-specific with the reasoning, and ask whether to track it. On yes, open an issue in this repository proposing the row, plus one on dx-harness proposing a shipped seed when the pattern reads as universal. This is the only prompt in the step, and the nine seeds mean it is rare.
   - The first observation of a shipped seed is not a discovery. It creates the overlay row and counts as an increment, with no prompt and no issue.
   - Carry the opt-in line, and the number and URL of every issue filed, into the summary in step 6. A pattern the developer declined to track is named there too, so the observation is not lost. Name each pattern a finding matched, with its count, so the author sees which of these are habits rather than one-offs.

6. Print the full review summary:
    - When no important finding was raised, open with `No blocking findings.` above the table, so a run that is all nits is not read as one that found a problem. Omit the line when an important finding exists.
    - Severity counts table (🔴 Important / 🟡 Nit / 🟣 Pre-existing)
    - **Truncated** — the angle that reached its 6-candidate ceiling and how many it dropped, when one did
    - **Skipped** — the paths that matched a skip rule in `REVIEW.md` and were not reviewed, when any did
    - **Registry** — the opt-in line when `review/agent-patterns.md` is untracked, the number and URL of every issue filed for a newly discovered pattern, and any pattern the developer declined to track. Omit when the review neither recorded nor proposed anything
    - **Suppressed** — the number of findings dropped because their pattern is suppressed, and any pattern newly suppressed by this review with the counts that caused it. Omit when neither happened
    - All findings grouped by triage: **Fixed** first, then **To be fixed**, then **Rejected** — each with severity, file, line, and one-line summary
    - Reviewer To-Do — manual-test items for scenarios with no automated test (omit if empty)
    - What Looks Good (2–4 specific strengths)

7. Ask: "Would you like to generate a written report?"
    - **Yes** → write the report to `review/<safe-branch>/report-<YYYYMMDDHHMMSS>.md` (create the directory if needed: `mkdir -p review/<safe-branch>`). The report follows [report-template.md](report-template.md); include each finding's triage status alongside its entry. Print: `Report saved: review/<safe-branch>/<filename>.md`
    - **No** → done.
