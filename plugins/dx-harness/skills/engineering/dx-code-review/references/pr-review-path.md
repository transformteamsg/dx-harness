# PR Review Path

Source the diff from GitHub via `gh` — the branch does not need to be checked out locally. No report file is written; all findings are posted as inline PR comments.

**Focus:** correctness first. The goal is to catch bugs, broken contracts, and missing error handling before the code merges — not to push cleanup or style improvements. When running the lower-altitude angles (Simplification, Reuse, Efficiency, Altitude), apply judgment: only raise findings that represent a genuine problem, not cosmetic preferences.

## Skill marker

Every comment posted by this skill ends with the following footer so that skill comments are identifiable on re-reviews. Replace `{model}` with the model ID powering the current session (e.g. `claude-sonnet-4-6`):

```
---
*🤖 code-review · {model}*
```

## Steps

1. Parse the PR number:
   - Full URL (e.g. `https://github.com/owner/repo/pull/42`) → extract the trailing number.
   - Number provided directly → use as-is.
2. Fetch PR metadata and repo identity:
   ```bash
   gh pr view {number} --json number,headRefName,headRefOid,baseRefName,title
   gh repo view --json owner,name
   ```
3. Fetch all existing review threads on the PR — used for both deduplication (step 6) and conversation resolution (step 7):
   ```bash
   gh api graphql -f query='
   query($owner: String!, $repo: String!, $number: Int!) {
     repository(owner: $owner, name: $repo) {
       pullRequest(number: $number) {
         reviewThreads(first: 100) {
           nodes {
             id
             isResolved
             comments(first: 1) {
               nodes { body path originalLine }
             }
           }
         }
       }
     }
   }' -f owner="{owner}" -f repo="{repo}" -F number={number}
   ```
   From the result, derive three sets:
   - **All open threads** — all threads where `isResolved` is false (used for dedup in step 6)
   - **Open skill threads** — subset where `comments[0].body` also contains `code-review` (used for resolution in step 7)
   - **Any skill thread** — every thread whose `comments[0].body` contains `code-review`, resolved or not. A non-empty set means this skill has reviewed the pull request before, which is what makes this run a re-review for volume control. Resolved threads count: an author who fixed everything last round has still had their nits, and a second round of style comments is the outcome that rule exists to prevent.
4. Fetch the full PR diff:
   ```bash
   gh pr diff {number}
   ```
5. Run the Analysis Phase (see `SKILL.md` § Analysis Phase) on the diff from step 4.
6. Deduplicate against existing comments — using the **all open threads** set from step 3, check each remaining finding against every open thread. If any thread's comment already addresses the same issue at the same `path` and `originalLine`, or raises the same concern in substance (regardless of who posted it), skip posting to avoid repeating feedback already given.
7. Resolve addressed conversations — for each open skill thread, check whether the current diff has addressed the issue it describes. If yes, resolve the thread:
    ```bash
    gh api graphql -f query='
    mutation($threadId: ID!) {
      resolveReviewThread(input: {threadId: $threadId}) {
        thread { isResolved }
      }
    }' -f threadId="{thread_id}"
    ```
8. **Apply volume control, then post once.** This happens here rather than in the Analysis Phase because it needs what the earlier steps of this path produced: **Any skill thread** from step 3 to know whether this is a re-review, and the deduplication from step 6 to know which nits are genuinely new.
   - **Important and pre-existing findings are never capped.** Post every one.
   - **Nits are capped at 5.** Rank them CONFIRMED before PLAUSIBLE, then in diff order, post the first 5, and carry the number held back to the summary. The cap is global rather than per-angle, so one angle can use all 5.
   - **On a re-review, post no new nit at all.** A non-empty **Any skill thread** set means this skill has reviewed the pull request before. Post important and pre-existing findings, resolve addressed threads, and hold back every nit not already raised on an open thread. A one-line fix must not collect style comments through seven rounds.

   Then post everything that survives as a **single review**, not as one comment per finding — see [inline-comment-format.md](inline-comment-format.md). One review is one notification for the author; a comment at a time is one notification each.
9. Determine outcome and print summary:
    - **Every changed path was skipped by `REVIEW.md`**: post no review and no LGTM. Print `Review skipped — every changed path matched a skip rule in REVIEW.md.` and name the rules. A review that looked at nothing is not a review that found nothing, and LGTM would say it was.
    - **No new findings and no open skill threads remaining** (all were resolved in step 7): post the following as a PR comment, then print `Review complete — LGTM posted to PR #{number}.`
      ```
      LGTM 👍

      ---
      *🤖 code-review · {model}*
      ```
    - **Otherwise**: post the following as a PR comment, then print `Review complete — posted N comment(s) to PR #{number}.`

      When there is no important finding, open the summary with `No blocking findings.` on its own line above the table, so a review that is all nits is not mistaken for one that found a problem. Omit that line when an important finding exists.

      Include the **Held back**, **Truncated**, and **Skipped** lines only when they are non-empty. Never print an empty one: a review that held nothing back and truncated nothing should say neither.
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

      ## Reviewer To-Do
      - Manually test: <scenario> (omit this section if empty)

      ## What Looks Good
      - 2–4 specific strengths — name the design decision, not just "good code"

      ---
      *🤖 code-review · {model}*
      ```
