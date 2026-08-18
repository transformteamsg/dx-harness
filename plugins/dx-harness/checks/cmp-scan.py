#!/usr/bin/env python3
"""
Component scan: checks/cmp-scan.py
Carries the mechanical half of three component controls: CMP-2 (destructive
actions), CMP-3 (async transactions) and CMP-9 (raw-HTML render sinks). All
three ask the same shape of question (find token X in a file, look for
companion token Y in the same file), which is why they share one script.

Detection rules
───────────────
Rule      Control   What it does
CANDIDATE CMP-2     Lists every handler-shaped destructive identifier with a
          (L0)      verdict on whether a confirm or undo companion sits in the
                    same file. It never judges, and it never errors: see
                    "CMP-2 enumerates, and exits 0" below.
NOERROR   CMP-3     Errors on an async call in a client file with no error path
          (L1)      anywhere in it. Nothing else.
SINK      CMP-9     Errors on a raw-HTML render sink with no allowlisted
          (L1)      sanitiser in the same file, and notes one that has a
                    sanitiser. A sink is never passed in silence.

CMP-2 enumerates, and exits 0
─────────────────────────────
A candidate is not a violation. CMP-2's fail condition is a destructive action
with no consequence surface and no undo or confirmation, and deciding that means
reading the consequence copy. So this half lists candidates and the reviewer
decides. Two mechanical reasons the list cannot signal through the exit code:
detect.py's classify_run() reads exit 1 with no ERROR line as a crashed check,
and a crashed check is reported as a tooling failure rather than as findings.

CMP-2 is L0, the non-waivable floor, so the block has to live somewhere. It
lives in the verification ledger: `--ledger <record.md>` reconciles the listed
candidates against the `| Control | Method | Evidence |` table in a decision
record and errors on any candidate no row dispositions by name. The row is
matched on the candidate key `CMP-2 <path>:<identifier>`, so a blanket
`| CMP-2 | manual | verified manually |` row satisfies nothing.

The candidate key carries no line number on purpose: a line number churns on
every unrelated edit above it and would invalidate a ledger row that is still
correct. Two candidates sharing one identifier in one file therefore share one
key and one row, which is the right granularity for a disposition.

The CMP-2 denylist, applied before anything is emitted
──────────────────────────────────────────────────────
`removeEventListener`, `removeChild`, `.remove()` on a DOM ref, `clearTimeout`,
`clearInterval`, `Map` / `Set` `.delete()`, `revokeObjectURL` and `reset()` on a
form are blanked out of a candidate's text before any verb stem is looked for.
They are DOM and collection housekeeping, not user-facing destructive actions,
and without this the rule drowns: a naive destructive-verb grep over this repo's
`.tsx` files under `app components lib` returns 8 hits, every one of them a
`window.removeEventListener` cleanup, and the denylist takes that to 0, which is
the right answer for a docs site with no destructive actions.

What this script does NOT verify
─────────────────────────────────
- Whether a consequence surface is adequate, whether confirmation copy names the
  object, or whether an undo is reachable (CMP-2's judgment half). The lister
  enumerates; the reviewer decides.
- Whether CMP-3's loading, success and error states are VISIBLE. Proving a state
  is visible means tracing a state variable into JSX and across components, the
  same cross-file mutation tracking a11y-static.py already declares out of
  reach. `components/page-actions.tsx` is why the wider rule is not attempted:
  it holds a `busy` flag it sets and clears but never renders, beside an
  `"idle" | "copied" | "error"` union that a naive "three states exist" matcher
  would false-pass on.
- Whether a CMP-9 sanitiser actually sits at the render boundary rather than
  somewhere else in the file. Presence downgrades the finding to a NOTE that
  asks the reviewer to confirm the boundary; it never suppresses it.
- Whether the content a sink renders came from a different user. That trust
  boundary is the evaluator's read, so every sink is reported.
- CMP-4, CMP-5, CMP-6, CMP-7 and CMP-8. CMP-4 and CMP-8 are judgment controls
  with no mechanical half, CMP-5's gap is accepted, CMP-6 builds inside the
  A11Y-7 structure check, and CMP-7 is judgment already.

Known noise, accepted rather than coded around
───────────────────────────────────────────────
`drop` is one of CMP-2's destructive verb stems, so a drag-and-drop `onDrop`
handler is listed as a candidate. That is a NOTE on a check that exits 0, so it
costs a reviewer one ledger row rather than a build. Narrowing the stem list to
guess at intent would cost a real `handleDropTable`, which is the wrong trade on
a non-waivable floor.

Per-rule selection (additive)
─────────────────────────────
`--rules CMP-3,CMP-9` restricts the emitted findings to those control ids
(comma-separated; `--rules=CMP-3` also works). Without the flag every rule runs.
Unknown ids are a usage error (exit 1); operational errors are never filtered.

Waiver handling
───────────────
CMP-2 is L0 and `waiver: none`: no `dx-waive` marker is parsed for it, and it may
never appear in a "## Waivers granted" table. CMP-3 and CMP-9 are L1 and
`waiver: documented`: an inline `dx-waive CMP-3` / `dx-waive CMP-9` downgrades
the line to the `[CMP-N][waiver-claimed]` form and the run still exits 1.

Output
──────
ERROR <file>:<line> [<CTL-ID>] <found> — suggest: <...>
NOTE  <file>:<line> [<CTL-ID>] <message>
Exit 0 and print nothing (or only NOTE lines, or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any violation.

Usage
─────
  python3 checks/cmp-scan.py <path>...
  python3 checks/cmp-scan.py --ledger <record.md> <path>...
  python3 checks/cmp-scan.py --rules CMP-3,CMP-9 <path>...
  python3 checks/cmp-scan.py --self-test
"""

import importlib.util
import os
import re
import sys

_CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))
_PLUGIN_ROOT = os.path.dirname(_CHECKS_DIR)


