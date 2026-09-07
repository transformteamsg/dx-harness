#!/usr/bin/env python3
"""
House style lint — scripts/house-style-lint.py

Checks a skill artifact against the house style: an issue body, a pull or merge
request description, a decision record, or a code review comment. Reads a draft
from standard input or from files named on the command line.

Scope
─────
This is not a catalogue check. It maps to no DX-DS control id, it lives outside
`checks/`, and it shares no word list with `checks/content-lint.py`. That check
governs product UI copy under CNT-1, CNT-3, CNT-5, CNT-6, CNT-13, and SLP-9,
whose bars differ from this one on purpose: CNT-3 caps a UI string at 25 words,
and the house style caps an instruction at 20. Enforcing either set on the other
domain is the wrong bar.

Where the rules come from
─────────────────────────
Four closed lists are read at runtime from procedures/house-style-mechanics.md,
so the lint and the doc cannot diverge. If a table parses empty, the lint prints
a NOTE on stderr and skips that rule rather than passing in silence. No embedded
copy exists to fall out of date.

    CUT         Word choice: cut
    REPLACE     Word choice: replace
    INCLUSIVE   Inclusive and neutral language
    MODAL       Modal verbs

The Word choice: precision table is not parsed. It mixes prohibitions with usage
notes, so a term in its first column is as often the correct form as the wrong
one: the row for `for example` says to follow it with a comma, and the row for
`neither A nor B` names the form you should write. Three of its rows are literal
enough to enforce, and they sit in the regular expressions below.

The rest are regular expressions, because the doc states those rules in prose
that no parser can read. Each names the section it implements.

    FILLER      Before you post it
    PRECISION   Word choice: precision
    PUNCT       Punctuation
    NUMBER      Numbers, beyond the threshold
    ABBREV      Plurals and abbreviations
    LENGTH      Sentence construction (ASD-STE100)

Bands
─────
    ERROR   a literal match that needs no surrounding context. Exits 1.
    WARN    a term whose correctness depends on the clause around it. Exits 0.

WARN_TERMS holds every list term that needs context, with the reason beside it.
A term absent from that set is an ERROR when it matches.

Known gaps
──────────
A slashed cell stays one literal term, which is what `and/or` needs. Splitting on
the slash would turn that row into a rule that flags every `and`. A future row
that names two forms with a slash will not fire until its cell gives each form
its own code span, as the `possible`, `impossible` row already does.

What this lint cannot see
─────────────────────────
Whether a paragraph restates the parent issue, whether content is load-bearing,
whether a coined term is defined durably, whether a metaphor is a dead one, and
whether a passive has one of its three valid reasons. A noun cluster over three
words and a compressed `-ing` clause both need a part-of-speech tagger. All of
that stays in the house style file, for a person or an agent to judge.

Usage
─────
    python3 scripts/house-style-lint.py < draft.md
    python3 scripts/house-style-lint.py FILE...
    python3 scripts/house-style-lint.py --dump-lists
    python3 scripts/house-style-lint.py --self-test

Output
──────
    ERROR <src>:<line> <RULE>: "<found>" -> <suggestion>
    WARN  <src>:<line> <RULE>: "<found>" -> <suggestion>
    OK: house style, <n> rules, no findings

Exits 0 when no ERROR line is printed, 1 otherwise.
"""

import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
MECHANICS_PATH = os.path.join(HERE, os.pardir, "procedures",
                              "house-style-mechanics.md")

# A list term whose correctness depends on the clause around it. Everything else
# on the four lists is an ERROR.
WARN_TERMS = {
    "hit": "fine in a cache hit or a hit count",
    "could": "fine outside a statement of possibility",
    "would": "fine in a past conditional",
    "may": "fine in official policy text",
    "possible": "fine outside a statement of ability",
    "impossible": "fine outside a statement of ability",
    "repo": "fine after the first use",
    "now": "fine where it contrasts with a named earlier state",
    "existing": "fine where it distinguishes two concrete things",
    "real": "fine where it marks a confirmed finding",
    "genuine": "fine where it marks a confirmed finding",
    "genuinely": "fine where it marks a confirmed finding",
    "actually": "fine where it corrects a stated expectation",
    "truly": "fine where it marks a confirmed finding",
    "he": "fine where a person's stated pronoun is he",
    "him": "fine where a person's stated pronoun is him",
    "his": "fine where a person's stated pronoun is his",
}


