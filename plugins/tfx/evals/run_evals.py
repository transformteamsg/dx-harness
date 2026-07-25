#!/usr/bin/env python3
"""Run a skill's eval suite through the `claude` CLI.

Each eval runs twice by default: once with the tfx plugin loaded and the skill
invoked, and once with every skill disabled. The baseline matters more than it
looks -- a skill that scores 90% while a skill-less Claude also scores 90% is
not earning its place in the plugin, and only the paired run reveals that.

Every run gets a throwaway sandbox so a skill that writes files, makes commits,
or rewrites a lockfile cannot disturb the repo or the next eval.

Usage:
  python run_evals.py --skill code-review
  python run_evals.py --skill code-review --eval 2 --config with-skill
  python run_evals.py --all --out workspace/iteration-1
  python run_evals.py --skill code-review --dry-run
"""

import argparse
import concurrent.futures
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

EVALS_DIR = Path(__file__).resolve().parent
PLUGIN_ROOT = EVALS_DIR.parent
SKILLS_ROOT = PLUGIN_ROOT / "skills"
STUB_DIR = EVALS_DIR / "stubs"
SETTINGS = EVALS_DIR / "eval-settings.json"

CONFIGS = ("with-skill", "baseline")


class SandboxError(Exception):
    """A fixture or setup script could not be prepared for one run.

    Raised rather than exiting so that one broken fixture fails its own run and
    leaves the rest of the sweep intact. Aborting the process mid-sweep would
    also discard every result collected so far, which is the worst possible
    outcome after an hour of runs.
    """


# --------------------------------------------------------------------------
# Suite loading
# --------------------------------------------------------------------------


def find_skill_dir(skill):
    matches = [p.parent for p in SKILLS_ROOT.glob(f"*/{skill}/SKILL.md")]
    if not matches:
        sys.exit(f"error: no skill named {skill!r} under {SKILLS_ROOT}")
    return matches[0]


def discover_suites():
    return sorted(p for p in SKILLS_ROOT.glob("*/*/evals/evals.json"))


def frontmatter_name(skill_md):
    """Pull `name:` out of the SKILL.md frontmatter without a YAML dependency."""
    lines = skill_md.read_text().splitlines()
    if not lines or lines[0].strip() != "---":
        return None
    for line in lines[1:]:
        if line.strip() == "---":
            break
        if line.startswith("name:"):
            return line.split(":", 1)[1].strip()
    return None


def load_suite(suite_path):
    with suite_path.open() as handle:
        suite = json.load(handle)
    skill_dir = suite_path.parent.parent
    declared = suite.get("skill")
    actual = frontmatter_name(skill_dir / "SKILL.md")
    if declared != actual:
        # A drifted name means the suite is testing a skill that no longer goes
        # by that name; fail loudly rather than reporting on a phantom.
        sys.exit(
            f"error: {suite_path} declares skill {declared!r} but "
            f"{skill_dir/'SKILL.md'} is named {actual!r}"
        )
    return suite, skill_dir


# --------------------------------------------------------------------------
# Sandbox construction
# --------------------------------------------------------------------------


def git(args, cwd):
    subprocess.run(
        ["git", *args],
        cwd=cwd,
        check=True,
        capture_output=True,
        env={
            **os.environ,
            "GIT_AUTHOR_NAME": "Eval Fixture",
            "GIT_AUTHOR_EMAIL": "eval@example.com",
            "GIT_COMMITTER_NAME": "Eval Fixture",
            "GIT_COMMITTER_EMAIL": "eval@example.com",
        },
    )


