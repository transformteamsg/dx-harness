# Report Template

*(Local Branch Review Path only)*

```markdown
# Code Review — <branch> (<YYYY-MM-DD HH:MM>)

> **File:** `review/<safe-branch>/report-<YYYYMMDDHHMMSS>.md`
> **Based on:** full branch diff since diverging from `<base>`

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Important    | N |
| 🟡 Nit          | N |
| 🟣 Pre-existing | N |

**Truncated:** the <angle> angle reached its 6-candidate ceiling with N more outstanding. Omit this line when no angle truncated.

**Skipped:** N path(s) matched a skip rule in `REVIEW.md` and were not reviewed. Omit this line when nothing was skipped.

<One paragraph: what the change does well, the biggest risk, recommended next step.>

---

## Findings

Each finding follows this structure, grouped under `### 🔴 Important`, `### 🟡 Nit`, `### 🟣 Pre-existing` — omit any section with no entries.

#### 1. <One-sentence summary>

**File:** `path/to/file.ext` · **Line:** 42 · **Triage:** Fixed / To be fixed

```<lang>
// 5–15 lines of context; mark the problem line with // ←
```

**Problem:** What breaks, what input/state triggers it, what goes wrong.

**Suggestion:**
```<lang>
// Corrected version
```

> Optional one-line tradeoff note.

---

## Reviewer To-Do

*(omit this section if empty)*

- Manually test: <scenario with no automated test>

---

## What Looks Good

- 2–4 specific strengths — name the design decision, not just "good code"
```
