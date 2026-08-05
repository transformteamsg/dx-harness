# Contributing a skill

- Add a skill under `plugins/dx-harness/skills/engineering/` or `plugins/dx-harness/skills/design/`
  as `dx-<skill-name>/SKILL.md`. Keep each skill one level deep inside its category
  folder — never place a skill directly under `skills/`.
- `SKILL.md` frontmatter needs `name:` (matching the folder, so it carries the `dx-`
  prefix too) and a trigger-rich `description:`. Keep the body tool-neutral — no
  Claude-only assumptions or absolute install paths (`~/.claude/...`); reference
  sibling files relatively.
- All skills are invoked `/dx-harness:dx-<name>`; names must be unique across both groups.
- Design skills locate the catalog via `../../../standards/…` (three levels up from
  the skill dir). Preserve that depth.
- If you add a new skill folder, no manifest change is needed — the `skills` array in
  `plugin.json` scans both category directories.
