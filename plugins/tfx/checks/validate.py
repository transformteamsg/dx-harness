#!/usr/bin/env python3
"""
Catalog validator — checks/validate.py
Validates standards/catalog.yaml for internal consistency:
  1. YAML parses; top-level 'controls' is a non-empty list.
  2. Required fields present per control; allowed values enforced.
  3. Tier → waiver pairing: L0→none, L1→documented, L2→rationale.
  4. Control ID uniqueness and shape.
  5. Every detail: path exists relative to standards/; judgment/hybrid
     controls must carry one. meta.categories covers every ID prefix.
  6. Reverse check: every standards/controls/*.md frontmatter matches catalog.
  7. Cross-reference sweep: every control ID mentioned in prose exists in catalog.
  8. tfx-sync parity: [L0-SYNC], [SLP9-SYNC], [COUNT-SYNC] (every "<N> controls"
     claim in README.md or docs/index.html must equal the catalog's actual
     control count), [WIRING-SYNC] (enforced:script|partial claims actually run
     in prebuild/CI or are exempted), and [SKILL-SYNC] (every catalog id is
     wired into >=1 skill/agent file or grandfathered; no ghost ids in skills).
Exit 0 and print "OK: <n> controls valid" on success.
Exit 1 and print "ERROR <location>: <message>" lines on failure.
"""

import importlib.util
import json
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

try:
    import yaml
except ImportError:
    print("ERROR validate.py: cannot import yaml — install pyyaml")
    sys.exit(1)

# ── Path setup ─────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Frontmatter fields compared against the catalog in the Step-6 reverse check.
FRONTMATTER_FIELDS = ["id", "source", "title", "tier", "check", "phase",
                      "applies_to", "verify", "waiver", "enforced", "script"]


def load_schema_bits(repo_root):
    """
    Load standards/schema.json from repo_root and derive the allowed-value
    sets, required fields, tier→waiver map, and the id / cross-ref regexes.
    Returns a dict (passed to the per-control validator). Done inside a
    function so the self-test can point at a fixture root.

    Allowed values come from standards/schema.json, shared with the website's
    build guard (scripts/check-standards.mjs); edit the schema, not this file.
    """
    with open(os.path.join(repo_root, "standards", "schema.json")) as fh:
        schema = json.load(fh)

    tier_waiver = schema["tier_waiver"]
    prefixes = "|".join(schema["id_prefixes"])
    return {
        "required_fields": schema["required_fields"],
        "tier_waiver": tier_waiver,
        "allowed_tiers": set(tier_waiver),
        "allowed_checks": set(schema["checks"]),
        "allowed_phases": set(schema["phases"]),
        "allowed_applies_to": set(schema["applies_to"]),
        "allowed_waivers": set(tier_waiver.values()),
        "allowed_products": set(schema["products"]),
        "allowed_audiences": set(schema["audiences"]),
        "allowed_enforced": set(schema["enforced"]),
        "allowed_status": set(schema["status"]),
        "control_id_re": re.compile(rf"^({prefixes})-\d+$"),
        "xref_re": re.compile(rf"\b({prefixes})-\d+\b"),
    }


def validate_control(control, idx, schema_bits):
    """
    Steps 2–4 for a single control: required fields, allowed values,
    tier→waiver pairing, and id shape. Returns a list of error strings; no
    I/O. (Uniqueness, detail-file existence, and meta.categories coverage stay
    in collect_errors because they need cross-control / filesystem context.)
    """
    errors = []

    def err(location, message):
        errors.append(f"ERROR {location}: {message}")

    required_fields = schema_bits["required_fields"]
    tier_waiver = schema_bits["tier_waiver"]
    allowed_tiers = schema_bits["allowed_tiers"]
    allowed_checks = schema_bits["allowed_checks"]
    allowed_phases = schema_bits["allowed_phases"]
    allowed_applies_to = schema_bits["allowed_applies_to"]
    allowed_waivers = schema_bits["allowed_waivers"]
    control_id_re = schema_bits["control_id_re"]

    # Identify by id early for better error messages
    ctrl_id = control.get("id", f"<entry {idx}>")
    loc = f"standards/catalog.yaml ({ctrl_id})"

    # 2a. Required fields
    for field in required_fields:
        if field not in control:
            err(loc, f"missing required field '{field}'")

    # 2b. Allowed values — only validate when fields are present
    tier = control.get("tier")
    if tier is not None and tier not in allowed_tiers:
        err(loc, f"invalid tier '{tier}' — allowed: {sorted(allowed_tiers)}")

    check = control.get("check")
    if check is not None and check not in allowed_checks:
        err(loc, f"invalid check '{check}' — allowed: {sorted(allowed_checks)}")

    phase = control.get("phase")
    if phase is not None:
        if not isinstance(phase, list):
            err(loc, f"'phase' must be a list, got {type(phase).__name__}")
        else:
            bad = [p for p in phase if p not in allowed_phases]
            if bad:
                err(loc, f"invalid phase values {bad} — allowed: {sorted(allowed_phases)}")

    applies_to = control.get("applies_to")
    if applies_to is not None:
        if not isinstance(applies_to, list):
            err(loc, f"'applies_to' must be a list, got {type(applies_to).__name__}")
        else:
            bad = [a for a in applies_to if a not in allowed_applies_to]
            if bad:
                err(loc, f"invalid applies_to values {bad} — allowed: {sorted(allowed_applies_to)}")

    # 2c. Optional scope fields — products / audiences. Absent = global;
    # an empty list is an error (omit the field for global instead).
    for scope_field, allowed_key in (("products", "allowed_products"),
                                     ("audiences", "allowed_audiences")):
        value = control.get(scope_field)
        if value is None:
            continue
        allowed = schema_bits[allowed_key]
        if not isinstance(value, list):
            err(loc, f"'{scope_field}' must be a list, got {type(value).__name__}")
        elif len(value) == 0:
            err(loc, f"'{scope_field}' must not be an empty list — omit the field for global (all)")
        else:
            bad = [v for v in value if v not in allowed]
            if bad:
                err(loc, f"invalid {scope_field} values {bad} — allowed: {sorted(allowed)}")

    waiver = control.get("waiver")
    if waiver is not None and waiver not in allowed_waivers:
        err(loc, f"invalid waiver '{waiver}' — allowed: {sorted(allowed_waivers)}")

    # 2d. Optional enforcement fields — enforced / script. Orthogonal to
    # `check:` (who verifies in principle) — this says what actually runs
    # today. Absent enforced defaults to 'manual' (deterministic/hybrid) or
    # 'evaluator' (judgment); the default is never written back.
    allowed_enforced = schema_bits["allowed_enforced"]
    enforced = control.get("enforced")
    script = control.get("script")

    if enforced is not None and enforced not in allowed_enforced:
        err(loc, f"invalid enforced '{enforced}' — allowed: {sorted(allowed_enforced)}")

    script_list = None
    if script is not None:
        if isinstance(script, str):
            script_list = [script]
        elif isinstance(script, list) and all(isinstance(s, str) for s in script):
            script_list = script
        else:
            err(loc, f"'script' must be a string or list of strings, got {script!r}")

    if script is not None and enforced not in ("script", "partial"):
        err(loc, "'script' is present but 'enforced' is not 'script' or 'partial'")

    if enforced in ("script", "partial") and script is None:
        err(loc, f"enforced '{enforced}' requires a 'script' field")

    if enforced == "evaluator" and check not in ("judgment", "hybrid"):
        err(loc, f"enforced 'evaluator' is only valid on check 'judgment' or 'hybrid' — got '{check}'")

    # 2e. Optional status field — 'proposed' marks a control pending
    # design-lead approval. Absence means settled; 'settled' is never
    # written explicitly.
    allowed_status = schema_bits["allowed_status"]
    status = control.get("status")
    if status is not None and status not in allowed_status:
        err(loc, f"invalid status '{status}' — allowed: {sorted(allowed_status)} (absence means settled)")

    # 3. Tier→waiver pairing
    if tier in tier_waiver and waiver is not None:
        expected_waiver = tier_waiver[tier]
        if waiver != expected_waiver:
            err(loc, f"tier {tier} requires waiver '{expected_waiver}', got '{waiver}'")

    # 4. ID shape (uniqueness is checked in collect_errors across all controls)
    if ctrl_id != f"<entry {idx}>":
        if not control_id_re.match(str(ctrl_id)):
            err(loc, f"id '{ctrl_id}' does not match pattern {control_id_re.pattern}")

    return errors


def cross_ref_errors(rel_path, text, catalog_ids, xref_re):
    """
    Step 7's per-file sweep: for every XREF_RE match in `text` whose id is not
    in `catalog_ids`, emit a "references unknown control id" error with the
    computed line number. No I/O (the caller reads the file).
    """
    errors = []
    for match in xref_re.finditer(text):
        ref_id = match.group(0)
        if ref_id not in catalog_ids:
            # Find line number for better reporting
            line_no = text[:match.start()].count("\n") + 1
            errors.append(f"ERROR {rel_path}:{line_no}: references unknown control id '{ref_id}'")
    return errors


# ── tfx-sync parity sub-checks ──────────────────────────────────────────────────
# Some fragments are restated in prose across files that must each ship in their
# own context (the plugin SKILL.md + the project-root CLAUDE.md; the skill summary +
# the canonical control). A whole-file read-through can't fix a fragment inside a
# larger file, so each restatement is wrapped in <!-- tfx-sync:NAME -->…<!-- /tfx-sync:NAME -->
# markers and compared against its source here. See docs/SYNC.md.

# REQUIRED_CORE — a hard-coded floor of buzzwords that must appear in BOTH the
# canonical slp-9.md list and the copy skill's summary. NOT synced from
# slp-9.md by design, so the check keeps an anchor even if both lists are edited.
# If the canonical list ever drops one of these, update this set too (see SYNC.md).
REQUIRED_CORE = {"streamline", "empower", "supercharge"}

