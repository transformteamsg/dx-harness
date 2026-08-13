# Changelog

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
