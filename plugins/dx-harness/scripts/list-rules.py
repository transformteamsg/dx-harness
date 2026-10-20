#!/usr/bin/env python3
"""
list-rules.py - list the rules that apply to a product, from its DESIGN.md selection.

A design skill reads this list instead of the whole rule set, then reads the body
of each listed rule only. The list comes from checklib.resolve_selection(), the
same resolution the checks use, so a skill and a check agree on which rules apply.

Each rule prints its code, tier, check type, title, and the absolute path of its
rule file, then its resolved parameter values and any parameter that is not
configured. The first line names the selection the list came from.

Usage:
  python3 scripts/list-rules.py [<product-root>] [--dimension <name>]
                                [--applies-to <page|component|flow|content>] [--json]
  python3 scripts/list-rules.py --self-test

<product-root> defaults to the current directory. --dimension keeps the rules of
one critique dimension (standards/dimensions/<name>.md) plus the L0 floor.
--applies-to keeps the rules that apply to that surface type.

Exit codes:
  0  printed the list
  1  the selection or the rule set did not resolve; the ERROR line names the cause
  2  usage error
"""

import argparse
import importlib.util
import json
import os
import sys
import tempfile

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CHECKS_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "checks")


def _load_checklib():
    path = os.path.join(CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_dx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()


def list_rules(product_root, dimension=None, applies_to=None, plugin_root=None):
    """The resolved selection, narrowed to `applies_to` when given."""
    if applies_to is not None:
        allowed = checklib.load_rule_schema()["applies_to"]
        if applies_to not in allowed:
            raise checklib.RuleSetError(
                f"--applies-to {applies_to!r} must be one of {', '.join(allowed)}")
    result = checklib.resolve_selection(product_root, dimension=dimension,
                                        plugin_root=plugin_root)
    if applies_to is not None:
        result["rules"] = [r for r in result["rules"] if applies_to in r["applies_to"]]
        result["sources"].append(f"applies to: {applies_to}")
    return result


def _format_value(value):
    return json.dumps(value) if not isinstance(value, str) else value


def render_text(result):
    lines = ["Selection: " + "; ".join(result["sources"])]
    if not result["rules"]:
        lines.append("No rules: the selection resolves to an empty rule set.")
    for rule in result["rules"]:
        lines.append(f"{rule['code']}  {rule['tier']}  {rule['check']}  {rule['title']}")
        lines.append(f"  file: {rule['path']}")
        if rule["parameters"]:
            values = ", ".join(f"{name}={_format_value(value)}"
                               for name, value in sorted(rule["parameters"].items()))
            lines.append(f"  parameters: {values}")
        if rule["not_configured"]:
            lines.append(f"  not configured: {', '.join(rule['not_configured'])}")
    for note in result["notes"]:
        lines.append(f"Note: {note}")
    return "\n".join(lines)


def run(argv, plugin_root=None):
    """(exit code, output) for one invocation; main() prints the output."""
    parser = argparse.ArgumentParser(prog="list-rules.py", add_help=True)
    parser.add_argument("product_root", nargs="?", default=".")
    parser.add_argument("--dimension")
    parser.add_argument("--applies-to")
    parser.add_argument("--json", action="store_true")
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return (0 if exc.code == 0 else 2), ""
    if not os.path.isdir(args.product_root):
        return 2, f"ERROR list-rules: {args.product_root} is not a directory"
    try:
        result = list_rules(os.path.abspath(args.product_root), args.dimension,
                            args.applies_to, plugin_root)
    except checklib.RuleSetError as exc:
        return 1, f"ERROR list-rules: {exc}"
    if args.json:
        return 0, json.dumps(result, indent=2)
    return 0, render_text(result)


def _self_test():
    failures = []
    case_count = 0

    def check(name, cond, detail=""):
        nonlocal case_count
        case_count += 1
        if not cond:
            failures.append(f"FAIL {name}{': ' + detail if detail else ''}")

    fixture = os.path.join(CHECKS_DIR, "fixtures", "rule-set")
    with tempfile.TemporaryDirectory() as product:
        code, out = run([product], plugin_root=fixture)
        check("text: exits 0", code == 0, out)
        check("text: the first line names the selection",
              out.startswith("Selection: default: every stable rule"), out)
        check("text: lists each rule with its file",
              "A11Y-1  L0  deterministic  Text meets AA contrast" in out
              and "a11y-1.md" in out, out)
        check("text: shows resolved parameters", "parameters: duration_max=300" in out, out)
        check("text: shows what is not configured", "not configured: scale" in out, out)

        code, out = run([product, "--json"], plugin_root=fixture)
        data = json.loads(out)
        check("json: carries sources, rules, and notes",
              sorted(data) == ["notes", "rules", "sources"], out)
        check("json: each rule names its file",
              all(os.path.isabs(r["path"]) for r in data["rules"]), out)

        direct = checklib.resolve_selection(product, plugin_root=fixture)
        check("json: lists exactly what checklib resolves, the resolution the checks use",
              [r["code"] for r in data["rules"]] == [r["code"] for r in direct["rules"]])

        code, out = run([product, "--dimension", "polish", "--json"], plugin_root=fixture)
        check("dimension: keeps its selection plus the L0 floor",
              [r["code"] for r in json.loads(out)["rules"]] == ["A11Y-1", "A11Y-2", "TOK-1", "COL-1"],
              out)

        code, out = run([product, "--applies-to", "flow", "--json"], plugin_root=fixture)
        check("applies-to: keeps the rules for that surface type",
              [r["code"] for r in json.loads(out)["rules"]] == ["MOT-1"], out)

        code, out = run([product, "--applies-to", "screen"], plugin_root=fixture)
        check("applies-to: an unknown surface type exits 1 and names it",
              code == 1 and "screen" in out, out)

        with open(os.path.join(product, "DESIGN.md"), "w", encoding="utf-8") as fh:
            fh.write('## Rules\n- select: ["XYZ-9"]\n')
        code, out = run([product], plugin_root=fixture)
        check("error: an unknown code exits 1 and names the code",
              code == 1 and out.startswith("ERROR list-rules:") and "XYZ-9" in out, out)

    code, out = run([os.path.join("no", "such", "product")], plugin_root=fixture)
    check("usage: a product root that is not a directory exits 2", code == 2, out)

    code, out = run([tempfile.gettempdir()])
    check("live: the harness rule set lists", code == 0 and out.startswith("Selection:"), out)

    checklib.report_self_test(failures, case_count)


def main():
    if "--self-test" in sys.argv[1:]:
        _self_test()
    code, out = run(sys.argv[1:])
    if out:
        print(out)
    sys.exit(code)


if __name__ == "__main__":
    main()
