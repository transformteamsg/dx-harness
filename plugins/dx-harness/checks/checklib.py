"""
Shared scaffolding for the harness/checks/*.py scripts: comment stripping,
the source-file walker, the ERROR line format, and the self-test tail.

`checks/` is not a Python package (no `__init__.py`, filenames use hyphens),
so scripts import this module by path with the same importlib snippet
`waiver-reconcile.py` already uses for `audit-record.py`:

    import importlib.util, os
    _CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))
    def _load_checklib():
        path = os.path.join(_CHECKS_DIR, "checklib.py")
        spec = importlib.util.spec_from_file_location("_dx_checklib", path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    checklib = _load_checklib()

Rule logic stays in each script; this module holds only the scaffolding that
was duplicated across them.

astgrep_scan() is the one door every check uses to reach ast-grep. It is here
and not in a new checks/*.py file because validate.py's live_checks_count()
counts every checks/*.py except validate.py and checklib.py, and a new file
would be counted as a check script.
"""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

_CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))

# The 8 extensions the general lint-style checks scan. content-lint.py scans
# prose too and keeps its own, larger set — it uses iter_target_files() with
# extensions=<its own set>, not this default.
TARGET_EXTENSIONS = {".css", ".html", ".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte"}

# The one rule -> control-id mapping file for the accessibility layers. Every
# check that reports an a11y finding resolves its control id through it, and
# every layer that could not run reads its own `layers` row to name the
# controls going to manual verification.
RULE_MAP_FILENAME = "a11y-rule-map.json"

# Unified, stricter skip policy (component-manifest.py's set). Most scripts
# previously skipped only dotdirs and would have descended into node_modules
# if pointed at a repo root; iter_target_files() now skips both everywhere.
SKIP_DIRS = {"node_modules", ".git", ".next", "dist", "out"}


def strip_block_comments(line, in_comment):
    """
    Return a version of `line` with /* ... */ block-comment spans replaced by
    nothing. `in_comment` is True if the previous line ended inside a block
    comment.
    """
    result = []
    i = 0
    n = len(line)
    while i < n:
        if in_comment:
            end = line.find("*/", i)
            if end == -1:
                break
            else:
                i = end + 2
                in_comment = False
        else:
            start = line.find("/*", i)
            if start == -1:
                result.append(line[i:])
                break
            else:
                result.append(line[i:start])
                i = start + 2
                in_comment = True
    return "".join(result)


def ends_in_block_comment(line, in_comment):
    """Return True if `line` ends inside a /* ... */ block comment."""
    i = 0
    n = len(line)
    while i < n:
        if in_comment:
            end = line.find("*/", i)
            if end == -1:
                return True
            i = end + 2
            in_comment = False
        else:
            start = line.find("/*", i)
            if start == -1:
                return False
            i = start + 2
            in_comment = True
    return in_comment


def iter_target_files(paths, extensions=TARGET_EXTENSIONS, skip_dirs=SKIP_DIRS):
    """
    Walk `paths` (files or directories) and yield ("file", path) for every
    file matching `extensions`, or ("missing", path) for a path that is
    neither a file nor a directory. Skips dotdirs and `skip_dirs` (not just
    dotdirs, the previous per-script policy) when descending directories.
    """
    for p in paths:
        if os.path.isfile(p):
            if os.path.splitext(p)[1].lower() in extensions:
                yield ("file", p)
        elif os.path.isdir(p):
            for root, dirs, files in os.walk(p):
                dirs[:] = [
                    d for d in dirs if not d.startswith(".") and d not in skip_dirs
                ]
                for fname in sorted(files):
                    if os.path.splitext(fname)[1].lower() in extensions:
                        yield ("file", os.path.join(root, fname))
        else:
            yield ("missing", p)


# ── ast-grep front end ────────────────────────────────────────────────────────
#
# Every harness check that matches source structure goes through astgrep_scan().
# No check shells out to `ast-grep` itself: the version floor, the config path,
# the explicit file list, the JSON shape and the 0-based to 1-based line
# conversion are enforced once, here. A second copy of any of that is where the
# floor silently stops being enforced.

ASTGREP_MIN_VERSION = (0, 44, 1)
ASTGREP_MIN_VERSION_STR = "0.44.1"

# The harness's own ast-grep project config. It travels with the harness and is
# reached with `-c`, so nothing is written into the repo being checked.
SGCONFIG_PATH = os.path.join(_CHECKS_DIR, "sgconfig.yml")

# Extension to ast-grep language bucket. Four buckets, because an ast-grep rule
# is per language, not per control.
#   - .vue and .svelte are not ast-grep languages at 0.44.1; sgconfig.yml's
#     languageGlobs map them to html so their attributes are reachable.
#   - .js and .jsx alias to tsx safely. .ts does NOT: measured at 0.44.1, a .ts
#     file holding an old-style `<Foo>bar` type assertion returns zero findings
#     at exit 0 under a tsx rule and one finding under a `language: ts` rule.
#     The tsx parse fails and the file's matches vanish with no error.
ASTGREP_LANGUAGE_BY_EXT = {
    ".css": "css",
    ".html": "html",
    ".vue": "html",
    ".svelte": "html",
    ".tsx": "tsx",
    ".jsx": "tsx",
    ".js": "tsx",
    ".ts": "ts",
}

# The root node of each bucket's grammar. A non-empty file that yields no root
# node was not parsed, and a zero-findings result for it cannot be trusted.
ASTGREP_ROOT_KIND = {
    "css": "stylesheet",
    "html": "document",
    "tsx": "program",
    "ts": "program",
}

# How many files to hand one ast-grep invocation. Keeps the argv well inside
# every platform's limit without making the walk itself chatty.
_ASTGREP_BATCH = 100

_astgrep_binary_cache = {}


