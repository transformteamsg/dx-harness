# Review angles

Run by analysis step 2, on the diff that step was given. Run all eight. Work through each checklist item explicitly, rather than scanning for anything that stands out: raise every candidate the angle finds, and let step 2 rank and trim to 6. The ceiling bounds what gets posted, never what gets examined.

Each candidate carries `file`, `line`, `summary`, and `failure_scenario`, plus a severity from the Severity levels table in `SKILL.md`. Security sets its own severity floor, and says so below. Return the candidates to analysis step 3; the labelling, dropping, and posting rules all live in `SKILL.md`.

### Line-by-line

Look for defects in individual statements or small expressions.

- **Condition logic:** inverted `==`/`!=`, wrong boolean operator (`&&` vs `||`), missing negation, condition that is always-true or always-false
- **Off-by-one:** boundary comparisons (`<` vs `<=`), slice/index ranges, loop start/end values, fence-post in pagination or chunking
- **Null/nil safety:** value used before a null check, null returned by a function and immediately dereferenced by its caller, optional field accessed unconditionally
- **Concurrency:** a concurrent call whose result is never waited for on a path that needs it, or a value read before the work producing it finished. In JS or TypeScript that is a missing `await` or a fire-and-forget promise on a critical path; in Go, a goroutine nobody waits on, a `WaitGroup` never awaited, or shared state written from two goroutines without a lock or channel
- **Error handling:** catch block that swallows the error (no re-throw, no log, no observable side-effect), error return value ignored at the call site
- **Type coercion:** implicit comparison between incompatible types, string + number concatenation where arithmetic addition was intended
- **Mutation:** function modifying an argument it doesn't own, shared collection mutated during iteration

### Removed behaviour

Look for functionality that was deleted but whose absence creates a gap.

- **Input validation:** was a null, length, type, or range check removed from an entry point or guard clause?
- **Error propagation:** was an error path dropped? A `try`/`catch` added without a re-throw, an ignored error return, an unhandled promise rejection, a Go `err` assigned and never checked, or a `defer`/`recover` that swallows a panic without logging it
- **Test deletions:** were any tests deleted that cover code paths still present in production code?
- **Guards:** was a defensive condition removed or its predicate weakened (e.g. `> 0` changed to `>= 0`)?
- **Rate limiting / throttling:** was a call-frequency cap, debounce, or retry limit removed?
- **Observability:** was a log, metric, or trace statement removed from an error path or a significant state transition?

### Security

Look for a change that lets untrusted input reach somewhere it should not, or real personal data reach the repository. Five classes, deliberately few.

- **Secrets in the diff:** was a key, token, password, connection string, or private key added to source, a config file, a fixture, or a test? A committed secret is compromised whether or not the file is later changed, so say that rather than suggesting it be edited out.
- **Injection:** does untrusted input reach a SQL query, a shell command, an HTML or template render, or an eval-like call by concatenation or interpolation rather than through a parameterised or escaping API?
- **Authorisation:** does a new or changed entry point read or write something on behalf of a caller without establishing that the caller may? Look for the check the neighbouring handlers make and this one does not.
- **Real personal data in the diff:** was a fixture, seed, test, or mock populated with data that looks real rather than invented? Singapore NRIC and FIN numbers, phone numbers, addresses, full names beside dates of birth, and anything that could belong to an actual person. Generated test data in a real format is fine; data copied from somewhere real is not.
- **Untrusted input into a dangerous sink:** does caller-controlled data reach a filesystem path, an outbound request URL, a deserialiser, or a redirect target without being constrained to something known-safe? This covers path traversal, server-side request forgery, and unsafe deserialisation.

**One floor, otherwise the usual severity rules: a CONFIRMED security finding is always Important.** A finding you cannot verify still posts, labelled PLAUSIBLE, and being about security does not make it Important.

### Cross-file

Look for callers or dependents broken by changes in this diff.

- **Signature changes:** function/method signature changed — are all call sites updated to match?
- **Return type changes:** return shape or type changed — do all callers handle the new shape correctly?
- **Precondition strengthening:** function now requires a new invariant (non-null param, specific ordering, pre-initialised state) — do all callers satisfy it?
- **Interface / type changes:** a shared type, interface, or schema changed — are all implementations and consumers updated?
- **Shared utility changes:** a utility used in more than one place was changed — check every caller, not just the one that motivated the change

### Reuse

Look for new code that duplicates something already available.

- **Utility duplication:** does this logic already exist in a shared, utils, or helpers module?
- **Custom error types:** does this code define a new error class or sentinel value that already exists elsewhere in the codebase?
- **Parsing / serialisation:** does this code re-implement data transformation that a shared formatter or library already provides?
- **Validation:** does this code validate inputs in a way an existing validator already handles?

### Simplification

Look for complexity that doesn't pay for itself.

- **Redundant variable:** variable assigned once and used once — could inline it without losing clarity
- **Dead branch:** a condition provably always true or always false given surrounding invariants
- **Copy-paste variation:** two or more blocks doing nearly the same thing with minor differences — could be parameterised
- **Deep nesting:** three or more levels of `if`/loop nesting that a guard clause or extracted function would flatten
- **Unnecessary intermediate:** value transformed through multiple named steps that could be composed directly

### Efficiency

Look for performance problems on reachable paths.

- **Loop-internal constant:** value that doesn't change across iterations computed inside the loop body
- **N+1 I/O:** database query, network call, or file read inside a loop over a result set
- **Sequential I/O:** multiple independent I/O operations run in series when they could run concurrently
- **Over-fetching:** loading a full record or collection when only a small subset of fields or items is needed downstream
- **Blocking hot path:** synchronous or CPU-heavy work on a latency-sensitive request path that should be deferred or offloaded

### Altitude

Look for band-aid patches to shared infrastructure instead of fixing the underlying problem.

- **Special-case parameter:** new parameter added to a shared function whose only purpose is to change behaviour for one specific caller
- **Caller-specific branch:** `if (callerContext === 'X')` or equivalent inside shared infrastructure — shared code shouldn't know about its callers
- **Output patching:** post-processing the result of a shared function at the call site to fix a problem that belongs inside the function itself
- **Layered duplication:** the same logic implemented at multiple layers (e.g. controller + service + repo) because no single layer owns it
