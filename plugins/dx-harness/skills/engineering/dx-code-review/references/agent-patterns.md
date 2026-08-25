# Agent Pattern Standard

> The patterns every repository using `dx-code-review` is held to. Shipped with the plugin, edited only here, and never copied into a consuming repository.
>
> `dx-code-review` and `dx-implement-issue` read this as the underlay beneath a repository's own `review/agent-patterns.md`, which holds only the patterns that repository has observed. Where both carry the same `AP-NNN`, the repository's row wins: it is the one with local counts and status, and it is how a repository suppresses a pattern that is wrong for it.
>
> The six right-hand columns stay empty here. `Concrete example`, `First seen`, `Severity`, `Confirmed by`, `Rejected by`, and `Status` are per repository and are filled in by that repository's overlay, never in this file.
>
> Deduplication key: Pattern name, case-insensitive. Adding a pattern here is a change to the standard and goes through a pull request, not through a review.

| ID | Angle | Pattern name | Trigger | Prevention | Concrete example | First seen | Severity | Confirmed by | Rejected by | Status |
|----|-------|-------------|--------|-----------|-----------------|------------|----------|-------------|-------------|--------|
| AP-001 | Reuse | Search Before Implementing Utilities | Logic re-implemented that already exists in a shared or utils module. | Grep `lib/` and `utils/` before writing a new transform, parse, or validate function. | — | — | — | 0 | 0 | active |
| AP-002 | Simplification | Parameterise Instead of Copy-Pasting | Two or more nearly-identical blocks with only minor differences. | Extract a shared function with parameters for the variation; never duplicate a block of more than 5 lines with only minor changes. | — | — | — | 0 | 0 | active |
| AP-003 | Removed behavior | Document Before Deleting Tests or Guards | Test or guard deleted with no reason in the commit message or PR description. | If deleting a test or guard, state the reason in the commit message subject line. | — | — | — | 0 | 0 | active |
| AP-004 | Cross-file | Update All Callers on Signature Change | Function signature changed without updating every call site. | After changing a function signature, grep for all call sites and update each before committing. | — | — | — | 0 | 0 | active |
| AP-005 | Altitude | Fix Inside the Function Not at the Call Site | Post-processing a shared function's result at the call site to fix a problem that belongs inside the function. | If correcting output at the call site, ask whether the fix belongs inside the shared function instead. | — | — | — | 0 | 0 | active |
| AP-006 | Line-by-line | Use Installed API Version | Library function, method, or option used that does not exist in the installed version. | Check the installed version in the manifest before using an API; compile or type-check before committing. | — | — | — | 0 | 0 | active |
| AP-007 | Line-by-line | Use Domain-Specific Variable Names | Production code using `data`, `result`, `response`, `temp`, `item` where the surrounding codebase uses domain-specific names. | Name variables after the domain concept they hold, not their data type or role in the computation. | — | — | — | 0 | 0 | active |
| AP-008 | Line-by-line | Log or Re-throw in Every Catch | Catch block or error branch with no re-throw, no log, and no observable side-effect. | Every catch block must re-throw, log, or produce a visible side-effect — never leave it silent. | — | — | — | 0 | 0 | active |
| AP-009 | Altitude | Justify Every New Abstraction Layer | Interface, wrapper, or abstraction layer introduced with a single implementation and no articulated reason. | Before adding an abstraction layer, state in the commit message why the indirection is justified. | — | — | — | 0 | 0 | active |