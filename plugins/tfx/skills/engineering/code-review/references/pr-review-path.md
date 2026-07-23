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
   From the result, derive two sets:
   - **All open threads** — all threads where `isResolved` is false (used for dedup in step 6)
   - **Open skill threads** — subset where `comments[0].body` also contains `code-review` (used for resolution in step 7)
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
8. Post each remaining new finding as an inline PR comment — see [inline-comment-format.md](inline-comment-format.md).
9. Determine outcome and print summary:
    - **No new findings and no open skill threads remaining** (all were resolved in step 7): post the following as a PR comment, then print `Review complete — LGTM posted to PR #{number}.`
      ```
      LGTM 👍

      ---
      *🤖 code-review · {model}*
      ```
    - **Otherwise**: post the following as a PR comment, then print `Review complete — posted N comment(s) to PR #{number}.`
      ```
      ## Code Review Summary

      | Severity | Count |
      |----------|-------|
      | 🔴 Important    | N |
      | 🟡 Nit          | N |
      | 🟣 Pre-existing | N |

      ## Reviewer To-Do
      - Manually test: <scenario> (omit this section if empty)

      ## What Looks Good
      - 2–4 specific strengths — name the design decision, not just "good code"

      ---
      *🤖 code-review · {model}*
      ```
