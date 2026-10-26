# Phase 4: Implement

The implement procedure is shared: read `../../../../procedures/implement.md` now. It
holds the **branch guard** (run it before any edit, in both modes; when it trips,
hand off to `dx-design-git`), the frontend-only boundary, and the non-negotiable
build constraints. Build exactly the approved plan under them.

Skill-specific notes while building:

- **Interface craft** (HIG: Craft): the small details that read as care. Apply the
  ones the surface calls for from `../implement-craft.md` as you
  build, not as a cleanup pass; each refines the shared constraints, none replaces
  them, and the design reviewer grades Craft on them.
- **Copy**: when the build writes or changes user-facing text, read
  `../../../../procedures/copy-rules.md` before you write that user-facing text.
  A build that changes no user-facing text reads no copy rules.