class AstGrepError(Exception):
    """
    A provisioning or tool failure, not a finding. `str()` is the finished ERROR
    line to print; `stderr` is ast-grep's own stderr, forwarded unchanged.

    Never swallow one of these into a zero-findings result: ast-grep can lose an
    entire file's matches at exit 0, so silence is the failure mode being
    designed against. Print the line, exit 1, print no findings.
    """

    def __init__(self, line, stderr=""):
        super().__init__(line)
        self.line = line
        self.stderr = stderr

    def report(self, out=None, err=None):
        """Print the ERROR line on stdout and ast-grep's stderr on stderr."""
        print(self.line, file=out or sys.stdout)
        if self.stderr:
            print(self.stderr.rstrip("\n"), file=err or sys.stderr)


def parse_astgrep_version(text):
    """
    Read a version tuple out of `ast-grep --version` output ("ast-grep 0.44.1").
    Returns None when no `<major>.<minor>.<patch>` can be found.
    """
    m = re.search(r"(\d+)\.(\d+)\.(\d+)", text or "")
    if not m:
        return None
    return (int(m.group(1)), int(m.group(2)), int(m.group(3)))


def astgrep_version_ok(found, floor=ASTGREP_MIN_VERSION):
    """True when `found` (a version tuple) is at or above `floor`."""
    return found is not None and found >= floor


def astgrep_language_for(path):
    """The ast-grep language bucket for a path, or None when it has no bucket."""
    return ASTGREP_LANGUAGE_BY_EXT.get(os.path.splitext(path)[1].lower())


def _resolve_astgrep(check_name):
    """Return the ast-grep binary path, or raise AstGrepError."""
    if "binary" in _astgrep_binary_cache:
        return _astgrep_binary_cache["binary"]
    binary = shutil.which("ast-grep") or shutil.which("sg")
    if binary is None:
        raise AstGrepError(
            f"ERROR {check_name}: cannot run ast-grep, install ast-grep >= "
            f"{ASTGREP_MIN_VERSION_STR} "
            f"(brew install ast-grep, or npm i -g @ast-grep/cli)"
        )
    try:
        proc = subprocess.run(
            [binary, "--version"], capture_output=True, text=True, check=False
        )
    except OSError:
        raise AstGrepError(
            f"ERROR {check_name}: cannot run ast-grep, install ast-grep >= "
            f"{ASTGREP_MIN_VERSION_STR} "
            f"(brew install ast-grep, or npm i -g @ast-grep/cli)"
        )
    raw = (proc.stdout or proc.stderr or "").strip()
    found = parse_astgrep_version(raw)
    if found is None:
        raise AstGrepError(
            f"ERROR {check_name}: cannot read ast-grep version from '{raw}', "
            f"require >= {ASTGREP_MIN_VERSION_STR}"
        )
    if not astgrep_version_ok(found):
        shown = ".".join(str(n) for n in found)
        raise AstGrepError(
            f"ERROR {check_name}: ast-grep {shown} is below the required "
            f"{ASTGREP_MIN_VERSION_STR}, upgrade ast-grep"
        )
    _astgrep_binary_cache["binary"] = binary
    return binary


def _astgrep_rule_filter(check_name):
    """Rule ids this check runs: its own, plus the shared structural rules."""
    return f"^(shared|{re.escape(check_name)})-"


def _run_astgrep(binary, check_name, files):
    """One `ast-grep scan` invocation over an explicit file list. Returns the
    parsed JSON list, or raises AstGrepError."""
    cmd = [
        binary, "scan",
        "-c", SGCONFIG_PATH,
        "--filter", _astgrep_rule_filter(check_name),
        "--include-metadata",
        "--json=compact",
    ] + list(files)
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    except OSError as exc:
        raise AstGrepError(f"ERROR {check_name}: cannot run ast-grep, {exc}")
    stderr = proc.stderr or ""
    if proc.returncode not in (0, 1):
        bad_rule = re.search(r"Cannot parse rule (\S+)", stderr)
        if bad_rule:
            raise AstGrepError(
                f"ERROR {check_name}: rule {bad_rule.group(1)} is not a valid "
                f"ast-grep rule, see stderr",
                stderr,
            )
        raise AstGrepError(
            f"ERROR {check_name}: ast-grep exited {proc.returncode}, see stderr",
            stderr,
        )
    try:
        return json.loads(proc.stdout or "[]")
    except ValueError:
        raise AstGrepError(
            f"ERROR {check_name}: cannot parse ast-grep JSON output", stderr
        )


def _candidate_from_match(match, host_file=None, embedded=False):
    """Normalise one ast-grep JSON match into a candidate record."""
    meta = match.get("metadata") or {}
    start = match["range"]["start"]
    end = match["range"]["end"]
    return {
        "control": meta.get("control"),
        "check": meta.get("check"),
        "surface": meta.get("surface"),
        "context": meta.get("context"),
        "rule_id": match.get("ruleId"),
        "file": host_file or match["file"],
        # ast-grep's JSON line and column are 0-based; emit_error is 1-based.
        # This is the only place the conversion happens.
        "line": start["line"] + 1,
        "column": start["column"] + 1,
        "end_line": end["line"] + 1,
        "end_column": end["column"] + 1,
        "text": match.get("text", ""),
        "node_kind": meta.get("kind"),
        "language": match.get("language"),
        "metadata": meta,
        "embedded": embedded,
    }


def _blanked_prefix(source, line, column):
    """
    The part of `source` before (1-based) `line`/`column`, with every character
    except the newlines replaced by a space. Prefixing an extracted region with
    this makes the region's line and column numbers in a standalone file equal
    its line and column numbers in the host file.
    """
    lines = source.splitlines(keepends=True)
    out = []
    for raw in lines[: line - 1]:
        out.append(re.sub(r"[^\n]", " ", raw))
    if line - 1 < len(lines):
        out.append(re.sub(r"[^\n]", " ", lines[line - 1][: column - 1]))
    return "".join(out)


