---
name: standards
description: How to read, filter, apply, and grow the design standards control catalog. Use when applying controls from standards/catalog.yaml, answering any waiver question about a specific control ("can I waive TOK-1?", who must approve, what the tier allows), deciding whether a control applies to a given case, writing a tfx-waive line, or proposing a new control after a failure. Do not answer waiver or applicability questions from memory or summaries — load this skill. Not needed for plain definition lookups (e.g. what a tier name means) that the always-on project rules already answer. This is the catalog-mechanics reference, not the design loop — to design or change a page use design (which loads this skill itself).
---

# Working with the control catalog

The catalog (`standards/catalog.yaml`) is the normative layer of this harness — the standards tier of the TFX Design Standard (TFX-DS §3). Every entry is a control: one verifiable rule with an id, tier, and check type. Litmus test: **if you can't check it, it's a principle or guideline, not a standard.** The tier→enforcement→waiver table, the `tfx-waive` syntax, and the authoring rules all live in `standards/README.md` — read it for any waiver or applicability question; **never answer those from memory.** The catalog ships with the harness, not the product repo: resolve `standards/` relative to this SKILL.md, three levels up (`<this-skill-dir>/../../../standards/`).

## Reading and filtering

- Load the index once per session; read a control's `detail` file only when it is in scope (details carry rationale, examples, and evaluator guidance). A control with no `detail:` is self-sufficient — `title` + `verify` are the whole rule; a `judgment`/`hybrid` control missing its detail is a catalog defect (raise it, don't improvise a rubric).
- Filter by `phase`, `applies_to`, and scope: `products` / `audiences` — a control without those fields is global and always in scope; a scoped one applies only when the run's product/audience is listed. Audience defaults to teachers when the intent phase didn't establish one. A content-only change pulls `applies_to: [content]` controls, not the whole catalog.
- Portfolio-wide: one set of controls for every product; per-product difference is nuance calibration, never separate rules.

## Applying tiers and waivers

Read the tier table and `tfx-waive` syntax in `standards/README.md`, don't restate. Agent behaviour: **L0** never deviates or waives (an impossible L0 is a blocking question for the user); **L1** must pass — propose a waiver at the plan phase, but only a named human grants it, recorded in the decision record; **L2** deviate only with a specific, real reason ("looks better" is not one). When a control seems wrong: check the detail file's "Do not flag" exceptions → propose a waiver at the right gate → surface the conflict. Never silently ignore a control, and never edit the catalog to make a failing check pass.

## Growing the catalog (the ratchet)

The catalog grows only from evidence — a defect no control caught, a recurring waiver, or a standard update. Propose a new control as a draft detail file in `standards/controls/` per the format and authoring rules in `standards/README.md`, and name the **re-audit set**: which shipped surfaces it affects (silently non-compliant until re-run through the design loop — see `design` "Catalog update re-audit"). You propose; the design lead approves by lightweight PR. Harness friction that is *not* a control gap — a confusing gate, a missing check, a process nit — is a GitHub issue via the `feedback` skill instead (`docs/harness-feedback.md`), not a ratchet proposal.
