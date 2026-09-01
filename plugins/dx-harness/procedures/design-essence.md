# Product essence (shared procedure)

A product's essence is one or two sentences saying what it should feel like, and which
instinct wins when two good options compete. It belongs to the product, not to the
harness. No skill, agent, or catalogue control asserts an essence on a product's
behalf, and none carries a default one: a harness that ships an essence grades every
adopter against another portfolio's brand.

## Where to read it

`DESIGN.md` at the product repo root, the `## Essence` section. That section is the
essence, and its absence means the product declares none.

`.dx/design.json`'s `essence` key is the generated projection of that section, so it
is a convenience for an agent already reading that file (the design reviewer reads it
for the standing overrides). It is never the authority. A projection that carries an
essence whose `DESIGN.md` no longer has the section is stale, and the product declares
none: take the source's answer, not the projection's.

`dx-design-language` writes both files. The full spec is `../docs/DESIGN-CONTEXT.md`.

## When the repo declares none

- **Interactive skills ask, once.** Put the question in the person's own terms: what
  should this product feel like, and which instinct wins when two good options
  compete? Use the answer for this run, then offer `/dx-harness:dx-design-language`
  to record it properly. In an unattended run, ask nothing and treat the essence as
  absent.
- **Subagents say so and carry on.** A dispatched pass and the `dx-design-review`
  agent cannot ask. Name the gap once in the output, then judge on what remains: the
  catalogue controls still bind and the L0 floor still holds. Never substitute
  another product's essence, and never invent one.

## What it decides

The essence settles trade-offs the controls leave open, such as which of two
compliant layouts fits the product better. It never overrides a control, grants a
waiver, or lowers the L0 floor. Where the essence is itself too coarse to settle a
trade-off, the judgment lens takes over
(`../skills/design/dx-design-execute/SKILL.md`).

This file ships with the harness, never with the product repo. Resolve it the way
`catalogue-mechanics.md` resolves the catalogue, from the same three starting points.
