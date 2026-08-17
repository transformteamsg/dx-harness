#!/usr/bin/env python3
"""
Content lint — checks/content-lint.py
Scans UI source and content files for the statically-resolvable subset of
CNT-1, CNT-3, CNT-5, CNT-6, CNT-13, and the deterministic (lint) half of SLP-9 —
the parts detectable from source text alone, without rendered layout or human
judgement.

The SLP-9 word lists, the CNT-5 device-verb list, the CNT-6 opener/filler lists,
and the CNT-13 spelling maps are NOT embedded here. They are read at runtime from
standards/controls/slp-9.md, cnt-5.md, cnt-6.md, and cnt-13.md (resolved relative
to this file), so the lint and the catalog can never diverge — if a list grows,
this check picks it up. If a file cannot be found or parsed, the check falls back
to a small embedded copy and prints a NOTE saying so — never silently.

Detection rules (line-local only)
──────────────────────────────────
Rule            Control   What is caught
BUZZWORD        SLP-9     A word-boundaried, case-insensitive hit on the
                (L2)      buzzword list or the AI-vocabulary list, read from
                          slp-9.md (e.g. streamline, empower, supercharge,
                          delve, robust, foster, testament).
FILLER          SLP-9     A case-insensitive hit on the filler-phrase list
                (L2)      ("in order to", "it is important to note", …).
CHATBOT         SLP-9     A case-insensitive hit on the chatbot-artifact list
                (L2)      ("great question", "i hope this helps", "certainly!",
                          …).
EM-DASH         SLP-9     Two or more em dashes (—) inside a single sentence.
                (L2)
CNT-3           CNT-3     A user-facing string literal / MDX prose line whose
                (L2)      longest sentence exceeds 25 words.
CNT-1           CNT-1     A user-facing string that is ONLY a raw error code
                (L1)      (e.g. "ERR_SYNC_500", "0x80004005", an all-caps
                          token), or the literal "Something went wrong" with no
                          actionable next step on the same or next line.
CNT-5           CNT-5     A device-bound action verb (click, tap, swipe, and
                (L2)      inflections) inside a multi-word user-facing string or
                          MDX prose line, read from cnt-5.md. Names the input
                          device instead of the action.
CNT-6           CNT-6     A low-informational-value word in a user-facing string
                (L2)      or MDX prose line, read from cnt-6.md: a sentence-
                          INITIAL empty opener ("There is", "There are", "It is",
                          "This is") or a safe-subset filler word (just, really,
                          very, please) at any position.
CNT-13          CNT-13    A US spelling or common misspelling in a multi-word
                (L2)      user-facing string or MDX prose line, read from
                          cnt-13.md (color→colour, organize→organise,
                          recieve→receive). Suggests the British / correct form.

Scope (which text a rule body ever sees)
────────────────────────────────────────
Code and markup files go through two passes before any CNT rule runs (see
"user-facing string extraction" below). Pass 1 masks the spans that are never
copy: class values, style values, class-builder calls, module paths, and
non-rendering attribute values. Pass 2 collects what is left as user-facing
strings, each tagged with the origin it came from: `jsx_text`, `prop:<name>`,
`template_segment`, `literal`, `mdx_prose`. A class value cannot reach a rule
body by any route, and a rule that only makes sense for rendered copy (CNT-1's
raw-code half) can ask where the string came from.

What this script does NOT verify
─────────────────────────────────
- Strings built by concatenation, or an imported constant used as copy
  (`<h1>{TITLE}</h1>`): unresolvable at the use site. A template literal IS
  linted, per static segment, and never across an interpolation boundary; the
  interpolated expression itself is not linted. An imported constant is linted
  at its definition site instead, as origin `literal`.
- Whether a string is truly user-facing vs. an internal label, key, or test
  fixture. Class values, style values, module paths and non-rendering attribute
  values are masked outright; past that the CNT rules use conservative
  heuristics and, when unsure, do not flag. SLP-9 token hits are flagged
  regardless of position on the masked line (a buzzword in a comment is already
  stripped; one in a shipped identifier is still a tell).
- CNT-3's "leads with its purpose" SEMANTIC half — that the copy opens with what
  it does rather than the mechanism — needs judgement. This check only counts
  sentence length. The evaluator judges voice, person, and lead-with-purpose.
- SLP-9's STRUCTURAL-TELL evaluator half — negative parallelism, forced triads,
  copula avoidance, significance inflation, redundant label/helper pairs,
  em-dash CLUSTERING across a paragraph (vs. two dashes in one sentence) — all
  need judgement. This check is the deterministic word-list + em-dash-chain lint
  half only.
- CNT-1's "what happened → what it means → what to do next" structure — the
  evaluator judges the full anatomy; this check only catches the raw-code-only
  and bare-"Something went wrong" cases.
- CNT-5's harder half — "press" and "see" (too common in innocent prose to lint
  cleanly), ambiguous link text ("click here", "read more"), and confirming a hit
  is a UI instruction rather than incidental prose ("press release", "tap water").
  This check lints only the unambiguous device verbs; the evaluator judges the rest.
- CNT-6's harder half — "such", "that", and droppable articles/conjunctions
  ("a", "the", "and") are far too context-dependent to lint (every "the" would be
  noise), and the clarity exception on every hit ("only if it does not reduce
  clarity") is judgement. "In order to" is deliberately NOT in the CNT-6 lint
  lists — SLP-9's filler-phrase list already flags it, and one token never fires
  two controls. This check lints only sentence-initial openers and the safe
  filler subset; the evaluator judges the rest.

Output
──────
ERROR <file>:<line> [<CTL-ID>] <found> — suggest: <...>
NOTE <message>            (e.g. fell back to embedded word lists)
Exit 0 and print nothing (or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any violation.
"""

import importlib.util
import os
import re
import sys
from collections import namedtuple

_CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_checklib():
    path = os.path.join(_CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_dx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()

# ── Target extensions ──────────────────────────────────────────────────────────
# Same UI source set as a11y-static.py, plus .mdx (the content corpus this check
# is primarily aimed at).
TARGET_EXTENSIONS = {
    ".css", ".html", ".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte", ".mdx", ".md",
}

# Prose lines are the unit in Markdown; the mask-and-extract scanner is the unit
# in code and markup; .css is masked by its own at-rule rule (no tags, no props).
MARKDOWN_EXTENSIONS = {".mdx", ".md"}
SCANNED_EXTENSIONS = {".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte", ".html"}
# Extensions where `//` starts a line comment. Not .html and not .css: there a
# `//` is part of a URL, and cutting the line at it would desync the scanner.
LINE_COMMENT_EXTENSIONS = {".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte"}

# ── SLP-9 word-list source ───────────────────────────────────────────────────
# Resolved relative to this file: ../standards/controls/slp-9.md from checks/.
SLP9_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "standards", "controls", "slp-9.md",
)

# ── CNT-5 device-verb-list source ──────────────────────────────────────────────
# Resolved relative to this file: ../standards/controls/cnt-5.md from checks/.
CNT5_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "standards", "controls", "cnt-5.md",
)

# Embedded fallback device-verb list — used only if cnt-5.md can't be read/parsed.
# A NOTE is printed whenever this fallback is used. cnt-5.md is the single source
# of truth; this is the escape hatch for product repos without the full controls dir.
# Scoped to the unambiguous verbs (click/tap/swipe); "press" and "see" are left to
# the evaluator half because they collide with innocent prose.
FALLBACK_DEVICE_VERBS = [
    "click", "clicks", "clicked", "clicking",
    "tap", "taps", "tapped", "tapping",
    "swipe", "swipes", "swiped", "swiping",
]

# ── CNT-6 opener/filler-list source ────────────────────────────────────────────
# Resolved relative to this file: ../standards/controls/cnt-6.md from checks/.
CNT6_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "standards", "controls", "cnt-6.md",
)

# Embedded fallback CNT-6 lists — used only if cnt-6.md can't be read/parsed.
# cnt-6.md is the single source of truth; a NOTE is printed on fallback. Openers
# are matched sentence-initially only; filler is word-boundaried at any position.
# "in order to" is deliberately absent (SLP-9's filler-phrase list owns it);
# "such", "that", and articles/conjunctions are evaluator-only.
FALLBACK_CNT6_OPENERS = ["there is", "there are", "it is", "this is"]
FALLBACK_CNT6_FILLER = ["just", "really", "very", "please"]

# ── CNT-13 spelling/misspelling-map source ─────────────────────────────────────
# Resolved relative to this file: ../standards/controls/cnt-13.md from checks/.
CNT13_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "standards", "controls", "cnt-13.md",
)

# Embedded fallback CNT-13 maps — used only if cnt-13.md can't be read/parsed.
# cnt-13.md is the single source of truth; a NOTE is printed on fallback. Each map
# is {wrong_spelling: correct_spelling}; hits are word-boundaried, any position.
FALLBACK_CNT13_USUK = {
    "color": "colour", "colors": "colours", "organize": "organise",
    "center": "centre", "behavior": "behaviour", "favorite": "favourite",
}
FALLBACK_CNT13_TYPOS = {
    "recieve": "receive", "seperate": "separate", "occured": "occurred",
    "teh": "the",
}

# ── Embedded fallback word lists (used only if slp-9.md can't be read/parsed) ──
# A NOTE is printed whenever this fallback is used. Kept in sync with slp-9.md
# "How to verify"; the file is the single source of truth, this is the escape
# hatch for product repos without the full controls dir.
FALLBACK_BUZZWORDS = [
    "streamline", "streamlined", "empower", "supercharge", "effortless",
    "effortlessly", "seamless", "seamlessly", "world-class", "revolutionise",
    "leverage", "unlock", "elevate",
]
FALLBACK_AI_VOCAB = [
    "delve", "robust", "intricate", "foster", "vibrant", "pivotal",
    "testament", "landscape",
]
FALLBACK_FILLER = [
    "in order to", "it is important to note", "at this point in time",
    "due to the fact that",
]
FALLBACK_CHATBOT = [
    "great question", "i hope this helps", "let me know if", "certainly!",
    "you're absolutely right",
]


def _expand_parenthetical(token):
    """
    Expand a list token like "streamline(d)" / "effortless(ly)" into both the
    base form and the suffixed form: ["streamline", "streamlined"].
    A plain token returns a single-element list.
    """
    m = re.match(r"^(.*?)\(([^)]*)\)(.*)$", token)
    if not m:
        return [token]
    pre, suffix, post = m.group(1), m.group(2), m.group(3)
    return [pre + post, pre + suffix + post]


