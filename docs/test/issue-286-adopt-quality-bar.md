# Issue #286

`feat(`standards`): adopt quality-bar.md from the prototype branch`

- Source: https://github.com/transformteamsg/dx-harness/issues/286
- Length: 567 words

---

## Parent

Part of #147

## Description

Copy `plugins/dx-harness/standards/quality-bar.md` from `prototype/quality-bar-shape` onto `main` (`git show prototype/quality-bar-shape:plugins/dx-harness/standards/quality-bar.md > plugins/dx-harness/standards/quality-bar.md`), remove its PROTOTYPE banner, and fix its two stale "70 controls" figures (`:27`, the second drifted to `:417`) to read 69. Add a short "The ceiling" section to `standards/README.md` immediately after its intro paragraph (`:11`), stating that `quality-bar.md` exists, that it never blocks, and that anchors are not controls. Add a **Quality bar** glossary entry to `CONTEXT.md`. Add two lines to `validate.py`'s `cross_ref_files` list (`:917`): `standards/quality-bar.md` and `standards/layout-patterns.md` (the second is shared with the layout-patterns.md task; land whichever lands first).

Copy the file rather than cherry-picking or merging the branch. Cherry-picking the prototype's build commits (`4aac152`, `d299293`, `fd70ac4`, `091b331`, `fddf791`, plus the post-merge repair `7ad1478`) also works, but the file's own `# Decisions recorded` section already carries that history, and one commit in that range (`890b9c3`) is the IDN-4 removal, handled by its own chore (#285). Merging the branch wholesale is the worst option: it drags the spec and `CONTEXT.md` changes in one unreviewable lump.

Blocked by #285: both count figures in the artifact can't honestly read 69 until the catalogue itself does.

## Acceptance criteria

### The adopted artifact carries no prototype marks

- **Given** the artifact is adopted at `plugins/dx-harness/standards/quality-bar.md`
- **When** the file is read
- **Then** the PROTOTYPE banner is gone, both control counts read 69, the frontmatter declares `artifact`, `version`, `updated`, `grades`, `criteria` and `registers`, and each of the four criteria carries the same six blocks (Grades what, Procedure, Pairings, By surface, Thresholds, Not this criterion's job)

### Adopted before the IDN-4 removal lands

- **Given** the artifact is adopted onto a `main` where `catalog.yaml` still holds 70 controls
- **When** `:27` and `:417` are set to 69 as the acceptance criteria require
- **Then** the artifact contradicts the catalogue beside it, so land #285 first, or set both figures to 70 instead

### The cross-reference sweep reaches the artifact

- **Given** `standards/quality-bar.md` is in `cross_ref_files` and an editor later writes an id that doesn't exist, for example `LAY-99`
- **When** `python3 plugins/dx-harness/checks/validate.py` runs
- **Then** it prints `ERROR standards/quality-bar.md:<line>: references unknown control id 'LAY-99'` and exits 1

### Also true when done

- [ ] No anchor (a pairing, a By-surface, or a threshold row) carries an id, a number, or any other citable handle
- [ ] The artifact names only skills that exist on `main`: no `dx-critique`, `dx-layout`, `dx-polish`, `dx-motion`, `dx-flow`, or `dx-copy`
- [ ] `standards/README.md` carries "The ceiling" section stating the artifact exists, never blocks, and that anchors are not controls
- [ ] `CONTEXT.md` carries a **Quality bar** glossary entry
- [ ] Frontmatter is set to `version: "1.0"` and `updated:` to the adoption date
- [ ] The `# Decisions recorded` section (28 numbered items) survives the banner removal

## Out of scope

- Register selection in `DESIGN.md`, `generate-design-json.py`, and the validator's register-existence check (#148's)
- The plan-summary row, the `QUALITY GRADES` verify block, and the reader load points (#149's)
- Rendering the quality bar as a site page, or any other website work
- Changing any anchor text, pairing, the grade scale, or the six-surface axis; the only grounds would be the evidence run's recorded findings in #145, and none apply here
- Adding a third register or any override grammar; the ceiling never blocks, so there is nothing to waive

---

*🤖 Generated with dx-create-task*