# Connector / noise tokens dropped during buzzword tokenization.
_BUZZWORD_NOISE = {"and", "kin", "the", "plus", "list", "buzzword", ""}


def extract_sync_block(text, name):
    """
    Return the inner span between <!-- tfx-sync:NAME … --> and
    <!-- /tfx-sync:NAME --> (DOTALL), or None if the block is absent / unclosed.
    The open marker tolerates extra attributes (e.g. `source`, `source=catalog`).
    """
    pattern = (r"<!-- tfx-sync:" + re.escape(name) + r"\b[^>]*-->"
               r"(.*?)<!-- /tfx-sync:" + re.escape(name) + r" -->")
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1) if match else None


def tokenize_buzzwords(span):
    """
    Lowercase, split on commas/whitespace/bullets, strip a trailing parenthetical
    inflection (streamline(d) → streamline; effortless(ly) → effortless), drop
    connector/noise tokens, and return the resulting set. No morphological
    stemming — the live lists already align on the paren-stripped token.
    """
    tokens = set()
    for raw in re.split(r"[,\s•*—–…]+", span.lower()):
        tok = raw.strip("-–—….•* ")
        m = re.match(r"^(\w+)\(\w*\)$", tok)
        if m:
            tok = m.group(1)
        if tok and tok not in _BUZZWORD_NOISE:
            tokens.add(tok)
    return tokens


def l0_parity_errors(repo_root, catalog_by_id, xref_re):
    """
    [L0-SYNC] Each marked L0 consumer must equal the catalog's tier:L0 set.
    Missing markers are an error. Set comparison, so prose/order around the IDs
    is free.
    """
    errors = []
    source = {cid for cid, c in catalog_by_id.items() if c.get("tier") == "L0"}
    consumers = [
        os.path.join(repo_root, "CLAUDE.md"),
        os.path.join(repo_root, ".claude", "skills", "design", "SKILL.md"),
        os.path.join(repo_root, "checks", "detect.py"),
    ]
    for fpath in consumers:
        if not os.path.isfile(fpath):
            continue
        rel = os.path.relpath(fpath, repo_root)
        with open(fpath) as fh:
            text = fh.read()
        span = extract_sync_block(text, "L0")
        if span is None:
            errors.append(f"ERROR {rel} [L0-SYNC]: missing tfx-sync:L0 markers")
            continue
        inline = {m.group(0) for m in xref_re.finditer(span)}
        if inline != source:
            errors.append(
                f"ERROR {rel} [L0-SYNC]: inline L0 list {{{', '.join(sorted(inline))}}} "
                f"!= catalog L0 set {{{', '.join(sorted(source))}}}"
            )
    return errors


def lay_parity_errors(repo_root, catalog_by_id, xref_re):
    """
    [LAY-SYNC] Each inline layout-controls list (the design skill's SKILL.md, the
    evaluator agent's Layout grading paragraph, the layout skill's control subset)
    must equal the catalog's LAY-* id set. Missing markers are an error. Set
    comparison, so prose/order/detail around the IDs is free.
    """
    errors = []
    source = {cid for cid in catalog_by_id if cid.startswith("LAY-")}
    consumers = [
        os.path.join(repo_root, ".claude", "skills", "design", "SKILL.md"),
        os.path.join(repo_root, ".claude", "agents", "evaluator.md"),
        os.path.join(repo_root, ".claude", "skills", "layout", "SKILL.md"),
    ]
    for fpath in consumers:
        if not os.path.isfile(fpath):
            continue
        rel = os.path.relpath(fpath, repo_root)
        with open(fpath) as fh:
            text = fh.read()
        span = extract_sync_block(text, "lay-controls")
        if span is None:
            errors.append(f"ERROR {rel} [LAY-SYNC]: missing tfx-sync:lay-controls markers")
            continue
        inline = {m.group(0) for m in xref_re.finditer(span)}
        if inline != source:
            errors.append(
                f"ERROR {rel} [LAY-SYNC]: inline LAY list {{{', '.join(sorted(inline))}}} "
                f"!= catalog LAY set {{{', '.join(sorted(source))}}}"
            )
    return errors


def slp9_parity_errors(repo_root):
    """
    [SLP9-SYNC] The copy skill's buzzword summary must be a SUBSET of the
    canonical slp-9.md buzzword list (the skill may show fewer words, never more),
    and REQUIRED_CORE must appear in both. Missing markers are an error.
    """
    errors = []
    src_path = os.path.join(repo_root, "standards", "controls", "slp-9.md")
    con_path = os.path.join(repo_root, ".claude", "skills", "copy", "SKILL.md")

    source = None
    if os.path.isfile(src_path):
        with open(src_path) as fh:
            src_span = extract_sync_block(fh.read(), "slp9-buzzwords")
        if src_span is None:
            errors.append("ERROR standards/controls/slp-9.md [SLP9-SYNC]: missing source marker")
        else:
            source = tokenize_buzzwords(src_span)

    consumer = None
    if os.path.isfile(con_path):
        rel = os.path.relpath(con_path, repo_root)
        with open(con_path) as fh:
            con_span = extract_sync_block(fh.read(), "slp9-buzzwords")
        if con_span is None:
            errors.append(f"ERROR {rel} [SLP9-SYNC]: missing consumer marker")
        else:
            consumer = tokenize_buzzwords(con_span)

    if source is not None and consumer is not None:
        rel = os.path.relpath(con_path, repo_root)
        extra = consumer - source
        if extra:
            errors.append(
                f"ERROR {rel} [SLP9-SYNC]: skill buzzword(s) "
                f"{{{', '.join(sorted(extra))}}} not in canonical slp-9.md list"
            )

    # Required-core floor: must appear in both lists.
    if consumer is not None:
        missing = REQUIRED_CORE - consumer
        if missing:
            rel = os.path.relpath(con_path, repo_root)
            errors.append(
                f"ERROR {rel} [SLP9-SYNC]: required core buzzword(s) "
                f"{{{', '.join(sorted(missing))}}} absent"
            )
    if source is not None:
        missing = REQUIRED_CORE - source
        if missing:
            errors.append(
                f"ERROR standards/controls/slp-9.md [SLP9-SYNC]: required core "
                f"buzzword(s) {{{', '.join(sorted(missing))}}} absent"
            )
    return errors


COUNT_SYNC_PATHS = ("README.md", "docs/index.html")


def live_skills_count(repo_root):
    """
    Number of dirs under `<repo_root>/.claude/skills` that contain a
    `SKILL.md`. This is the "N skills" claimed in prose (the `evaluator`
    subagent is counted separately as "+ 1 agent", never folded in).
    """
    skills_dir = os.path.join(repo_root, ".claude", "skills")
    if not os.path.isdir(skills_dir):
        return 0
    count = 0
    for name in os.listdir(skills_dir):
        if os.path.isfile(os.path.join(skills_dir, name, "SKILL.md")):
            count += 1
    return count


def live_checks_count(repo_root):
    """
    Number of check scripts under `<repo_root>/checks/*.py`, per the repo's
    own prose convention (checks/README.md, docs/index.html): the catalog
    validator (`validate.py`) is counted separately in prose ("the catalog
    validator + N check scripts"), and `checklib.py` is a shared library, not
    a check. So: check scripts = `checks/*.py` minus `validate.py` minus
    `checklib.py`.
    """
    checks_dir = os.path.join(repo_root, "checks")
    if not os.path.isdir(checks_dir):
        return 0
    exempt = {"validate.py", "checklib.py"}
    return len(
        [
            fname
            for fname in os.listdir(checks_dir)
            if fname.endswith(".py") and fname not in exempt
        ]
    )


def count_parity_errors(repo_root, catalog_count, relpaths=COUNT_SYNC_PATHS,
                         skills_count=None, checks_count=None):
    """
    [COUNT-SYNC] Every roster-size claim in README.md or docs/index.html
    must equal the live count it claims to describe. Catches the class of
    drift where a control/skill/check is added or removed but a prose count
    is never updated. A file with no claim (or that doesn't exist) is not an
    error (nothing to check).

    Three claim types, each matched by its own regex and compared against
    its own live count:
      - "<N> controls"      vs. the catalog's actual control count
      - "<N> skills"        vs. `live_skills_count` (dirs with a SKILL.md)
      - "<N> check scripts" / "<N> checks built" vs. `live_checks_count`
        (checks/*.py minus validate.py minus checklib.py)

    `skills_count`/`checks_count` default to the live counts computed from
    `repo_root`; callers (e.g. the self-test) may pass fabricated counts
    against a fabricated tempdir tree instead.
    """
    if skills_count is None:
        skills_count = live_skills_count(repo_root)
    if checks_count is None:
        checks_count = live_checks_count(repo_root)

    claim_types = (
        (r"(\d+) controls", "controls", catalog_count, "catalog has"),
        (r"(\d+) skills", "skills", skills_count, "stack has"),
        (r"(\d+) check scripts", "check scripts", checks_count, "stack has"),
        (r"(\d+) checks built", "checks built", checks_count, "stack has"),
    )

    errors = []
    for relpath in relpaths:
        path = os.path.join(repo_root, relpath)
        if not os.path.isfile(path):
            continue
        rel = os.path.relpath(path, repo_root)
        with open(path) as fh:
            text = fh.read()
        for pattern, label, live_count, verb in claim_types:
            seen = set()
            for m in re.finditer(pattern, text):
                n = int(m.group(1))
                if n != live_count and n not in seen:
                    seen.add(n)
                    errors.append(
                        f"ERROR {rel} [COUNT-SYNC]: says {n} {label}, {verb} {live_count}"
                    )
    return errors


