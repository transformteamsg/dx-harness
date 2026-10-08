# Design revamp: personas and stories

This folder holds the personas and user stories for the [design revamp](../README.md). Each persona has its own file. The architecture in `../README.md` cites stories by ID and never restates them.

## Personas

Persona P1 is primary. Where the needs of two personas conflict, the architecture optimises for P1.

| ID | Persona | File | Confirmed through |
| --- | --- | --- | --- |
| P1 | Designer who builds in code | [p1-designer.md](p1-designer.md) | [#415](https://github.com/transformteamsg/dx-harness/issues/415) |
| P2 | Frontend engineer in the portfolio | [p2-frontend-engineer.md](p2-frontend-engineer.md) | [#416](https://github.com/transformteamsg/dx-harness/issues/416) |
| P3 | Design lead | [p3-design-lead.md](p3-design-lead.md) | [#417](https://github.com/transformteamsg/dx-harness/issues/417) |
| P4 | Product manager or researcher | [p4-product-manager.md](p4-product-manager.md) | [#418](https://github.com/transformteamsg/dx-harness/issues/418) |
| P6 | Engineer from another team | [p6-external-engineer.md](p6-external-engineer.md) | [#420](https://github.com/transformteamsg/dx-harness/issues/420) |
| A1 | Calling agent | [a1-calling-agent.md](a1-calling-agent.md) | [#419](https://github.com/transformteamsg/dx-harness/issues/419) |

P5, the harness maintainer, receives feedback only, so it has no file and no stories.

The evidence for these personas:

- The owner roles in the `docs/ROADMAP.md` flowchart.
- The three modes a designer works in:
  - **Prototype:** the designer builds quickly with mock data to test an idea or show it to the team.
  - **Revamp:** the designer improves existing UI in small steps and keeps how it works.
  - **Frontend hand-off:** the designer builds a clean frontend and writes a spec, and an engineer connects it to the backend.
- `plugins/dx-harness/docs/ONBOARDING.md` and `CONTEXT.md`.
- The unattended-run rules in the current skills.
- Harness-feedback issues [#41](https://github.com/transformteamsg/dx-harness/issues/41), [#134](https://github.com/transformteamsg/dx-harness/issues/134), and [#164](https://github.com/transformteamsg/dx-harness/issues/164).

## How to change a story

- Change only the file of the persona that your issue covers.
- Give a new story the next free ID in its file. Never change or reuse an ID.
- To drop a story, keep its heading, add `(retired)` to the end of it, and say in one line why.
- Do not add a row to this file for a new story. This file lists persona files, not stories.
- Raise a disagreement with a decision in `../README.md` as a comment on [#413](https://github.com/transformteamsg/dx-harness/issues/413). A story pull request does not edit `../README.md`.
- A new persona needs its own file, a row in the table above, and its own confirmation issue under #413.

## Story format

Every story in a persona file uses this format:

```markdown
## P6-3: Adopt an existing design language

As an engineer from another team, I want to adopt an existing design language for my app, so that I do not define one from nothing.

**Acceptance examples**

- Given an app with no `DESIGN.md`, when I choose the TFX standard alone, then `DESIGN.md` selects only the generic categories.
- Given …, when …, then ….

**Today:** None. **Gap:** No skill offers a base language (D1).
```

- **Heading:** `## <ID>: <title>`. The ID is the persona ID, a hyphen, and a number.
- **Acceptance examples:** at least two per story, in the Given, When, Then form. The persona's confirmation issue writes them.
- **Today:** the skill or file that serves the story now, or `None`.
- **Gap:** what the current skills miss, or `None`.

## Reading the stories to plan skills

Use this section when you plan or build a design skill from the stories.

1. List every story: each `## <ID>: <title>` heading in the persona files of this folder is one story. Skip a heading that ends in `(retired)`.
2. Check that a story is confirmed: its persona's confirmation issue in the table above is closed. Do not plan a skill on an unconfirmed story.
3. Find the skill that serves a story in the target skill table of [../README.md](../README.md#target-skill-set). A confirmed story that no skill serves is a gap: raise it on #413.
4. Use the story's acceptance examples as the eval cases for the skill that serves it.
