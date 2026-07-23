#!/usr/bin/env python3
"""
Component manifest validator — checks/component-manifest.py

Validates a product's .tfx/component-manifest.json against the TFX SPEC
(docs/spikes/component-manifest/SPEC.md).

Usage:
  python3 checks/component-manifest.py <manifest.json>    # validate one file
  python3 checks/component-manifest.py --self-test        # run embedded fixtures

Behaviour:
  - Validates schema (required keys, enum values, date format).
  - Only when coverage == "complete": runs the import-diff — flags any component
    import in changed source that resolves outside the manifest.
  - When coverage == "partial" (or absent): import-diff stays OFF; reports
    "partial manifest — diff not run".

Exit codes:
  0 — silent on pass (validate.py convention)
  1 — one ERROR line per violation

False-positive note (SPEC §3):
  The import-diff matches import module paths and exported names against the
  manifest. Re-exports and barrel files can produce false positives when an
  import resolves through a barrel that isn't the manifest's import path.
  The diff is only activated by coverage: "complete" — a team that declares
  complete coverage is asserting the manifest is reliable enough for the diff.
  If you hit false positives, downgrade to coverage: "partial" and the diff
  stays off (same trust lesson as token-audit / plan 007).
"""

import json
import os
import re
import sys
from typing import Optional

# ── Constants ──────────────────────────────────────────────────────────────────
REQUIRED_TOP_LEVEL = ["product", "generated", "source", "components"]
ALLOWED_SOURCES = {"hand-maintained", "generated"}
ALLOWED_COVERAGE = {"complete", "partial"}
ALLOWED_KIND = {"base-ui-wrapper", "composite", "layout", "pattern"}
ALLOWED_STATUS = {"stable", "deprecated", "restricted"}
REQUIRED_COMPONENT_FIELDS = ["name", "import", "kind", "status", "props_summary"]
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

# Import statement patterns (TypeScript/JavaScript/TSX/JSX)
IMPORT_RE = re.compile(
    r"""import\s+(?:type\s+)?(?:\{[^}]*\}|[\w*]+(?:\s+as\s+\w+)?|\*\s+as\s+\w+)"""
    r"""\s+from\s+['"]([^'"]+)['"]""",
    re.MULTILINE,
)
NAMED_IMPORT_RE = re.compile(r"\b(\w+)\b(?:\s+as\s+\w+)?")

errors: list[str] = []


def err(location: str, message: str) -> None:
    errors.append(f"ERROR {location}: {message}")


# ── Schema validation ──────────────────────────────────────────────────────────

def validate_manifest(manifest_path: str, data: dict) -> Optional[dict]:
    """Validate the manifest against the SPEC schema. Returns parsed data on success."""
    loc = manifest_path
    valid = True

    # Required top-level keys
    for field in REQUIRED_TOP_LEVEL:
        if field not in data:
            err(loc, f"missing required field '{field}'")
            valid = False

    # source enum
    source = data.get("source")
    if source is not None and source not in ALLOWED_SOURCES:
        err(loc, f"'source' must be one of {sorted(ALLOWED_SOURCES)}, got {source!r}")
        valid = False

    # coverage enum (optional, default partial)
    coverage = data.get("coverage")
    if coverage is not None and coverage not in ALLOWED_COVERAGE:
        err(loc, f"'coverage' must be one of {sorted(ALLOWED_COVERAGE)}, got {coverage!r}")
        valid = False

    # generated date format
    generated = data.get("generated")
    if generated is not None and not DATE_RE.match(str(generated)):
        err(loc, f"'generated' must be YYYY-MM-DD, got {generated!r}")
        valid = False

    # components: must be non-empty list
    components = data.get("components")
    if not isinstance(components, list) or len(components) == 0:
        err(loc, "'components' must be a non-empty array")
        valid = False
        components = []

    for i, entry in enumerate(components):
        eloc = f"{loc}#components[{i}]"
        if not isinstance(entry, dict):
            err(eloc, "entry is not an object")
            continue

        for field in REQUIRED_COMPONENT_FIELDS:
            if field not in entry:
                err(eloc, f"missing required field '{field}'")
                valid = False

        kind = entry.get("kind")
        if kind is not None and kind not in ALLOWED_KIND:
            err(eloc, f"'kind' must be one of {sorted(ALLOWED_KIND)}, got {kind!r}")
            valid = False

        status = entry.get("status")
        if status is not None and status not in ALLOWED_STATUS:
            err(eloc, f"'status' must be one of {sorted(ALLOWED_STATUS)}, got {status!r}")
            valid = False

        # approver is optional string; only warn when restricted and approver absent
        # (informational — not a schema error, consistent with SPEC)

    if not valid:
        return None
    return data