def _terminated(text):
    """
    Close an embedded region's last declaration if the author left it open.

    Measured at 0.44.1: tree-sitter-css yields no declaration node for a
    declaration list with no trailing semicolon, so `style="padding: 15px"` and
    styled.div`color: red` would each lose their only candidate. The semicolon is
    appended past the end of the region, so no line or column before it moves.
    """
    stripped = text.rstrip()
    if stripped and not stripped.endswith((";", "}", "{")):
        return text + ";"
    return text


def _mask_template_interpolations(text):
    """Replace `${...}` spans with same-width CSS-safe text.

    A tagged template is valid JavaScript even when its interpolation makes the
    extracted fragment invalid CSS. Masking the interpolation lets tree-sitter
    keep parsing declarations after it without moving their host coordinates.
    Newlines are preserved and the first non-newline character becomes `0`, a
    valid CSS value token; every other character becomes a space.
    """
    chars = list(text)
    i = 0
    while i < len(chars) - 1:
        if chars[i] != "$" or chars[i + 1] != "{":
            i += 1
            continue
        start = i
        depth = 1
        quote = None
        escaped = False
        i += 2
        while i < len(chars) and depth:
            char = chars[i]
            if quote is not None:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == quote:
                    quote = None
            elif char in ("'", '"', "`"):
                quote = char
            elif char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
            i += 1
        if depth:
            break
        wrote_value = False
        for j in range(start, i):
            if chars[j] in ("\n", "\r"):
                continue
            chars[j] = "0" if not wrote_value else " "
            wrote_value = True
    return "".join(chars)


def _position_after(line, column, text):
    """Advance a 1-based source position across `text`."""
    for char in text:
        if char == "\n":
            line, column = line + 1, 1
        else:
            column += 1
    return line, column


def _template_body_region(region):
    """Narrow a tagged-template candidate to the text between its backticks."""
    if region["metadata"].get("kind") != "template_string":
        return region
    text = region["text"]
    first, last = text.find("`"), text.rfind("`")
    if first < 0 or last <= first:
        return region
    prefix = text[:first + 1]
    body = text[first + 1:last]
    start_line, start_column = _position_after(
        region["line"], region["column"], prefix
    )
    end_line, end_column = _position_after(start_line, start_column, body)
    narrowed = dict(region)
    narrowed.update({
        "line": start_line,
        "column": start_column,
        "end_line": end_line,
        "end_column": end_column,
        "text": body,
    })
    return narrowed


def _scan_embedded_css(binary, check_name, regions):
    """
    Re-scan embedded CSS regions (a <style> block or a style="…" attribute in
    html/vue/svelte, a tagged style template literal in js/ts/jsx/tsx) with the
    css rules, so a style context is matched by CSS rules wherever it is written.

    Each region is written to a temp .css file behind a blanked prefix, so every
    line and column the css rules report is already the host file's own.
    """
    if not regions:
        return []
    sources = {}
    out = []
    with tempfile.TemporaryDirectory(prefix="dx-astgrep-") as tmp:
        region_by_temp = {}
        for i, raw_region in enumerate(regions):
            region = _template_body_region(raw_region)
            host = region["file"]
            if host not in sources:
                try:
                    with open(host, encoding="utf-8", errors="replace") as fh:
                        sources[host] = fh.read()
                except OSError:
                    sources[host] = None
            source = sources[host]
            if source is None:
                continue
            prefix = _blanked_prefix(source, region["line"], region["column"])
            temp_path = os.path.join(tmp, f"region-{i}.css")
            with open(temp_path, "w", encoding="utf-8") as fh:
                css = _mask_template_interpolations(region["text"])
                fh.write(prefix + _terminated(css))
            region_by_temp[os.path.realpath(temp_path)] = region
        if not region_by_temp:
            return []
        temp_files = sorted(region_by_temp)
        for i in range(0, len(temp_files), _ASTGREP_BATCH):
            batch = temp_files[i:i + _ASTGREP_BATCH]
            for match in _run_astgrep(binary, check_name, batch):
                region = region_by_temp.get(os.path.realpath(match["file"]))
                if region is None:
                    continue
                cand = _candidate_from_match(match, host_file=region["file"], embedded=True)
                if cand["surface"] in ("parsed", "style-region"):
                    continue
                out.append(_clamp_to_region(cand, region))
    return out


def _clamp_to_region(cand, region):
    """
    Pull a candidate's end back inside its region. Only _terminated()'s appended
    semicolon can push it past, and that character is not in the host file, so a
    candidate must never claim it.
    """
    end = (cand["end_line"], cand["end_column"])
    limit = (region["end_line"], region["end_column"])
    if end > limit:
        cand["end_line"], cand["end_column"] = limit
        if cand["text"].endswith(";"):
            cand["text"] = cand["text"][:-1]
    return cand


