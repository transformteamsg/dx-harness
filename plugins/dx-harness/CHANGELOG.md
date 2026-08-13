# Changelog

## 0.4.0 (2026-08-13)

The deprecated stub skills for the pre-0.2.0 design names are removed. An old name (`dx-start`, `dx-critique`, `dx-copy`, …) no longer resolves; the 0.2.0 table below maps old names to current ones.

The adopter docs now describe the current `dx-design` routing and six-phase loop. Product context belongs in `DESIGN.md`; a different interface stack no longer blocks installation, though several catalog checks still assume the portfolio defaults. The website speaks to products serving teachers, students, and parents, and no longer presents content or controls as Settled or Proposed.

## 0.3.0 (2026-08-12)

Six shared procedure docs now live in `procedures/` at the plugin root: `plan-approval.md`, `implement.md` (with the branch guard), `design-review.md` (with the verdict re-check), `rule-proposal.md`, `catalogue-mechanics.md`, and `design-tickets.md`. The loop skill, the orchestrator, the five passes, critique, and the `dx-design-review` agent load them.

**dx-standards is deleted outright, with no stub.** Its content relocated to `procedures/catalogue-mechanics.md` (reading, filtering, tiers, waivers, path resolution, plain-title rule naming) and `procedures/rule-proposal.md` (how the catalogue grows; "ratchet" is now "rule proposal"). Rule and waiver questions go to `dx-design`, which reads `standards/README.md` and `procedures/catalogue-mechanics.md` before answering. `/dx-harness:dx-standards` no longer resolves, by design.

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
