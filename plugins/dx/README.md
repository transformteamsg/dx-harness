# dx plugin

Engineering + design skills for agentic product development, under one `/dx:` namespace.

## Engineering skills

| Skill | What it does |
|---|---|
| `/dx:code-review` | Reviews code changes — inline PR comments or local branch review. |
| `/dx:create-issue` | Creates a well-structured GitHub issue for a coding agent. |
| `/dx:groom-issue` | Fills in the implementer sections of an existing issue. |
| `/dx:split-issue` | Decomposes an issue into atomic, single-PR child issues. |
| `/dx:implement-issue` | Implements a GitHub issue by number or pasted body. |
| `/dx:lint-setup` | Sets up linting/formatting after detecting project types. |
| `/dx:git-hooks-setup` | Sets up or audits pre-commit / pre-push hooks (Husky or Lefthook). |
| `/dx:update-npm-dependencies` | Audits and updates vulnerable JS/TS deps with a release cooldown. |

## Design skills

The design skills orchestrate the DX design loop against a **70-control** standards
catalog (`standards/`), with deterministic `checks/` and a generator/evaluator split
(`agents/evaluator.md`). Start with `/dx:start` for orientation and routing.

| Skill | What it does |
|---|---|
| `/dx:start` | Orientation, context check, routing to the right design skill. |
| `/dx:setup` | Per-user tool setup + product context init. |
| `/dx:design` | The full design loop: intent → diverge → plan (gate) → implement → verify. |
| `/dx:critique` | Evaluate an existing page → ranked suggestions → gated fixes. |
| `/dx:standards` | How to read, filter, and apply the control catalog. |
| `/dx:copy` · `polish` · `motion` · `flow` · `layout` | Focused single-dimension passes. |
| `/dx:feedback` | Captures harness feedback mid-turn and files it as an issue. |
