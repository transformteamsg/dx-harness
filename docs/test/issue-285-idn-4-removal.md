# Issue #285

`chore(`catalog`): remove IDN-4, correct the 70→69 control count`

- Source: https://github.com/transformteamsg/dx-harness/issues/285
- Length: 211 words

---

## What is changing

Delete IDN-4 from `catalog.yaml` and its detail file `controls/idn-4.md`. Update `controls/idn-3.md` and the reviewer and copy-skill references that still grade IDN-4, so the catalogue drops from 70 controls to 69. Record the removal in a new `docs/catalog-changes/idn-4-removal.md`.

## Why

`main` still has 70 controls with IDN-4 included (`catalog.yaml:1003`, still graded at `agents/dx-design-review.md:170`). #147 (adopting `quality-bar.md`) requires the catalogue's own count and the artifact's two count figures to all read 69, but nothing currently owns landing this removal on `main`: the epic's 2026-08-14 ruling assigns it here, since #147 is the first issue blocked by it. The removal already happened once, on `prototype/quality-bar-shape` at `890b9c3`, but that commit can't be cherry-picked clean: it edits `skills/design/dx-copy/SKILL.md`, a path renamed to `skills/design/dx-design-copy/SKILL.md` on `main`, so that hunk needs reapplying by hand.

## Done when

- [ ] `catalog.yaml` no longer lists IDN-4, and `controls/idn-4.md` is deleted
- [ ] `controls/idn-3.md` and the reviewer and copy-skill references that named IDN-4 are updated
- [ ] `python3 plugins/dx-harness/checks/validate.py` reports 69 controls, not 70
- [ ] `docs/catalog-changes/idn-4-removal.md` records the removal

## Out of scope

- Adopting `quality-bar.md`, replacing the reviewer's rubric stub, or slimming `layout-patterns.md`. This chore only removes IDN-4; #147 and its sub-issues cover the rest.

---

*🤖 Generated with dx-create-chore*