# [WIRING-SYNC] scripts claimed as enforced:script|partial that are allowed to
# run in neither prebuild nor CI, with a one-line honest reason each. Keep this
# in sync with the "Wiring status" prose in checks/README.md.
WIRING_EXEMPT = {
    "checks/content-lint.py": "pre-existing CNT-3/CNT-6/SLP-9 findings in content/ — wire after cleanup",
    "checks/contrast.py": "pre-existing A11Y-1 finding (components/ui/button.tsx) — wire after cleanup",
    "checks/component-manifest.py": "validates a product's .tfx/component-manifest.json; this repo has none to validate",
}


def wiring_parity_errors(repo_root, catalog_by_id):
    """
    [WIRING-SYNC] Every control claiming enforced:script|partial via a
    script: field must have that script actually running somewhere
    (package.json prebuild, or .github/workflows/ci.yml) — unless it is on
    the WIRING_EXEMPT list with a documented reason. Catches the class of
    drift where a catalog control claims automated enforcement that no
    automation delivers.

    `repo_root` is this validator's own root (harness/); package.json and
    ci.yml live one level up, at the consuming site's repo root. If neither
    file exists there (e.g. the harness ships standalone as a plugin with no
    consuming site checked out), there is nothing to check — return clean.
    """
    errors = []

    # Claimed set: script path -> [(control id, effective enforced value)].
    claimed = {}
    for cid, control in catalog_by_id.items():
        enforced, _ = effective_enforcement(control)
        if enforced not in ("script", "partial"):
            continue
        script = control.get("script")
        if script is None:
            continue
        script_list = script if isinstance(script, list) else [script]
        for sp in script_list:
            if isinstance(sp, str):
                claimed.setdefault(sp, []).append((cid, enforced))

    # Running set: scan package.json + ci.yml one level above repo_root.
    top_root = os.path.dirname(repo_root)
    consumer_paths = [
        os.path.join(top_root, "package.json"),
        os.path.join(top_root, ".github", "workflows", "ci.yml"),
    ]
    running = set()
    any_consumer_found = False
    for cpath in consumer_paths:
        if not os.path.isfile(cpath):
            continue
        any_consumer_found = True
        with open(cpath) as fh:
            text = fh.read()
        running.update(f"checks/{m.group(1)}" for m in re.finditer(r"checks/([a-z0-9-]+\.py)", text))

    if not any_consumer_found:
        return errors

    for sp, claimants in sorted(claimed.items()):
        if sp in running or sp in WIRING_EXEMPT:
            continue
        for cid, enforced in claimants:
            errors.append(
                f"ERROR standards/catalog.yaml [WIRING-SYNC]: {cid} claims "
                f"enforced:{enforced} via {sp} but it runs in neither prebuild "
                f"nor CI and is not exempted"
            )

    # Dead exemptions: exempted script no longer exists, or no longer claimed.
    for sp in sorted(WIRING_EXEMPT):
        script_abs = os.path.join(repo_root, sp)
        if not os.path.isfile(script_abs):
            errors.append(
                f"ERROR harness/checks/README.md [WIRING-SYNC]: exempted script "
                f"'{sp}' no longer exists on disk (dead exemption)"
            )
        elif sp not in claimed:
            errors.append(
                f"ERROR harness/checks/README.md [WIRING-SYNC]: exempted script "
                f"'{sp}' is no longer claimed by any control (dead exemption)"
            )

    return errors


# [SKILL-SYNC] catalog ids referenced by NO skill or agent file, grandfathered
# at the introduction of this check (plan 070) — each entry names the reason
# it is not yet wired. Additions need a reason; removals (once a control gets
# wired) are free — shrink-only in practice.
SKILL_WIRING_GRANDFATHERED = {
    "A11Y-9": "title/lang check (title-lang) is planned but unbuilt (checks/README.md V1 table) — not yet named in any skill",
    "A11Y-10": "skip-link check is planned but unbuilt (checks/README.md V1 table) — not yet named in any skill",
    "IDN-1": "identity check (logo/lockup) is planned but unbuilt (checks/README.md V1 table) — not yet named in any skill",
    "TYP-6": "hybrid measure (line-length) control — unwired at introduction of SKILL-SYNC — wire into layout/polish skill or justify",
}


def skill_sync_errors(repo_root, catalog_by_id, xref_re):
    """
    [SKILL-SYNC] Two guarantees over the catalog<->skill-layer boundary:
    (a) no ghost ids — every control id mentioned anywhere under
    `.claude/skills/**/*.md` or `.claude/agents/*.md` exists in the catalog;
    (b) no orphan controls — every catalog id is mentioned in at least one of
    those files, or sits on SKILL_WIRING_GRANDFATHERED with a documented
    reason. Catches the drift class from plan 063: a control lands in the
    catalog but no skill or agent is taught to apply it.

    An allowlisted id that is no longer an orphan (someone wired it) prints a
    NOTE (not an error) suggesting its removal from the allowlist — never
    fails the build. An allowlisted id that is not a catalog id at all is a
    dead entry — ERROR.
    """
    errors = []

    consumer_dirs = [
        os.path.join(repo_root, ".claude", "skills"),
        os.path.join(repo_root, ".claude", "agents"),
    ]

    # Nothing to check when neither consumer dir exists at all (e.g. a
    # synthetic/partial repo_root fixture with no .claude tree) — mirrors
    # wiring_parity_errors' "no consumer found" bail-out.
    if not any(os.path.isdir(d) for d in consumer_dirs):
        return errors

    consumer_files = []
    for d in consumer_dirs:
        if not os.path.isdir(d):
            continue
        for root, _dirs, fnames in os.walk(d):
            for fname in fnames:
                if fname.endswith(".md"):
                    consumer_files.append(os.path.join(root, fname))

    mentioned = set()
    for fpath in sorted(consumer_files):
        rel = os.path.relpath(fpath, repo_root)
        with open(fpath) as fh:
            text = fh.read()
        for m in xref_re.finditer(text):
            ref_id = m.group(0)
            mentioned.add(ref_id)
            if ref_id not in catalog_by_id:
                errors.append(
                    f"ERROR {rel} [SKILL-SYNC]: names {ref_id} which is not in the catalog"
                )

    catalog_ids = set(catalog_by_id)
    orphans = catalog_ids - mentioned
    for cid in sorted(orphans):
        if cid not in SKILL_WIRING_GRANDFATHERED:
            errors.append(
                f"ERROR standards/catalog.yaml [SKILL-SYNC]: {cid} is not "
                f"mentioned in any skill or agent file, and is not on "
                f"SKILL_WIRING_GRANDFATHERED"
            )

    # Grandfathered entries that have gone stale: no longer an orphan
    # (someone wired it — NOTE, shrink the list), or no longer a catalog id
    # at all (dead entry — ERROR).
    for cid in sorted(SKILL_WIRING_GRANDFATHERED):
        if cid not in catalog_ids:
            errors.append(
                f"ERROR checks/validate.py [SKILL-SYNC]: SKILL_WIRING_GRANDFATHERED "
                f"entry '{cid}' is not a catalog id (dead entry)"
            )
        elif cid not in orphans:
            print(
                f"NOTE checks/validate.py [SKILL-SYNC]: {cid} is now mentioned "
                f"in a skill/agent file — consider removing it from "
                f"SKILL_WIRING_GRANDFATHERED"
            )

    return errors


# ── Copy-skill ↔ guideline parity (VOICE / TONE / UITEXT) ────────────────────────
# The copy skill (.claude/skills/copy/SKILL.md) inlines the voice-attributes and
# tone-by-context tables and the draft-phase editing sequence; the website guidelines
# restate them for human readers. Source = the plugin-shipped skill; consumers = the
# website mdx under content/guidelines/, which live OUTSIDE harness/ (one level up, like
# package.json in wiring_parity_errors) — so these are website-optional sub-checks that
# return clean when the site tree is absent (the harness ships standalone as a plugin).
# MDX (next-mdx-remote + remark-gfm, MDX v3) rejects raw <!-- --> HTML comments, so the
# consumer markers use the JSX-expression comment {/* … */}; the skill keeps <!-- -->.


def extract_sync_block_any(text, name):
    """
    Like extract_sync_block, but also recognizes the MDX comment form
    {/* tfx-sync:NAME … */} … {/* /tfx-sync:NAME */}. Tries the HTML form first
    (plain-markdown sources), then the MDX form (website consumers). Returns the
    inner span, or None if neither form is present / closed.
    """
    html = extract_sync_block(text, name)
    if html is not None:
        return html
    pattern = (r"\{/\* tfx-sync:" + re.escape(name) + r"\b.*?\*/\}"
               r"(.*?)\{/\* /tfx-sync:" + re.escape(name) + r" \*/\}")
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1) if match else None