def build_sandbox(eval_def, skill_dir, run_dir):
    sandbox = run_dir / "sandbox"
    sandbox.mkdir(parents=True, exist_ok=True)

    fixture = eval_def.get("fixture")
    setup = eval_def.get("setup")
    if fixture:
        src = skill_dir / fixture
        if not src.is_dir():
            raise SandboxError(
                f"eval {eval_def['name']!r} points at fixture {src} which does not exist"
            )
        # Setup scripts are harness scaffolding: copying one into the sandbox
        # would commit it alongside the fixture and put it in front of any
        # skill that reads the repo. Fixtures are shared between evals and only
        # some of them run the script, so exclude the whole naming convention
        # rather than just this eval's own setup key.
        ignore = shutil.ignore_patterns(".git", "setup.sh", "setup-*.sh")
        shutil.copytree(src, sandbox, dirs_exist_ok=True, ignore=ignore)

    if eval_def.get("git", True):
        git(["init", "-q", "-b", "main"], sandbox)
        git(["add", "-A"], sandbox)
        # An empty fixture has nothing to commit; --allow-empty keeps HEAD valid
        # so skills that read git history do not hit a detached-HEAD edge case.
        git(["commit", "-q", "--allow-empty", "-m", "chore: eval fixture"], sandbox)

    setup = eval_def.get("setup")
    if setup:
        source = skill_dir / fixture / setup if fixture else skill_dir / setup
        if not source.is_file():
            raise SandboxError(f"setup script {source} not found for {eval_def['name']}")
        # Stage the script outside the sandbox and run it with the sandbox as
        # cwd. Copying it in would commit it to the fixture, and deleting it
        # afterwards would leave a stray deletion in the very diff a
        # review skill is supposed to be looking at.
        staged = run_dir / "setup.sh"
        shutil.copy2(source, staged)
        staged.chmod(0o755)
        result = subprocess.run(
            ["bash", str(staged)],
            cwd=sandbox,
            capture_output=True,
            text=True,
            env={
                **os.environ,
                "GIT_AUTHOR_NAME": "Eval Fixture",
                "GIT_AUTHOR_EMAIL": "eval@example.com",
                "GIT_COMMITTER_NAME": "Eval Fixture",
                "GIT_COMMITTER_EMAIL": "eval@example.com",
            },
        )
        (run_dir / "setup.log").write_text(result.stdout + result.stderr)
        if result.returncode != 0:
            raise SandboxError(
                f"setup script for {eval_def['name']} failed "
                f"(exit {result.returncode}); see {run_dir/'setup.log'}"
            )

    return sandbox


# --------------------------------------------------------------------------
# Command construction
# --------------------------------------------------------------------------


def build_command(suite, eval_def, config, sandbox, model):
    prompt = eval_def["prompt"]
    cmd = [
        "claude",
        "-p",
        "--output-format",
        "json",
        "--settings",
        str(SETTINGS),
        # User-level CLAUDE.md and personal skills would make results depend on
        # whose laptop the suite ran on.
        "--setting-sources",
        "",
        "--no-session-persistence",
    ]
    if model:
        cmd += ["--model", model]

    if config == "with-skill":
        cmd += ["--plugin-dir", str(PLUGIN_ROOT)]
        if suite.get("invocation", "explicit") == "explicit":
            prompt = f"/tfx:{suite['skill']} {prompt}"
    else:
        # A real no-skill baseline: the plugin is absent and the built-in
        # skills are off, so nothing but base Claude answers the prompt.
        cmd += ["--disable-slash-commands"]

    cmd.append(prompt)
    return cmd, prompt


def build_env(eval_def, skill_dir, run_dir):
    env = dict(os.environ)

    gh_fixture = eval_def.get("gh_fixture")
    if gh_fixture:
        fixture_path = skill_dir / gh_fixture
        if not fixture_path.is_file():
            sys.exit(
                f"error: eval {eval_def['name']!r} points at gh fixture "
                f"{fixture_path} which does not exist"
            )
        calls = run_dir / "gh-calls.jsonl"
        env["PATH"] = f"{STUB_DIR}{os.pathsep}{env['PATH']}"
        env["TFX_GH_FIXTURE"] = str(fixture_path)
        env["TFX_GH_CALLS"] = str(calls)
    else:
        # No gh fixture means we are testing the gh-absent branch, so make sure
        # a real gh on the developer's PATH cannot answer instead.
        env["PATH"] = f"{run_dir/'empty-bin'}{os.pathsep}{env['PATH']}"
        (run_dir / "empty-bin").mkdir(exist_ok=True)
        env["TFX_EVAL_GH_ABSENT"] = "1"

    return env


