#!/usr/bin/env python3
"""Aggregate graded eval runs into a benchmark report.

The report deliberately puts with-skill next to baseline for every eval. The
number that matters is the gap: a skill scoring 8/10 where base Claude already
scores 8/10 is carrying no weight, and only the paired view makes that visible.

It also flags two failure modes that a bare pass rate hides:

- **Non-discriminating assertions** pass in both configurations. They inflate
  the score without testing the skill, so they are candidates for deletion or
  sharpening.
- **Ungraded assertions** come from timeouts, CLI errors, or a grader that
  returned no verdict. Counting them as failures would understate the skill;
  counting them as passes would overstate it. They are reported separately.

Usage:
  python report.py --out workspace/iteration-1
"""

import argparse
import json
from collections import defaultdict
from pathlib import Path

CONFIGS = ("with-skill", "baseline")


def collect(root):
    runs = []
    for meta_path in sorted(root.glob("*/*/*/meta.json")):
        run_dir = meta_path.parent
        meta = json.loads(meta_path.read_text())
        grading_path = run_dir / "grading.json"
        result_path = run_dir / "result.json"
        runs.append(
            {
                "skill": meta["skill"],
                "eval_id": meta["eval_id"],
                "eval_name": meta["eval_name"],
                "config": meta["config"],
                "run_dir": str(run_dir.relative_to(root)),
                "grading": json.loads(grading_path.read_text()) if grading_path.is_file() else None,
                "result": json.loads(result_path.read_text()) if result_path.is_file() else None,
            }
        )
    return runs


def rate(grading):
    if not grading or not grading.get("expectations"):
        return None
    graded = [e for e in grading["expectations"] if e["passed"] is not None]
    if not graded:
        return None
    return sum(1 for e in graded if e["passed"]) / len(graded)


def pct(value):
    return "n/a" if value is None else f"{value * 100:.0f}%"


def build(root):
    runs = collect(root)
    by_skill = defaultdict(list)
    for run in runs:
        by_skill[run["skill"]].append(run)

    report = {"skills": {}, "totals": {}}

    for skill, skill_runs in sorted(by_skill.items()):
        by_eval = defaultdict(dict)
        for run in skill_runs:
            by_eval[(run["eval_id"], run["eval_name"])][run["config"]] = run

        evals = []
        for (eval_id, name), configs in sorted(by_eval.items()):
            entry = {"id": eval_id, "name": name, "configs": {}}
            for config in CONFIGS:
                run = configs.get(config)
                if not run:
                    continue
                grading = run["grading"]
                result = run["result"] or {}
                entry["configs"][config] = {
                    "pass_rate": rate(grading),
                    "passed": (grading or {}).get("passed"),
                    "total": (grading or {}).get("total"),
                    "ungraded": (grading or {}).get("ungraded", 0),
                    "status": result.get("status"),
                    "duration_seconds": result.get("duration_seconds"),
                    "cost_usd": result.get("cost_usd"),
                    "total_tokens": result.get("total_tokens"),
                    "run_dir": run["run_dir"],
                }

            with_rate = entry["configs"].get("with-skill", {}).get("pass_rate")
            base_rate = entry["configs"].get("baseline", {}).get("pass_rate")
            entry["delta"] = (
                None if with_rate is None or base_rate is None else with_rate - base_rate
            )

            # Assertions that pass with and without the skill are not measuring it.
            entry["non_discriminating"] = non_discriminating(configs)
            evals.append(entry)

        report["skills"][skill] = {
            "evals": evals,
            "summary": summarise(evals),
        }

    report["totals"] = summarise(
        [e for data in report["skills"].values() for e in data["evals"]]
    )
    return report


def non_discriminating(configs):
    with_run = configs.get("with-skill", {}).get("grading")
    base_run = configs.get("baseline", {}).get("grading")
    if not with_run or not base_run:
        return []
    base_by_id = {e["id"]: e for e in base_run.get("expectations", [])}
    flagged = []
    for e in with_run.get("expectations", []):
        other = base_by_id.get(e["id"])
        if not other:
            continue
        if e["passed"] is True and other["passed"] is True:
            flagged.append(e["id"])
    return flagged