def _normalize_table_rows(span):
    """
    Markdown table body of a span as a set of normalized cell tuples. Skips the
    header separator row (all dashes/colons). Reduces markdown links [text](url)
    to their text, collapses whitespace, and lowercases — so the skill's plain
    `(CMP-2)` and the guideline's `([CMP-2](/…))` compare equal.
    """
    rows = set()
    for line in span.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if cells and all(re.fullmatch(r":?-+:?", c) for c in cells if c):
            continue  # separator row
        norm = tuple(
            re.sub(r"\s+", " ", re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", c)).strip().lower()
            for c in cells
        )
        rows.add(norm)
    return rows


def _editing_step_names(span):
    """Lowercased lead words of a numbered step list: `**Draft.**` → `draft`."""
    return {m.group(1).lower() for m in re.finditer(r"\*\*([A-Za-z]+)\.\*\*", span)}


def _section_heading_words(span):
    """Set of lowercased words from `## N. Heading` lines in a span."""
    words = set()
    for m in re.finditer(r"^#{2,3}\s+\d+\.\s*(.+)$", span, re.MULTILINE):
        words.update(re.findall(r"[a-z]+", m.group(1).lower()))
    return words


def _table_parity_errors(repo_root, name, tag, consumer_rel):
    """
    Shared engine for [VOICE-SYNC] / [TONE-SYNC]: the skill's marked table
    (source) must equal the website guideline's marked table (consumer) as
    normalized row sets. Website-optional — a missing guideline file returns
    clean. A missing source or consumer marker is an error.
    """
    errors = []
    skill_path = os.path.join(repo_root, ".claude", "skills", "copy", "SKILL.md")
    consumer_path = os.path.join(os.path.dirname(repo_root), consumer_rel)

    if not os.path.isfile(skill_path):
        return errors
    with open(skill_path) as fh:
        src_span = extract_sync_block_any(fh.read(), name)
    if src_span is None:
        errors.append(
            f"ERROR .claude/skills/copy/SKILL.md [{tag}]: missing tfx-sync:{name} source markers")
        return errors

    if not os.path.isfile(consumer_path):
        return errors  # website tree absent — nothing to compare
    with open(consumer_path) as fh:
        con_span = extract_sync_block_any(fh.read(), name)
    if con_span is None:
        errors.append(f"ERROR {consumer_rel} [{tag}]: missing tfx-sync:{name} consumer markers")
        return errors

    src_rows = _normalize_table_rows(src_span)
    con_rows = _normalize_table_rows(con_span)
    if src_rows != con_rows:
        errors.append(
            f"ERROR {consumer_rel} [{tag}]: table rows differ from the copy skill — "
            f"only in skill: {sorted(src_rows - con_rows)}; "
            f"only in guideline: {sorted(con_rows - src_rows)}"
        )
    return errors


def voice_parity_errors(repo_root):
    """[VOICE-SYNC] copy skill's voice-attributes table == voice-tone.mdx's."""
    return _table_parity_errors(repo_root, "voice-attributes", "VOICE-SYNC",
                                "content/guidelines/voice-tone.mdx")


def tone_parity_errors(repo_root):
    """[TONE-SYNC] copy skill's tone-by-context table == voice-tone.mdx's."""
    return _table_parity_errors(repo_root, "tone-context", "TONE-SYNC",
                                "content/guidelines/voice-tone.mdx")


def uitext_parity_errors(repo_root):
    """
    [UITEXT-SYNC] Every draft-phase step name in the copy skill's editing
    sequence must appear as a word in a ui-text.mdx section heading — a SUBSET,
    not equality: the skill's step 6 'Check' deliberately collapses ui-text
    sections 6–11 (human-reviewed, not parity-checked). Website-optional.
    """
    errors = []
    skill_path = os.path.join(repo_root, ".claude", "skills", "copy", "SKILL.md")
    consumer_rel = "content/guidelines/ui-text.mdx"
    consumer_path = os.path.join(os.path.dirname(repo_root), consumer_rel)

    if not os.path.isfile(skill_path):
        return errors
    with open(skill_path) as fh:
        src_span = extract_sync_block_any(fh.read(), "uitext-sequence")
    if src_span is None:
        errors.append(
            "ERROR .claude/skills/copy/SKILL.md [UITEXT-SYNC]: missing "
            "tfx-sync:uitext-sequence source markers")
        return errors

    if not os.path.isfile(consumer_path):
        return errors
    with open(consumer_path) as fh:
        con_span = extract_sync_block_any(fh.read(), "uitext-sequence")
    if con_span is None:
        errors.append(f"ERROR {consumer_rel} [UITEXT-SYNC]: missing tfx-sync:uitext-sequence consumer markers")
        return errors

    missing = _editing_step_names(src_span) - _section_heading_words(con_span)
    if missing:
        errors.append(
            f"ERROR {consumer_rel} [UITEXT-SYNC]: copy-skill step name(s) "
            f"{{{', '.join(sorted(missing))}}} not found in any ui-text.mdx section heading"
        )
    return errors


def collect_errors(repo_root, _return_count=False):
    """
    Run all of Steps 1–7 against `repo_root` and return a list of error
    strings (empty on a fully valid catalog). Uses a local errors accumulator
    so it is safe to call repeatedly (e.g. from the self-test).

    With `_return_count=True`, returns `(errors, n)` where `n` is the count of
    unique, well-identified controls (the value printed by the success line) —
    so `main` reports exactly the original `len(catalog_by_id)` without
    re-parsing the catalog.
    """
    catalog_path = os.path.join(repo_root, "standards", "catalog.yaml")
    controls_dir = os.path.join(repo_root, "standards", "controls")

    cross_ref_files = [
        os.path.join(repo_root, "CLAUDE.md"),
        os.path.join(repo_root, "README.md"),
        os.path.join(repo_root, "checks", "README.md"),
        os.path.join(repo_root, "docs", "decisions", "TEMPLATE.md"),
    ]
    # Glob .claude/skills/*/SKILL.md, .claude/agents/*.md, and
    # docs/catalog-changes/*.md at runtime
    skills_dir = os.path.join(repo_root, ".claude", "skills")
    agents_dir = os.path.join(repo_root, ".claude", "agents")
    catalog_changes_dir = os.path.join(repo_root, "docs", "catalog-changes")

    schema_bits = load_schema_bits(repo_root)
    xref_re = schema_bits["xref_re"]

    errors = []

    def err(location, message):
        errors.append(f"ERROR {location}: {message}")

    def result(n=0):
        return (errors, n) if _return_count else errors

    # ── Step 1: Parse catalog ────────────────────────────────────────────────
    try:
        with open(catalog_path) as fh:
            catalog_data = yaml.safe_load(fh)
    except FileNotFoundError:
        err("standards/catalog.yaml", "file not found")
        return result()
    except yaml.YAMLError as exc:
        err("standards/catalog.yaml", f"YAML parse error: {exc}")
        return result()

    if not isinstance(catalog_data, dict) or "controls" not in catalog_data:
        err("standards/catalog.yaml", "missing top-level 'controls' key")
        return result()

    controls_list = catalog_data["controls"]
    if not isinstance(controls_list, list) or len(controls_list) == 0:
        err("standards/catalog.yaml", "'controls' must be a non-empty list")
        return result()

    # ── Steps 2–5: Per-control validation ────────────────────────────────────
    seen_ids = {}  # id → index for uniqueness check
    catalog_by_id = {}

    for idx, control in enumerate(controls_list):
        loc = f"standards/catalog.yaml (entry {idx})"

        if not isinstance(control, dict):
            err(loc, "entry is not a YAML mapping")
            continue

        # Identify by id early for better error messages
        ctrl_id = control.get("id", f"<entry {idx}>")
        loc = f"standards/catalog.yaml ({ctrl_id})"

        # Steps 2–4: required fields, allowed values, tier→waiver, id shape
        errors.extend(validate_control(control, idx, schema_bits))

        check = control.get("check")

        # 4. ID uniqueness (shape is checked in validate_control)
        if ctrl_id != f"<entry {idx}>":
            if ctrl_id in seen_ids:
                err(loc, f"duplicate id '{ctrl_id}' (first seen at entry {seen_ids[ctrl_id]})")
            else:
                seen_ids[ctrl_id] = idx
                catalog_by_id[ctrl_id] = control

        # 5. detail: path exists; judgment/hybrid controls must have one
        detail = control.get("detail")
        if detail is not None:
            detail_abs = os.path.join(repo_root, "standards", detail)
            if not os.path.isfile(detail_abs):
                err(loc, f"detail file 'standards/{detail}' does not exist")
        elif check in {"judgment", "hybrid"}:
            err(loc, f"check '{check}' requires a 'detail' file (rationale + pass/fail examples)")

        # 5c. script: every path exists on disk (repo-relative to repo_root).
        # Type errors (non-string entries) are already reported by
        # validate_control; here we only resolve well-formed string paths.
        script = control.get("script")
        if script is not None:
            script_list = script if isinstance(script, list) else [script]
            for sp in script_list:
                if not isinstance(sp, str):
                    continue
                script_abs = os.path.join(repo_root, sp)
                if not os.path.isfile(script_abs):
                    err(loc, f"script path '{sp}' does not exist")

    # ── Step 5b: meta.categories covers every ID prefix ──────────────────────
    # The TFX-DS website derives control categories from this map; a missing
    # prefix breaks the site build.
    meta_categories = (catalog_data.get("meta") or {}).get("categories") or {}
    for ctrl_id in catalog_by_id:
        prefix = ctrl_id.split("-")[0]
        if prefix not in meta_categories:
            err("standards/catalog.yaml (meta.categories)",
                f"id prefix '{prefix}' ({ctrl_id}) has no category mapping")

    # ── Step 6: Reverse check — controls/*.md frontmatter ────────────────────
    # Collect all .md files in controls/
    if os.path.isdir(controls_dir):
        md_files = sorted(f for f in os.listdir(controls_dir) if f.endswith(".md"))
    else:
        md_files = []

    for fname in md_files:
        fpath = os.path.join(controls_dir, fname)
        floc = f"standards/controls/{fname}"

        # Read and parse frontmatter
        with open(fpath) as fh:
            raw = fh.read()

        # Extract YAML between first pair of ---
        fm_match = re.match(r"^---\n(.*?)\n---", raw, re.DOTALL)
        if not fm_match:
            err(floc, "missing or malformed YAML frontmatter (expected --- delimiters)")
            continue

        try:
            fm = yaml.safe_load(fm_match.group(1))
        except yaml.YAMLError as exc:
            err(floc, f"frontmatter YAML parse error: {exc}")
            continue

        if not isinstance(fm, dict):
            err(floc, "frontmatter is not a YAML mapping")
            continue

        # Check filename matches id convention: tok-1.md → TOK-1
        fm_id = fm.get("id")
        expected_filename = f"{str(fm_id).lower()}.md" if fm_id else None
        if expected_filename and fname != expected_filename:
            err(floc, f"filename '{fname}' does not match id '{fm_id}' (expected '{expected_filename}')")

        # Check id corresponds to a catalog entry
        if fm_id not in catalog_by_id:
            err(floc, f"id '{fm_id}' in frontmatter not found in catalog")
            continue

        cat_entry = catalog_by_id[fm_id]

        # Compare each frontmatter field against catalog
        for field in FRONTMATTER_FIELDS:
            if field not in fm:
                # Frontmatter need not repeat all fields — only check ones present
                continue
            fm_val = fm[field]
            cat_val = cat_entry.get(field)
            if fm_val != cat_val:
                err(floc, f"field '{field}' in frontmatter ({fm_val!r}) does not match catalog ({cat_val!r})")

    # Check reverse: every catalog entry with a detail: file has a corresponding
    # standards/controls/<id-lower>.md (the file existence is already checked in step 5;
    # this checks orphan .md files not referenced by any catalog entry)
    for fname in md_files:
        fpath = os.path.join(controls_dir, fname)
        with open(fpath) as fh:
            raw = fh.read()
        fm_match = re.match(r"^---\n(.*?)\n---", raw, re.DOTALL)
        if not fm_match:
            continue
        try:
            fm = yaml.safe_load(fm_match.group(1))
        except yaml.YAMLError:
            continue
        if not isinstance(fm, dict):
            continue
        fm_id = fm.get("id")
        # Check that this file is referenced from the catalog entry
        if fm_id in catalog_by_id:
            cat_entry = catalog_by_id[fm_id]
            expected_detail = f"controls/{fname}"
            if cat_entry.get("detail") != expected_detail:
                err(f"standards/controls/{fname}",
                    f"file exists but catalog entry for '{fm_id}' does not point to it "
                    f"(catalog detail: {cat_entry.get('detail')!r}, expected: {expected_detail!r})")

    # ── Step 7: Cross-reference sweep ────────────────────────────────────────
    # Collect skill SKILL.md files
    skill_files = []
    if os.path.isdir(skills_dir):
        for skill_name in os.listdir(skills_dir):
            skill_path = os.path.join(skills_dir, skill_name, "SKILL.md")
            if os.path.isfile(skill_path):
                skill_files.append(skill_path)

    # Collect agent files
    agent_files = []
    if os.path.isdir(agents_dir):
        for fname in os.listdir(agents_dir):
            if fname.endswith(".md"):
                agent_files.append(os.path.join(agents_dir, fname))

    # Collect catalog-change records
    catalog_change_files = []
    if os.path.isdir(catalog_changes_dir):
        for fname in os.listdir(catalog_changes_dir):
            if fname.endswith(".md"):
                catalog_change_files.append(os.path.join(catalog_changes_dir, fname))

    all_xref_files = cross_ref_files + skill_files + agent_files + catalog_change_files

    for fpath in all_xref_files:
        if not os.path.isfile(fpath):
            continue
        rel = os.path.relpath(fpath, repo_root)
        with open(fpath) as fh:
            content = fh.read()
        errors.extend(cross_ref_errors(rel, content, catalog_by_id, xref_re))

    # ── Step 8: tfx-sync parity sub-checks ───────────────────────────────────
    # Inline restatements (L0 list, SLP-9 buzzwords) must not drift from source.
    errors.extend(l0_parity_errors(repo_root, catalog_by_id, xref_re))
    errors.extend(slp9_parity_errors(repo_root))
    errors.extend(count_parity_errors(repo_root, len(catalog_by_id)))
    errors.extend(wiring_parity_errors(repo_root, catalog_by_id))
    errors.extend(skill_sync_errors(repo_root, catalog_by_id, xref_re))
    errors.extend(lay_parity_errors(repo_root, catalog_by_id, xref_re))
    errors.extend(voice_parity_errors(repo_root))
    errors.extend(tone_parity_errors(repo_root))
    errors.extend(uitext_parity_errors(repo_root))

    return result(len(catalog_by_id))


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    """
    Embedded self-test cases.  Prints SELF-TEST OK (N cases) and exits 0 on
    success, or prints failures and exits 1.
    """
    import tempfile
    import shutil

    failures = []
    case_count = 0

    # Schema bits derived from the real repo schema, so allowed-value sets match
    # what the live catalog is validated against.
    schema_bits = load_schema_bits(REPO_ROOT)
    xref_re = schema_bits["xref_re"]

    def assert_control_clean(name, control):
        nonlocal case_count
        case_count += 1
        errs = validate_control(control, 0, schema_bits)
        if errs:
            failures.append(f"FAIL {name}: expected no errors — got: {errs}")

    def assert_control_error(name, control, needle):
        nonlocal case_count
        case_count += 1
        errs = validate_control(control, 0, schema_bits)
        if not any(needle in e for e in errs):
            failures.append(f"FAIL {name}: expected an error containing {needle!r} — got: {errs}")

    def assert_xref_clean(name, text, catalog_ids):
        nonlocal case_count
        case_count += 1
        errs = cross_ref_errors("scratch.md", text, catalog_ids, xref_re)
        if errs:
            failures.append(f"FAIL {name}: expected no errors — got: {errs}")

    def assert_xref_error(name, text, catalog_ids, needle):
        nonlocal case_count
        case_count += 1
        errs = cross_ref_errors("scratch.md", text, catalog_ids, xref_re)
        if not any(needle in e for e in errs):
            failures.append(f"FAIL {name}: expected an error containing {needle!r} — got: {errs}")

    # ── Pure validate_control cases ──────────────────────────────────────────

    valid_control = {
        "id": "TOK-1",
        "source": "TFX-DS",
        "title": "Use tokens",
        "tier": "L0",
        "check": "deterministic",
        "phase": ["implement"],
        "applies_to": ["component"],
        "verify": "token-audit",
        "waiver": "none",
    }

    # Case 1: a valid L0 control → no errors
    assert_control_clean("valid L0 control", dict(valid_control))

    # Case 2: tier→waiver mismatch (L0 with waiver 'documented') → error
    bad_waiver = dict(valid_control, waiver="documented")
    assert_control_error("tier→waiver mismatch", bad_waiver, "requires waiver 'none'")

    # Case 3: invalid tier (L9) → error
    bad_tier = dict(valid_control, tier="L9")
    assert_control_error("invalid tier", bad_tier, "invalid tier 'L9'")

    # Case 4: malformed id (TOK1) → id-pattern error
    bad_id = dict(valid_control, id="TOK1")
    assert_control_error("malformed id", bad_id, "does not match pattern")

    # Case 5: invalid check value → error
    bad_check = dict(valid_control, check="bogus")
    assert_control_error("invalid check", bad_check, "invalid check 'bogus'")

    # Case 6: missing required field → error
    missing_field = dict(valid_control)
    del missing_field["title"]
    assert_control_error("missing required field", missing_field, "missing required field 'title'")

    # Case 7: phase not a list → error
    bad_phase = dict(valid_control, phase="implement")
    assert_control_error("phase not a list", bad_phase, "'phase' must be a list")

    # ── Pure cross_ref_errors cases ──────────────────────────────────────────

    catalog_ids = {"A11Y-1", "TOK-1"}

    # Case 8: known id mentioned → no error
    assert_xref_clean("known id mentioned", "See A11Y-1 and TOK-1 for details.", catalog_ids)

    # Case 9: unknown id (real prefix, absent number) → error with line number
    assert_xref_error("unknown id mentioned", "line one\nrefers to A11Y-999 here\n",
                      catalog_ids, "references unknown control id 'A11Y-999'")

    # Confirm the line number is computed correctly for the unknown id.
    case_count += 1
    line_errs = cross_ref_errors("scratch.md", "line one\nrefers to A11Y-999 here\n",
                                 catalog_ids, xref_re)
    if not any(e.startswith("ERROR scratch.md:2:") for e in line_errs):
        failures.append(f"FAIL unknown id line number: expected line 2 — got: {line_errs}")

    # ── tfx-sync parity cases (pure helpers) ─────────────────────────────────

    def assert_clean(name, errs):
        nonlocal case_count
        case_count += 1
        if errs:
            failures.append(f"FAIL {name}: expected no errors — got: {errs}")

    def assert_error(name, errs, needle):
        nonlocal case_count
        case_count += 1
        if not any(needle in e for e in errs):
            failures.append(f"FAIL {name}: expected an error containing {needle!r} — got: {errs}")

    # extract_sync_block: well-formed block returns the inner span; missing close
    # marker returns None.
    case_count += 1
    if extract_sync_block("<!-- tfx-sync:X source -->inner<!-- /tfx-sync:X -->", "X") != "inner":
        failures.append("FAIL extractor well-formed: expected 'inner' span")
    case_count += 1
    if extract_sync_block("<!-- tfx-sync:X -->inner (no close)", "X") is not None:
        failures.append("FAIL extractor unclosed: expected None")

    L0_SOURCE = {"A11Y-1", "A11Y-2", "A11Y-3", "CMP-2"}

    def l0_errs_for_span(span_text):
        """Drive the L0 parity comparison against a synthetic consumer span."""
        if span_text is None:
            return ["ERROR scratch.md [L0-SYNC]: missing tfx-sync:L0 markers"]
        inline = {m.group(0) for m in xref_re.finditer(span_text)}
        if inline != L0_SOURCE:
            return [f"ERROR scratch.md [L0-SYNC]: inline L0 list != catalog L0 set"]
        return []

    # L0 clean: span lists exactly the four → no error.
    assert_clean("L0 clean span",
                 l0_errs_for_span("A11Y-1; A11Y-2; A11Y-3; CMP-2"))
    # L0 missing a control: span omits CMP-2 → error.
    assert_error("L0 missing control",
                 l0_errs_for_span("A11Y-1; A11Y-2; A11Y-3"), "[L0-SYNC]")
    # L0 extra control: span adds A11Y-4 → error.
    assert_error("L0 extra control",
                 l0_errs_for_span("A11Y-1; A11Y-2; A11Y-3; A11Y-4; CMP-2"), "[L0-SYNC]")
    # L0 order / prose-insensitive: different order + surrounding words → clean.
    assert_clean("L0 order-insensitive",
                 l0_errs_for_span("destructive CMP-2 then label A11Y-3, focus A11Y-2, contrast A11Y-1"))
    # L0 missing markers: extract_sync_block None → missing-markers error.
    assert_error("L0 missing markers",
                 l0_errs_for_span(extract_sync_block("no markers here", "L0")),
                 "missing tfx-sync:L0 markers")

    # The detector is an executable L0 consumer. A malformed fixture must be
    # reported; this fails if its path is silently skipped by l0_parity_errors.
    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, "checks"))
        with open(os.path.join(td, "checks", "detect.py"), "w") as fh:
            fh.write("# no L0 marker")
        assert_error("L0 detector consumer is not skipped",
                     l0_parity_errors(td, {cid: {"tier": "L0"} for cid in L0_SOURCE}, xref_re),
                     "checks/detect.py [L0-SYNC]: missing tfx-sync:L0 markers")

    LAY_SOURCE = {"LAY-1", "LAY-2", "LAY-3", "LAY-4", "LAY-5", "LAY-6", "LAY-7"}

    def lay_errs_for_span(span_text):
        """Drive the LAY parity comparison against a synthetic consumer span."""
        if span_text is None:
            return ["ERROR scratch.md [LAY-SYNC]: missing tfx-sync:lay-controls markers"]
        inline = {m.group(0) for m in xref_re.finditer(span_text)}
        if inline != LAY_SOURCE:
            return [f"ERROR scratch.md [LAY-SYNC]: inline LAY list != catalog LAY set"]
        return []

    # LAY clean: span lists exactly the seven → no error.
    assert_clean("LAY clean span",
                 lay_errs_for_span("LAY-1, LAY-2, LAY-3, LAY-4, LAY-5, LAY-6, LAY-7"))
    # LAY missing an id: span omits LAY-4 → error.
    assert_error("LAY missing control",
                 lay_errs_for_span("LAY-1, LAY-2, LAY-3, LAY-5, LAY-6, LAY-7"), "[LAY-SYNC]")
    # LAY extra/ghost id: span adds LAY-8 → error.
    assert_error("LAY extra control",
                 lay_errs_for_span("LAY-1, LAY-2, LAY-3, LAY-4, LAY-5, LAY-6, LAY-7, LAY-8"),
                 "[LAY-SYNC]")
    # LAY missing markers: extract_sync_block None → missing-markers error.
    assert_error("LAY missing markers",
                 lay_errs_for_span(extract_sync_block("no markers here", "lay-controls")),
                 "missing tfx-sync:lay-controls markers")

    # Buzzword parity — drive tokenize_buzzwords + the subset/required-core rules.
    BUZZ_SOURCE = tokenize_buzzwords(
        "streamline(d), empower, supercharge, effortless(ly), seamless(ly), "
        "world-class, revolutionise, leverage, unlock, elevate")

    def buzz_errs(consumer_span):
        consumer = tokenize_buzzwords(consumer_span)
        errs = []
        extra = consumer - BUZZ_SOURCE
        if extra:
            errs.append(f"ERROR scratch.md [SLP9-SYNC]: skill buzzword(s) {{{', '.join(sorted(extra))}}} not in canonical slp-9.md list")
        missing = REQUIRED_CORE - consumer
        if missing:
            errs.append(f"ERROR scratch.md [SLP9-SYNC]: required core buzzword(s) {{{', '.join(sorted(missing))}}} absent")
        return errs

    # Buzzword clean subset: {streamline,empower,supercharge} ⊆ source → no error.
    assert_clean("buzzword clean subset",
                 buzz_errs("streamline, empower, supercharge"))
    # Buzzword full set: consumer == source → no error.
    assert_clean("buzzword full set",
                 buzz_errs("streamline, empower, supercharge, effortless, seamless, "
                           "world-class, revolutionise, leverage, unlock, elevate"))
    # Buzzword rogue token: consumer adds 'disrupt' (not in source) → error.
    assert_error("buzzword rogue token",
                 buzz_errs("streamline, empower, supercharge, disrupt"),
                 "not in canonical slp-9.md list")
    # Buzzword inflection (paren-strip): source streamline(d) → streamline;
    # consumer streamline → match, no error. (Does NOT stem 'streamlined'.)
    case_count += 1
    if "streamline" not in BUZZ_SOURCE or "streamlined" in BUZZ_SOURCE:
        failures.append("FAIL buzzword inflection: streamline(d) should normalize to 'streamline' only")
    assert_clean("buzzword inflection match",
                 buzz_errs("streamline, empower, supercharge"))
    # Buzzword missing core: consumer lacks 'streamline' → required-core error.
    assert_error("buzzword missing core",
                 buzz_errs("empower, supercharge"),
                 "required core buzzword(s)")

    # ── Scope field (products / audiences) cases ───────────────────────────
    # Scoped control with valid values → passes.
    assert_control_clean("scoped control valid",
                         dict(valid_control, products=["glow"],
                              audiences=["students-primary"]))
    # Unknown product value → error.
    assert_control_error("unknown product value",
                         dict(valid_control, products=["glow", "bogus"]),
                         "invalid products values ['bogus']")
    # Empty products list → error telling the author to omit the field.
    assert_control_error("empty products list",
                         dict(valid_control, products=[]),
                         "omit the field for global")
    # audiences as a string, not a list → error.
    assert_control_error("audiences not a list",
                         dict(valid_control, audiences="teachers"),
                         "'audiences' must be a list")

    # ── Enforcement field (enforced / script) cases ─────────────────────────
    # A real script path so the pure validate_control cases don't need disk
    # I/O (file-existence is checked separately, in collect_errors).
    real_script = "checks/token-audit.py"

    # Valid: enforced=script + a matching script path → clean.
    assert_control_clean("enforced script + script path",
                         dict(valid_control, enforced="script", script=real_script))
    # Valid: enforced=partial + a list of script paths → clean.
    assert_control_clean("enforced partial + script list",
                         dict(valid_control, enforced="partial",
                              script=[real_script, "checks/contrast.py"]))
    # Invalid enforced value → error.
    assert_control_error("invalid enforced value",
                         dict(valid_control, enforced="bogus", script=real_script),
                         "invalid enforced 'bogus'")
    # script present, enforced absent → error (script implies enforced must
    # be script/partial; absent doesn't qualify).
    assert_control_error("script without enforced",
                         dict(valid_control, script=real_script),
                         "'script' is present but 'enforced' is not 'script' or 'partial'")
    # enforced=script but no script field → error.
    assert_control_error("enforced script without script field",
                         dict(valid_control, enforced="script"),
                         "requires a 'script' field")
    # enforced=evaluator on a deterministic check → error (evaluator only
    # valid for judgment/hybrid).
    assert_control_error("enforced evaluator on deterministic",
                         dict(valid_control, enforced="evaluator"),
                         "only valid on check 'judgment' or 'hybrid'")
    # enforced=evaluator on a judgment check → clean.
    assert_control_clean("enforced evaluator on judgment",
                         dict(valid_control, check="judgment", enforced="evaluator"))
    # script wrong type (int, not string/list) → error.
    assert_control_error("script wrong type",
                         dict(valid_control, enforced="script", script=42),
                         "'script' must be a string or list of strings")

    # ── Status field cases ───────────────────────────────────────────────
    # status: proposed → clean.
    assert_control_clean("status proposed",
                         dict(valid_control, status="proposed"))
    # status: settled → error (absence means settled; the explicit value is invalid).
    assert_control_error("status settled invalid",
                         dict(valid_control, status="settled"),
                         "invalid status 'settled'")
    # status absent → clean (the base valid_control carries no status).
    assert_control_clean("status absent", dict(valid_control))

    # ── [COUNT-SYNC] cases ─────────────────────────────────────────────────
    count_tmp = tempfile.mkdtemp(prefix="validate-selftest-count-")
    try:
        readme_path = os.path.join(count_tmp, "README.md")

        with open(readme_path, "w") as fh:
            fh.write("This catalog has 48 controls, all documented.")
        assert_clean("count-sync matching count",
                     count_parity_errors(count_tmp, 48))

        with open(readme_path, "w") as fh:
            fh.write("This catalog has 49 controls, all documented.")
        assert_error("count-sync mismatched count",
                     count_parity_errors(count_tmp, 48), "[COUNT-SYNC]")

        with open(readme_path, "w") as fh:
            fh.write("No count claim in this README at all.")
        assert_clean("count-sync no claim",
                     count_parity_errors(count_tmp, 48))

        docs_dir = os.path.join(count_tmp, "docs")
        os.makedirs(docs_dir, exist_ok=True)
        index_path = os.path.join(docs_dir, "index.html")

        with open(readme_path, "w") as fh:
            fh.write("No count claim in this README at all.")
        with open(index_path, "w") as fh:
            fh.write('<span class="pill">48 controls</span>')
        assert_clean("count-sync index.html matching count",
                     count_parity_errors(count_tmp, 48))

        with open(index_path, "w") as fh:
            fh.write('<span class="pill">47 controls</span>')
        assert_error("count-sync index.html mismatched count",
                     count_parity_errors(count_tmp, 48), "[COUNT-SYNC]")

        # ── skills/check-scripts extension ───────────────────────────────
        # Fabricate a skills tree (2 real skills + 1 dir with no SKILL.md,
        # which must not count) and a checks tree (3 check scripts +
        # validate.py + checklib.py, neither of which counts).
        skills_dir = os.path.join(count_tmp, ".claude", "skills")
        for skill_name in ("alpha", "beta"):
            skill_path = os.path.join(skills_dir, skill_name)
            os.makedirs(skill_path, exist_ok=True)
            with open(os.path.join(skill_path, "SKILL.md"), "w") as fh:
                fh.write("---\nname: " + skill_name + "\n---\n")
        os.makedirs(os.path.join(skills_dir, "no-skill-md"), exist_ok=True)

        checks_dir = os.path.join(count_tmp, "checks")
        os.makedirs(checks_dir, exist_ok=True)
        for check_name in ("one.py", "two.py", "three.py", "validate.py", "checklib.py"):
            with open(os.path.join(checks_dir, check_name), "w") as fh:
                fh.write("# fixture\n")

        case_count += 1
        fab_skills, fab_checks = live_skills_count(count_tmp), live_checks_count(count_tmp)
        if (fab_skills, fab_checks) != (2, 3):
            failures.append(
                f"FAIL count-sync fabricated skills/checks trees: expected (2, 3) "
                f"skills/checks — got {(fab_skills, fab_checks)}"
            )

        with open(readme_path, "w") as fh:
            fh.write("This installs 2 skills and 3 check scripts.")
        with open(index_path, "w") as fh:
            fh.write('<span class="pill">48 controls</span>')
        assert_clean("count-sync matching skills and check-scripts counts",
                     count_parity_errors(count_tmp, 48))

        with open(readme_path, "w") as fh:
            fh.write("This installs 5 skills and 3 check scripts.")
        assert_error("count-sync mismatched skills count",
                     count_parity_errors(count_tmp, 48), "[COUNT-SYNC]")

        with open(readme_path, "w") as fh:
            fh.write("This installs 2 skills and 9 check scripts.")
        assert_error("count-sync mismatched check-scripts count",
                     count_parity_errors(count_tmp, 48), "[COUNT-SYNC]")

        with open(readme_path, "w") as fh:
            fh.write("This installs 2 skills and 3 check scripts; 7 checks built today.")
        assert_error("count-sync mismatched checks-built count",
                     count_parity_errors(count_tmp, 48), "[COUNT-SYNC]")

        with open(readme_path, "w") as fh:
            fh.write("No roster claim of any kind in this file at all.")
        assert_clean("count-sync no roster claim",
                     count_parity_errors(count_tmp, 48))
    finally:
        shutil.rmtree(count_tmp, ignore_errors=True)

    # ── [WIRING-SYNC] cases ──────────────────────────────────────────────────
    wiring_tmp = tempfile.mkdtemp(prefix="validate-selftest-wiring-")
    try:
        harness_dir = os.path.join(wiring_tmp, "harness")
        checks_dir = os.path.join(harness_dir, "checks")
        os.makedirs(checks_dir, exist_ok=True)
        # A real-looking script file so "does the file exist" checks pass.
        open(os.path.join(checks_dir, "widget-scan.py"), "w").close()
        # Stub files for the real WIRING_EXEMPT scripts too, and a control
        # claiming each, so the exemption list itself doesn't fire dead-
        # exemption noise in the "clean" cases below (mirrors production,
        # where each exempted script IS claimed by real catalog controls).
        exempt_controls = {}
        for i, sp in enumerate(WIRING_EXEMPT):
            script_abs = os.path.join(harness_dir, sp)
            os.makedirs(os.path.dirname(script_abs), exist_ok=True)
            open(script_abs, "w").close()
            cid = f"EXM-{i}"
            exempt_controls[cid] = {"id": cid, "check": "hybrid", "enforced": "partial", "script": sp}

        pkg_path = os.path.join(wiring_tmp, "package.json")

        control_wired = dict(exempt_controls, **{
            "WGT-1": {"id": "WGT-1", "check": "deterministic", "enforced": "script",
                      "script": "checks/widget-scan.py"}
        })

        # Case: claimed + running (wired in package.json) → clean.
        with open(pkg_path, "w") as fh:
            fh.write('{"scripts": {"prebuild": "python3 harness/checks/widget-scan.py"}}')
        assert_clean("wiring-sync claimed+running",
                     wiring_parity_errors(harness_dir, control_wired))

        # Case: claimed but wired nowhere, not exempted → fires.
        with open(pkg_path, "w") as fh:
            fh.write('{"scripts": {"prebuild": "echo nothing"}}')
        assert_error("wiring-sync claimed+unwired+unexempted",
                     wiring_parity_errors(harness_dir, control_wired), "[WIRING-SYNC]")

        # Case: dead exemption — exempted script no longer claimed by any control.
        assert_error("wiring-sync dead exemption (unclaimed)",
                     wiring_parity_errors(harness_dir, {}), "dead exemption")
    finally:
        shutil.rmtree(wiring_tmp, ignore_errors=True)

    # ── [SKILL-SYNC] cases ────────────────────────────────────────────────────
    skillsync_tmp = tempfile.mkdtemp(prefix="validate-selftest-skillsync-")
    try:
        skill_dir = os.path.join(skillsync_tmp, ".claude", "skills", "x")
        os.makedirs(skill_dir, exist_ok=True)
        skill_path = os.path.join(skill_dir, "SKILL.md")

        base_catalog = {"TOK-1": {"id": "TOK-1"}, "A11Y-1": {"id": "A11Y-1"}}

        # Full fixture catalog also carries every real SKILL_WIRING_GRANDFATHERED
        # id (mirrors production, per the WIRING_EXEMPT self-test pattern above)
        # so the "clean" cases below don't trip the dead-entry check on the
        # real allowlist's own entries.
        gf_ids = sorted(SKILL_WIRING_GRANDFATHERED)
        full_catalog = dict(base_catalog, **{cid: {"id": cid} for cid in gf_ids})

        # Case 1: skill names a known catalog id, and every catalog id (incl.
        # the real grandfathered set) is either mentioned or grandfathered →
        # clean.
        with open(skill_path, "w") as fh:
            fh.write("Apply TOK-1 and A11Y-1 in every component.")
        assert_clean("skill-sync known ids, all wired-or-grandfathered",
                     skill_sync_errors(skillsync_tmp, full_catalog, xref_re))

        # Case 2: skill names a ghost id (real prefix shape, absent from the
        # catalog) → [SKILL-SYNC] ghost error.
        with open(skill_path, "w") as fh:
            fh.write("Apply TOK-1, A11Y-1, and LAY-99 in every component.")
        assert_error("skill-sync ghost id",
                     skill_sync_errors(skillsync_tmp, full_catalog, xref_re),
                     "names LAY-99 which is not in the catalog")

        # Case 3: catalog id absent from all skills, not grandfathered → orphan
        # error.
        with open(skill_path, "w") as fh:
            fh.write("Apply TOK-1 only.")
        assert_error("skill-sync unwired orphan",
                     skill_sync_errors(skillsync_tmp, full_catalog, xref_re),
                     "A11Y-1 is not mentioned in any skill or agent file")

        # Case 4: grandfathered orphan (the real gf_ids, present in the catalog
        # but named in no skill file) → clean, no error.
        with open(skill_path, "w") as fh:
            fh.write("Apply TOK-1 and A11Y-1 only.")
        assert_clean("skill-sync grandfathered orphans clean",
                     skill_sync_errors(skillsync_tmp, full_catalog, xref_re))

        # Case 5: dead grandfather entry — a grandfathered id removed from the
        # catalog (simulating "no longer a catalog id at all") → error.
        dead_catalog = {k: v for k, v in full_catalog.items() if k != gf_ids[0]}
        with open(skill_path, "w") as fh:
            fh.write("Apply TOK-1 and A11Y-1 only.")
        assert_error("skill-sync dead grandfather entry",
                     skill_sync_errors(skillsync_tmp, dead_catalog, xref_re),
                     "dead entry")
    finally:
        shutil.rmtree(skillsync_tmp, ignore_errors=True)

    # ── [VOICE-SYNC] / [TONE-SYNC] / [UITEXT-SYNC] cases ─────────────────────
    # Lay out a synthetic repo: harness/.claude/skills/copy/SKILL.md (source,
    # <!-- --> markers) and content/guidelines/*.mdx one level up (consumers,
    # {/* */} markers) — mirroring the real placement so the helpers' top_root
    # resolution and website-absent bail-out are exercised for real.
    copy_tmp = tempfile.mkdtemp(prefix="validate-selftest-copysync-")
    try:
        harness_dir = os.path.join(copy_tmp, "harness")
        skill_dir = os.path.join(harness_dir, ".claude", "skills", "copy")
        os.makedirs(skill_dir)
        skill_path = os.path.join(skill_dir, "SKILL.md")
        guide_dir = os.path.join(copy_tmp, "content", "guidelines")
        os.makedirs(guide_dir)
        voice_path = os.path.join(guide_dir, "voice-tone.mdx")
        uitext_path = os.path.join(guide_dir, "ui-text.mdx")

        skill_md = (
            "<!-- tfx-sync:voice-attributes source -->\n"
            "| We are | We are not |\n|---|---|\n"
            "| Clear but not cold | Robotic or detached |\n"
            "<!-- /tfx-sync:voice-attributes -->\n\n"
            "<!-- tfx-sync:tone-context source -->\n"
            "| Context | Tone | Direction |\n|---|---|---|\n"
            "| Destructive action | Sober, precise | Plain consequences, no drama (CMP-2) |\n"
            "<!-- /tfx-sync:tone-context -->\n\n"
            "<!-- tfx-sync:uitext-sequence source -->\n"
            "1. **Draft.** a\n2. **Purposeful.** b\n3. **Concise.** c\n"
            "4. **Conversational.** d\n5. **Clear.** e\n"
            "<!-- /tfx-sync:uitext-sequence -->\n"
        )
        with open(skill_path, "w") as fh:
            fh.write(skill_md)

        # Consumer voice-tone.mdx: identical rows; the tone cell wraps CMP-2 in a
        # markdown link, which normalization must reduce to bare CMP-2.
        good_voice_mdx = (
            "{/* tfx-sync:voice-attributes */}\n"
            "| We are | We are not |\n| --- | --- |\n"
            "| Clear but not cold | Robotic or detached |\n"
            "{/* /tfx-sync:voice-attributes */}\n\n"
            "{/* tfx-sync:tone-context */}\n"
            "| Context | Tone | Direction |\n| --- | --- | --- |\n"
            "| Destructive action | Sober, precise | Plain consequences, no drama "
            "([CMP-2](/standards/catalog/cmp-2)) |\n"
            "{/* /tfx-sync:tone-context */}\n"
        )
        good_uitext_mdx = (
            "{/* tfx-sync:uitext-sequence */}\n"
            "## 1. Clarify the context, then draft\n"
            "## 2. Edit to be purposeful\n"
            "## 3. Edit to be concise\n"
            "## 4. Edit to be conversational\n"
            "## 5. Edit to be clear\n"
            "{/* /tfx-sync:uitext-sequence */}\n"
            "## 6. Check consistency\n"
        )
        with open(voice_path, "w") as fh:
            fh.write(good_voice_mdx)
        with open(uitext_path, "w") as fh:
            fh.write(good_uitext_mdx)

        # Clean baselines (CMP-2 link normalizes; subset holds).
        assert_clean("voice-sync clean", voice_parity_errors(harness_dir))
        assert_clean("tone-sync clean (CMP-2 link normalizes)",
                     tone_parity_errors(harness_dir))
        assert_clean("uitext-sync clean subset", uitext_parity_errors(harness_dir))

        # Drift: alter one consumer voice row → [VOICE-SYNC].
        with open(voice_path, "w") as fh:
            fh.write(good_voice_mdx.replace("Robotic or detached", "Cold and mechanical"))
        assert_error("voice-sync drift", voice_parity_errors(harness_dir), "[VOICE-SYNC]")
        with open(voice_path, "w") as fh:
            fh.write(good_voice_mdx)

        # Drift: drop a step name from the ui-text headings → [UITEXT-SYNC].
        with open(uitext_path, "w") as fh:
            fh.write(good_uitext_mdx.replace("## 5. Edit to be clear\n", ""))
        assert_error("uitext-sync missing step",
                     uitext_parity_errors(harness_dir), "[UITEXT-SYNC]")
        with open(uitext_path, "w") as fh:
            fh.write(good_uitext_mdx)

        # Missing consumer markers → error.
        with open(voice_path, "w") as fh:
            fh.write("no markers here")
        assert_error("voice-sync missing consumer markers",
                     voice_parity_errors(harness_dir),
                     "missing tfx-sync:voice-attributes consumer markers")
        with open(voice_path, "w") as fh:
            fh.write(good_voice_mdx)

        # Website tree absent → all three bail out clean.
        shutil.rmtree(os.path.join(copy_tmp, "content"))
        assert_clean("voice-sync website-absent bail-out",
                     voice_parity_errors(harness_dir))
        assert_clean("tone-sync website-absent bail-out",
                     tone_parity_errors(harness_dir))
        assert_clean("uitext-sync website-absent bail-out",
                     uitext_parity_errors(harness_dir))
    finally:
        shutil.rmtree(copy_tmp, ignore_errors=True)

    # ── Filesystem integration case for collect_errors ───────────────────────

    tmp_root = tempfile.mkdtemp(prefix="validate-selftest-")
    try:
        standards_dir = os.path.join(tmp_root, "standards")
        controls_dir = os.path.join(standards_dir, "controls")
        os.makedirs(controls_dir)

        # Copy the real schema.json so allowed values match the real validator.
        shutil.copyfile(
            os.path.join(REPO_ROOT, "standards", "schema.json"),
            os.path.join(standards_dir, "schema.json"),
        )

        # Minimal valid catalog: two L0 deterministic controls, meta.categories
        # covering both prefixes, no detail files (deterministic ⇒ not required).
        valid_catalog = {
            "meta": {"categories": {"TOK": "Tokens", "A11Y": "Accessibility"}},
            "controls": [
                {
                    "id": "TOK-1",
                    "source": "TFX-DS",
                    "title": "Use tokens",
                    "tier": "L0",
                    "check": "deterministic",
                    "phase": ["implement"],
                    "applies_to": ["component"],
                    "verify": "token-audit",
                    "waiver": "none",
                },
                {
                    "id": "A11Y-1",
                    "source": "WCAG",
                    "title": "Contrast",
                    "tier": "L0",
                    "check": "deterministic",
                    "phase": ["implement"],
                    "applies_to": ["page"],
                    "verify": "contrast",
                    "waiver": "none",
                },
            ],
        }
        catalog_path = os.path.join(standards_dir, "catalog.yaml")
        with open(catalog_path, "w") as fh:
            yaml.safe_dump(valid_catalog, fh)

        # Case 10: a minimal valid catalog → no errors
        case_count += 1
        errs = collect_errors(tmp_root)
        if errs:
            failures.append(f"FAIL integration valid catalog: expected no errors — got: {errs}")

        # Case 11: duplicate id → a "duplicate id" error
        dup_catalog = json.loads(json.dumps(valid_catalog))
        dup_catalog["controls"].append(dict(dup_catalog["controls"][0]))
        with open(catalog_path, "w") as fh:
            yaml.safe_dump(dup_catalog, fh)
        case_count += 1
        errs = collect_errors(tmp_root)
        if not any("duplicate id 'TOK-1'" in e for e in errs):
            failures.append(f"FAIL integration duplicate id: expected a duplicate-id error — got: {errs}")

        # Case 12: a judgment control with no detail → "requires a 'detail' file"
        judgment_catalog = json.loads(json.dumps(valid_catalog))
        judgment_catalog["controls"][0]["check"] = "judgment"
        with open(catalog_path, "w") as fh:
            yaml.safe_dump(judgment_catalog, fh)
        case_count += 1
        errs = collect_errors(tmp_root)
        if not any("requires a 'detail' file" in e for e in errs):
            failures.append(f"FAIL integration judgment no detail: expected a detail-file error — got: {errs}")

        # Case 13: enforced=script with a nonexistent script path → error
        # naming the path (this is the on-disk half of the enforcement
        # rules — validate_control alone can't see the filesystem).
        missing_script_catalog = json.loads(json.dumps(valid_catalog))
        missing_script_catalog["controls"][0]["enforced"] = "script"
        missing_script_catalog["controls"][0]["script"] = "checks/does-not-exist.py"
        with open(catalog_path, "w") as fh:
            yaml.safe_dump(missing_script_catalog, fh)
        case_count += 1
        errs = collect_errors(tmp_root)
        if not any("checks/does-not-exist.py" in e and "does not exist" in e for e in errs):
            failures.append(f"FAIL integration missing script path: expected a script-path error — got: {errs}")

        # Case 14: missing catalog → "file not found"
        os.remove(catalog_path)
        case_count += 1
        errs = collect_errors(tmp_root)
        if not any("file not found" in e for e in errs):
            failures.append(f"FAIL integration missing catalog: expected 'file not found' — got: {errs}")
    finally:
        shutil.rmtree(tmp_root, ignore_errors=True)

    # ── Report ───────────────────────────────────────────────────────────────
    checklib.report_self_test(failures, case_count)


