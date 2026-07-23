# Agent Pattern Registry

Used by the Analysis Phase (shared by both review paths) to persist and promote AI-characteristic findings. The registry is seeded on first use from this skill's [assets/agent-patterns-seed.md](../assets/agent-patterns-seed.md), which ships the 9 built-in patterns as unobserved rows (`Confirmed by: 0`) — the Analysis Phase fills each one in on its first real match and appends genuinely new patterns beyond the 9 as they're found.

## File schema

```markdown
# Agent Pattern Registry

> Auto-maintained by `code-review`. Read by `implement-issue` as an anti-pattern list.
> Deduplication key: Pattern name (case-insensitive). Increment "Confirmed by" on recurrence.
> When a pattern is promoted to a programmatic guard, remove its row and note the guard location in a comment above the table.

| ID | Angle | Pattern name | Trigger | Prevention | Concrete example | First seen | Severity | Confirmed by |
|----|-------|-------------|--------|-----------|-----------------|------------|----------|-------------|
```

- **ID**: sequential `AP-NNN`, never reused
- **Angle**: one of the 7 review angle names (e.g. Reuse, Altitude)
- **Pattern name**: directive form, 3–6 words, title-cased — the deduplication key (e.g. "Search Before Implementing Utilities")
- **Trigger**: one sentence describing the concrete condition that matches this pattern (e.g. "logic re-implemented that already exists in a shared or utils module")
- **Prevention**: one sentence, imperative voice, stating what to do instead
- **Concrete example**: one sentence anchored to this project with a file path or function name — `—` for an unobserved seed row
- **First seen**: ISO date — `—` for an unobserved seed row
- **Severity**: 🔴 Important / 🟡 Nit / 🟣 Pre-existing — `—` for an unobserved seed row
- **Confirmed by**: `N review(s)` — `0` for an unseeded, unobserved row; set to `1 review` on its first real match; incremented on each recurrence

## Programmability evaluation (triggered at `Confirmed by: 3`)

Assess all five criteria:

| Criterion | Question | Disqualifier |
|-----------|----------|--------------|
| **Specificity** | Can this be expressed as an AST rule, regex, or grep without matching valid code? | High false-positive rate |
| **Repeatability** | Does the check produce the same result every run on the same code? | Non-deterministic |
| **Speed** | ≤5 s → pre-commit; ≤30 s → pre-push; slower → CI only | Must fit one tier |
| **Tool availability** | Does an existing linter rule, hook, or binary implement this? | Prefer existing over custom |
| **Semantic dependency** | Does detecting it require understanding code *intent*, not just *structure*? | If yes → not programmable |

A pattern is promotable when: Specificity OK, Repeatability YES, Semantic dependency NO, and Speed fits a tier.

**Known programmability of the 9 built-in criteria:**

| Pattern | Promotable | Tier | Tool |
|---------|-----------|------|------|
| Log or Re-throw in Every Catch | Yes | Pre-commit | ESLint `no-empty` / `@typescript-eslint/no-empty-function`; Go `errcheck` |
| Parameterise Instead of Copy-Pasting | Partial | Pre-push | `jscpd` with minimum-token threshold |
| Update All Callers on Signature Change | Yes (typed langs) | Pre-commit | `tsc --noEmit`; Go compiler |
| Document Before Deleting Tests or Guards | Partial | Pre-push | `git diff` detecting net deletion of `*.test.*` / `*_test.go` files |
| Use Installed API Version | Yes | Pre-commit | `tsc --noEmit`; `go build` (caught by compiler) |
| Use Domain-Specific Variable Names | Partial | Pre-commit | Grep/semgrep — use only if false-positive rate is acceptable |
| Search Before Implementing Utilities | No | — | Requires semantic similarity judgment |
| Fix Inside the Function Not at the Call Site | No | — | Requires understanding layer boundaries |
| Justify Every New Abstraction Layer | No | — | Requires understanding intent |
