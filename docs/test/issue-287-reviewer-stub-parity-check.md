# Issue #287

`feat(`checks`): replace the reviewer's rubric stub and guard it with a quality-criteria parity check`

- Source: https://github.com/transformteamsg/dx-harness/issues/287
- Length: 442 words

---

## Parent

Part of #147

## Description

Replace `agents/dx-design-review.md:196` to `:230` (the four criterion bullets, the HIG framing tags, the Kind Utility clause, the semantic-colour carve-out, and the dark-mode bullet) with a 5-to-8-line stub: the four criterion slugs inside a `dx-sync` fence, a pointer to `standards/quality-bar.md`, and the quote-your-anchor requirement. The only control ids in the removed block (COL-2, SLP-1, TOK-1) each still appear elsewhere under `skills/` or `agents/`, so removing it doesn't trip `[SKILL-SYNC]`.

Add a parity function to `validate.py`, about 20 lines modelled on `lay_parity_errors` (`:378`), tagged `[QUALITY-SYNC]`: source is `quality-bar.md`'s frontmatter `criteria:` list, consumer is the stub's `<!-- dx-sync:quality-criteria -->` fence, compared as sets. There is no existing generic fence-parity driver to reuse; every parity check today is a named function with hard-coded paths. The reusable parts are the helpers `extract_sync_block` (`:319`) and `required_consumer_errors` (`:89`), plus the call site in Step 8 (`:1117` to `:1124`). Add the call there and the `[QUALITY-SYNC]` tag to the module docstring at `:15`.

Blocked by #286: the parity check reads `quality-bar.md`'s frontmatter, which doesn't exist on `main` until that task lands.

## Acceptance criteria

### The reviewer points rather than restates

- **Given** rubric section 4 is replaced
- **When** `agents/dx-design-review.md` is read
- **Then** it carries a stub of no more than eight lines that names the four criterion slugs, points at `standards/quality-bar.md`, and requires each grade to quote its anchor, and it restates no criterion prose, no HIG framing tags, and no Kind Utility line

### The slug lists cannot drift apart

- **Given** the stub's slug list sits inside a `dx-sync` fence and both files are in `validate.py`'s `cross_ref_files`
- **When** a criterion slug is changed in `quality-bar.md` but not in the stub
- **Then** the new `[QUALITY-SYNC]` parity check reports the mismatch, naming both sets

### A missing fence is an error, not a pass

- **Given** the stub is rewritten and the `dx-sync:quality-criteria` markers are dropped
- **When** the validator runs
- **Then** it reports the missing markers rather than skipping the check, matching `required_consumer_errors` and the #122 ruling that a moved consumer must never look in sync

### Also true when done

- [ ] Deleting the block orphans no control id: COL-2, SLP-1, and TOK-1 each still appear in at least one other file under `skills/` or `agents/`
- [ ] Reordering the slugs or rewording the prose around the fence reports nothing; only a genuine set mismatch does

## Out of scope

- Structural check 2 (register ids in a `DESIGN.md` resolving in `quality-bar.md`) is #148's
- Wiring the quality bar into plan or verify, or `audit-record.py`'s quoted-substring backstop (#149's)

---

*🤖 Generated with dx-create-task*
