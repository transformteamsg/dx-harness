# Changelog

## 0.4.0 (2026-08-13)

**The 0.2.0 rename stubs are deleted.** The 11 deprecated stub skills that pointed the pre-0.2.0 design names at their replacements are gone, so `/dx-harness:dx-start`, `/dx-harness:dx-critique`, `/dx-harness:dx-copy`, `/dx-harness:dx-flow`, `/dx-harness:dx-layout`, `/dx-harness:dx-motion`, `/dx-harness:dx-polish`, `/dx-harness:dx-setup`, `/dx-harness:dx-git-buddy`, `/dx-harness:dx-feedback`, and `/dx-harness:dx-research-brief` no longer resolve. Use the `dx-design-*` names in the 0.2.0 table below.

**The design skill directories now match their names.** Each of the 13 folders under `skills/design/` was still on its pre-0.2.0 name: `dx-start/` held `dx-design`, `dx-design/` held `dx-design-execute`, and so on. The folders are renamed to the frontmatter names and the relative cross-references between them are rewritten. This is what completes the 0.2.0 rename: the directory name is a live fallback in the skill namespace, so until folders matched frontmatter, every renamed skill collided with its own former name. `dx-harness:dx-design` actually loaded the builder from the `dx-design/` folder, not the orchestrator ([#121](https://github.com/transformteamsg/dx-harness/issues/121)).

**The catalog validator checks the real tree.** `checks/validate.py` resolved every sync consumer under a `.claude/` layout the restructure removed, so drift in the files the loop actually reads passed silently. Consumers now point at `skills/`, `agents/`, and `procedures/`; a declared consumer that cannot be found is an error, never a skip; the ghost-id sweep covers `procedures/**`; and the skill/check counts and prebuild wiring are checked against the consuming site found by walking up from the plugin ([#122](https://github.com/transformteamsg/dx-harness/issues/122)). A11Y-7 and CMP-6, which the sweep exposed as wired into no skill, are named in `procedures/implement.md`.

**`checks/contrast.py` composites Tailwind opacity modifiers.** `bg-destructive/10` previously dropped the `/10` and measured a token against itself (1:1), hard-failing A11Y-1 on ordinary tinted backgrounds. The tint now composites over the page ground (`--background`, else `--surface`) before measuring; genuinely low-contrast pairs still fail ([#122](https://github.com/transformteamsg/dx-harness/issues/122)).

**First-run gaps in the standards closed** ([#123](https://github.com/transformteamsg/dx-harness/issues/123)): `docs/catalog-changes/` now exists and carries the normative `evd-1-async-evidence.md` the verify phase and decision-record template cite, with an explicit `N/A: state does not exist` outcome for surfaces CMP-3's do-not-flag clause exempts; `verify.md` and the `dx-design-review` agent explain how to resolve `checks/` from a product repo (the scripts ship with the plugin, not the product); the catalog gains an `other` product identity so a repo outside the portfolio answers Phase 1 truthfully and records `products:`-scoped controls as deliberately out of scope; and the two ratchet candidates from the first end-to-end run are decided (both admitted) in `docs/catalog-changes/`.

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
