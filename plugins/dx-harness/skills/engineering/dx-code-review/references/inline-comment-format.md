# Inline comment format

Used by the review sequence (step 8) in `SKILL.md`. **The commands here are GitHub's.** On GitLab, take each from the reviewing section of [../../../../procedures/pr-mechanics.md](../../../../procedures/pr-mechanics.md), which maps them one for one; the body format below is the same on both. All values are already available from steps 1–2: `{owner}` and `{repo}` from step 1, which takes them from the pull request rather than the working directory, PR number from step 1, and `{head_sha}` from the `headRefOid` field in the `gh pr view` response.

## Saying whether it was verified

Every comment carries exactly one of two lines, from the label the analysis already assigned.

- **CONFIRMED** carries **Verified:** and the `file:line` that establishes the behaviour. For a Removed behaviour finding, cite the removal in the diff.
- **PLAUSIBLE** carries **Unverified:** and what would settle it, in one line: what to run, read, or check.

A plausible finding is posted, not held back. Volume is the nit cap's job, never this label's.

## Saying what blocks

A 🟡 Nit or 🟣 Pre-existing comment carries `(not blocking)` on its first line, immediately after the summary. A 🔴 Important comment carries nothing extra.

## The recurring-pattern line

Include it only on a finding that analysis step 7 tagged `[AI-PATTERN]`, and omit the line entirely otherwise. Never print it empty.

It carries the row's ID, `Pattern name`, `Confirmed by` count, and `Prevention` cell. The count matters to the author: seen once is a coincidence, seen five times is a habit.

## Asking whether the finding helped

The footer's second line carries `👍 helpful / 👎 not helpful`, below the marker line. It is an invitation to react to the comment with an emoji, not a button and not a link. The counts it collects are the only measure of whether findings land, until something better exists to measure that. Reactions are native on both forges, so the author needs no link and no form, and the counts come back on the next run's thread query at no extra cost.

Invite it, never chase it. A finding that goes unreacted is the ordinary case, and an author who ignores the ask has still had the finding.

## Posting each finding

Assign the body to a variable first to avoid shell escaping issues with multiline content:

```bash
BODY="**[Severity] One-sentence summary**  <!-- 🟡 and 🟣 append: (not blocking) -->

\`\`\`<lang>
// 5–10 lines of context; problem line marked with // ←
\`\`\`

**Problem:** What breaks, what input/state triggers it, what goes wrong.

**Verified:** `path/to/file.ts:42` establishes it.        <!-- CONFIRMED -->
**Unverified:** <what would confirm or rule this out>.    <!-- PLAUSIBLE -->

**Suggestion:**
\`\`\`<lang>
// Corrected version
\`\`\`

**Recurring pattern:** AP-NNN <Pattern name>, seen N time(s) in this repository. <Prevention>

---
*🤖 dx-code-review · {model}*
👍 helpful / 👎 not helpful"

Post every finding in **one review**, not one comment at a time. The comments endpoint creates a standalone comment and notifies the author once per call, so a five-finding review arrives as five notifications. The reviews endpoint takes them all in a single `comments` array and notifies once. The threads it creates are ordinary review threads, so the deduplication in step 6 and the resolution in step 7 keep working unchanged.

Build the array, one entry per finding, then post it:

```bash
cat > /tmp/review.json <<'JSON'
{
  "commit_id": "{head_sha}",
  "event": "COMMENT",
  "comments": [
    { "path": "{file_path}", "line": {line_number}, "side": "RIGHT", "body": "{body}" }
  ]
}
JSON

gh api --method POST "repos/{owner}/{repo}/pulls/{pr_number}/reviews" --input /tmp/review.json
```

Pass the payload through a file. A finding body holds backticks and fenced code, and an inline `-f body=` lets the shell run a backticked span as command substitution.

Use `"event": "COMMENT"`. Never `REQUEST_CHANGES` or `APPROVE`: approving is the reviewer's act, not the skill's.

**Fallback:** the whole request fails if any single comment names a line outside the diff, and the error does not say which one. Rather than retrying blind, re-post with the unanchorable comments removed from the array, then send those as one regular PR comment naming the file and line each refers to:

```bash
gh pr comment {pr_number} --repo {owner}/{repo} --body "$BODY"
```
