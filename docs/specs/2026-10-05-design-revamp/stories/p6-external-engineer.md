# P6: engineer from another team

Part of the [design revamp stories](README.md). Confirmed through [#420](https://github.com/transformteamsg/dx-harness/issues/420).

- **Background:** Works on an app outside the Teacher & School portfolio.
- **What they want from the harness:** Adopt a design language for their app, and have the harness hold their UI to it.

## P6-1: Connect the harness to my product

As an engineer from another team, I want to connect the harness to my product and give it my product's context, so that its first run on my app uses my product's context.

**Acceptance examples**

- Given a product with no recorded context, when setup finishes, then it lists the context that the design skills need, such as the design language, the stack, the audience, and the waiver approver, and it marks each missing piece as "not configured".
- Given a missing piece of context, when setup lists it, then it offers to record it now, and it hands the design language to P6-2 or P6-3.
- Given a product on a stack other than the portfolio's, when I run setup, then setup completes and records my stack.
- Given my product's context in another repo, such as a design sandbox or my product family's standards (P6-6), when I run setup, then I point the harness at that repo once, and every design skill reads my context from there.
- Given a teammate who runs setup for the same product, when setup finishes, then their harness reads the same context as mine, and setup asks them nothing that I already answered.
- Given a product that is already connected, when I run setup again, then it changes nothing and reports each piece of context that it holds and where that piece lives.

**Today:** `ONBOARDING.md` and `dx-design-setup`. **Gap:** Setup installs tools and never asks for the product's context. With no `DESIGN.md`, every design skill applies the portfolio's defaults as a valid, complete state. The harness reads `DESIGN.md` only at the product repo root. Onboarding addresses the portfolio's products and plans no support for other stacks.

## P6-2: Record my team's own design system

As an engineer from another team, I want to record my team's existing design system as the design language of my app, so that every run builds to it.

**Acceptance examples**

- Given an app whose tokens and components come from my team's design system, when I record the design language, then the harness drafts `DESIGN.md` from that design system and asks me only to confirm or correct it.
- Given a design system that my app installs as a package, when I record the design language, then the harness reads its values from the package as well as from my app's code.
- Given a section that I skip, when the harness writes `DESIGN.md`, then each value in that section reports "not configured", and no portfolio value fills it.
- Given my design system's own type scale and spacing scale, when the harness first checks my app, then it judges my app against my scales ([#129](https://github.com/transformteamsg/dx-harness/issues/129)).
- Given my team's own words for the essence and the voice, when the harness drafts those sections, then the draft uses my words and none of the portfolio's essence ([#306](https://github.com/transformteamsg/dx-harness/issues/306)).
- Given my product family's standards (P6-6), when I record my product's design language, then `DESIGN.md` extends them and records only where my product differs.

**Today:** `dx-design-language`. **Gap:** The walkthrough treats a skipped section as the portfolio default. The skill states the portfolio's essence, Kind Utility ([#306](https://github.com/transformteamsg/dx-harness/issues/306)). Its health scan runs `token-audit.py` and `type-scan.py`, which carry the portfolio's fonts and scales ([#129](https://github.com/transformteamsg/dx-harness/issues/129)).

## P6-3: Adopt an existing design language

As an engineer from another team, I want to adopt an existing design language for my app, so that I do not define one from nothing.

**Acceptance examples**

- Given an app with no `DESIGN.md`, when I choose the harness's rules alone, then `DESIGN.md` selects only the generic categories, and each rule that needs a value reports "not configured" until I set it.
- Given an app with no `DESIGN.md`, when I choose a preset design language, such as Glow, then `DESIGN.md` extends the preset, and a value that I set in `DESIGN.md` wins over the preset's value.
- Given the preset design languages, when the harness offers them, then each one names the audience that it serves, such as teachers for Teacher Workspace.
- Given my product family's standards (P6-6), when I start a new app in the family, then the harness offers them before the preset design languages.

**Today:** None. **Gap:** No skill offers a base language (D1). `dx-design-language` starts every product from the portfolio's defaults.

## P6-4: Ask whether a rule applies to my app

As an engineer from another team, I want to ask whether a rule applies to my app or how to waive it, so that I proceed without guessing.

**Acceptance examples**

- Given a rule and a page in my app, when I ask whether the rule applies, then the one-line reason cites my `DESIGN.md` selection.
- Given a rule that reads a value my product has not set, such as the audience, when I ask whether it applies, then the harness says that the value is "not configured" and offers to record it, and it does not assume teachers.
- Given an L0 rule, when I ask how to waive it, then the harness says that no one can waive it and offers the fix.
- Given an L1 rule that I want to waive, when I ask how, then the harness drafts the waiver and names the approver recorded for my product (P6-1).
- Given a product with no recorded approver, when I ask how to waive an L1 rule, then the harness asks me who approves and records the answer.

**Today:** Section 6 of `dx-design`. **Gap:** The audience defaults to teachers when a run does not state it. A rule's product scope lists only the portfolio's products. No skill reads the approver that onboarding records in `docs/decisions/APPROVER.md`.

## P6-5: Report a problem with the harness

As an engineer from another team, I want to report a problem with the harness from my own repo, so that the maintainers hear about it, and I decide what leaves my repo.

**Acceptance examples**

- Given a session in my product's repo, when the harness shows me a draft report, then the draft names the public repository that it goes to.
- Given a draft that quotes my session or names a file in my repo, when the harness shows it, then it marks each such line, and I can remove the line before the harness files the report.
- Given a machine with no GitHub sign-in, such as one on a team that uses another forge, when I report a problem, then the harness gives me the draft to file by hand and continues my task.

**Today:** `dx-design-feedback`. **Gap:** The skill files to the public harness repository from any working directory, and the report quotes my session. Nothing marks which lines come from my repo.

## P6-6: Extend the harness for my product family

As an engineer from another team, I want to extend the harness with my product family's standards, so that every product in the family follows them, and one change to the family's standards reaches every product.

**Acceptance examples**

- Given a product whose `DESIGN.md` extends my product family's standards, when a check reads a value, then the value resolves in this order: the rule's default, then my product family's standards, then the product's `DESIGN.md`.
- Given a rule that my product family adds, when a check or a design review runs on a product in the family, then each finding on that rule cites the family's own code, and every harness rule that the product selects still applies.
- Given an edit to my product family's standards, when the next check runs on any product that extends them, then the check uses the edited standards, and each product's `DESIGN.md` stays unchanged.
- Given an L0 rule in the harness, when my product family's standards relax or remove it, then the rule still applies to every product in the family, and the harness reports the skipped line of the family's standards.

**Today:** None. **Gap:** No layer sits between the catalogue and a product's `DESIGN.md`. The harness reads `DESIGN.md` only at the product repo root. Each product therefore keeps its own copy of the family's standards, and installing the harness brings none of them.