def astgrep_scan(paths, check_name):
    """
    The single entry point every harness check uses to reach ast-grep.

    `paths` is an explicit list of FILES, because the caller walks the tree with
    iter_target_files(), because `ast-grep scan` applies .gitignore semantics
    when it walks a directory itself and iter_target_files() does not. Files
    whose extension has no ast-grep language bucket are ignored.

    `check_name` is the check's own name ("token-audit"). It selects the rules
    (`^(shared|<check_name>)-`) and prefixes every ERROR line raised.

    Returns a list of candidate records, sorted by (file, line, column, rule id).
    Each record is a plain dict:

        control    str or None   rule metadata.control, e.g. "TOK-1". None on a
                                 structural rule that carries no control id
        check      str           rule metadata.check
        surface    str           rule metadata.surface, what the candidate is
                                 for ("style", "text", "code", "comment",
                                 "style-region", "parsed", …)
        context    str or None   rule metadata.context, e.g. "className"
        rule_id    str           the ast-grep rule id that matched
        file       str           the path as handed in (the HOST path, even for
                                 a candidate found inside an embedded region)
        line       int           1-based, matching emit_error
        column     int           1-based
        end_line   int           1-based
        end_column int           1-based
        text       str           the matched node's text, what policy parses
        node_kind  str or None   rule metadata.kind
        language   str           the ast-grep language that matched
        metadata   dict          the rule's whole metadata block
        embedded   bool          True when found by re-scanning an embedded
                                 CSS region rather than the host file itself

    Raises AstGrepError for every tool and provisioning failure, including a
    non-empty file that produced no syntax tree. A caller prints the error and
    exits 1; it never treats the failure as a clean run.
    """
    files = []
    for p in paths:
        if astgrep_language_for(p) is not None:
            files.append(p)
    if not files:
        # `ast-grep scan` with no PATHS scans ".", so never let that happen.
        return []
    if not os.path.isfile(SGCONFIG_PATH):
        raise AstGrepError(
            f"ERROR {check_name}: cannot read ast-grep config {SGCONFIG_PATH}"
        )
    binary = _resolve_astgrep(check_name)

    candidates = []
    parsed_files = set()
    regions = []
    ordered = sorted(dict.fromkeys(files))
    for i in range(0, len(ordered), _ASTGREP_BATCH):
        batch = ordered[i:i + _ASTGREP_BATCH]
        for match in _run_astgrep(binary, check_name, batch):
            cand = _candidate_from_match(match)
            if cand["surface"] == "parsed":
                parsed_files.add(os.path.realpath(cand["file"]))
                continue
            if cand["surface"] == "style-region":
                # A region ast-grep already parsed as CSS needs no re-scan: that
                # covers a .css file and, measured at 0.44.1, a <style> block
                # inside html/vue/svelte, which ast-grep parses as CSS in place.
                # A style="…" attribute and a tagged style template literal are
                # not parsed as CSS, so those two are re-scanned.
                if (cand["language"] or "").lower() != "css":
                    regions.append(cand)
            candidates.append(cand)

    for path in ordered:
        try:
            empty = os.path.getsize(path) == 0
        except OSError:
            empty = False
        if empty or os.path.realpath(path) in parsed_files:
            continue
        lang = astgrep_language_for(path)
        raise AstGrepError(
            f"ERROR {check_name}: ast-grep parsed no {lang} syntax tree for "
            f"{path}, a zero-findings result cannot be trusted"
        )

    candidates.extend(_scan_embedded_css(binary, check_name, regions))
    candidates.sort(key=lambda c: (c["file"], c["line"], c["column"], c["rule_id"] or ""))
    return candidates


def surface_lines(source_lines, candidates, surfaces):
    """
    Rebuild each source line as only the text ast-grep offered as a candidate on
    the wanted `surfaces`, with every other character blanked to a space and
    every comment span removed. Returns a dict of 1-based line number to text.

    This is the seam: ast-grep decides which spans of a file are code, and which
    of those are a style context; the policy layer then reads the values out of
    those spans exactly as it always has. A parser never offers comment text as
    code, so the comment-stripping machinery is gone rather than moved.
    """
    wanted = set(surfaces)
    spans = {}
    comments = {}
    for cand in candidates:
        bucket = comments if cand["surface"] == "comment" else (
            spans if cand["surface"] in wanted else None
        )
        if bucket is None:
            continue
        for lineno, start, end in _candidate_line_spans(cand, source_lines):
            bucket.setdefault(lineno, []).append((start, end))

    out = {}
    for lineno, keep in spans.items():
        raw = source_lines[lineno - 1] if lineno - 1 < len(source_lines) else ""
        chars = [" "] * len(raw)
        for start, end in keep:
            for i in range(max(0, start), min(len(raw), end)):
                chars[i] = raw[i]
        for start, end in comments.get(lineno, ()):
            for i in range(max(0, start), min(len(raw), end)):
                chars[i] = " "
        out[lineno] = "".join(chars)
    return out


def _candidate_line_spans(cand, source_lines):
    """Yield (1-based line, start col, end col) 0-based-column spans a candidate
    covers. A multi-line node covers each of its lines."""
    first, last = cand["line"], cand["end_line"]
    for lineno in range(first, last + 1):
        if lineno - 1 >= len(source_lines):
            break
        width = len(source_lines[lineno - 1])
        start = cand["column"] - 1 if lineno == first else 0
        end = cand["end_column"] - 1 if lineno == last else width
        yield (lineno, start, end)


# ── Parity corpus ─────────────────────────────────────────────────────────────
#
# fixtures/parity/ holds the known-positive and known-negative corpus, plus one
# expected/<fixture>.<check>.txt record per fixture and check. Every record was
# produced by the PRE-swap engine and committed before the swap, so a diff to
# expected/ in review means either a fixture changed or the swap changed a
# decision, and the second is forbidden. See fixtures/parity/README.md.

PARITY_DIR = os.path.join(_CHECKS_DIR, "fixtures", "parity")
PARITY_GROUPS = ("known-positive", "known-negative")


def parity_fixtures():
    """(group, basename, path) for every parity-corpus fixture, in a stable order."""
    out = []
    for group in PARITY_GROUPS:
        d = os.path.join(PARITY_DIR, group)
        if not os.path.isdir(d):
            continue
        for name in sorted(os.listdir(d)):
            if name.startswith("."):
                continue
            out.append((group, name, os.path.join(d, name)))
    return out


def parity_expected(name, check_name):
    """The recorded pre-swap output lines for one fixture and check."""
    path = os.path.join(PARITY_DIR, "expected", f"{name}.{check_name}.txt")
    try:
        with open(path, encoding="utf-8") as fh:
            return fh.read().splitlines()
    except OSError:
        return None


def parity_normalise(lines, path, name):
    """
    Rewrite emitted lines into the path-independent form the records hold: the
    fixture's basename in place of whatever relative path the caller's working
    directory produced.
    """
    rel = os.path.relpath(path)
    return [ln.replace(rel, name) for ln in lines]