def _load_module(filename, alias):
    """Import a sibling check by path. `checks/` is not a Python package and the
    filenames carry hyphens, so this importlib snippet is the house door."""
    path = os.path.join(_CHECKS_DIR, filename)
    spec = importlib.util.spec_from_file_location(alias, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_module("checklib.py", "_dx_checklib")
# audit-record.py owns the ledger table's shape. Reusing its parser rather than
# writing a second one is what keeps --ledger and assertion 10 reading the same
# table; waiver-reconcile.py sets the precedent.
_AR = _load_module("audit-record.py", "_dx_audit_record")
split_sections = _AR.split_sections
find_section = _AR.find_section
find_ledger_table = _AR.find_ledger_table

CHECK_NAME = "cmp-scan"
TARGET_EXTENSIONS = checklib.TARGET_EXTENSIONS
VALID_RULES = {"CMP-2", "CMP-3", "CMP-9"}

CMP9_DETAIL_PATH = os.path.join(_PLUGIN_ROOT, "standards", "controls", "cmp-9.md")


# ── CMP-2 policy ──────────────────────────────────────────────────────────────
# The verb stems that make an identifier destructive. Matched against the
# identifier's camelCase words, not as a bare substring, so `backdrop-blur` and
# `handleDropdownToggle` are not actions.
DESTRUCTIVE_STEMS = frozenset({
    "delete", "remove", "destroy", "archive", "discard", "revoke", "wipe",
    "purge", "drop", "withdraw", "unpublish", "unshare", "revert",
})

# The denylist, applied before anything is emitted. Each span is blanked out of a
# candidate's text, so a verb stem living inside one of these APIs can never make
# a candidate. Blanking (rather than dropping) keeps every other offset intact.
DENYLIST_RES = tuple(re.compile(p) for p in (
    r"\bremoveEventListener\b",
    r"\bremoveChild\b",
    # A DOM ref's remove() takes no arguments; a destructive `remove(id)` does.
    r"\.\s*remove\s*\(\s*\)",
    r"\bclearTimeout\b",
    r"\bclearInterval\b",
    # A Map / Set delete() is a member call. A destructive one is a named
    # function or a server action, so blanking the member form costs nothing:
    # the candidate's own identifier still carries its stem.
    r"\.\s*delete\s*\(",
    r"\brevokeObjectURL\b",
    # A form's reset(). No stem in the list matches `reset`, so this is here for
    # completeness of the documented denylist rather than for reach.
    r"\.\s*reset\s*\(\s*\)",
))

# A confirm or undo companion, in the order reported. `Dialog` alone is not one:
# it needs a destructive-variant button beside it, or every dialog in the tree
# would read as a confirmation.
COMPANION_RES = (
    ("AlertDialog", re.compile(r"\bAlertDialog\b")),
    ("confirm", re.compile(r"(?i)\bconfirm")),
    ("undo", re.compile(r"(?i)\bundo")),
)
DIALOG_RE = re.compile(r"\bDialog\b")
DESTRUCTIVE_VARIANT_RE = re.compile(r"(?i)destructive")

_HANDLER_NAME_RE = re.compile(r"\b((?:on|handle)[A-Z_][A-Za-z0-9_$]*)")
_JSX_PROP_NAME_RE = re.compile(r"^(on[A-Z][A-Za-z0-9_$]*)")
_EXPORT_NAME_RE = re.compile(
    r"\bexport\s+(?:default\s+)?(?:async\s+)?"
    r"(?:function\s*\*?\s*|const\s+|let\s+|var\s+)([A-Za-z_$][A-Za-z0-9_$]*)"
)
_IDENTIFIER_RE = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]*")
_CALLEE_RE = re.compile(r"^([A-Za-z_$][A-Za-z0-9_$.]*)\s*\(")
_USE_SERVER_RE = re.compile(r"""["']use server["']""")
_USE_CLIENT_RE = re.compile(r"""["']use client["']""")

# The kind reported per candidate surface, and the order candidates are read in.
CMP2_SURFACE_KINDS = {
    "cmp2-handler": "handler",
    "cmp2-jsx-prop": "jsx-prop",
    "cmp2-mutation": "mutation",
    "cmp2-export": "server-action",
    "cmp2-fetch-delete": "fetch-delete",
}


def denylisted(text):
    """`text` with every denylisted API span blanked to spaces of equal width."""
    for pattern in DENYLIST_RES:
        text = pattern.sub(lambda m: " " * len(m.group(0)), text)
    return text


def identifier_words(identifier):
    """An identifier's lowercase words, split on camelCase, `_`, `-` and digits.

    Word-splitting rather than substring matching is what keeps `backdrop` and
    `handleDropdownToggle` out of the `drop` stem, while `onDrop` still matches.
    The second boundary is the acronym one, so `handleDELETERow` splits as
    handle / DELETE / Row rather than swallowing the verb into one long word.
    """
    spaced = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", " ", identifier)
    spaced = re.sub(r"(?<=[A-Z])(?=[A-Z][a-z])", " ", spaced)
    return [w.lower() for w in re.findall(r"[A-Za-z]+", spaced)]


def is_destructive(identifier):
    """True when one of the identifier's words is a destructive verb stem."""
    return any(w in DESTRUCTIVE_STEMS for w in identifier_words(identifier))


def first_destructive_identifier(text):
    """The first identifier in `text` carrying a destructive verb stem, or None.
    Callers pass denylisted() text, so an API on the denylist can never win."""
    for m in _IDENTIFIER_RE.finditer(text):
        if is_destructive(m.group(0)):
            return m.group(0)
    return None


def candidate_identifier(surface, text, use_server):
    """
    The destructive identifier a CMP-2 candidate reports, or None when the
    candidate is not destructive once the denylist has been applied.

    `text` is the matched node's text, straight from ast-grep; `use_server` says
    whether the host file carries a "use server" directive, which is what turns
    an exported function into a handler position.
    """
    clean = denylisted(text)

    if surface == "cmp2-handler":
        m = _HANDLER_NAME_RE.search(clean)
        if m and is_destructive(m.group(1)):
            return m.group(1)
        return None

    if surface == "cmp2-jsx-prop":
        prop = _JSX_PROP_NAME_RE.match(clean)
        if prop and is_destructive(prop.group(1)):
            return prop.group(1)
        # The prop name is neutral (`onClick`), so the action is in the value.
        _, _, value = clean.partition("=")
        return first_destructive_identifier(value)

    if surface == "cmp2-mutation":
        # The declared name wins over anything in the hook's options object.
        head, _, tail = clean.partition("=")
        return first_destructive_identifier(head) or first_destructive_identifier(tail)

    if surface == "cmp2-export":
        if not use_server:
            return None
        m = _EXPORT_NAME_RE.search(clean)
        if m and is_destructive(m.group(1)):
            return m.group(1)
        return None

    if surface == "cmp2-fetch-delete":
        m = _CALLEE_RE.match(text.strip())
        callee = m.group(1).split(".")[-1] if m else "fetch"
        # No identifier names this action, so the key is built from the call
        # itself. It stays stable across edits, which is what a ledger row needs.
        return f"{callee}(DELETE)"

    return None


def companion_in(source_text):
    """(found, token) for a confirm or undo companion in one file's source."""
    for token, pattern in COMPANION_RES:
        if pattern.search(source_text):
            return True, token
    if DIALOG_RE.search(source_text) and DESTRUCTIVE_VARIANT_RE.search(source_text):
        return True, "Dialog with a destructive-variant button"
    return False, None


def candidate_key(rel, identifier):
    """The ledger key for a candidate: `CMP-2 <path>:<identifier>`."""
    return f"CMP-2 {rel}:{identifier}"


# ── CMP-3 policy ──────────────────────────────────────────────────────────────
# "Error path" is read generously on purpose. This rule only reports a file with
# NO error path at all, so every pattern here removes findings, and a rule on a
# non-waivable-adjacent control must err towards silence rather than towards a
# false positive on an error path that exists.
CMP3_ERROR_PATH_RES = tuple(re.compile(p) for p in (
    r"\bcatch\b",                                       # try/catch and .catch(
    r"\bonError\b",
    r"\bset[A-Za-z0-9_$]*Error[A-Za-z0-9_$]*\s*\(",     # an error-state setter
    r"\bisError\b",
    r"\berror\s*:",                                     # an error option or field
))
# A framework error path. Without these, the 8 Next.js server components and
# route handlers on this repo's own tree that hold an `await` and no `catch`
# would each be a finding, and 8 false positives on the harness's own site would
# make the rule un-wireable.
CMP3_FRAMEWORK_RES = tuple(re.compile(p) for p in (
    r"\bnotFound\s*\(",
    r"\bredirect\s*\(",
    r"\bunauthorized\s*\(",
    r"\bforbidden\s*\(",
))
# A route segment's own error boundary, or any ancestor segment's.
ROUTE_ERROR_FILENAMES = tuple(
    f"{stem}{ext}"
    for stem in ("error", "global-error", "not-found")
    for ext in (".tsx", ".jsx", ".ts", ".js")
)