# ── Import diff ────────────────────────────────────────────────────────────────

def collect_source_files(root: str) -> list[str]:
    """Walk root for .ts/.tsx/.js/.jsx files."""
    result = []
    for dirpath, _dirnames, filenames in os.walk(root):
        # Skip node_modules, .git, .next, dist, out
        parts = dirpath.split(os.sep)
        if any(p in {"node_modules", ".git", ".next", "dist", "out"} for p in parts):
            continue
        for fname in filenames:
            if fname.endswith((".ts", ".tsx", ".js", ".jsx")):
                result.append(os.path.join(dirpath, fname))
    return result


def run_import_diff(manifest_path: str, data: dict, source_root: Optional[str]) -> None:
    """
    Flag imports in source that resolve outside the manifest.
    Only runs when coverage == "complete".
    """
    if source_root is None:
        # No source root given — diff not run; report info, not error
        print(f"INFO {manifest_path}: coverage=complete but no source root provided — diff not run")
        return

    manifest_imports = {entry["import"] for entry in data.get("components", []) if "import" in entry}
    manifest_names = {entry["name"] for entry in data.get("components", []) if "name" in entry}

    source_files = collect_source_files(source_root)
    findings = []

    for fpath in source_files:
        try:
            content = open(fpath).read()
        except (OSError, UnicodeDecodeError):
            continue

        for m in IMPORT_RE.finditer(content):
            module_path = m.group(1)
            # Check if module resolves to a manifest import
            if module_path in manifest_imports:
                continue  # Known manifest import — OK

            # Extract named exports from the import statement
            full_import = m.group(0)
            # Get the part between { } if it exists
            named_match = re.search(r"\{([^}]*)\}", full_import)
            if named_match:
                raw_names = named_match.group(1)
                imported_names = [
                    n.strip().split(" as ")[0].strip()
                    for n in raw_names.split(",")
                    if n.strip()
                ]
                # If all imported names are in the manifest, treat as OK (barrel re-export)
                if imported_names and all(n in manifest_names for n in imported_names):
                    continue  # Barrel re-export of known components — skip

            # Unknown import
            rel = os.path.relpath(fpath, source_root)
            line_no = content[:m.start()].count("\n") + 1
            findings.append(
                f"ERROR {rel}:{line_no}: "
                f"import from '{module_path}' not in manifest (CMP-1 finding)"
            )

    for f in findings:
        errors.append(f)


# ── Main ────────────────────────────────────────────────────────────────────────

def run_validate(manifest_path: str, source_root: Optional[str] = None) -> None:
    """Validate one manifest file."""
    if not os.path.isfile(manifest_path):
        err(manifest_path, "file not found")
        return

    try:
        with open(manifest_path) as fh:
            data = json.load(fh)
    except json.JSONDecodeError as exc:
        err(manifest_path, f"JSON parse error: {exc}")
        return

    if not isinstance(data, dict):
        err(manifest_path, "manifest must be a JSON object")
        return

    parsed = validate_manifest(manifest_path, data)
    if parsed is None:
        return  # Schema errors already recorded

    coverage = parsed.get("coverage", "partial")
    generated = parsed.get("generated", "<unknown>")

    if coverage == "complete":
        run_import_diff(manifest_path, parsed, source_root)
    else:
        # Informational — not an error
        print(
            f"INFO {manifest_path}: partial manifest (generated: {generated}) — diff not run"
        )


# ── Self-test ────────────────────────────────────────────────────────────────────