def parity_cases(check_name, scan_one):
    """
    Compare every corpus fixture against its recorded pre-swap output. Returns
    (failures, case_count) for the caller's --self-test to fold in.

    `scan_one(path)` runs the check over one fixture and returns its emitted
    lines. Both check scripts call this rather than each keeping a copy of the
    comparison, so the corpus is read one way only.
    """
    failures = []
    count = 0
    for group, name, path in parity_fixtures():
        count += 1
        want = parity_expected(name, check_name)
        got = parity_normalise(scan_one(path), path, name)
        if want is None:
            failures.append(f"FAIL parity {group}/{name}: no expected record")
        elif want != got:
            failures.append(f"FAIL parity {group}/{name}: want: {want!r}; got: {got!r}")
        if group == "known-negative" and got:
            failures.append(f"FAIL parity {group}/{name}: want no ERROR; got: {got!r}")
    return failures, count


def group_candidates(candidates):
    """Bucket astgrep_scan()'s records by the file they belong to, so a check can
    walk files while paying for one ast-grep invocation."""
    by_file = {}
    for cand in candidates:
        by_file.setdefault(os.path.realpath(cand["file"]), []).append(cand)
    return by_file


def parse_rules_flag(args, valid_rules):
    """Additive `--rules ID1,ID2` (or `--rules=ID1`). Removes the flag from
    `args` in place; returns the control-id set (or None when absent). Raises
    ValueError on an unknown or empty id so the caller can fail as a usage
    error. The default (no flag) selects every id, unchanged."""
    rules = None
    i = 0
    while i < len(args):
        a = args[i]
        val = None
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
        unknown = ids - valid_rules
        if unknown:
            raise ValueError(
                f"--rules: unknown id(s) {sorted(unknown)}; valid: {sorted(valid_rules)}"
            )
        rules = ids if rules is None else (rules | ids)
    return rules


def emit_error(rel, lineno, ctl, found, suggest, extra=None):
    """The canonical `ERROR {rel}:{lineno} [{ctl}] {found} — suggest: {suggest}`
    line. detect.py's `_FINDING_RE` reverse-parses this exact shape — change
    them together.

    `extra` fills the optional second bracket — `[{ctl}][{extra}]` — which
    `_FINDING_RE` already tolerates and discards. a11y-eslint.py names the
    jsx-a11y rule that fired there, so a finding traces back to its mapping
    row; token-audit.py's `[waiver-claimed]` uses the same slot.

    `lineno` is a 1-based source line for a static check. A rendered check has
    no source line, so the slot carries a run-matrix cell instead — see
    `emit_rendered_error` — and `_FINDING_RE`'s position group is wide enough
    for both. A digits-only position still parses back to an integer line.
    """
    tail = f"[{extra}]" if extra else ""
    return f"ERROR {rel}:{lineno} [{ctl}]{tail} {found} — suggest: {suggest}"


def emit_rendered_error(route, cell, ctl, found, suggest, extra=None):
    """The rendered check's finding line: `ERROR {route}:{cell} [{ctl}] …`.

    A rendered finding has a URL and a DOM node where a static one has a file
    and a line, so the two-field shape is kept and filled with the rendered
    analogue: `route` is the served path with its leading slash
    (`/standards/slp-4`) and `cell` names the run-matrix cell that produced it
    (`360-light`, `1280-dark`, `1280-reduced-motion`).

    A leading slash is what tells the two apart: `emit_error` is always given a
    repo-relative path, which never starts with one. The route is the path
    only, never the full URL — a scheme's `//` would put a second colon in the
    file half and mis-split the line. The origin belongs in a NOTE.
    """
    if not str(route).startswith("/"):
        route = "/" + str(route).lstrip("/")
    return emit_error(route, cell, ctl, found, suggest, extra=extra)


_CATALOG_ID_RE = re.compile(r"^\s*-\s+id:\s*([A-Z][A-Z0-9]*-\d+)\s*$")
_CATALOG_TIER_RE = re.compile(r"^\s*tier:\s*(\S+)\s*$")


def catalog_tiers(path=None):
    """
    {control id: tier} from `standards/catalog.yaml`, parsed with a stdlib
    regex (the same shape scripts/generate-design-json.py uses) so a check that
    needs a tier stays dependency-free. `waiver-reconcile.py` keeps its own
    yaml-based reader because it needs whole control bodies; this one reads two
    fields and must work where PyYAML is absent.

    Returns {} when the catalogue cannot be read — a caller states less, it
    never crashes and never guesses a tier.
    """
    if path is None:
        checks_dir = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(os.path.dirname(checks_dir), "standards", "catalog.yaml")
    tiers, current = {}, None
    try:
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                m = _CATALOG_ID_RE.match(line)
                if m:
                    current = m.group(1)
                    continue
                if current:
                    t = _CATALOG_TIER_RE.match(line)
                    if t:
                        tiers[current] = t.group(1)
                        current = None
    except OSError:
        return {}
    return tiers


def l0_subset(controls, tiers=None):
    """The L0 members of `controls`, in the order given. Used to say "this one
    still blocks" when a layer could not verify it."""
    tiers = catalog_tiers() if tiers is None else tiers
    return [c for c in controls if tiers.get(c) == "L0"]


class RuleMapError(Exception):
    """Raised when the a11y rule map is missing or unreadable — a
    misconfiguration, not a finding."""


def load_rule_map(path=None):
    """
    Load the rule -> control-id map (`checks/a11y-rule-map.json`). Returns the
    parsed dict with `version`, `rules` (one rule id -> exactly one control
    id) and `layers` (layer name -> the control ids it covers).

    A missing or malformed map is a misconfiguration, never a finding and
    never a silent pass: it raises RuleMapError for the caller to report as an
    operational ERROR.
    """
    if path is None:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                            RULE_MAP_FILENAME)
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError) as exc:
        raise RuleMapError(f"cannot read {os.path.basename(path)}: {exc}")
    if not isinstance(data, dict) or not isinstance(data.get("rules"), dict) \
            or not isinstance(data.get("layers"), dict):
        raise RuleMapError(
            f"{os.path.basename(path)} must be an object with 'rules' and 'layers'")
    for rule, ctl in data["rules"].items():
        if not isinstance(ctl, str):
            raise RuleMapError(f"rule '{rule}' must map to exactly one control id")
    return data