# ── regular-expression rules ────────────────────────────────────────────────
# (rule, band, pattern, suggestion). Each cites the doc section it implements.
REGEX_RULES = [
    # Before you post it: the two hedges that no table names.
    ("FILLER", "ERROR", r"in most cases", "name the exception instead"),
    ("FILLER", "WARN", r"\bgenerally\b", "cut it, or name the exception"),
    # Word choice: precision, the three rows a literal match can carry.
    ("PRECISION", "ERROR", r"for instance", "for example"),
    ("PRECISION", "ERROR", r"neither\s+\S+\s+or\b", "neither A nor B"),
    ("PRECISION", "ERROR", r"for more information on\b", "for more information about"),
    ("PRECISION", "WARN", r"\bwhile\b", "although or whereas, unless it is a span of time"),
    ("PRECISION", "WARN", r"\bsince\b", "because, unless it is the passage of time"),
    # Punctuation.
    ("PUNCT", "ERROR", r"[“”‘’]", "a straight quote"),
    ("PUNCT", "ERROR", r"–", "an em dash, a hyphen, or the word to"),
    ("PUNCT", "ERROR", r"…", "cut it, and state what the reader needs"),
    ("PUNCT", "ERROR", r"!", "a period"),
    ("PUNCT", "ERROR", r"\s—|—\s", "an em dash with no space, a colon, or a period"),
    ("PUNCT", "ERROR", r"(?<=[.!?])[ ]{2,}(?=(?-i:[A-Z]))", "one space between sentences"),
    ("PUNCT", "WARN", r"(?<![\w/.])\d/\d(?![\w/.])", "a decimal, or spell the fraction out"),
    # Numbers, beyond the threshold.
    ("NUMBER", "ERROR", r"\d+[ ]%", "a numeral and % with no space"),
    ("NUMBER", "ERROR", r"(?<![\d\w.])\.\d", "a leading zero"),
    ("NUMBER", "ERROR", r"\bfrom \d+-\d+", "a range with no from, or from X to Y"),
    # Plurals and abbreviations.
    ("ABBREV", "ERROR", r"\b\d+\s?(?:GB|MB|KB|TB)s\b", "no plural on a unit after a number"),
    ("ABBREV", "ERROR", r"\bU\.S\.", "US"),
    ("ABBREV", "ERROR", r"\bssh(?:ed|ing)? into\b", "use SSH to log in"),
    ("ABBREV", "ERROR", r"\b(?:API|SDK|URL|ID|SKU)'s\b", "a plural with no apostrophe"),
]

IMPERATIVE_OPENERS = {
    "add", "apply", "avoid", "call", "check", "choose", "close", "confirm",
    "create", "cut", "define", "delete", "do", "don't", "edit", "enter",
    "fill", "fix", "follow", "give", "hold", "install", "keep", "leave",
    "link", "list", "make", "mark", "match", "name", "never", "open", "pick",
    "prefix", "put", "read", "record", "remove", "rename", "replace", "run",
    "say", "see", "select", "set", "show", "skip", "spell", "split", "start",
    "state", "stop", "turn", "update", "use", "verify", "write",
}

INSTRUCTION_CAP = 20
DESCRIPTIVE_CAP = 25


# ── parsing the mechanics doc ──────────────────────────────────────────────
def _table_rows(text, heading):
    """Return each row of the markdown table under `heading` as a cell list."""
    m = re.search(r"^##+ " + re.escape(heading) + r"\s*$", text, re.M)
    if not m:
        return []
    rest = text[m.end():]
    nxt = re.search(r"^##+ ", rest, re.M)
    body = rest[: nxt.start()] if nxt else rest
    rows = []
    for line in body.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if all(re.fullmatch(r":?-{2,}:?", c) for c in cells):
            continue
        rows.append(cells)
    return rows[1:] if rows else []      # drop the header row


def _strip_parenthetical(cell):
    return re.sub(r"\s*\([^()]*\)\s*$", "", cell).strip()