def has_route_error_boundary(filepath, levels=12):
    """
    True when a sibling or ancestor route segment carries an error.tsx /
    not-found.tsx. Walks up from the file's own directory and stops at a
    directory holding package.json, which is the app root.
    """
    directory = os.path.dirname(os.path.abspath(filepath))
    for _ in range(levels):
        for name in ROUTE_ERROR_FILENAMES:
            if os.path.isfile(os.path.join(directory, name)):
                return True
        if os.path.isfile(os.path.join(directory, "package.json")):
            return False
        parent = os.path.dirname(directory)
        if parent == directory:
            return False
        directory = parent
    return False


def has_error_path(source_text, filepath):
    """True when the file carries any error path at all."""
    for pattern in CMP3_ERROR_PATH_RES + CMP3_FRAMEWORK_RES:
        if pattern.search(source_text):
            return True
    return has_route_error_boundary(filepath)


# ── CMP-9 policy ──────────────────────────────────────────────────────────────
# The sanitiser allowlist is harness-held, per the ruling that library-name
# knowledge is portfolio-wide rather than product-specific and that a static
# check configures nothing in the repo it is checking. It is read from a marked
# span in the control's own detail file, so growing the list there grows the
# check, the coupling content-lint.py already uses for the SLP-9 and CNT lists.
FALLBACK_SANITISERS = (
    "DOMPurify", "dompurify", "createDOMPurify", "sanitizeHtml",
    "sanitize-html", "xss", "sanitize", "purify",
)

_SANITISER_SPAN_RE = re.compile(
    r"<!--\s*dx-sync:cmp9-sanitisers\b[^>]*-->(.*?)<!--\s*/dx-sync:cmp9-sanitisers\s*-->",
    re.DOTALL,
)


def load_sanitisers(path=CMP9_DETAIL_PATH):
    """
    Read the sanitiser allowlist from cmp-9.md's <!-- dx-sync:cmp9-sanitisers -->
    span. Returns (names, note); `note` is non-None when the embedded fallback
    was used, and the caller prints it. An unreadable list is never a silent
    pass: the scan runs on with the fallback and says so.
    """
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return FALLBACK_SANITISERS, (
            f"NOTE cmp-scan: could not read {path}; using embedded fallback "
            f"sanitiser list"
        )
    m = _SANITISER_SPAN_RE.search(text)
    names = []
    if m:
        body = re.sub(r"<!--.*?-->", " ", m.group(1), flags=re.DOTALL)
        for raw in body.split(","):
            tok = raw.strip().strip("`\"'“”‘’").strip()
            if tok and " " not in tok:
                names.append(tok)
    if not names:
        return FALLBACK_SANITISERS, (
            f"NOTE cmp-scan: parsed {path} but the cmp9-sanitisers list was "
            f"empty; using embedded fallback sanitiser list"
        )
    return tuple(names), None


def sanitiser_in(source_text, sanitisers):
    """The first allowlisted sanitiser identifier present in a file, or None."""
    for name in sanitisers:
        if re.search(r"(?i)" + re.escape(name), source_text):
            return name
    return None


_SINK_NAME_RES = (
    ("dangerouslySetInnerHTML", re.compile(r"\bdangerouslySetInnerHTML\b")),
    ("v-html", re.compile(r"(?i)\bv-html\b")),
    ("{@html}", re.compile(r"\{@html\b")),
    ("innerHTML assignment", re.compile(r"\.\s*innerHTML\s*=")),
    ("outerHTML assignment", re.compile(r"\.\s*outerHTML\s*=")),
    ("insertAdjacentHTML", re.compile(r"\binsertAdjacentHTML\b")),
    ("document.write", re.compile(r"\bdocument\s*\.\s*write(?:ln)?\b")),
    ("rehype-raw", re.compile(r"rehype-raw")),
    ("allowDangerousHtml", re.compile(r"\ballowDangerousHtml\b")),
    ("skipHtml", re.compile(r"\bskipHtml\b")),
)

_FALSE_RE = re.compile(r"(?i)\bfalse\b")
_TRUE_RE = re.compile(r"(?i)\btrue\b")


def sink_token(text):
    """
    The sink this candidate is, or None when the candidate's value closes it.
    `skipHtml` only opens a sink at `false`, and `allowDangerousHtml` only at a
    truthy value; both are offered by the rule whatever their value, because
    which value opens the sink is policy and policy stays here.
    """
    for token, pattern in _SINK_NAME_RES:
        if not pattern.search(text):
            continue
        if token == "skipHtml":
            return token if _FALSE_RE.search(text) else None
        if token == "allowDangerousHtml":
            return None if _FALSE_RE.search(text) else token
        return token
    return None


# ── Waivers ───────────────────────────────────────────────────────────────────
# CMP-2 is absent by design: it is L0 and `waiver: none`, so no marker is parsed
# for it, following a11y-static.py's reasoning for A11Y-2.
WAIVER_RE = re.compile(r"dx-waive\s+(CMP-3|CMP-9)\b", re.IGNORECASE)


def extract_waived_ctl(line):
    """The control id from a dx-waive marker on this line, or None."""
    m = WAIVER_RE.search(line)
    return m.group(1).upper() if m else None


def waived_at(lines, lineno, ctl):
    """
    True when a `dx-waive <ctl>` marker covers this finding's line.

    The marker is read from the finding's own line, as token-audit.py does, and
    from the line directly above it. The extra line is not slack: a CMP-9 sink is
    often a JSX attribute on a line of its own, and JSX accepts no comment in
    attribute position, so the line above is the only place the marker can go.
    """
    for n in (lineno, lineno - 1):
        if 0 < n <= len(lines) and extract_waived_ctl(lines[n - 1]) == ctl:
            return True
    return False


# ── Scanning ──────────────────────────────────────────────────────────────────