def layer_controls(layer, rule_map=None):
    """
    The control ids a named layer covers, from the rule map's `layers` block.
    Used by a layer that could not run to name the controls going to manual
    verification — a control never silently passes. An unknown layer name is a
    misconfiguration (RuleMapError), not an empty list.
    """
    data = rule_map if rule_map is not None else load_rule_map()
    controls = data["layers"].get(layer)
    if not isinstance(controls, list) or not controls:
        raise RuleMapError(f"no controls listed for layer '{layer}' in {RULE_MAP_FILENAME}")
    return list(controls)


def report_self_test(failures, case_count):
    """
    Print the `SELF-TEST OK (N cases)` / `SELF-TEST FAILED (…)` lines and
    exit with the same codes every check script uses today (0 clean, 1 on
    any failure). Does not return.
    """
    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {case_count} cases run)")
        sys.exit(1)
    print(f"SELF-TEST OK ({case_count} cases)")
    sys.exit(0)


_PROVISIONING_CHILD_ENV = "DX_ASTGREP_PROVISIONING_CHILD"


def astgrep_provisioning_cases(script, target, check_eq):
    """
    Assert one check script's provisioning contract end to end: a missing,
    unreadable or too-old ast-grep prints exactly one ERROR line naming the tool
    and the required floor, exits 1, prints no findings, and never reports
    SELF-TEST OK. A layer that did not run sends its controls to manual
    verification; it never lets a control pass in silence.

    Called from each check script's own --self-test, so the contract is asserted
    where the script is gated. `script` is a filename in checks/ and `target` is a
    path to scan, both relative to checks/. `check_eq(name, want, got)` is the
    caller's assertion helper.

    A no-op inside a child this function spawned, so it can never recurse.
    """
    if os.environ.get(_PROVISIONING_CHILD_ENV):
        return
    name = script[: -len(".py")] if script.endswith(".py") else script

    def run(args, path_dir):
        env = dict(os.environ)
        env["PATH"] = path_dir
        env[_PROVISIONING_CHILD_ENV] = "1"
        proc = subprocess.run(
            [sys.executable, os.path.join(_CHECKS_DIR, script)] + args,
            capture_output=True, text=True, cwd=_CHECKS_DIR, env=env,
        )
        errs = [ln for ln in proc.stdout.splitlines() if ln.startswith("ERROR")]
        return proc, errs

    def shim_dir(tmp, version_line):
        shim = os.path.join(tmp, "ast-grep")
        with open(shim, "w", encoding="utf-8") as fh:
            fh.write(f'#!/bin/sh\necho "{version_line}"\n')
        os.chmod(shim, 0o755)
        return tmp

    with tempfile.TemporaryDirectory(prefix="dx-no-astgrep-") as empty:
        proc, errs = run([target], empty)
        check_eq(f"{name}: missing ast-grep exits 1", 1, proc.returncode)
        check_eq(f"{name}: missing ast-grep prints exactly one ERROR line", 1, len(errs))
        check_eq(
            f"{name}: missing ast-grep names the tool and the floor",
            True,
            bool(errs) and "ast-grep" in errs[0] and ASTGREP_MIN_VERSION_STR in errs[0],
        )
        check_eq(
            f"{name}: missing ast-grep prints no findings",
            [],
            [ln for ln in proc.stdout.splitlines() if "[TOK-" in ln or "[TYP-" in ln],
        )
        proc, _ = run(["--self-test"], empty)
        check_eq(f"{name}: missing ast-grep never reports SELF-TEST OK",
                 (1, False), (proc.returncode, "SELF-TEST OK" in proc.stdout))

    with tempfile.TemporaryDirectory(prefix="dx-old-astgrep-") as tmp:
        proc, errs = run([target], shim_dir(tmp, "ast-grep 0.41.0"))
        check_eq(f"{name}: ast-grep below the floor exits 1", 1, proc.returncode)
        check_eq(
            f"{name}: ast-grep below the floor names both versions",
            True,
            len(errs) == 1 and "0.41.0" in errs[0] and ASTGREP_MIN_VERSION_STR in errs[0],
        )

    with tempfile.TemporaryDirectory(prefix="dx-odd-astgrep-") as tmp:
        proc, errs = run([target], shim_dir(tmp, "sg (unknown build)"))
        check_eq(
            f"{name}: an unreadable ast-grep version is refused",
            True,
            proc.returncode == 1 and len(errs) == 1
            and "cannot read ast-grep version" in errs[0]
            and ASTGREP_MIN_VERSION_STR in errs[0],
        )


