# Local Branch Review Path

Run the review, triage each finding interactively with the user, then optionally generate a report at the end. Every invocation is treated as a fresh review of the full branch.

## Steps

1. Get branch name: `git rev-parse --abbrev-ref HEAD`
   - If the branch is `main`, `master`, `develop`, or `dev`, **stop immediately** and tell the user: "Code reviews are for feature branches only — switch to a feature branch and re-run."
   - Sanitise the branch name for use as a directory: replace `/` with `-`, strip characters outside `[a-zA-Z0-9._-]`. Store as `<safe-branch>` — used for the report path in step 6 if the user requests one.
2. Get the diff:
   - **Detect the default branch:** try `main`, then `master`, then `develop`, then `dev` — use whichever resolves as a local ref (`git rev-parse --verify <name>`). If none resolve, stop and tell the user: "Cannot find a base branch — please run: `git fetch origin` and ensure the default branch is checked out locally".
   - `git diff $(git merge-base HEAD <base>)...HEAD` for the full diff.
3. Run the Analysis Phase (see `SKILL.md` § Analysis Phase) on the diff from step 2.
4. Triage each finding with the user — if no findings remain after the Analysis Phase, skip to the next step. Otherwise present findings one at a time in severity order (🔴 Important → 🟡 Nit → 🟣 Pre-existing). For each, show the full finding details (file, line, code excerpt, problem, suggestion) and ask:

   > "Fix now or later?"

   Record the user's answer against each finding. If the user wants to fix it now, assist with the fix before moving to the next finding — mark it **Fixed** once done. If later, mark it **To be fixed**.

5. Print the full review summary:
    - Severity counts table (🔴 Important / 🟡 Nit / 🟣 Pre-existing)
    - All findings grouped by triage: **Fixed** first, then **To be fixed** — each with severity, file, line, and one-line summary
    - Reviewer To-Do — manual-test items for scenarios with no automated test (omit if empty)
    - What Looks Good (2–4 specific strengths)

6. Ask: "Would you like to generate a written report?"
    - **Yes** → write the report to `review/<safe-branch>/report-<YYYYMMDDHHMMSS>.md` (create the directory if needed: `mkdir -p review/<safe-branch>`). The report follows [report-template.md](report-template.md); include each finding's triage status alongside its entry. Print: `Report saved: review/<safe-branch>/<filename>.md`
    - **No** → done.