def _cell_terms(cell):
    """Lowercase terms named in a table cell, from its code spans or quotes."""
    cell = _strip_parenthetical(cell)
    spans = re.findall(r"`([^`]+)`", cell) or re.findall(r'"([^"]+)"', cell)
    out = []
    for span in spans:
        term = _strip_parenthetical(span).strip().lower()
        # A slashed cell stays one literal term. See "Known gaps" above.
        if term and not term.startswith(("<", "$")):
            out.append(term)
    return out


def _cell_text(cell, limit=64):
    text = re.sub(r"[`*]", "", _strip_parenthetical(cell)).strip()
    return text[:limit] if text else ""


def load_lists(path=MECHANICS_PATH):
    """Parse the four closed lists. Returns (rules, notes)."""
    notes = []
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return [], [f"NOTE house-style-lint: could not read {path}; "
                    f"the four word-list rules did not run"]

    spec = [
        ("CUT", "Word choice: cut", "cut"),
        ("REPLACE", "Word choice: replace", "col2"),
        ("INCLUSIVE", "Inclusive and neutral language", "col2"),
        ("MODAL", "Modal verbs", "modal"),
    ]
    rules = []
    for rule, heading, mode in spec:
        found = 0
        for cells in _table_rows(text, heading):
            terms = _cell_terms(cells[0])
            if mode == "cut":
                suggest = "cut it"
            elif mode == "modal":
                # Only the three rows the doc tells you to avoid are enforced.
                if not any(t in {"should", "shall", "may"} for t in terms):
                    continue
                suggest = _cell_text(cells[1] if len(cells) > 1 else "")
            else:
                suggest = _cell_text(cells[1] if len(cells) > 1 else "")
            for term in terms:
                rules.append((rule, term, suggest or "see the mechanics file"))
                found += 1
        if not found:
            notes.append(f"NOTE house-style-lint: parsed {os.path.basename(path)} "
                         f"but the '{heading}' table yielded no terms; "
                         f"{rule} did not run")
    return rules, notes


def _term_regex(term):
    """Word-boundaried, case-insensitive pattern for a literal term."""
    body = re.escape(term).replace(r"\ ", r"\s+")
    left = r"(?<![\w-])" if term[0].isalnum() else r"(?<!\S)"
    right = r"(?![\w-])" if term[-1].isalnum() else r""
    return re.compile(left + body + right, re.I)


# ── masking ────────────────────────────────────────────────────────────────
def _blank(match):
    return " " * (match.end() - match.start())


def mask_line(line):
    """Blank the spans that are never prose, keeping every column offset."""
    line = re.sub(r"`[^`]*`", _blank, line)          # inline code
    line = re.sub(r"<!--.*?-->", _blank, line)       # html comment
    line = re.sub(r"\]\([^)]*\)", _blank, line)      # link target
    line = re.sub(r"https?://\S+", _blank, line)     # bare url
    line = re.sub(r"^\s{0,3}#{1,6}\s", _blank, line) # heading marker
    return line


def prose_paragraphs(text):
    """Group prose lines into the units a sentence can span.

    A markdown body wraps a sentence over several lines, so LENGTH cannot work
    line by line. A blank line, a fence, a heading, a table row, and a list
    marker each start a new unit; anything else joins the unit above it.
    """
    units = []
    for lineno, line, scope in prose_lines(text):
        starts = (not units
                  or not scope
                  or not units[-1][2]
                  or re.match(r"^\s*(?:[-*+]|\d+\.)\s", line)
                  or lineno != units[-1][3] + 1)
        if starts:
            units.append([lineno, line.strip(), scope, lineno])
        else:
            units[-1][1] += " " + line.strip()
            units[-1][3] = lineno
    return [(u[0], u[1]) for u in units if u[2]]


def prose_lines(text):
    """Yield (lineno, masked_line, is_sentence_scope) for each prose line."""
    fenced = False
    for n, raw in enumerate(text.splitlines(), 1):
        if re.match(r"^\s*(```|~~~)", raw):
            fenced = not fenced
            continue
        if fenced or not raw.strip():
            continue
        if raw.lstrip().startswith(">"):             # a quoted example
            continue
        masked = mask_line(raw)
        if not masked.strip():
            continue
        # A table row and a heading are reference, not sentences to measure.
        scope = not raw.lstrip().startswith("|") and not raw.lstrip().startswith("#")
        yield n, masked, scope


