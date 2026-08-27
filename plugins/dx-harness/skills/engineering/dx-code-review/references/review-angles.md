# Review angles

Run by analysis step 2, on the diff that step was given. Run all nine; each surfaces up to 6 candidates and stops there. Work through each checklist item explicitly, rather than scanning for anything that stands out.

Each candidate carries `file`, `line`, `summary`, and `failure_scenario`, plus a severity from the Severity levels table in `SKILL.md`. Two angles set their own severity floor, and each says so below. Return the candidates to analysis step 3; the labelling, dropping, and posting rules all live in `SKILL.md`.

### Line-by-line

Look for defects in individual statements or small expressions.

- **Condition logic:** inverted `==`/`!=`, wrong boolean operator (`&&` vs `||`), missing negation, condition that is always-true or always-false
- **Off-by-one:** boundary comparisons (`<` vs `<=`), slice/index ranges, loop start/end values, fence-post in pagination or chunking
- **Null/nil safety:** value used before a null check, null returned by a function and immediately dereferenced by its caller, optional field accessed unconditionally
- **Async correctness:** async call made without `await`, `await` on a non-async value, fire-and-forget on a critical path with no error handling
- **Error handling:** catch block that swallows the error (no re-throw, no log, no observable side-effect), error return value ignored at the call site
- **Type coercion:** implicit comparison between incompatible types, string + number concatenation where arithmetic addition was intended
- **Mutation:** function modifying an argument it doesn't own, shared collection mutated during iteration

### Removed behaviour

Look for functionality that was deleted but whose absence creates a gap.

- **Input validation:** was a null, length, type, or range check removed from an entry point or guard clause?
- **Error propagation:** was an error path dropped — try/catch added without re-throw, error return ignored, promise rejection left unhandled?
- **Test deletions:** were any tests deleted that cover code paths still present in production code?
- **Guards:** was a defensive condition removed or its predicate weakened (e.g. `> 0` changed to `>= 0`)?
- **Rate limiting / throttling:** was a call-frequency cap, debounce, or retry limit removed?
- **Observability:** was a log, metric, or trace statement removed from an error path or a significant state transition?

### Security

Look for a change that lets untrusted input reach somewhere it should not. Four classes, deliberately few, because a longer list produces speculation.

- **Secrets in the diff:** was a key, token, password, connection string, or private key added to source, a config file, a fixture, or a test? A committed secret is compromised whether or not the file is later changed, so say that rather than suggesting it be edited out.
- **Injection:** does untrusted input reach a SQL query, a shell command, an HTML or template render, or an eval-like call by concatenation or interpolation rather than through a parameterised or escaping API?
- **Authorisation:** does a new or changed entry point read or write something on behalf of a caller without establishing that the caller may? Look for the check the neighbouring handlers make and this one does not.
- **Untrusted input into a dangerous sink:** does caller-controlled data reach a filesystem path, an outbound request URL, a deserialiser, or a redirect target without being constrained to something known-safe? This covers path traversal, server-side request forgery, and unsafe deserialisation.

**One floor, otherwise the usual severity rules: a CONFIRMED security finding is always Important.** A finding you cannot verify still posts, labelled PLAUSIBLE, and being about security does not make it Important.

### Design

Look for a change to an interface that breaks the standard this repository is held to.

**Every design finding cites a control ID from the standards catalogue, and one that does not is dropped.** "This spacing looks wrong" does not post; "LAY-3" does. Read `standards/catalog.yaml`, three levels up from this skill, and cite the control by ID.

- **Accessibility:** does the change break an A11Y control? Contrast, focus order, keyboard reachability, labelling, and target size are the ones a diff can show.
- **Tokens and typography:** does it introduce a raw value where the catalogue requires a token, or a typeface or scale step the standard does not carry?
- **Component and layout:** does it reimplement something the catalogue already defines, or violate a layout control?
- **Content:** does a new or changed user-facing string break a CNT control, or an anti-slop SLP one?

**Severity: a failed A11Y control is Important, everything else here is a Nit.**

**This angle reads the diff only.** A control needing the whole codebase to judge, such as whether a component duplicates one three directories away, is out of scope here and belongs to the design skills. This angle will therefore miss things, which is accepted.

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
