#!/usr/bin/env python3
"""
Structure scan — checks/structure-scan.py
The static structure walk. It carries one sub-rule under two control ids: a
`<table>` or a `role="table"` element whose whole subtree holds no `<th>` and no
`role="columnheader"`. A11Y-7 and CMP-6 fail in that same shape and are decided
by that same walk, so one check answers both.

The check is named `structure`; the file is `structure-scan.py` because every
other scan script in this layer is `*-scan.py`.

Detection rule (one sub-rule, two control ids)
──────────────────────────────────────────────
Sub-rule        Controls          What is caught
TABLE-HEADERS   A11Y-7 (L1)       A `<table>` element with no `<th>` anywhere in
                CMP-6  (L2)       its subtree, or an element with `role="table"`
                                  and no `role="columnheader"` anywhere in its
                                  subtree.

One detected element yields one ERROR line per control id, at the same file and
line, A11Y-7 first so output is deterministic. Every line carries exactly one
control id in its bracket: detect.py's `_FINDING_RE` captures a single control
per line, so a compound `[A11Y-7, CMP-6]` bracket would break the detector's
ignore layer and its --json `control` field.

Why both ids, and not CMP-6 alone
─────────────────────────────────
The two controls sit on different tiers and carry different waiver classes: an
L1 failure loops the agent back to implement and an L2 failure does not, and
A11Y-7 takes a documented waiver where CMP-6 takes a rationale. Reporting under
CMP-6 alone would silently downgrade an L1 defect to L2, let a CMP-6 waiver mute
A11Y-7, and leave A11Y-7's static half producing nothing at all. Which id a
finding lands under changes what happens next, so both are named.

Attribution lives in RULE_CONTROLS below and nowhere else. It is not registered
in `checks/a11y-rule-map.json`: that file maps each axe or jsx-a11y rule to
exactly one control id and refuses a list, this sub-rule is neither of those and
answers to two ids, and CMP-6 is not an accessibility control.

What this check does NOT verify
───────────────────────────────
- Heading hierarchy (one h1, no skipped levels) and list semantics. axe's
  `heading-order`, `list` and `listitem` own those at the rendered layer. A
  source walk cannot see a page assembled from a layout, MDX and components, so
  a static heading walk would flag good work. `standards/controls/a11y-7.md`
  once promised such a walk; it does not ship, here or anywhere.
- Styled divs standing in for a heading, a list or a table, which is A11Y-7's own
  first fails_when clause. Deciding that content *is* a heading, list or table is
  pattern-fit judgment, which standards/controls/cmp-6.md keeps with the
  evaluator. A static rule for it flags every CSS grid.
- Form grouping (`fieldset` / `legend`): it needs to know which fields are
  related.
- Descriptive headings and labels, which stay manual by the standard's own
  ruling.
- Alignment and tabular figures (CMP-6's other clauses). No rule here reads an
  alignment utility, `tabular-nums`, or the content of a `<td>`. A source scan
  cannot see which figures line up in a rendered column, and cmp-6.md exempts a
  deliberately left-aligned identifier column, a distinction no source scan can
  make. TYP-5's gap is accepted for the same reason.
- `role="grid"` and `role="treegrid"`, persistent-header behaviour (rendered),
  and empty and loading states (CMP-3, which is cmp-scan.py's).

Note that the narrowing catches a case neither control's fails_when list names
literally: both lists describe divs used *instead of* a table, and the rule here
catches a real table *missing* its `<th>`. The div case is the judgment above,
which is why it is not here. Do not widen the rule to close that gap.

A dynamically composed header is a NOTE, not an ERROR
─────────────────────────────────────────────────────
Calibration found one false-positive class: a table whose header region is built
by a component, `<thead><HeaderRow columns={columns} /></thead>`. The header cells
exist, just not where source can see them. The header region is the `<thead>`
subtree if present, else the first `<tr>` subtree, else the whole matched
subtree; when that region holds a component element, the finding downgrades to a
NOTE per control id and the run still exits 0. A check never blocks on a guess,
and a NOTE is never a silent pass.

A bare JSX expression container (`{s.name}`) in the region does not downgrade on
its own: a mapped table body puts one in the "first <tr>" fallback of every
dynamically-rendered table, and a value interpolation can never hide a <th>.
Only a component element can render markup source cannot see.

Languages
─────────
`.tsx`, `.jsx`, `.js` and `.ts` go through the tsx and ts grammars, `.html`
through the html grammar. `.vue` and `.svelte` are not ast-grep languages at
0.44.1; sgconfig.yml routes them to the html rules, but a single-file component
composes its table from directives and slots that grammar reads as plain text,
so this check does not claim them. It counts them instead and sends A11Y-7 and
CMP-6 to manual verification for those files, so a layer that did not run never
reads as a pass.

Waiver suppression
──────────────────
None. This script does not parse `dx-waive` markers, for the standing reason
a11y-static.py records: waiver parsing inside a partial check manufactures a
false sense of coverage. `checks/waiver-reconcile.py` reconciles recorded
waivers, and the two controls' waiver classes differ, so one suppression must
never mute both.

Output
──────
ERROR <file>:<line> [<CTL-ID>] <found> — suggest: <...>
NOTE  structure: <file>:<line> [<CTL-ID>] <...>  (unresolvable, never a pass)
Exit 0 and print nothing (or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any violation (NOTE lines alone do not fail).
"""

