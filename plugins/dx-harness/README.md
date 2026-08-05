# dx-harness plugin

Engineering + design skills for agentic product development. Every skill is named
`dx-<name>` and invoked `/dx-harness:dx-<name>`, so typing `/dx` surfaces the whole set.

## Engineering skills

| Skill | What it does |
|---|---|
| `/dx-harness:dx-code-review` | Reviews code changes — inline PR comments or local branch review. |
| `/dx-harness:dx-create-issue` | Creates a well-structured GitHub issue for a coding agent. |
| `/dx-harness:dx-groom-issue` | Fills in the implementer sections of an existing issue. |
| `/dx-harness:dx-split-issue` | Decomposes an issue into atomic, single-PR child issues. |
| `/dx-harness:dx-implement-issue` | Implements a GitHub issue by number or pasted body. |
| `/dx-harness:dx-lint-setup` | Sets up linting/formatting after detecting project types. |
| `/dx-harness:dx-git-hooks-setup` | Sets up or audits pre-commit / pre-push hooks (Husky or Lefthook). |
| `/dx-harness:dx-update-npm-dependencies` | Audits and updates vulnerable JS/TS deps with a release cooldown. |

## Design skills

The design skills orchestrate the DX design loop against a **70-control** standards
catalog (`standards/`), with deterministic `checks/` and a generator/evaluator split
(`agents/dx-evaluator.md`). Start with `/dx-harness:dx-start` for orientation and routing.

| Skill | What it does |
|---|---|
| `/dx-harness:dx-start` | Orientation, context check, routing to the right design skill. |
| `/dx-harness:dx-setup` | Per-user tool setup + product context init. |
| `/dx-harness:dx-design` | The full design loop: intent → diverge → plan (gate) → implement → verify. |
| `/dx-harness:dx-critique` | Evaluate an existing page → ranked suggestions → gated fixes. |
| `/dx-harness:dx-standards` | How to read, filter, and apply the control catalog. |
| `/dx-harness:dx-copy` · `dx-polish` · `dx-motion` · `dx-flow` · `dx-layout` | Focused single-dimension passes. |
| `/dx-harness:dx-feedback` | Captures harness feedback mid-turn and files it as an issue. |
