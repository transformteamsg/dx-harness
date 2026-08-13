# Changelog

## 0.3.0 (2026-08-12)

Six shared procedure docs now live in `procedures/` at the plugin root: `plan-approval.md`, `implement.md` (with the branch guard), `design-review.md` (with the verdict re-check), `rule-proposal.md`, `catalogue-mechanics.md`, and `design-tickets.md`. The loop skill, the orchestrator, the five passes, critique, and the `dx-design-review` agent load them.

**dx-standards is deleted outright, with no stub.** Its content relocated to `procedures/catalogue-mechanics.md` (reading, filtering, tiers, waivers, path resolution, plain-title rule naming) and `procedures/rule-proposal.md` (how the catalogue grows; "ratchet" is now "rule proposal"). Rule and waiver questions go to `dx-design`, which reads `standards/README.md` and `procedures/catalogue-mechanics.md` before answering. `/dx-harness:dx-standards` no longer resolves, by design.

**The 0.2.0 rename stubs are deleted.** The 11 deprecated stub skills that pointed the pre-0.2.0 design names at their replacements are gone, so `/dx-harness:dx-start`, `/dx-harness:dx-critique`, `/dx-harness:dx-copy`, `/dx-harness:dx-flow`, `/dx-harness:dx-layout`, `/dx-harness:dx-motion`, `/dx-harness:dx-polish`, `/dx-harness:dx-setup`, `/dx-harness:dx-git-buddy`, `/dx-harness:dx-feedback`, and `/dx-harness:dx-research-brief` no longer resolve. Use the `dx-design-*` names in the 0.2.0 table below.

**The design skill directories now match their names.** Each of the 13 folders under `skills/design/` was still on its pre-0.2.0 name — `dx-start/` held `dx-design`, `dx-design/` held `dx-design-execute`, and so on. The folders are renamed to the frontmatter names and the relative cross-references between them are rewritten. Nothing about invocation changes: Claude Code resolves a skill by its frontmatter `name`, not its folder.

Rule 5 in `standards/README.md` now sanctions standing overrides declared in a product's DESIGN.md (L0 never; L1 needs a named approver; L2 needs a reason). Nothing else in that file changed.

## 0.2.0 (2026-08-12)

The design skills now use the dx-design-* family names. Only the frontmatter names changed; directories did not move, so relative cross-references still resolve.

**Name reuse:** dx-design now opens the front door; the six-phase loop is dx-design-execute.

| Old name | New name |
|---|---|
| dx-start | dx-design |
| dx-design | dx-design-execute |
| dx-critique | dx-design-critique |
| dx-copy | dx-design-copy |
| dx-flow | dx-design-flow |
| dx-layout | dx-design-pattern |
| dx-motion | dx-design-motion |
| dx-polish | dx-design-polish |
| dx-setup | dx-design-setup |
| dx-git-buddy | dx-design-git |
| dx-feedback | dx-design-feedback |
| dx-research-brief | dx-design-research-brief |

Every old name except dx-design keeps a deprecated stub that names its replacement; the stubs go away in a later release. The dx-evaluator agent is now dx-design-review. dx-standards is unchanged in this release. There is no forced migration: installs that stay on 0.1.0 keep the old names until they update.

## 0.1.0

Initial release: 8 engineering skills, 13 design skills, the dx-evaluator agent, the standards catalog, and the deterministic checks.
