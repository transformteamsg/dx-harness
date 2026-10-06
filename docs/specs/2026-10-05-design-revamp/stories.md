# Design revamp: personas and stories

This file holds the personas and user stories for the [design revamp](README.md). The architecture in `README.md` cites stories by ID and never restates them.

## How to change this file

- Change only the section of the persona that your issue covers. Each persona has its own confirmation issue under [#413](https://github.com/transformteamsg/dx-harness/issues/413).
- Give a new story the next free ID in its persona's section. Never change or reuse an ID.
- To drop a story, keep its heading, add `Retired` to it, and say in one line why.
- Raise a disagreement with a decision in `README.md` as a comment on #413. A story pull request does not edit `README.md`.

## Personas

Persona P1 is primary. Where the needs of two personas conflict, the architecture optimises for P1.

| ID | Persona | Background | What they want from the harness |
| --- | --- | --- | --- |
| P1 | Designer who builds in code | UI or UX designer with no engineering background. New to git. May use Claude Desktop. | Turn a design idea into working UI that meets the standard, without an engineer and without breaking the codebase. The harness decides where a default exists and uses no harness vocabulary ([#164](https://github.com/transformteamsg/dx-harness/issues/164)). |
| P2 | Frontend engineer in the portfolio | Builds UI from issues. Fluent in git and code. | UI that passes the standard without waiting for a designer, with few questions. |
| P3 | Design lead | Owns the catalogue, each product's `DESIGN.md`, and L1 waivers. | Consistent quality across products, and a controlled way for rules to change. |
| P4 | Product manager or researcher | Plans studies and requirements. | A research plan that aligns stakeholders. |
| P6 | Engineer from another team | Works on an app outside the Teacher & School portfolio. | Adopt a design language for their app, and have the harness hold their UI to it. |
| A1 | Calling agent | Another skill, a subagent, or an unattended run. | One contract: inputs, outputs, and no questions to a human. |
| P5 | Harness maintainer | Maintains `dx-harness`. | Feedback from any session. P5 receives feedback only, so it has no stories. |

The evidence for these personas:

- The owner roles in the `docs/ROADMAP.md` flowchart.
- The three designer modes (prototype, revamp, and frontend hand-off) in `content/getting-started/plan.mdx`.
- `plugins/dx-harness/docs/ONBOARDING.md` and `CONTEXT.md`.
- The unattended-run rules in the current skills.
- Harness-feedback issues [#41](https://github.com/transformteamsg/dx-harness/issues/41), [#134](https://github.com/transformteamsg/dx-harness/issues/134), and [#164](https://github.com/transformteamsg/dx-harness/issues/164).

## Story format

Every story uses this format:

```markdown
### P6-3: Adopt an existing design language

As an engineer from another team, I want to adopt an existing design language for my app, so that I do not define one from nothing.

**Acceptance examples**

- Given an app with no `DESIGN.md`, when I choose the TFX standard alone, then `DESIGN.md` selects only the generic categories.
- Given …, when …, then ….

**Today:** None. **Gap:** No skill offers a base language (D1).
```

- **Acceptance examples:** at least two per story, in the Given, When, Then form. They become the eval cases for the skill that serves the story. The persona's confirmation issue writes them.
- **Today:** the skill or file that serves the story now, or `None`.
- **Gap:** what the current skills miss, or `None`.

## P1: designer who builds in code

### P1-1: Set up my machine

As a designer who builds in code, I want my machine set up for the harness in one guided session, so that my first design run does not fail on a missing tool.

**Acceptance examples**

To be written in the P1 confirmation issue.

**Today:** `dx-design-setup`. **Gap:** Commit signing is not design-specific.

### P1-2: Record my product's design language

As a designer who builds in code, I want to record my product's design language from my code, Figma, or brand documents, so that every run builds to it.

**Acceptance examples**

To be written in the P1 confirmation issue.

**Today:** `dx-design-language`. **Gap:** None.

### P1-3: See rendered directions

As a designer who builds in code, I want to see two or three rendered directions for a new page or a visual change, so that I choose between things I can see.

**Acceptance examples**

To be written in the P1 confirmation issue.

**Today:** The diverge step of `dx-design-execute`. **Gap:** The diverge step skips visual changes ([#134](https://github.com/transformteamsg/dx-harness/issues/134)).

### P1-4: Build a frontend on mock data and hand off the backend

As a designer who builds in code, I want to build a working frontend on mock data and hand the backend to an engineer, so that I can test the design end to end.

**Acceptance examples**

To be written in the P1 confirmation issue.

**Today:** None. **Gap:** The hand-off modes were in `issue-intake.md`, which no skill links to ([#41](https://github.com/transformteamsg/dx-harness/issues/41)).

### P1-5: Prototype quickly

As a designer who builds in code, I want a quick prototype without the full loop, so that I can test an idea before I commit to it.

**Acceptance examples**

To be written in the P1 confirmation issue.

**Today:** None. **Gap:** `dx-design-execute` runs every gate.

### P1-6: Find out what is wrong with a page

As a designer who builds in code, I want to ask what is wrong with a page and get ranked suggestions, so that I know where to start.

**Acceptance examples**

To be written in the P1 confirmation issue.

**Today:** `dx-design-critique`. **Gap:** The report is heavy.

### P1-7: Improve one dimension of a page

As a designer who builds in code, I want to improve one dimension of a page (spacing, copy, motion, flow, or structure), so that I fix it without a full critique.

**Acceptance examples**

To be written in the P1 confirmation issue.

**Today:** Five pass skills. **Gap:** Five skills do one job.

### P1-8: Make a stated edit safely

As a designer who builds in code, I want to make a stated edit, such as "change the label to Save", with the standard still applied, so that small changes stay safe.

**Acceptance examples**

To be written in the P1 confirmation issue.

**Today:** The modification path of `dx-design-execute`. **Gap:** None.

### P1-9: Use git safely

As a designer who builds in code, I want git explained and done with me safely, so that I never break the shared branch.

**Acceptance examples**

To be written in the P1 confirmation issue.

**Today:** `dx-design-git`. **Gap:** The persona voice is heavy.

### P1-10: Keep records without being asked

As a designer who builds in code, I want the harness to keep its records without asking me where they go, so that I can focus on the design.

**Acceptance examples**

To be written in the P1 confirmation issue.

**Today:** `procedures/design-tickets.md`. **Gap:** The skills ask where records go ([#164](https://github.com/transformteamsg/dx-harness/issues/164)). The rebuild keeps the decision record as the only record ([#364](https://github.com/transformteamsg/dx-harness/issues/364)).

### P1-11: Ask whether a rule applies

As a designer who builds in code, I want to ask whether a rule applies or how to waive it, so that I proceed without guessing.

**Acceptance examples**

To be written in the P1 confirmation issue.

**Today:** Section 6 of `dx-design`. **Gap:** The answer is buried in the router.

### P1-12: Report a problem with the harness

As a designer who builds in code, I want to report a problem with the harness during a task, so that the maintainers hear about it.

**Acceptance examples**

To be written in the P1 confirmation issue.

**Today:** `dx-design-feedback`. **Gap:** None.

## P2: frontend engineer in the portfolio

### P2-1: Build an issue's UI to the standard

As a frontend engineer, I want to build the UI for an issue to the standard with few questions, so that I do not wait for a designer.

**Acceptance examples**

To be written in the P2 confirmation issue.

**Today:** `dx-implement-issue` or `dx-design-execute`. **Gap:** Two builders overlap, and neither clearly owns UI.

### P2-2: Check my UI before review

As a frontend engineer, I want to check my UI against the standard before review, so that the reviewer sees no standard failures.

**Acceptance examples**

To be written in the P2 confirmation issue.

**Today:** `dx-design-critique` and `checks/`. **Gap:** No fast path that only checks.

### P2-3: Ask whether a rule applies

As a frontend engineer, I want to ask whether a rule applies or how to waive it, so that I proceed without guessing.

**Acceptance examples**

To be written in the P2 confirmation issue.

**Today:** Section 6 of `dx-design`. **Gap:** The answer is buried in the router.

## P3: design lead

### P3-1: Control waivers and standing overrides

As a design lead, I want to approve a waiver or promote a repeated waiver to a standing override, so that exceptions stay controlled.

**Acceptance examples**

To be written in the P3 confirmation issue.

**Today:** `dx-design` and `dx-design-language`. **Gap:** Split across two skills.

### P3-2: Grow the catalogue from real failures

As a design lead, I want a gap that the harness found proposed as a new rule, so that the catalogue grows from real failures.

**Acceptance examples**

To be written in the P3 confirmation issue.

**Today:** `procedures/rule-proposal.md`. **Gap:** None.

### P3-3: Re-audit shipped surfaces

As a design lead, I want shipped surfaces re-audited after the catalogue changes, so that old pages meet new rules.

**Acceptance examples**

To be written in the P3 confirmation issue.

**Today:** The re-audit in `dx-design-critique`. **Gap:** None.

## P4: product manager or researcher

### P4-1: Plan a research study

As a product manager or researcher, I want a research plan for a study, so that stakeholders agree on its goals before recruitment starts.

**Acceptance examples**

To be written in the P4 confirmation issue.

**Today:** `dx-design-research-brief`. **Gap:** The skill does not use the harness.

## P6: engineer from another team

### P6-1: Install the harness outside the portfolio

As an engineer from another team, I want to install the harness in a repo outside the portfolio, so that I can use it on my own app.

**Acceptance examples**

To be written in the P6 refinement issue.

**Today:** `ONBOARDING.md` and `dx-design-setup`. **Gap:** Onboarding assumes the portfolio stack.

### P6-2: Record my team's own design system

As an engineer from another team, I want to record my team's existing design system as the design language of my app, so that every run builds to it.

**Acceptance examples**

To be written in the P6 refinement issue.

**Today:** `dx-design-language`. **Gap:** The skill assumes the portfolio defaults.

### P6-3: Adopt an existing design language

As an engineer from another team, I want to adopt an existing design language for my app, so that I do not define one from nothing.

**Acceptance examples**

To be written in the P6 refinement issue.

**Today:** None. **Gap:** No skill offers a base language (D1).

### P6-4: Ask whether a rule applies to my app

As an engineer from another team, I want to ask whether a rule applies to my app or how to waive it, so that I proceed without guessing.

**Acceptance examples**

To be written in the P6 refinement issue.

**Today:** Section 6 of `dx-design`. **Gap:** The answer assumes a portfolio product.

### P6-5: Report a problem with the harness

As an engineer from another team, I want to report a problem with the harness from my own repo, so that the maintainers hear about it.

**Acceptance examples**

To be written in the P6 refinement issue.

**Today:** `dx-design-feedback`. **Gap:** None.

## A1: calling agent

### A1-1: Dispatch a review

As a calling agent, I want to dispatch a review of one surface and get findings back, with no questions to a human.

**Acceptance examples**

To be written in the A1 confirmation issue.

**Today:** The `return-to-caller` mode in the passes. **Gap:** The contract is defined in four places.

### A1-2: Dispatch a build

As a calling agent, I want to dispatch a build with an approved plan and get a review bundle back.

**Acceptance examples**

To be written in the A1 confirmation issue.

**Today:** The `return-to-caller` mode in `dx-design-execute`. **Gap:** The contract is defined in four places.
