# P6: designer whose domain has no design language yet

Part of the [design revamp stories](README.md). Confirmed through [#420](https://github.com/transformteamsg/dx-harness/issues/420).

- **Background:** UI or UX designer in a domain (teachers, students, or parents) whose design language is not recorded in the harness yet. Builds to the shared standards until the domain has one.
- **What they want from the harness:** Record the first design language for their domain, so that every designer in the domain builds to it.

## P6-1: Connect the harness to my product

As a designer whose domain has no recorded design language, I want to connect the harness to my product and give it my product's context, so that its first run on my product uses that context.

**Acceptance examples**

- Given a product with no recorded context, when setup finishes, then it lists the context that the design skills need, such as the domain, the design language, the stack, the audience, and the waiver approver, and it marks each missing piece as "not configured".
- Given a missing piece of context, when setup lists it, then it offers to record it now, and it hands the design language to P6-2 when the domain has none and to P1-2 when it has one.
- Given a product on a stack other than the portfolio's, when I run setup, then setup completes and records my stack.
- Given a teammate who clones my product's repo and runs setup, when setup finishes, then their harness reads the same context from the repo's `DESIGN.md`, and setup asks them nothing that I already answered.
- Given a product that is already connected, when I run setup again, then it changes nothing and reports each piece of context that it holds and where that piece lives.

**Today:** `ONBOARDING.md` and `dx-design-setup`. **Gap:** Setup installs tools and never asks for the product's context. With no `DESIGN.md`, every design skill applies the portfolio's defaults as a valid, complete state. The harness reads `DESIGN.md` only at the product repo root. Onboarding addresses the portfolio's products and plans no support for other stacks.

## P6-2: Record my domain's design language

As a designer whose domain has no recorded design language, I want to record my domain's design language from its design system, code, Figma, or brand documents, so that every designer in the domain builds to it.

**Acceptance examples**

- Given a domain whose tokens and components come from its design system, when I record the design language, then the harness drafts the domain's `DESIGN.md` from that design system and asks me only to confirm or correct it.
- Given a design system that the domain's apps install as a package, when I record the design language, then the harness reads its values from the package as well as from the apps' code.
- Given a section that I skip, when the harness writes `DESIGN.md`, then each value in that section reports "not configured", and no portfolio value fills it.
- Given the domain's own type scale and spacing scale, when the harness first checks a product in the domain, then it judges the product against those scales ([#129](https://github.com/transformteamsg/dx-harness/issues/129)).
- Given my team's own words for the essence and the voice, when the harness drafts those sections, then the draft uses my words and none of the portfolio's essence ([#306](https://github.com/transformteamsg/dx-harness/issues/306)).
- Given a finished design language, when I confirm it, then the harness writes it as the domain's file in `standards/presets/` on a new branch, and it opens a pull request to the harness repo for the domain design owner to review.
- Given a domain that already has a recorded design language, when I ask to record one, then the harness says so and offers to choose it for my product (P1-2).

**Today:** `dx-design-language`. **Gap:** The walkthrough treats a skipped section as the portfolio default. The skill states the portfolio's essence, Kind Utility ([#306](https://github.com/transformteamsg/dx-harness/issues/306)). Its health scan runs `token-audit.py` and `type-scan.py`, which carry the portfolio's fonts and scales ([#129](https://github.com/transformteamsg/dx-harness/issues/129)). No skill writes a domain's design language to the harness repo.

## P6-3: Adopt an existing design language (retired)

Retired: P1-2 covers choosing a domain's design language. The example that each design language names its audience moves to P1-2 after [#435](https://github.com/transformteamsg/dx-harness/pull/435) merges.

## P6-4: Ask whether a rule applies to my app (retired)

Retired: P1-11 serves the same need for a designer. The examples for a value that is "not configured" and for the recorded approver move to P1-11 after [#435](https://github.com/transformteamsg/dx-harness/pull/435) merges.

## P6-5: Report a problem with the harness

As a designer whose domain has no recorded design language, I want to report a problem with the harness from my own repo, so that the maintainers hear about it, and I decide what leaves my repo.

**Acceptance examples**

- Given a session in my product's repo, when the harness shows me a draft report, then the draft names the public repository that it goes to.
- Given a draft that quotes my session or names a file in my repo, when the harness shows it, then it marks each such line, and I can remove the line before the harness files the report.
- Given a machine with no GitHub sign-in, such as one on a team that uses another forge, when I report a problem, then the harness gives me the draft to file by hand and continues my task.

**Today:** `dx-design-feedback`. **Gap:** The skill files to the public harness repository from any working directory, and the report quotes my session. Nothing marks which lines come from my repo.

## P6-6: Extend the harness for my product family (retired)

Retired: the domain layer replaces it. A domain's standards sit in the harness repo (P1-2 and the P7 stories in [#445](https://github.com/transformteamsg/dx-harness/issues/445)). A rule that a domain adds goes through a rule proposal, because a design language sets values and adds no rules (D9).
