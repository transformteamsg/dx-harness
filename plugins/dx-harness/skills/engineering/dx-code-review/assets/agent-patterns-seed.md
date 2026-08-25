# Agent Pattern Registry

> Auto-maintained by `dx-code-review`. Read by `dx-implement-issue` as an anti-pattern list.
> Deduplication key: Pattern name (case-insensitive). Increment "Confirmed by" on recurrence.
> When a pattern is promoted to a programmatic guard, remove its row and note the guard location in a comment above the table.
> Seed rows below start at `Confirmed by: 0` — unobserved. The first real match fills in `Concrete example`, `First seen`, and `Severity`, and bumps the count to `1 review`.

| ID | Angle | Pattern name | Trigger | Prevention | Concrete example | First seen | Severity | Confirmed by |
|----|-------|-------------|--------|-----------|-----------------|------------|----------|-------------|
| AP-001 | Reuse | Search Before Implementing Utilities | Logic re-implemented that already exists in a shared or utils module. | Grep `lib/` and `utils/` before writing a new transform, parse, or validate function. | — | — | — | 0 |
| AP-002 | Simplification | Parameterise Instead of Copy-Pasting | Two or more nearly-identical blocks with only minor differences. | Extract a shared function with parameters for the variation; never duplicate a block of more than 5 lines with only minor changes. | — | — | — | 0 |
| AP-003 | Removed behavior | Document Before Deleting Tests or Guards | Test or guard deleted with no reason in the commit message or PR description. | If deleting a test or guard, state the reason in the commit message subject line. | — | — | — | 0 |
| AP-004 | Cross-file | Update All Callers on Signature Change | Function signature changed without updating every call site. | After changing a function signature, grep for all call sites and update each before committing. | — | — | — | 0 |
| AP-005 | Altitude | Fix Inside the Function Not at the Call Site | Post-processing a shared function's result at the call site to fix a problem that belongs inside the function. | If correcting output at the call site, ask whether the fix belongs inside the shared function instead. | — | — | — | 0 |
| AP-006 | Line-by-line | Use Installed API Version | Library function, method, or option used that does not exist in the installed version. | Check the installed version in the manifest before using an API; compile or type-check before committing. | — | — | — | 0 |
| AP-007 | Line-by-line | Use Domain-Specific Variable Names | Production code using `data`, `result`, `response`, `temp`, `item` where the surrounding codebase uses domain-specific names. | Name variables after the domain concept they hold, not their data type or role in the computation. | — | — | — | 0 |
| AP-008 | Line-by-line | Log or Re-throw in Every Catch | Catch block or error branch with no re-throw, no log, and no observable side-effect. | Every catch block must re-throw, log, or produce a visible side-effect — never leave it silent. | — | — | — | 0 |
| AP-009 | Altitude | Justify Every New Abstraction Layer | Interface, wrapper, or abstraction layer introduced with a single implementation and no articulated reason. | Before adding an abstraction layer, state in the commit message why the indirection is justified. | — | — | — | 0 |