def summarise(evals):
    def agg(config, field):
        values = [
            e["configs"][config][field]
            for e in evals
            if config in e["configs"] and e["configs"][config].get(field) is not None
        ]
        return values

    summary = {}
    for config in CONFIGS:
        rates = agg(config, "pass_rate")
        summary[config] = {
            "mean_pass_rate": sum(rates) / len(rates) if rates else None,
            "evals": len(rates),
            "total_cost_usd": round(sum(agg(config, "cost_usd")), 4),
            "total_seconds": round(sum(agg(config, "duration_seconds")), 1),
            "ungraded": sum(agg(config, "ungraded")),
        }
    w = summary["with-skill"]["mean_pass_rate"]
    b = summary["baseline"]["mean_pass_rate"]
    summary["delta"] = None if w is None or b is None else w - b
    return summary


def render(report):
    lines = ["# TFX skill eval benchmark", ""]

    totals = report["totals"]
    lines += [
        "## Overall",
        "",
        "| Config | Mean pass rate | Evals | Cost | Wall time | Ungraded |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for config in CONFIGS:
        s = totals[config]
        lines.append(
            f"| {config} | {pct(s['mean_pass_rate'])} | {s['evals']} | "
            f"${s['total_cost_usd']:.2f} | {s['total_seconds']:.0f}s | {s['ungraded']} |"
        )
    if totals["delta"] is not None:
        lines += ["", f"**Skill lift: {totals['delta'] * 100:+.0f} points over baseline**"]
    lines.append("")

    for skill, data in report["skills"].items():
        s = data["summary"]
        lines += [f"## {skill}", ""]
        if s["delta"] is not None:
            lines.append(
                f"with-skill {pct(s['with-skill']['mean_pass_rate'])} vs "
                f"baseline {pct(s['baseline']['mean_pass_rate'])} "
                f"({s['delta'] * 100:+.0f} points)"
            )
        lines += [
            "",
            "| Eval | with-skill | baseline | Delta | Notes |",
            "| --- | --- | --- | --- | --- |",
        ]
        for e in data["evals"]:
            w = e["configs"].get("with-skill", {})
            b = e["configs"].get("baseline", {})
            notes = []
            if w.get("status") not in (None, "ok"):
                notes.append(f"with-skill: {w.get('status')}")
            if b.get("status") not in (None, "ok"):
                notes.append(f"baseline: {b.get('status')}")
            if e["non_discriminating"]:
                notes.append(
                    f"{len(e['non_discriminating'])} non-discriminating: "
                    + ", ".join(e["non_discriminating"])
                )
            delta = "n/a" if e["delta"] is None else f"{e['delta'] * 100:+.0f}"
            wcell = (
                f"{pct(w.get('pass_rate'))} ({w.get('passed')}/{w.get('total')})"
                if w
                else "-"
            )
            bcell = (
                f"{pct(b.get('pass_rate'))} ({b.get('passed')}/{b.get('total')})"
                if b
                else "-"
            )
            lines.append(
                f"| `{e['name']}` | {wcell} | {bcell} | {delta} | {'; '.join(notes)} |"
            )
        lines.append("")

        failures = []
        for e in data["evals"]:
            if "with-skill" not in e["configs"]:
                continue
            for exp in load_expectations(report, skill, e["name"]):
                if exp["passed"] is False:
                    failures.append((e["name"], exp))
        if failures:
            lines += ["### Failed assertions (with-skill)", ""]
            for name, exp in failures:
                lines.append(f"- `{name}` / **{exp['id']}**: {exp['text']}")
                if exp.get("evidence"):
                    lines.append(f"  - {exp['evidence']}")
            lines.append("")

    return "\n".join(lines)


_EXPECTATION_CACHE = {}


def load_expectations(report, skill, eval_name):
    key = (skill, eval_name)
    return _EXPECTATION_CACHE.get(key, [])


def prime_cache(root):
    for grading_path in root.glob("*/*/with-skill/grading.json"):
        meta = json.loads((grading_path.parent / "meta.json").read_text())
        grading = json.loads(grading_path.read_text())
        _EXPECTATION_CACHE[(meta["skill"], meta["eval_name"])] = grading.get(
            "expectations", []
        )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    root = Path(args.out)
    prime_cache(root)
    report = build(root)

    (root / "benchmark.json").write_text(json.dumps(report, indent=2))
    markdown = render(report)
    (root / "benchmark.md").write_text(markdown)

    print(markdown)
    print(f"\nWrote {root/'benchmark.json'} and {root/'benchmark.md'}")


if __name__ == "__main__":
    main()