# ── sentence length ────────────────────────────────────────────────────────
def split_sentences(text):
    return [s for s in re.split(r"(?<=[.!?])\s+(?=[A-Z\"(*])", text.strip()) if s]


def count_words(sentence):
    sentence = re.sub(r"^\s*(?:[-*+]|\d+\.)\s+", "", sentence)
    sentence = re.sub(r"[*_]", "", sentence)
    return len([w for w in sentence.split() if re.search(r"[\w]", w)])


def looks_imperative(sentence):
    sentence = re.sub(r"^\s*(?:[-*+]|\d+\.)\s+", "", sentence)
    sentence = re.sub(r"^[*_`]+", "", sentence)
    first = re.split(r"[\s,.]", sentence.strip(), 1)[0].lower()
    return first in IMPERATIVE_OPENERS


# ── the scan ───────────────────────────────────────────────────────────────
def scan(text, src, rules):
    """Return a list of (band, src, lineno, rule, found, suggestion)."""
    findings = []
    seen = set()
    compiled = [(rule, term, suggest, _term_regex(term))
                for rule, term, suggest in rules]
    regexes = [(rule, band, re.compile(pat, re.I), sug)
               for rule, band, pat, sug in REGEX_RULES]

    for lineno, line, scope in prose_lines(text):
        for rule, term, suggest, rx in compiled:
            m = rx.search(line)
            if not m:
                continue
            if term in WARN_TERMS:
                _add(findings, seen, ("WARN", src, lineno, rule, m.group(0),
                                      f"{suggest} ({WARN_TERMS[term]})"))
            else:
                _add(findings, seen,
                     ("ERROR", src, lineno, rule, m.group(0), suggest))
        for rule, band, rx, suggest in regexes:
            m = rx.search(line)
            if m:
                _add(findings, seen, (band, src, lineno, rule,
                                      m.group(0).strip() or m.group(0), suggest))

    for lineno, para in prose_paragraphs(text):
        for sentence in split_sentences(para):
            n = count_words(sentence)
            if n > DESCRIPTIVE_CAP:
                _add(findings, seen, ("ERROR", src, lineno, "LENGTH", f"{n} words",
                                      f"{DESCRIPTIVE_CAP} words or fewer; split it"))
            elif n > INSTRUCTION_CAP and looks_imperative(sentence):
                _add(findings, seen, ("WARN", src, lineno, "LENGTH", f"{n} words",
                                      f"an instruction takes {INSTRUCTION_CAP} words"))
    return findings


def _add(findings, seen, item):
    if item not in seen:
        seen.add(item)
        findings.append(item)


def report(findings, rule_count, out=sys.stdout):
    order = {"ERROR": 0, "WARN": 1}
    findings.sort(key=lambda f: (f[1], f[2], order[f[0]], f[3]))
    for band, src, lineno, rule, found, suggest in findings:
        pad = "" if band == "ERROR" else " "
        print(f'{band}{pad} {src}:{lineno} {rule}: "{found}" -> {suggest}', file=out)
    if not findings:
        print(f"OK: house style, {rule_count} rules, no findings", file=out)
    return 1 if any(f[0] == "ERROR" for f in findings) else 0