FIXTURE_VALID_COMPLETE = {
    "product": "teacher-workspace",
    "generated": "2026-06-16",
    "source": "hand-maintained",
    "coverage": "complete",
    "components": [
        {
            "name": "Button",
            "import": "~/components/ui/button",
            "kind": "base-ui-wrapper",
            "status": "stable",
            "props_summary": "Primary action button; variant prop: primary|secondary|ghost|destructive.",
            "replaces": ["custom buttons", "inline anchor styled as button"],
        },
        {
            "name": "Dialog",
            "import": "~/components/ui/dialog",
            "kind": "pattern",
            "status": "stable",
            "props_summary": "Modal dialog with accessible focus trap and close button.",
            "replaces": ["custom modals", "inline confirm prompts"],
        },
        {
            "name": "LegacyWidget",
            "import": "~/components/ui/legacy-widget",
            "kind": "composite",
            "status": "restricted",
            "approver": "design-lead",
            "props_summary": "Deprecated complex widget; restricted pending DS replacement.",
        },
    ],
}

FIXTURE_VALID_PARTIAL = {
    "product": "casesync",
    "generated": "2026-06-10",
    "source": "hand-maintained",
    "coverage": "partial",
    "components": [
        {
            "name": "Button",
            "import": "@base-ui/react",
            "kind": "base-ui-wrapper",
            "status": "stable",
            "props_summary": "CaseSync Button wrapper.",
        }
    ],
}

FIXTURE_SCHEMA_INVALID = {
    "product": "glow",
    # Missing "generated", "source", "components"
    "coverage": "unknown-value",  # invalid enum
}

FIXTURE_COMPLETE_UNKNOWN_IMPORT = {
    "product": "teacher-workspace",
    "generated": "2026-06-16",
    "source": "hand-maintained",
    "coverage": "complete",
    "components": [
        {
            "name": "Button",
            "import": "~/components/ui/button",
            "kind": "base-ui-wrapper",
            "status": "stable",
            "props_summary": "Button.",
        }
    ],
}

# Fake source content that imports from an unknown module
FIXTURE_UNKNOWN_IMPORT_SOURCE = """
import { CustomWidget } from '~/components/custom/custom-widget';
import { Button } from '~/components/ui/button';
"""


