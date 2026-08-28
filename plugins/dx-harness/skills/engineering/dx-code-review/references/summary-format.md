# Summary and outcome format

Used by the last step of the review sequence in `SKILL.md`, after everything that survives has been posted. Three outcomes, and each prints something different. Pick the one that matches and follow it exactly.

- **Every changed path was skipped by `REVIEW.md`**: post no review and no LGTM. Print `Review skipped — every changed path matched a skip rule in REVIEW.md.` and name the rules. A review that looked at nothing is not a review that found nothing, and LGTM would say it was.
- **No new findings and no open skill threads remaining** (all were resolved in step 7): post the following as a PR comment, then print `Review complete — LGTM posted to PR #{number}.`
  ```
  LGTM 👍

  ---
  *🤖 dx-code-review · {model}*
  ```
- **Otherwise**: post the following as a PR comment, then print `Review complete — posted N comment(s) to PR #{number}.`

  When there is no important finding, open the summary with `No blocking findings.` on its own line above the table. Omit it when an important finding exists.

  The severity table counts what was **posted**, not what was found. Findings held back, truncated, dropped for a missing citation, or suppressed do not appear in it; each has its own line below. A review that found nine nits and posted none shows `🟡 Nit | 0` and reports the nine on the Held back line.

  Include the **Held back**, **Truncated**, **Skipped**, **Registry**, **Suppressed**, and **Feedback** lines only when they are non-empty. Never print an empty one. The Feedback line is empty on a first review.
  ```
  ## Code Review Summary

  No blocking findings.

  | Severity | Count |
  |----------|-------|
  | 🔴 Important    | N |
  | 🟡 Nit          | N |
  | 🟣 Pre-existing | N |

  **Held back:** N further nit(s) found and not posted (cap of 5 per review), and N new nit(s) suppressed because this is a re-review.

  **Truncated:** the <angle> angle reached its 6-candidate ceiling with N more outstanding.

  **Skipped:** N path(s) matched a skip rule in `REVIEW.md` and were not reviewed.

  **Registry:** N finding(s) matched a known pattern, and N matched none. The registry is read-only to this review, so nothing was recorded.

  **Suppressed:** N finding(s) were dropped because their pattern is suppressed in this repository's registry.

  **Feedback:** N of M findings from earlier reviews were marked helpful, and N not helpful.

  ## Reviewer To-Do
  - Manually test: <scenario> (one per test-plan scenario with no automated test; omit this section if empty)

  ## What Looks Good
  - 2–4 specific strengths — name the design decision, not just "good code"

  ---
  *🤖 dx-code-review · {model}*
  ```
