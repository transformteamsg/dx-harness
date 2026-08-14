# Catalogue mechanics (shared procedure)

The catalogue (`../standards/catalog.yaml`) is the normative layer of this harness,
the standards tier of the DX Design Standard (DX-DS §3). Every entry is a control:
one verifiable rule with an id, tier, and check type. Litmus test: **if you cannot
check it, it is a principle or guideline, not a standard.** The tier table, the
`dx-waive` syntax, and the authoring rules live in `../standards/README.md`; read it
for any waiver or applicability question. **Never answer a waiver question from
memory** or from a summary; re-read `../standards/README.md` every time.

## Path resolution

The catalogue ships with the harness, not the product repo; never expect
`standards/` in the project cwd.

- From a procedure doc in `procedures/`: `../standards/catalog.yaml`.
- From a skill directory (`skills/design/<dir>/SKILL.md`): three levels up,
  `../../../standards/catalog.yaml`.
- From `agents/dx-design-review.md`: `../standards/catalog.yaml`; the spawning agent
  also passes the absolute path, because the agent cannot resolve it from the
  product cwd.

**Agents read `../standards/catalog.yaml` from the plugin, never a hosted copy.**
The website's anchors present the same controls for humans; they are links to cite,
not a source to load.

## Reading and filtering

- Load the index once per session; read a control's `detail` file only when it is in
  scope (details carry rationale, examples, and evaluator guidance). A control with
  no `detail:` is self-sufficient: `title` + `verify` are the whole rule. A
  `judgment`/`hybrid` control missing its detail is a catalogue defect (raise it, do
  not improvise a rubric).
- Filter by `phase`, `applies_to`, and scope (`products` / `audiences`). A control
  without a scope field is global and always in scope; a scoped one applies only
  when the run's product or audience is listed. Audience defaults to teachers when
  the intent phase did not establish one. A content-only change pulls
  `applies_to: [content]` controls, not the whole catalogue.
- Portfolio-wide: one set of controls for every product. Per-product difference is
  nuance calibration or a standing override in that product's DESIGN.md, never
  separate rules.

## Applying tiers and waivers

Read the tier table and `dx-waive` syntax in `../standards/README.md`; do not
restate them. Agent behaviour:

- **L0** never deviates and never waives. An impossible L0 is a blocking question
  for the person, not a judgment call.
- **L1** must pass. Propose a waiver at plan approval, but only a named human
  approver grants it, recorded in the decision record and the design ticket.
- **L2** deviates only with a specific, real reason ("looks better" is not one).

## When a control seems wrong

Escalate in this order: check the detail file's "Do not flag" exceptions; propose a
waiver at the right gate; surface the conflict. Never silently ignore a control, and
never edit the catalogue to make a failing check pass. A control that is wrong in
principle becomes a rule proposal (`rule-proposal.md`, beside this file).

## Plain-title rule naming

When you name a control to a designer, say the rule in plain words first, the id in
brackets, then the website link: "no raw hex colours — use the design tokens (TOK-1,
see link)". A bare id is never the designer-facing name.