def _split_list_items(text):
    """
    Split a comma-separated buzzword/vocab span into clean lowercase tokens,
    stripping surrounding quotes, "as an abstract noun" qualifiers, and markup.
    """
    # Drop any leftover HTML comments / markdown emphasis.
    text = re.sub(r"<!--.*?-->", " ", text, flags=re.DOTALL)
    items = []
    for raw in text.split(","):
        tok = raw.strip()
        if not tok:
            continue
        # Strip surrounding quotes (straight or curly).
        tok = tok.strip('"“”‘’')
        # Drop trailing qualifier like "landscape" as an abstract noun → landscape
        # (the quoted word is already captured above; this catches the inline form).
        tok = re.sub(r"\s+as an abstract noun.*$", "", tok)
        tok = tok.strip().strip('"“”‘’').strip()
        # Skip residue like "plus the AI-vocabulary list:" connective text.
        if not tok or " " in tok and ":" in tok:
            # Phrases (filler/chatbot) are handled by dedicated parsers; here we
            # only want single words. A token with an embedded ":" is connective.
            if ":" in tok:
                continue
        if not tok:
            continue
        for expanded in _expand_parenthetical(tok.lower()):
            expanded = expanded.strip()
            if expanded:
                items.append(expanded)
    return items


def _parse_quoted_phrases(text):
    """Return the lowercase contents of every "double-quoted" phrase in text."""
    return [m.group(1).strip().lower() for m in re.finditer(r'"([^"]+)"', text)]


def load_slp9_lists(path=SLP9_PATH):
    """
    Parse the buzzword, AI-vocabulary, filler, and chatbot-artifact lists from
    slp-9.md's "## How to verify" section.

    Returns (lists_dict, used_fallback, note). `lists_dict` has keys
    "buzzwords", "ai_vocab", "filler", "chatbot". `used_fallback` is True if the
    file could not be read/parsed and the embedded copy was used; `note` is a
    human-readable string in that case (else None).
    """
    fallback = {
        "buzzwords": FALLBACK_BUZZWORDS,
        "ai_vocab": FALLBACK_AI_VOCAB,
        "filler": FALLBACK_FILLER,
        "chatbot": FALLBACK_CHATBOT,
    }
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return (
            fallback, True,
            f"NOTE content-lint: could not read {path}; using embedded "
            f"fallback SLP-9 word lists",
        )

    # Isolate the "How to verify" section so we don't pick up the Fails-when
    # examples elsewhere in the file.
    verify_idx = text.find("## How to verify")
    section = text[verify_idx:] if verify_idx != -1 else text
    # Stop at the next "## " heading after How to verify.
    nxt = section.find("\n## ", 4)
    if nxt != -1:
        section = section[:nxt]

    buzzwords = []
    # Prefer the marked span if present (post plan-035). The opening marker may
    # carry extra text (e.g. "source") after the name; the span may cross lines.
    marker = re.search(
        r"<!--\s*dx-sync:slp9-buzzwords\b[^>]*-->(.*?)<!--\s*/dx-sync:slp9-buzzwords\s*-->",
        section, flags=re.DOTALL,
    )
    if marker:
        buzzwords = _split_list_items(marker.group(1))
    else:
        # Fall back to the bullet beginning "the buzzword list —".
        bm = re.search(r"the buzzword list\s*[—-]\s*(.*?)(?:—|$)", section, flags=re.DOTALL)
        if bm:
            buzzwords = _split_list_items(bm.group(1))

    # AI-vocabulary list — the bullet "AI-vocabulary list: delve, robust, …".
    ai_vocab = []
    am = re.search(r"AI-vocabulary list:\s*(.*?)(?:;|\n\n|$)", section, flags=re.DOTALL)
    if am:
        ai_vocab = _split_list_items(am.group(1))

    # Filler list — quoted phrases after "the filler list —".
    filler = []
    fm = re.search(r"the filler list\s*[—-]\s*(.*?)(?:;|\n\n|$)", section, flags=re.DOTALL)
    if fm:
        filler = _parse_quoted_phrases(fm.group(1))

    # Chatbot-artifact list — quoted phrases after "the chatbot-artifact list —".
    chatbot = []
    cm = re.search(r"the chatbot-artifact list\s*[—-]\s*(.*?)(?:;|\n\n|$)", section, flags=re.DOTALL)
    if cm:
        chatbot = _parse_quoted_phrases(cm.group(1))

    # If any list came back empty, the parse is unreliable — fall back wholesale
    # and say so, rather than half-cover.
    if not (buzzwords and ai_vocab and filler and chatbot):
        return (
            fallback, True,
            f"NOTE content-lint: parsed {path} but a word list was empty "
            f"(buzz={len(buzzwords)}, vocab={len(ai_vocab)}, "
            f"filler={len(filler)}, chatbot={len(chatbot)}); using embedded fallback",
        )

    return (
        {
            "buzzwords": buzzwords,
            "ai_vocab": ai_vocab,
            "filler": filler,
            "chatbot": chatbot,
        },
        False,
        None,
    )


def load_cnt5_verbs(path=CNT5_PATH):
    """
    Parse the CNT-5 device-verb list from cnt-5.md's <!-- dx-sync:cnt5-verbs -->
    span. Returns (verbs_list, used_fallback, note) — mirrors load_slp9_lists so
    the lint and the catalog can never diverge. Falls back to the embedded copy
    (with a NOTE) if the file is missing, the marker is absent, or the list is empty.
    """
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return (
            FALLBACK_DEVICE_VERBS, True,
            f"NOTE content-lint: could not read {path}; using embedded "
            f"fallback CNT-5 device-verb list",
        )

    marker = re.search(
        r"<!--\s*dx-sync:cnt5-verbs\b[^>]*-->(.*?)<!--\s*/dx-sync:cnt5-verbs\s*-->",
        text, flags=re.DOTALL,
    )
    verbs = _split_list_items(marker.group(1)) if marker else []
    if not verbs:
        return (
            FALLBACK_DEVICE_VERBS, True,
            f"NOTE content-lint: parsed {path} but the cnt5-verbs list was empty; "
            f"using embedded fallback",
        )
    return (verbs, False, None)


def load_cnt6_lists(path=CNT6_PATH):
    """
    Parse the CNT-6 empty-opener and filler-word lists from cnt-6.md's
    <!-- dx-sync:cnt6-openers --> and <!-- dx-sync:cnt6-filler --> spans.
    Returns (lists_dict, used_fallback, note) with keys "openers" and "filler" —
    mirrors load_cnt5_verbs so the lint and the catalog can never diverge.
    """
    fallback = {
        "openers": FALLBACK_CNT6_OPENERS,
        "filler": FALLBACK_CNT6_FILLER,
    }
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return (
            fallback, True,
            f"NOTE content-lint: could not read {path}; using embedded "
            f"fallback CNT-6 lists",
        )

    def _span(name):
        m = re.search(
            r"<!--\s*dx-sync:" + name + r"\b[^>]*-->(.*?)<!--\s*/dx-sync:" + name + r"\s*-->",
            text, flags=re.DOTALL,
        )
        return _split_list_items(m.group(1)) if m else []

    openers = _span("cnt6-openers")
    filler = _span("cnt6-filler")
    if not (openers and filler):
        return (
            fallback, True,
            f"NOTE content-lint: parsed {path} but a CNT-6 list was empty "
            f"(openers={len(openers)}, filler={len(filler)}); using embedded fallback",
        )
    return ({"openers": openers, "filler": filler}, False, None)


def _parse_spelling_map(text):
    """
    Parse a "wrong -> right, wrong2 -> right2" span into a {wrong: right} dict.
    Keys are lowercased (matching is case-insensitive); values keep their case so
    the suggestion is the correctly-cased British/correct spelling.
    """
    text = re.sub(r"<!--.*?-->", " ", text, flags=re.DOTALL)
    mapping = {}
    for raw in text.split(","):
        tok = raw.strip()
        if not tok or "->" not in tok:
            continue
        wrong, right = tok.split("->", 1)
        wrong = wrong.strip().strip('"“”‘’').lower()
        right = right.strip().strip('"“”‘’')
        if wrong and right:
            mapping[wrong] = right
    return mapping


def load_cnt13_lists(path=CNT13_PATH):
    """
    Parse the CNT-13 US→British spelling map and common-misspelling map from
    cnt-13.md's <!-- dx-sync:cnt13-usuk --> and <!-- dx-sync:cnt13-typos -->
    spans. Returns (lists_dict, used_fallback, note) with keys "usuk" and "typos"
    — mirrors load_cnt6_lists so the lint and the catalog can never diverge.
    """
    fallback = {"usuk": FALLBACK_CNT13_USUK, "typos": FALLBACK_CNT13_TYPOS}
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return (
            fallback, True,
            f"NOTE content-lint: could not read {path}; using embedded "
            f"fallback CNT-13 spelling maps",
        )

    def _span(name):
        m = re.search(
            r"<!--\s*dx-sync:" + name + r"\b[^>]*-->(.*?)<!--\s*/dx-sync:" + name + r"\s*-->",
            text, flags=re.DOTALL,
        )
        return _parse_spelling_map(m.group(1)) if m else {}

    usuk = _span("cnt13-usuk")
    typos = _span("cnt13-typos")
    if not (usuk and typos):
        return (
            fallback, True,
            f"NOTE content-lint: parsed {path} but a CNT-13 map was empty "
            f"(usuk={len(usuk)}, typos={len(typos)}); using embedded fallback",
        )
    return ({"usuk": usuk, "typos": typos}, False, None)


def _build_cnt13_res(cnt13_lists):
    """
    Build the CNT-13 lookup from the loaded maps: a single word-boundaried,
    case-insensitive regex over every wrong spelling, plus the merged {wrong:
    right} map so a hit can suggest the correct spelling.
    """
    mapping = {}
    mapping.update(cnt13_lists["usuk"])
    mapping.update(cnt13_lists["typos"])
    return {"regex": _build_word_regex(list(mapping.keys())), "map": mapping}


def _build_word_regex(words):
    """
    Build a case-insensitive word-boundaried alternation regex for a list of
    single-word tokens (handles hyphenated tokens like world-class).
    """
    # Sort longest-first so multi-part tokens win; escape each.
    parts = sorted({re.escape(w) for w in words if w}, key=len, reverse=True)
    if not parts:
        return None
    # \b on each side; for hyphenated tokens \b still anchors at the outer edges.
    return re.compile(r"(?<![\w-])(?:" + "|".join(parts) + r")(?![\w-])", re.IGNORECASE)


