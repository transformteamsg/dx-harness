#!/usr/bin/env python3
"""
in-scope-rules.py - print the rules in scope for a product and a run.

A design run reads this list instead of the rule files and `standards/catalog.yaml`.
The list holds the base rules in `standards/rules/`, lint and judged, then the
placeholder controls that stay in `catalog.yaml`. A catalogue control that
`standards/rules/redirects.yaml` maps to base rules is not on the list: its
rules are. The selection follows ADR-0003, through `checks/checklib.py`'s
resolve_in_scope(). Every L0 rule is on every list.

The product's rules are selected by `design-lint.config.json` at the repository
root, with the keys that `design-lint` reads: `select`, and `preset` with the
preset's `ignore`. A product with no config gets every rule. A selection in the
`DESIGN.md` frontmatter selects nothing, and the command prints a note that names it.

The first line names the selection the list came from. Each rule follows on one
line:

    - <code> (<tier>, <check>) <title>. Verify: <verify>. Covered by: <check>. Detail: <absolute path>

`Verify:` and `Covered by:` are present only on a placeholder control, and
`Covered by:` only when a check covers it fully (`enforced: script`). The
`Detail:` of a lint rule is its rule file, and of a judged rule the MAPPING.md
of its category. A placeholder control has a `Detail:` when it has a detail file.

Usage:
  python3 scripts/in-scope-rules.py <repo-root> [--dimension polish]
      [--product tw] [--audience teachers]

Exit codes:
  0  printed the list
  2  the product's design-lint.config.json or its preset cannot be read
  3  the product's config names a rule code that no base rule, placeholder
     control, or redirect has; no list was printed
  4  the base rules or the control catalogue are missing or unreadable (a tool
     failure)
"""

import argparse
import importlib.util
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STANDARDS_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "standards")

# The scope values standards/README.md defines. They scope a placeholder
# control only (ADR-0003 decision 2).
PRODUCTS = ("tw", "casesync", "glow", "other")
AUDIENCES = ("teachers", "students-primary", "students-secondary", "parents")

# The DESIGN.md frontmatter keys of ADR-0001 decision 5. ADR-0003 decision 4
# moves the selection to design-lint.config.json.
DESIGN_SELECTION_KEYS = ("extends", "select", "ignore", "exclude", "scopes")


def _load_checklib():
    path = os.path.join(os.path.dirname(SCRIPT_DIR), "checks", "checklib.py")
    spec = importlib.util.spec_from_file_location("_dx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()


def design_selection_keys(repo_root):
    """The selection keys that the product's DESIGN.md frontmatter sets, in
    file order, and the path of the file. ([], None) when it sets none."""
    path = os.path.join(repo_root, "DESIGN.md")
    if not os.path.isfile(path):
        return [], None
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    if not text.startswith("---\n"):
        return [], path
    end = text.find("\n---", 4)
    front = text[4:end] if end != -1 else ""
    keys = [m.group(1) for m in re.finditer(r"^([A-Za-z_]+):", front, re.MULTILINE)
            if m.group(1) in DESIGN_SELECTION_KEYS]
    return keys, path


def selection_line(args, selection):
    """The one line that says which selection produced the list."""
    if selection["config"]:
        source = selection["config"]
        if selection["select"]:
            source += f" (select {', '.join(selection['select'])})"
    else:
        source = "no design-lint.config.json (every rule)"
    preset = selection["preset"]["name"] if selection["preset"] else "none"
    return (
        f"Selection: dimension {args.dimension or 'all'}, "
        f"product {args.product or 'unstated'}, audience {args.audience}, "
        f"{source}, preset {preset}"
    )


def rule_line(rule):
    check = rule.get("check")
    tier = rule.get("tier") or "?"
    line = f"- {rule['id']} ({tier}{', ' + check if check else ''}) {rule.get('title', '')}."
    if rule.get("verify"):
        line += f" Verify: {rule['verify']}."
    if rule.get("enforced") == "script" and rule.get("script"):
        script = rule["script"]
        line += f" Covered by: {', '.join(script) if isinstance(script, list) else script}."
    detail = rule.get("detail")
    if detail:
        line += f" Detail: {detail if os.path.isabs(detail) else os.path.join(STANDARDS_DIR, detail)}"
    return line


def main(argv=None):
    p = argparse.ArgumentParser(
        description="Print the rules in scope for a product and a run."
    )
    p.add_argument("repo_root", help="product repo root (the directory that holds "
                                     "design-lint.config.json)")
    p.add_argument("--dimension", choices=sorted(checklib.DIMENSION_RULES),
                   help="keep only this pass dimension's rules, plus L0")
    p.add_argument("--product", choices=PRODUCTS,
                   help="keep the placeholder controls scoped to this product")
    p.add_argument("--audience", choices=AUDIENCES, default=checklib.DEFAULT_AUDIENCE,
                   help="keep the placeholder controls scoped to this audience")
    args = p.parse_args(argv)

    rules = checklib.base_rules()
    if not rules:
        print(f"ERROR in-scope-rules.py: cannot read the base rules at "
              f"{checklib.RULES_DIR}. Fix the harness install and rerun.")
        return 4
    controls = checklib.catalog_controls()
    if not controls:
        print(f"ERROR in-scope-rules.py: cannot read the control catalogue at "
              f"{checklib.CATALOG_PATH}. Fix the harness install and rerun.")
        return 4
    redirects = checklib.rule_redirects()

    repo_root = os.path.abspath(args.repo_root)
    try:
        selection = checklib.product_selection(repo_root)
    except checklib.SelectionError as exc:
        print(f"ERROR in-scope-rules.py: {exc}. Fix design-lint.config.json and rerun.")
        return 2

    try:
        in_scope = checklib.resolve_in_scope(
            rules, controls, redirects, dimension=args.dimension,
            product=args.product, audience=args.audience,
            select=selection["select"], ignore=selection["ignore"])
    except checklib.UnknownRuleError as exc:
        where = selection["config"]
        if selection["preset"] and set(exc.codes) <= set(selection["ignore"]):
            where = selection["preset"]["file"]
        for code in exc.codes:
            print(f"ERROR {where}: unknown rule code {code}. No base rule, placeholder "
                  f"control, or redirect has it. Fix the code and rerun.")
        return 3

    keys, design_path = design_selection_keys(repo_root)
    print(selection_line(args, selection))
    if keys:
        print(f"Note: {design_path} sets {', '.join(keys)} in its frontmatter. "
              f"DESIGN.md selects no rules, so the list skips them. "
              f"design-lint.config.json selects the rules.")
    for rule in in_scope:
        print(rule_line(rule))
    return 0


if __name__ == "__main__":
    sys.exit(main())
