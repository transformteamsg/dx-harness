---
name: dx-design-setup
description: 'Set up a person''s machine for the design harness and orient newcomers. Installs and verifies the per-user tools the harness relies on — the agent-browser capture CLI + skill, an authenticated gh, commit signing, Python + PyYAML for the checks — and wires the design-ticket tracker. Use for "set up the harness", "agent-browser isn''t installed", "onboard me", or "teach me the harness". NOT for DESIGN.md — that is dx-design-language; NOT for designing or changing a page — that is dx-design-execute, or dx-design when unclear.'
---

# Harness setup: per-user tools, tracker, and commit signing

Get a person's machine ready for the design loop. Brand essence is **Kind Utility**:
useful first, kind at the surface. Keep turns short; ask before you install.

**New to the harness?** Two lines: the harness makes an agent follow the DX Design
Standard whenever it builds Teacher & School UI — one promise, *intent without loss*,
held by a six-phase loop and a tiered control catalog. For the full orientation and
routing to the right skill, run `/dx-harness:dx-design`; this skill's own job is getting your
machine and repo ready, so continue here for that.

## Work the setup checklist

Work the checklist in `setup.md` (beside this file) top to bottom: run each check; if it
passes, move on; if not, offer the install, run it once you have a yes, and re-run the
check. The checklist covers three things: the per-user tools, the design-ticket tracker
wiring, and a once-per-machine commit-signing flow. Every check is idempotent: a re-run
detects existing state, repeats nothing, and reports what already passes. Two rules bind
every row and do not change:

- **Ask before installing.** Show the exact command, get a yes, then run it. In an
  unattended run, install nothing — list what is missing with the commands a human
  should run, marked "missing, not installed".
- **Verify, then say so.** A tool is set up only when its check command passes; report
  the actual output, never more than the check shows — the same honesty line the checks
  hold (`../../../checks/README.md`).

Close with the end-to-end health check named at the bottom of `setup.md`, then tell the
user what passed, what was installed, and what is still missing (and why) in one short
list.

## DESIGN.md belongs to dx-design-language

Setup never asks for, creates, or writes `DESIGN.md` or `.dx/design.json` content. If
someone asks for that here, point them to `dx-design-language` in one line and stop.

## Stay honest

- Do not oversell. If a check is not built yet, say "verified manually" — the harness
  claims no enforcement it lacks. Full statement and per-script coverage:
  `../../../checks/README.md`.
- Repo-level adoption — the stack, the component manifest, record locations, the named
  L1 approver — belongs to the team onboarding guide (`../../../docs/ONBOARDING.md`),
  not here. Point there and stop.
- Setup touches machine config, labels, signing keys, and the fallback ticket directory
  only. It never edits product code.
- Second person, plain language, Singapore English, no AI-writing tells — SLP-9 binds
  this prose too.
