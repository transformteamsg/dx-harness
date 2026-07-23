#!/usr/bin/env python3
"""
Reaudit scope — checks/reaudit-scope.py
A read-only query tool, not a gate. Given a changed/new control id (or a
whole `--category`), it lists the decision records that should be re-audited
now that the control changed — turning the re-audit set from a memory
exercise into a command.

The ratchet adds and tightens controls over time. When a control lands or is
tightened, already-shipped surfaces are silently out of date "until
re-audited", and the re-audit set has to be reconstructed from memory. This
tool computes that set from two sources, both read-only:

  - `standards/catalog.yaml` `meta.categories` — maps each id prefix to a
    category name; a control's category = meta.categories[id.split("-")[0]].
  - `docs/decisions/*.md` `## Controls in scope` sections — the harness's
    ledger of which controls each shipped surface pulled in.

For a target control id (or `--category <name>`) it reports:

  direct
      records whose "Controls in scope" set contains the target id. For a
      *changed* control these explicitly used it and must be re-checked
      against the new clause.

  same-category (candidates)
      records whose in-scope set contains ANY control sharing the target's
      category — but not already in `direct`. For a *new* control these
      surfaces are in the affected domain. They are CANDIDATES to confirm,
      not proven-affected: confirm each actually uses the affected pattern.

What this does NOT do
─────────────────────
It reasons over RECORDED surfaces (decision records), which is the harness's
ledger of what shipped — it does NOT scan the product repo's live code. When
the records are complete, the re-audit set is complete; when records are
missing, so is the set. Keep records current.

Usage
─────
  python3 checks/reaudit-scope.py <CTL-ID>          # e.g. COL-2
  python3 checks/reaudit-scope.py --category <name> # e.g. --category COL
  python3 checks/reaudit-scope.py --repo-root <path> <CTL-ID>
  python3 checks/reaudit-scope.py --self-test

Exit codes
──────────
  exit 0  whenever the query runs — INCLUDING an empty result set. "No
          records matched" is a valid answer, not an error.
  exit 1  ONLY on a usage error: an unknown control id, an unknown
          `--category`, a missing records directory, or no/ambiguous target.
"""

import importlib.util
import os
import re
import sys

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))
CATALOG_PATH = os.path.join(REPO_ROOT, "standards", "catalog.yaml")
DECISIONS_DIR = os.path.join(REPO_ROOT, "docs", "decisions")

# Control-id token (matches audit-record's XREF-style id regex).
CONTROL_ID_RE = re.compile(r"\b([A-Z0-9]+-\d+)\b")


