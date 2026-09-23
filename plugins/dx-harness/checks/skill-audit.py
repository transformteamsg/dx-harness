#!/usr/bin/env python3
"""
Skill audit — checks/skill-audit.py
Reports a file under a skill's `references/` directory that no other file
in that skill directory mentions.

CONTRIBUTING.md's "Add a skill" section says `SKILL.md` states the flow and
`references/` holds the detail each step consumes — a reader reaches a
reference file because something names it. #366 removed the paragraph in
`dx-create-story/SKILL.md` that named `references/issue-template.md`, and no
existing check caught it: the file was still on disk, still correct, and
`pnpm lint`/`typecheck`/`test`/`build` all passed, because none of them looks
for a reference file nothing points at any more.

This is the dangling-reference direction only. The inverse (a mention that
resolves to nothing) is a separate rule and out of scope here.

A mention is not always a markdown link. `dx-create-story` names its
template with one (`[references/issue-template.md](references/issue-template.md)`),
but `dx-create-adr` and `dx-design-git` name theirs in running prose as an
inline code span (`` `references/madr-templates.md` ``), with no `](` at
all. Both point a reader at the file just as well, so the audit matches the
reference file's own name as a substring, not a link's syntax.

A skill directory is read as a whole, not `SKILL.md` alone: `dx-trim-doc`
dispatches to sibling files `executable-path.md`/`reference-path.md` that
carry the mentions onward to `references/`, so "named in `SKILL.md`" would
misreport that skill's own reference files as orphans.

Usage:
  python3 checks/skill-audit.py [<skills-root>]   # default: ../skills
  python3 checks/skill-audit.py --self-test

Exit 0 and print "OK: <n> skills audited, 0 orphaned reference files" when
every reference file is mentioned. Exit 1 and print one
`ERROR <file>:1 <message>` line per orphan, or per file that could not be
read (an unreadable file fails the skill rather than passing it, since a
missed read could hide the very mention that saves a reference file).
"""

import importlib.util
import os
import re
import sys

CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))
PLUGIN_ROOT = os.path.dirname(CHECKS_DIR)
DEFAULT_SKILLS_ROOT = os.path.join(PLUGIN_ROOT, "skills")


