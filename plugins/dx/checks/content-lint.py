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

What this script does NOT verify
─────────────────────────────────
- Non-literal / interpolated strings: a `{variable}`, template literal with
  `${…}`, or string built by concatenation cannot be resolved statically. These
  are NOT flagged for CNT and NOT passed silently — they are out of static reach
  and the manual / evaluator pass covers them.
- Whether a string is truly user-facing vs. an internal label, key, className,
  import path, or test fixture. The CNT rules use conservative heuristics; when
  unsure, they do not flag. SLP-9 token hits are flagged regardless of position
  (a buzzword in a comment is already stripped; one in code is still a tell).
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

_CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_checklib():
    path = os.path.join(_CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_tfx_checklib", path)
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
        r"<!--\s*tfx-sync:slp9-buzzwords\b[^>]*-->(.*?)<!--\s*/tfx-sync:slp9-buzzwords\s*-->",
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
    Parse the CNT-5 device-verb list from cnt-5.md's <!-- tfx-sync:cnt5-verbs -->
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
        r"<!--\s*tfx-sync:cnt5-verbs\b[^>]*-->(.*?)<!--\s*/tfx-sync:cnt5-verbs\s*-->",
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
    <!-- tfx-sync:cnt6-openers --> and <!-- tfx-sync:cnt6-filler --> spans.
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
            r"<!--\s*tfx-sync:" + name + r"\b[^>]*-->(.*?)<!--\s*/tfx-sync:" + name + r"\s*-->",
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
    cnt-13.md's <!-- tfx-sync:cnt13-usuk --> and <!-- tfx-sync:cnt13-typos -->
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
            r"<!--\s*tfx-sync:" + name + r"\b[^>]*-->(.*?)<!--\s*/tfx-sync:" + name + r"\s*-->",
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

# A user-facing string literal in code: a double- or single-quoted run of words.
# We only consider literals with no interpolation and a space (multi-word).
STRING_LITERAL_RE = re.compile(r'"([^"\\\n]{2,})"|\'([^\'\\\n]{2,})\'')

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
    is_md = ext in (".mdx", ".md")
    is_code = ext in (".js", ".ts", ".jsx", ".tsx", ".vue", ".svelte")

    for lineno, raw_line in enumerate(lines, start=1):
        line = raw_line.rstrip("\n")

        def emit(ctl_id, found, suggest):
            errors.append(checklib.emit_error(rel, lineno, ctl_id, found, suggest))

        # ── Strip comments so comment text is not flagged ─────────────────────
        scan_line = checklib.strip_block_comments(line, in_block_comment)
        in_block_comment = checklib.ends_in_block_comment(line, in_block_comment)
        scan_line = re.sub(r"<!--.*?-->", "", scan_line)
        if is_code:
            scan_line = re.sub(r"//.*$", "", scan_line)

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
                _check_cnt1_text(prose.strip(), line, lineno, lines, emit)
                _check_cnt5_text(prose, emit, device_re)
                _check_cnt6_text(prose, emit, cnt6_res)
                _check_cnt13_text(prose, emit, cnt13_res)
        elif is_code:
            # Code: only inspect quoted string literals that look user-facing.
            for sm in STRING_LITERAL_RE.finditer(scan_line):
                literal = sm.group(1) if sm.group(1) is not None else sm.group(2)
                if literal is None:
                    continue
                if _is_interpolated(literal):
                    continue  # unresolvable — out of static reach, do not flag
                # Heuristic: user-facing strings have a space and a letter, are
                # not import paths / classNames / urls / keys.
                if _looks_user_facing(literal):
                    _check_cnt3_text(literal, emit)
                    _check_cnt1_text(literal, line, lineno, lines, emit)
                    _check_cnt5_text(literal, emit, device_re)
                    _check_cnt6_text(literal, emit, cnt6_res)
                    _check_cnt13_text(literal, emit, cnt13_res)

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


def _check_cnt6_text(text, emit, cnt6_res):
    """
    CNT-6: flag low-informational-value words in user-facing copy — an empty
    opener at the START of a sentence ("There is", "There are", "It is",
    "This is"), or a safe-subset filler word (just, really, very, please) at any
    position. Scoped to multi-word strings, like CNT-5, so identifiers are not
    flagged. The harder calls (such/that/articles, the clarity exception) are the
    evaluator's; "in order to" is SLP-9's.
    """
    if cnt6_res is None:
        return
    if len(text.split()) < 2:
        return
    if cnt6_res["openers"]:
        for sentence in _split_sentences(text):
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


def _check_cnt1_text(text, raw_line, lineno, all_lines, emit):
    """
    CNT-1: flag a user-facing string that is ONLY a raw error code, or the bare
    "Something went wrong" with no actionable next step on this or the next line.
    Conservative — when unsure, do not flag.
    """
    t = text.strip().strip('.!')
    if not t:
        return
    # Raw-code-only string.
    if RAW_CODE_RE.match(t):
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

    # ── Report ─────────────────────────────────────────────────────────────────
    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {case_count} cases run)")
        sys.exit(1)
    else:
        if used_fallback and note:
            print(note)
        print(f"SELF-TEST OK ({case_count} cases)")
        sys.exit(0)


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
