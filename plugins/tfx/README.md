# tfx plugin

Engineering + design skills for agentic product development, under one `/tfx:` namespace.

## Engineering skills

| Skill | What it does |
|---|---|
| `/tfx:code-review` | Reviews code changes — inline PR comments or local branch review. |
| `/tfx:create-issue` | Creates a well-structured GitHub issue for a coding agent. |
| `/tfx:groom-issue` | Fills in the implementer sections of an existing issue. |
| `/tfx:split-issue` | Decomposes an issue into atomic, single-PR child issues. |
| `/tfx:implement-issue` | Implements a GitHub issue by number or pasted body. |
| `/tfx:lint-setup` | Sets up linting/formatting after detecting project types. |
| `/tfx:git-hooks-setup` | Sets up or audits pre-commit / pre-push hooks (Husky or Lefthook). |
| `/tfx:update-npm-dependencies` | Audits and updates vulnerable JS/TS deps with a release cooldown. |

## Design skills

The design skills orchestrate the TFX design loop against a **70-control** standards
catalog (`standards/`), with deterministic `checks/` and a generator/evaluator split
(`agents/evaluator.md`). Start with `/tfx:start` for orientation and routing.

| Skill | What it does |
|---|---|
| `/tfx:start` | Orientation, context check, routing to the right design skill. |
| `/tfx:setup` | Per-user tool setup + product context init. |
| `/tfx:design` | The full design loop: intent → diverge → plan (gate) → implement → verify. |
| `/tfx:critique` | Evaluate an existing page → ranked suggestions → gated fixes. |
| `/tfx:standards` | How to read, filter, and apply the control catalog. |
| `/tfx:copy` · `polish` · `motion` · `flow` · `layout` | Focused single-dimension passes. |
| `/tfx:feedback` | Captures harness feedback mid-turn and files it as an issue. |