def _load_checklib():
    path = os.path.join(CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_dx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()


def is_mentioned(filename, text):
    """Whether `filename` (e.g. `foo.md`) appears in `text` as a whole path
    component: not preceded or followed by a character that would make it
    part of a longer name, such as `issue-template.md` swallowing a search
    for `template.md`. Matches equally inside a markdown link
    (`](references/foo.md)`) and inside an inline code span (`` `foo.md` `` )
    — this plugin's skills use both to name a reference file."""
    pattern = re.compile(r"(?<![\w-])" + re.escape(filename) + r"(?![\w-])")
    return pattern.search(text) is not None


def find_skill_dirs(skills_root):
    """Every skill directory one level inside a category folder under
    `skills_root` (`engineering/dx-*`, `design/dx-*`, ...) — the layout
    CONTRIBUTING.md's "Add a skill" requires. A category folder with no
    skills, or a `skills_root` with no category folders, yields nothing."""
    dirs = []
    if not os.path.isdir(skills_root):
        return dirs
    for category in sorted(os.listdir(skills_root)):
        category_dir = os.path.join(skills_root, category)
        if not os.path.isdir(category_dir):
            continue
        for name in sorted(os.listdir(category_dir)):
            skill_dir = os.path.join(category_dir, name)
            if os.path.isdir(skill_dir) and os.path.isfile(
                os.path.join(skill_dir, "SKILL.md")
            ):
                dirs.append(skill_dir)
    return dirs


def _walk_markdown_files(skill_dir):
    for dirpath, _dirnames, filenames in os.walk(skill_dir):
        for name in sorted(filenames):
            if name.endswith(".md"):
                yield os.path.join(dirpath, name)


def audit_skill(skill_dir, repo_root):
    """Audits one skill directory. Returns a list of `ERROR ...` lines —
    empty when every `references/` file is mentioned by some other file in
    the skill directory, or when the skill has no `references/` directory
    at all. A file that cannot be read fails the skill: its errors replace
    whatever the orphan scan would have found, because a read that silently
    skipped might have hidden the very mention that saves a reference
    file."""
    texts = {}
    read_errors = []
    for md_file in _walk_markdown_files(skill_dir):
        try:
            with open(md_file, "r", encoding="utf-8") as f:
                texts[md_file] = f.read()
        except OSError as exc:
            rel = os.path.relpath(md_file, repo_root)
            read_errors.append(f"ERROR {rel}:1 cannot read this file ({exc})")

    if read_errors:
        return read_errors

    references_dir = os.path.join(skill_dir, "references")
    if not os.path.isdir(references_dir):
        return []

    errors = []
    for ref_file in _walk_markdown_files(references_dir):
        filename = os.path.basename(ref_file)
        mentioned = any(
            is_mentioned(filename, text)
            for other_file, text in texts.items()
            if other_file != ref_file
        )
        if not mentioned:
            rel = os.path.relpath(ref_file, repo_root)
            skill_rel = os.path.relpath(skill_dir, repo_root)
            errors.append(
                f"ERROR {rel}:1 no other file in {skill_rel} mentions this "
                f"reference file — reference it or delete it"
            )
    return errors


def run_self_test():
    import tempfile

    failures = []
    case_count = 0

    def check_true(name, condition, detail=""):
        nonlocal case_count
        case_count += 1
        if not condition:
            failures.append(f"FAIL {name}: {detail}")

    def write(path, content):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

    # AC1: a references/ file nothing links is reported.
    with tempfile.TemporaryDirectory() as td:
        skill_dir = os.path.join(td, "skills", "engineering", "dx-fake")
        write(os.path.join(skill_dir, "SKILL.md"), "# dx-fake\n\nNo links here.\n")
        write(os.path.join(skill_dir, "references", "orphan.md"), "# Orphan\n")
        errors = audit_skill(skill_dir, td)
        check_true(
            "AC1 orphan reference file is reported",
            len(errors) == 1 and "orphan.md" in errors[0] and errors[0].startswith("ERROR "),
            f"got {errors!r}",
        )

    # AC2: a file that cannot be read fails the skill rather than passing it.
    with tempfile.TemporaryDirectory() as td:
        skill_dir = os.path.join(td, "skills", "engineering", "dx-fake")
        skill_md = os.path.join(skill_dir, "SKILL.md")
        write(skill_md, "# dx-fake\n")
        write(os.path.join(skill_dir, "references", "orphan.md"), "# Orphan\n")
        os.chmod(skill_md, 0o000)
        try:
            errors = audit_skill(skill_dir, td)
            check_true(
                "AC2 unreadable SKILL.md fails rather than passes",
                len(errors) == 1 and "cannot read" in errors[0] and "SKILL.md" in errors[0],
                f"got {errors!r}",
            )
        finally:
            os.chmod(skill_md, 0o644)

    # AC3: a references/ file mentioned only by a sibling references/ file
    # (not SKILL.md), as an inline code span rather than a markdown link,
    # is not an orphan.
    with tempfile.TemporaryDirectory() as td:
        skill_dir = os.path.join(td, "skills", "engineering", "dx-fake")
        write(os.path.join(skill_dir, "SKILL.md"), "# dx-fake\n\nRead `references/a.md`.\n")
        write(os.path.join(skill_dir, "references", "a.md"), "# A\n\nSee `b.md` too.\n")
        write(os.path.join(skill_dir, "references", "b.md"), "# B\n")
        errors = audit_skill(skill_dir, td)
        check_true(
            "AC3 file reached via a sibling reference is not reported",
            errors == [],
            f"got {errors!r}",
        )

    # AC4: a skill with no references/ directory is silent.
    with tempfile.TemporaryDirectory() as td:
        skill_dir = os.path.join(td, "skills", "engineering", "dx-fake")
        write(os.path.join(skill_dir, "SKILL.md"), "# dx-fake\n\nNo references here.\n")
        errors = audit_skill(skill_dir, td)
        check_true(
            "AC4 skill with no references directory is silent",
            errors == [],
            f"got {errors!r}",
        )

    # Also true when done: a fixture covering the #366 regression itself —
    # dx-create-story's SKILL.md named references/issue-template.md until a
    # trim removed the sentence that did, and no existing check caught it.
    with tempfile.TemporaryDirectory() as td:
        skill_dir = os.path.join(td, "skills", "engineering", "dx-create-story")
        write(
            os.path.join(skill_dir, "SKILL.md"),
            "# dx-create-story\n\nFile a story issue for the request.\n",
        )
        write(
            os.path.join(skill_dir, "references", "issue-template.md"),
            "# Story issue template\n",
        )
        errors = audit_skill(skill_dir, td)
        check_true(
            "regression #366: removing the issue-template.md mention fails the audit",
            len(errors) == 1 and "issue-template.md" in errors[0],
            f"got {errors!r}",
        )

    # Also true when done: the audit reads every skill under both
    # skills/engineering/ and skills/design/, not just one category.
    with tempfile.TemporaryDirectory() as td:
        skills_root = os.path.join(td, "skills")
        eng_dir = os.path.join(skills_root, "engineering", "dx-eng-fake")
        design_dir = os.path.join(skills_root, "design", "dx-design-fake")
        write(os.path.join(eng_dir, "SKILL.md"), "# dx-eng-fake\n")
        write(os.path.join(design_dir, "SKILL.md"), "# dx-design-fake\n")
        found = find_skill_dirs(skills_root)
        check_true(
            "the audit reads skills under both engineering/ and design/",
            os.path.normpath(eng_dir) in [os.path.normpath(d) for d in found]
            and os.path.normpath(design_dir) in [os.path.normpath(d) for d in found],
            f"got {found!r}",
        )

    checklib.report_self_test(failures, case_count)


def main():
    args = sys.argv[1:]

    if "--self-test" in args:
        run_self_test()
        return  # run_self_test calls sys.exit

    skills_root = os.path.abspath(args[0]) if args else DEFAULT_SKILLS_ROOT
    repo_root = os.path.dirname(skills_root)

    skill_dirs = find_skill_dirs(skills_root)
    errors = []
    for skill_dir in skill_dirs:
        errors.extend(audit_skill(skill_dir, repo_root))

    for line in errors:
        print(line)

    if errors:
        sys.exit(1)
    print(f"OK: {len(skill_dirs)} skills audited, 0 orphaned reference files")
    sys.exit(0)


if __name__ == "__main__":
    main()
