---
name: dx-code-review
description: 'Use when asked to review a pull request or merge request, posting findings as inline comments on the request itself. Triggers on "review this PR", "review this merge request", "give me feedback on this PR", "post findings to PR", "add review comments to the pull request", or any request to review a pull request. Reviews a pull request only: it does not review an uncommitted local working branch.'
---

# Code review

Reviews a pull request with 9 angles across its diff and posts findings as inline comments on the request. Works on GitHub pull requests and GitLab merge requests.

Reads and reports only. Never edits a file, never commits, never issues a merge verdict.

---

## Getting the pull request

- **Link or number provided** → use it, go to the sequence.
- **Nothing provided** → ask, then wait:

  > "Which pull request should I review? Paste the link, or give me the number if it is in this repository."

Never fall back to reviewing the working branch. There is no local-branch mode.

Run the sequence in a fresh subagent. Pass it this `SKILL.md`, the link or number, and nothing else.

---

## The standard

Approve better, not perfect. The bar is whether the change leaves the system healthier than it found it.

- **Only 🔴 Important blocks.** Everything else is a suggestion the author may decline without reply.
- **Never issue a merge verdict.** Report the findings and stop. "No blocking findings" is allowed; "good to merge" is not.

## Severity levels

| Level | Blocking | What it means |
|-------|----------|--------------|
| 🔴 **Important** | Yes | A bug that should be fixed before merging. |
| 🟡 **Nit** | No | A minor issue, worth fixing but not blocking. |
| 🟣 **Pre-existing** | No | A bug that exists in the codebase but was not introduced by this PR. |

---

## Analysis

Run on the diff from sequence step 4, then return to the sequence.

### Before step 1: the repository's review instructions

Read `REVIEW.md` at the repository root. Only the root file; ignore any nested one.

- **Present and readable** → apply it for the rest of the run. It can add rules to check and paths to skip.
- **Present but unreadable** → stop the review, name the file and the error, post nothing.
- **Absent** → run as this file describes, and say nothing about it.

Skip rules act on the diff: remove every matching path before step 1, so no angle sees them and they consume no candidate ceiling or nit budget. Record the skipped paths for the summary.

A finding produced by a rule from `REVIEW.md` names that rule.

### The steps

1. Run the issue and test plan check (below). It must complete before the angles.
2. Run all 9 review angles (below) on the diff. Collect candidates with `file`, `line`, `summary`, `failure_scenario`, and a severity from the table above.
   - An angle stops at 6 candidates. If it reaches 6 with more it would have raised, record the angle name and the number dropped for the summary.
3. Deduplicate: same defect at the same location, keep one.
4. Label each candidate **CONFIRMED**, **PLAUSIBLE**, or **REFUTED**, and carry the label into the comment.
   - **CONFIRMED** requires evidence, not inference: for a behaviour claim, hold the `file:line` that establishes it. A function named `validateInput` is not evidence that it validates.
   - **A behaviour claim with no citation is dropped**, not downgraded. It never posts and never reaches the summary counts.
   - **PLAUSIBLE by default:** races, nil on rare-but-reachable paths, falsy-zero, off-by-one, regex missing anchor. These post, labelled as plausible. The default is conditional: it holds because these usually cannot be settled by reading, so a cited line that does settle one makes it CONFIRMED. The shape of the defect never decides the label on its own.
   - **A Removed behaviour finding cites the removal in the diff**, not the file.
   - **REFUTED only when provably wrong** — cite the line or invariant that rules it out.

   Citations are required for behaviour claims only. For Simplification, Reuse, and Altitude, the diff is the evidence.
5. For each CONFIRMED or PLAUSIBLE finding, validate the suggestion against the repo's manifest (`package.json`, `go.mod`, `requirements.txt`, `Gemfile`):
   - **Found** → check any library named in the suggestion exists at the installed version; revise it, or note the upgrade it needs.
   - **None** → note that no manifest was found, and trace any shell command in the suggestion against the failure modes described.
6. Drop every REFUTED finding, silently.
7. **Agent pattern classification.** Match each remaining finding's `Pattern name` / `Trigger` against two sources read together:
   - the reviewed repository's `review/agent-patterns.md`, fetched in step 4 — **never read from disk**
   - this skill's [references/agent-pattern-standard.md](references/agent-pattern-standard.md)

   Where both carry the same `AP-NNN`, the repository's row wins. Tag matches `[AI-PATTERN]`.

   **This step reads and tags. It writes nothing.** The registry is read-only here; a repository maintains its own counts and status. Schema and precedence: [references/agent-pattern-registry.md](references/agent-pattern-registry.md).

   **Drop any finding matching a suppressed row**: not tagged, not verified, not posted. Count the drops for the summary.

### Step 1 in detail: the issue and test plan check

Checks the change against the issue it closes and the tests against the stated test plan. Can stop the review, or add an Important finding of its own.

Steps, the shape-to-contract table, and the exact prompts: [references/issue-and-test-plan-check.md](references/issue-and-test-plan-check.md).

---

## Review angles

