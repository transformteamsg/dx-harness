#!/usr/bin/env python3
"""
file-feedback-issue.py — file a deduped, labelled harness-feedback GitHub issue.

Implements the workflow in `docs/harness-feedback.md` (the spec — read it first):
the `[harness-feedback]` title marker, the severity + category label scheme, dedup
before filing, and honest failure when `gh` is unavailable. This is an ACTION tool
(it creates issues), so it lives in `scripts/`, not in `checks/` (validators).

The label sets and marker below are duplicated from `docs/harness-feedback.md` by
necessity (this script enforces them). If the doc's scheme changes, update both —
the doc is the source of truth.

Safety:
  - `--self-test` runs pure logic against a stubbed `gh` runner — never the network.
  - `--dry-run` prints the `gh` command + body and files nothing.
  - On `gh` unavailable/unauthenticated, prints the would-be issue + the reason and
    exits non-zero — never a silent skip.

Usage:
  python3 scripts/file-feedback-issue.py --severity med --category tooling \\
      --title "summary" --body "the ask + source context"
  python3 scripts/file-feedback-issue.py --dry-run ...      # rehearse, file nothing
  python3 scripts/file-feedback-issue.py --self-test        # pure, no network
"""

import argparse
import json
import shutil
import subprocess
import sys
from collections import namedtuple

# ── Scheme (mirrors docs/harness-feedback.md — the source of truth) ──────────────
MARKER = "[harness-feedback]"
SEVERITIES = ("L0-risk", "high", "med", "low")
CATEGORIES = ("a11y", "tooling", "standards", "harness-ux", "onboarding")
DEFAULT_REPO = "transformteamsg/dx-harness"

GhResult = namedtuple("GhResult", ["returncode", "stdout", "stderr"])
Preflight = namedtuple("Preflight", ["available", "reason"])


def _subprocess_runner(args):
    """The real seam: invoke `gh` and return a GhResult. Replaced by a fake in tests."""
    proc = subprocess.run(["gh", *args], capture_output=True, text=True)
    return GhResult(proc.returncode, proc.stdout, proc.stderr)


def run_gh(args, *, runner=None):
    """The one place `gh` is invoked. `runner` is injectable for tests."""
    return (runner or _subprocess_runner)(args)


def normalize_title(summary):
    """Prepend the marker if absent (idempotent — never double-prefix)."""
    s = summary.strip()
    if s.lower().startswith(MARKER.lower()):
        return s
    return f"{MARKER} {s}"


def build_labels(severity, categories):
    """One severity + ≥1 category; validate against the allowed sets."""
    if severity not in SEVERITIES:
        raise ValueError(
            f"unknown severity {severity!r}; allowed: {', '.join(SEVERITIES)}"
        )
    if not categories:
        raise ValueError("at least one --category is required")
    unknown = [c for c in categories if c not in CATEGORIES]
    if unknown:
        raise ValueError(
            f"unknown category {', '.join(unknown)}; allowed: {', '.join(CATEGORIES)}"
        )
    return [severity, *categories]


def preflight(*, runner, which):
    """which('gh') and (if found) `gh auth status`. Returns a Preflight."""
    if which("gh") is None:
        return Preflight(False, "gh not found on PATH")
    res = run_gh(["auth", "status"], runner=runner)
    if res.returncode != 0:
        reason = (res.stderr or res.stdout or "gh auth status failed").strip()
        return Preflight(False, f"gh not authenticated: {reason}")
    return Preflight(True, "")


def _marker_stripped(title):
    t = title.strip()
    if t.lower().startswith(MARKER.lower()):
        t = t[len(MARKER):].strip()
    return t.lower()