import importlib.util
import os
import re
import sys

_CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_checklib():
    path = os.path.join(_CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_dx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()

# The check's name, which is what detect.py prints in its per-check header, what
# prefixes every operational ERROR line, and what selects this check's ast-grep
# rules (`^(shared|structure)-`).
CHECK_NAME = "structure"

# ── Attribution: one sub-rule, two control ids ────────────────────────────────
# The only place attribution is decided. The tuple order fixes emit order, so the
# same defect always prints A11Y-7 first and CMP-6 second.
RULE_CONTROLS = {"TABLE-HEADERS": ("A11Y-7", "CMP-6")}

# ── Target extensions ─────────────────────────────────────────────────────────
# The subset of checklib.TARGET_EXTENSIONS this check claims. `.css` holds no
# markup to walk; `.vue` and `.svelte` are counted and reported, never scanned
# (see the docstring).
TARGET_EXTENSIONS = {".tsx", ".jsx", ".ts", ".js", ".html"}
UNCLAIMED_EXTENSIONS = {".vue", ".svelte"}

# ── Per-pattern wording ───────────────────────────────────────────────────────
# Wording only. Which control ids a finding lands under is RULE_CONTROLS' call,
# never this table's.
PATTERN_MESSAGES = {
    "table-element": (
        "<table> with no <th> header cell in its subtree",
        "add <th scope=\"col\"> header cells so the row and column relationship "
        "is programmatically determinable",
    ),
    "role-table": (
        "role=\"table\" with no role=\"columnheader\" in its subtree",
        "add role=\"columnheader\" to the header cells, or render a real "
        "<table> with <th>",
    ),
}

# A component element (`<HeaderRow`) or a JSX expression container (`{…}`) inside
# the header region means the header cells are composed at runtime. Neither is a
# defect; both make the region unresolvable from source.
_COMPONENT_ELEMENT_RE = re.compile(r"<[A-Z][A-Za-z0-9_.]*")
_HEADER_TAGS = ("thead", "tr")


def header_region(text):
    """
    The span of a matched table subtree that would hold its header cells: the
    `<thead>` subtree if present, else the first `<tr>` subtree, else the whole
    subtree. A role="table" element has neither tag, so it falls through to the
    whole subtree, which is the conservative end.
    """
    for tag in _HEADER_TAGS:
        opening = re.search(rf"<{tag}\b", text, re.IGNORECASE)
        if opening is None:
            continue
        closing = re.search(rf"</{tag}\s*>", text[opening.start():], re.IGNORECASE)
        if closing is None:
            return text[opening.start():]
        return text[opening.start():opening.start() + closing.end()]
    return text


def header_is_composed(text):
    """
    True when the header region is built by a component reference, so source
    cannot say whether header cells exist. The finding downgrades to a NOTE
    rather than blocking on a guess.

    A bare JSX expression (`{s.name}`) is not enough on its own: a mapped table
    body puts one in the "first <tr>" fallback of every dynamically-rendered
    table, and that value interpolation can never hide a <th>. Only a component
    element can render markup source cannot see, so only that signal counts.
    """
    region = header_region(text)
    return bool(_COMPONENT_ELEMENT_RE.search(region))


def check_file(filepath, rules=None, candidates=None):
    """
    Scan a single file. Returns a list of ERROR / NOTE strings.

    `rules` (additive, optional): a set of control ids to keep, the `--rules`
    selection. When None every control id is emitted. Operational errors are
    never filtered by it.
    `candidates`: this file's records from checklib.astgrep_scan(). Omit it and
    the file is scanned on its own; scan_paths() passes a pre-grouped list so a
    whole tree costs one ast-grep invocation.
    """
    rule_filter = set(rules) if rules is not None else None
    results = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in TARGET_EXTENSIONS:
        return results

    try:
        with open(filepath, encoding="utf-8", errors="replace"):
            pass
    except OSError as exc:
        results.append(f"ERROR {filepath}: cannot read file — {exc}")
        return results

    if candidates is None:
        candidates = checklib.astgrep_scan([filepath], CHECK_NAME)

    rel = os.path.relpath(filepath)

    # One element can match both the `<table>` rule and the role="table" rule
    # (a `<table role="table">` with neither header form). Deduplicating on the
    # matched node's position keeps that one defect to one finding per control.
    seen = set()
    for cand in candidates:
        sub_rule = (cand.get("metadata") or {}).get("rule")
        if sub_rule not in RULE_CONTROLS:
            continue
        position = (cand["line"], cand["column"])
        if position in seen:
            continue
        seen.add(position)

        pattern = (cand.get("metadata") or {}).get("pattern")
        found, suggest = PATTERN_MESSAGES[pattern]
        composed = header_is_composed(cand["text"])
        for ctl in RULE_CONTROLS[sub_rule]:
            if rule_filter is not None and ctl not in rule_filter:
                continue
            if composed:
                results.append(
                    f"NOTE  {CHECK_NAME}: {rel}:{cand['line']} [{ctl}] the header "
                    f"region is composed at runtime, so header cells could not be "
                    f"resolved — verify the rendered table by hand"
                )
            else:
                results.append(
                    checklib.emit_error(rel, cand["line"], ctl, found, suggest)
                )
    return results


def unclaimed_files(paths):
    """The `.vue` / `.svelte` files in `paths`. They are reported, never scanned,
    so a language this check cannot judge never reads as a clean pass."""
    return [
        val for kind, val in checklib.iter_target_files(paths, UNCLAIMED_EXTENSIONS)
        if kind == "file"
    ]


def scan_paths(paths, rules=None):
    """Walk paths, collect ERROR/NOTE lines.

    checklib.iter_target_files() stays the single walk policy and the file list
    is handed to ast-grep explicitly: letting ast-grep walk a directory would
    import .gitignore semantics the Python walker does not have, and a gitignored
    source file would be skipped in silence.

    Raises checklib.AstGrepError when ast-grep is missing, too old or broken."""
    all_results = []
    files = []
    for kind, val in checklib.iter_target_files(paths, TARGET_EXTENSIONS):
        if kind == "missing":
            all_results.append(f"ERROR {CHECK_NAME}: path not found: {val}")
        else:
            files.append(val)

    by_file = checklib.group_candidates(checklib.astgrep_scan(files, CHECK_NAME))
    for val in files:
        all_results.extend(
            check_file(val, rules, by_file.get(os.path.realpath(val), []))
        )

    skipped = unclaimed_files(paths)
    if skipped:
        controls = ", ".join(RULE_CONTROLS["TABLE-HEADERS"])
        all_results.append(
            f"NOTE  {CHECK_NAME}: {len(skipped)} .vue/.svelte file(s) were not "
            f"parsed — {controls} go to manual verification for them"
        )
    return all_results


# ── Self-test ─────────────────────────────────────────────────────────────────

def run_self_test():
    import tempfile

    failures = []
    case_count = 0

    def run(content, ext, rules=None):
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False,
                                         encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            res = check_file(tf.name, rules)
        os.unlink(tf.name)
        return res

    def control_ids(results):
        ids = []
        for line in results:
            if not line.startswith("ERROR"):
                continue
            m = re.search(r"\[([A-Z0-9-]+)\]", line)
            if m:
                ids.append(m.group(1))
        return ids

    def assert_violations(name, content, ext, expected_ctl_ids):
        nonlocal case_count
        case_count += 1
        got = control_ids(run(content, ext))
        if got != list(expected_ctl_ids):
            failures.append(f"FAIL {name}: want: {list(expected_ctl_ids)!r}; got: {got!r}")

    def assert_clean(name, content, ext):
        nonlocal case_count
        case_count += 1
        errs = [line for line in run(content, ext) if line.startswith("ERROR")]
        if errs:
            failures.append(f"FAIL {name}: want: []; got: {errs!r}")

    def check_eq(name, want, got):
        nonlocal case_count
        case_count += 1
        if want != got:
            failures.append(f"FAIL {name}: want: {want!r}; got: {got!r}")

    def assert_doc(name, want_fragment):
        nonlocal case_count
        case_count += 1
        if want_fragment not in " ".join(__doc__.split()):
            failures.append(f"FAIL {name}: want: {want_fragment!r}; got: not in the docstring")

    HEADERLESS_TSX = (
        "export function T() {\n"
        "  return (\n"
        "    <table className=\"w-full\">\n"
        "      <tbody>\n"
        "        <tr><td>Ali</td><td>82</td></tr>\n"
        "      </tbody>\n"
        "    </table>\n"
        "  )\n"
        "}\n"
    )
    ROLE_TABLE_TSX = (
        "export function T() {\n"
        "  return (\n"
        "    <div role=\"table\">\n"
        "      <div role=\"row\"><div role=\"cell\">Ali</div></div>\n"
        "    </div>\n"
        "  )\n"
        "}\n"
    )

    # ── The two spellings of the one sub-rule ─────────────────────────────────

    assert_violations("TABLE-HEADERS: tsx <table> with no <th>",
                      HEADERLESS_TSX, ".tsx", ["A11Y-7", "CMP-6"])
    assert_violations("TABLE-HEADERS: tsx role=table with no columnheader",
                      ROLE_TABLE_TSX, ".tsx", ["A11Y-7", "CMP-6"])
    assert_violations(
        "TABLE-HEADERS: html <table> with no <th>",
        "<table>\n  <tbody><tr><td>Ali</td></tr></tbody>\n</table>\n",
        ".html", ["A11Y-7", "CMP-6"],
    )
    assert_violations(
        "TABLE-HEADERS: html role=table with no columnheader",
        "<div role=\"table\">\n  <div role=\"row\"><div role=\"cell\">Ali</div></div>\n</div>\n",
        ".html", ["A11Y-7", "CMP-6"],
    )

    # A header cell anywhere in the subtree clears the element, in both spellings
    # and both grammars.
    assert_clean(
        "a <thead><th> table is never reported",
        "export function T() {\n  return (\n    <table>\n"
        "      <thead><tr><th scope=\"col\">Name</th></tr></thead>\n"
        "      <tbody><tr><td>Ali</td></tr></tbody>\n"
        "    </table>\n  )\n}\n",
        ".tsx",
    )
    assert_clean(
        "a role=columnheader grid is never reported",
        "export function T() {\n  return (\n    <div role=\"table\">\n"
        "      <div role=\"row\"><span role=\"columnheader\">Name</span></div>\n"
        "      <div role=\"row\"><div role=\"cell\">Ali</div></div>\n"
        "    </div>\n  )\n}\n",
        ".tsx",
    )
    assert_clean(
        "html: a <th> table is never reported",
        "<table>\n  <thead><tr><th>Name</th></tr></thead>\n"
        "  <tbody><tr><td>Ali</td></tr></tbody>\n</table>\n",
        ".html",
    )
    assert_clean(
        "html: a role=columnheader grid is never reported",
        "<div role=\"table\">\n  <div role=\"row\"><span role=\"columnheader\">N</span></div>\n"
        "</div>\n",
        ".html",
    )

    # ── One defect, two lines, one control id per bracket ─────────────────────

    lines = run(HEADERLESS_TSX, ".tsx")
    check_eq("a headerless table prints exactly two lines", 2, len(lines))
    check_eq(
        "both lines sit at the same file and line, A11Y-7 first",
        True,
        len(lines) == 2
        and lines[0].split(" [")[0] == lines[1].split(" [")[0]
        and "[A11Y-7]" in lines[0] and "[CMP-6]" in lines[1],
    )
    check_eq(
        "no line carries a compound bracket",
        [],
        [ln for ln in lines if re.search(r"\[[A-Z0-9-]+\s*,", ln)],
    )

    # ── Alignment and tabular figures are never guessed ───────────────────────

    assert_clean(
        "a centre-aligned numeric column with no tabular figures is not this check's",
        "export function T() {\n  return (\n    <table>\n"
        "      <thead><tr><th>Class</th><th className=\"text-center\">Mark</th></tr></thead>\n"
        "      <tbody><tr><td>4E1</td><td className=\"text-center\">82</td></tr></tbody>\n"
        "    </table>\n  )\n}\n",
        ".tsx",
    )

    # ── The rendered runner's rules are not duplicated ────────────────────────

    assert_clean(
        "a heading skip and a div list are the rendered runner's, not this check's",
        "export function T() {\n  return (\n    <section>\n"
        "      <h1>Class</h1>\n      <h3>Marks</h3>\n"
        "      <div><div>Ali</div><div>Bala</div></div>\n"
        "    </section>\n  )\n}\n",
        ".tsx",
    )

    # ── The narrowing is not widened ──────────────────────────────────────────

    assert_clean(
        "a div grid is a pattern-fit judgment, not a finding",
        "export function T() {\n  return (\n    <div className=\"grid grid-cols-3\">\n"
        "      <div><p>Present</p><p>28</p></div>\n"
        "      <div><p>Absent</p><p>2</p></div>\n"
        "    </div>\n  )\n}\n",
        ".tsx",
    )
    assert_clean(
        "role=grid and role=treegrid are out of the narrowing",
        "export function T() {\n  return (\n    <div>\n"
        "      <div role=\"grid\"><div role=\"row\"><div role=\"gridcell\">A</div></div></div>\n"
        "      <div role=\"treegrid\"><div role=\"row\"><div role=\"gridcell\">B</div></div></div>\n"
        "    </div>\n  )\n}\n",
        ".tsx",
    )
    assert_clean(
        "a computed role is never resolved and never guessed",
        "export function T({ r }) {\n  return (\n    <div role={r}>\n"
        "      <div role=\"row\"><div role=\"cell\">Ali</div></div>\n"
        "    </div>\n  )\n}\n",
        ".tsx",
    )

    # ── A dynamically composed header is a NOTE, not an ERROR ─────────────────

    composed = run(
        "export function T() {\n  return (\n    <table>\n"
        "      <thead><HeaderRow columns={columns} /></thead>\n"
        "      <tbody><tr><td>Ali</td></tr></tbody>\n"
        "    </table>\n  )\n}\n",
        ".tsx",
    )
    check_eq("a composed header emits no ERROR",
             [], [ln for ln in composed if ln.startswith("ERROR")])
    check_eq("a composed header emits one NOTE per control id",
             ["A11Y-7", "CMP-6"],
             [re.search(r"\[([A-Z0-9-]+)\]", ln).group(1)
              for ln in composed if ln.startswith("NOTE")])

    # A bare JSX expression is not a component: a mapped body's row template
    # always carries one for its cell values, and that must never be mistaken
    # for a composed header. Both spellings of the sub-rule stay ERROR.
    assert_violations(
        "a mapped table body's cell interpolation is not a composed header",
        "export function T({ students }) {\n  return (\n    <table>\n"
        "      <tbody>\n        {students.map((s) => (\n"
        "          <tr key={s.id}><td>{s.name}</td></tr>\n"
        "        ))}\n      </tbody>\n    </table>\n  )\n}\n",
        ".tsx", ["A11Y-7", "CMP-6"],
    )
    assert_violations(
        "a mapped role=table body's cell interpolation is not a composed header",
        "export function T({ students }) {\n  return (\n    <div role=\"table\">\n"
        "      <div role=\"row\"><div>Name</div></div>\n"
        "      {students.map((s) => (\n"
        "        <div role=\"row\" key={s.id}><div role=\"cell\">{s.name}</div></div>\n"
        "      ))}\n    </div>\n  )\n}\n",
        ".tsx", ["A11Y-7", "CMP-6"],
    )

    # The header region resolves in the documented order, so a composed <thead>
    # downgrades even when the body rows below it are static, and a static first
    # <tr> still blocks when no <thead> is present.
    check_eq("header_region prefers the <thead> subtree", True,
             header_region("<table><thead><Head /></thead><tbody><tr><td>a</td></tr>"
                           "</tbody></table>").startswith("<thead>"))
    check_eq("header_region falls back to the first <tr> subtree", True,
             header_region("<table><tbody><tr><td>a</td></tr></tbody></table>")
             == "<tr><td>a</td></tr>")
    check_eq("header_region falls back to the whole subtree", True,
             header_region("<div role=\"table\"><span>a</span></div>")
             == "<div role=\"table\"><span>a</span></div>")

    # ── --rules selects one half ──────────────────────────────────────────────

    check_eq("--rules A11Y-7 prints the A11Y-7 line only",
             ["A11Y-7"], control_ids(run(HEADERLESS_TSX, ".tsx", {"A11Y-7"})))
    check_eq("--rules CMP-6 prints the CMP-6 line only",
             ["CMP-6"], control_ids(run(HEADERLESS_TSX, ".tsx", {"CMP-6"})))

    args = ["--rules", "A11Y-7,CMP-6", "some/path"]
    check_eq("parse_rules_flag list form",
             ({"A11Y-7", "CMP-6"}, ["some/path"]),
             (parse_rules_flag(args), args))
    args = ["--rules=cmp-6", "p"]
    check_eq("parse_rules_flag = form normalises case",
             ({"CMP-6"}, ["p"]), (parse_rules_flag(args), args))
    check_eq("parse_rules_flag absent returns None", None, parse_rules_flag(["p"]))
    try:
        parse_rules_flag(["--rules", "TYP-1", "p"])
        check_eq("parse_rules_flag rejects an unknown id", "ValueError", "no error")
    except ValueError as exc:
        check_eq("parse_rules_flag rejects an unknown id", True,
                 "TYP-1" in str(exc) and "A11Y-7" in str(exc))

    # ── The attribution table is the only place attribution is decided ────────

    check_eq("TABLE-HEADERS maps to A11Y-7 then CMP-6",
             {"TABLE-HEADERS": ("A11Y-7", "CMP-6")}, RULE_CONTROLS)
    check_eq("VALID_RULES is exactly the ids the sub-rule table emits",
             VALID_RULES,
             {ctl for ids in RULE_CONTROLS.values() for ctl in ids})
    tiers = checklib.catalog_tiers()
    check_eq("both control ids exist in the catalogue, on the tiers that make "
             "the split load-bearing",
             {"A11Y-7": "L1", "CMP-6": "L2"},
             {ctl: tiers.get(ctl) for ids in RULE_CONTROLS.values() for ctl in ids})

    # ── Operational contracts ─────────────────────────────────────────────────

    check_eq("a missing path is a control-less ERROR",
             [f"ERROR {CHECK_NAME}: path not found: no/such/path"],
             scan_paths(["no/such/path"]))

    with tempfile.TemporaryDirectory(prefix="dx-structure-unclaimed-") as tmp:
        with open(os.path.join(tmp, "Roster.vue"), "w", encoding="utf-8") as fh:
            fh.write("<template>\n  <table><tr><td>Ali</td></tr></table>\n</template>\n")
        with open(os.path.join(tmp, "Roster.svelte"), "w", encoding="utf-8") as fh:
            fh.write("<table><tr><td>Ali</td></tr></table>\n")
        unclaimed = scan_paths([tmp])
    check_eq("an unparsed language is reported, not skipped in silence",
             [f"NOTE  {CHECK_NAME}: 2 .vue/.svelte file(s) were not parsed — "
              f"A11Y-7, CMP-6 go to manual verification for them"],
             unclaimed)

    # ── The docstring's load-bearing paragraphs ───────────────────────────────

    assert_doc("docstring keeps the alignment exclusion",
               "A source scan cannot see which figures line up in a rendered column")
    assert_doc("docstring keeps the rendered-runner boundary",
               "axe's `heading-order`, `list` and `listitem` own those at the "
               "rendered layer")
    assert_doc("docstring keeps the do-not-widen instruction",
               "Do not widen the rule to close that gap")

    # ── Fixtures ──────────────────────────────────────────────────────────────
    fixtures_dir = os.path.join(_CHECKS_DIR, "fixtures", "structure-scan")
    fixtures = [
        os.path.join(fixtures_dir, fname)
        for fname in sorted(os.listdir(fixtures_dir))
    ]
    by_file = checklib.group_candidates(checklib.astgrep_scan(fixtures, CHECK_NAME))
    for fpath in fixtures:
        case_count += 1
        fname = os.path.basename(fpath)
        errs = [ln for ln in check_file(fpath, None, by_file.get(os.path.realpath(fpath), []))
                if ln.startswith("ERROR")]
        if fname.startswith("fail") and not errs:
            failures.append(f"FAIL fixture {fname}: want: >=1 ERROR; got: none")
        elif fname.startswith("pass") and errs:
            failures.append(f"FAIL fixture {fname}: want: 0 ERRORs; got: {errs!r}")

    # The NOTE fixture is a pass by ERROR count, so assert what makes it a
    # regression case: it downgrades rather than staying silent.
    notes = [ln for ln in check_file(os.path.join(fixtures_dir,
                                                  "pass-dynamic-header-note.tsx"))
             if ln.startswith("NOTE")]
    check_eq("the composed-header fixture downgrades to two NOTEs", 2, len(notes))

    # ── The provisioning contract ─────────────────────────────────────────────

    checklib.astgrep_provisioning_cases(
        "structure-scan.py",
        os.path.join("fixtures", "structure-scan", "fail-table-no-header.tsx"),
        check_eq,
    )

    checklib.report_self_test(failures, case_count)


# ── Entry point ───────────────────────────────────────────────────────────────

VALID_RULES = {"A11Y-7", "CMP-6"}

USAGE = ("Usage: python3 checks/structure-scan.py [--rules A11Y-7,CMP-6] "
         "<path>... | --self-test")


def parse_rules_flag(args):
    """Additive `--rules A11Y-7,CMP-6` (or `--rules=A11Y-7`) against this
    check's own `VALID_RULES`. See `checklib.parse_rules_flag` for the shared
    implementation every `*-scan.py` --rules flag parses through."""
    return checklib.parse_rules_flag(args, VALID_RULES)


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
    except ValueError as exc:
        print(f"ERROR {CHECK_NAME}: {exc}")
        sys.exit(1)
    if not args:
        print(USAGE)
        sys.exit(1)
    try:
        results = scan_paths(args, rules)
    except checklib.AstGrepError as exc:
        # One ERROR line, exit 1, no findings printed. Never a clean result:
        # ast-grep can lose a whole file's matches at exit 0, so a check that
        # could not run must say so and send its controls to manual verification.
        exc.report()
        sys.exit(1)
    errors = [r for r in results if r.startswith("ERROR")]
    for r in results:
        print(r)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