Nine, run by analysis step 2: Line-by-line, Removed behaviour, Security, Design, Cross-file, Reuse, Simplification, Efficiency, Altitude.

Checklists and the severity floors Security and Design set: [references/review-angles.md](references/review-angles.md). Run all nine.

**Correctness first.** On the lower-altitude angles (Simplification, Reuse, Efficiency, Altitude), raise only genuine problems, not cosmetic preferences.

---

## The review sequence

Source the diff from the forge's CLI. The branch is never checked out and no file is written.

Every posted comment ends with this footer, `{model}` replaced by the current model ID (for example `claude-sonnet-4-6`):

```
---
*🤖 dx-code-review · {model}*
```

1. Resolve the forge, the repository, and the request number per [../../../procedures/pr-mechanics.md](../../../procedures/pr-mechanics.md) § Resolving the request and its repository. That procedure owns the URL-beats-remote rule, both forge URL shapes, the bare-number case, the `--repo` discipline, and the CLI check. Do not re-derive any of it here.

   The commands below are GitHub's. For GitLab, use the equivalents in that procedure's command map and its reviewing section; everything else in this sequence is identical. Report in the platform's own vocabulary, so a GitLab developer is told about a merge request and an MR number.

2. Fetch request metadata. `headRefOid` is `{head_sha}`, used in step 4:
   ```bash
   gh pr view {number} --repo {owner}/{repo} --json number,headRefName,headRefOid,baseRefName,title
   ```
3. Fetch every existing review thread, for dedup (step 6) and resolution (step 7):
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
   Derive three sets:
   - **All open threads** — `isResolved` is false. Used for dedup in step 6.
   - **Open skill threads** — of those, `comments[0].body` contains `code-review`. Used for resolution in step 7.
   - **Any skill thread** — every thread whose `comments[0].body` contains `code-review`, resolved or not. Non-empty means this is a re-review. Resolved threads count.
4. Fetch the diff and the repository's pattern overlay:
   ```bash
   gh pr diff {number} --repo {owner}/{repo}

   gh api "repos/{owner}/{repo}/contents/review/agent-patterns.md?ref={head_sha}" -q '.content' | base64 -d
   ```
   A 404 means no overlay, which is the ordinary case: match against the shipped standard alone. **Never read `review/agent-patterns.md` from disk.**
5. Run the analysis (above) on the diff from step 4.
6. Deduplicate against existing comments. For each finding, check the **all open threads** set: if a thread already covers the same issue at the same `path` and `originalLine`, or the same concern in substance whoever posted it, do not post it.
7. Resolve addressed conversations. For each **open skill thread** the current diff has addressed:
    ```bash
    gh api graphql -f query='
    mutation($threadId: ID!) {
      resolveReviewThread(input: {threadId: $threadId}) {
        thread { isResolved }
      }
    }' -f threadId="{thread_id}"
    ```
8. **Apply volume control, then post once.**
   - **Never cap Important or Pre-existing.** Post every one.
   - **Cap nits at 5.** Rank CONFIRMED before PLAUSIBLE, then diff order; post the first 5 and carry the number held back to the summary. The cap is global, not per-angle, so one angle may use all 5.
   - **On a re-review (Any skill thread non-empty), post no new nit at all.** Post Important and Pre-existing, resolve addressed threads, hold back every nit not already on an open thread.

   Post everything surviving as a **single review**, not one comment per finding: [references/inline-comment-format.md](references/inline-comment-format.md) for the `gh api` invocation and its fallback.
9. Print the outcome and summary per [references/summary-format.md](references/summary-format.md). Three outcomes: every path skipped, nothing found, findings posted.

---

## Rules

**Code excerpts:** 5–15 lines of context · correct language fence identifier · mark the problem line with `// ←`

**Address the code, never the author:** rewrite any candidate phrased at the developer ("why did you", "you forgot to") before posting. Never submit the original phrasing

**Blocking:** only 🔴 Important blocks. Declining a 🟡 or 🟣 needs no reply

**Problem statements:** name the concrete failure, inputs → wrong output, crash, or data loss. Never "this could be a problem"

**Fix suggestions:** always show corrected code. If no single fix is right, show two options with a one-line tradeoff note

**What looks good:** always include. Specifics only, 2–4 bullets

**Scope:** every confirmed or plausible finding survives the analysis, at every severity. Volume control applies at posting only

**Repository instructions:** only the root `REVIEW.md` is read. A finding from one of its rules names that rule. Skipped paths leave the diff before any angle sees them, and the summary reports them

**Repository identity:** the reviewed repository comes from the pull request, never the working directory (resolution and the `--repo` discipline live in `pr-mechanics.md`). The pattern overlay is fetched from that repository, never read from disk

**Working tree:** never edit, create, or commit a file, including `review/agent-patterns.md`

**Refuted findings:** drop silently. No strikethrough, no "considered but dismissed", no mention

**Reviewer To-Do:** one bullet per scenario with no automated test, phrased as an action ("Manually test: ..."). Include the section whenever it is non-empty; omit the heading entirely when empty
