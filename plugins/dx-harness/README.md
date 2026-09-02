# dx-harness plugin

Engineering + design skills for agentic product development. Every skill is named
`dx-<name>` and invoked `/dx-harness:dx-<name>`, so typing `/dx` surfaces the whole set.

## Engineering skills

| Skill | What it does |
|---|---|
| `/dx-harness:dx-code-review` | Reviews code changes — inline PR comments or local branch review. |
| `/dx-harness:dx-create-issue` | Front door for issue creation: works out the shape, then hands off to one of the four below. |
| `/dx-harness:dx-create-story` | Creates a user-facing story issue ("As a [persona], I want..."). |
| `/dx-harness:dx-create-task` | Creates a single-discipline slice of a story or chore, engineering or design, linked as a sub-issue. |
| `/dx-harness:dx-create-chore` | Creates a chore issue: maintenance, config, tooling, infrastructure, no user-observable change. |
| `/dx-harness:dx-create-bug` | Creates a bug report with reproduction steps and an expected-versus-actual delta. |
| `/dx-harness:dx-split-issue` | Cuts an issue that turned out too big into task sub-issues, leaving the parent open to track them. |
| `/dx-harness:dx-implement-issue` | Implements a GitHub issue by number or pasted body. |
| `/dx-harness:dx-create-pr` | Opens a pull request for the current branch, or updates an open one to match new commits. |
| `/dx-harness:dx-lint-setup` | Sets up linting/formatting after detecting project types. |
| `/dx-harness:dx-git-hooks-setup` | Sets up or audits pre-commit / pre-push hooks (Husky or Lefthook). |
| `/dx-harness:dx-update-npm-dependencies` | Audits and updates vulnerable JS/TS deps with a release cooldown. |
| `/dx-harness:dx-house-style-setup` | Turns on the bundled house-style output style, at the scope you pick. |

## Design skills

The design skills orchestrate the DX design loop against a **70-control** standards
catalog (`standards/`), with deterministic `checks/` and a generator/evaluator split
(`agents/dx-design-review.md`). Start with `/dx-harness:dx-design` for orientation and routing.
The shared run procedures (plan approval, implement, design review, rule proposal,
catalogue mechanics, design tickets) live in `procedures/`; rule and waiver questions go
to `/dx-harness:dx-design`, which reads `standards/README.md` and
`procedures/catalogue-mechanics.md` before answering.

| Skill | What it does |
|---|---|
| `/dx-harness:dx-design` | Front door: orientation, context check, routing to the right design skill. |
| `/dx-harness:dx-design-setup` | Per-user tool setup + product context init. |
| `/dx-harness:dx-design-execute` | The full design loop: intent → diverge → plan (gate) → implement → verify. |
| `/dx-harness:dx-design-critique` | Evaluate an existing page → ranked suggestions → gated fixes. |
| `/dx-harness:dx-design-copy` · `dx-design-polish` · `dx-design-motion` · `dx-design-flow` · `dx-design-pattern` | Focused single-dimension passes. |
| `/dx-harness:dx-design-feedback` | Captures harness feedback mid-turn and files it as an issue. |
| `/dx-harness:dx-design-git` | Gitty (🦔), a friendly git companion for designers who design in code. |
| `/dx-harness:dx-design-research-brief` | Builds a user research plan/brief that aligns a study before recruitment. |