def _astgrep_config_failure_cases(check_eq):
    """A broken or missing harness config is refused, never treated as clean."""
    fixture = os.path.join("fixtures", "parity", "known-positive", "declaration.css")
    # A rule file ast-grep cannot parse (exit 8) is named, its stderr forwarded.
    global SGCONFIG_PATH
    real_config = SGCONFIG_PATH
    with tempfile.TemporaryDirectory(prefix="dx-bad-rule-") as bad:
        os.makedirs(os.path.join(bad, "rules"))
        rule_path = os.path.join(bad, "rules", "broken.yml")
        with open(rule_path, "w", encoding="utf-8") as fh:
            fh.write("id: shared-broken-css\nlanguage: css\nseverity: warning\n"
                     "message: m\nrule:\n  notAnAstGrepField: x\n")
        config = os.path.join(bad, "sgconfig.yml")
        with open(config, "w", encoding="utf-8") as fh:
            fh.write("ruleDirs:\n  - rules\n")
        target = os.path.join(bad, "probe.css")
        with open(target, "w", encoding="utf-8") as fh:
            fh.write(".a { color: #fff }\n")
        SGCONFIG_PATH = config
        try:
            astgrep_scan([target], "token-audit")
            raised = None
        except AstGrepError as exc:
            raised = exc
        finally:
            SGCONFIG_PATH = real_config
    check_eq(
        "malformed rule: names the rule path and forwards ast-grep's stderr",
        True,
        raised is not None
        and raised.line.startswith("ERROR token-audit: rule ")
        and raised.line.endswith("is not a valid ast-grep rule, see stderr")
        and "broken.yml" in raised.line
        and "Cannot parse rule" in raised.stderr,
    )

    # A missing config is a loud failure too, never a clean run.
    SGCONFIG_PATH = os.path.join(_CHECKS_DIR, "no-such-sgconfig.yml")
    try:
        astgrep_scan([os.path.join(_CHECKS_DIR, fixture)], "token-audit")
        missing = None
    except AstGrepError as exc:
        missing = exc
    finally:
        SGCONFIG_PATH = real_config
    check_eq(
        "missing config: refused rather than treated as a clean run",
        True,
        missing is not None and "cannot read ast-grep config" in missing.line,
    )


