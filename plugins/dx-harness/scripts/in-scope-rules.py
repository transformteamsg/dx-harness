#!/usr/bin/env python3
"""
in-scope-rules.py - print the catalogue rules in scope for a product and a run.

A design run reads this list instead of the whole of `standards/catalog.yaml`.
The resolution is `checks/checklib.py`'s resolve_rules(), so the list and the
checks select the same slice. Every L0 rule is on every list.

The first line names the selection the list came from, including whether the
product has a `DESIGN.md`. Each rule follows on one line:

    - <ID> (<tier>) <title>. Verify: <verify>. Detail: <absolute path>

`Detail:` is present only when the rule has a detail file.

Usage:
  python3 scripts/in-scope-rules.py <repo-root> [--dimension polish]
      [--phase verify] [--surface page] [--product tw] [--audience teachers]

Exit codes:
  0  printed the list
  3  the product's DESIGN.md names a rule code the catalogue does not have;
     no list was printed
  4  the control catalogue is missing or unreadable (a tool failure)
"""

import argparse
import importlib.util
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STANDARDS_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "standards")

# The scope values standards/README.md defines.
PHASES = ("intent", "plan", "implement", "verify")
SURFACES = ("page", "component", "flow", "content")
PRODUCTS = ("tw", "casesync", "glow", "other")
AUDIENCES = ("teachers", "students-primary", "students-secondary", "parents")


def _load_checklib():
    path = os.path.join(os.path.dirname(SCRIPT_DIR), "checks", "checklib.py")
    spec = importlib.util.spec_from_file_location("_dx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()


def selection_line(args, design_path):
    """The one line that says which selection produced the list."""
    design = design_path if design_path else "no DESIGN.md (portfolio defaults)"
    return (
        f"Selection: dimension {args.dimension or 'all'}, "
        f"phase {args.phase or 'all'}, surface {args.surface or 'all'}, "
        f"product {args.product or 'unstated'}, audience {args.audience}, "
        f"{design}"
    )


def rule_line(control):
    line = f"- {control['id']} ({control.get('tier', '?')}) {control.get('title', '')}."
    if control.get("verify"):
        line += f" Verify: {control['verify']}."
    if control.get("detail"):
        line += f" Detail: {os.path.join(STANDARDS_DIR, control['detail'])}"
    return line


def main(argv=None):
    p = argparse.ArgumentParser(
        description="Print the catalogue rules in scope for a product and a run."
    )
    p.add_argument("repo_root", help="product repo root (the directory that holds DESIGN.md)")
    p.add_argument("--dimension", choices=sorted(checklib.DIMENSION_RULES),
                   help="keep only this pass dimension's rules, plus L0")
    p.add_argument("--phase", choices=PHASES)
    p.add_argument("--surface", choices=SURFACES)
    p.add_argument("--product", choices=PRODUCTS)
    p.add_argument("--audience", choices=AUDIENCES, default=checklib.DEFAULT_AUDIENCE)
    args = p.parse_args(argv)

    controls = checklib.catalog_controls()
    if not controls:
        print(f"ERROR in-scope-rules.py: cannot read the control catalogue at "
              f"{checklib.CATALOG_PATH}. Fix the harness install and rerun.")
        return 4

    design_path = os.path.join(os.path.abspath(args.repo_root), "DESIGN.md")
    if os.path.isfile(design_path):
        with open(design_path, encoding="utf-8") as fh:
            text = fh.read()
        try:
            checklib.design_rule_codes(text, controls)
        except checklib.UnknownRuleError as exc:
            for code in exc.codes:
                print(f"ERROR {design_path}: unknown rule code {code}. It is not in "
                      f"standards/catalog.yaml. Fix the code in DESIGN.md and rerun.")
            return 3
    else:
        design_path = None

    print(selection_line(args, design_path))
    for control in checklib.resolve_rules(
            controls, dimension=args.dimension, phase=args.phase,
            surface=args.surface, product=args.product, audience=args.audience):
        print(rule_line(control))
    return 0


if __name__ == "__main__":
    sys.exit(main())