def run_self_test() -> None:
    import tempfile
    import shutil

    passed = 0
    failed = 0

    def _assert(name: str, condition: bool, detail: str = "") -> None:
        nonlocal passed, failed
        if condition:
            passed += 1
        else:
            failed += 1
            print(f"  FAIL [{name}]: {detail}")

    # ── Case 1: Valid complete manifest — no source root (no diff) ──────────────
    global errors
    errors = []
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(FIXTURE_VALID_COMPLETE, f)
        tmp = f.name
    run_validate(tmp)
    _assert("valid-complete-no-source", errors == [],
            f"expected no errors, got: {errors}")
    os.unlink(tmp)

    # ── Case 2: Valid partial manifest ──────────────────────────────────────────
    errors = []
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(FIXTURE_VALID_PARTIAL, f)
        tmp = f.name
    run_validate(tmp)
    _assert("valid-partial", errors == [],
            f"expected no errors, got: {errors}")
    os.unlink(tmp)

    # ── Case 3: Schema-invalid manifest ────────────────────────────────────────
    errors = []
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(FIXTURE_SCHEMA_INVALID, f)
        tmp = f.name
    run_validate(tmp)
    _assert("schema-invalid-has-errors", len(errors) > 0,
            "expected schema errors but got none")
    has_missing = any("missing required field" in e for e in errors)
    _assert("schema-invalid-missing-required", has_missing,
            f"expected missing-required error, got: {errors}")
    has_enum = any("coverage" in e for e in errors)
    _assert("schema-invalid-bad-enum", has_enum,
            f"expected coverage enum error, got: {errors}")
    os.unlink(tmp)

    # ── Case 4: Complete manifest + source with unknown import → error ──────────
    errors = []
    tmpdir = tempfile.mkdtemp()
    try:
        # Write manifest
        mpath = os.path.join(tmpdir, "component-manifest.json")
        with open(mpath, "w") as f:
            json.dump(FIXTURE_COMPLETE_UNKNOWN_IMPORT, f)
        # Write source file with unknown import
        src_dir = os.path.join(tmpdir, "src")
        os.makedirs(src_dir)
        src_file = os.path.join(src_dir, "page.tsx")
        with open(src_file, "w") as f:
            f.write(FIXTURE_UNKNOWN_IMPORT_SOURCE)

        run_validate(mpath, source_root=tmpdir)
        _assert("complete-unknown-import-error", len(errors) > 0,
                "expected CMP-1 error for unknown import, got none")
        has_cmp1 = any("CMP-1" in e for e in errors)
        _assert("complete-unknown-import-cmp1", has_cmp1,
                f"expected CMP-1 label in error, got: {errors}")
    finally:
        shutil.rmtree(tmpdir)

    # ── Case 5: Complete manifest + source with only known imports → no error ───
    errors = []
    tmpdir = tempfile.mkdtemp()
    try:
        mpath = os.path.join(tmpdir, "component-manifest.json")
        with open(mpath, "w") as f:
            json.dump(FIXTURE_COMPLETE_UNKNOWN_IMPORT, f)
        src_dir = os.path.join(tmpdir, "src")
        os.makedirs(src_dir)
        src_file = os.path.join(src_dir, "page.tsx")
        with open(src_file, "w") as f:
            # Only imports from manifest import path
            f.write("import { Button } from '~/components/ui/button';\n")
        run_validate(mpath, source_root=tmpdir)
        _assert("complete-known-import-no-error", errors == [],
                f"expected no errors for known import, got: {errors}")
    finally:
        shutil.rmtree(tmpdir)

    # ── Case 6: Partial manifest — diff NOT run even with source ───────────────
    errors = []
    tmpdir = tempfile.mkdtemp()
    try:
        mpath = os.path.join(tmpdir, "component-manifest.json")
        with open(mpath, "w") as f:
            json.dump(FIXTURE_VALID_PARTIAL, f)
        src_dir = os.path.join(tmpdir, "src")
        os.makedirs(src_dir)
        src_file = os.path.join(src_dir, "page.tsx")
        with open(src_file, "w") as f:
            # Unknown import — but partial manifest should keep diff OFF
            f.write("import { UnknownWidget } from '~/components/unknown';\n")
        run_validate(mpath, source_root=tmpdir)
        _assert("partial-diff-off", errors == [],
                f"expected no errors (partial, diff off), got: {errors}")
    finally:
        shutil.rmtree(tmpdir)

    # ── Case 7: File not found ─────────────────────────────────────────────────
    errors = []
    run_validate("/nonexistent/path/manifest.json")
    _assert("file-not-found", len(errors) > 0 and "not found" in errors[0],
            f"expected file-not-found error, got: {errors}")

    # ── Case 8: Bad JSON ────────────────────────────────────────────────────────
    errors = []
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        f.write("{ invalid json }")
        tmp = f.name
    run_validate(tmp)
    _assert("bad-json", len(errors) > 0 and "JSON parse error" in errors[0],
            f"expected JSON error, got: {errors}")
    os.unlink(tmp)

    # ── Summary ─────────────────────────────────────────────────────────────────
    errors = []  # Reset for main usage
    total = passed + failed
    if failed == 0:
        print(f"SELF-TEST OK ({total} cases)")
    else:
        print(f"SELF-TEST FAILED: {failed}/{total} cases failed")
        sys.exit(1)


# ── Entry point ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    args = sys.argv[1:]

    if "--self-test" in args:
        run_self_test()
        sys.exit(0)

    if not args:
        print("Usage: python3 checks/component-manifest.py <manifest.json> [<source-root>]")
        print("       python3 checks/component-manifest.py --self-test")
        sys.exit(1)

    manifest_path = args[0]
    source_root = args[1] if len(args) > 1 else None

    run_validate(manifest_path, source_root)

    if errors:
        for e in errors:
            print(e)
        sys.exit(1)
    # Silent exit 0 on pass
