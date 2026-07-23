---
name: setup
description: 'Set up a person''s machine for the TFX design harness, and orient someone new to it. Two jobs: (1) install and verify the per-user tools the loop relies on — the agent-browser capture CLI + skill, an authenticated gh for feedback issues, Python + PyYAML for the checks — and optionally seed a product''s DESIGN.md context layer; (2) orient a newcomer. Use to set up, install, or fix that tooling ("set up the harness", "install the harness dependencies", "agent-browser isn''t installed"), or when someone asks to be onboarded to or taught the harness itself ("onboard me", "I''m new to the harness", "how do I use this harness", "teach me the loop"). NOT for designing or changing a page, screen, form, or component; those always go to design, even when phrased as "how do I…". NOT for repo-level harness adoption — stack, manifest, record locations, the L1 approver; that is the team onboarding guide.'
---

# Harness setup — per-user tools and context

Get a person's machine ready for the design loop, and seed a product's context layer.
Brand essence is **Kind Utility**: useful first, kind at the surface. Keep turns short;
ask before you install.

**New to the harness?** Two lines: the harness makes an agent follow the TFX Design
Standard whenever it builds Teacher & School UI — one promise, *intent without loss*,
held by a six-phase loop and a tiered control catalog. For the full orientation and
routing to the right skill, run `/tfx:start`; this skill's own job is getting your
machine and repo ready, so continue here for that.

## 1. Set up the per-user tools

Work the checklist in `setup.md` (beside this file) top to bottom: run each check; if it
passes, move on; if not, offer the install, run it once you have a yes, and re-run the
check. Two rules bind every row and do not change:

- **Ask before installing.** Show the exact command, get a yes, then run it. In an
  unattended run, install nothing — list what is missing with the commands a human
  should run, marked "missing, not installed".
- **Verify, then say so.** A tool is set up only when its check command passes; report
  the actual output, never more than the check shows — the same honesty line the checks
  hold (`../../../checks/README.md`).

Close with the end-to-end health check named at the bottom of `setup.md`, then tell the
user what passed, what was installed, and what is still missing (and why) in one short
list.

## 2. Seed the product context layer (optional)

A product's `DESIGN.md` records the few visual parameters that make it itself — primary
colour, tone weighting, motion conventions, column grid — and its generated twin
`.tfx/design.json` lets the loop and checks read them. A repo with neither just gets the
portfolio defaults everywhere, which is a valid, complete state — never a failure.

If the product repo has no `DESIGN.md` and the annotated template ships with this
harness (`../../../docs/templates/DESIGN.md`), offer to:

1. Copy that template to the repo root as `DESIGN.md`, and help fill in only the
   parameters that *differ* from the portfolio default — parameters only, never a
   restated catalog rule (that recreates the drift `docs/SYNC.md` prevents).
2. Generate the machine twin and commit both files:
   `python3 ../../../scripts/generate-design-json.py .`

If the template is absent, skip this step with one honest line ("no DESIGN.md template
ships with this harness build") and move on. Full spec — sections, the parameters-only
rule, and the "code overrides stale docs" loading rule: `../../../docs/DESIGN-CONTEXT.md`.

## Stay honest

- Do not oversell. If a check is not built yet, say "verified manually" — the harness
  claims no enforcement it lacks. Full statement and per-script coverage:
  `../../../checks/README.md`.
- Repo-level adoption — the stack, the component manifest, record locations, the named
  L1 approver — belongs to the team onboarding guide (`../../../docs/ONBOARDING.md`),
  not here. Point there and stop.
- Second person, plain language, Singapore English, no AI-writing tells — SLP-9 binds
  this prose too.
