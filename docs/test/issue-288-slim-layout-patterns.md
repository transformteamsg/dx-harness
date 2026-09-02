# Issue #288

`feat(`standards`): slim layout-patterns.md and fix its five dangling citations`

- Source: https://github.com/transformteamsg/dx-harness/issues/288
- Length: 564 words

---

## Parent

Part of #147

## Description

Slim `standards/layout-patterns.md` (117 lines) to its header plus the four named patterns (`:1` to `:7`, `:62` to `:117`), dropping the register framing paragraph (`:9` to `:12`, absorbed into the quality bar's Registers section) and the eight numbered principles (`:14` to `:45`, absorbed into the quality bar or existing controls; principle 5's residue already lives at `quality-bar.md:184`). The slimmed file lands at roughly 65 lines. Control ids CMP-5, LAY-5, SLP-5, SLP-10, SLP-11, and TYP-5 survive; LAY-1, LAY-3, LAY-4, LAY-6, SLP-4, SLP-6, and SLP-7 leave with the principles, but none of those disappears from the skill layer, so `[SKILL-SYNC]` is unaffected.

Five files cite the file today (`git grep -n layout-patterns main`, six hits because `critique.md` appears twice), two of them citing a numbered principle that won't exist after the slim:

1. `skills/design/dx-design-critique/SKILL.md:30`
2. `skills/design/dx-design-critique/critique.md:16` (step 2's layout read)
3. `skills/design/dx-design-critique/critique.md:38` (cites `#4`, Density by register): rewrite as a quoted anchor, `("dense but not cramped", LAY-5)`, quoting `quality-bar.md:151`
4. `skills/design/dx-design-execute/SKILL.md:136`
5. `skills/design/dx-design-pattern/SKILL.md:40` (already names both halves; no change needed)
6. `standards/controls/lay-7.md:44` (cites `item 1`, One focal point): repoint to the quality bar's Design quality Procedure squint-test step

Also replace `critique.md` step 2's inline (a)-to-(e) read (`:16` to `:24`) with a pointer to the quality bar's Design quality Procedure, keeping only the "write it down before judging" instruction, so the fold doesn't leave a copy behind in the skill layer.

Add `standards/layout-patterns.md` to `validate.py`'s `cross_ref_files` list (`:917`), shared with #286's addition of the same line for `quality-bar.md`; land whichever finishes first.

Blocked by #286: the rewritten citations point into `quality-bar.md`, which doesn't exist on `main` until that task lands. Independent of the reviewer-stub task otherwise.

## Acceptance criteria

### A dropped principle leaves no dangling citation

- **Given** `layout-patterns.md`'s eight numbered principles are dropped and the file is slimmed to its named patterns
- **When** the five files that point at `layout-patterns.md` are read
- **Then** none cites a numbered principle, `critique.md`'s `#4` citation and `lay-7.md`'s `item 1` citation are both rewritten as pointers into the quality bar, and `dx-design-pattern` and `dx-design` point at named patterns for patterns and at the quality bar for the layout read

### The sweep reaches the slimmed pattern inventory too

- **Given** `standards/layout-patterns.md` is in `cross_ref_files` and one of its surviving named-pattern ids is mistyped
- **When** the validator runs
- **Then** it reports that line; the file was never swept before this task, because the runtime walk covers `skills/`, `agents/`, `procedures/`, and `docs/catalog-changes/` only

### No numbered-principle citation survives anywhere

- **Given** the eight numbered principles are gone
- **When** the tree is grepped for numbered references to the inventory (`#4`, `item 1`, `pattern 4`, `patterns 3 and 6`)
- **Then** the only hits are in dated files under `docs/specs/`, and both live citations have been rewritten

### Also true when done

- [ ] A sixth hit outside the plugin, `docs/specs/2026-08-12-design-skills-restructure.md:176`, is left alone: it is a dated historical spec, not live guidance

## Out of scope

- Folding `layout-patterns.md` away entirely, or renaming it; it survives under its own name (rejected on two recorded grounds: about 55 more lines read whole at every plan, and swap guidance produces findings, which can't live in a file that never blocks)
- Folding `implement-craft.md`; it survives as the build-time how-to and gains one pointer line to the Craft criterion

---

*🤖 Generated with dx-create-task*