def _build_cnt6_res(cnt6_lists):
    """
    Build the CNT-6 regex pair from the loaded lists: `openers` anchored to the
    start of a sentence (the caller splits sentences), `filler` word-boundaried
    at any position.
    """
    opener_parts = [
        r"\s+".join(re.escape(tok) for tok in p.split())
        for p in sorted(cnt6_lists["openers"], key=len, reverse=True) if p
    ]
    openers_re = (
        re.compile(r"^(?:" + "|".join(opener_parts) + r")\b", re.IGNORECASE)
        if opener_parts else None
    )
    return {"openers": openers_re, "filler": _build_word_regex(cnt6_lists["filler"])}


def _build_phrase_regex(phrases):
    """Case-insensitive regex matching any phrase, whitespace-flexible."""
    parts = []
    for p in sorted(phrases, key=len, reverse=True):
        if not p:
            continue
        # Collapse internal whitespace to \s+ so wrapped phrases still match.
        esc = r"\s+".join(re.escape(tok) for tok in p.split())
        parts.append(esc)
    if not parts:
        return None
    return re.compile("(?:" + "|".join(parts) + ")", re.IGNORECASE)


# ── CNT helpers ───────────────────────────────────────────────────────────────
EM_DASH = "—"

# Raw error code: an all-caps/underscore/digit token (ERR_SYNC_500, E1234),
# a hex code (0x80004005), or an ERR-prefixed token. Used on whole user strings.
RAW_CODE_RE = re.compile(
    r"^(?:0x[0-9A-Fa-f]+|ERR[_-][A-Z0-9_]+|[A-Z][A-Z0-9_]{2,}|E\d{3,})$"
)
# An actionable next-step verb (imperative) — presence means CNT-1 is satisfied.
NEXT_STEP_VERB_RE = re.compile(
    r"\b(try|retry|refresh|reload|check|contact|wait|return|go|sign|log|"
    r"reconnect|update|enter|select|choose|tap|click|open|close|save|"
    r"remove|add|review|see|visit|email|call|reset|restart)\b",
    re.IGNORECASE,
)


def _split_sentences(text):
    """Crude sentence split on . ! ? followed by space/end, and on the mid-dot
    (·) fragment separator — CNT-3 excludes labels and fragments, and a
    ·-separated Do/Don't list is fragments, not one long sentence. Good enough
    for a word-count floor; over-splitting only makes the count more
    conservative."""
    parts = re.split(r"(?<=[.!?])\s+|\s*·\s*", text.strip())
    return [p for p in parts if p.strip()]


def _word_count(sentence):
    return len(re.findall(r"\S+", sentence))


def _is_interpolated(s):
    """True if the string contains template interpolation we can't resolve."""
    return "${" in s or "{" in s or "}" in s


# ── User-facing string extraction ──────────────────────────────────────────────
# Two passes over every code and markup line, in this order.
#
# Pass 1, mask. Every span that is never copy is replaced by spaces of the same
# length rather than deleted: class values, style values, class-builder calls,
# module paths, non-rendering attribute values. Offsets survive, so the line a
# finding names survives. Nothing inside a masked span can reach a rule body.
#
# Pass 2, extract. What is left is collected as strings tagged with an origin,
# so a rule can ask where a string renders:
#   jsx_text           text child of an element
#   prop:<name>        string value of a rendering prop (allowlist, never a
#                      denylist, because a denylist over-includes and
#                      re-creates the class-name bug this pass removes)
#   template_segment   one static run of a template literal, split on ${…}
#   literal            a bare string literal anywhere else
#   mdx_prose          a Markdown prose line (the markdown path, unchanged)
#
# The SLP-9 half keeps scanning the masked LINE, not only the extracted strings:
# masking removes the class-name false positives without narrowing SLP-9's reach
# to string literals, and a buzzword in a shipped identifier is still a tell.
ORIGIN_JSX_TEXT = "jsx_text"
ORIGIN_LITERAL = "literal"
ORIGIN_TEMPLATE_SEGMENT = "template_segment"
ORIGIN_MDX_PROSE = "mdx_prose"
PROP_ORIGIN_PREFIX = "prop:"

# The origins CNT-1's raw-code half can judge. See _check_cnt1_text: measured on
# this repo, giving that half rendered text called the product's own wordmark
# (`components/topbar.tsx:26`, a `<span>TFX</span>`) a raw error code.
RAW_CODE_ORIGINS = {ORIGIN_LITERAL, ORIGIN_MDX_PROSE}

# text: the string to lint, interpolations already removed.
# line/col: 1-based position the string STARTS at, the number that reaches the
#   ERROR line (col is not printed; it is carried so a later AST-based extractor
#   can be checked for parity, and so two hits on one line can be told apart).
# origin: one of the five above.
# segment_index: 0 for a non-template string, else the segment's ordinal.
# starts_literal: True if this text begins its literal, which gates CNT-6's
#   sentence-initial opener so a mid-template segment is not read as a start.
ExtractedString = namedtuple(
    "ExtractedString", "text line col origin segment_index starts_literal")

# Attribute and object-key names whose value is never copy.
NEVER_COPY_ATTRS = {
    "class", "classname", "classlist", "style",
    "key", "id", "htmlfor", "href", "src", "to", "type", "role", "name",
}
# The class/style subset masks in plain code too (`const className = "..."`,
# `{ style: { ... } }`). The rest stay attribute-only, because `name`, `type`
# and `id` are ordinary variable names in code and their values can be copy.
NEVER_COPY_CODE_NAMES = {"class", "classname", "classlist", "style"}
# Props whose string value renders as copy.
RENDERING_PROPS = {
    "title", "label", "aria-label", "aria-braillelabel",
    "aria-brailleroledescription", "aria-description", "aria-placeholder",
    "aria-roledescription", "aria-valuetext", "placeholder", "alt", "description",
    "heading", "subtitle", "caption", "summary", "legend", "tooltip",
    "helpertext", "errormessage", "emptymessage", "confirmlabel", "cancellabel",
}
# Calls whose arguments are class fragments or module paths, masked whole.
MASKED_CALLS = {"cn", "clsx", "classnames", "twmerge", "cva", "require", "import"}
# Keywords after which a string literal is a module path, not copy.
MODULE_PATH_KEYWORDS = {"from", "import"}
# Operators and keywords whose string operand is a value being tested, never
# copy: `tag === "INPUT"`, `case "TEXTAREA":`. Masked like a class value.
COMPARISON_OPERATORS = ("===", "!==", "==", "!=")
COMPARISON_KEYWORDS = {"case"}
# Keywords after which `<` opens an element rather than a comparison or a
# TypeScript generic argument list.
JSX_AFTER_KEYWORDS = {"return", "case", "yield", "await", "else", "do", "typeof"}
# Elements whose content is code, not copy: extracted from, never.
RAW_TEXT_TAGS = {"script", "style"}

_TAG_NAME_RE = re.compile(r"[A-Za-z_$][A-Za-z0-9_$.:-]*")
_ATTR_NAME_RE = re.compile(r"[A-Za-z_$][A-Za-z0-9_$:.-]*")
# A `//` line comment, but not the `//` inside a URL: cutting `href="https://x"`
# in half would leave an unterminated string and desync the scanner.
_LINE_COMMENT_RE = re.compile(r"(?<![:\w])//.*$")

_CODE, _TAG, _TEXT, _TMPL, _MASK = "code", "tag", "text", "tmpl", "mask"


def _is_never_copy_attr(name):
    """
    True if this attribute's value is never copy. Colon-separated forms count
    part by part, so Vue's `:class` / `v-bind:class` and Svelte's `class:active`
    are all class values. `data-*` and most `aria-*` values are identifiers;
    the human-readable ARIA strings in the rendering allowlist remain copy.
    """
    n = name.lower()
    if n in NEVER_COPY_ATTRS:
        return True
    if n in RENDERING_PROPS:
        return False
    if any(part in NEVER_COPY_CODE_NAMES for part in n.split(":")):
        return True
    return n.startswith("data-") or n.startswith("aria-")


def _find_quote_end(line, i):
    """Index just past the quote closing the literal opened at `i`, or -1."""
    quote = line[i]
    k = i + 1
    n = len(line)
    while k < n:
        ch = line[k]
        if ch == "\\":
            k += 2
            continue
        if ch == quote:
            return k + 1
        k += 1
    return -1


def _lookback_word(line, i):
    """The identifier immediately before `i` (whitespace skipped), lowercased."""
    k = i - 1
    while k >= 0 and line[k] in " \t":
        k -= 1
    end = k + 1
    while k >= 0 and (line[k].isalnum() or line[k] in "_$"):
        k -= 1
    return line[k + 1:end].lower()


def _lookback_name(line, i):
    """
    The `name` in `name = <value>` or `name: <value>` ending just before `i`,
    lowercased, or None. `tag === "INPUT"` returns None: an equality operand has
    no name, so it stays a bare literal.
    """
    k = i - 1
    while k >= 0 and line[k] in " \t":
        k -= 1
    if k < 0 or line[k] not in "=:":
        return None
    if line[k] == "=" and k > 0 and line[k - 1] in "=!<>":
        return None
    k -= 1
    while k >= 0 and line[k] in " \t":
        k -= 1
    end = k + 1
    while k >= 0 and (line[k].isalnum() or line[k] in "_$-"):
        k -= 1
    return line[k + 1:end].lower() or None


def _is_comparison_operand(line, start, end):
    """
    True if the literal spanning [start, end) is compared rather than shown:
    `tag === "INPUT"`, `"INPUT" === tag`, or a `case "INPUT":` label. A tested
    value is not copy, whichever side of the operator it sits on.
    """
    before = line[:start].rstrip()
    if before.endswith(COMPARISON_OPERATORS):
        return True
    if _lookback_word(line, start) in COMPARISON_KEYWORDS:
        return True
    return line[end:].lstrip().startswith(COMPARISON_OPERATORS)


def _is_tagged_template(line, i):
    """
    True if the backtick at `i` opens a TAGGED template literal (css`…`,
    styled.div`…`, gql`…`). Its content is a stylesheet or a query, not copy.
    """
    if i == 0:
        return False
    return line[i - 1].isalnum() or line[i - 1] in "_$)]."


