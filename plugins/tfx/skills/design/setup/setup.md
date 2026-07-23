# Harness setup — per-user tools

Check, install, and verify the tools the harness relies on. Everything here
is per-person, per-machine. Repo-level adoption — stack, component manifest,
record locations, the named L1 approver — lives in the team onboarding guide
(`../../../docs/ONBOARDING.md`, relative to this file; it ships with the
plugin).

Two rules bind every row:

- **Ask before installing.** Show the exact command, get a yes, then run it.
  In an unattended run, install nothing — list what is missing with the
  commands a human should run, marked "missing, not installed".
- **Verify, then say so.** A tool is set up when its check command passes;
  report the actual output. Never claim more than the check shows — the same
  honesty line the checks hold (`../../../checks/README.md`).

Work the table top to bottom: run the check; if it passes, move on; if not,
offer the install, run it (or hand it to the user where marked), and re-run
the check.

| Tool | Why the harness needs it | Check (exit 0 = present) | Install |
|---|---|---|---|
| `agent-browser` CLI | First-preference screenshot capture in the design loop's critique and verify phases | `agent-browser --help` | `npm i -g agent-browser && agent-browser install` (the second command downloads its Chromium; needs Node 18+) |
| agent-browser skill | Teaches the agent the CLI's full command set (recommended; the CLI alone is enough for capture) | ask the user: `/plugin list` shows `agent-browser` | the user types `/plugin marketplace add vercel-labs/agent-browser`, then `/plugin install agent-browser@agent-browser`, then `/reload-plugins` — Claude Code commands, not shell |
| `gh` CLI, authenticated | The `feedback` skill files issues through `scripts/file-feedback-issue.py` | `gh auth status` | `brew install gh`, then the user runs `gh auth login` themselves (interactive — never run it for them) |
| Python 3 + PyYAML | The `checks/*.py` scripts import `yaml` | `python3 -c "import yaml"` | `python3 -m pip install --user pyyaml` |
| `tfx` plugin (product repos only) | The harness itself; in this repo the skills load from `.claude/skills/` with no install | ask the user: `/plugin list` shows `tfx` | the two commands in the README Install section (`../../../README.md`) |

Close with one end-to-end health check:
`agent-browser doctor --offline --quick` → exit 0. If it fails, plain
`agent-browser doctor` diagnoses; `doctor --fix` makes destructive repairs —
ask before running it.

Finish by telling the user what passed, what was installed, and what is
still missing (and why), in one short list.
