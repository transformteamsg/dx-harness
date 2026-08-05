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

gh api \
  --method POST \
  "repos/{owner}/{repo}/pulls/{pr_number}/comments" \
  -f body="$BODY" \
  -f commit_id="{head_sha}" \
  -f path="{file_path}" \
  -F line={line_number} \
  -f side="RIGHT"
```

**Fallback:** If the API returns a 422 (the line is not part of the diff), post as a regular PR comment:

```bash
gh pr comment {pr_number} --body "$BODY"
```
