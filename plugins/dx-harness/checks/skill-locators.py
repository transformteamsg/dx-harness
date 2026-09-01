#!/usr/bin/env python3
"""Resolve every relative `../<path>` locator in the plugin's agent-facing docs.

Walks every *.md file under plugins/dx-harness/skills/, agents/, and procedures/,
finds each `../`-prefixed relative locator, resolves it against the containing
file's directory, and checks that the resolved path exists on disk. An agent
follows these locators literally, so one that does not resolve is a dead
instruction: the agent reads nothing and carries on without the rule.

Every depth is checked, not just the three-level `../../../` form a skill uses to
reach the plugin root: `agents/` sits one level down and `procedures/` docs point
at each other and at `../standards/`, and those were the locators that went
unchecked while this walked `skills/` alone.

Usage (from the plugin root, i.e. plugins/dx-harness/):
    python3 checks/skill-locators.py
    python3 checks/skill-locators.py --self-test

Prints `OK: <n> locators resolved` and exits 0 if every locator resolves.
Otherwise prints one `UNRESOLVED <file>: <locator> -> <resolved-path>` line
per failure and exits 1.
"""

import os
import re
import sys

# One or more `../` segments, then a path. The negative lookbehind rejects the
# `...` of an elided URL (`POST .../pulls/<n>/reviews`), which otherwise ends in
# `../` and reads as a locator.
LOCATOR_RE = re.compile(r"(?<![./])(?:\.\./)+[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*/?")
TRAILING_PUNCT = ".,;:'\")]}`"
SEARCH_DIRS = ("skills", "agents", "procedures")


def find_md_files(*roots):
    for root in roots:
        if not os.path.isdir(root):
            continue
        for dirpath, _dirnames, filenames in os.walk(root):
            for name in filenames:
                if name.endswith(".md"):
                    yield os.path.join(dirpath, name)


def clean_locator(raw):
    return raw.rstrip(TRAILING_PUNCT)


def check_text(text, file_dir, plugin_root, exists=os.path.exists):
    """Return (resolved, unresolved, escaped) for one document's locators.

    A locator that resolves above `plugin_root` is `escaped`: it is a form quoted
    for a file at a different depth ("from a skill directory, `../../../standards/`")
    rather than a path this document follows, so its target cannot be judged from
    here. Those are reported, never failed, because the alternative is a check that
    fails on correct documentation.

    `exists` is injected so the self-test can drive it without touching disk.
    """
    resolved = []
    unresolved = []
    escaped = []
    root = os.path.normpath(plugin_root)
    for match in LOCATOR_RE.finditer(text):
        locator = clean_locator(match.group(0))
        if not locator.startswith("../"):
            continue
        resolved_path = os.path.normpath(os.path.join(file_dir, locator))
        if os.path.commonpath([root, resolved_path]) != root:
            escaped.append((locator, resolved_path))
        elif exists(resolved_path):
            resolved.append((locator, resolved_path))
        else:
            unresolved.append((locator, resolved_path))
    return resolved, unresolved, escaped


def run(plugin_root):
    roots = [os.path.join(plugin_root, d) for d in SEARCH_DIRS]
    resolved_count = 0
    unresolved = []
    escaped = []

    for md_file in sorted(find_md_files(*roots)):
        with open(md_file, "r", encoding="utf-8") as f:
            text = f.read()
        ok, bad, out = check_text(text, os.path.dirname(md_file), plugin_root)
        resolved_count += len(ok)
        unresolved.extend((md_file, loc, path) for loc, path in bad)
        escaped.extend((md_file, loc) for loc, _ in out)

    return resolved_count, unresolved, escaped


def self_test():
    """Drive check_text against a fake filesystem: no disk, so no drift."""
    root = "/plugin"
    present = {
        "/plugin/standards/catalog.yaml",
        "/plugin/procedures/design-essence.md",
        "/plugin/standards",
    }
    cases = [
        # (text, file_dir, want_resolved, want_unresolved, want_escaped)
        ("see `../../../standards/catalog.yaml` first",
         "/plugin/skills/design/dx-design", 1, 0, 0),
        ("read `../procedures/design-essence.md` before grading",
         "/plugin/agents", 1, 0, 0),
        ("beside this file: `../standards/catalog.yaml`",
         "/plugin/procedures", 1, 0, 0),
        ("a directory locator `../standards/` resolves",
         "/plugin/procedures", 1, 0, 0),
        ("`../../../procedures/does-not-exist.md` is dead",
         "/plugin/skills/design/dx-design", 0, 1, 0),
        ("trailing punctuation is stripped: `../../../standards/catalog.yaml`.",
         "/plugin/skills/design/dx-design", 1, 0, 0),
        # A form quoted for a deeper file: climbs above the plugin root, so it is
        # reported rather than failed.
        ("from a skill directory: `../../../standards/catalog.yaml`",
         "/plugin/procedures", 0, 0, 1),
        # An elided URL is not a locator: `.../pulls/` ends in `../` but the
        # lookbehind rejects it.
        ("POST `.../pulls/<n>/reviews` posts the review",
         "/plugin/procedures", 0, 0, 0),
        (".../merge_requests/:iid/discussions carries a position",
         "/plugin/procedures", 0, 0, 0),
        # A sibling path with no `../` prefix is out of scope: the walk only
        # judges locators that climb, because those are the ones a moved file
        # silently breaks.
        ("see `health-scan.md` beside this file", "/plugin/skills/design/x", 0, 0, 0),
        ("no locators here at all", "/plugin/procedures", 0, 0, 0),
    ]
    failures = []
    for i, (text, file_dir, want_ok, want_bad, want_out) in enumerate(cases):
        ok, bad, out = check_text(text, file_dir, root, exists=lambda p: p in present)
        if len(ok) != want_ok or len(bad) != want_bad or len(out) != want_out:
            failures.append(
                f"case {i}: want: {want_ok} resolved / {want_bad} unresolved / "
                f"{want_out} escaped; got: {len(ok)} / {len(bad)} / {len(out)}"
            )
    if failures:
        for f in failures:
            print(f"SELF-TEST FAIL {f}")
        return 1
    print(f"SELF-TEST OK ({len(cases)} cases)")
    return 0


def main():
    if "--self-test" in sys.argv[1:]:
        return self_test()

    plugin_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    resolved_count, unresolved, escaped = run(plugin_root)

    for md_file, locator in escaped:
        print(
            f"NOTE {os.path.relpath(md_file, plugin_root)}: {locator} climbs above "
            "the plugin root, so it is a quoted form rather than a path this file "
            "follows; its target is not checked here"
        )

    if unresolved:
        for md_file, locator, resolved_path in unresolved:
            print(f"UNRESOLVED {md_file}: {locator} -> {resolved_path}")
        return 1

    print(f"OK: {resolved_count} locators resolved")
    return 0


if __name__ == "__main__":
    sys.exit(main())
