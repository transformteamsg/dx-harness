#!/usr/bin/env python3
"""
rule-detail.py - print the part of a rule's detail file that one reader needs.

A detail file holds two parts. The build part is the rule itself: the
requirement, the pass and fail conditions, and any section that states part of
the rule, such as COL-1's per-product primary, and the waiver. The review part
adds what only a grader needs: the evaluator guidance, how to verify, the
deconfliction notes, and the "Do not flag" list. Neither part prints the
frontmatter, the rationale, or a "Why ..." section.

The list command (scripts/in-scope-rules.py) gives the path to each listed
rule's detail file.

Usage:
  python3 scripts/rule-detail.py <detail file> --for build
  python3 scripts/rule-detail.py <detail file> --for review

Exit codes:
  0  printed the part
  3  --for review on a judgment or hybrid rule whose detail has no evaluator
     part (no "Evaluator guidance" and no "How to verify" section). This is a
     catalogue defect; nothing was printed
  4  the detail file is missing or unreadable (a tool failure)
"""

import argparse
import re
import sys

# The sections that only a grader reads.
REVIEW_ONLY = ("Evaluator guidance", "How to verify", "Do not flag", "Deconfliction")
# A review part needs at least one of these, or the rule has no evaluator part.
EVALUATOR = ("Evaluator guidance", "How to verify")
# The sections that explain a rule and state none of it. No reader gets them.
EXPLANATION = ("Rationale", "Why ")

_CHECK_RE = re.compile(r"^check:\s*(\S+)\s*$", re.MULTILINE)
_ID_RE = re.compile(r"^id:\s*(\S+)\s*$", re.MULTILINE)


def split_detail(text):
    """The frontmatter, the text before the first section, and the
    (heading, text) sections, in file order. A `## ` line inside a code fence
    is not a heading."""
    front = ""
    if text.startswith("---\n"):
        end = text.find("\n---\n", 4)
        if end != -1:
            front, text = text[4:end], text[end + 5:]
    lead, sections, fenced = [], [], False
    for line in text.splitlines(keepends=True):
        if line.startswith("```"):
            fenced = not fenced
        if not fenced and line.startswith("## "):
            sections.append([line[3:].strip(), [line]])
        elif sections:
            sections[-1][1].append(line)
        else:
            lead.append(line)
    return front, "".join(lead), [(h, "".join(body)) for h, body in sections]


def _starts(heading, names):
    return any(heading.startswith(name) for name in names)


def part(sections, reader):
    """The sections one reader gets, in file order."""
    kept = [(h, body) for h, body in sections if not _starts(h, EXPLANATION)]
    if reader == "build":
        kept = [(h, body) for h, body in kept if not _starts(h, REVIEW_ONLY)]
    return kept


def main(argv=None):
    p = argparse.ArgumentParser(
        description="Print the part of a rule's detail file that one reader needs."
    )
    p.add_argument("detail", help="the rule's detail file, at the path the list gives")
    p.add_argument("--for", dest="reader", choices=("build", "review"), required=True)
    args = p.parse_args(argv)

    try:
        with open(args.detail, encoding="utf-8") as fh:
            text = fh.read()
    except OSError as exc:
        print(f"ERROR rule-detail.py: cannot read {args.detail}: {exc.strerror}. "
              f"Fix the harness install and rerun.")
        return 4

    front, lead, sections = split_detail(text)
    rule_id = (_ID_RE.search(front) or [None, args.detail])[1]
    check = (_CHECK_RE.search(front) or [None, ""])[1]

    if (args.reader == "review" and check in ("judgment", "hybrid")
            and not any(_starts(h, EVALUATOR) for h, _ in sections)):
        print(f"ERROR {args.detail}: catalogue defect. {rule_id} is a {check} rule, "
              f"and its detail has no evaluator part: no \"Evaluator guidance\" and no "
              f"\"How to verify\" section. Report the defect and write no rubric of "
              f"your own.")
        return 3

    out = [f"# {rule_id}: {args.reader} part\n"]
    if lead.strip():
        out.append("\n" + lead.strip() + "\n")
    for _, body in part(sections, args.reader):
        out.append("\n" + body.rstrip() + "\n")
    sys.stdout.write("".join(out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
