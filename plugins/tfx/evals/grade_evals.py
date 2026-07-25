#!/usr/bin/env python3
"""Grade completed eval runs against their assertions.

Two kinds of assertion, deliberately:

- `script` assertions run a shell command and pass on exit 0. These cost
  nothing, never drift, and are the right tool whenever the question is
  mechanical ("did a file land under review/?", "was the override pinned to an
  exact version?"). Reach for these first.
- `model` assertions are judged by a grader model reading the transcript, the
  recorded gh calls, and the resulting sandbox. These are for claims about
  reasoning that no grep can settle ("did it reach for an override only after
  ruling out a parent upgrade?").

The grader is told to demand evidence and to fail closed. A grader that awards
a pass because the agent *said* it ran the tests, rather than because the
transcript shows the command, produces a suite that always looks green and
therefore tells you nothing.

Usage:
  python grade_evals.py --out workspace/iteration-1
  python grade_evals.py --out workspace/iteration-1 --skill code-review
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

EVALS_DIR = Path(__file__).resolve().parent

GRADER_SCHEMA = {
    "type": "object",
    "required": ["expectations"],
    "properties": {
        "expectations": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "passed", "evidence"],
                "properties": {
                    "id": {"type": "string"},
                    "passed": {"type": "boolean"},
                    "evidence": {
                        "type": "string",
                        "description": "Quote or cite the specific transcript line, file, or recorded call that decides it.",
                    },
                },
            },
        }
    },
}

GRADER_PROMPT = """You are grading one run of a Claude Code skill eval. Decide, for each \
assertion, whether the run satisfied it.

## The user's request
{prompt}

## What correct behaviour looks like
{expected}

## What the agent produced (its final response)
{output}

## Mutating `gh` calls the agent attempted
The eval replaced the `gh` CLI with a stub that records writes instead of performing \
them. This is the authoritative record of what the agent tried to create or edit on \
GitHub. Empty means it attempted no writes.

{gh_calls}

## State of the working sandbox after the run
{sandbox}

## Assertions to grade
{assertions}

## How to grade

Judge only what the evidence shows. An agent claiming it did something is not the \
same as having done it: if an assertion says a command was run or a file was written, \
you need the transcript line or the file itself, not a summary sentence promising it. \
When the evidence is genuinely ambiguous, mark it failed and say what was missing -- a \
suite that awards benefit of the doubt drifts to all-green and stops being able to \
detect a regression.

Cite specific evidence for every verdict, including the passes. Quote the deciding \
line where you can.

Return one entry per assertion, keyed by the assertion's id."""


