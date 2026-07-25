# Skill evals

Each skill can carry a suite of evals: realistic prompts, plus assertions about
what a correct run does. The suites live next to the skills they test, and the
runner here executes them through the `claude` CLI.

```
plugins/tfx/
├── evals/
│   ├── run_evals.py        # execute a suite (with-skill and baseline)
│   ├── grade_evals.py      # score runs against their assertions
│   ├── report.py           # aggregate into benchmark.md / benchmark.json
│   ├── schema.json         # the evals.json contract
│   ├── eval-settings.json  # permissions granted to eval runs
│   └── stubs/gh            # hermetic stand-in for the gh CLI
└── skills/engineering/<skill>/evals/
    ├── evals.json          # the suite
    ├── fixtures/<name>/    # starting files, copied into a sandbox
    └── gh/<name>.json      # canned GitHub state for the gh stub
```

## Running

```sh
cd plugins/tfx/evals

python3 run_evals.py --skill code-review              # one suite, both configs
python3 run_evals.py --all --out workspace/iter-1     # everything
python3 run_evals.py --skill code-review --eval 2     # a single eval
python3 run_evals.py --skill code-review --dry-run    # print commands only

python3 grade_evals.py --out workspace/iter-1
python3 report.py --out workspace/iter-1
```

Results land under `--out` (default `evals/workspace/latest/`), one directory per
eval per config, each containing the sandbox as the run left it, `output.md`,
`grading.json`, and the raw CLI envelope with cost and token counts.

Requires Python 3 (standard library only) and an authenticated `claude` CLI.

## Why every eval runs twice

Each eval runs `with-skill` (the plugin loaded, the skill invoked) and
`baseline` (`--disable-slash-commands`, so nothing but base Claude answers).

The absolute pass rate is close to meaningless on its own. A suite where the
skill scores 100% and the baseline also scores 100% has measured nothing except
that Claude is competent at the task; the skill is not carrying its weight, and
you would never learn that from the with-skill column alone. The number worth
reading is the gap.

This is not hypothetical. The first version of `refuses-review-on-main` here
scored 4/4 with the skill and 4/4 without: the fixture left a clean `main`, so
base Claude also declined to review, simply because there was nothing to
review. Giving `main` real uncommitted changes separated the two immediately
(100% vs 50%), because now the baseline has a diff in front of it and reviews
it, while the skill still has to stop on the branch-name check.

`report.py` flags assertions that pass in both configurations as
**non-discriminating**. Treat them as a prompt to sharpen the eval, with one
exception: some assertions are deliberately regression guards rather than
discriminators ("wrote no report file", "did not switch branches"). Those are
expected to pass in both columns and are worth keeping.

## Behaviour versus triggering

By default the with-skill run invokes the skill explicitly, prefixing the prompt
with `/tfx:<skill>`. That is deliberate: it isolates *does the skill produce the
right behaviour* from *does Claude notice the skill applies*. Mixing the two
means a suite can go red because a description needs tuning, which tells you
nothing about the workflow itself.

Set `"invocation": "auto"` on a suite to pass the bare prompt and measure the
description's pull instead. For systematic description tuning, the
`skill-creator` skill's `run_loop.py` is the better tool.

## Hermetic by construction

Eval runs must be reproducible and must not touch anything real.

- **The working directory is a throwaway sandbox.** The runner creates it,
  copies in the fixture, and initialises a git repo. Skills that commit, branch,
  or rewrite files do so there, never in this repo.
- **`gh` is replaced.** Four engineering skills drive GitHub through `gh`.
  Against the real CLI their evals would file issues and open pull requests, so
  `stubs/gh` goes on PATH instead. Reads are answered from a fixture; writes are
  recorded to `gh-calls.jsonl` and not performed. Assertions then inspect the
  recorded call, which is far more reliable than grepping the agent's prose for
  a claim that it created something.
- **Claude's own web tools are denied.** `eval-settings.json` blocks `WebFetch`
  and `WebSearch`, so a run cannot go browsing for answers.

**Network access is not fully closed off, and it is worth being precise about
this.** Denying `WebFetch` and `WebSearch` stops Claude reaching the network
*itself*; it does nothing to a subprocess. `Bash` is allowed, so `npm install`
inside an eval really does contact the registry, and sandboxes come back with a
`node_modules` in them. Two consequences:

