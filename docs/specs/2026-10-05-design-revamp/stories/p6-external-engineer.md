# P6: engineer from another team

Part of the [design revamp stories](README.md). Confirmed through [#420](https://github.com/transformteamsg/dx-harness/issues/420).

- **Background:** Works on an app outside the Teacher & School portfolio.
- **What they want from the harness:** Adopt a design language for their app, and have the harness hold their UI to it.

## P6-1: Install the harness outside the portfolio

As an engineer from another team, I want to install the harness in a repo outside the portfolio, so that I can use it on my own app.

**Acceptance examples**

To be written in [#420](https://github.com/transformteamsg/dx-harness/issues/420).

**Today:** `ONBOARDING.md` and `dx-design-setup`. **Gap:** Onboarding assumes the portfolio stack.

## P6-2: Record my team's own design system

As an engineer from another team, I want to record my team's existing design system as the design language of my app, so that every run builds to it.

**Acceptance examples**

To be written in [#420](https://github.com/transformteamsg/dx-harness/issues/420).

**Today:** `dx-design-language`. **Gap:** The skill assumes the portfolio defaults.

## P6-3: Adopt an existing design language

As an engineer from another team, I want to adopt an existing design language for my app, so that I do not define one from nothing.

**Acceptance examples**

To be written in [#420](https://github.com/transformteamsg/dx-harness/issues/420).

**Today:** None. **Gap:** No skill offers a base language (D1).

## P6-4: Ask whether a rule applies to my app

As an engineer from another team, I want to ask whether a rule applies to my app or how to waive it, so that I proceed without guessing.

**Acceptance examples**

To be written in [#420](https://github.com/transformteamsg/dx-harness/issues/420).

**Today:** Section 6 of `dx-design`. **Gap:** The answer assumes a portfolio product.

## P6-5: Report a problem with the harness

As an engineer from another team, I want to report a problem with the harness from my own repo, so that the maintainers hear about it.

**Acceptance examples**

To be written in [#420](https://github.com/transformteamsg/dx-harness/issues/420).

**Today:** `dx-design-feedback`. **Gap:** None.

## P6-6: Extend the harness for my product family

As an engineer from another team, I want to extend the harness with my product family's standards, so that every product in the family follows them, and one change to the family's standards reaches every product.

**Acceptance examples**

- Given a product whose `DESIGN.md` extends my product family's standards, when a check reads a value, then the value resolves in this order: the rule's default, then my product family's standards, then the product's `DESIGN.md`.
- Given a rule that my product family adds, when a check or a design review runs on a product in the family, then each finding on that rule cites the family's own code, and every harness rule that the product selects still applies.
- Given an edit to my product family's standards, when the next check runs on any product that extends them, then the check uses the edited standards, and each product's `DESIGN.md` stays unchanged.
- Given an L0 rule in the harness, when my product family's standards relax or remove it, then the rule still applies to every product in the family, and the harness reports the skipped line of the family's standards.

**Today:** None. **Gap:** No layer sits between the catalogue and a product's `DESIGN.md`. The harness reads `DESIGN.md` only at the product repo root. Each product therefore keeps its own copy of the family's standards, and installing the harness brings none of them.
