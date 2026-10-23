# Catalogue mechanics (shared procedure)

The catalogue is the normative layer of this harness,
the standards tier of the DX Design Standard (DX-DS §3). Every entry is a control:
one verifiable rule with an id, tier, and check type. Litmus test: **if you cannot
check it, it is a principle or guideline, not a standard.** The tier table, the
`dx-waive` syntax, and the authoring rules live in `../standards/README.md`. Read it
only when someone asks about or proposes a waiver, and read it in that turn, before
you answer. **Never answer a waiver question from memory** or from a summary.
Applicability comes from the catalogue's scope fields and the product's DESIGN.md.

## The in-scope list

A run reads the rules it applies from the in-scope list, never from the catalogue
file. Do not open `../standards/catalog.yaml`. The catalogue ships with the harness,
not the product repo, so resolve the harness root to an absolute path and substitute
it for `<harness>`:

```bash
python3 <harness>/scripts/in-scope-rules.py <repo-root> [flags]
```

Pass only the flags your skill names. A flag you leave out does not narrow the list:

- `--dimension <pass>` keeps one pass dimension's rules.
- `--phase <phase>` keeps the rules for one phase.
- `--surface <type>` keeps the rules for one surface type: `page`, `component`,
  `flow`, or `content`.
- `--product <product>` and `--audience <audience>` keep the scoped rules for the
  product and audience that the run settled. Audience defaults to teachers.

Every L0 rule is on every list. Each rule line gives the id, tier, title, `verify`
text, the check that covers the rule fully when one does, and the absolute path to
its detail file when it has one.

- **Read the detail of no rule outside the list.** A rule with no `Detail:` is
  self-sufficient: its title and `verify` text are the whole rule. A `judgment` or
  `hybrid` rule with no detail is a catalogue defect. Raise it, and do not improvise
  a rubric.
- **Read only the part of the detail that your role needs.** Print it from the path
  the list gives, before you apply or grade the rule:

  ```bash
  python3 <harness>/scripts/rule-detail.py <detail path> --for build
  python3 <harness>/scripts/rule-detail.py <detail path> --for review
  ```

  A builder reads `--for build`: the requirement, the pass and fail conditions, and
  the waiver. A reviewer, and a verify step that grades a rule by hand, reads
  `--for review`, which adds the evaluator guidance and the "Do not flag" list. Do
  not open the detail file itself. When `--for review` exits with a catalogue
  defect, report it, grade the rule from its `verify` text only, and write no
  rubric of your own.
- **A rule with `Covered by:` needs no detail when its check is clean.** Run the
  check that the line names on the files you changed. When it ran with no findings
  for the rule, read no detail for that rule. When it reports a finding, read the
  rule's `--for build` part before you fix it.
- **Report its `Selection:` line to the person**, in plain words, before you apply
  any rule. The line names the filters and the `DESIGN.md` the list came from. On a
  product with no `DESIGN.md`, it says the portfolio defaults apply.
- **When the command exits with an error, stop before you review or build
  anything.** Show the error to the person as the command printed it. An unknown
  rule code in `DESIGN.md` is fixed there, through `dx-design-language`.
- Get the list again when the run's product, audience, or surface type changes. A
  content-only change passes `--surface content`.

One set of rules covers the whole portfolio. Per-product difference is nuance
calibration or a standing override in that product's DESIGN.md, never separate
rules. The website's anchors present the same rules for humans: they are links to
cite, not a source to load.

## Applying tiers and waivers

On a waiver, read the tier table and `dx-waive` syntax in `../standards/README.md`; do not
restate them. Agent behaviour:

- **L0** never deviates and never waives. An impossible L0 is a blocking question
  for the person, not a judgment call.
- **L1** must pass. Propose a waiver at plan approval, but only a named human
  approver grants it, recorded in the decision record and the design ticket.
- **L2** deviates only with a specific, real reason ("looks better" is not one).

## When a control seems wrong

Escalate in this order: check the "Do not flag" exceptions in the rule's `--for
review` part; propose a
waiver at the right gate; surface the conflict. Never silently ignore a control, and
never edit the catalogue to make a failing check pass. A control that is wrong in
principle becomes a rule proposal (`rule-proposal.md`, beside this file).

## Plain-title rule naming

When you name a control to a designer, say the rule in plain words first, the id in
brackets, then the website link: "no raw hex colours — use the design tokens (TOK-1,
see link)". A bare id is never the designer-facing name.