def shim_out_real_gh(eval_def, run_dir, env):
    """When testing the gh-absent path, shadow any real gh with a failing stub.

    Simply omitting the stub is not enough on a machine that has gh installed:
    the skill would reach the live API. A shim that exits with the shell's
    own not-found message reproduces the condition the skills document.
    """
    if eval_def.get("gh_fixture"):
        return
    bin_dir = run_dir / "empty-bin"
    bin_dir.mkdir(parents=True, exist_ok=True)
    shim = bin_dir / "gh"
    shim.write_text(
        "#!/bin/sh\n"
        'echo "gh: command not found" >&2\n'
        "exit 127\n"
    )
    shim.chmod(0o755)


# --------------------------------------------------------------------------
# Execution
# --------------------------------------------------------------------------


def run_one(suite, eval_def, config, skill_dir, out_dir, model, dry_run, timeout):
    run_dir = out_dir / eval_def["name"] / config
    if run_dir.exists():
        shutil.rmtree(run_dir)
    run_dir.mkdir(parents=True)

    try:
        sandbox = build_sandbox(eval_def, skill_dir, run_dir)
        env = build_env(eval_def, skill_dir, run_dir)
        shim_out_real_gh(eval_def, run_dir, env)
    except SandboxError as exc:
        result = {
            "status": "setup-error",
            "skill": suite["skill"],
            "eval_id": eval_def["id"],
            "eval_name": eval_def["name"],
            "config": config,
            "prompt": eval_def["prompt"],
            "expected_output": eval_def["expected_output"],
            "assertions": eval_def["assertions"],
            "error": str(exc),
        }
        (run_dir / "result.json").write_text(json.dumps(result, indent=2))
        (run_dir / "meta.json").write_text(json.dumps(result, indent=2))
        print(f"  SETUP-ERR {eval_def['name']}/{config}: {exc}", flush=True)
        return result

    cmd, prompt = build_command(suite, eval_def, config, sandbox, model)

    meta = {
        "skill": suite["skill"],
        "eval_id": eval_def["id"],
        "eval_name": eval_def["name"],
        "config": config,
        "prompt": eval_def["prompt"],
        "sent_prompt": prompt,
        "expected_output": eval_def["expected_output"],
        "assertions": eval_def["assertions"],
        "command": cmd,
        "gh_stubbed": bool(eval_def.get("gh_fixture")),
    }
    (run_dir / "meta.json").write_text(json.dumps(meta, indent=2))

    if dry_run:
        print(f"[dry-run] {eval_def['name']}/{config}: {' '.join(cmd[:-1])} <prompt>", flush=True)
        return {"status": "dry-run", **meta}

    started = time.time()
    try:
        proc = subprocess.run(
            cmd,
            cwd=sandbox,
            env=env,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        raw = proc.stdout
        (run_dir / "stderr.log").write_text(proc.stderr)
    except subprocess.TimeoutExpired:
        elapsed = time.time() - started
        (run_dir / "output.md").write_text("")
        result = {"status": "timeout", "duration_seconds": round(elapsed, 1), **meta}
        (run_dir / "result.json").write_text(json.dumps(result, indent=2))
        print(f"  TIMEOUT  {eval_def['name']}/{config} after {elapsed:.0f}s", flush=True)
        return result

    elapsed = time.time() - started
    (run_dir / "raw.json").write_text(raw)

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        # A non-JSON body means the CLI failed before the session started
        # (bad flag, auth problem). Keep it visible instead of scoring a zero.
        result = {
            "status": "cli-error",
            "duration_seconds": round(elapsed, 1),
            "stderr_tail": proc.stderr[-2000:],
            **meta,
        }
        (run_dir / "result.json").write_text(json.dumps(result, indent=2))
        print(f"  CLI-ERROR {eval_def['name']}/{config}: see {run_dir/'stderr.log'}", flush=True)
        return result

    text = payload.get("result", "")
    (run_dir / "output.md").write_text(text)

    usage = payload.get("usage", {}) or {}
    result = {
        "status": "error" if payload.get("is_error") else "ok",
        "duration_seconds": round(payload.get("duration_ms", elapsed * 1000) / 1000, 1),
        "cost_usd": payload.get("total_cost_usd"),
        "num_turns": payload.get("num_turns"),
        "input_tokens": usage.get("input_tokens"),
        "output_tokens": usage.get("output_tokens"),
        "cache_read_tokens": usage.get("cache_read_input_tokens"),
        "total_tokens": (usage.get("input_tokens") or 0)
        + (usage.get("output_tokens") or 0)
        + (usage.get("cache_read_input_tokens") or 0)
        + (usage.get("cache_creation_input_tokens") or 0),
        "permission_denials": payload.get("permission_denials", []),
        **meta,
    }
    (run_dir / "result.json").write_text(json.dumps(result, indent=2))

    denials = len(result["permission_denials"])
    flag = f"  ({denials} permission denials)" if denials else ""
    print(
        f"  done     {eval_def['name']}/{config}  "
        f"{result['duration_seconds']}s  ${result['cost_usd'] or 0:.3f}{flag}"
    , flush=True)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skill", help="Skill name, e.g. code-review")
    parser.add_argument("--all", action="store_true", help="Run every suite found")
    parser.add_argument(
        "--eval",
        action="append",
        help="Limit to these eval ids or names (repeatable)",
    )
    parser.add_argument(
        "--config",
        default=",".join(CONFIGS),
        help=f"Comma-separated subset of {CONFIGS}",
    )
    parser.add_argument("--model", default="sonnet", help="Model alias or id")
    parser.add_argument("--out", default=None, help="Output workspace directory")
    parser.add_argument("--jobs", type=int, default=4, help="Concurrent runs")
    parser.add_argument("--timeout", type=int, default=900, help="Per-run seconds")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not args.skill and not args.all:
        parser.error("pass --skill <name> or --all")

    configs = [c.strip() for c in args.config.split(",") if c.strip()]
    for config in configs:
        if config not in CONFIGS:
            parser.error(f"unknown config {config!r}; choose from {CONFIGS}")

    if args.all:
        suite_paths = discover_suites()
    else:
        suite_paths = [find_skill_dir(args.skill) / "evals" / "evals.json"]
        if not suite_paths[0].is_file():
            sys.exit(f"error: {suite_paths[0]} does not exist")

    # Resolve to an absolute path. Runs execute with the sandbox as cwd, so a
    # relative --out would make the staged setup-script path unresolvable from
    # inside the sandbox.
    out_root = (Path(args.out) if args.out else EVALS_DIR / "workspace" / "latest").resolve()
    out_root.mkdir(parents=True, exist_ok=True)

    jobs = []
    for suite_path in suite_paths:
        suite, skill_dir = load_suite(suite_path)
        selected = suite["evals"]
        if args.eval:
            wanted = set(args.eval)
            selected = [
                e for e in selected if str(e["id"]) in wanted or e["name"] in wanted
            ]
            if not selected:
                sys.exit(f"error: no evals in {suite['skill']} matched {args.eval}")
        for eval_def in selected:
            for config in configs:
                jobs.append((suite, eval_def, config, skill_dir))

    print(
        f"Running {len(jobs)} run(s) across {len(suite_paths)} suite(s) "
        f"on model {args.model} -> {out_root}"
    , flush=True)

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        futures = [
            pool.submit(
                run_one,
                suite,
                eval_def,
                config,
                skill_dir,
                out_root / suite["skill"],
                args.model,
                args.dry_run,
                args.timeout,
            )
            for suite, eval_def, config, skill_dir in jobs
        ]
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())

    summary = out_root / "runs.json"
    summary.write_text(json.dumps(results, indent=2))
    bad = [r for r in results if r.get("status") not in ("ok", "dry-run")]
    print(f"\nWrote {summary}", flush=True)
    if bad:
        print(f"{len(bad)} run(s) did not complete cleanly:", flush=True)
        for r in bad:
            print(f"  {r['eval_name']}/{r['config']}: {r['status']}", flush=True)
    if not args.dry_run:
        print("Next: python grade_evals.py --out", out_root, flush=True)


if __name__ == "__main__":
    main()
