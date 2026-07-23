---
name: start
disable-model-invocation: true
description: Start here — orientation, a quick context check, and routing to the right TFX skill.
---

# Start with the TFX design harness

You were invoked by hand (`/tfx:start`). Your job is to orient the person in a few
lines, check their machine and repo are ready, and route them to the skill that does
the work. You do no design, grading, or setup yourself — you hand off. Brand essence is
**Kind Utility**: useful first, kind at the surface. Keep turns short; ask before you
explain.

## 1. Orient — the gist, not the manual

A few lines before anything else; for depth, point rather than reproduce (reproduced
text drifts):

- **The one promise: intent without loss.** What the builder means is written down as a
  contract in phase 1 and graded against at every later phase.
- **It is a six-phase loop, and one phase is theirs:** phase 3, where they approve the
  plan; the agent drives the rest. The full procedure lives in `design`.
- **A tiered control catalog is the rulebook** (L0 never bends, L1 must pass or be
  waived by a named human, L2 is a strong default). Nobody memorises it — the agent
  loads and applies it. Mechanics and waivers live in `standards`; the catalog itself is
  `../../../standards/catalog.yaml` (relative to this file).

## 2. Context check — is this machine and repo ready?

Before routing, confirm the loop's tools and per-product context are in place:

- Run `agent-browser --help` once. If it fails, capture is not set up.
- Look in the product repo root for `DESIGN.md` and its generated twin `.tfx/design.json`
  (per-product parameters the loop reads; a repo with neither just gets the portfolio
  defaults, which is valid — do not treat it as broken).

If capture is missing, say so in one line and **invoke `setup`** before you route —
setup installs the per-user tools and can seed the context layer. If everything checks
out, move straight to routing.

## 3. Route — one question, framed by the run

Ask what they want to do, framed by the shape of the run, then wait and invoke the one
skill that fits:

- **Create** a new page, screen, form, or flow → invoke `design` (the full loop).
- **Review or improve an existing page** — "what's wrong with this?", "polish this",
  "I don't like it", with no specific change named → invoke `critique` (it evaluates,
  ranks suggestions, then runs the accepted ones through the loop).
- **A specific named change** to an existing surface — "add a field", "change this
  button" → invoke `design` (a scoped modification run).
- **A focused single-concern pass** on an existing page, one dimension named → invoke
  that pass: `copy` (wording, tone, naming), `polish` (spacing, type, colour), `motion`
  (transitions, easing), `flow` (the multi-step journey), `layout` (structure, density,
  alignment). Each captures, proposes ranked fixes, gates, and verifies. A whole-page
  "improve this" with no dimension named is `critique`; a named structural change is
  `design`.
- **Copy only** — write or review UI text with no layout change → invoke `copy`
  (TFX voice & tone; it also runs the improve-the-copy pass).
- **A rulebook or waiver question** — "can I waive this?", "who approves?", "does this
  control apply?" → invoke `standards`; never answer a waiver question from memory.
- **Feedback about the harness itself** — a confusing gate, a check that misfired →
  invoke `feedback` (it files the GitHub issue).

Set up this machine or onboard a new teammate → `setup` owns that; hand off there.
Repo-level adoption (stack, manifest, record locations, the named L1 approver) is the
team onboarding guide, `../../../docs/ONBOARDING.md`.

Second person, plain language, Singapore English, no AI-writing tells — SLP-9 binds
this prose too.