# ── self-test ──────────────────────────────────────────────────────────────
CASES = [
    ("The validator requires this field.", []),
    ("It is worth noting that the check fires.", ["CUT"]),
    ("We added an allowlist in order to pass the build.", ["CUT"]),
    ("Add the reviewer to the whitelist.", ["INCLUSIVE"]),
    ("The runner is platform agnostic.", ["REPLACE"]),
    ("Utilise the cached artifact.", ["REPLACE"]),
    ("The job should retry on a timeout.", ["MODAL"]),
    ("Use etc. to close the list.", ["CUT"]),
    ("The queue is currently empty.", ["CUT"]),
    ("In most cases the retry succeeds.", ["FILLER"]),
    ("Use for instance to open a list.", ["PRECISION"]),
    ("Pick neither A or B.", ["PRECISION"]),
    ("The allowlist covers and/or cases.", ["CUT"]),
    ("Run a sanity check on the output.", ["INCLUSIVE"]),
    ("Coverage rose to 40 % this week.", ["NUMBER"]),
    ("The threshold is .3 seconds.", ["NUMBER"]),
    ("The scan reads from 8-20 files.", ["NUMBER"]),
    ("The cache holds 64 GBs of blobs.", ["ABBREV"]),
    ("Set the U.S. locale.", ["ABBREV"]),
    ("The build passes — barely.", ["PUNCT"]),
    ("It shipped!", ["PUNCT"]),
    ("The value is a range of 2012–2016.", ["PUNCT"]),
    ("The list is trimmed…", ["PUNCT"]),
    ("This is the “fast” path.", ["PUNCT"]),
    ("While the job runs, the queue drains.", ["PRECISION"]),
    ("`utilise` is the term the table names.", []),
    ("See https://example.com/whitelist for the source.", []),
    ("> It is worth noting that this quotes a bad example.", []),
    ("| `utilise`, `utilisation` | `use` | Keep it for a resource quantity. |", []),
    ("The validator reads the catalogue entry, checks whether the required field "
     "is present, and then decides whether the temporary allowlist exempts this "
     "particular control from the rule.", ["LENGTH"]),
    ("Run the checks, read the output, fix the first failure, and then run the "
     "whole test suite again before you push.", ["LENGTH"]),
    # A sentence that wraps over three lines is still one sentence.
    ("The validator reads the catalogue entry, checks whether the\n"
     "required field is present, and then decides whether the\n"
     "temporary allowlist exempts this particular control from the rule.",
     ["LENGTH"]),
    # A wrapped bullet is its own unit, and two short bullets do not merge.
    ("- The validator requires this field.\n- The build passes.", []),
]


def self_test():
    failures = []
    rules, notes = load_lists()
    if not rules:
        failures.append("load_lists parsed no terms from the mechanics file")
    for rule in ("CUT", "REPLACE", "INCLUSIVE", "MODAL"):
        if not any(r[0] == rule for r in rules):
            failures.append(f"{rule} parsed no terms")
    if notes:
        failures.extend(notes)

    for text, expected in CASES:
        got = {f[3] for f in scan(text, "case", rules)}
        want = set(expected)
        if want - got:
            failures.append(f"missed {sorted(want - got)} in: {text[:60]}")
        if not want and got:
            failures.append(f"false positive {sorted(got)} in: {text[:60]}")

    fixed = "The validator requires this field. A temporary allowlist exempts " \
            "controls whose script is still pending, so the build passes."
    got = {f[3] for f in scan(fixed, "case", rules)}
    if got:
        failures.append(f"the worked example's after text flags {sorted(got)}")

    if failures:
        print("SELF-TEST FAILED:", file=sys.stderr)
        for f in failures:
            print(f"  {f}", file=sys.stderr)
        return 1
    print(f"SELF-TEST OK ({len(CASES) + 8} cases)")
    return 0


def main(argv):
    args = argv[1:]
    if "--self-test" in args:
        return self_test()

    rules, notes = load_lists()
    for note in notes:
        print(note, file=sys.stderr)

    if "--dump-lists" in args:
        for rule, term, suggest in rules:
            print(f"{rule}\t{term}\t{suggest}")
        print(f"# {len(rules)} terms, {len(REGEX_RULES)} regular expressions",
              file=sys.stderr)
        return 0

    paths = [a for a in args if not a.startswith("-")]
    findings = []
    if paths:
        for path in paths:
            try:
                with open(path, encoding="utf-8") as fh:
                    findings += scan(fh.read(), path, rules)
            except OSError as exc:
                print(f"ERROR house-style-lint: cannot read {path}: {exc}",
                      file=sys.stderr)
                return 1
    else:
        findings += scan(sys.stdin.read(), "stdin", rules)
    return report(findings, len(rules) + len(REGEX_RULES))


if __name__ == "__main__":
    sys.exit(main(sys.argv))