def read(path, limit=None, default=""):
    if not path.is_file():
        return default
    text = path.read_text(errors="replace")
    if limit and len(text) > limit:
        head = text[: limit // 2]
        tail = text[-limit // 2 :]
        return f"{head}\n\n[... {len(text) - limit} characters elided ...]\n\n{tail}"
    return text


# Directories that say nothing about whether a skill did its job, and would
# drown the parts that do. node_modules in particular is both enormous and full
# of pnpm's symlinks, some of which dangle and cannot be stat'd at all.
SKIP_DIRS = {".git", "node_modules", ".pnpm-store", "vendor", "dist", "build", "__pycache__"}


def describe_sandbox(sandbox, limit=6000):
    """A file listing plus the text of small files the skill likely created."""
    if not sandbox.is_dir():
        return "(no sandbox)"
    lines = []
    skipped = set()
    for path in sorted(sandbox.rglob("*")):
        rel = path.relative_to(sandbox)
        hit = SKIP_DIRS.intersection(rel.parts)
        if hit:
            skipped |= hit
            continue
        if path.is_dir():
            lines.append(f"{rel}/")
            continue
        try:
            lines.append(f"{rel}  ({path.stat().st_size} bytes)")
        except OSError:
            # A dangling symlink is still worth naming; it just has no size.
            lines.append(f"{rel}  (unreadable)")
    if skipped:
        lines.append(f"[{', '.join(sorted(skipped))} present but omitted from this listing]")
    listing = "\n".join(lines) or "(empty)"

    # git log is often the cleanest evidence that a skill committed per scenario.
    try:
        log = subprocess.run(
            ["git", "log", "--oneline", "--no-decorate"],
            cwd=sandbox,
            capture_output=True,
            text=True,
            timeout=30,
        ).stdout.strip()
    except Exception:
        log = ""

    try:
        branch = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=sandbox,
            capture_output=True,
            text=True,
            timeout=30,
        ).stdout.strip()
    except Exception:
        branch = ""

    parts = [f"Files:\n{listing}"]
    if branch:
        parts.append(f"Current branch: {branch}")
    if log:
        parts.append(f"Commits:\n{log}")
    return "\n\n".join(parts)[:limit]


def grade_scripts(assertions, run_dir):
    """Run the mechanical assertions. Returns {id: (passed, evidence)}."""
    verdicts = {}
    for assertion in assertions:
        if assertion.get("kind") != "script":
            continue
        proc = subprocess.run(
            assertion["script"],
            shell=True,
            cwd=run_dir,
            capture_output=True,
            text=True,
            timeout=120,
        )
        detail = (proc.stdout + proc.stderr).strip()[:800]
        verdicts[assertion["id"]] = (
            proc.returncode == 0,
            f"exit {proc.returncode}" + (f": {detail}" if detail else ""),
        )
    return verdicts


def grade_model(assertions, run_dir, meta, model):
    """Ask a grader model about the assertions a script cannot settle."""
    subjective = [a for a in assertions if a.get("kind", "model") == "model"]
    if not subjective:
        return {}

    listing = "\n".join(
        f"- id: {a['id']}\n  assertion: {a['text']}" for a in subjective
    )
    gh_calls = read(run_dir / "gh-calls.jsonl", limit=8000, default="(none recorded)")
    prompt = GRADER_PROMPT.format(
        prompt=meta["prompt"],
        expected=meta["expected_output"],
        output=read(run_dir / "output.md", limit=40000, default="(no output)"),
        gh_calls=gh_calls or "(none recorded)",
        sandbox=describe_sandbox(run_dir / "sandbox"),
        assertions=listing,
    )

    cmd = [
        "claude",
        "-p",
        "--output-format",
        "json",
        "--json-schema",
        json.dumps(GRADER_SCHEMA),
        "--tools",
        "",
        "--setting-sources",
        "",
        "--no-session-persistence",
        "--model",
        model,
        prompt,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=900)
    (run_dir / "grader-raw.json").write_text(proc.stdout)
    if proc.returncode != 0:
        return {
            a["id"]: (None, f"grader failed: {proc.stderr[-300:]}") for a in subjective
        }

    try:
        payload = json.loads(proc.stdout)
        body = payload.get("result", "")
        parsed = json.loads(body) if isinstance(body, str) else body
        entries = parsed["expectations"]
    except Exception as exc:  # noqa: BLE001
        return {a["id"]: (None, f"grader output unparseable: {exc}") for a in subjective}

    by_id = {e["id"]: (e["passed"], e.get("evidence", "")) for e in entries}
    # A grader that skipped an assertion must not silently count as a pass.
    for a in subjective:
        by_id.setdefault(a["id"], (None, "grader returned no verdict"))
    return by_id


def grade_run(run_dir, model):
    meta_path = run_dir / "meta.json"
    if not meta_path.is_file():
        return None
    meta = json.loads(meta_path.read_text())
    assertions = meta["assertions"]

    result_path = run_dir / "result.json"
    status = json.loads(result_path.read_text()).get("status") if result_path.is_file() else "missing"
    if status not in ("ok", "error"):
        # Timeouts and CLI errors have no transcript worth grading; record the
        # reason so the report can distinguish "failed" from "never ran".
        grading = {
            "status": status,
            "expectations": [
                {"id": a["id"], "text": a["text"], "passed": None, "evidence": f"run status: {status}"}
                for a in assertions
            ],
        }
        (run_dir / "grading.json").write_text(json.dumps(grading, indent=2))
        return grading

    # A crash while grading one run must not abandon the rest of the sweep:
    # re-running everything to recover a single bad sandbox is an expensive way
    # to learn that a symlink dangled.
    try:
        verdicts = grade_scripts(assertions, run_dir)
    except Exception as exc:  # noqa: BLE001
        verdicts = {}
        print(f"    script grading failed: {exc}", flush=True)
    try:
        verdicts.update(grade_model(assertions, run_dir, meta, model))
    except Exception as exc:  # noqa: BLE001
        print(f"    model grading failed: {exc}", flush=True)

    expectations = []
    for a in assertions:
        passed, evidence = verdicts.get(a["id"], (None, "not graded"))
        expectations.append(
            {
                "id": a["id"],
                # `text`, `passed`, `evidence` are the field names the
                # skill-creator eval viewer expects, so its HTML report works
                # against these files unchanged.
                "text": a["text"],
                "kind": a.get("kind", "model"),
                "passed": passed,
                "evidence": evidence,
            }
        )

    graded = [e for e in expectations if e["passed"] is not None]
    grading = {
        "status": status,
        "passed": sum(1 for e in graded if e["passed"]),
        "total": len(expectations),
        "ungraded": len(expectations) - len(graded),
        "expectations": expectations,
    }
    (run_dir / "grading.json").write_text(json.dumps(grading, indent=2))
    return grading


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", required=True, help="Workspace directory from run_evals.py")
    parser.add_argument("--skill", help="Grade only this skill's runs")
    parser.add_argument("--model", default="sonnet", help="Grader model")
    parser.add_argument(
        "--regrade",
        action="store_true",
        help="Re-grade runs that already have a grading.json (default is to skip them, "
        "so an interrupted grading pass can be resumed cheaply)",
    )
    args = parser.parse_args()

    root = Path(args.out)
    if not root.is_dir():
        sys.exit(f"error: {root} is not a directory")

    pattern = f"{args.skill}/*/*/meta.json" if args.skill else "*/*/*/meta.json"
    run_dirs = sorted(p.parent for p in root.glob(pattern))
    if not run_dirs:
        sys.exit(f"error: no runs found under {root}")

    if not args.regrade:
        run_dirs = [d for d in run_dirs if not (d / "grading.json").is_file()]
        if not run_dirs:
            print("Every run already has a grading.json; pass --regrade to redo them.")
            return
    print(f"Grading {len(run_dirs)} run(s)")
    for run_dir in run_dirs:
        grading = grade_run(run_dir, args.model)
        if grading is None:
            continue
        label = run_dir.relative_to(root)
        if grading.get("total"):
            print(
                f"  {label}: {grading['passed']}/{grading['total']}"
                + (f" ({grading['ungraded']} ungraded)" if grading["ungraded"] else "")
            )
        else:
            print(f"  {label}: {grading['status']}")

    print(f"\nNext: python report.py --out {root}")


if __name__ == "__main__":
    main()
