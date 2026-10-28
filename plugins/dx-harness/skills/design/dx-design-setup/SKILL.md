---
name: dx-design-setup
description: 'Set up a person''s machine for the design harness. Installs and verifies the agent-browser capture CLI and skill, an authenticated gh, commit signing, and Python with PyYAML, and wires the design-ticket tracker. Use for "set up the harness", "agent-browser isn''t installed", or "onboard me". NOT for DESIGN.md or for designing a page.'
---

# Harness setup: per-user tools, tracker, and commit signing

Keep turns short.

**When the ask belongs elsewhere:**

- Designing or changing a page goes to `dx-design-execute`, or to `dx-design` when the ask is unclear.
- Learning how the harness works, or which skill does what, goes to `/dx-harness:dx-design`.
- Repo-level adoption goes to the team onboarding guide, `../../../docs/ONBOARDING.md`. Point there and stop.

## Work the setup checklist

Work the checklist in `setup.md`, beside this file, top to bottom. The axe row needs
the plugin's own installation directory in `PLUGIN_ROOT`, as an absolute path:
`${CLAUDE_PLUGIN_ROOT}` on Claude Code, and `../../../` from this file's directory on
any other host. Every check is idempotent: a re-run detects existing state, repeats
nothing, and reports what already passes.

## DESIGN.md belongs to dx-design-language

Setup never asks for, creates, or writes `DESIGN.md` or `.dx/design.json` content. A
repo with neither gets the portfolio defaults everywhere, which is a valid, complete
state, never a failure. If someone asks for that here, point them to
`/dx-harness:dx-design-language` in one line and stop: it scans the repo, walks the
sections with them, writes the file, and generates the projection. Full spec:
`../../../docs/DESIGN-CONTEXT.md`.

## Scope and voice

- Setup touches machine config, labels, signing keys, and the fallback ticket directory
  only. It never edits product code.
- Second person, plain language, Singapore English, no AI-writing tells. SLP-9 binds
  this prose too.
