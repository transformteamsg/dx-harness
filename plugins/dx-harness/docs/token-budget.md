# Skill token budget

This document records what the `dx-harness` skills cost in context, and it holds the
method both teams measure by. The per-skill figures live in two documents, one per team:

- [Design skill token budget](token-budget-design.md): the 13 `dx-design-*` skills.
- [Engineering skill token budget](token-budget-engineering.md): the other 20 skills.

## The two clusters

| | Design | Engineering |
| --- | --: | --: |
| Skills | 13 | 20 |
| `SKILL.md` bodies | 26,405 | 52,850 |
| Reference files | 34 | 33 |
| Tokens in those files | 85,524 | 41,552 |
| Cheapest run | 3,667 | 978 |
| Dearest run | 83,037 | 21,547 |
| Mean run | 40,983 | 8,570 |

A design run costs about five times an engineering run. The gap is not the skill bodies.
The engineering cluster carries twice the `SKILL.md` text and reads half the reference
tokens. Three design-side documents account for the difference: `standards/catalog.yaml`,
`checks/README.md`, and the control detail files.

The harness holds 154 files that an agent reads into the context window. They total
252,345 tokens, and skills reach 95 of them. The other 59 hold 53,370 tokens. Of those, 54
are control detail files that a run opens one at a time under the catalogue's `detail`
rule.

## How to read the numbers

Token counts come from the `cl100k_base` byte pair encoder. Claude uses a different
tokeniser, so treat every figure as accurate to about 10 per cent. The ranking between
files does not change.

The count covers files an agent **reads**. It excludes the Python check scripts, the
ast-grep rule files, and the eval fixtures. The agent runs those, so only their output
enters the window.

Each skill gets three figures:

- **`SKILL.md`**: the skill body. This loads whenever the skill triggers.
- **Depth 1**: the files the `SKILL.md` names. Most are mandatory reads, such as
  "Load first" or "Read and run `critique.md` end to end".
- **Depth 2**: the files that the depth 1 files name. This is an upper bound. Some depth 2
  edges are pointers that an agent follows only in one branch.

Two figures sit outside the per-skill tables:

- **Always on**: the 33 skill descriptions in frontmatter total 4,549 tokens. Every
  session carries them so the router can pick a skill. This cost is small.
- **Worst case**: `standards/catalog.yaml` tells the agent to read a control's `detail`
  file before applying it. All 57 detail files hold 53,701 tokens. A run that touches
  every control pays that on top of its per-run figure.

A handoff to another skill does not count. When `dx-design-flow` routes to
`dx-design-execute`, the second skill loads in its own run.

The **Files read** column in each table is the latency proxy. Each file is a separate read,
and the reads run one after another.

The **Load** column in each high-usage table multiplies a file's tokens by the number of
skills that reach it. It ranks where a trim pays off most.

## Files both teams read

Five files sit in the reachable set of both clusters. A change to one of them lands on the
other team, so raise it with them first.

| Document | Tokens | Design skills | Engineering skills |
| --- | --: | --: | --: |
| `procedures/house-style.md` | 2,392 | 10 | 9 |
| `standards/README.md` | 2,700 | 11 | 1 |
| `docs/harness-feedback.md` | 1,066 | 9 | 8 |
| `procedures/catalogue-mechanics.md` | 816 | 12 | 1 |
| `procedures/rule-proposal.md` | 382 | 10 | 1 |

The engineering document proposes cutting `procedures/house-style.md` to about 1,000
tokens, and deleting `procedures/house-style-mechanics.md` with the lint that reads it.
Both clusters carry the parent file, so that decision belongs to both teams.

Two reads cross the directory boundary at depth 1, where the owning team is not the
reading team:

- `dx-create-story` and `dx-create-task` read
  `skills/design/dx-design/issue-intake.md` (2,203).
- No design skill reads a file under `skills/engineering/`. The design cluster reaches
  `procedures/house-style.md` at depth 2 only, through `procedures/design-tickets.md`.

## How to reproduce

1. Walk `plugins/dx-harness/` and keep the `.md`, `.yaml`, and `.yml` files. Drop
   `checks/rules/`, `checks/sgconfig.yml`, `evals/`, and `fixtures/`.
2. Extract every path that ends in `.md`, `.yaml`, or `.yml` from inside backticks,
   brackets, or parentheses. Expand `${CLAUDE_PLUGIN_ROOT}` to the plugin root.
3. Resolve each path against the referring file's directory first, then the plugin root.
   Discard a path that resolves outside the plugin.
4. Add an edge from `standards/catalog.yaml` to each `detail:` target.
5. Treat a `SKILL.md` as a root. Take depth 1 and depth 2 over edges that do not point at
   another `SKILL.md`. An edge to another `SKILL.md` is a handoff, so record it separately.
6. Count tokens with `cl100k_base` and sum per level.
7. Split the roots by directory: `skills/design/` against `skills/engineering/`.