def _self_test():
    failures = []
    case_count = 0

    def check(name, cond):
        nonlocal case_count
        case_count += 1
        if not cond:
            failures.append(f"FAIL {name}")

    def check_eq(name, want, got):
        nonlocal case_count
        case_count += 1
        if want != got:
            failures.append(f"FAIL {name}: want: {want!r}; got: {got!r}")

    # ── strip_block_comments / ends_in_block_comment ────────────────────────
    check(
        "strip: no comment",
        strip_block_comments("const x = 1;", False) == "const x = 1;",
    )
    check(
        "strip: single-line block comment",
        strip_block_comments("a /* comment */ b", False) == "a  b",
    )
    check(
        "strip: unterminated block comment truncates line",
        strip_block_comments("a /* start of comment", False) == "a ",
    )
    check(
        "strip: continuation line inside comment",
        strip_block_comments("still inside */ after", True) == " after",
    )
    check(
        "strip: continuation line, comment never ends",
        strip_block_comments("still inside, no end", True) == "",
    )
    check(
        "strip: two block comments on one line",
        strip_block_comments("a /*x*/ b /*y*/ c", False) == "a  b  c",
    )
    check("ends: no comment stays false", ends_in_block_comment("plain line", False) is False)
    check(
        "ends: unterminated comment carries state",
        ends_in_block_comment("a /* start", False) is True,
    )
    check(
        "ends: terminated comment clears state",
        ends_in_block_comment("still open */ then closed", True) is False,
    )
    check(
        "ends: continuation line stays open",
        ends_in_block_comment("no terminator here", True) is True,
    )

    # ── iter_target_files: skip policy + extension filter ───────────────────
    import tempfile

    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, "node_modules", "pkg"))
        os.makedirs(os.path.join(td, ".git"))
        os.makedirs(os.path.join(td, "app"))
        with open(os.path.join(td, "node_modules", "pkg", "x.tsx"), "w") as fh:
            fh.write("x")
        with open(os.path.join(td, ".git", "y.tsx"), "w") as fh:
            fh.write("y")
        with open(os.path.join(td, "app", "page.tsx"), "w") as fh:
            fh.write("z")
        with open(os.path.join(td, "app", "notes.md"), "w") as fh:
            fh.write("md")

        found = [
            (kind, os.path.relpath(val, td))
            for kind, val in iter_target_files([td])
        ]
        files_found = {v for k, v in found if k == "file"}
        check(
            "walker: skips node_modules",
            not any("node_modules" in v for v in files_found),
        )
        check("walker: skips .git", not any(".git" in v for v in files_found))
        check(
            "walker: finds matching extension under a normal dir",
            os.path.join("app", "page.tsx") in files_found,
        )
        check(
            "walker: excludes non-target extension",
            os.path.join("app", "notes.md") not in files_found,
        )

        missing = list(iter_target_files([os.path.join(td, "does-not-exist")]))
        check(
            "walker: missing path yields ('missing', path), not an exception",
            missing == [("missing", os.path.join(td, "does-not-exist"))],
        )

    # ── emit_error ────────────────────────────────────────────────────────────
    check(
        "emit_error: canonical shape",
        emit_error("app/page.tsx", 12, "TYP-2", "font size 12px", "use >= 14px")
        == "ERROR app/page.tsx:12 [TYP-2] font size 12px — suggest: use >= 14px",
    )
    check(
        "emit_error: optional second bracket names the rule that fired",
        emit_error("app/x.tsx", 3, "A11Y-2", "not focusable", "add tabIndex",
                   extra="jsx-a11y/interactive-supports-focus")
        == "ERROR app/x.tsx:3 [A11Y-2][jsx-a11y/interactive-supports-focus] "
           "not focusable — suggest: add tabIndex",
    )

    # ── parse_rules_flag ─────────────────────────────────────────────────────
    valid = {"A11Y-7", "CMP-6"}
    args = ["--rules", "A11Y-7,CMP-6", "some/path"]
    check_eq("parse_rules_flag: list form",
             ({"A11Y-7", "CMP-6"}, ["some/path"]),
             (parse_rules_flag(args, valid), args))
    args = ["--rules=cmp-6", "p"]
    check_eq("parse_rules_flag: = form normalises case",
             ({"CMP-6"}, ["p"]), (parse_rules_flag(args, valid), args))
    check_eq("parse_rules_flag: absent returns None",
             None, parse_rules_flag(["p"], valid))
    try:
        parse_rules_flag(["--rules", "TYP-1", "p"], valid)
        check_eq("parse_rules_flag: rejects an unknown id", "ValueError", "no error")
    except ValueError as exc:
        check_eq("parse_rules_flag: rejects an unknown id", True,
                 "TYP-1" in str(exc) and "A11Y-7" in str(exc))

    # ── rule map ──────────────────────────────────────────────────────────────
    rule_map = load_rule_map()
    check("rule map: version 1", rule_map["version"] == 1)
    check(
        "rule map: one rule maps to exactly one control id",
        all(isinstance(v, str) for v in rule_map["rules"].values()),
    )
    check(
        "layer_controls: the eslint layer names its controls",
        layer_controls("eslint-jsx-a11y", rule_map) == ["A11Y-2", "A11Y-3", "A11Y-6", "A11Y-8"],
    )
    check(
        "catalog_tiers: reads a control's tier without yaml",
        catalog_tiers().get("A11Y-2") == "L0",
    )
    check(
        "catalog_tiers: an unreadable catalogue yields {}, never a guess",
        catalog_tiers(os.path.join("no", "such", "catalog.yaml")) == {},
    )
    check(
        "l0_subset: keeps only the L0 controls, in order",
        l0_subset(["A11Y-6", "A11Y-2", "A11Y-3"]) == ["A11Y-2", "A11Y-3"],
    )
    raised_layer = False
    try:
        layer_controls("no-such-layer", rule_map)
    except RuleMapError:
        raised_layer = True
    check("layer_controls: unknown layer is a misconfiguration, not an empty list",
          raised_layer)
    with tempfile.TemporaryDirectory() as td:
        bad = os.path.join(td, "broken.json")
        with open(bad, "w", encoding="utf-8") as fh:
            fh.write("{ not json")
        raised_map = False
        try:
            load_rule_map(bad)
        except RuleMapError:
            raised_map = True
        check("load_rule_map: malformed map raises, never returns empty", raised_map)

    # ── ast-grep version floor ────────────────────────────────────────────────
    check_eq("version: reads ast-grep --version output",
             (0, 44, 1), parse_astgrep_version("ast-grep 0.44.1"))
    check_eq("version: reads a bare number", (1, 2, 3), parse_astgrep_version("1.2.3"))
    check_eq("version: unreadable output is None", None, parse_astgrep_version("sg (unknown)"))
    check_eq("version: empty output is None", None, parse_astgrep_version(""))
    check_eq("version: the floor itself passes", True, astgrep_version_ok((0, 44, 1)))
    check_eq("version: above the floor passes", True, astgrep_version_ok((0, 45, 0)))
    check_eq("version: below the floor fails", False, astgrep_version_ok((0, 41, 0)))
    check_eq("version: unreadable fails", False, astgrep_version_ok(None))

    # ── language buckets ──────────────────────────────────────────────────────
    check_eq("bucket: .ts is its own bucket, never tsx", "ts", astgrep_language_for("a.ts"))
    check_eq("bucket: .js aliases to tsx", "tsx", astgrep_language_for("a.js"))
    check_eq("bucket: .vue reaches html", "html", astgrep_language_for("a.vue"))
    check_eq("bucket: an unknown extension has none", None, astgrep_language_for("a.md"))

    # Embedded template interpolations are masked without moving any host
    # coordinate, including nested and multi-line expressions.
    check_eq("template mask keeps width", len("x${c}y"),
             len(_mask_template_interpolations("x${c}y")))
    check_eq("template mask preserves newlines", 2,
             _mask_template_interpolations("${{\n  color: c\n}}").count("\n"))
    quoted_brace = '${() => "}"}'
    masked_quoted_brace = _mask_template_interpolations(quoted_brace)
    check_eq("template mask ignores braces inside strings", (len(quoted_brace), False),
             (len(masked_quoted_brace), "${" in masked_quoted_brace))

    # ── surface_lines: the seam ───────────────────────────────────────────────
    src = ['.a { color: #fff } /* say #000 */']
    cands = [
        {"surface": "style", "line": 1, "column": 6, "end_line": 1, "end_column": 18},
        {"surface": "comment", "line": 1, "column": 20, "end_line": 1, "end_column": 34},
    ]
    check_eq("surface: keeps the candidate span and blanks the rest",
             "     color: #fff                 ", surface_lines(src, cands, ("style",))[1])
    check_eq("surface: a line with no candidate is absent",
             {}, surface_lines(["plain"], [], ("style",)))
    over = [{"surface": "style", "line": 1, "column": 1, "end_line": 2, "end_column": 4}]
    check_eq("surface: a multi-line candidate covers each of its lines",
             {1: "ab", 2: "cde"}, surface_lines(["ab", "cde"], over, ("style",)))

    check_eq("blanked prefix: keeps newlines, blanks everything else",
             "     \n  ", _blanked_prefix("abcde\nfghij\n", 2, 3))
    check_eq("terminated: closes an open declaration list",
             "padding: 15px;", _terminated("padding: 15px"))
    check_eq("terminated: leaves a closed one alone",
             "padding: 15px;", _terminated("padding: 15px;"))
    check_eq("terminated: leaves a braced body alone",
             ".a { color: red }", _terminated(".a { color: red }"))
    clamped = _clamp_to_region(
        {"end_line": 1, "end_column": 15, "text": "padding: 15px;"},
        {"end_line": 1, "end_column": 14},
    )
    check_eq("clamp: an appended semicolon never claims a host character",
             (1, 14, "padding: 15px"),
             (clamped["end_line"], clamped["end_column"], clamped["text"]))

    # ── astgrep_scan guards ───────────────────────────────────────────────────
    check_eq("scan: no scannable file means no ast-grep run and no directory walk",
             [], astgrep_scan(["notes.md"], "token-audit"))

    _astgrep_config_failure_cases(check_eq)

    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {case_count} cases run)")
        sys.exit(1)
    print(f"SELF-TEST OK ({case_count} cases)")
    sys.exit(0)


if __name__ == "__main__":
    if "--self-test" in sys.argv[1:]:
        _self_test()
    else:
        print("Usage: python3 checks/checklib.py --self-test")
        sys.exit(1)
