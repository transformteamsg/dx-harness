# Inline Comment Format

Used by the PR Review Path (step 8). All values are already available from steps 1–2: owner and repo from `gh repo view`, PR number from step 1, and `{head_sha}` from the `headRefOid` field in the `gh pr view` response.

## Posting each finding

Assign the body to a variable first to avoid shell escaping issues with multiline content:

```bash
BODY="**[Severity] One-sentence summary**

\`\`\`<lang>
// 5–10 lines of context; problem line marked with // ←
\`\`\`

**Problem:** What breaks, what input/state triggers it, what goes wrong.

**Suggestion:**
\`\`\`<lang>
// Corrected version
\`\`\`

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
gh pr comment {pr_number} --body "$BODY"
```
