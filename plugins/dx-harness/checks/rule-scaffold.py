#!/usr/bin/env python3
"""
Rule scaffold check — checks/rule-scaffold.py
Validates the rule set and the presets that docs/adr/0001-rule-set-and-presets.md
decides, against the schemas in standards/:
  1. Every rule file under standards/rules/ (the `_template.md` excepted) has
     frontmatter that matches rule-schema.json, a `code` prefix equal to its
     `category`, and a `slug` equal to its file name.
  2. Every preset under standards/presets/ has frontmatter that matches
     preset-schema.json, and sets only parameters that some rule declares.
  3. Every control ID in standards/catalog.yaml is covered by a rule file, an
     entry in standards/rules/redirects.yaml, or a rule with status `removed`.
     An ID with no home is listed as unresolved. The list is ADVISORY: it
     prints and never fails the check, until C14 (#413) makes it fail.
A missing or empty redirects.yaml is valid. It maps each old code to one new
code or to a list of new codes.

This reads catalog.yaml for its IDs only. It does not change how any other
check reads the catalogue.

Usage:
  python3 checks/rule-scaffold.py [<standards-dir>]   # default: ../standards
  python3 checks/rule-scaffold.py --self-test

Exit 0 and print "OK: <n> rules, <m> presets valid" when every file is valid.
Exit 1 and print "ERROR <file>: <field>: <message>" lines on failure.
"""

import importlib.util
import json
import os
import re
import sys

CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))
PLUGIN_ROOT = os.path.dirname(CHECKS_DIR)
DEFAULT_STANDARDS_DIR = os.path.join(PLUGIN_ROOT, "standards")


