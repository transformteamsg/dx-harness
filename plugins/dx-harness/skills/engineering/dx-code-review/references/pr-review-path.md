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

1. Parse the request, and establish which forge and which repository it belongs to. This decides everything downstream, so get it right before running anything else.

   **Name the forge first**, per [../../../../procedures/pr-mechanics.md](../../../../procedures/pr-mechanics.md). A URL names its own host, which settles it outright and is the reliable answer for a repository mirrored on both. Otherwise read `git remote get-url origin`. A host containing `github.com` is GitHub and one containing `gitlab` is GitLab; if the remote names neither, say so and stop rather than guessing at a CLI.

   Everything below is written in GitHub's commands. The GitLab equivalent for each is in that procedure's command map and its reviewing section, and the rest of this path is identical: same angles, same verification, same volume control, same summary. Report in the platform's own vocabulary, so a GitLab developer is told about a merge request and an MR number, never a pull request.
   - **Full URL** (for example `https://github.com/owner/repo/pull/42`, or `https://gitlab.com/owner/repo/-/merge_requests/42`): take `{number}`, `{owner}`, and `{repo}` from the URL itself. The pull request names its own repository, and that is the reviewed repository.
   - **Number alone**: the reviewed repository is the one the working directory is in, because a bare number means "here". Read it with `gh repo view --json owner,name`.

   Once `{owner}` and `{repo}` are known, pass `--repo {owner}/{repo}` to every `gh` call in this path, and use them in every `gh api` path. Never let a later command resolve the repository from the working directory again. This path does not require the reviewed branch, or the reviewed repository, to be checked out, so the directory the reviewer happens to be sitting in is unrelated to the pull request under review and is frequently a different project.

   **Check the forge CLI before running anything else.** If `gh` or `glab` is absent, or present but not authenticated, stop and say which tool is missing and the command that fixes it. Do not start a review you cannot post.

2. Fetch request metadata:
   ```bash
   gh pr view {number} --repo {owner}/{repo} --json number,headRefName,headRefOid,baseRefName,title
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
4. Fetch the full PR diff, and the reviewed repository's pattern overlay:
   ```bash
   gh pr diff {number} --repo {owner}/{repo}

   gh api "repos/{owner}/{repo}/contents/review/agent-patterns.md?ref={head_sha}" -q '.content' | base64 -d
   ```
   The overlay is not in the diff and the branch is not checked out, so it has to be fetched like everything else on this path. A 404 means the repository has no overlay, which is the ordinary case: the Analysis Phase then matches against the shipped standard alone.

   **Never read `review/agent-patterns.md` from disk on this path.** A file at that path belongs to whichever repository the reviewer is sitting in, so reading it would match one project's findings against another project's patterns, and after the suppression rule would silently drop findings on the strength of a decision taken in a different codebase.
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

      Include the **Held back**, **Truncated**, **Skipped**, **Registry**, and **Suppressed** lines only when they are non-empty. Never print an empty one: a review that held nothing back and truncated nothing should say neither.
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

      **Registry:** N finding(s) matched a known pattern, and N matched none. This path records nothing, because recording follows the author saying which findings were real and this path has no triage.

      For each finding that matched nothing, render the row it would propose and the `gh issue create` command that would file it, so acting on it is one copy rather than a second review. A team that reviews only through pull requests otherwise never adds a pattern, and would have no way to notice that.

      **Suppressed:** N finding(s) were dropped because their pattern is suppressed in this repository's registry.

      ## Reviewer To-Do
      - Manually test: <scenario> (omit this section if empty)

      ## What Looks Good
      - 2–4 specific strengths — name the design decision, not just "good code"

      ---
      *🤖 code-review · {model}*
      ```