def _file_source(filepath, candidates):
    """
    (raw lines, comment-free source text) for one file.

    The comment-free copy comes from the `source` surface, which is the whole
    file with every comment span blanked. All three rules ask a same-file
    question, and a token that only appears in a comment must never answer one.
    """
    try:
        with open(filepath, encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()
    except OSError:
        return None, None
    stripped = [raw.rstrip("\n") for raw in lines]
    by_line = checklib.surface_lines(stripped, candidates, ("source",))
    source_text = "\n".join(by_line.get(n, "") for n in range(1, len(stripped) + 1))
    return lines, source_text


def collect_candidates(rel, source_text, candidates):
    """
    Every CMP-2 candidate in one file, after the denylist. Returns a list of
    candidate records, deduplicated by identifier and ordered by line. The key
    carries no line number, so two hits on one identifier are one disposition.

    `rel` is the repo-relative path the ledger key is built from, and
    `source_text` is the file with its comment spans blanked.
    """
    use_server = bool(_USE_SERVER_RE.search(source_text))
    companion, token = companion_in(source_text)
    found, seen = [], set()
    for cand in candidates:
        surface = cand["surface"]
        if surface not in CMP2_SURFACE_KINDS:
            continue
        identifier = candidate_identifier(surface, cand["text"], use_server)
        if identifier is None or identifier in seen:
            continue
        seen.add(identifier)
        found.append({
            "control": "CMP-2",
            "file": rel,
            "line": cand["line"],
            "identifier": identifier,
            "kind": CMP2_SURFACE_KINDS[surface],
            "companion": companion,
            "companion_token": token,
        })
    found.sort(key=lambda c: (c["line"], c["identifier"]))
    return found


def check_file(filepath, sanitisers=None, rules=None, candidates=None):
    """
    Scan a single file. Returns (lines, cmp2_candidates) where `lines` is the
    list of ERROR / NOTE strings and `cmp2_candidates` is the candidate records
    --ledger mode reconciles.

    `candidates`: this file's records from checklib.astgrep_scan(). Omit it and
    the file is scanned on its own; scan_paths() passes a pre-grouped list so a
    whole tree costs one ast-grep invocation.
    """
    rule_filter = set(rules) if rules is not None else None
    results = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in TARGET_EXTENSIONS:
        return results, []

    if sanitisers is None:
        sanitisers, _note = load_sanitisers()
    if candidates is None:
        candidates = checklib.astgrep_scan([filepath], CHECK_NAME)

    lines, source_text = _file_source(filepath, candidates)
    if lines is None:
        return [f"ERROR {filepath}: cannot read file"], []
    rel = os.path.relpath(filepath)
    source_text = source_text or ""

    def wants(ctl):
        return rule_filter is None or ctl in rule_filter

    def emit(lineno, ctl, found, suggest):
        """One ERROR line, in the `[CMP-N][waiver-claimed]` form when the line
        claims a waiver. An L1 waiver downgrades the wording and still fails."""
        if waived_at(lines, lineno, ctl):
            results.append(
                f"ERROR {rel}:{lineno} [{ctl}][waiver-claimed] {found}"
                f" — verify approver in decision record"
            )
        else:
            results.append(checklib.emit_error(rel, lineno, ctl, found, suggest))

    # ── CMP-2: list candidates, never judge, never error ──────────────────────
    cmp2 = (collect_candidates(rel, source_text, candidates)
            if wants("CMP-2") else [])
    for cand in cmp2:
        if cand["companion"]:
            tail = f"companion found ({cand['companion_token']})"
        else:
            tail = "companion not found"
        results.append(
            f"NOTE {rel}:{cand['line']} [CMP-2] candidate "
            f"{cand['identifier']} ({cand['kind']}), {tail}"
        )

    # ── CMP-3: an async call in a client file with no error path at all ───────
    if wants("CMP-3"):
        awaits = sorted(c["line"] for c in candidates if c["surface"] == "cmp3-async")
        if (
            awaits
            and _USE_CLIENT_RE.search(source_text)
            and not has_error_path(source_text, filepath)
        ):
            emit(
                awaits[0], "CMP-3",
                "async call with no error path anywhere in the file",
                "add a try/catch (or .catch) and surface the failure to the user",
            )

    # ── CMP-9: a render sink, never passed in silence ─────────────────────────
    if wants("CMP-9"):
        sanitiser = sanitiser_in(source_text, sanitisers)
        seen_lines = set()
        for cand in candidates:
            if cand["surface"] != "cmp9-sink":
                continue
            token = sink_token(cand["text"])
            if token is None or cand["line"] in seen_lines:
                continue
            seen_lines.add(cand["line"])
            if sanitiser is None:
                emit(
                    cand["line"], "CMP-9",
                    f"render sink {token} with no allowlisted sanitiser in the file",
                    "sanitise the content at the render boundary with an "
                    "allowlisted sanitiser (DOMPurify and friends)",
                )
            else:
                results.append(
                    f"NOTE {rel}:{cand['line']} [CMP-9] render sink {token} with "
                    f"sanitiser {sanitiser} in file; confirm it sits at the "
                    f"render boundary"
                )

    return results, cmp2


def scan_paths(paths, rules=None):
    """
    Walk paths, collect ERROR / NOTE lines and CMP-2 candidates. Returns
    (lines, candidates). Prints the sanitiser-fallback NOTE once.

    checklib.iter_target_files() stays the single walk policy and the file list
    is handed to ast-grep explicitly: letting ast-grep walk a directory would
    import .gitignore semantics the Python walker does not have, and a gitignored
    source file would be skipped in silence.

    Raises checklib.AstGrepError when ast-grep is missing, too old or broken.
    """
    sanitisers, note = load_sanitisers()
    if note:
        print(note)
    all_lines, all_candidates, files = [], [], []
    for kind, val in checklib.iter_target_files(paths, TARGET_EXTENSIONS):
        if kind == "missing":
            # Collected, not printed here: main() prints every line once. The
            # sibling checks print it eagerly AND return it, so the line lands
            # twice on stdout and detect.py counts one finding as two.
            all_lines.append(f"ERROR cmp-scan: path not found: {val}")
        else:
            files.append(val)
    by_file = checklib.group_candidates(checklib.astgrep_scan(files, CHECK_NAME))
    for val in files:
        lines, cands = check_file(
            val, sanitisers, rules, by_file.get(os.path.realpath(val), [])
        )
        all_lines.extend(lines)
        all_candidates.extend(cands)
    return all_lines, all_candidates


# ── Ledger reconcile: where L0 bites ──────────────────────────────────────────

def ledger_rows(record_text):
    """
    (header, rows) for the verification ledger in a decision record. The Verify
    verdict section is preferred, because that is where audit-record.py's
    assertion 10 requires the table; a record with no such heading falls back to
    the whole document so a bare table still reconciles.
    """
    section = find_section(split_sections(record_text), "Verify verdict")
    header, rows = find_ledger_table(section if section is not None else record_text)
    if header is None and section is not None:
        header, rows = find_ledger_table(record_text)
    return header, rows


def reconcile_ledger(candidates, record_path):
    """
    Reconcile listed CMP-2 candidates against a decision record's ledger.
    Returns a list of ERROR / NOTE lines.

    A row matches a candidate when its first cell CONTAINS the candidate key
    `CMP-2 <path>:<identifier>`, which is why a blanket `| CMP-2 | manual |
    verified manually |` row satisfies nothing: its first cell is the bare
    control id and carries no key.
    """
    try:
        with open(record_path, encoding="utf-8", errors="replace") as fh:
            text = fh.read()
    except OSError as exc:
        return [f"ERROR cmp-scan: cannot read {record_path} — {exc}"]

    rel_record = os.path.relpath(record_path)
    header, rows = ledger_rows(text)
    if header is None:
        return [
            f"ERROR {rel_record} [CMP-2] no verification ledger to disposition "
            f"candidates into — add a | Control | Method | Evidence | table to "
            f"the Verify verdict section"
        ]

    first_cells = [row[0].strip() for row in rows if row]
    out = []
    keys = set()
    for cand in candidates:
        key = candidate_key(cand["file"], cand["identifier"])
        keys.add(key)
        if not any(key in cell for cell in first_cells):
            out.append(checklib.emit_error(
                cand["file"], cand["line"], "CMP-2",
                f"candidate {cand['identifier']} is not dispositioned in "
                f"{rel_record}",
                f"add a ledger row keyed `{key}` with its method and evidence",
            ))

    # A keyed row whose candidate is gone: a NOTE, never an ERROR. The scan is
    # only as complete as the paths given, so failing on it would be dishonest.
    for cell in first_cells:
        if not cell.startswith("CMP-2 ") or ":" not in cell:
            continue
        if not any(key in cell for key in keys):
            out.append(
                f"NOTE {rel_record} [CMP-2] dispositioned candidate {cell} no "
                f"longer found in the scanned source; confirm it is gone"
            )
    return out


# ── Self-test ─────────────────────────────────────────────────────────────────

def run_self_test():
    import tempfile

    sanitisers, _note = load_sanitisers()
    failures = []
    case_count = 0

    def fail(message):
        failures.append(message)

    def check_eq(name, want, got):
        nonlocal case_count
        case_count += 1
        if want != got:
            fail(f"FAIL {name}: want: {want!r}; got: {got!r}")

    def run(content, ext=".tsx", rules=None, name="probe"):
        """Scan one string as a file, and return (lines, candidates)."""
        with tempfile.TemporaryDirectory(prefix="dx-cmp-scan-") as td:
            # A package.json marks the tree as an app root, so the route-boundary
            # walk stops here instead of climbing into the harness itself.
            with open(os.path.join(td, "package.json"), "w", encoding="utf-8") as fh:
                fh.write("{}\n")
            path = os.path.join(td, name + ext)
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(content)
            return check_file(path, sanitisers, rules)

    def controls_of(lines, prefix="ERROR"):
        out = []
        for ln in lines:
            if not ln.startswith(prefix):
                continue
            m = re.search(r"\[([A-Z0-9-]+)\]", ln)
            if m:
                out.append(m.group(1))
        return out

    def assert_errors(name, content, want_ctls, ext=".tsx"):
        lines, _ = run(content, ext)
        check_eq(name, sorted(want_ctls), sorted(controls_of(lines)))

    def assert_notes(name, content, want_ctls, ext=".tsx"):
        lines, _ = run(content, ext)
        check_eq(name, sorted(want_ctls), sorted(controls_of(lines, "NOTE")))

    # ── Pure policy helpers ───────────────────────────────────────────────────
    check_eq("words: camelCase splits into stems", ["handle", "delete", "row"],
             identifier_words("handleDeleteRow"))
    check_eq("words: a compound word is one word, so backdrop is not drop",
             ["backdrop"], identifier_words("backdrop"))
    check_eq("words: an acronym boundary splits, so a shouted verb still counts",
             ["handle", "delete", "row"], identifier_words("handleDELETERow"))
    check_eq("stem: handleDelete is destructive", True, is_destructive("handleDelete"))
    check_eq("stem: handleDropdownToggle is not", False,
             is_destructive("handleDropdownToggle"))
    check_eq("stem: backdrop-blur is not", False, is_destructive("backdrop-blur"))
    check_eq("stem: onUnpublish is destructive", True, is_destructive("onUnpublish"))
    check_eq("denylist: removeEventListener is blanked before any stem search",
             None, first_destructive_identifier(
                 denylisted('window.removeEventListener("keydown", h)')))
    check_eq("denylist: keeps the width, so nothing else shifts",
             len("a.removeChild(b)"), len(denylisted("a.removeChild(b)")))
    check_eq("denylist: a DOM ref remove() is dropped, an argument remove is not",
             (None, "removeRow"),
             (first_destructive_identifier(denylisted("node.remove()")),
              first_destructive_identifier(denylisted("removeRow(id)"))))
    check_eq("key: carries no line number", "CMP-2 a/b.tsx:handleDelete",
             candidate_key("a/b.tsx", "handleDelete"))
    check_eq("companion: AlertDialog wins first", (True, "AlertDialog"),
             companion_in("<AlertDialog>…</AlertDialog>"))
    check_eq("companion: a bare Dialog is not one", (False, None),
             companion_in("<Dialog>…</Dialog>"))
    check_eq("companion: Dialog plus a destructive variant is one",
             True, companion_in('<Dialog><Button variant="destructive"/></Dialog>')[0])
    check_eq("sink: skipHtml only opens at false",
             (None, "skipHtml"),
             (sink_token("skipHtml={true}"), sink_token("skipHtml={false}")))
    check_eq("sink: allowDangerousHtml closes at false",
             ("allowDangerousHtml", None),
             (sink_token("allowDangerousHtml: true"),
              sink_token("allowDangerousHtml: false")))
    check_eq("sink: an innerHTML read is not a sink",
             (None, "innerHTML assignment"),
             (sink_token("const s = el.innerHTML"), sink_token("el.innerHTML = s")))

    # ── CMP-2: the lister ─────────────────────────────────────────────────────
    # Every CMP-2 string here carries a try/catch, so the assertion that a
    # candidate never errors is testing CMP-2 rather than CMP-3's silence.
    with_companion = (
        '"use client";\n'
        "export function Row() {\n"
        "  async function handleDelete() { try { await api.put(id); } catch { warn(); } }\n"
        "  return (<AlertDialog><button onClick={handleDelete}>x</button></AlertDialog>);\n"
        "}\n"
    )
    lines, cands = run(with_companion)
    check_eq("CMP-2: a handler with a companion is listed as found",
             (1, "handleDelete", True, "AlertDialog"),
             (len(cands), cands[0]["identifier"] if cands else None,
              cands[0]["companion"] if cands else None,
              cands[0]["companion_token"] if cands else None))
    case_count += 1
    if not any(ln.startswith("NOTE") and "[CMP-2]" in ln and "companion found (AlertDialog)"
               in ln for ln in lines):
        fail(f"FAIL CMP-2: the found companion is named in the NOTE; got {lines!r}")
    check_eq("CMP-2: a candidate is never an ERROR", [],
             [ln for ln in lines if ln.startswith("ERROR")])

    without_companion = with_companion.replace("<AlertDialog>", "<div>").replace(
        "</AlertDialog>", "</div>")
    lines, cands = run(without_companion)
    check_eq("CMP-2: no companion is still a NOTE and never an ERROR",
             (1, False, []),
             (len(cands), cands[0]["companion"] if cands else None,
              [ln for ln in lines if ln.startswith("ERROR")]))

    lines, cands = run(
        '"use client";\n'
        "export function Panel() {\n"
        "  useEffect(() => {\n"
        '    window.addEventListener("keydown", handleKeyDown);\n'
        '    return () => window.removeEventListener("keydown", handleKeyDown);\n'
        "  }, []);\n"
        "  return <div />;\n"
        "}\n"
    )
    check_eq("CMP-2: a denylisted DOM API emits nothing at all", ([], []),
             (lines, cands))

    lines, cands = run(
        '"use client";\n'
        "export function Card({ node }) {\n"
        "  return <div onPointerLeave={() => node.removeEventListener('x', h)} />;\n"
        "}\n"
    )
    check_eq("CMP-2: the denylist reaches inside a JSX prop value", ([], []),
             (lines, cands))

    lines, cands = run(
        '"use client";\n'
        "export function Card() {\n"
        "  return <Menu onDelete={() => run(id)} />;\n"
        "}\n"
    )
    check_eq("CMP-2: a destructive JSX prop is a candidate",
             ("onDelete", "jsx-prop"),
             (cands[0]["identifier"] if cands else None,
              cands[0]["kind"] if cands else None))

    lines, cands = run(
        '"use client";\n'
        "export function Card() {\n"
        "  return <Menu onClick={handleArchive} />;\n"
        "}\n"
    )
    check_eq("CMP-2: a neutral prop carrying a destructive value is a candidate",
             "handleArchive", cands[0]["identifier"] if cands else None)

    multiline_delete = (
        '"use client";\n'
        "export function Row({ id }) {\n"
        "  async function submit() {\n"
        "    await fetch(`/api/rows/${id}`, {\n"
        '      method: "DELETE",\n'
        '      headers: { "content-type": "application/json" },\n'
        "    });\n"
        "  }\n"
        "  return <button onClick={submit}>go</button>;\n"
        "}\n"
    )
    lines, cands = run(multiline_delete)
    check_eq("CMP-2: a multiline DELETE fetch is a fetch-delete candidate",
             ("fetch(DELETE)", "fetch-delete"),
             (cands[0]["identifier"] if cands else None,
              cands[0]["kind"] if cands else None))

    lines, cands = run(
        '"use server";\n'
        "export async function purgeRow(id: string) {\n"
        "  await db.rows.destroy(id);\n"
        "}\n",
        ext=".ts",
    )
    check_eq("CMP-2: an exported server action is a candidate",
             ("purgeRow", "server-action"),
             (cands[0]["identifier"] if cands else None,
              cands[0]["kind"] if cands else None))

    lines, cands = run(
        "export async function purgeRow(id: string) {\n"
        "  await db.rows.destroy(id);\n"
        "}\n"
        "export function ok() { return 1; }\n",
        ext=".ts",
    )
    check_eq("CMP-2: the same export without 'use server' is not a candidate",
             [], cands)

    lines, cands = run(
        '"use client";\n'
        "export function Row() {\n"
        "  const deleteNote = useMutation({ mutationFn: (id) => api.send(id) });\n"
        "  return <button onClick={() => deleteNote.mutate(1)}>x</button>;\n"
        "}\n"
    )
    check_eq("CMP-2: a destructively-named mutation is a candidate",
             ("deleteNote", "mutation"),
             (cands[0]["identifier"] if cands else None,
              cands[0]["kind"] if cands else None))

    lines, cands = run(
        '"use client";\n'
        "export function Row() {\n"
        "  async function handleDelete() { await api.send(id); }\n"
        "  return <button onClick={handleDelete}>x</button>;\n"
        "}\n"
    )
    check_eq("CMP-2: one identifier hit twice is one candidate and one key",
             1, len(cands))

    check_eq("CMP-2: a string constant named like a handler is not an action",
             [], run('"use client";\nconst handleDeleteLabel = "Delete";\n')[1])

    # ── CMP-3: only 'no error path at all' ────────────────────────────────────
    assert_errors(
        "CMP-3: a client file with an await and no error path errors",
        '"use client";\n'
        "export function Row({ row }) {\n"
        "  async function save() { await persist(row); }\n"
        "  return <button onClick={save}>save</button>;\n"
        "}\n",
        ["CMP-3"],
    )
    assert_errors(
        "CMP-3: a catch clears it",
        '"use client";\n'
        "export function Row({ row }) {\n"
        "  async function save() { try { await persist(row); } catch { report(); } }\n"
        "  return <button onClick={save}>save</button>;\n"
        "}\n",
        [],
    )
    assert_errors(
        "CMP-3: a .catch( clears it",
        '"use client";\n'
        "export function Row({ row }) {\n"
        "  async function save() { await persist(row).catch(report); }\n"
        "  return <button onClick={save}>save</button>;\n"
        "}\n",
        [],
    )
    assert_errors(
        "CMP-3: an onError option clears it",
        '"use client";\n'
        "export function Row({ row }) {\n"
        "  async function save() { await persist(row, { onError: report }); }\n"
        "  return <button onClick={save}>save</button>;\n"
        "}\n",
        [],
    )
    assert_errors(
        "CMP-3: a server component is out of scope, so notFound() never has to save it",
        "export default async function Page({ params }) {\n"
        "  const doc = await load(params.slug);\n"
        "  return <article>{doc.title}</article>;\n"
        "}\n",
        [],
    )
    assert_errors(
        "CMP-3: notFound() is an error path even in a client file",
        '"use client";\n'
        "export default async function Page({ params }) {\n"
        "  const doc = await load(params.slug);\n"
        "  if (!doc) notFound();\n"
        "  return <article>{doc.title}</article>;\n"
        "}\n",
        [],
    )
    assert_errors(
        "CMP-3: a state-name union is never evidence that a state exists",
        '"use client";\n'
        "export function Row() {\n"
        '  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");\n'
        "  async function save() { await persist(); setStatus(\"idle\"); }\n"
        "  return <button onClick={save}>{status}</button>;\n"
        "}\n",
        ["CMP-3"],
    )
    assert_errors(
        "CMP-3: a comment mentioning catch does not clear it",
        '"use client";\n'
        "/* we should catch this one day */\n"
        "export function Row({ row }) {\n"
        "  async function save() { await persist(row); }\n"
        "  return <button onClick={save}>save</button>;\n"
        "}\n",
        ["CMP-3"],
    )

    # An error.tsx in the same route segment is an error path.
    case_count += 1
    with tempfile.TemporaryDirectory(prefix="dx-cmp-route-") as td:
        with open(os.path.join(td, "package.json"), "w", encoding="utf-8") as fh:
            fh.write("{}\n")
        seg = os.path.join(td, "app", "rows")
        os.makedirs(seg)
        with open(os.path.join(seg, "error.tsx"), "w", encoding="utf-8") as fh:
            fh.write("export default function E() { return <p>failed</p>; }\n")
        page = os.path.join(seg, "page.tsx")
        with open(page, "w", encoding="utf-8") as fh:
            fh.write('"use client";\nexport default async function P() '
                     "{ const d = await load(); return <p>{d}</p>; }\n")
        route_lines, _ = check_file(page, sanitisers)
        if controls_of(route_lines):
            fail(f"FAIL CMP-3: a sibling error.tsx is an error path; got {route_lines!r}")

    # ── CMP-9: a sink is never passed in silence ──────────────────────────────
    sink = (
        "export function Comment({ comment }) {\n"
        "  return <div dangerouslySetInnerHTML={{ __html: comment.body }} />;\n"
        "}\n"
    )
    assert_errors("CMP-9: an unsanitised render sink errors", sink, ["CMP-9"])
    sanitised = 'import DOMPurify from "dompurify";\n' + sink
    assert_errors("CMP-9: a sanitised sink prints no ERROR", sanitised, [])
    assert_notes("CMP-9: a sanitised sink notes rather than passing silently",
                 sanitised, ["CMP-9"])
    assert_errors(
        "CMP-9: v-html in a vue file errors",
        '<template><div v-html="comment.body"></div></template>\n',
        ["CMP-9"], ext=".vue",
    )
    assert_errors(
        "CMP-9: a svelte {@html} block errors",
        "<p>{@html comment.body}</p>\n", ["CMP-9"], ext=".svelte",
    )
    assert_errors(
        "CMP-9: an innerHTML assignment errors and a read does not",
        "export function paint(el, html) { el.innerHTML = html; }\n",
        ["CMP-9"], ext=".ts",
    )
    assert_errors(
        "CMP-9: reading innerHTML is clean",
        "export function read(el) { return el.innerHTML; }\n", [], ext=".ts",
    )
    lines, _ = run(
        "export function Comment({ comment }) {\n"
        "  return (\n"
        "    // dx-waive CMP-9 reason=\"mock data, prototype\"\n"
        "    <div dangerouslySetInnerHTML={{ __html: comment.body }} />\n"
        "  );\n"
        "}\n"
    )
    case_count += 1
    if not any("[CMP-9][waiver-claimed]" in ln for ln in lines):
        fail(f"FAIL CMP-9: an L1 waiver downgrades the wording; got {lines!r}")
    check_eq("CMP-9: a waived sink still produces an ERROR", 1,
             len([ln for ln in lines if ln.startswith("ERROR")]))

    # ── The sanitiser allowlist ───────────────────────────────────────────────
    live, live_note = load_sanitisers()
    check_eq("allowlist: the marked span in cmp-9.md is read, not the fallback",
             (True, None), ("DOMPurify" in live, live_note))
    missing, missing_note = load_sanitisers(os.path.join("no", "such", "cmp-9.md"))
    check_eq("allowlist: an unreadable list falls back loudly, never silently",
             (FALLBACK_SANITISERS, True),
             (missing, bool(missing_note and "fallback" in missing_note)))
    with tempfile.TemporaryDirectory(prefix="dx-cmp-span-") as td:
        empty = os.path.join(td, "cmp-9.md")
        with open(empty, "w", encoding="utf-8") as fh:
            fh.write("<!-- dx-sync:cmp9-sanitisers -->\n<!-- /dx-sync:cmp9-sanitisers -->\n")
        empty_list, empty_note = load_sanitisers(empty)
        check_eq("allowlist: an empty span falls back loudly too",
                 (FALLBACK_SANITISERS, True),
                 (empty_list, bool(empty_note and "empty" in empty_note)))

    # ── --rules selection ─────────────────────────────────────────────────────
    both = (
        '"use client";\n'
        "export function Row({ row }) {\n"
        "  async function handleDelete() { await persist(row); }\n"
        "  return <div dangerouslySetInnerHTML={{ __html: row.body }} />;\n"
        "}\n"
    )
    check_eq("--rules: CMP-9 only leaves CMP-3 out",
             ["CMP-9"], controls_of(run(both, rules={"CMP-9"})[0]))
    check_eq("--rules: CMP-3 only leaves CMP-9 out",
             ["CMP-3"], controls_of(run(both, rules={"CMP-3"})[0]))
    check_eq("--rules: CMP-3 only lists no CMP-2 candidate",
             [], run(both, rules={"CMP-3"})[1])
    check_eq("--rules: the baseline runs every rule",
             ["CMP-3", "CMP-9"], sorted(controls_of(run(both)[0])))

    args = ["--rules", "CMP-3,CMP-9", "some/path"]
    check_eq("--rules: a list is parsed and removed from argv",
             ({"CMP-3", "CMP-9"}, ["some/path"]), (parse_rules_flag(args), args))
    args = ["--rules=cmp-9", "p"]
    check_eq("--rules: the = form is parsed and lower case normalised",
             ({"CMP-9"}, ["p"]), (parse_rules_flag(args), args))
    check_eq("--rules: absent means every rule", None, parse_rules_flag(["p"]))
    case_count += 1
    try:
        parse_rules_flag(["--rules", "CMP-4", "p"])
        fail("FAIL --rules: an unknown id must be a usage error")
    except ValueError:
        pass

    # ── --ledger: where L0 bites ──────────────────────────────────────────────
    # These fixtures live here rather than in audit-record.py's PASSING_RECORD,
    # so that script's case count and its shipped constant are left alone.
    blanket_ledger = (
        "## Verify verdict\n\n"
        "VERDICT: pass\n\n"
        "| Control | Method | Evidence |\n"
        "|---|---|---|\n"
        "| CMP-2 | manual | verified manually |\n"
    )
    keyed_ledger = (
        "## Verify verdict\n\n"
        "VERDICT: pass\n\n"
        "| Control | Method | Evidence |\n"
        "|---|---|---|\n"
        "| CMP-2 components/notes-row.tsx:handleDelete | manual | "
        "AlertDialog names the note and the row count |\n"
    )
    no_ledger = "## Verify verdict\n\nVERDICT: pass\n\nNo table here.\n"
    candidates = [{
        "control": "CMP-2", "file": "components/notes-row.tsx", "line": 12,
        "identifier": "handleDelete", "kind": "handler",
        "companion": True, "companion_token": "AlertDialog",
    }]

    with tempfile.TemporaryDirectory(prefix="dx-cmp-ledger-") as td:
        def reconcile(record_text, cands=candidates, name="record.md"):
            path = os.path.join(td, name)
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(record_text)
            return reconcile_ledger(cands, path)

        out = reconcile(blanket_ledger)
        check_eq("--ledger: a blanket 'verified manually' row satisfies nothing",
                 (1, True),
                 (len([ln for ln in out if ln.startswith("ERROR")]),
                  bool(out) and "handleDelete" in out[0] and "[CMP-2]" in out[0]))
        check_eq("--ledger: a keyed row reconciles clean", [], reconcile(keyed_ledger))
        out = reconcile(no_ledger)
        check_eq("--ledger: a record with no ledger table errors",
                 (1, True),
                 (len(out), bool(out) and "no verification ledger" in out[0]))
        out = reconcile(keyed_ledger, cands=[])
        check_eq("--ledger: a keyed row whose candidate is gone is a NOTE, never an ERROR",
                 (1, True),
                 (len(out), bool(out) and out[0].startswith("NOTE")))
        check_eq("--ledger: nothing to reconcile against a blanket row is clean",
                 [], reconcile(blanket_ledger, cands=[]))

    # ── The finding-line shape detect.py reverse-parses ───────────────────────
    finding_re = re.compile(
        r"^ERROR\s+(?P<file>.+?):(?P<line>\d+)\s+"
        r"\[(?P<control>[A-Z0-9-]+)\](?:\[[^\]]*\])?\s+(?P<message>.*)$"
    )
    lines, _ = run(both)
    case_count += 1
    unparsed = [ln for ln in lines if ln.startswith("ERROR") and not finding_re.match(ln)]
    if unparsed:
        fail(f"FAIL shape: every ERROR must parse as a finding; got {unparsed!r}")
    case_count += 1
    note_shape = re.compile(r"^NOTE\s+\S+:\d+\s+\[(?:CMP-2|CMP-9)\]\s+\S")
    bad_notes = [ln for ln in lines if ln.startswith("NOTE") and not note_shape.match(ln)]
    if bad_notes:
        fail(f"FAIL shape: a NOTE carries its control bracket too; got {bad_notes!r}")

    # ── Fixtures ──────────────────────────────────────────────────────────────
    # A filename containing `fail` must yield at least one ERROR; one containing
    # `pass` must yield none. `list` fixtures are CMP-2's, which never errors.
    fixtures_dir = os.path.join(_CHECKS_DIR, "fixtures", "cmp-scan")
    fixture_files = [
        os.path.join(fixtures_dir, n)
        for n in sorted(os.listdir(fixtures_dir))
        if not n.startswith(".") and os.path.splitext(n)[1].lower() in TARGET_EXTENSIONS
    ]
    fixture_candidates = checklib.group_candidates(
        checklib.astgrep_scan(fixture_files, CHECK_NAME)
    )
    for fpath in fixture_files:
        case_count += 1
        fname = os.path.basename(fpath)
        stem = os.path.splitext(fname)[0]
        res, cands = check_file(
            fpath, sanitisers, None, fixture_candidates.get(os.path.realpath(fpath), [])
        )
        errs = [r for r in res if r.startswith("ERROR")]
        lists = stem.endswith("-list")
        passes = stem.endswith("-pass")
        if stem.endswith("-fail") and not errs:
            fail(f"FAIL fixture {fname}: want >= 1 ERROR; got none")
        elif (passes or lists) and errs:
            fail(f"FAIL fixture {fname}: want 0 ERRORs; got {errs!r}")
        if lists and not cands:
            fail(f"FAIL fixture {fname}: want >= 1 CMP-2 candidate; got none")
        if passes and cands:
            fail(f"FAIL fixture {fname}: want 0 CMP-2 candidates; got {cands!r}")

    # ── The exit-code contract, asserted through a real run ───────────────────
    # A unit case cannot see an exit code, and this is the contract detect.py
    # depends on: a run whose only output is CMP-2 NOTE lines must exit 0, or
    # classify_run() reports the check as CRASHED rather than as a clean list.
    import subprocess
    proc = subprocess.run(
        [sys.executable, os.path.join(_CHECKS_DIR, "cmp-scan.py"),
         os.path.join("fixtures", "cmp-scan", "destructive-list.tsx")],
        capture_output=True, text=True, cwd=_CHECKS_DIR,
    )
    emitted = [ln for ln in proc.stdout.splitlines() if ln.strip()]
    check_eq("exit: a CMP-2 NOTE-only run exits 0, so detect.py reads it as clean",
             (0, True, []),
             (proc.returncode,
              bool(emitted) and all(ln.startswith("NOTE") for ln in emitted),
              [ln for ln in emitted if ln.startswith("ERROR")]))

    proc = subprocess.run(
        [sys.executable, os.path.join(_CHECKS_DIR, "cmp-scan.py")],
        capture_output=True, text=True, cwd=_CHECKS_DIR,
    )
    check_eq("usage: no arguments prints the usage line and exits 1",
             (1, True), (proc.returncode, proc.stdout.startswith("Usage:")))

    proc = subprocess.run(
        [sys.executable, os.path.join(_CHECKS_DIR, "cmp-scan.py"),
         os.path.join("no", "such", "path.tsx")],
        capture_output=True, text=True, cwd=_CHECKS_DIR,
    )
    check_eq("path not found: one line, printed once, exit 1",
             (1, 1),
             (proc.returncode,
              len([ln for ln in proc.stdout.splitlines() if "path not found" in ln])))

    # ── The provisioning contract ─────────────────────────────────────────────
    checklib.astgrep_provisioning_cases(
        "cmp-scan.py", os.path.join("fixtures", "cmp-scan", "sink-fail.tsx"), check_eq
    )

    checklib.report_self_test(failures, case_count)


# ── Entry point ───────────────────────────────────────────────────────────────

USAGE = ("Usage: python3 checks/cmp-scan.py [--rules CMP-2,CMP-3,CMP-9] "
         "[--ledger <record.md>] <path>... | --self-test")


def parse_rules_flag(args):
    """Additive `--rules CMP-3,CMP-9` (or `--rules=CMP-3`). Removes the flag from
    `args` in place; returns the rule-id set (or None when absent). Raises
    ValueError on an unknown or empty id so the caller can fail as a usage error;
    the default (no flag) runs every rule."""
    rules = None
    i = 0
    while i < len(args):
        a = args[i]
        if a == "--rules":
            if i + 1 >= len(args):
                raise ValueError("--rules needs a comma-separated control-id list")
            val = args[i + 1]
            del args[i:i + 2]
        elif a.startswith("--rules="):
            val = a[len("--rules="):]
            del args[i]
        else:
            i += 1
            continue
        ids = {r.strip().upper() for r in val.split(",") if r.strip()}
        if not ids:
            raise ValueError("--rules needs at least one control id")
        unknown = ids - VALID_RULES
        if unknown:
            raise ValueError(
                f"--rules: unknown id(s) {sorted(unknown)}; valid: {sorted(VALID_RULES)}"
            )
        rules = ids if rules is None else (rules | ids)
    return rules


def parse_ledger_flag(args):
    """`--ledger <record.md>` (or `--ledger=<record.md>`). Removes the flag from
    `args` in place and returns the record path, or None when absent."""
    record = None
    i = 0
    while i < len(args):
        a = args[i]
        if a == "--ledger":
            if i + 1 >= len(args):
                raise ValueError("--ledger needs a decision-record path")
            record = args[i + 1]
            del args[i:i + 2]
        elif a.startswith("--ledger="):
            record = a[len("--ledger="):]
            del args[i]
        else:
            i += 1
    if record is not None and not record:
        raise ValueError("--ledger needs a decision-record path")
    return record


def main():
    args = sys.argv[1:]
    if not args:
        print(USAGE)
        sys.exit(1)
    if "--self-test" in args:
        try:
            run_self_test()
        except checklib.AstGrepError as exc:
            # A layer that did not run never reports SELF-TEST OK.
            exc.report()
            sys.exit(1)
        return
    try:
        rules = parse_rules_flag(args)
        record = parse_ledger_flag(args)
    except ValueError as exc:
        print(f"ERROR cmp-scan: {exc}")
        sys.exit(1)
    if not args:
        print(USAGE)
        sys.exit(1)
    try:
        results, candidates = scan_paths(args, rules)
    except checklib.AstGrepError as exc:
        # One ERROR line, exit 1, no findings printed. Never a clean result:
        # ast-grep can lose a whole file's matches at exit 0, so a check that
        # could not run must say so and send its controls to manual verification.
        exc.report()
        sys.exit(1)
    if record is not None and (rules is None or "CMP-2" in rules):
        results.extend(reconcile_ledger(candidates, record))
    for r in results:
        print(r)
    sys.exit(1 if any(r.startswith("ERROR") for r in results) else 0)


if __name__ == "__main__":
    main()
