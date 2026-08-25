# Inline Comment Format

Used by the PR Review Path (step 8). All values are already available from steps 1–2: `{owner}` and `{repo}` from step 1, which takes them from the pull request rather than the working directory, PR number from step 1, and `{head_sha}` from the `headRefOid` field in the `gh pr view` response.

## Saying whether it was verified

Every comment carries exactly one of two lines, from the label the Analysis Phase already assigned.

- **CONFIRMED** carries **Verified:** and the `file:line` that establishes the behaviour. For a Removed behaviour finding, cite the removal in the diff, because the line it refers to is gone from the file.
- **PLAUSIBLE** carries **Unverified:** and what would settle it, in one line. Say what to run, read, or check. "Unverified" alone tells the author nothing they cannot already see.

A plausible finding is posted, not held back. It is exactly the case worth raising when it cannot be settled by reading, and the label is what lets the author spend their attention accordingly. Volume is the nit cap's job, not this label's.

## Saying what blocks

A 🟡 Nit or 🟣 Pre-existing comment carries `(not blocking)` on its first line, immediately after the summary. A 🔴 Important comment carries nothing extra, because blocking is what Important already means.

The label is for the author, not the reviewer. Without it every comment arrives with the same weight, and someone reading five of them cannot tell whether they are looking at one requirement and four suggestions or five requirements. Declining a comment marked `(not blocking)` needs no reply and no justification.

## The recurring-pattern line

Include it only on a finding that Analysis Phase step 7 tagged `[AI-PATTERN]`, and omit the line entirely otherwise. Never print it empty.

It carries the row's ID, `Pattern name`, `Confirmed by` count, and `Prevention` cell. The count is what makes it worth reading: "seen once" is a coincidence and "seen five times" is a habit, and the author cannot tell which from the finding alone. The Prevention cell is the actionable half, and it is already written in imperative voice for exactly this.

Without this line the tag is computed and discarded. Classification would run on every review and teach the author nothing, which defeats the registry's purpose: `dx-implement-issue` reads it so review teaches implementation, and this line is how review teaches the person.

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
*🤖 code-review · {model}*"

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