def find_duplicate(title, *, runner):
    """Return the first existing issue whose marker-stripped title matches `title`,
    or None. GitHub --search is fuzzy full-text, so re-filter in code by exact
    marker prefix + summary equality."""
    summary = _marker_stripped(title)
    query = f"{MARKER} {summary}"
    res = run_gh(
        ["issue", "list", "--search", query, "--state", "all",
         "--json", "number,title,state"],
        runner=runner,
    )
    if res.returncode != 0:
        return None
    try:
        issues = json.loads(res.stdout or "[]")
    except (ValueError, TypeError):
        return None
    for issue in issues:
        it = issue.get("title", "")
        # exact match: the candidate must carry the marker and the same summary
        if it.strip().lower().startswith(MARKER.lower()) and \
                _marker_stripped(it) == summary:
            return issue
    return None


def _print_would_be(title, labels, body):
    print("── would-be issue ──────────────────────────────────────────")
    print(f"title:  {title}")
    print(f"labels: {', '.join(labels)}")
    print("body:")
    print(body)
    print("────────────────────────────────────────────────────────────")


def main(argv=None, *, runner=_subprocess_runner, which=shutil.which):
    argv = sys.argv[1:] if argv is None else argv
    if "--self-test" in argv:
        return run_self_test()

    p = argparse.ArgumentParser(description="File a deduped, labelled harness-feedback issue.")
    p.add_argument("--title", required=True)
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--body")
    g.add_argument("--body-file")
    p.add_argument("--severity", required=True, choices=SEVERITIES)
    p.add_argument("--category", action="append", default=[], choices=CATEGORIES,
                   help="repeatable; at least one")
    p.add_argument("--repo", default=DEFAULT_REPO)
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--self-test", action="store_true")
    args = p.parse_args(argv)

    title = normalize_title(args.title)
    try:
        labels = build_labels(args.severity, args.category)
    except ValueError as exc:
        print(f"ERROR: {exc}")
        return 2
    body = args.body
    if body is None:
        try:
            with open(args.body_file, encoding="utf-8") as fh:
                body = fh.read()
        except OSError as exc:
            print(f"ERROR: cannot read --body-file {args.body_file}: {exc}")
            return 2

    # ── Honest failure: gh unavailable → print the would-be issue + reason ──────
    pf = preflight(runner=runner, which=which)
    if not pf.available:
        print(f"gh unavailable — issue NOT filed. Reason: {pf.reason}")
        _print_would_be(title, labels, body)
        return 3

    # ── Dedup ───────────────────────────────────────────────────────────────────
    dup = find_duplicate(title, runner=runner)
    if dup is not None:
        n = dup.get("number")
        print(f"duplicate of #{n} ({dup.get('state', '?')}) — comment instead of creating")
        if not args.dry_run:
            run_gh(["issue", "comment", str(n), "--repo", args.repo, "--body", body],
                   runner=runner)
            print(f"commented on #{n}")
        return 0

    # ── Dry-run: print the command + body, file nothing ──────────────────────────
    label_flags = " ".join(f'--label {l}' for l in labels)
    if args.dry_run:
        print("DRY RUN — would file:")
        print(f"gh issue create --repo {args.repo} --title {title!r} "
              f"{label_flags} --body <body>")
        _print_would_be(title, labels, body)
        return 0

    # ── File for real ─────────────────────────────────────────────────────────────
    create_args = ["issue", "create", "--repo", args.repo, "--title", title,
                   "--body", body]
    for l in labels:
        create_args += ["--label", l]
    res = run_gh(create_args, runner=runner)
    if res.returncode != 0:
        print(f"gh issue create failed — issue NOT filed. Reason: "
              f"{(res.stderr or res.stdout or '').strip()}")
        _print_would_be(title, labels, body)
        return 3
    print((res.stdout or "").strip() or "issue created")
    return 0


# ── Self-test (pure, no network — stubbed gh runner) ─────────────────────────────