# ── Reuse audit-record's section parser (do not rewrite it) ───────────────────
def _load_audit_record():
    """Import split_sections / find_section from the sibling audit-record.py
    by path (its filename has a hyphen, and its main() is guarded by
    `if __name__ == '__main__'`, so importing it does not run anything)."""
    path = os.path.join(CHECKS_DIR, "audit-record.py")
    spec = importlib.util.spec_from_file_location("_tfx_audit_record", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_AR = _load_audit_record()


def _load_checklib():
    path = os.path.join(CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_tfx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()
split_sections = _AR.split_sections
find_section = _AR.find_section


# ── Catalog: id → category, via meta.categories[prefix] ───────────────────────
def catalog_categories(catalog_path=CATALOG_PATH):
    """Parse standards/catalog.yaml → (id_to_category, prefix_to_category).

    A control's category is meta.categories[id.split("-")[0]]. If a control's
    prefix is missing from meta.categories, that is a hard defect (validate.py
    step 5b enforces it) — raise rather than guess a category."""
    import yaml

    with open(catalog_path, encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    prefix_to_category = dict(data.get("meta", {}).get("categories", {}))
    id_to_category = {}
    for control in data.get("controls", []):
        cid = control.get("id")
        if not cid:
            continue
        prefix = cid.split("-")[0]
        if prefix not in prefix_to_category:
            raise KeyError(
                f"catalog control {cid} has prefix {prefix!r} with no "
                f"meta.categories entry — fix the catalog (validate.py step 5b)"
            )
        id_to_category[cid] = prefix_to_category[prefix]
    return id_to_category, prefix_to_category


# ── Records: record path → set of in-scope control ids ────────────────────────
def record_controls(records_dir):
    """For each docs/decisions/*.md (skip TEMPLATE.md), extract the set of
    catalog control ids named in its `## Controls in scope` section.

    Returns {record_path: set(ids)}. A record with no such section maps to an
    empty set. Raises FileNotFoundError if records_dir is missing — that is a
    usage error, surfaced as exit 1 by the caller."""
    if not os.path.isdir(records_dir):
        raise FileNotFoundError(records_dir)
    out = {}
    for fname in sorted(os.listdir(records_dir)):
        if not fname.endswith(".md") or fname == "TEMPLATE.md":
            continue
        path = os.path.join(records_dir, fname)
        try:
            with open(path, encoding="utf-8") as fh:
                text = fh.read()
        except OSError:
            continue
        body = find_section(split_sections(text), "Controls in scope")
        ids = set(CONTROL_ID_RE.findall(body or ""))
        out[path] = ids
    return out


# ── Compute the re-audit set ──────────────────────────────────────────────────
def affected_records(target_ids, target_category, records):
    """Compute the re-audit set.

    target_ids: the set of control ids that count as a "direct" hit (a single
        {COL-2} for a control query; every control of category X for
        `--category X`).
    target_category: the category whose membership defines a same-category
        candidate.
    records: {record_path: set(ids)} from record_controls.

    Returns {"direct": [paths], "same_category": [paths]}, each sorted, with
    same_category excluding any record already in direct."""
    id_to_category, _prefix = catalog_categories()
    direct = []
    same_category = []
    for path in sorted(records):
        ids = records[path]
        if ids & target_ids:
            direct.append(path)
            continue
        # A same-category candidate: lists any control whose category matches.
        if any(id_to_category.get(cid) == target_category for cid in ids):
            same_category.append(path)
    return {"direct": direct, "same_category": same_category}


def resolve_target(arg, category_mode):
    """Resolve the CLI target to (target_ids, category, label).

    arg: the control id (e.g. "COL-2") or the category name (e.g. "COL") when
        category_mode is True.
    Raises ValueError on a usage error (unknown id / unknown category), which
    main() surfaces as exit 1 — never a silent empty result."""
    id_to_category, prefix_to_category = catalog_categories()

    if category_mode:
        # Accept either a prefix ("COL") or the human category name ("Colour").
        category = None
        if arg in prefix_to_category:
            category = prefix_to_category[arg]
        else:
            for name in prefix_to_category.values():
                if name.lower() == arg.lower():
                    category = name
                    break
        if category is None:
            raise ValueError(
                f"unknown category {arg!r} — known categories: "
                + ", ".join(sorted(set(prefix_to_category.keys())))
            )
        target_ids = {
            cid for cid, cat in id_to_category.items() if cat == category
        }
        return target_ids, category, f"category {arg}"

    # Control-id mode.
    if arg not in id_to_category:
        raise ValueError(
            f"unknown control id {arg!r} — not in standards/catalog.yaml"
        )
    return {arg}, id_to_category[arg], arg


# ── Render ────────────────────────────────────────────────────────────────────
def render_report(label, category, result, rel=None):
    """Render the human report as a single string. Always names same-category
    records as *candidates* to confirm (honest framing — not a hard
    'these are non-compliant' claim)."""
    if rel is None:
        rel = lambda p: p

    direct = result["direct"]
    same = result["same_category"]
    total = len(direct) + len(same)

    lines = []
    lines.append(f"Re-audit scope for {label} (category: {category})")
    lines.append("")

    lines.append(f"Directly in scope ({len(direct)}) — these records list "
                 f"{label}; re-check each against the changed clause:")
    if direct:
        for p in direct:
            lines.append(f"  - {rel(p)}")
    else:
        lines.append("  (none)")
    lines.append("")

    lines.append(f"Same-category candidates ({len(same)}) — these records "
                 f"touch the {category} domain but do NOT list {label}; they "
                 f"are candidates to confirm, not proven-affected. Confirm "
                 f"each actually uses the affected pattern:")
    if same:
        for p in same:
            lines.append(f"  - {rel(p)}")
    else:
        lines.append("  (none)")
    lines.append("")

    lines.append(f"{total} record(s) to re-audit "
                 f"({len(direct)} direct, {len(same)} candidate).")
    return "\n".join(lines)


# ── Self-test ──────────────────────────────────────────────────────────────────
def run_self_test():
    """Embedded self-test. Prints SELF-TEST OK (N cases) and exits 0 on
    success; prints failures and exits 1. Builds temp records (synthetic
    `## Controls in scope` sections) in a temp dir; reads the REAL
    standards/catalog.yaml for the category map (read-only)."""
    import tempfile

    failures = []
    case_count = 0

    id_to_category, prefix_to_category = catalog_categories()

    # Sanity: the real categories we lean on in the cases must exist. (If the
    # catalog ever drops these, the self-test should fail loudly, not pass.)
    for prefix in ("COL", "A11Y", "TOK"):
        if prefix not in prefix_to_category:
            failures.append(
                f"FAIL setup: expected catalog prefix {prefix!r} in "
                f"meta.categories — got {sorted(prefix_to_category)}"
            )

    def make_records(spec):
        """spec: {filename: in_scope_text}. Returns a temp dir with one
        docs/decisions-style .md per entry, plus a TEMPLATE.md that must be
        excluded. Caller deletes the dir."""
        d = tempfile.mkdtemp()
        for fname, scope in spec.items():
            with open(os.path.join(d, fname), "w", encoding="utf-8") as fh:
                fh.write(
                    "# Design decision record — self-test\n\n"
                    "## Controls in scope\n\n"
                    f"{scope}\n\n"
                    "## Ratchet\n\nratchet: no proposal\n"
                )
        # A TEMPLATE.md listing COL-2 — must be excluded from every result.
        with open(os.path.join(d, "TEMPLATE.md"), "w", encoding="utf-8") as fh:
            fh.write(
                "# TEMPLATE\n\n## Controls in scope\n\nCOL-2\n"
            )
        return d

    def cleanup(d):
        for fname in os.listdir(d):
            os.unlink(os.path.join(d, fname))
        os.rmdir(d)

    # ── Case 1: target id directly listed in one record → that record in
    # `direct`. A record listing a DIFFERENT control of the same category
    # (COL-1) → in `same_category`, not `direct`. A record listing only an
    # unrelated category (A11Y-1) → in neither.
    case_count += 1
    d = make_records({
        "direct.md": "COL-2, A11Y-1",      # direct (lists COL-2)
        "same.md": "COL-1, TOK-1",         # same-category (COL-1), not direct
        "unrelated.md": "A11Y-1, A11Y-2",  # neither
    })
    try:
        recs = record_controls(d)
        target_ids, category, label = resolve_target("COL-2", False)
        result = affected_records(target_ids, category, recs)
        direct_names = {os.path.basename(p) for p in result["direct"]}
        same_names = {os.path.basename(p) for p in result["same_category"]}
    finally:
        cleanup(d)
    if direct_names != {"direct.md"}:
        failures.append(
            f"FAIL direct: expected {{direct.md}} — got {direct_names}"
        )
    if same_names != {"same.md"}:
        failures.append(
            f"FAIL same-category: expected {{same.md}} — got {same_names}"
        )
    if "unrelated.md" in direct_names or "unrelated.md" in same_names:
        failures.append(
            "FAIL neither: unrelated.md should be in neither set"
        )
    if "TEMPLATE.md" in direct_names | same_names:
        failures.append("FAIL TEMPLATE excluded: TEMPLATE.md leaked into a set")

    # ── Case 2: TEMPLATE.md excluded even though it lists COL-2. (record_controls
    # must never key TEMPLATE.md at all.)
    case_count += 1
    d = make_records({"r.md": "COL-2"})
    try:
        recs = record_controls(d)
        keyed = {os.path.basename(p) for p in recs}
    finally:
        cleanup(d)
    if "TEMPLATE.md" in keyed:
        failures.append(
            f"FAIL TEMPLATE excluded from record_controls — keyed {keyed}"
        )

    # ── Case 3: --category mode returns ALL records touching that category
    # (both direct-id and other-id-same-category collapse into the result).
    case_count += 1
    d = make_records({
        "uses_col2.md": "COL-2",
        "uses_col1.md": "COL-1",
        "no_col.md": "A11Y-1, TOK-1",
    })
    try:
        recs = record_controls(d)
        target_ids, category, label = resolve_target("COL", True)
        result = affected_records(target_ids, category, recs)
        names = {
            os.path.basename(p)
            for p in result["direct"] + result["same_category"]
        }
    finally:
        cleanup(d)
    if names != {"uses_col2.md", "uses_col1.md"}:
        failures.append(
            f"FAIL --category COL: expected both COL records — got {names}"
        )

    # ── Case 4: unknown control id → usage error (ValueError), NOT a silent
    # empty result.
    case_count += 1
    try:
        resolve_target("ZZZ-9", False)
        failures.append("FAIL unknown id: expected ValueError for ZZZ-9")
    except ValueError as exc:
        if "ZZZ-9" not in str(exc):
            failures.append(
                f"FAIL unknown id: message should name ZZZ-9 — got {exc!r}"
            )

    # ── Case 4b: unknown category → usage error too.
    case_count += 1
    try:
        resolve_target("ZZZ", True)
        failures.append("FAIL unknown category: expected ValueError for ZZZ")
    except ValueError as exc:
        if "ZZZ" not in str(exc):
            failures.append(
                f"FAIL unknown category: message should name ZZZ — got {exc!r}"
            )

    # ── Case 5: a target whose same_category set is non-empty → the RENDERED
    # output contains the word "candidate" (assert on the output string, not
    # the data structure) so the honest framing can't silently regress.
    case_count += 1
    d = make_records({
        "direct.md": "COL-2",
        "same.md": "COL-1",
    })
    try:
        recs = record_controls(d)
        target_ids, category, label = resolve_target("COL-2", False)
        result = affected_records(target_ids, category, recs)
        report = render_report(label, category, result,
                               rel=os.path.basename)
    finally:
        cleanup(d)
    if not result["same_category"]:
        failures.append(
            "FAIL candidate framing: setup expected a non-empty same_category set"
        )
    if "candidate" not in report.lower():
        failures.append(
            "FAIL candidate framing: rendered output must contain the word "
            f"'candidate' — got:\n{report}"
        )

    # ── Case 6: a valid target with NO matching records → empty result, and
    # this is exit 0 (not an error). We assert the data is empty and that
    # resolve_target did NOT raise (a valid id is not a usage error).
    case_count += 1
    d = make_records({"unrelated.md": "A11Y-1, TOK-1"})
    try:
        recs = record_controls(d)
        target_ids, category, label = resolve_target("COL-2", False)
        result = affected_records(target_ids, category, recs)
    finally:
        cleanup(d)
    if result["direct"] or result["same_category"]:
        failures.append(
            f"FAIL empty result: expected no matches — got {result}"
        )

    # ── Case 7: a missing records dir → FileNotFoundError (usage error → exit 1).
    case_count += 1
    missing = os.path.join(tempfile.gettempdir(), "tfx-reaudit-no-such-dir-xyz")
    try:
        record_controls(missing)
        failures.append(
            "FAIL missing records dir: expected FileNotFoundError"
        )
    except FileNotFoundError:
        pass

    checklib.report_self_test(failures, case_count)


# ── Entry point ────────────────────────────────────────────────────────────────
def main():
    args = sys.argv[1:]

    if "--self-test" in args:
        run_self_test()
        return  # run_self_test calls sys.exit

    # Parse flags: --repo-root <path>, --category <name>, and one positional
    # target (a control id when not in category mode).
    repo_root = REPO_ROOT
    category_mode = False
    target = None
    i = 0
    while i < len(args):
        if args[i] == "--repo-root" and i + 1 < len(args):
            repo_root = os.path.abspath(args[i + 1])
            i += 2
        elif args[i] == "--category" and i + 1 < len(args):
            category_mode = True
            target = args[i + 1]
            i += 2
        elif target is None and not args[i].startswith("--"):
            target = args[i]
            i += 1
        else:
            print(f"ERROR reaudit-scope: unexpected argument {args[i]!r}")
            sys.exit(1)

    if target is None:
        print(
            "ERROR reaudit-scope: give a control id (e.g. COL-2) or "
            "--category <name> (e.g. --category COL)"
        )
        sys.exit(1)

    records_dir = os.path.join(repo_root, "docs", "decisions")

    # Resolve the target (unknown id / unknown category → usage error, exit 1).
    try:
        target_ids, category, label = resolve_target(target, category_mode)
    except ValueError as exc:
        print(f"ERROR reaudit-scope: {exc}")
        sys.exit(1)

    # Read the records (missing dir → usage error, exit 1).
    try:
        records = record_controls(records_dir)
    except FileNotFoundError:
        print(
            f"ERROR reaudit-scope: records directory not found: {records_dir}"
        )
        sys.exit(1)

    result = affected_records(target_ids, category, records)

    def rel(p):
        try:
            return os.path.relpath(p, repo_root)
        except ValueError:
            return p

    print(render_report(label, category, result, rel=rel))
    # A query that ran is exit 0 — including an empty result set.
    sys.exit(0)


if __name__ == "__main__":
    main()