# ── Coverage listing ─────────────────────────────────────────────────────────

def effective_enforcement(control):
    """
    Resolve a control's effective 'enforced' value, applying the schema
    default when the field is absent: 'manual' for deterministic/hybrid,
    'evaluator' for judgment. Returns (value, was_defaulted). Pure — no I/O.
    """
    enforced = control.get("enforced")
    if enforced is not None:
        return enforced, False
    return ("evaluator" if control.get("check") == "judgment" else "manual"), True


def format_script(control):
    """Render a control's script: field (string, list, or absent) as one cell."""
    script = control.get("script")
    if isinstance(script, list):
        return ", ".join(script)
    if isinstance(script, str):
        return script
    return "—"


def print_coverage(repo_root):
    """
    Print the derived enforcement-coverage table (id · tier · check ·
    enforced[defaulted] · script) plus a summary count line, and exit 0.
    This replaces hand-maintained gap lists (e.g. plans/README.md's
    direction-finding #1), which drift as controls are added. Read-only —
    never writes back a defaulted value into the catalog.
    """
    catalog_path = os.path.join(repo_root, "standards", "catalog.yaml")
    with open(catalog_path) as fh:
        catalog_data = yaml.safe_load(fh)
    controls = sorted(catalog_data.get("controls", []), key=lambda c: c.get("id", ""))

    counts = {"script": 0, "partial": 0, "manual": 0, "evaluator": 0}
    rows = []
    for control in controls:
        enforced, defaulted = effective_enforcement(control)
        counts[enforced] = counts.get(enforced, 0) + 1
        rows.append((
            control.get("id", "?"),
            control.get("tier", "?"),
            control.get("check", "?"),
            f"{enforced} (default)" if defaulted else enforced,
            format_script(control),
        ))

    header = ("id", "tier", "check", "enforced", "script")
    widths = [
        max(len(header[i]), *(len(r[i]) for r in rows)) if rows else len(header[i])
        for i in range(len(header))
    ]

    def fmt(row):
        return "  ".join(str(cell).ljust(w) for cell, w in zip(row, widths))

    print(fmt(header))
    print(fmt(tuple("-" * w for w in widths)))
    for row in rows:
        print(fmt(row))
    print()
    print(
        f"{counts['script']} script / {counts['partial']} partial / "
        f"{counts['manual']} manual / {counts['evaluator']} evaluator "
        f"(total {len(controls)})"
    )


# ── Entry point ──────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if "--self-test" in args:
        run_self_test()
        return  # run_self_test calls sys.exit

    if "--coverage" in args:
        print_coverage(REPO_ROOT)
        sys.exit(0)

    errors, n = collect_errors(REPO_ROOT, _return_count=True)

    if errors:
        for e in errors:
            print(e)
        sys.exit(1)
    else:
        print(f"OK: {n} controls valid")
        sys.exit(0)


if __name__ == "__main__":
    main()