def _is_tag_start(line, i):
    """
    True if the `<` at `i` opens an element rather than a comparison or a
    TypeScript generic. An element is `<name`, `</name` or `<>`, and it sits in
    an expression position: at the start of a line, or after `(`, `{`, `[`, `,`,
    `=`, `&&`, `?`, `:`, `=>`, or a keyword that can only be followed by an
    expression. `Map<string, string>`, `a < b` and `<T,>` are none of those.
    """
    n = len(line)
    j = i + 1
    if j >= n:
        return False
    if line[j] != ">":
        if line[j] == "/":
            j += 1
        m = _TAG_NAME_RE.match(line, j)
        if not m:
            return False
        after = line[m.end():m.end() + 1]
        if after and after not in " \t/>\r\n":
            return False
    k = i - 1
    while k >= 0 and line[k] in " \t":
        k -= 1
    if k < 0:
        return True
    if line[k].isalnum() or line[k] in "_$)].":
        return _lookback_word(line, k + 1) in JSX_AFTER_KEYWORDS
    return True


def strip_line_comment(line):
    """Drop a `//` line comment, leaving the `//` of a URL alone."""
    return _LINE_COMMENT_RE.sub("", line)


# ── .css masking ──────────────────────────────────────────────────────────────
# An at-rule's prelude is never prose: a media condition (`orientation:
# landscape`), an `@apply` class list, an `@import` path. Selectors and
# declarations are left alone: a buzzword in a class name is still a tell.
_CSS_AT_RULE_RE = re.compile(r"@[\w-]+[^{;]*")


def mask_css_line(line):
    """Blank every at-rule prelude on a `.css` line, preserving offsets."""
    return _CSS_AT_RULE_RE.sub(lambda m: " " * len(m.group(0)), line)


class UserFacingScanner:
    """
    The mask-and-extract scanner, one instance per file.

    Every construct that decides whether text is copy can wrap across lines in
    formatted source (a `className={cn(` call, a tag's attribute list, a text
    child, a template literal), so the scanner carries state between lines the
    way check_file already carries the block-comment flag. Without that carry,
    Prettier's wrapped `className={cn(` puts each class string on its own line
    and a line-local masker would let every one of them straight back in.

    scan_line() returns the masked line and appends each completed
    ExtractedString to `out`. finish() flushes whatever the last line left open.
    When a line cannot be modelled (an unbalanced quote, a construct the scanner
    does not know), it extracts nothing from the rest of that line and never
    falls back to scanning the whole line: whole-line scanning is the bug.
    """

    def __init__(self):
        self.mode = _CODE
        self.stack = []          # (mode to return to, its open-brace count)
        self.braces = 0
        self.mask = None         # {"kind", "depth", "quote", "return"} or None
        self.jsx_depth = 0
        self.tag_closing = False
        self.tag_name = None
        self.raw_text = None     # inside <script>/<style>: mask from extraction
        self.text = None         # open text child
        self.run = 0             # that text child's ordinal within its element
        self.tmpl = None         # open template literal
        self.attr = None         # attribute name whose value comes next
        self._chars = []

    # ── Per-line entry point ──────────────────────────────────────────────────

    def scan_line(self, line, lineno, out):
        self._chars = list(line)
        i = 0
        n = len(line)
        while i < n:
            if self.mode == _MASK:
                i = self._step_mask(line, i)
            elif self.mode == _TMPL:
                i = self._step_template(line, lineno, i, out)
            elif self.mode == _TEXT:
                i = self._step_text(line, lineno, i, out)
            elif self.mode == _TAG:
                i = self._step_tag(line, lineno, i, out)
            else:
                i = self._step_code(line, lineno, i, out)
        if self.text is not None:
            self.text["parts"].append(" ")
        return "".join(self._chars)

    def finish(self, out):
        """Flush a text child or template literal still open at end of file."""
        self._flush_text(out)
        self._flush_template(out)

    # ── Masking ───────────────────────────────────────────────────────────────

    def _mask_range(self, start, end):
        for k in range(start, min(end, len(self._chars))):
            self._chars[k] = " "

    def _enter_mask(self, kind, i):
        self.mask = {"kind": kind, "depth": 1, "quote": None, "return": self.mode}
        self.mode = _MASK
        self._chars[i] = " "

    def _step_mask(self, line, i):
        m = self.mask
        n = len(line)
        while i < n:
            ch = line[i]
            self._chars[i] = " "
            if ch == "\\":
                self._mask_range(i, i + 2)
                i += 2
                continue
            if m["quote"]:
                if ch == m["quote"]:
                    m["quote"] = None
                i += 1
                continue
            if m["kind"] == "template":
                if ch == "`":
                    self.mode = m["return"]
                    self.mask = None
                    return i + 1
                i += 1
                continue
            if ch in "\"'`":
                m["quote"] = ch
                i += 1
                continue
            opener, closer = ("(", ")") if m["kind"] == "paren" else ("{", "}")
            if ch == opener:
                m["depth"] += 1
            elif ch == closer:
                m["depth"] -= 1
                if m["depth"] <= 0:
                    self.mode = m["return"]
                    self.mask = None
                    return i + 1
            i += 1
        return n

    # ── Code ──────────────────────────────────────────────────────────────────

    def _step_code(self, line, lineno, i, out):
        ch = line[i]
        n = len(line)
        if ch in "\"'":
            end = _find_quote_end(line, i)
            if end == -1:
                return n
            name = _lookback_name(line, i)
            if ((name and name in NEVER_COPY_CODE_NAMES)
                    or _lookback_word(line, i) in MODULE_PATH_KEYWORDS
                    or _is_comparison_operand(line, i, end)):
                self._mask_range(i, end)
            else:
                origin = (PROP_ORIGIN_PREFIX + name
                          if name in RENDERING_PROPS else ORIGIN_LITERAL)
                self._add(out, line[i + 1:end - 1], lineno, i + 2, origin)
            return end
        if ch == "`":
            if _is_tagged_template(line, i):
                self._enter_mask("template", i)
                return i + 1
            self.stack.append((_CODE, self.braces))
            self.braces = 0
            self.mode = _TMPL
            self.tmpl = {"segments": [], "index": 0, "current": None}
            return i + 1
        if ch == "(":
            if _lookback_word(line, i) in MASKED_CALLS:
                self._enter_mask("paren", i)
                return i + 1
            return i + 1
        if ch == "{":
            name = _lookback_name(line, i)
            if name and name in NEVER_COPY_CODE_NAMES:
                self._enter_mask("brace", i)
                return i + 1
            self.braces += 1
            return i + 1
        if ch == "}":
            if self.braces > 0:
                self.braces -= 1
            elif self.stack:
                self.mode, self.braces = self.stack.pop()
            return i + 1
        if ch == "<" and _is_tag_start(line, i):
            self._enter_tag(line, i)
            return i + (2 if self.tag_closing else 1)
        return i + 1

    # ── Tags ──────────────────────────────────────────────────────────────────

    def _enter_tag(self, line, i):
        self.mode = _TAG
        self.tag_closing = line[i + 1:i + 2] == "/"
        self.tag_name = None
        self.attr = None

    def _step_tag(self, line, lineno, i, out):
        ch = line[i]
        n = len(line)
        if ch == ">":
            self._close_tag(line, i)
            return i + 1
        if ch in "\"'":
            end = _find_quote_end(line, i)
            if end == -1:
                return n
            self._take_attr_value(out, line[i + 1:end - 1], lineno, i + 2)
            self._mask_if_never_copy(i, end)
            self.attr = None
            return end
        if ch == "`":
            if self.attr and _is_never_copy_attr(self.attr):
                self._enter_mask("template", i)
                self.attr = None
                return i + 1
            self.stack.append((_TAG, self.braces))
            self.braces = 0
            self.mode = _TMPL
            self.tmpl = {"segments": [], "index": 0, "current": None}
            self.attr = None
            return i + 1
        if ch == "{":
            if self.attr and _is_never_copy_attr(self.attr):
                self._enter_mask("brace", i)
                self.attr = None
                return i + 1
            self.stack.append((_TAG, self.braces))
            self.braces = 0
            self.mode = _CODE
            self.attr = None
            return i + 1
        m = _ATTR_NAME_RE.match(line, i)
        if m:
            name = m.group(0)
            if self.tag_name is None:
                self.tag_name = name.lower()
            else:
                self.attr = name
                if ":" in name and _is_never_copy_attr(name):
                    # Svelte's `class:active` carries the class in the name.
                    self._mask_range(m.start(), m.end())
            return m.end()
        return i + 1

    def _mask_if_never_copy(self, start, end):
        if self.attr and _is_never_copy_attr(self.attr):
            self._mask_range(start, end)

    def _take_attr_value(self, out, text, lineno, col):
        name = (self.attr or "").lower()
        if name and _is_never_copy_attr(name):
            return
        origin = (PROP_ORIGIN_PREFIX + name
                  if name in RENDERING_PROPS else ORIGIN_LITERAL)
        self._add(out, text, lineno, col, origin)

    def _close_tag(self, line, i):
        self_closing = line[:i].rstrip().endswith("/")
        if self.tag_closing:
            self.jsx_depth = max(0, self.jsx_depth - 1)
            if self.raw_text and self.tag_name == self.raw_text:
                self.raw_text = None
        elif not self_closing:
            self.jsx_depth += 1
            if self.tag_name in RAW_TEXT_TAGS:
                self.raw_text = self.tag_name
        # A JSX element can itself sit inside a `{...}` expression. After its
        # closing tag, resume that expression until its closing brace instead
        # of treating callback punctuation such as `))}` as rendered text.
        # The stack is non-empty only for an expression entered from text, a
        # tag attribute, or a template interpolation.
        self.mode = _CODE if self.stack else (_TEXT if self.jsx_depth > 0 else _CODE)
        self.run = 0
        self.attr = None

    # ── Text children ─────────────────────────────────────────────────────────

    def _step_text(self, line, lineno, i, out):
        n = len(line)
        j = i
        while j < n and line[j] not in "<{}":
            j += 1
        chunk = line[i:j]
        if self.raw_text is None and (chunk.strip() or self.text is not None):
            self._append_text(chunk, lineno, i)
        if j >= n:
            return n
        ch = line[j]
        if ch == "<":
            self._flush_text(out)
            self._enter_tag(line, j)
            return j + (2 if self.tag_closing else 1)
        if ch == "{":
            self._flush_text(out)
            self.run += 1
            self.stack.append((_TEXT, self.braces))
            self.braces = 0
            self.mode = _CODE
            return j + 1
        if self.stack:
            self.mode, self.braces = self.stack.pop()
        return j + 1

    def _append_text(self, chunk, lineno, col):
        if self.text is None:
            lead = len(chunk) - len(chunk.lstrip())
            self.text = {"parts": [], "line": lineno, "col": col + lead + 1,
                         "index": self.run}
        self.text["parts"].append(chunk)

    def _flush_text(self, out):
        buf = self.text
        self.text = None
        if buf is None:
            return
        self._add(out, "".join(buf["parts"]), buf["line"], buf["col"],
                  ORIGIN_JSX_TEXT, starts_literal=buf["index"] == 0)

    # ── Template literals ─────────────────────────────────────────────────────

    def _step_template(self, line, lineno, i, out):
        n = len(line)
        j = i
        while j < n:
            ch = line[j]
            if ch == "\\":
                j += 2
                continue
            if ch == "`":
                self._append_segment(line[i:j], lineno, i)
                self._flush_template(out)
                self.mode, self.braces = self.stack.pop()
                return j + 1
            if ch == "$" and line[j + 1:j + 2] == "{":
                self._append_segment(line[i:j], lineno, i)
                self._close_segment()
                self.stack.append((_TMPL, self.braces))
                self.braces = 0
                self.mode = _CODE
                return j + 2
            j += 1
        self._append_segment(line[i:n], lineno, i)
        return n

    def _append_segment(self, chunk, lineno, col):
        t = self.tmpl
        if t is None:
            return
        if t["current"] is None:
            if not chunk:
                return
            lead = len(chunk) - len(chunk.lstrip())
            t["current"] = {"parts": [], "line": lineno, "col": col + lead + 1,
                            "index": t["index"]}
        t["current"]["parts"].append(chunk)

    def _close_segment(self):
        t = self.tmpl
        if t is None:
            return
        if t["current"] is not None:
            t["segments"].append(t["current"])
            t["current"] = None
        t["index"] += 1

    def _flush_template(self, out):
        t = self.tmpl
        if t is None:
            return
        self._close_segment()
        self.tmpl = None
        for seg in t["segments"]:
            self._add(out, "".join(seg["parts"]), seg["line"], seg["col"],
                      ORIGIN_TEMPLATE_SEGMENT, segment_index=seg["index"],
                      starts_literal=seg["index"] == 0)

    # ── Collection ────────────────────────────────────────────────────────────

    def _add(self, out, text, lineno, col, origin, segment_index=0,
             starts_literal=True):
        text = re.sub(r"\s+", " ", text).strip()
        if len(text) < 2:
            return
        out.append(ExtractedString(text, lineno, col, origin, segment_index,
                                   starts_literal))


