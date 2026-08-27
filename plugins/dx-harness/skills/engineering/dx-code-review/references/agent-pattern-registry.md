# Agent pattern registry

The schema of a reviewed repository's `review/agent-patterns.md`, and the rules for reading it. The shipped standard lives beside this file in [agent-pattern-standard.md](agent-pattern-standard.md), which carries the 9 built-in patterns as unobserved rows (`Confirmed by: 0`).

**This registry is read-only to `dx-code-review`.** The review matches findings against it and drops findings whose pattern is suppressed. It never creates a row, never increments a count, and never commits. A repository that wants an overlay maintains it itself.

The counts and the status are therefore a repository's own record, not a review's output. They still govern what a review does: a suppressed row silences its pattern, and the precedence rule below decides which row applies.

## File schema

```markdown
# Agent Pattern Registry

> Maintained by this repository. Read by `dx-code-review` when it classifies findings, and by `dx-implement-issue` as an anti-pattern list.
> Deduplication key: Pattern name (case-insensitive).
> A suppressed row is not raised by a review. Keep it: it is the record that the pattern was tried and rejected here.

| ID | Angle | Pattern name | Trigger | Prevention | Concrete example | First seen | Severity | Confirmed by | Rejected by | Status |
|----|-------|-------------|--------|-----------|-----------------|------------|----------|-------------|-------------|--------|
```

- **ID**: sequential `AP-NNN`, never reused
- **Angle**: one of the 9 review angle names (e.g. Reuse, Security, Altitude)
- **Pattern name**: directive form, 3–6 words, title-cased — the deduplication key (e.g. "Search Before Implementing Utilities")
- **Trigger**: one sentence describing the concrete condition that matches this pattern (e.g. "logic re-implemented that already exists in a shared or utils module")
- **Prevention**: one sentence, imperative voice, stating what to do instead
- **Concrete example**: one sentence anchored to this project with a file path or function name — `—` for an unobserved row in the standard
- **First seen**: ISO date — `—` for an unobserved row in the standard
- **Severity**: 🔴 Important / 🟡 Nit / 🟣 Pre-existing — `—` for an unobserved row in the standard
- **Confirmed by**: `N review(s)` — how many times this repository has accepted a finding this pattern tagged. `0` for a row in the standard that has not been observed here
- **Rejected by**: `N review(s)` — how many times this repository has rejected a finding this pattern tagged. Set it above `Confirmed by`, at 2 or more, to suppress the pattern
- **Status**: `active`, or `suppressed (YYYY-MM-DD)` with the date suppression was applied. A suppressed row is not raised by a review


## Precedence

`review/agent-patterns.md` in the reviewed repository holds **only the patterns that repository has actually observed**. The nine shipped patterns stay in the plugin, in `references/agent-pattern-standard.md`, and are never copied into a repository. Classification reads the two together, and the repository's file is the overlay: where both carry the same `AP-NNN`, its row wins, because it is the one with that repository's counts and status.

**The overlay belongs to the reviewed repository, not to the reviewer's working directory.** The review needs no checkout, so it fetches the overlay from the pull request's own repository. Reading it from disk would match one project's findings against another project's rows, and the suppression rule would then silently drop findings on a decision taken in a different codebase.