- GitHub is genuinely isolated, but only because the `gh` stub shadows the real
  binary. That is a deliberate substitution, not a network rule.
- Package-manager evals are reproducible only as far as the registry is stable.
  A suite that must be airtight, or that has to run in CI without egress, needs
  the whole thing in a network-restricted sandbox. Nothing here provides that.

The practical upshot for grading is mild, since these evals check the decisions a
skill makes and the config it writes rather than whether an install succeeded.
But do not read "network tools denied" as "hermetic".

Omit `gh_fixture` from an eval and the runner shadows any real `gh` with a stub
that exits 127. That exercises the "gh is not installed" fallback every issue
skill documents — a genuine code path, and the only honest way to test it on a
machine that has `gh` installed.

### Permissions

Eval agents run unattended, so anything that prompts would hang the run.
`eval-settings.json` grants the specific tools the engineering skills need
rather than bypassing permission checks wholesale, and denies network egress.
Read that file before running a suite; it is the whole of what an eval agent is
allowed to do.

## Writing a suite

`schema.json` is the contract. A minimal suite:

```json
{
  "skill": "my-skill",
  "evals": [
    {
      "id": 1,
      "name": "aborts-on-missing-manifest",
      "prompt": "Can you run a security pass over this repo?",
      "expected_output": "Detects there is no package.json and stops.",
      "fixture": "evals/fixtures/python-project",
      "assertions": [
        {
          "id": "no-audit-attempted",
          "text": "Runs no audit command",
          "kind": "script",
          "script": "! grep -qE 'npm audit|pnpm audit' output.md"
        },
        {
          "id": "does-not-fabricate",
          "text": "Does not invent JS vulnerabilities",
          "kind": "model"
        }
      ]
    }
  ]
}
```

`skill` must match the `name:` in the sibling `SKILL.md`; the runner fails
loudly on drift, so a renamed skill cannot quietly orphan its suite.

### Prompts

Write what a real person would type, with the incidental detail and mess that
comes with it. A prompt like "Format this data" tests nothing — it is too thin
to distinguish a good run from a bad one.

Because `claude -p` is non-interactive, a prompt for a skill that asks questions
should pre-answer them the way a user would ("answer 'later' for all findings").
Otherwise the run stalls or the skill invents an answer, and the eval measures
the wrong thing.

### `output.md` is the final message, not the transcript

`--output-format json` returns the agent's last message, so that is all
`output.md` contains. Anything a skill printed mid-flow and did not restate at
the end is simply not there.

This makes assertions that grep for a specific printed line flakier than they
look. `code-review`'s `no-pr-skip-line` is the worked example: it passed on two
runs and failed on a third, not because the skill skipped the PR check, but
because that run did not repeat the line in its closing summary. Prefer
assertions about durable state -- a file that exists, a commit that landed, a
recorded `gh` call -- and treat "it printed X" assertions as the weakest kind.

Capturing the full transcript would fix this properly; it needs
`--output-format stream-json` and a parser, which the runner does not yet do.

### Assertions

Prefer `kind: "script"`. It runs a shell command in the run directory (so it can
read `output.md`, `gh-calls.jsonl`, and `sandbox/`) and passes on exit 0. These
cost nothing, never drift, and settle anything mechanical.

Use `kind: "model"` only where a grep genuinely cannot decide — claims about
reasoning, like whether the skill reached for an override *only after* ruling out
a parent upgrade. The grader is instructed to demand evidence and fail closed,
because a grader that accepts the agent's word for having run the tests produces
a suite that is always green and therefore useless.

If two careful reviewers could disagree about an assertion, it is not an
assertion. Put it in `expected_output`, which the grader reads as context, and
judge it by eye.

The strongest eval fixtures plant known defects. `code-review`'s fixture commits
five, one per review angle, so "did it find the off-by-one" is a fact rather
than an impression of thoroughness.

## Coverage

Suites exist for all 8 engineering skills. The 10 design skills have none yet:
their output is largely a matter of taste, and assertions forced onto subjective
work produce confident-looking scores that measure nothing. Deterministic parts
of the design loop — what `checks/` validates, whether the standards catalog is
read correctly — would be the place to start.
