#!/usr/bin/env python3
"""Resolve every ../../../<path> locator mentioned in the plugin's skill docs.

Walks every SKILL.md and other *.md file under plugins/tfx/skills/, finds each
`../../../<something>` relative locator, resolves it against the containing
file's directory, and checks that the resolved path exists on disk.

Usage (from the plugin root, i.e. plugins/tfx/):
    python3 checks/skill-locators.py

Prints `OK: <n> locators resolved` and exits 0 if every locator resolves.
Otherwise prints one `UNRESOLVED <file>: <locator> -> <resolved-path>` line
per failure and exits 1.
"""

import os
import re
import sys

LOCATOR_RE = re.compile(r"\.\./\.\./\.\./[A-Za-z0-9._/-]+")
TRAILING_PUNCT = ".,;:'\")]}`"


def find_skill_md_files(skills_root):
    for dirpath, _dirnames, filenames in os.walk(skills_root):
        for name in filenames:
            if name.endswith(".md"):
                yield os.path.join(dirpath, name)


def clean_locator(raw):
    return raw.rstrip(TRAILING_PUNCT)


def main():
    plugin_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    skills_root = os.path.join(plugin_root, "skills")

    resolved_count = 0
    unresolved = []

    for md_file in sorted(find_skill_md_files(skills_root)):
        with open(md_file, "r", encoding="utf-8") as f:
            text = f.read()

        file_dir = os.path.dirname(md_file)
        for match in LOCATOR_RE.finditer(text):
            locator = clean_locator(match.group(0))
            resolved_path = os.path.normpath(os.path.join(file_dir, locator))
            if os.path.exists(resolved_path):
                resolved_count += 1
            else:
                unresolved.append((md_file, locator, resolved_path))

    if unresolved:
        for md_file, locator, resolved_path in unresolved:
            print(f"UNRESOLVED {md_file}: {locator} -> {resolved_path}")
        return 1

    print(f"OK: {resolved_count} locators resolved")
    return 0


if __name__ == "__main__":
    sys.exit(main())
