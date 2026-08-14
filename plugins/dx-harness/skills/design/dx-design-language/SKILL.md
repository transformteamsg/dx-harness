---
name: dx-design-language
description: 'Define a product''s design language and write DESIGN.md — essence, colour, typography, motion signature, voice, guardrails, and standing overrides. Use to create or revise DESIGN.md, when a run finds it missing, when code and DESIGN.md drift (it revises DESIGN.md and files fix-todos; changing product code is dx-design-execute), or to promote a repeated waiver into a standing override. Health-scan first: evidence-first on a token-healthy repo (mine the code, confirm or correct), interview-first on a token-less one; ingests Figma and brand docs with a per-session source-of-truth election. NOT for catalogue rule or waiver questions — that is dx-design.'
---

# Define the design language

You guide one person through recording their product's design language in `DESIGN.md`
and generate its typed projection `.dx/design.json`. The person may be relaying team
decisions; that is fine. Brand essence for the portfolio is **Kind Utility**: useful
first, kind at the surface.

**Load first:** `../../../procedures/catalogue-mechanics.md` for tier behaviour and
catalogue path resolution, and `../../../procedures/design-tickets.md` for how deferred
sections and fix-todos are filed. The catalogue is at
`../../../standards/catalog.yaml`; the full DESIGN.md spec is
`../../../docs/DESIGN-CONTEXT.md`; the template is
`../../../docs/templates/DESIGN.md`.

**Path resolution for commands.** The `../../../` paths above resolve from this
skill file's own directory (the harness install), never from the product repo.
Before running any `python3` command below, resolve the harness root — the
directory three levels above this file — to an absolute path and substitute it
for `<harness>`. Running `python3 ../../../scripts/...` from the product repo
root fails with file-not-found.

## Rules that bind the whole session

- **The catalogue is always the rulebook. DESIGN.md never restates a control**: it
  cites ids and carries this product's own decisions and deviations.
- **You never write product code.** Code catch-up is always a `design-fix-todo` issue.
- **Code stays the runtime authority.** A source-of-truth election guides what you ask
  about, never what the checks enforce.
- **Overrides start empty on a first definition.** Never fish for deviations. A
  deviation earns its place through waiver promotion, or the person volunteers it;
  a volunteered deviation is recorded properly, not refused.
- **`.dx/design.json` is generated-only.** You and the generator write it; a human
  never hand-edits it.
- An absent DESIGN.md, or an absent section, means portfolio defaults and is a valid
  state. Say so; never treat it as a failure.

## Start of session: drift check

If the repo already has a `DESIGN.md`, run the staleness check before anything else:

```
python3 <harness>/scripts/generate-design-json.py <repo-root> --check
```

On exit 2, show a one-line banner with the generator's message (stale against
DESIGN.md, or stamped against an older catalogue). Regardless of the exit code,
also resolve the Tokens section's pointers (and the Components manifest pointer)
against the repo: a dead pointer is drift even when the generator reports the
projection fresh, so check them every session. Regeneration at the end of the
session re-stamps. Drift is a banner, never a blocker, and never a standalone
flow. Exit 3 means the Overrides section is invalid: show the generator's errors
and fix them with the person before going on. Exit 4 means the harness's own
catalogue is unreadable: report it as a harness-install fault and never claim a
clean check.

## The procedure

1. **Health scan.** Run `health-scan.md` (beside this file). State the verdict with
   its evidence: **evidence-first** on a healthy repo (mine the code, then confirm or
   correct each minable section), **interview-first** on an inconsistent or token-less
   one. The person can overrule either verdict.
2. **Walkthrough.** Run `walkthrough.md` (beside this file). First run: one ordered
   pass through the ten sections. Re-runs default to a targeted single-section edit;
   the two guided entry points are a human-asked change and a waiver promotion.
3. **Preview and write.** The per-section confirm-or-correct is the approval. Render
   one preview of the assembled file, get a yes, then write `DESIGN.md`, regenerate
   the projection, and offer the commit:

```
python3 <harness>/scripts/generate-design-json.py <repo-root>
```

   If the generator rejects an Overrides line, show its plain-language error, fix the
   line with the person, and regenerate. Nothing is written past a rejected line.

## Promoting a waiver into a standing override

When the same waiver recurs run after run, or the person asks to make one standing:
confirm the control id and tier from the catalogue, draft the override line in the
grammar (`../../../docs/DESIGN-CONTEXT.md`), collect the reason (L1 and L2) and the
named approver (L1; the approver field records accountability, not presence, so a
relayed "approver: J. Tan" is legitimate), append it to the Overrides section, and
regenerate. An L0 can never be promoted: the generator rejects it; offer a rule
proposal instead (`../../../procedures/rule-proposal.md`).

Second person, plain language, Singapore English, no AI-writing tells; SLP-9 binds
this prose too.
