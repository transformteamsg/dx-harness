# Catalogue mechanics (shared procedure)

The catalogue is the normative layer of this harness,
the standards tier of the DX Design Standard (DX-DS §3). Every entry is a control:
one verifiable rule with an id, tier, and check type. Litmus test: **if you cannot
check it, it is a principle or guideline, not a standard.** The tier table, the
`dx-waive` syntax, and the authoring rules live in `../standards/README.md`. Read it
only when someone asks about or proposes a waiver, and read it in that turn, before
you answer. **Never answer a waiver question from memory** or from a summary.
Applicability comes from the product's `design-lint.config.json` and, for a catalogue
control, the catalogue's scope fields.

## The in-scope list

A run reads the rules it applies from the in-scope list, never from the rule files
or the catalogue file. Do not open `../standards/catalog.yaml`. The list holds the
base rules in `../standards/rules/`, then the catalogue controls that no base rule
replaces yet, such as `TOK-2`. The rules ship with the harness, not the product
repo, so resolve the harness root to an absolute path and substitute it for
`<harness>`:

```bash
python3 <harness>/scripts/in-scope-rules.py <repo-root> [flags]
```

Pass only the flags your skill names. A flag you leave out does not narrow the list:

- `--dimension <pass>` keeps one pass dimension's rules.
- `--product <product>` and `--audience <audience>` keep the catalogue controls
  scoped to the product and audience that the run settled. Audience defaults to
  teachers.

The product's `design-lint.config.json` selects its rules, with the `select` key and
the `ignore` key of its preset. A product with no configuration gets every rule. A
selection in the `DESIGN.md` frontmatter selects nothing, and the list prints a note
that names it.

Every L0 rule is on every list. Each rule line gives the code, the tier, the check
(`lint` or `judged`, or the catalogue check), the title, and the absolute path to its
detail. A catalogue control also gives its `verify` text, and the check that covers it
fully when one does.

- **Read the detail of no rule outside the list.** The detail of a lint rule is its
  rule file. The detail of a judged rule is the `MAPPING.md` of its category: grade
  it from the title in its row, and do not improvise a rubric. A catalogue control
  with no `Detail:` is self-sufficient: its title and `verify` text are the whole
  rule. A `judgment` or `hybrid` control with no detail is a catalogue defect. Raise
  it.
- **Read only the part of the detail that your role needs.** Print it from the path
  the list gives, before you apply or grade a lint rule or a catalogue control:

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
  any rule. The line names the filters, the configuration file, and the preset the
  list came from. On a product with no `design-lint.config.json`, it says every rule
  applies.
- **When the command exits with an error, stop before you review or build
  anything.** Show the error to the person as the command printed it. An unknown
  rule code in `design-lint.config.json` is fixed there. An old catalogue code
  still works: `redirects.yaml` maps it to its base rules.
- Get the list again when the run's product or audience changes. A content-only
  change passes `--dimension copy`.

One set of rules covers the whole portfolio. Per-product difference is nuance
calibration or a standing override in that product's DESIGN.md, never separate
rules. The website's anchors present the same rules for humans: they are links to
cite, not a source to load.

## Applying tiers and waivers

On a waiver, read the tier table and `dx-waive` syntax in `../standards/README.md`; do not
restate them. Agent behaviour:

- **L0** never deviates and never waives. An impossible L0 is a blocking question
  for the person, not a judgment call. Every L0 rule binds whatever the dimension:
  record an L0 failure that sits outside the dimension, and never drop one
  silently. The floor binds before the run has its in-scope list, and outside the
  loop.
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
