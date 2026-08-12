---
name: dx-design-critique
description: 'Grade an existing product page — capture it, score it against the standards catalogue and pattern inventory, and return ranked improvement suggestions. Use when the ask is to review, critique, audit, judge, improve, or polish a page WITHOUT naming a change or a pass dimension — including "I don''t like it", "what''s wrong here", and re-audit asks ("re-check this page against the catalogue", e.g. after new controls land). Propose-only: findings are recorded on the surface''s design ticket, and dx-design-execute builds accepted ones. NOT for a stated change or a new page — that is dx-design-execute; NOT for one of the five pass dimensions — that is the matching pass; NOT for grading a build''s own output — that is the design reviewer agent inside dx-design-execute''s loop.'
---

# Critique an existing surface

You evaluate a page that already exists, then — only once the user approves — polish it.
The normative source is the DX Design Standard; brand essence is **Kind Utility** —
useful first, kind at the surface. You never propose changes before you have seen and
judged the current state, and you never restyle a deliberate choice without asking.

**Load first:** the control catalog at `standards/catalog.yaml`. It ships with this
harness, not the product repo — resolve it relative to this SKILL.md, three levels up:
`<this-skill-dir>/../../../standards/catalog.yaml`. Filter controls by `phase` and scope
(`products` / `audiences` — absent = global) as you go, per the `standards` skill's
"Reading and filtering" rules; read a control's `detail` file before applying it. If the
product repo has a `DESIGN.md`, it calibrates colour/tone/motion — load it too.

For any waiver or applicability question read `../../../standards/README.md`
— never answer from memory.

## Run it

1. **Critique, don't change.** Read and run `critique.md` (beside this file) end to end:
   capture the live surface, do the structured layout read against `layout-patterns.md`
   (beside this file), write what works and should be preserved and what genuinely
   underperforms, then produce **up to five ranked suggestions**. Each suggestion carries
   its score — impact on the teacher's task (the ranking) and cost (S/M) — and names the
   control or layout pattern it serves. **Preserved is not waived:** a "preserve" call
   protects a deliberate choice from restyling, never its compliance from the checks —
   verify every preserved element against its controls (the L0 floor, A11Y-1 especially).
2. **Present and stop.** Show the critique and the scored, ranked suggestions. **Stop
   for the user to pick** — suggestions are offers, not a plan; do not implement anything
   yet. Unpicked suggestions are recorded as "considered", never silently dropped.
3. **Hand the accepted list to `design`.** Once the user approves specific suggestions,
   invoke `design` with them as a specified-change run — now each is a named modification
   ("merge the two summary cards into one header row"), so it enters design's scoped
   modification loop cleanly and runs through implement and verify with the catalog
   enforced. The plan gate still applies; a suggestion never bypasses it.

Second person, plain language, Singapore English, no AI-writing tells — SLP-9 binds
this prose too.