def _load_checklib():
    path = os.path.join(CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_dx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()

try:
    import yaml
except ImportError:
    print("ERROR rule-scaffold.py: cannot import yaml — install pyyaml")
    sys.exit(1)

_FRONTMATTER = re.compile(r"\A---\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|\Z)", re.DOTALL)


def read_frontmatter(path):
    """Returns (data, error). `data` is the parsed frontmatter mapping;
    `error` is a message when the file has none, it does not parse, or it is
    not a mapping."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
    except OSError as exc:
        return None, f"cannot read this file ({exc})"
    match = _FRONTMATTER.match(text)
    if not match:
        return None, "no YAML frontmatter between --- lines"
    try:
        data = yaml.safe_load(match.group(1))
    except yaml.YAMLError as exc:
        return None, f"frontmatter does not parse ({exc})"
    if not isinstance(data, dict):
        return None, "frontmatter is not a mapping"
    return data, None


# ── A small JSON Schema reader ────────────────────────────────────────────────
# Only the keywords the two schemas use: type, enum, pattern, minLength,
# minItems, uniqueItems, items, required, properties, additionalProperties.
# PyYAML is the only Python dependency the checks install, so there is no
# jsonschema package to call.

_TYPES = {
    "object": dict,
    "array": list,
    "string": str,
    "number": (int, float),
    "boolean": bool,
}


def _join(path, key):
    return f"{path}.{key}" if path else str(key)


def validate_schema(value, schema, path=""):
    """Returns a list of (field, message). `field` is a dotted path from the
    frontmatter root, or `(frontmatter)` for the root itself."""
    errors = []
    here = path or "(frontmatter)"
    if "type" in schema:
        expected = _TYPES[schema["type"]]
        is_number = schema["type"] == "number" and isinstance(value, bool)
        if not isinstance(value, expected) or is_number:
            return [(here, f"must be of type {schema['type']}")]
    if "enum" in schema and value not in schema["enum"]:
        allowed = ", ".join(str(v) for v in schema["enum"])
        return [(here, f"{value!r} is not one of: {allowed}")]
    if isinstance(value, str):
        if "pattern" in schema and not re.search(schema["pattern"], value):
            errors.append((here, f"{value!r} does not match {schema['pattern']}"))
        if len(value) < schema.get("minLength", 0):
            errors.append((here, "must not be empty"))
    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            errors.append((here, f"must have at least {schema['minItems']} item(s)"))
        if schema.get("uniqueItems") and len(set(map(repr, value))) != len(value):
            errors.append((here, "must not repeat an item"))
        if "items" in schema:
            for index, item in enumerate(value):
                errors.extend(validate_schema(item, schema["items"], _join(path, index)))
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value:
                errors.append((_join(path, key), "required field is missing"))
        properties = schema.get("properties", {})
        extra = schema.get("additionalProperties", True)
        for key, item in value.items():
            if key in properties:
                errors.extend(validate_schema(item, properties[key], _join(path, key)))
            elif extra is False:
                errors.append((_join(path, key), "is not a field of this schema"))
            elif isinstance(extra, dict):
                errors.extend(validate_schema(item, extra, _join(path, key)))
    return errors


def load_schema(standards_dir, name):
    with open(os.path.join(standards_dir, name), "r", encoding="utf-8") as f:
        return json.load(f)


def _markdown_files(root, skip_underscore=True):
    if not os.path.isdir(root):
        return []
    found = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames.sort()
        for name in sorted(filenames):
            if not name.endswith(".md"):
                continue
            if skip_underscore and name.startswith("_"):
                continue
            found.append(os.path.join(dirpath, name))
    return found


def check_rules(standards_dir, schema):
    """Returns (errors, rules). `rules` maps a rule's code to its frontmatter,
    for every rule file that parsed, so the later steps still see a file that
    failed on one field."""
    errors = []
    rules = {}
    for path in _markdown_files(os.path.join(standards_dir, "rules")):
        rel = os.path.relpath(path, standards_dir)
        data, error = read_frontmatter(path)
        if error:
            errors.append(f"ERROR {rel}: (frontmatter): {error}")
            continue
        for field, message in validate_schema(data, schema):
            errors.append(f"ERROR {rel}: {field}: {message}")
        code, category, slug = data.get("code"), data.get("category"), data.get("slug")
        if isinstance(code, str) and isinstance(category, str):
            if not code.startswith(category + "-"):
                errors.append(f"ERROR {rel}: code: {code!r} does not start with category {category!r}")
        stem = os.path.splitext(os.path.basename(path))[0]
        if isinstance(slug, str) and slug != stem:
            errors.append(f"ERROR {rel}: slug: {slug!r} does not match the file name {stem!r}")
        if isinstance(code, str):
            rules[code] = data
    return errors, rules


def declared_parameters(rules):
    names = set()
    for data in rules.values():
        params = data.get("parameters")
        if isinstance(params, dict):
            names.update(params)
    return names


def check_presets(standards_dir, schema, declared):
    """Returns (errors, count). A preset that sets a parameter no rule
    declares fails, naming the preset and the parameter."""
    errors = []
    paths = _markdown_files(os.path.join(standards_dir, "presets"))
    for path in paths:
        rel = os.path.relpath(path, standards_dir)
        data, error = read_frontmatter(path)
        if error:
            errors.append(f"ERROR {rel}: (frontmatter): {error}")
            continue
        for field, message in validate_schema(data, schema):
            errors.append(f"ERROR {rel}: {field}: {message}")
        params = data.get("parameters")
        if isinstance(params, dict):
            for name in params:
                if name not in declared:
                    errors.append(
                        f"ERROR {rel}: parameters.{name}: no rule declares the parameter {name!r}"
                    )
    return errors, len(paths)


def read_redirects(standards_dir):
    """Returns (old codes, errors). A missing or empty file is valid."""
    path = os.path.join(standards_dir, "rules", "redirects.yaml")
    rel = os.path.relpath(path, standards_dir)
    if not os.path.isfile(path):
        return set(), []
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
    except (OSError, yaml.YAMLError) as exc:
        return set(), [f"ERROR {rel}: (file): cannot read as YAML ({exc})"]
    if data is None:
        return set(), []
    if not isinstance(data, dict):
        return set(), [f"ERROR {rel}: (file): must map each old code to its new codes"]
    errors = []
    for old, new in data.items():
        targets = new if isinstance(new, list) else [new]
        if not targets or not all(isinstance(t, str) and t for t in targets):
            errors.append(f"ERROR {rel}: {old}: must be a code or a non-empty list of codes")
    return set(map(str, data)), errors


def catalog_ids(standards_dir):
    path = os.path.join(standards_dir, "catalog.yaml")
    if not os.path.isfile(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    controls = data.get("controls") if isinstance(data, dict) else None
    return [c["id"] for c in controls or [] if isinstance(c, dict) and "id" in c]


def unresolved_ids(standards_dir, rules, redirected):
    """Catalogue IDs that no rule file, redirect, or `removed` rule covers. A
    `removed` rule is a rule file, so its code is covered with the rest."""
    covered = set(rules) | redirected
    return [i for i in catalog_ids(standards_dir) if i not in covered]


def scan(standards_dir):
    """Returns (errors, unresolved, rule count, preset count)."""
    rule_schema = load_schema(standards_dir, "rule-schema.json")
    preset_schema = load_schema(standards_dir, "preset-schema.json")
    errors, rules = check_rules(standards_dir, rule_schema)
    preset_errors, preset_count = check_presets(
        standards_dir, preset_schema, declared_parameters(rules)
    )
    redirected, redirect_errors = read_redirects(standards_dir)
    unresolved = unresolved_ids(standards_dir, rules, redirected)
    return errors + preset_errors + redirect_errors, unresolved, len(rules), preset_count


def run_self_test():
    import shutil
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

    def rule_text(**overrides):
        fields = {
            "code": "TOK-1",
            "slug": "no-raw-colour",
            "category": "TOK",
            "tier": "L1",
            "status": "stable",
            "check": "deterministic",
            "applies_to": "[page, component]",
        }
        fields.update(overrides)
        lines = [f"{k}: {v}" for k, v in fields.items() if v is not None]
        return "---\n" + "\n".join(lines) + "\n---\n\n# Body\n"

    def fixture(td, catalog_ids_=("TOK-1",)):
        standards = os.path.join(td, "standards")
        for name in ("rule-schema.json", "preset-schema.json"):
            shutil.copy(os.path.join(DEFAULT_STANDARDS_DIR, name), standards_path(standards, name))
        controls = "".join(f"  - id: {i}\n" for i in catalog_ids_)
        write(os.path.join(standards, "catalog.yaml"), "controls:\n" + controls)
        return standards

    def standards_path(standards, name):
        os.makedirs(standards, exist_ok=True)
        return os.path.join(standards, name)

    # AC1: a valid rule file passes, and a missing redirects.yaml is accepted.
    with tempfile.TemporaryDirectory() as td:
        standards = fixture(td)
        write(os.path.join(standards, "rules", "tok", "no-raw-colour.md"), rule_text())
        errors, unresolved, rule_count, _ = scan(standards)
        check_true(
            "AC1 valid rule file passes",
            errors == [] and rule_count == 1 and unresolved == [],
            f"got {errors!r}, {unresolved!r}",
        )

    # AC2: a missing required field fails, naming the file and the field.
    with tempfile.TemporaryDirectory() as td:
        standards = fixture(td)
        write(os.path.join(standards, "rules", "tok", "no-raw-colour.md"), rule_text(tier=None))
        errors, _, _, _ = scan(standards)
        check_true(
            "AC2 missing required field names file and field",
            len(errors) == 1 and "no-raw-colour.md" in errors[0] and ": tier:" in errors[0],
            f"got {errors!r}",
        )

    # AC2: a category outside the eight fails, naming the file and the field.
    with tempfile.TemporaryDirectory() as td:
        standards = fixture(td)
        write(
            os.path.join(standards, "rules", "slp", "no-raw-colour.md"),
            rule_text(code="SLP-1", category="SLP"),
        )
        errors, _, _, _ = scan(standards)
        check_true(
            "AC2 category outside the eight fails with file and field",
            any("no-raw-colour.md" in e and ": category:" in e for e in errors),
            f"got {errors!r}",
        )

    # An unreadable frontmatter fails the file instead of passing it.
    with tempfile.TemporaryDirectory() as td:
        standards = fixture(td)
        write(os.path.join(standards, "rules", "tok", "bare.md"), "# No frontmatter\n")
        errors, _, _, _ = scan(standards)
        check_true(
            "a rule file with no frontmatter fails",
            len(errors) == 1 and "bare.md" in errors[0],
            f"got {errors!r}",
        )

    # A code outside its category, and a slug that is not the file name, fail.
    with tempfile.TemporaryDirectory() as td:
        standards = fixture(td)
        write(
            os.path.join(standards, "rules", "tok", "no-raw-colour.md"),
            rule_text(code="COL-1", slug="other"),
        )
        errors, _, _, _ = scan(standards)
        check_true(
            "code prefix and slug must agree with category and file name",
            any(": code:" in e for e in errors) and any(": slug:" in e for e in errors),
            f"got {errors!r}",
        )

    # The template is skipped by the scan and is itself valid.
    template = os.path.join(DEFAULT_STANDARDS_DIR, "rules", "_template.md")
    data, error = read_frontmatter(template)
    schema = load_schema(DEFAULT_STANDARDS_DIR, "rule-schema.json")
    check_true(
        "the rule template matches the rule schema",
        error is None and validate_schema(data, schema) == [],
        f"got {error!r}",
    )

    # AC4: a preset that sets an undeclared parameter fails, naming both.
    with tempfile.TemporaryDirectory() as td:
        standards = fixture(td)
        write(
            os.path.join(standards, "rules", "tok", "no-raw-colour.md"),
            rule_text(
                parameters="\n  primary-colour:\n    type: string\n    description: The brand colour."
            ),
        )
        write(
            os.path.join(standards, "presets", "teacher.md"),
            "---\nname: teacher\nselect: [TOK]\nparameters:\n  primary-colour: \"#112233\"\n  made-up: 1\n---\n",
        )
        errors, _, _, preset_count = scan(standards)
        check_true(
            "AC4 undeclared preset parameter fails with preset and parameter",
            preset_count == 1
            and len(errors) == 1
            and "teacher.md" in errors[0]
            and "made-up" in errors[0],
            f"got {errors!r}",
        )

    # A preset with a category outside the eight fails the preset schema.
    with tempfile.TemporaryDirectory() as td:
        standards = fixture(td)
        write(
            os.path.join(standards, "presets", "teacher.md"),
            "---\nname: teacher\nselect: [SLP]\n---\n",
        )
        errors, _, _, _ = scan(standards)
        check_true(
            "a preset selecting a category outside the eight fails",
            len(errors) == 1 and "teacher.md" in errors[0] and "select.0" in errors[0],
            f"got {errors!r}",
        )

    # AC3: a catalogue ID with no home is unresolved; a rule, a redirect and a
    # removed rule each give an ID a home. Unresolved IDs never add an error.
    with tempfile.TemporaryDirectory() as td:
        standards = fixture(td, ("TOK-1", "TOK-2", "TOK-3", "TOK-4"))
        write(os.path.join(standards, "rules", "tok", "no-raw-colour.md"), rule_text())
        write(
            os.path.join(standards, "rules", "tok", "old-rule.md"),
            rule_text(code="TOK-2", slug="old-rule", status="removed"),
        )
        write(os.path.join(standards, "rules", "redirects.yaml"), "TOK-3: [TOK-1]\n")
        errors, unresolved, _, _ = scan(standards)
        check_true(
            "AC3 an ID with no home is unresolved and does not fail",
            errors == [] and unresolved == ["TOK-4"],
            f"got {errors!r}, {unresolved!r}",
        )

    # An empty redirects.yaml is accepted.
    with tempfile.TemporaryDirectory() as td:
        standards = fixture(td)
        write(os.path.join(standards, "rules", "redirects.yaml"), "")
        errors, unresolved, _, _ = scan(standards)
        check_true(
            "an empty redirects.yaml is accepted",
            errors == [] and unresolved == ["TOK-1"],
            f"got {errors!r}, {unresolved!r}",
        )

    checklib.report_self_test(failures, case_count)


def main():
    args = sys.argv[1:]

    if "--self-test" in args:
        run_self_test()
        return  # run_self_test calls sys.exit

    standards_dir = os.path.abspath(args[0]) if args else DEFAULT_STANDARDS_DIR
    errors, unresolved, rule_count, preset_count = scan(standards_dir)

    for line in errors:
        print(line)
    if unresolved:
        print(
            f"NOTE {len(unresolved)} catalogue IDs have no rule, redirect, or removed rule "
            f"(advisory until C14): {', '.join(unresolved)}"
        )

    if errors:
        sys.exit(1)
    print(f"OK: {rule_count} rules, {preset_count} presets valid")
    sys.exit(0)


if __name__ == "__main__":
    main()
