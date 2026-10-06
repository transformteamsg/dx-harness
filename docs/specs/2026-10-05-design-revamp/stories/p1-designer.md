# P1: designer who builds in code

Part of the [design revamp stories](README.md). Confirmed through [#415](https://github.com/transformteamsg/dx-harness/issues/415).

- **Background:** UI or UX designer with no engineering background. New to git. May use Claude Desktop.
- **What they want from the harness:** Turn a design idea into working UI that meets the standard, without an engineer and without breaking the codebase. The harness decides where a default exists and uses no harness vocabulary ([#164](https://github.com/transformteamsg/dx-harness/issues/164)).
- **Priority:** Primary persona. Where the needs of two personas conflict, the architecture optimises for P1.

## P1-1: Set up my machine

As a designer who builds in code, I want my machine set up for the harness in one guided session, so that my first design run does not fail on a missing tool.

**Acceptance examples**

To be written in [#415](https://github.com/transformteamsg/dx-harness/issues/415).

**Today:** `dx-design-setup`. **Gap:** Commit signing is not design-specific.

## P1-2: Record my product's design language

As a designer who builds in code, I want to record my product's design language from my code, Figma, or brand documents, so that every run builds to it.

**Acceptance examples**

To be written in [#415](https://github.com/transformteamsg/dx-harness/issues/415).

**Today:** `dx-design-language`. **Gap:** None.

## P1-3: See rendered directions

As a designer who builds in code, I want to see two or three rendered directions for a new page or a visual change, so that I choose between things I can see.

**Acceptance examples**

To be written in [#415](https://github.com/transformteamsg/dx-harness/issues/415).

**Today:** The diverge step of `dx-design-execute`. **Gap:** The diverge step skips visual changes ([#134](https://github.com/transformteamsg/dx-harness/issues/134)).

## P1-4: Build a frontend on mock data and hand off the backend

As a designer who builds in code, I want to build a working frontend on mock data and hand the backend to an engineer, so that I can test the design end to end.

**Acceptance examples**

To be written in [#415](https://github.com/transformteamsg/dx-harness/issues/415).

**Today:** None. **Gap:** The hand-off modes were in `issue-intake.md`, which no skill links to ([#41](https://github.com/transformteamsg/dx-harness/issues/41)).

## P1-5: Prototype quickly

As a designer who builds in code, I want a quick prototype without the full loop, so that I can test an idea before I commit to it.

**Acceptance examples**

To be written in [#415](https://github.com/transformteamsg/dx-harness/issues/415).

**Today:** None. **Gap:** `dx-design-execute` runs every gate.

## P1-6: Find out what is wrong with a page

As a designer who builds in code, I want to ask what is wrong with a page and get ranked suggestions, so that I know where to start.

**Acceptance examples**

To be written in [#415](https://github.com/transformteamsg/dx-harness/issues/415).

**Today:** `dx-design-critique`. **Gap:** The report is heavy.

## P1-7: Improve one dimension of a page

As a designer who builds in code, I want to improve one dimension of a page (spacing, copy, motion, flow, or structure), so that I fix it without a full critique.

**Acceptance examples**

To be written in [#415](https://github.com/transformteamsg/dx-harness/issues/415).

**Today:** Five pass skills. **Gap:** Five skills do one job.

## P1-8: Make a stated edit safely

As a designer who builds in code, I want to make a stated edit, such as "change the label to Save", with the standard still applied, so that small changes stay safe.

**Acceptance examples**

To be written in [#415](https://github.com/transformteamsg/dx-harness/issues/415).

**Today:** The modification path of `dx-design-execute`. **Gap:** None.

## P1-9: Use git safely

As a designer who builds in code, I want git explained and done with me safely, so that I never break the shared branch.

**Acceptance examples**

To be written in [#415](https://github.com/transformteamsg/dx-harness/issues/415).

**Today:** `dx-design-git`. **Gap:** The persona voice is heavy.

## P1-10: Keep records without being asked

As a designer who builds in code, I want the harness to keep its records without asking me where they go, so that I can focus on the design.

**Acceptance examples**

To be written in [#415](https://github.com/transformteamsg/dx-harness/issues/415).

**Today:** `procedures/design-tickets.md`. **Gap:** The skills ask where records go ([#164](https://github.com/transformteamsg/dx-harness/issues/164)). The rebuild keeps the decision record as the only record ([#364](https://github.com/transformteamsg/dx-harness/issues/364)).

## P1-11: Ask whether a rule applies

As a designer who builds in code, I want to ask whether a rule applies or how to waive it, so that I proceed without guessing.

**Acceptance examples**

To be written in [#415](https://github.com/transformteamsg/dx-harness/issues/415).

**Today:** Section 6 of `dx-design`. **Gap:** The answer is buried in the router.

## P1-12: Report a problem with the harness

As a designer who builds in code, I want to report a problem with the harness during a task, so that the maintainers hear about it.

**Acceptance examples**

To be written in [#415](https://github.com/transformteamsg/dx-harness/issues/415).

**Today:** `dx-design-feedback`. **Gap:** None.
