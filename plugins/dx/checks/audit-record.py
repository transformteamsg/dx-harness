#!/usr/bin/env python3
"""
Decision-record audit — checks/audit-record.py
Checks docs/decisions/*.md records for process compliance with the
design-ui loop and the TEMPLATE.md structure:
  1. Required sections present (substring-tolerant heading match).
  2. Header has a **Run type:** line OR an explicit operator-proxy note.
  3. Sprint contract has >= 3 numbered done-criteria.
  4. Verify verdict section carries a verbatim evaluator verdict
     (a line starting `VERDICT:` AND a `QUALITY GRADES` line).
  5. Waiver rows (if any) have a non-empty Approver cell; L0 never waived.
  6. Plan approval names an approver or records the operator proxy.
  7. Every referenced path under docs/ exists on disk.
  8. Ratchet section is non-empty ("no proposal" text counts as content).
  9. CMP-1 (if in scope) carries exactly one fixed-form CMP-1 verdict line.
 10. Verify verdict carries a verification ledger (| Control | Method |
     Evidence | table); each method is script / manual / unverified, and a
     manual or unverified row states its evidence/reason.

Usage:
  python3 checks/audit-record.py [record.md ...]   # default: all
                                                   # docs/decisions/*.md
                                                   # except TEMPLATE.md
  python3 checks/audit-record.py --self-test

Exit 0 and print "OK: <n> records audited" on success.
Exit 1 and print "ERROR <file>: <message>" lines on failure.
"""

import importlib.util
import os
import re
import sys

_CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_checklib():
    path = os.path.join(_CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_tfx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DECISIONS_DIR = os.path.join(REPO_ROOT, "docs", "decisions")

REQUIRED_SECTIONS = [
    "Sprint contract",
    "Tradeoffs",
    "Controls in scope",
    "Waivers granted",
    "Plan approval",
    "Verify verdict",
    "Ratchet",
]

H2_RE = re.compile(r"^##\s+(.*)$")
NUMBERED_ITEM_RE = re.compile(r"^\s*\d+\.\s+\S")
VERDICT_LINE_RE = re.compile(r"^\s*VERDICT:", re.MULTILINE)
RUN_TYPE_RE = re.compile(r"\*\*Run type:\*\*")
DOCS_PATH_RE = re.compile(r"docs/[A-Za-z0-9_./-]+")
TABLE_SEPARATOR_CELL_RE = re.compile(r"^:?-{2,}:?$")


def split_sections(text):
    """Return list of (heading_text, body_text) for each `## ` section.

    Only h2 headings delimit sections — `###` subsections stay inside
    their parent section's body.
    """
    sections = []
    current_heading = None
    current_lines = []
    for line in text.splitlines():
        m = H2_RE.match(line)
        if m:
            if current_heading is not None:
                sections.append((current_heading, "\n".join(current_lines)))
            current_heading = m.group(1).strip()
            current_lines = []
        else:
            if current_heading is not None:
                current_lines.append(line)
    if current_heading is not None:
        sections.append((current_heading, "\n".join(current_lines)))
    return sections


def find_section(sections, title):
    """Return the body of the first section whose heading contains `title`
    (case-insensitive substring — records may extend headings), or None."""
    for heading, body in sections:
        if title.lower() in heading.lower():
            return body
    return None


def parse_table_rows(body):
    """Return list of cell-lists for the data rows of the first markdown
    table in `body`. Skips the header row and `|---|` separator rows."""
    rows = []
    seen_header = False
    header = None
    for line in body.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue
        cells = [c.strip() for c in stripped.strip("|").split("|")]
        if all(TABLE_SEPARATOR_CELL_RE.match(c) for c in cells if c):
            continue
        if not seen_header:
            seen_header = True
            header = cells
            continue
        rows.append(cells)
    return header, rows


def column_index(header, name, default):
    """Find the index of the column whose header contains `name`."""
    if header:
        for i, cell in enumerate(header):
            if name.lower() in cell.lower():
                return i
    return default


def find_ledger_table(body):
    """Return (header, rows) for the verification-ledger table in `body` —
    the first markdown table whose header has both a 'Method' and an
    'Evidence' column. A section may carry other tables (e.g. a prose
    'Deterministic controls' table), so this can't use parse_table_rows
    (which returns the first table); it scans every table and matches by
    header. Returns (None, []) if no ledger table is present."""
    current = []
    for line in body.splitlines() + [""]:
        stripped = line.strip()
        if stripped.startswith("|"):
            current.append(line)
            continue
        if current:
            header, rows = parse_table_rows("\n".join(current))
            if (
                header is not None
                and any("method" in c.lower() for c in header)
                and any("evidence" in c.lower() for c in header)
            ):
                return header, rows
            current = []
    return None, []


def audit_record(text, name, repo_root):
    """Audit one record's text. Returns a list of message strings
    (empty list = the record passes)."""
    messages = []
    sections = split_sections(text)

    # ── 1. Required sections present ──────────────────────────────────────
    for title in REQUIRED_SECTIONS:
        if find_section(sections, title) is None:
            messages.append(f"missing required section '## {title}'")

    # ── 2. Run type header OR explicit operator-proxy note ────────────────
    if not RUN_TYPE_RE.search(text) and "operator proxy" not in text.lower():
        messages.append(
            "no '**Run type:**' header line and no 'operator proxy' note — "
            "record one or the other"
        )

    # ── 3. Sprint contract has >= 3 numbered done-criteria ────────────────
    contract = find_section(sections, "Sprint contract")
    if contract is not None:
        criteria = [
            ln for ln in contract.splitlines() if NUMBERED_ITEM_RE.match(ln)
        ]
        if len(criteria) < 3:
            messages.append(
                f"Sprint contract has {len(criteria)} numbered done-criteria "
                f"— need >= 3"
            )

    # ── 4. Verbatim-verdict heuristic ──────────────────────────────────────
    verdict = find_section(sections, "Verify verdict")
    if verdict is not None:
        if not VERDICT_LINE_RE.search(verdict):
            messages.append(
                "Verify verdict section has no line starting 'VERDICT:' — "
                "paste the evaluator verdict verbatim (a summary is a defect)"
            )
        if "QUALITY GRADES" not in verdict:
            messages.append(
                "Verify verdict section has no 'QUALITY GRADES' block — "
                "paste the evaluator verdict verbatim (a summary is a defect)"
            )

    # ── 5. Waiver rows: non-empty Approver, L0 never waived ───────────────
    waivers = find_section(sections, "Waivers granted")
    if waivers is not None:
        header, rows = parse_table_rows(waivers)
        tier_idx = column_index(header, "tier", 1)
        approver_idx = column_index(header, "approver", 3)
        for row in rows:
            control = row[0] if len(row) > 0 else ""
            tier = row[tier_idx] if len(row) > tier_idx else ""
            approver = row[approver_idx] if len(row) > approver_idx else ""
            if not control and not tier:
                continue  # empty placeholder row = no waiver granted
            if tier.upper() == "L0":
                messages.append(
                    f"waiver row '{control}' waives an L0 control — "
                    f"L0 is never waivable"
                )
            if not approver:
                messages.append(
                    f"waiver row '{control}' has an empty Approver cell — "
                    f"L1 waivers need a named approver"
                )

    # ── 6. Plan approval has an approver or the operator proxy ────────────
    approval = find_section(sections, "Plan approval")
    if approval is not None:
        approved = False
        if "operator proxy" in approval.lower():
            approved = True
        else:
            for ln in approval.splitlines():
                if "Approved by" in ln:
                    remainder = ln.split("Approved by", 1)[1]
                    remainder = remainder.lstrip(":* \t")
                    if remainder.strip():
                        approved = True
                        break
        if not approved:
            messages.append(
                "Plan approval section names no approver — record 'Approved "
                "by' with content or the literal 'operator proxy'"
            )

    # ── 7. Referenced docs/ paths exist on disk ───────────────────────────
    refs = sorted(set(DOCS_PATH_RE.findall(text)))
    for ref in refs:
        ref_clean = ref.rstrip(".,;:")
        if not os.path.exists(os.path.join(repo_root, ref_clean)):
            messages.append(f"referenced path does not exist: {ref_clean}")

    # ── 8. Ratchet section non-empty ───────────────────────────────────────
    ratchet = find_section(sections, "Ratchet")
    if ratchet is not None and not ratchet.strip():
        messages.append(
            "Ratchet section is empty — record proposals or the explicit "
            "'no proposal — nothing uncovered' text"
        )

    # ── 9. CMP-1 verdict vocabulary (if CMP-1 in scope) ───────────────────
    controls_section = find_section(sections, "Controls in scope")
    if controls_section is not None and "CMP-1" in controls_section:
        verdict_section = find_section(sections, "Verify verdict")
        if verdict_section is not None:
            cmp1_forms = [
                "CMP-1: verified against .tfx/component-manifest.json",
                "CMP-1: asserted, no manifest",
                "CMP-1: waived — tfx-waive CMP-1",
            ]
            found_forms = [f for f in cmp1_forms if f in verdict_section]
            if len(found_forms) == 0:
                messages.append(
                    "record claims CMP-1 but carries no CMP-1 verdict line — "
                    "use one of the three fixed forms: "
                    "'CMP-1: verified against .tfx/component-manifest.json (…)', "
                    "'CMP-1: asserted, no manifest — manifest absent for <product>', "
                    "or 'CMP-1: waived — tfx-waive CMP-1 reason=\"...\"'"
                )
            elif len(found_forms) > 1:
                messages.append(
                    "record carries multiple CMP-1 verdict forms — exactly one allowed"
                )

    # ── 10. Verification ledger (Method/Evidence table in Verify verdict) ──
    # Required: the Verify verdict section must carry a verification-ledger
    # table (header has both a Method and an Evidence column). Each row's
    # method must be from a fixed vocabulary, and a `manual`/`unverified`
    # row must state its evidence/reason. Modeled on assertion 9's
    # fixed-form precedent; reuses parse_table_rows / column_index.
    verdict_section = find_section(sections, "Verify verdict")
    if verdict_section is not None:
        header, rows = find_ledger_table(verdict_section)
        if header is None:
            messages.append(
                "Verify verdict section has no verification ledger — add a "
                "| Control | Method | Evidence | table (one row per in-scope "
                "control; method is script / manual / unverified)"
            )
        else:
            method_idx = column_index(header, "method", 1)
            evidence_idx = column_index(header, "evidence", 2)
            valid_methods = {"script", "manual", "unverified"}
            for row in rows:
                control = row[0] if len(row) > 0 else ""
                method = row[method_idx] if len(row) > method_idx else ""
                evidence = row[evidence_idx] if len(row) > evidence_idx else ""
                if not control and not method:
                    continue  # empty placeholder row
                m = method.strip().lower()
                if m not in valid_methods:
                    messages.append(
                        f"ledger row '{control}' has invalid method "
                        f"'{method.strip()}' — use script / manual / unverified"
                    )
                    continue
                if m == "manual" and not evidence.strip():
                    messages.append(
                        f"ledger row '{control}' is 'manual' with no evidence "
                        f"— name what was checked and how"
                    )
                if m == "unverified" and not evidence.strip():
                    messages.append(
                        f"ledger row '{control}' is 'unverified' with no reason"
                    )

    return messages


def audit_file(path, repo_root=None):
    """Audit one record file. Returns list of ERROR lines.

    repo_root: the repository root to use for relative-path computation and
    for resolving referenced docs/ paths.  Defaults to the module-level REPO_ROOT
    (i.e. the harness repo itself) so existing callers are unaffected.
    """
    if repo_root is None:
        repo_root = REPO_ROOT
    abs_path = os.path.abspath(path)
    if not os.path.isfile(abs_path):
        candidate = os.path.join(repo_root, path)
        if os.path.isfile(candidate):
            abs_path = candidate
    try:
        rel = os.path.relpath(abs_path, repo_root)
        if rel.startswith(".."):
            rel = path
    except ValueError:
        rel = path

    try:
        with open(abs_path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError as exc:
        return [f"ERROR {rel}: cannot read file — {exc}"]

    return [f"ERROR {rel}: {m}" for m in audit_record(text, rel, repo_root)]


def default_records(decisions_dir=None):
    """All docs/decisions/*.md except TEMPLATE.md.

    decisions_dir: override the decisions directory (default: harness DECISIONS_DIR).
    """
    if decisions_dir is None:
        decisions_dir = DECISIONS_DIR
    if not os.path.isdir(decisions_dir):
        return []
    return sorted(
        os.path.join(decisions_dir, f)
        for f in os.listdir(decisions_dir)
        if f.endswith(".md") and f != "TEMPLATE.md"
    )


# ── Self-test ──────────────────────────────────────────────────────────────

PASSING_RECORD = """\
# Design decision record — Test page

- **Date:** 2026-06-11
- **Product:** TW
- **Change type:** new page
- **Run type:** attended
- **The teacher and the moment:** Ms. Tan, marking a roster before assembly.

## Sprint contract (done-criteria)

1. The happy path completes in two interactions.
2. Error states keep the teacher's work.
3. All copy is second person and active.

## Chosen approach

Option A — a single centred column.

## Tradeoffs, named

Sacrifices contextual framing for daily-use simplicity.

## Controls in scope

A11Y-1, A11Y-2, TOK-1, CMP-3.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| CMP-1 | L1 | No component manifest in harness v0 | Reza Ilmi (user) | this record |

## Plan approval

- **Approved by:** Reza Ilmi (user)
- **Approved on:** 2026-06-11

## Verify verdict

Screenshots: docs/decisions/TEMPLATE.md

VERDICT: pass

BLOCKING (must fix before ship):
- None.

QUALITY GRADES:
- Design quality — strong.
- Craft — strong.

| Control | Method | Evidence |
|---------|--------|----------|
| TOK-1 | script | `checks/token-audit.py` clean (exit 0) |
| A11Y-1 | manual | measured fg/bg with the picker — 5.1:1 at the smallest text |
| A11Y-4 | unverified | needs computed layout — flag for a human |

## Ratchet

ratchet: no proposal — nothing uncovered
"""


def run_self_test():
    """Embedded self-test cases. Prints SELF-TEST OK (N cases) and exits 0
    on success; prints failures and exits 1. Never touches the real records
    — audits in-memory strings only (assertion-7 cases reference repo paths
    read-only via os.path.exists)."""
    failures = []
    case_count = 0

    def assert_passes(case_name, text):
        nonlocal case_count
        case_count += 1
        msgs = audit_record(text, case_name, REPO_ROOT)
        if msgs:
            failures.append(f"FAIL {case_name}: expected pass — got: {msgs}")

    def assert_fails(case_name, text, expected_substring):
        nonlocal case_count
        case_count += 1
        msgs = audit_record(text, case_name, REPO_ROOT)
        if not any(expected_substring in m for m in msgs):
            failures.append(
                f"FAIL {case_name}: expected a message containing "
                f"{expected_substring!r} — got: {msgs}"
            )

    # Case 1: minimal record passes (with extended headings —
    # "Sprint contract (done-criteria)", "Tradeoffs, named")
    assert_passes("minimal passing record", PASSING_RECORD)

    # Case 2 (assertion 1): missing required section
    assert_fails(
        "missing Ratchet section",
        PASSING_RECORD.replace(
            "## Ratchet\n\nratchet: no proposal — nothing uncovered\n", ""
        ),
        "missing required section '## Ratchet'",
    )

    # Case 3 (assertion 2): no Run type line and no operator-proxy note
    assert_fails(
        "no run type, no proxy note",
        PASSING_RECORD.replace("- **Run type:** attended\n", ""),
        "Run type",
    )

    # Case 4 (assertion 2 alternative): no Run type line but explicit
    # operator-proxy note — older records predate the field; accept
    assert_passes(
        "operator proxy accepted in lieu of run type",
        PASSING_RECORD.replace("- **Run type:** attended\n", "").replace(
            "- **Approved by:** Reza Ilmi (user)",
            "- **Approved by:** operator proxy — unattended run",
        ),
    )

    # Case 5 (assertion 3): fewer than 3 numbered done-criteria
    assert_fails(
        "two done-criteria only",
        PASSING_RECORD.replace(
            "3. All copy is second person and active.\n", ""
        ),
        "need >= 3",
    )

    # Case 6 (assertion 4): VERDICT: line missing
    assert_fails(
        "no VERDICT line",
        PASSING_RECORD.replace(
            "VERDICT: pass", "The evaluator said the page passed."
        ),
        "VERDICT:",
    )

    # Case 7 (assertion 4): QUALITY GRADES block missing
    assert_fails(
        "no QUALITY GRADES block",
        PASSING_RECORD.replace("QUALITY GRADES:", "GRADES:"),
        "QUALITY GRADES",
    )

    # Case 8 (assertion 5): waiver row with empty Approver cell
    assert_fails(
        "waiver row empty approver",
        PASSING_RECORD.replace(
            "| CMP-1 | L1 | No component manifest in harness v0 "
            "| Reza Ilmi (user) | this record |",
            "| CMP-1 | L1 | No component manifest in harness v0 "
            "|  | this record |",
        ),
        "empty Approver cell",
    )

    # Case 9 (assertion 5): L0 appears as a waived tier
    assert_fails(
        "L0 waiver",
        PASSING_RECORD.replace(
            "| CMP-1 | L1 |", "| A11Y-1 | L0 |"
        ),
        "L0 is never waivable",
    )

    # Case 10 (assertion 5): TEMPLATE-style empty placeholder row = no
    # waivers granted, not a violation
    assert_passes(
        "empty placeholder waiver row",
        PASSING_RECORD.replace(
            "| CMP-1 | L1 | No component manifest in harness v0 "
            "| Reza Ilmi (user) | this record |",
            "| | | | | inline `tfx-waive` / this record |",
        ),
    )

    # Case 11 (assertion 6): Plan approval names nobody
    assert_fails(
        "empty plan approval",
        PASSING_RECORD.replace(
            "- **Approved by:** Reza Ilmi (user)", "- **Approved by:**"
        ),
        "names no approver",
    )

    # Case 12 (assertion 7): referenced docs/ path missing on disk
    assert_fails(
        "missing screenshot path",
        PASSING_RECORD.replace(
            "Screenshots: docs/decisions/TEMPLATE.md",
            "Screenshots: docs/loop-run/screenshots/missing-frame.png",
        ),
        "referenced path does not exist: "
        "docs/loop-run/screenshots/missing-frame.png",
    )

    # Case 13 (assertion 7): a docs/ directory reference counts as existing
    assert_passes(
        "directory reference exists",
        PASSING_RECORD.replace(
            "Screenshots: docs/decisions/TEMPLATE.md",
            "Screenshots: docs/decisions/",
        ),
    )

    # Case 14 (assertion 8): Ratchet heading present but section empty
    assert_fails(
        "empty Ratchet section",
        PASSING_RECORD.replace(
            "ratchet: no proposal — nothing uncovered\n", ""
        ),
        "Ratchet section is empty",
    )

    # Case 15 (assertion 9): CMP-1 in scope, has valid verdict form — passes
    assert_passes(
        "CMP-1 in scope with valid verdict form",
        PASSING_RECORD.replace(
            "A11Y-1, A11Y-2, TOK-1, CMP-3.",
            "A11Y-1, A11Y-2, TOK-1, CMP-3, CMP-1.",
        ).replace(
            "VERDICT: pass",
            "CMP-1: asserted, no manifest — manifest absent for TW\n\nVERDICT: pass",
        ),
    )

    # Case 16 (assertion 9): CMP-1 in scope but no CMP-1 verdict form — fails
    assert_fails(
        "CMP-1 in scope but no verdict form",
        PASSING_RECORD.replace(
            "A11Y-1, A11Y-2, TOK-1, CMP-3.",
            "A11Y-1, A11Y-2, TOK-1, CMP-3, CMP-1.",
        ),
        "carries no CMP-1 verdict line",
    )

    # Case 17 (assertion 10): valid ledger (script + manual-with-evidence +
    # unverified-with-reason) — passes. PASSING_RECORD already carries this
    # ledger, so the minimal-record case (Case 1) also exercises it; this is
    # the explicit, self-describing instance.
    assert_passes(
        "valid verification ledger (script/manual/unverified)",
        PASSING_RECORD,
    )

    # Case 18 (assertion 10): manual row with empty Evidence cell — fails
    assert_fails(
        "ledger manual row with no evidence",
        PASSING_RECORD.replace(
            "| A11Y-1 | manual | measured fg/bg with the picker "
            "— 5.1:1 at the smallest text |",
            "| A11Y-1 | manual |  |",
        ),
        "is 'manual' with no evidence",
    )

    # Case 19 (assertion 10): invalid method ("eyeballed") — fails
    assert_fails(
        "ledger invalid method",
        PASSING_RECORD.replace(
            "| A11Y-1 | manual | measured fg/bg with the picker "
            "— 5.1:1 at the smallest text |",
            "| A11Y-1 | eyeballed | looked fine |",
        ),
        "invalid method",
    )

    # Case 20 (assertion 10): unverified row with no reason — fails
    assert_fails(
        "ledger unverified row with no reason",
        PASSING_RECORD.replace(
            "| A11Y-4 | unverified | needs computed layout "
            "— flag for a human |",
            "| A11Y-4 | unverified |  |",
        ),
        "is 'unverified' with no reason",
    )

    # Case 21 (assertion 10): Verify verdict with no ledger table — fails
    # (the assertion is REQUIRED: a Verify verdict must carry a ledger).
    assert_fails(
        "no verification ledger in Verify verdict",
        PASSING_RECORD.replace(
            "| Control | Method | Evidence |\n"
            "|---------|--------|----------|\n"
            "| TOK-1 | script | `checks/token-audit.py` clean (exit 0) |\n"
            "| A11Y-1 | manual | measured fg/bg with the picker "
            "— 5.1:1 at the smallest text |\n"
            "| A11Y-4 | unverified | needs computed layout "
            "— flag for a human |\n",
            "",
        ),
        "no verification ledger",
    )

    checklib.report_self_test(failures, case_count)


# ── Entry point ────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if "--self-test" in args:
        run_self_test()
        return  # run_self_test calls sys.exit

    # Parse --repo-root <path> flag (backward-compatible; default = module REPO_ROOT)
    repo_root = REPO_ROOT
    filtered_args = []
    i = 0
    while i < len(args):
        if args[i] == "--repo-root" and i + 1 < len(args):
            repo_root = os.path.abspath(args[i + 1])
            i += 2
        else:
            filtered_args.append(args[i])
            i += 1

    decisions_dir = os.path.join(repo_root, "docs", "decisions")
    paths = filtered_args if filtered_args else default_records(decisions_dir)
    if not paths:
        print("ERROR audit-record: no records found in docs/decisions/")
        sys.exit(1)

    errors = []
    for path in paths:
        errors.extend(audit_file(path, repo_root))

    if errors:
        for e in errors:
            print(e)
        sys.exit(1)
    print(f"OK: {len(paths)} records audited")
    sys.exit(0)


if __name__ == "__main__":
    main()