def run_self_test():
    import io
    import contextlib

    failures = []
    case_count = 0

    class FakeRunner:
        """Records calls; returns canned responses. Never touches the network."""
        def __init__(self, issue_list_json="[]", auth_ok=True, create_ok=True):
            self.calls = []
            self.issue_list_json = issue_list_json
            self.auth_ok = auth_ok
            self.create_ok = create_ok

        def __call__(self, args):
            self.calls.append(args)
            if args[:2] == ["auth", "status"]:
                return GhResult(0 if self.auth_ok else 1, "", "" if self.auth_ok else "no auth")
            if args[:2] == ["issue", "list"]:
                return GhResult(0, self.issue_list_json, "")
            if args[:2] == ["issue", "create"]:
                return GhResult(0 if self.create_ok else 1,
                                "https://github.com/x/y/issues/123" if self.create_ok else "",
                                "" if self.create_ok else "boom")
            if args[:2] == ["issue", "comment"]:
                return GhResult(0, "", "")
            return GhResult(0, "", "")

        def created(self):
            return [c for c in self.calls if c[:2] == ["issue", "create"]]

    def check(name, cond):
        nonlocal case_count
        case_count += 1
        if not cond:
            failures.append(f"FAIL {name}")

    # 1. marker idempotency
    check("normalize adds marker", normalize_title("X") == f"{MARKER} X")
    check("normalize idempotent", normalize_title(f"{MARKER} X") == f"{MARKER} X")

    # 2. labels assembled + unknown errors
    check("labels assembled",
          build_labels("L0-risk", ["a11y", "standards"]) == ["L0-risk", "a11y", "standards"])
    bad_sev = False
    try:
        build_labels("nope", ["a11y"])
    except ValueError:
        bad_sev = True
    check("unknown severity raises", bad_sev)
    bad_cat = False
    try:
        build_labels("low", ["nonsense"])
    except ValueError:
        bad_cat = True
    check("unknown category raises", bad_cat)

    # 3. dedup hit
    dup_json = json.dumps([{"number": 42, "title": f"{MARKER} X", "state": "open"}])
    fake = FakeRunner(issue_list_json=dup_json)
    hit = find_duplicate(normalize_title("X"), runner=fake)
    check("dedup hit returns issue", hit is not None and hit["number"] == 42)

    # 4. dedup miss (and a fuzzy-but-different title is NOT a match)
    fuzzy_json = json.dumps([{"number": 7, "title": f"{MARKER} something else", "state": "open"}])
    miss = find_duplicate(normalize_title("X"), runner=FakeRunner(issue_list_json=fuzzy_json))
    check("dedup miss returns None", miss is None)

    # 5. honest failure: gh absent → non-zero, prints body, no create call
    fake5 = FakeRunner()
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        rc5 = main(["--severity", "med", "--category", "tooling",
                    "--title", "X", "--body", "BODY-MARKER-5"],
                   runner=fake5, which=lambda _n: None)
    out5 = buf.getvalue()
    check("honest failure non-zero exit", rc5 != 0)
    check("honest failure prints body", "BODY-MARKER-5" in out5)
    check("honest failure files nothing", fake5.created() == [])

    # 6. dry-run: gh present → no create call, exit 0
    fake6 = FakeRunner()
    buf6 = io.StringIO()
    with contextlib.redirect_stdout(buf6):
        rc6 = main(["--severity", "med", "--category", "tooling",
                    "--title", "X", "--body", "BODY-6", "--dry-run"],
                   runner=fake6, which=lambda _n: "/usr/bin/gh")
    check("dry-run exit 0", rc6 == 0)
    check("dry-run files nothing", fake6.created() == [])

    # 7. real create path (stubbed): files exactly one issue, exit 0
    fake7 = FakeRunner()
    buf7 = io.StringIO()
    with contextlib.redirect_stdout(buf7):
        rc7 = main(["--severity", "high", "--category", "a11y",
                    "--title", "brand new", "--body", "B"],
                   runner=fake7, which=lambda _n: "/usr/bin/gh")
    check("real create exit 0", rc7 == 0)
    check("real create files one issue", len(fake7.created()) == 1)

    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {case_count} cases run)")
        return 1
    print(f"SELF-TEST OK ({case_count} cases)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