def check_file(filepath, lists=None, phrase_res=None, word_res=None, device_re=None,
               cnt6_res=None, cnt13_res=None):
    """
    Scan a single file and return a list of error / note strings.
    `lists`/`phrase_res`/`word_res`/`device_re`/`cnt6_res`/`cnt13_res` are
    precomputed by scan_paths; if omitted they are built here (so check_file works
    standalone in tests). Each ERROR string:
    ERROR <file>:<line> [CTL-ID] <found> — suggest: <...>
    """
    errors = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in TARGET_EXTENSIONS:
        return errors

    if lists is None:
        lists, _used_fallback, _note = load_slp9_lists()
    if word_res is None:
        word_res = {
            "buzzwords": _build_word_regex(lists["buzzwords"]),
            "ai_vocab": _build_word_regex(lists["ai_vocab"]),
        }
    if phrase_res is None:
        phrase_res = {
            "filler": _build_phrase_regex(lists["filler"]),
            "chatbot": _build_phrase_regex(lists["chatbot"]),
        }
    if device_re is None:
        device_verbs, _dv_fallback, _dv_note = load_cnt5_verbs()
        device_re = _build_word_regex(device_verbs)
    if cnt6_res is None:
        cnt6_lists, _c6_fallback, _c6_note = load_cnt6_lists()
        cnt6_res = _build_cnt6_res(cnt6_lists)
    if cnt13_res is None:
        cnt13_lists, _c13_fallback, _c13_note = load_cnt13_lists()
        cnt13_res = _build_cnt13_res(cnt13_lists)

    try:
        with open(filepath, encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()
    except OSError as exc:
        errors.append(f"ERROR {filepath}: cannot read file — {exc}")
        return errors

    rel = os.path.relpath(filepath)
    in_block_comment = False
    is_md = ext in MARKDOWN_EXTENSIONS
    is_scanned = ext in SCANNED_EXTENSIONS
    scanner = UserFacingScanner() if is_scanned else None
    # (line, message) pairs, sorted by line before returning: a text child or
    # template literal that wraps across lines is only complete on a later line,
    # but the finding it produces names the line the text starts on.
    records = []

    def emitter(at_line):
        def emit(ctl_id, found, suggest):
            records.append(
                (at_line, checklib.emit_error(rel, at_line, ctl_id, found, suggest)))
        return emit

    def check_extracted(extracted):
        for es in extracted:
            if not _looks_user_facing(es.text):
                continue
            if es.origin == ORIGIN_LITERAL and _is_interpolated(es.text):
                continue  # unresolvable, out of static reach, do not flag
            at = emitter(es.line)
            _check_cnt3_text(es.text, at)
            _check_cnt1_text(es.text, es.line, lines, at, es.origin)
            _check_cnt5_text(es.text, at, device_re)
            _check_cnt6_text(es.text, at, cnt6_res, es.starts_literal)
            _check_cnt13_text(es.text, at, cnt13_res)

    for lineno, raw_line in enumerate(lines, start=1):
        line = raw_line.rstrip("\n")
        emit = emitter(lineno)

        # ── Strip comments so comment text is not flagged ─────────────────────
        scan_line = checklib.strip_block_comments(line, in_block_comment)
        in_block_comment = checklib.ends_in_block_comment(line, in_block_comment)
        scan_line = re.sub(r"<!--.*?-->", "", scan_line)
        if ext in LINE_COMMENT_EXTENSIONS:
            scan_line = strip_line_comment(scan_line)

        # ── Pass 1 and 2: mask what is never copy, extract what is ────────────
        extracted = []
        if is_scanned:
            scan_line = scanner.scan_line(scan_line, lineno, extracted)
        elif ext == ".css":
            scan_line = mask_css_line(scan_line)

        # In Markdown, skip fenced-code and heading-marker noise for word counts,
        # but still scan prose for SLP-9 tokens.
        stripped = scan_line.strip()

        # ── SLP-9 lint half (line-local, on the comment-stripped line) ────────
        # In Markdown, inline-code spans are quoted example material (a guideline
        # listing `In order to` as a banned phrase is teaching, not using it) —
        # SLP-9's own Do-not-flag calibration exempts quoted examples, so the
        # word/phrase scans skip code spans on md/mdx. Code files scan in full:
        # a buzzword in a shipped string literal is still a tell.
        slp_scan = re.sub(r"`[^`]*`", "", scan_line) if is_md else scan_line
        if word_res["buzzwords"]:
            m = word_res["buzzwords"].search(slp_scan)
            if m:
                emit("SLP-9", f'buzzword "{m.group(0)}"',
                     "say what the thing does, in plain language")
        if word_res["ai_vocab"]:
            m = word_res["ai_vocab"].search(slp_scan)
            if m:
                emit("SLP-9", f'AI-vocabulary word "{m.group(0)}"',
                     "use a plainer word")
        if phrase_res["filler"]:
            m = phrase_res["filler"].search(slp_scan)
            if m:
                emit("SLP-9", f'filler phrase "{m.group(0).strip()}"',
                     "cut it — say the thing directly")
        if phrase_res["chatbot"]:
            m = phrase_res["chatbot"].search(slp_scan)
            if m:
                emit("SLP-9", f'chatbot artifact "{m.group(0).strip()}"',
                     "remove conversational filler from UI copy")
        # Em-dash chain: 2+ em dashes within a single sentence on this line.
        # SLP-9 explicitly does NOT flag structural dashes in headings, table
        # cells, and labels — so skip markdown table rows (lines starting "|"),
        # which hold one dash per cell, not an em-dash chain in prose.
        if not (is_md and stripped.startswith("|")):
            for sentence in _split_sentences(scan_line):
                if sentence.count(EM_DASH) >= 2:
                    emit("SLP-9",
                         f"{sentence.count(EM_DASH)} em dashes in one sentence",
                         "use sentence structure, not a chain of em-dash clauses")
                    break

        # ── CNT-3 / CNT-1: user-facing text ──────────────────────────────────
        if is_md:
            # MDX/MD prose line: skip headings, code fences, list/table markup,
            # import/export lines, JSX-only lines, and front-matter.
            if (not stripped
                    or stripped.startswith(("#", "```", "import ", "export ",
                                            "<", "|", ":::", "---"))):
                pass
            else:
                # Treat the whole prose line as text for sentence-length.
                prose = re.sub(r"`[^`]*`", "", scan_line)  # drop inline code
                # Strip list/blockquote markers so anchored checks (CNT-6
                # openers, CNT-1) see the sentence start: "- ", "* ", "+ ",
                # "1. ", "> " — repeated for nested "> - " forms.
                prose = re.sub(r"^(?:\s*(?:[-*+]|\d{1,3}[.)]|>)\s+)+", "", prose)
                _check_cnt3_text(prose, emit)
                _check_cnt1_text(prose.strip(), lineno, lines, emit)
                _check_cnt5_text(prose, emit, device_re)
                _check_cnt6_text(prose, emit, cnt6_res)
                _check_cnt13_text(prose, emit, cnt13_res)
        else:
            check_extracted(extracted)

    if scanner is not None:
        tail = []
        scanner.finish(tail)
        check_extracted(tail)

    errors.extend(msg for _, msg in sorted(records, key=lambda r: r[0]))
    return errors


def _looks_user_facing(s):
    """Conservative: is this literal plausibly user-facing prose, not a path/key?"""
    if "/" in s or "\\" in s:
        return False
    if s.startswith(("http", "#", ".", "@", "--", "data:")):
        return False
    if not re.search(r"[A-Za-z]", s):
        return False
    # A path-like or class-like token with no spaces and lots of dashes/colons.
    if " " not in s and (s.count("-") >= 1 or ":" in s) and not s.endswith((".", "!", "?")):
        # could be a className or token — but a single error code is handled by
        # CNT-1 separately; allow short all-caps codes through to CNT-1.
        if not RAW_CODE_RE.match(s):
            return False
    # Coordinate / matrix data, not prose: an SVG path-data string, transform
    # matrix, or viewBox is dominated by numeric tokens. Real prose is mostly
    # alphabetic words. If most space-separated tokens carry no letters, it's
    # data — out of static reach for CNT, do not flag. (Conservative widen for
    # generated icon/path files; see "What this does NOT verify".)
    tokens = s.split()
    if len(tokens) >= 4:
        wordy = sum(1 for t in tokens if re.search(r"[A-Za-z]{2,}", t))
        if wordy * 2 < len(tokens):
            return False
    return True


def _check_cnt3_text(text, emit):
    """CNT-3: flag a sentence longer than 25 words."""
    for sentence in _split_sentences(text):
        n = _word_count(sentence)
        if n > 25:
            emit("CNT-3", f"sentence of {n} words (> 25)",
                 "split into shorter sentences")
            return


def _check_cnt5_text(text, emit, device_re):
    """
    CNT-5: flag a device-bound action verb (click/tap/swipe) inside user-facing
    copy. Scoped to multi-word strings so bare event names / identifiers ("click"
    as an addEventListener arg, an `onClick` prop) are not flagged — those are code,
    not copy. "press" and "see" are deliberately left to the evaluator (they collide
    with innocent prose); the lint covers only the unambiguous verbs.
    """
    if device_re is None:
        return
    if len(text.split()) < 2:
        return
    m = device_re.search(text)
    if m:
        emit("CNT-5", f'device-bound verb "{m.group(0)}"',
             'name the action, not the device — use "choose", "select", or "view"')


def _check_cnt6_text(text, emit, cnt6_res, starts_literal=True):
    """
    CNT-6: flag low-informational-value words in user-facing copy — an empty
    opener at the START of a sentence ("There is", "There are", "It is",
    "This is"), or a safe-subset filler word (just, really, very, please) at any
    position. Scoped to multi-word strings, like CNT-5, so identifiers are not
    flagged. The harder calls (such/that/articles, the clarity exception) are the
    evaluator's; "in order to" is SLP-9's.

    `starts_literal` is False for a template segment that follows an ${…}
    interpolation: its first sentence continues one that started before the
    interpolation, so it is not a sentence start and the opener rule skips it.
    Later sentences in the same segment are real sentence starts and are checked.
    """
    if cnt6_res is None:
        return
    if len(text.split()) < 2:
        return
    if cnt6_res["openers"]:
        for index, sentence in enumerate(_split_sentences(text)):
            if index == 0 and not starts_literal:
                continue
            m = cnt6_res["openers"].match(sentence.strip())
            if m:
                emit("CNT-6", f'empty opener "{m.group(0)}"',
                     "start with the point of the sentence, unless clarity suffers")
                break
    if cnt6_res["filler"]:
        m = cnt6_res["filler"].search(text)
        if m:
            emit("CNT-6", f'filler word "{m.group(0)}"',
                 "cut it if the sentence reads the same without it")


def _check_cnt13_text(text, emit, cnt13_res):
    """
    CNT-13: flag a US spelling or common misspelling in user-facing copy and
    suggest the British / correct form. Scoped to multi-word strings, like CNT-5
    and CNT-6, so a bare one-word identifier in code ("color" as a prop value) is
    not flagged — a single-word label is left to the evaluator. Contextual typos
    and homophones (their/there, form/from) are the evaluator's half.
    """
    if cnt13_res is None or not cnt13_res["regex"]:
        return
    if len(text.split()) < 2:
        return
    m = cnt13_res["regex"].search(text)
    if m:
        found = m.group(0)
        right = cnt13_res["map"].get(found.lower(), "the British / correct spelling")
        emit("CNT-13", f'spelling "{found}"', f'use "{right}"')


def _check_cnt1_text(text, lineno, all_lines, emit, origin=ORIGIN_MDX_PROSE):
    """
    CNT-1: flag a user-facing string that is ONLY a raw error code, or the bare
    "Something went wrong" with no actionable next step on this or the next line.
    Conservative — when unsure, do not flag.

    The raw-code half runs on the origins where "this string is nothing but a
    code" is decidable: a bare string literal and an MDX prose line. It does not
    run on rendered text, a rendering prop or a template segment, where an
    all-caps token is as likely a wordmark, a badge or an acronym as a code.
    The bare-"Something went wrong" half is unambiguous prose and runs on every
    origin.
    """
    t = text.strip().strip('.!')
    if not t:
        return
    # Raw-code-only string.
    if RAW_CODE_RE.match(t):
        if origin in RAW_CODE_ORIGINS:
            emit("CNT-1", f'raw error code "{t}" as primary copy',
                 "say what happened and what to do next")
        return
    # Bare "Something went wrong" with no next step on this or the next line.
    if re.match(r"^something went wrong", text.strip(), re.IGNORECASE):
        same = NEXT_STEP_VERB_RE.search(text)
        nxt = ""
        if lineno < len(all_lines):
            nxt = all_lines[lineno]  # 0-based index lineno = next 1-based line
        following = NEXT_STEP_VERB_RE.search(nxt) if nxt else None
        if not same and not following:
            emit("CNT-1", '"Something went wrong" with no next step',
                 "tell the teacher what happened and what to do next")


def scan_paths(paths):
    """Walk the given paths and collect all violations. Prints the fallback NOTE
    once if the SLP-9 lists could not be read from slp-9.md."""
    lists, used_fallback, note = load_slp9_lists()
    if used_fallback and note:
        print(note)
    device_verbs, dv_fallback, dv_note = load_cnt5_verbs()
    if dv_fallback and dv_note:
        print(dv_note)
    cnt6_lists, c6_fallback, c6_note = load_cnt6_lists()
    if c6_fallback and c6_note:
        print(c6_note)
    cnt13_lists, c13_fallback, c13_note = load_cnt13_lists()
    if c13_fallback and c13_note:
        print(c13_note)
    word_res = {
        "buzzwords": _build_word_regex(lists["buzzwords"]),
        "ai_vocab": _build_word_regex(lists["ai_vocab"]),
    }
    phrase_res = {
        "filler": _build_phrase_regex(lists["filler"]),
        "chatbot": _build_phrase_regex(lists["chatbot"]),
    }
    device_re = _build_word_regex(device_verbs)
    cnt6_res = _build_cnt6_res(cnt6_lists)
    cnt13_res = _build_cnt13_res(cnt13_lists)

    all_errors = []
    for kind, val in checklib.iter_target_files(paths, TARGET_EXTENSIONS):
        if kind == "missing":
            print(f"ERROR content-lint: path not found: {val}")
            all_errors.append(f"ERROR content-lint: path not found: {val}")
        else:
            all_errors.extend(
                check_file(val, lists, phrase_res, word_res, device_re, cnt6_res,
                           cnt13_res))
    return all_errors


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    """
    Embedded self-test. Prints SELF-TEST OK (N cases) and exits 0 on success, or
    prints failures and exits 1.
    """
    import tempfile

    # Use the live lists (so the loader path is exercised); fall back is fine.
    lists, used_fallback, note = load_slp9_lists()
    word_res = {
        "buzzwords": _build_word_regex(lists["buzzwords"]),
        "ai_vocab": _build_word_regex(lists["ai_vocab"]),
    }
    phrase_res = {
        "filler": _build_phrase_regex(lists["filler"]),
        "chatbot": _build_phrase_regex(lists["chatbot"]),
    }
    device_verbs, _dv_fallback, _dv_note = load_cnt5_verbs()
    device_re = _build_word_regex(device_verbs)
    cnt6_lists, _c6_fallback, _c6_note = load_cnt6_lists()
    cnt6_res = _build_cnt6_res(cnt6_lists)
    cnt13_lists, _c13_fallback, _c13_note = load_cnt13_lists()
    cnt13_res = _build_cnt13_res(cnt13_lists)

    failures = []
    case_count = 0

    def run(content, ext):
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            errs = check_file(tf.name, lists, phrase_res, word_res, device_re,
                              cnt6_res, cnt13_res)
        os.unlink(tf.name)
        return errs

    def assert_violations(name, content, ext, expected_ctl_ids):
        nonlocal case_count
        case_count += 1
        errs = run(content, ext)
        found = []
        for e in errs:
            m = re.search(r"\[([A-Z0-9-]+)\]", e)
            if m:
                found.append(m.group(1))
        for ctl in expected_ctl_ids:
            if ctl not in found:
                failures.append(f"FAIL {name}: expected [{ctl}] — got: {errs}")

    def assert_clean(name, content, ext):
        nonlocal case_count
        case_count += 1
        errs = run(content, ext)
        if errs:
            failures.append(f"FAIL {name}: expected no violations — got: {errs}")

    def assert_finding(name, content, ext, want):
        """
        Assert one exact finding, as "<line> [<CTL-ID>] <found>". Line-sensitive
        cases need this: a finding on a wrapped attribute, a text child spanning
        lines, or a multi-line template literal must name the line the offending
        text starts on, and a control id alone would not catch a wrong line.
        """
        nonlocal case_count
        case_count += 1
        got = [
            re.sub(r"^ERROR [^ ]*:", "", e).split(" — suggest:")[0]
            for e in run(content, ext)
        ]
        if want not in got:
            failures.append(f"FAIL {name}: want: {want!r}; got: {got!r}")

    # ── SLP-9 cases ───────────────────────────────────────────────────────────
    assert_violations(
        "SLP-9: buzzword hit",
        "Effortlessly streamline your workflow",
        ".mdx", ["SLP-9"],
    )
    assert_violations(
        "SLP-9: em-dash chain",
        "Supercharge — effortlessly — seamlessly — at scale.",
        ".mdx", ["SLP-9"],
    )
    assert_violations(
        "SLP-9: filler phrase",
        "In order to save your marks, press submit.",
        ".mdx", ["SLP-9"],
    )
    assert_violations(
        "SLP-9: chatbot artifact",
        "Great question! Here is your class list.",
        ".mdx", ["SLP-9"],
    )
    assert_violations(
        "SLP-9: AI-vocabulary word",
        "We delve into the data here.",
        ".mdx", ["SLP-9"],
    )
    assert_clean(
        "SLP-9: clean copy",
        "Save marks. Marks are saved as a draft until you submit.",
        ".mdx",
    )
    assert_clean(
        "SLP-9: commented-out buzzword not flagged (block comment)",
        "const x = 1; /* supercharge effortlessly */",
        ".tsx",
    )
    assert_clean(
        "SLP-9: commented-out buzzword not flagged (line comment)",
        "// supercharge your effortless seamless workflow",
        ".tsx",
    )
    assert_clean(
        "SLP-9: single em dash is fine",
        "Centre optically — not mathematically.",
        ".mdx",
    )
    assert_clean(
        "SLP-9: em dashes in a markdown table row are structural, not a chain",
        "| **4 — Orchestrate** | Hand over outcomes | — |",
        ".mdx",
    )
    assert_clean(
        "SLP-9: banned phrase quoted in md inline code is teaching, not usage",
        "Cut filler phrases like `In order to` and buzzwords like `streamline`.",
        ".mdx",
    )
    assert_violations(
        "SLP-9: buzzword in a code string literal still flags",
        'const tagline = "Streamline your marking";',
        ".tsx", ["SLP-9"],
    )

    # ── CNT-3 cases ───────────────────────────────────────────────────────────
    long_sentence = ("This sentence has way more than twenty five words in it "
                     "because we keep adding more and more filler words just to "
                     "push the count well past the documented limit now okay.")
    assert_violations("CNT-3: 30+ word sentence (mdx)", long_sentence, ".mdx", ["CNT-3"])
    assert_violations(
        "CNT-3: long sentence in a string literal (tsx)",
        f'const msg = "{long_sentence}";',
        ".tsx", ["CNT-3"],
    )
    assert_clean("CNT-3: 10-word sentence (mdx)",
                 "This short sentence stays well under the documented limit.", ".mdx")
    assert_clean(
        "CNT-3: mid-dot-separated fragments are not one long sentence",
        "**Don't:** corporate flat-pack style · cartoonish proportions · sharp "
        "aggressive angles · neon or harsh colours · hand-coded SVG mascots as "
        "fallbacks (ship no illustration rather than a sketchy one).",
        ".mdx",
    )
    assert_clean(
        "CNT-3: SVG path-data string is coordinate data, not prose",
        '<path d="M16.17 7.68 C15.71 9.19 15.41 10.50 14.52 13.12 M14.44 13.17 '
        'C14.10 14.10 13.69 14.32 13.42 14.10 M13.14 14.50 C12.16 14.82" />',
        ".tsx",
    )

    # ── CNT-1 cases ───────────────────────────────────────────────────────────
    assert_violations(
        "CNT-1: raw-code-only string",
        'const err = "ERR_SYNC_500";',
        ".tsx", ["CNT-1"],
    )
    assert_clean(
        "CNT-1: code with a next step is clean",
        'const err = "Sync failed. Try again in a minute.";',
        ".tsx",
    )
    assert_violations(
        "CNT-1: bare 'Something went wrong' no next step",
        'const err = "Something went wrong.";',
        ".tsx", ["CNT-1"],
    )
    assert_clean(
        "CNT-1: 'Something went wrong' with a next step",
        'const err = "Something went wrong. Refresh the page to retry.";',
        ".tsx",
    )

    # ── CNT-5 cases ─────────────────────────────────────────────────────────────
    assert_violations(
        "CNT-5: 'click here' in MDX prose",
        "Click here to view your class list.",
        ".mdx", ["CNT-5"],
    )
    assert_violations(
        "CNT-5: device verb in a string literal",
        'const cta = "Tap to continue";',
        ".tsx", ["CNT-5"],
    )
    assert_violations(
        "CNT-5: inflected device verb (swiping) in prose",
        "Keep swiping to see the rest of the term.",
        ".mdx", ["CNT-5"],
    )
    assert_clean(
        "CNT-5: device-agnostic verb is fine",
        "Choose a class to begin.",
        ".mdx",
    )
    assert_clean(
        "CNT-5: bare event-name identifier is not copy",
        'element.addEventListener("click", handler);',
        ".tsx",
    )
    assert_clean(
        "CNT-5: onClick prop is code, not copy",
        "<button onClick={submit}>Save marks</button>",
        ".tsx",
    )

    # ── CNT-6 cases ─────────────────────────────────────────────────────────────
    assert_violations(
        "CNT-6: sentence-initial empty opener",
        "There is a problem with your form.",
        ".mdx", ["CNT-6"],
    )
    assert_violations(
        "CNT-6: filler words in prose",
        "Enter your postal code to really get started.",
        ".mdx", ["CNT-6"],
    )
    assert_violations(
        "CNT-6: filler word in a string literal",
        'const msg = "Just enter your postal code to finish";',
        ".tsx", ["CNT-6"],
    )
    assert_clean(
        "CNT-6: clean copy",
        "Enter your postal code to finish.",
        ".mdx",
    )
    assert_clean(
        "CNT-6: opener words mid-sentence are not flagged",
        "We saved the draft where it is safe.",
        ".mdx",
    )
    assert_clean(
        "CNT-6: opener/filler examples in inline code are not flagged",
        "- Empty openers (e.g. `There is`) and filler (e.g. `just`, `really`)",
        ".mdx",
    )
    assert_violations(
        "CNT-6: empty opener behind a bullet marker",
        "- There is a problem with your form.",
        ".mdx", ["CNT-6"],
    )
    assert_violations(
        "CNT-6: empty opener behind a blockquote marker",
        "> There is a delay.",
        ".mdx", ["CNT-6"],
    )
    assert_violations(
        "CNT-6: empty opener behind a numbered-list marker",
        "1. There is one step.",
        ".mdx", ["CNT-6"],
    )
    assert_clean(
        "CNT-6: clean bulleted copy stays clean",
        "- Choose a class to continue.",
        ".mdx",
    )
    assert_clean(
        "CNT-6: front-matter rule (---) is still skipped, not stripped into a marker",
        "---",
        ".mdx",
    )

    # ── CNT-13 cases ────────────────────────────────────────────────────────────
    assert_violations(
        "CNT-13: US spelling in prose",
        "Choose a color for the class label.",
        ".mdx", ["CNT-13"],
    )
    assert_violations(
        "CNT-13: US -ize spelling in prose",
        "Organize your marks before the term ends.",
        ".mdx", ["CNT-13"],
    )
    assert_violations(
        "CNT-13: common misspelling in prose",
        "You will recieve a confirmation shortly.",
        ".mdx", ["CNT-13"],
    )
    assert_violations(
        "CNT-13: US spelling in a string literal",
        'const label = "Center the panel";',
        ".tsx", ["CNT-13"],
    )
    assert_clean(
        "CNT-13: British spelling is fine",
        "Organise your marks and centre the panel.",
        ".mdx",
    )
    assert_clean(
        "CNT-13: US spelling quoted in inline code is teaching, not usage",
        "Prefer `colour` over `color` in copy.",
        ".mdx",
    )

    # ── Scope: a class value is never linted as prose ──────────────────────────
    # Each of these reported a finding before the mask-and-extract passes landed.
    assert_clean(
        "SCOPE: a Tailwind variant prefix in a class value is not prose",
        '<p className="text-center landscape:text-left">Marks saved.</p>',
        ".tsx",
    )
    assert_clean(
        "SCOPE: an arbitrary-value class does not fire a spelling rule",
        '<div className="bg-[color:var(--tw-blue)]" />',
        ".tsx",
    )
    assert_clean(
        "SCOPE: class strings in a cn() call are class fragments, not copy",
        'const c = cn("please-tight just-in", isWide && "landscape:gap-4");',
        ".tsx",
    )
    assert_clean(
        "SCOPE: a long class value is not counted as a sentence",
        '<div className={cn("z-50 inline-flex w-fit max-w-xs items-center gap-1.5 '
        'rounded-md bg-foreground px-3 py-1.5 text-xs text-background '
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 '
        'data-[state=delayed-open]:animate-in data-open:fade-in-0 data-open:zoom-in-95 '
        'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", '
        'className)} />',
        ".tsx",
    )
    assert_clean(
        "SCOPE: a class value wrapped across lines stays masked",
        "export function Panel({ extra }: { extra?: string }) {\n"
        "  return (\n"
        "    <div className={cn(\n"
        '      "flex items-center landscape:text-left please-tight",\n'
        "      extra\n"
        "    )}>\n"
        "      <span>Marks saved.</span>\n"
        "    </div>\n"
        "  );\n"
        "}\n",
        ".tsx",
    )
    assert_clean(
        "SCOPE: a style value is CSS, not copy",
        'const wrapper = { style: "text-align: center; color: red" };',
        ".ts",
    )
    assert_clean(
        "SCOPE: a tagged template literal is a stylesheet, not copy",
        "const s = css`color: red; text-align: center;`;",
        ".tsx",
    )
    assert_clean(
        "SCOPE: non-rendering attribute values are identifiers, not copy",
        '<input type="text-center landscape:text-left" id="center the panel" />',
        ".tsx",
    )
    assert_clean(
        "SCOPE: an HTML class attribute is never linted either",
        '<div class="landscape:text-left">Marks saved.</div>',
        ".html",
    )
    assert_clean(
        "SCOPE: a Svelte class: directive carries the class in its name",
        "<div class:landscape={wide}>Marks saved.</div>",
        ".svelte",
    )
    assert_clean(
        "SCOPE: a CSS at-rule prelude is a condition, not copy",
        "@media (orientation: landscape) {\n  .a { color: red; }\n}\n",
        ".css",
    )
    assert_clean(
        "SCOPE: an @apply class list is not copy",
        ".a {\n  @apply text-center landscape:text-left;\n}\n",
        ".css",
    )
    assert_clean(
        "SCOPE: inline script content in HTML is code, not copy",
        '<script>\nconst m = "There is a problem here.";\n</script>',
        ".html",
    )

    # ── Scope: CNT-1's raw-code half ───────────────────────────────────────────
    assert_clean(
        "SCOPE: a DOM comparison literal is not error copy",
        'const isTyping = tag === "INPUT" || tag === "TEXTAREA";',
        ".tsx",
    )
    assert_clean(
        "SCOPE: a comparison reads the same with the literal on the left",
        'const isTyping = "INPUT" === tag;',
        ".tsx",
    )
    assert_clean(
        "SCOPE: a switch case label is a tested value, not error copy",
        'switch (tag) {\n  case "INPUT":\n    return;\n}',
        ".tsx",
    )
    assert_clean(
        "SCOPE: an acronym in rendered text is not a raw error code",
        '<span className="font-display">TFX</span>',
        ".tsx",
    )
    assert_clean(
        # The accepted gap that buys the case above: a code shown as the whole of
        # a text child is out of the lint's reach, and the evaluator half judges
        # error anatomy anyway.
        "SCOPE: a raw code in rendered text is out of the lint half's reach",
        "<p>ERR_SYNC_500</p>",
        ".tsx",
    )
    assert_violations(
        "SCOPE: 'Something went wrong' still flags in rendered text",
        "<p>Something went wrong.</p>",
        ".tsx", ["CNT-1"],
    )
    assert_finding(
        "SCOPE: text after a JSX callback expression is not prefixed by code punctuation",
        "export function List({ items }) {\n"
        "  return (\n"
        "    <div>\n"
        "      {items.map((item) => (\n"
        "        <span>{item.name}</span>\n"
        "      ))}\n"
        "      Something went wrong.\n"
        "    </div>\n"
        "  );\n"
        "}\n",
        ".tsx", '7 [CNT-1] "Something went wrong" with no next step',
    )

    # ── Scope: user-facing strings are still linted ────────────────────────────
    assert_violations(
        "SCOPE: a text child is linted",
        "<p>Click here to view your class list.</p>",
        ".tsx", ["CNT-5"],
    )
    assert_violations(
        "SCOPE: a rendering prop is linted",
        '<Card title="Organize the class list" />',
        ".tsx", ["CNT-13"],
    )
    assert_violations(
        "SCOPE: an aria-label is linted",
        '<button aria-label="Organize the class list" />',
        ".tsx", ["CNT-13"],
    )
    assert_finding(
        "SCOPE: human-readable ARIA value text is linted",
        '<input aria-valuetext="Click here to organize the favorite colors" />',
        ".tsx", '1 [CNT-5] device-bound verb "Click"',
    )
    assert_violations(
        "SCOPE: a copy table in a .ts file is linted",
        'export const COPY = { empty: "There is no data to show yet." };',
        ".ts", ["CNT-6"],
    )
    assert_finding(
        "SCOPE: a template literal is linted per static segment",
        "const msg = `Saved ${n} marks. Click here to organise the list.`;",
        ".tsx", '1 [CNT-5] device-bound verb "Click"',
    )
    assert_clean(
        "SCOPE: words either side of an interpolation are not one long sentence",
        "const msg = `We saved fourteen marks for the class you chose before the "
        "term ended today ${n} and the rest of the drafts stay ready for you to "
        "submit later this evening.`;",
        ".tsx",
    )
    assert_finding(
        "SCOPE: a sentence in a text child names the line the sentence starts on",
        "export function P() {\n"
        "  return (\n"
        "    <p>\n"
        "      This sentence has way more than twenty five words in it because we\n"
        "      keep adding more and more filler words to push the count well past\n"
        "      the documented limit now okay.\n"
        "    </p>\n"
        "  );\n"
        "}\n",
        ".tsx", "4 [CNT-3] sentence of 31 words (> 25)",
    )
    assert_finding(
        "SCOPE: a multi-line template literal names the line its text starts on",
        "const msg = `\n  Click here to organise the list.\n`;",
        ".tsx", '2 [CNT-5] device-bound verb "Click"',
    )
    assert_violations(
        "SCOPE: a URL in an href does not cut the line short",
        '<a href="https://example.com/help">Click here to organise it</a>',
        ".tsx", ["CNT-5"],
    )
    assert_violations(
        "SCOPE: a buzzword outside a class value still flags on the whole line",
        '<p className="text-sm">Revolutionise your workflow</p>',
        ".tsx", ["SLP-9"],
    )
    assert_clean(
        "SCOPE: a TypeScript generic is not an element, so code after it is code",
        'const m = new Map<string, string>();\nconst ok = "Choose a class to begin.";',
        ".ts",
    )
    assert_violations(
        "SCOPE: a generic arrow does not swallow the rest of the file",
        "const f = <T,>(x: T) => x;\nconst m = \"There is a problem here.\";",
        ".tsx", ["CNT-6"],
    )

    # ── Word-list loader case ─────────────────────────────────────────────────
    # Assert the loader picked up a known buzzword. If using the fallback the
    # NOTE path is exercised; either way "supercharge" must be present.
    case_count += 1
    all_buzz = set(lists["buzzwords"])
    if "supercharge" not in all_buzz:
        failures.append(
            f"FAIL loader: expected 'supercharge' in buzzword list — "
            f"got {sorted(all_buzz)} (used_fallback={used_fallback})"
        )

    # CNT-5 loader: the device-verb list must carry the core verbs (from cnt-5.md
    # or the embedded fallback).
    case_count += 1
    all_verbs = set(device_verbs)
    if not {"click", "tap", "swipe"} <= all_verbs:
        failures.append(
            f"FAIL loader: expected click/tap/swipe in device-verb list — "
            f"got {sorted(all_verbs)}"
        )

    # CNT-6 loader: the opener and filler lists must carry the core entries, and
    # "in order to" must NOT be present (SLP-9 owns it — dedup by design).
    case_count += 1
    if "there is" not in cnt6_lists["openers"] or "just" not in cnt6_lists["filler"]:
        failures.append(
            f"FAIL loader: expected 'there is'/'just' in CNT-6 lists — "
            f"got openers={cnt6_lists['openers']}, filler={cnt6_lists['filler']}"
        )
    case_count += 1
    if "in order to" in cnt6_lists["openers"] + cnt6_lists["filler"]:
        failures.append(
            "FAIL loader: 'in order to' must stay out of CNT-6 lint lists "
            "(SLP-9's filler-phrase list owns it)"
        )

    # CNT-13 loader: the spelling maps must carry core entries and resolve the
    # correct British / corrected spelling.
    case_count += 1
    if (cnt13_lists["usuk"].get("color") != "colour"
            or cnt13_lists["typos"].get("recieve") != "receive"):
        failures.append(
            f"FAIL loader: expected color→colour / recieve→receive in CNT-13 maps — "
            f"got usuk-keys={sorted(cnt13_lists['usuk'])[:5]}…, "
            f"typos-keys={sorted(cnt13_lists['typos'])[:5]}…"
        )

    # ── Runtime coupling to the detail files ──────────────────────────────────
    # A word added to a list in a detail file must be enforced with no change to
    # this script. Write a slp-9.md-shaped file carrying a nonce buzzword, load
    # it the way every scan does, and lint prose that uses the word.
    case_count += 1
    with tempfile.TemporaryDirectory() as td:
        detail = os.path.join(td, "slp-9.md")
        with open(detail, "w", encoding="utf-8") as fh:
            fh.write(
                "# SLP-9\n\n## How to verify\n\n"
                "- the buzzword list — <!-- dx-sync:slp9-buzzwords source --> "
                "zorbify, streamline <!-- /dx-sync:slp9-buzzwords --> — plus the\n"
                "  AI-vocabulary list: delve, robust;\n"
                '- the filler list — "in order to";\n'
                '- the chatbot-artifact list — "great question";\n'
            )
        grown, grown_fallback, _grown_note = load_slp9_lists(detail)
        grown_words = {
            "buzzwords": _build_word_regex(grown["buzzwords"]),
            "ai_vocab": _build_word_regex(grown["ai_vocab"]),
        }
        grown_phrases = {
            "filler": _build_phrase_regex(grown["filler"]),
            "chatbot": _build_phrase_regex(grown["chatbot"]),
        }
        prose = os.path.join(td, "page.mdx")
        with open(prose, "w", encoding="utf-8") as fh:
            fh.write("We zorbify the marks before the term ends.\n")
        got = check_file(prose, grown, grown_phrases, grown_words, device_re,
                         cnt6_res, cnt13_res)
        want = 'zorbify'
        if grown_fallback or not any(want in e and "[SLP-9]" in e for e in got):
            failures.append(
                f"FAIL coupling: a word added to slp-9.md must be enforced "
                f"with no code change. want: {want!r}; got: {got!r} "
                f"(used_fallback={grown_fallback})"
            )

    # An unreadable detail file falls back loudly, and the fallback still does
    # not lint class values.
    case_count += 1
    with tempfile.TemporaryDirectory() as td:
        fb_lists, fb_used, fb_note = load_cnt13_lists(
            os.path.join(td, "no-such-cnt-13.md"))
        fb_res = _build_cnt13_res(fb_lists)
        source = os.path.join(td, "card.tsx")
        with open(source, "w", encoding="utf-8") as fh:
            fh.write('<div className="bg-[color:var(--tw-blue)]" '
                     'title="Organize the class list" />\n')
        got = check_file(source, lists, phrase_res, word_res, device_re, cnt6_res,
                         fb_res)
        want = ['1 [CNT-13] spelling "Organize"']
        trimmed = [
            re.sub(r"^ERROR [^ ]*:", "", e).split(" — suggest:")[0] for e in got
        ]
        if not (fb_used and fb_note and fb_note.startswith(
                "NOTE content-lint: could not read")):
            failures.append(
                f"FAIL fallback: an unreadable cnt-13.md must fall back "
                f"loudly. want: a NOTE; got: {fb_note!r} (used_fallback={fb_used})"
            )
        if trimmed != want:
            failures.append(f"FAIL fallback: want: {want!r}; got: {trimmed!r}")

    # ── Fixtures ───────────────────────────────────────────────────────────────
    # The standing regression corpus. A `pass` file must stay silent; a `fail`
    # file must report every control id its `want:` labels name, so the corpus
    # says which rule each planted violation belongs to rather than only that
    # something fired.
    fixtures_dir = os.path.join(_CHECKS_DIR, "fixtures", "content-lint")
    for fname in sorted(os.listdir(fixtures_dir)):
        case_count += 1
        fpath = os.path.join(fixtures_dir, fname)
        errs = check_file(fpath, lists, phrase_res, word_res, device_re, cnt6_res,
                          cnt13_res)
        found = set(re.findall(r"\[([A-Z0-9-]+)\]", " ".join(errs)))
        with open(fpath, encoding="utf-8") as fh:
            want = set(re.findall(r"want:\s*([A-Z0-9-]+)", fh.read()))
        if "pass" in fname and errs:
            failures.append(f"FAIL fixture {fname}: want: no findings; got: {errs}")
        elif "fail" in fname and not (want and want <= found):
            failures.append(
                f"FAIL fixture {fname}: want: {sorted(want)}; got: {sorted(found)}")

    # ── Report ─────────────────────────────────────────────────────────────────
    if not failures and used_fallback and note:
        print(note)
    checklib.report_self_test(failures, case_count)


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: python3 checks/content-lint.py <path>... | --self-test")
        sys.exit(1)
    if "--self-test" in args:
        run_self_test()
        return
    errors = scan_paths(args)
    if errors:
        for e in errors:
            print(e)
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
