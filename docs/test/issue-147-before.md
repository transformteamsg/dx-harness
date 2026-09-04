# Issue #147

`feat(`standards`): adopt quality-bar.md and fold layout-patterns.md and rubric section 4`

- Source: https://github.com/transformteamsg/dx-harness/issues/147
- Length: 5511 words

---

## User story

As a design agent, I want one adopted quality-bar artifact carrying the four criteria and their written anchors, so that a grade cites a pairing or threshold I can quote instead of a criterion name graded against nothing.

## Background

The quality layer already existed twice, both verify-time only and both unanchored: the reviewer's rubric section 4 (four criteria graded strong / acceptable / weak against nothing) and `layout-patterns.md` (nine patterns, explicitly "guidance, not controls"). The diagnosis is that the four criteria are unanchored, not too few, so the work is calibration rather than expansion.

The artifact to adopt already exists. `plugins/dx-harness/standards/quality-bar.md` on `prototype/quality-bar-shape` has all four criteria written end to end and 28 recorded decisions at the bottom. It carries a PROTOTYPE banner, and two stale figures at `:27` and `:417` say "70 controls" when the catalogue has been 69 since IDN-4's removal at `890b9c3`.

Adopting it means folding the two places that duplicated it. `layout-patterns.md` survives under its own name, slimmed to the named patterns (list vs cards, master-detail, wizard, empty-state) plus its header. Its register framing paragraph, eight numbered principles and "reading a screenshot" mini-procedure all go, absorbed into the quality bar or into existing controls. Rubric section 4 at `agents/dx-design-review.md:190` becomes a 5 to 8 line stub that names the four slugs, points at the artifact, and requires each grade to quote its anchor. Nothing is restated.

Five files point at `layout-patterns.md` today, and one of them cites a numbered principle that will no longer exist.

The ceiling never blocks. A miss is evidence for a grade, never a finding, and anchors never enter BLOCKING or ADVISORY. Anchors deliberately have no ids: giving them ids would make a ceiling finding read as a control finding, which is the one confusion this artifact exists to prevent.

- Spec sections 1 to 5, and section 13's `standards/README.md` item: [`docs/specs/2026-08-14-catalogue-reliability.md`](https://github.com/transformteamsg/dx-harness/blob/prototype/quality-bar-shape/docs/specs/2026-08-14-catalogue-reliability.md)
- Source tickets: #110 (shape and schema), #112 (criteria and anchors), #114 (the folds)
- Prototype: [`standards/quality-bar.md`](https://github.com/transformteamsg/dx-harness/blob/prototype/quality-bar-shape/plugins/dx-harness/standards/quality-bar.md)

## Acceptance criteria

### The adopted artifact carries no prototype marks

- **Given** the artifact is adopted at `plugins/dx-harness/standards/quality-bar.md`
- **When** the file is read
- **Then** the PROTOTYPE banner is gone, both control counts read 69, the frontmatter declares `artifact`, `version`, `updated`, `grades`, `criteria` and `registers`, and each of the four criteria carries the same six blocks (Grades what, Procedure, Pairings, By surface, Thresholds, Not this criterion's job)

### The reviewer points rather than restates

- **Given** rubric section 4 is replaced
- **When** `agents/dx-design-review.md` is read
- **Then** it carries a stub of no more than eight lines that names the four criterion slugs, points at `standards/quality-bar.md`, and requires each grade to quote its anchor, and it restates no criterion prose, no HIG framing tags and no Kind Utility line

### The slug lists cannot drift apart

- **Given** the stub's slug list sits inside a `dx-sync` fence and both files are in `validate.py`'s `cross_ref_files`
- **When** a criterion slug is changed in `quality-bar.md` but not in the stub
- **Then** `validate.py`'s existing fence-parity check reports the mismatch, with no new validator code written for it

### A dropped principle leaves no dangling citation

- **Given** `layout-patterns.md`'s eight numbered principles are dropped and the file is slimmed to its named patterns
- **When** the five files that point at `layout-patterns.md` are read
- **Then** none cites a numbered principle, `dx-critique`'s "layout-patterns.md #4" example citation is rewritten, LAY-7's detail file and `dx-critique` step 2 point at the quality bar's design-quality procedure, and `dx-layout` and `dx-design` point at named patterns for patterns and at the quality bar for the layout read

## Out of scope

- Register selection in DESIGN.md, `generate-design-json.py`, and the validator's register-existence check.
- The plan-summary row, the `QUALITY GRADES` verify block, and the reader load points. Adoption puts the file in place; wiring is separate.
- Rendering the quality bar as a site page, and any other website work.
- Folding `implement-craft.md`. It survives as the build-time how-to and gains one pointer line to the Craft criterion.
- Adding any control to `catalog.yaml`. Authoring rule 4 does not bind the ceiling, and no new controls enter through it.
- Changing the grade scale, the six-surface context axis, or any anchor text on grounds other than the evidence run's recorded findings.

## Design assets

N/A for interface work. The artifact's shape is fixed by the prototype and reviewed as Markdown; the evidence run's captured frames are the only images this issue consumes.

---

## Technical context

**A naming note that applies to every path below.** Every design skill was renamed on `main`. The spec (and the author sections above) use the old names. Translated once here, and only the new names are used from this point on: `dx-critique` is `dx-design-critique`, `dx-layout` is `dx-design-pattern`, `dx-design` (as builder) is `dx-design-execute`, `dx-polish` is `dx-design-polish`, `dx-motion` is `dx-design-motion`, `dx-flow` is `dx-design-flow`, `dx-copy` is `dx-design-copy`, `dx-start` is `dx-design`. All live under `plugins/dx-harness/skills/design/<name>/`.

### Where the work lives

Everything is inside the plugin, `plugins/dx-harness/`. `checks/validate.py` computes its own `REPO_ROOT` as the plugin directory (`validate.py:53`), so every path in the validator is relative to `plugins/dx-harness/`. Verify with `python3 plugins/dx-harness/checks/validate.py`; it prints `OK: <n> controls valid` and exits 0.

| File (relative to `plugins/dx-harness/`) | On `main`? | What this issue does |
|---|---|---|
| `standards/quality-bar.md` | **No** | Bring the prototype across, delete the banner, fix the counts |
| `standards/layout-patterns.md` | Yes, 117 lines | Slim to the header plus the named patterns |
| `standards/README.md` | Yes, 170 lines | Add the ceiling pointer paragraph |
| `agents/dx-design-review.md` | Yes, 288 lines | Replace rubric section 4 with the stub |
| `checks/validate.py` | Yes, 1923 lines | Two entries in `cross_ref_files` |
| `skills/design/dx-design-critique/SKILL.md` | Yes | Split the pointer |
| `skills/design/dx-design-critique/critique.md` | Yes | Split the pointer, rewrite the `#4` citation |
| `skills/design/dx-design-execute/SKILL.md` | Yes | Split the pointer |
| `skills/design/dx-design-pattern/SKILL.md` | Yes | Split the pointer |
| `standards/controls/lay-7.md` | Yes | Repoint, and rewrite an `item 1` citation |

### Adoption is a branch move, and this issue owns it

Verified with `git cat-file -e main:<path>`: **`standards/quality-bar.md` and `docs/specs/2026-08-14-catalogue-reliability.md` do not exist on `main`.** Both exist only on `prototype/quality-bar-shape`, which has since merged `origin/main` (`75aa130`) and now sits 12 commits ahead of `main` and 0 behind. "Adopt" therefore means moving content between branches, which spec sections 1 to 5 never spell out.

**Ruled by the epic (#144, 2026-08-14): this issue owns landing the branch-only prerequisites as its first prerequisite commits — no child 0 exists.** The epic's "prerequisite nobody owns" table (the IDN-4 removal, the CONTEXT.md terms, the spec document, the prototype itself) resolves here. Mechanism stays as groomed below.

**Copy the file, do not cherry-pick and do not merge.** On a fresh branch off `main`, run `git show prototype/quality-bar-shape:plugins/dx-harness/standards/quality-bar.md > plugins/dx-harness/standards/quality-bar.md`, then apply the adoption edits as one reviewable commit. Cherry-picking the prototype commits (`4aac152`, `d299293`, `fd70ac4`, `091b331`, `fddf791`, plus the post-merge repair `7ad1478`) also works and preserves history, but the file's own `# Decisions recorded` section already carries that history, and one commit in the same range (`890b9c3`) conflicts on a renamed path (below). Merging the branch wholesale is the worst option: it drags the spec, `CONTEXT.md`, and the whole IDN-4 change in one unreviewable lump.

**Land `docs/specs/2026-08-14-catalogue-reliability.md` on `main` too**, in this issue or a chore alongside it. Every child issue of #144 links the spec at a `prototype/quality-bar-shape` blob URL. When that branch is deleted the links die. Precedent exists: `docs/specs/2026-08-12-design-skills-restructure.md` is already on `main`.

### The 69 vs 70 trap, which blocks the acceptance criteria as written

Section 11 (line 732) says the two "70 controls" figures are stale "since IDN-4's removal at `890b9c3`". Verified: **`890b9c3` is not on `main`.** `git merge-base --is-ancestor 890b9c3 main` fails, and `git branch --contains 890b9c3` lists only `prototype/quality-bar-shape`. On `main` the catalogue still has **70 controls, IDN-4 included** (`standards/catalog.yaml:1003`), and `agents/dx-design-review.md:170` still grades IDN-4. On this branch `validate.py` prints `OK: 69 controls valid`; on `main` it prints 70.

So the acceptance criterion "both control counts read 69" is only satisfiable if the IDN-4 removal lands on `main` first. **Per the epic's ruling this removal is a prerequisite of this issue**: land it as its own commit before the artifact, carrying `docs/catalog-changes/idn-4-removal.md`, the `catalog.yaml` deletion, `controls/idn-4.md`, `controls/idn-3.md`, and the reviewer and copy-skill reference edits. `890b9c3` cannot be cherry-picked clean: it edits `skills/design/dx-copy/SKILL.md`, a path that no longer exists on `main` (it is `skills/design/dx-design-copy/SKILL.md` now), so that one hunk must be reapplied by hand. If the removal is deferred instead, both figures in the artifact must read **70**, not 69, and the acceptance criterion needs amending.

The epic previously recorded that no issue owned landing the IDN-4 removal on `main`; its 2026-08-14 ruling assigns it here. #150 covers the relabels and the section 11 corrections and never names IDN-4.

### Stale line numbers, corrected

- **`cross_ref_files`**: spec says `checks/validate.py:838`; **current on `main` is `:917`** (the list is `:917` to `:921` and holds `README.md`, `checks/README.md`, `docs/decisions/TEMPLATE.md`). The spec's number was taken on the branch before it merged `main` at `75aa130`. `validate.py` is 1923 lines on `main`.
- **Rubric section 4**: spec says `agents/dx-design-review.md` line 190; **current on `main` is `:196`**. The section runs `:196` to `:230`, and `## Output format` follows at `:232`. Line 190 on `main` sits inside the CNT-14 paragraph.
- **The two stale counts in the artifact**: spec says `standards/quality-bar.md:27` and `:416`. Verified on the branch today: `:27` exact, the second has drifted one line to **`:417`**. `:27` is the opening paragraph, `:417` is inside recorded decision 1.
- **Artifact size**: spec says about 530 lines and about 5,100 words. Verified **532 lines** and **5,772 words** (`wc -w`), about 13 percent over the spec's word figure.
- **Design quality threshold count**: section 3's table says "seven thresholds"; the prototype carries **eight** (`quality-bar.md:177` to `:184`). The eighth is principle 5's swept residue, "Running text ragged-left, never centred", at `:184`, so the table was written before the sweep.

### `cross_ref_files` (structural check 1)

Two lines inside the list at `validate.py:917`:

```python
os.path.join(repo_root, "standards", "quality-bar.md"),
os.path.join(repo_root, "standards", "layout-patterns.md"),
```

The list feeds `all_xref_files` at `:1107`, which runs `cross_ref_errors` (`:286`) per file: every `\b(PREFIX)-\d+\b` match that is not a catalogue id becomes `ERROR <path>:<line>: references unknown control id '<ID>'`. Neither file is reached by the runtime sweep today, because that walks `skills/`, `agents/`, `procedures/` and `docs/catalog-changes/` only (`:1104`), and both files sit under `standards/`.

Verified by running the real regex and the real catalogue against both files: **zero unresolved ids in either, against both the 70-control `main` catalogue and the 69-control post-IDN-4 one.** The two lines are safe to add on their own, in either order relative to the slimming. Section 2's claim that all **34** control ids cited in the prototype resolve is confirmed exactly: 34 distinct ids, all present.

Proposed (not in the spec): update the `validate.py` module docstring step 7 (`:12` to `:14`), which lists the swept trees and does not mention `standards/`.

### Structural check 3 does not cost zero new code

Section 2 line 142 and section 6 line 321 both claim the rubric stub's slug list needs "no new code" because "the existing fence-parity mechanism in `validate.py` enforces it". **That is not true on `main`.** There is no generic fence-parity driver. Every parity check is a named function with hard-coded source and consumer paths: `l0_parity_errors` (`:349`), `lay_parity_errors` (`:378`), `slp9_parity_errors` (`:409`), `_table_parity_errors` (`:800`, wired to `dx-design-copy/SKILL.md` and two website files). The reusable parts are the two helpers `extract_sync_block` (`:319`) and `required_consumer_errors` (`:89`), plus the call site in Step 8 (`:1117` to `:1124`). Criterion slugs are not control ids, so `xref_re` cannot extract them either; a slug tokenizer is needed.

So the acceptance criterion "with no new validator code written for it" is not achievable. Proposed (not in the spec): **write the parity function in this issue**, about 20 lines modelled on `lay_parity_errors`, tagged `[QUALITY-SYNC]`. Source: `standards/quality-bar.md`'s frontmatter `criteria:` list (already machine-legible, so no prose is parsed). Consumer: the `<!-- dx-sync:quality-criteria -->` fence in `agents/dx-design-review.md`. Compare as sets. Add the call in Step 8 and the tag to the module docstring at `:15`. The alternative is to add the fence markers here and leave the comparison to a later issue, which ships a decorative fence nothing enforces; #149's acceptance criteria do not cover it, so nobody else would pick it up. Note that `validate.py:307` and `:312` point at `docs/SYNC.md`, which **does not exist on `main`** at all, so there is no sync doc to update.

Structural check 2 (register ids in a DESIGN.md resolve in `quality-bar.md`) is #148's, not this issue's.

### The counts are not mechanically guarded

`[COUNT-SYNC]` compares every "`<N> controls`" claim against the live catalogue, but only in the two files named by `COUNT_SYNC_PATHS = ("README.md", "docs/index.html")` (`validate.py:467`), scanned at both the plugin root and the site root. **`standards/quality-bar.md` is not scanned**, which is exactly why the "70 controls" figures rotted unnoticed. Fixing them is a manual edit. Proposed (not in the spec): add `standards/quality-bar.md` to `COUNT_SYNC_PATHS` so the figure cannot rot again. This is a count claim, not prose, so it does not cross the "never validate the prose" line. Not required by the spec, and safe to decline.

### `layout-patterns.md`, mapped to lines on `main`

| Lines on `main` | Part | Disposition (section 5) |
|---|---|---|
| `:1` to `:7` | Title plus "guidance, not controls; the control wins" | Stays |
| `:9` to `:12` | Register framing paragraph | Dropped. The header points at the quality bar's Registers section instead |
| `:14` to `:45` | The eight numbered principles | Dropped, absorbed |
| `:32` | Principle 5's residue, "Avoid centred running text" | Already swept in, at `quality-bar.md:184`. Nothing to write |
| `:47` to `:60` | "Reading a screenshot" | Deleted. Already at `quality-bar.md:135` to `:145` as the Design quality Procedure |
| `:62` to `:117` | "Named patterns" plus its four subsections | Stay |

The slimmed file lands at roughly 65 lines: the header block plus `:62` to `:117`. Control ids surviving in it are CMP-5, LAY-5, SLP-5, SLP-10, SLP-11, TYP-5, all resolving. Ids leaving with the principles are LAY-1, LAY-3, LAY-4, LAY-6, SLP-4, SLP-6, SLP-7, plus the `SLP-1..11` span at `:44`. None of those disappears from the skill layer, so `[SKILL-SYNC]` is unaffected: it sweeps `skills/`, `agents/`, `procedures/` only, and `standards/layout-patterns.md` was never in that set.

### The reviewer fold, and what section 4 actually contains

`agents/dx-design-review.md:196` to `:230` on `main`: the four criterion bullets, the HIG framing tags (Simplicity, Delight, Craft, Agency), the Kind Utility clause inside the Design quality bullet at `:202` to `:203`, the semantic-colour carve-out at `:212` to `:216`, and the dark-mode bullet at `:220` to `:224`. The only control ids inside the block are COL-2, SLP-1 and TOK-1. Verified each still appears in at least one other file under `skills/` or `agents/` on `main`, so removing the block cannot trip `[SKILL-SYNC]`.

The replacement stub is 5 to 8 lines: the four slugs inside a `dx-sync` fence, a pointer to `standards/quality-bar.md`, and the quote-your-anchor requirement. Write the path as `standards/quality-bar.md`, matching how input 4 at `:43` names `standards/catalog.yaml`; the agent receives the absolute `standards/` path from its spawn (`:20` to `:22`) and resolves detail files relative to it. The file already carries one fence, `dx-sync:lay-controls` at `:157` to `:166`, so the convention is in place.

### The five reference updates, verified by grep on `main`

`git grep -n layout-patterns main` returns **five files under the plugin, matching the spec's count** (six hits, because `critique.md` appears twice):

1. `skills/design/dx-design-critique/SKILL.md:30`: the run-it summary, "structured layout read against the pattern inventory".
2. `skills/design/dx-design-critique/critique.md:16`: step 2's layout read. This is the spec's "step 2".
3. `skills/design/dx-design-critique/critique.md:38`: the `(layout-patterns.md #4, LAY-5)` example citation.
4. `skills/design/dx-design-execute/SKILL.md:136`: "runs a structured layout read (against the pattern inventory...)".
5. `skills/design/dx-design-pattern/SKILL.md:40`: the Reference block, which already names both halves: "the regions, squint-test, alignment, density, and grouping read, plus the named patterns".
6. `standards/controls/lay-7.md:44`: "Align this read with the pattern inventory... **item 1**".

Two corrections to the spec's reference-update list at lines 279 to 286:

- The spec's four bullets cover only four of the five files. **`dx-design-critique/SKILL.md:30` is named nowhere in the spec** and needs the same pointer split as `critique.md:16`.
- The spec, and the Background above, say one file cites a numbered principle. **Two do.** `critique.md:38` cites `#4` (Density by register) and `lay-7.md:44` cites `item 1` (One focal point). The acceptance criterion still holds; the count in the Background is wrong by one.

A sixth hit exists outside the plugin, `docs/specs/2026-08-12-design-skills-restructure.md:176`. Proposed (not in the spec): leave it alone. It is a dated historical spec, not live guidance.

Proposed (not in the spec): rewrite `critique.md:38` as a quoted anchor plus the control, `("dense but not cramped", LAY-5)`, quoting `quality-bar.md:151` so the example demonstrates the quote-the-anchor rule it now depends on. Proposed (not in the spec): rewrite `lay-7.md:44` to point at the quality bar's Design quality Procedure squint-test step rather than at a numbered item.

Proposed (not in the spec): `critique.md` step 2 (`:16` to `:24`) restates the whole (a) to (e) read inline. That is a third copy of a procedure the spec says moved into the quality bar, and section 5's disposition table does not mention it. Replace the inline list with a pointer to the Design quality Procedure, keeping only the "write it down before judging" instruction, so the fold does not leave a copy behind in the skill layer.

### The prototype's skill names were already repaired

An earlier draft of this issue found six lines using pre-rename skill names. **The post-merge repair `7ad1478` already translated them**: the prototype now names `dx-design-execute` (`:47`), `dx-design-critique` (`:60`, `:505`, `:518`), `dx-design-pattern`, `dx-design-polish`, `dx-design-motion` and `dx-design-flow` (`:62`, `:506` to `:507`), all of which exist on `main`. The adoption commit re-verifies with a grep for the old names (the "names only skills that exist" scenario below) and translates nothing.

Proposed (not in the spec): set the frontmatter to `version: "1.0"` and `updated:` to the adoption date. The prototype reads `version: "0.2-prototype"`, which is a prototype mark the acceptance criterion does not name but plainly means. Proposed (not in the spec): keep the `# Decisions recorded` section (`:407` to `:532`, 28 numbered items). Deleting the banner removes the only sentence pointing at it, but the section carries its own heading and is the artifact's own change record.

### `standards/README.md`

170 lines on `main`, structured as intro (`:1` to `:11`), `## Schema`, `## Scope`, `## Tiers`, `## Check types`, `## Enforcement`, `## Authoring rules` (`:129`, rule 4 at `:139` to `:144`), `## Detail file format`. Nothing in the file mentions `quality-bar.md`, `layout-patterns.md`, or a ceiling. Proposed (not in the spec): place the pointer as a short `## The ceiling` section immediately after the intro paragraph at `:11`, before `## Schema`, because the floor and ceiling framing belongs beside the "if you can't check it, it's a principle" litmus test that the ceiling is the answer to. One paragraph: that `quality-bar.md` exists, that it never blocks, and that anchors are not controls.

Note a merge-order coupling: #146 also edits `standards/README.md` (section 13 addition 1, the triage authoring rule). Different sections, so no textual conflict, but land them in a known order.

### CONTEXT.md

Section 14 and section 4 treat the glossary as already carrying **Quality bar** and **Register**. Neither is on `main`: they arrived on `d299293` and `fd70ac4`, both prototype-branch-only. Proposed (not in the spec): this issue adds the **Quality bar** entry to `CONTEXT.md` (nothing else in the epic claims it) and leaves **Register** to #148, which does claim it. The same class of error affects #146, which states the **Accepted gap** term "already" landed at `31d18df`; that commit is prototype-branch-only too.

Two glossary terms have no CONTEXT.md entry on **either** branch: `honest-inert` and `anchor` exist only in the spec's section 14. Per the epic's ruling, this issue either adds both entries during adoption or records that their citations stay spec-pointed; decide on landing and say which in the PR.

### One coupling with #150

`quality-bar.md:179` and `:195` hardcode **SLP-6's 1.25x**. Section 11 (line 727) drops SLP-6's threshold to **1.10x**, and that edit is #150's. Whichever lands second must update the other side; the spec never flags it. `catalog.yaml:1091` and `:1096` on `main` still say 1.25.

### What this issue does not wire

Sections 4 and 6 are #148's and #149's: the DESIGN.md `## Quality bar` section, `generate-design-json.py`, the register-existence check, the plan-summary row, the `QUALITY GRADES` block, the reader load points, and `audit-record.py`'s quoted-substring backstop. `implement-craft.md`'s one pointer line to the Craft criterion is listed as out of scope by both this issue and #149, so no issue currently owns it.

## Data model

No database and no runtime types. Three declared shapes, all in Markdown or YAML.

**1. `quality-bar.md` frontmatter.** The only machine-legible part of the artifact, and the source for structural checks 2 and 3. Copy these keys exactly (section 2, lines 98 to 110), verified against the prototype:

```yaml
artifact: quality-bar
version: "1.0"
updated: "<adoption date>"
grades: [strong, acceptable, weak]
criteria: [design-quality, originality, craft, functionality]
registers:
  product:
    name: Teacher & School product surfaces
    default: true
  standards-site:
    name: The DX Design Standard website
```

Constraints: `criteria` holds exactly four slugs, in that order, and is the source of truth for the reviewer stub's fence. `registers` holds exactly two keys; exactly one carries `default: true`. `grades` holds exactly three values. `version` and `updated` are quoted strings.

**2. The per-criterion body.** Four criteria, each an `#` heading followed by the same six `##` blocks in the same order: Grades what, Procedure, Pairings, By surface, Thresholds, Not this criterion's job. Verified in the prototype: 4 of each, no fifth block anywhere, no criterion missing one. This is the control detail file's six-part discipline reused, so the artifact reads as a sibling of the catalogue.

Measured anchor counts, as adopted, for anyone checking nothing was lost in the move:

| Criterion | Procedure steps | Pairings | By-surface rows | Thresholds | Not-this-job rows |
|---|---|---|---|---|---|
| design-quality | 4 | 6 | 6 | 8 | 6 |
| originality | 3 | 4 | 6 | 6 | 5 |
| craft | 4 | 5 | 6 | 6 | 8 |
| functionality | 4 | 4 | 6 | 4 | 6 |

Every criterion carries the same six surface types: data entry, scanning, reading, decision, empty state, overview. Dark mode is a global condition beside the Grades section (`:87` to `:90`), not a fifth criterion and not a Craft note.

**Anchors carry no ids, and none may be added.** An anchor is a pairing row, a By-surface row, or a threshold row, cited by quotation exactly as CNT-14 cites the voice table. A register note is written inline on one anchor as `[standards-site: ...]`; absent means global, never an empty list. Control ids appear as bare text with no link, because 23 of the catalogue's controls have no detail file to link to (verified: 23 on `main`, and 14 of the 34 ids the artifact cites are among them).

**3. The reviewer stub's fence.** In `agents/dx-design-review.md`, replacing `:196` to `:230`:

```
<!-- dx-sync:quality-criteria -->
design-quality · originality · craft · functionality
<!-- /dx-sync:quality-criteria -->
```

The slug set inside the fence must equal the frontmatter `criteria` list as a set. Order and surrounding prose are free, matching how `[L0-SYNC]` and `[LAY-SYNC]` compare sets rather than strings.

## API contract

N/A. Nothing here is a service. The deliverables are two Markdown files, a Markdown stub inside an agent file, a README paragraph, and two lines added to a Python list. Nothing gains an HTTP endpoint, a route, a JSON payload, or a network call, and the website is explicitly out of this effort (section 13, "The website: no work in this effort").

The one interface worth naming is a CLI, and it is unchanged: `python3 plugins/dx-harness/checks/validate.py` takes no new flags, no new arguments, and no new environment variables. Its `--coverage` mode is untouched.

## Error contract

No HTTP statuses, for the reason in the API contract. Two contracts apply.

**The validator's existing contract, unchanged.** Success prints `OK: <n> controls valid` and exits 0. Any failure prints one `ERROR <location>: <message>` line per problem and exits 1. New failures reachable through this issue, all reusing that format:

| Condition | Line emitted |
|---|---|
| `quality-bar.md` cites an id absent from the catalogue | `ERROR standards/quality-bar.md:<line>: references unknown control id '<ID>'` |
| `layout-patterns.md` cites an id absent from the catalogue | `ERROR standards/layout-patterns.md:<line>: references unknown control id '<ID>'` |
| The stub's fence is missing or unclosed | `ERROR agents/dx-design-review.md [QUALITY-SYNC]: missing dx-sync:quality-criteria markers` |
| The fence's slugs differ from the frontmatter's | `ERROR agents/dx-design-review.md [QUALITY-SYNC]: inline criterion list {...} != quality-bar.md criteria {...}` |
| `standards/quality-bar.md` is deleted or renamed while declared as a consumer | An ERROR, never a silent skip, per `required_consumer_errors` and the ruling on #122 |

Follow the existing wording exactly: lowercase `references unknown control id` for sweep failures, and a bracketed tag for parity failures.

**The ceiling's own contract: it has no error state.** A missed anchor produces a grade and a sentence, never an `ERROR` line, never a `BLOCKING` entry, never an `ADVISORY` entry, and never a non-zero exit. A miss worth blocking on is rule-proposal evidence for a new control, taken to `catalog.yaml` with the observed failure attached (section 1). Dark mode graded `N/A: product has no dark mode` is a truthful outcome, not an error. A grade that quotes no anchor is unfinished rather than failed, and the mechanical backstop for that lives in `audit-record.py` under #149, not here.

## Additional test scenarios

### The cross-reference sweep reaches the artifact

- **Given** `standards/quality-bar.md` is in `cross_ref_files` and an editor writes an id that does not exist, for example `LAY-99`
- **When** `python3 plugins/dx-harness/checks/validate.py` runs
- **Then** it prints `ERROR standards/quality-bar.md:<line>: references unknown control id 'LAY-99'` and exits 1

### The sweep reaches the slimmed pattern inventory too

- **Given** `standards/layout-patterns.md` is in `cross_ref_files` and one of its surviving named-pattern ids is mistyped
- **When** the validator runs
- **Then** it reports that line, proving the file was never swept before this issue: the runtime walk covers `skills/`, `agents/`, `procedures/` and `docs/catalog-changes/` only, and this file sits under `standards/`

### Adding both files reports nothing new on the day it lands

- **Given** the two `cross_ref_files` entries are added and neither file has been edited yet
- **When** the validator runs
- **Then** the control count is the only thing printed and the exit code is 0, because all 34 ids cited in the artifact and all 6 surviving in the inventory resolve

### The count fix depends on IDN-4, and says so out loud

- **Given** the artifact is adopted onto a `main` where `catalog.yaml` still holds 70 controls
- **When** `:27` and `:417` are set to 69 as the acceptance criteria require
- **Then** the artifact contradicts the catalogue it sits beside, so either the IDN-4 removal lands in the same change or both figures read 70

### The slug fence catches drift in both directions

- **Given** the fence in the reviewer stub and the frontmatter `criteria` list agree
- **When** a slug is renamed in the frontmatter, or added to the fence, or dropped from either
- **Then** the validator reports a `[QUALITY-SYNC]` mismatch naming both sets, and set comparison means reordering the slugs or rewording the prose around them reports nothing

### A missing fence is an error, not a pass

- **Given** the stub is rewritten and the `dx-sync:quality-criteria` markers are dropped
- **When** the validator runs
- **Then** it reports the missing markers rather than skipping the check, matching `required_consumer_errors` and the #122 ruling that a moved consumer must never look in sync

### Deleting rubric section 4 orphans no control id

- **Given** `:196` to `:230` are removed, taking the only mentions of COL-2, SLP-1 and TOK-1 in that block with them
- **When** the validator runs `[SKILL-SYNC]`
- **Then** no control is reported unwired, because each of the three still appears in at least one other file under `skills/` or `agents/`

### No numbered-principle citation survives anywhere

- **Given** the eight numbered principles are gone from `layout-patterns.md`
- **When** the tree is grepped for numbered references to the inventory, including `#4`, `item 1`, `pattern 4` and `patterns 3 and 6`
- **Then** the only hits are in dated files under `docs/specs/`, and both live citations (`critique.md:38` and `lay-7.md:44`) have been rewritten

### The stub points and does not restate

- **Given** the replacement stub
- **When** it is measured and read
- **Then** it is 8 lines or fewer, contains no criterion prose, no HIG tag (Simplicity, Delight, Craft, Agency), no Kind Utility line, and no dark-mode bullet, and the semantic-colour carve-out is found instead as an Originality threshold naming COL-2 and SLP-1

### No anchor acquires an id

- **Given** the adopted artifact
- **When** its pairing, By-surface and threshold rows are read
- **Then** no row carries an id, a number, or any other citable handle, and the four criterion slugs are the only identifiers in the file

### The artifact names only skills that exist

- **Given** the adopted artifact
- **When** it is grepped for the pre-rename skill names
- **Then** there are no hits for `dx-critique`, `dx-layout`, `dx-polish`, `dx-motion`, `dx-flow` or `dx-copy`, and every named skill resolves to a directory under `skills/design/`

### The website is untouched

- **Given** the adoption, the slimming, and the stub have all landed
- **When** `pnpm build` runs
- **Then** it succeeds unchanged: `lib/catalog.ts` projects controls through an explicit field list, no route reads `quality-bar.md` or `layout-patterns.md`, and nothing on the site references either file

## Hard constraints

- **The quality bar never blocks, in any form.** No anchor may enter `BLOCKING` or `ADVISORY`. No anchor miss may set a non-zero exit code, fail a check, or appear as a finding. A miss is evidence for a grade, and nothing else (section 1).
- **No control enters `catalog.yaml` through this issue.** The ceiling sits outside the catalogue and authoring rule 4 (`standards/README.md:139`) does not bind it. A ceiling miss worth blocking on is rule-proposal evidence to be taken to `catalog.yaml` separately, with the observed failure attached.
- **Anchors get no ids, ever.** Not a number, not a slug, not a stable handle of any kind. An id-shaped reference in a report would send the reader to `catalog.yaml` to look for a control that does not exist, which is the single confusion this artifact exists to prevent (section 2).
- **Do not take the index-plus-`quality/<criterion>.md` split.** It is a documented fallback for if the whole-file read proves too heavy in practice, and taking it pre-emptively is explicitly forbidden (section 2). One file, 532 lines, read whole at every plan.
- **Do not schema-validate the prose.** `validate.py` gets structural checks only. Adding a schema over the criterion bodies would turn the ceiling into a controls file by the back door (section 2). Structural check 1 is a list entry; check 3 reads the frontmatter and a fence, never the prose between them.
- **`layout-patterns.md` survives under its own name.** It is slimmed to the header plus the four named patterns, not folded away and not renamed. Folding it in was rejected on two recorded grounds: about 55 more lines read whole at every plan, and swap guidance produces findings, which cannot live in a file that never blocks (section 5).
- **Do not restate anything in the reviewer stub.** 5 to 8 lines: four slugs, one pointer, the quote-your-anchor rule. No criterion prose, no procedure, no threshold, no pairing. If the stub grows past 8 lines it is restating.
- **Do not change any anchor text, any pairing, the grade scale, or the six-surface axis.** The prototype's content is fixed. The only grounds for changing an anchor are the recorded findings of the evidence run in #145, which blocks this issue.
- **Do not alter `catalog.yaml` control counts to make the artifact's figures true.** Either the IDN-4 removal lands as its own prerequisite commit or the figures read 70. Do not delete IDN-4 as a side effect of adopting the artifact.
- **Nothing is installed or configured in any target repo.** No new dependency, no new config file, no ast-grep rule. This issue is Markdown plus two lines of Python.
- **Registers are declared here and selected elsewhere.** Do not add a third register, and do not add override grammar for the ceiling: it never blocks, so there is nothing to waive (section 4). Do not touch `docs/templates/DESIGN.md` or `generate-design-json.py`; those are #148's.
- **Do not wire any load point, plan row, or verdict block.** Adoption puts the file in place. Section 6's wiring is #149's, and doing it here makes both PRs unreviewable.
- **Use the spec's words.** quality bar, register, anchor, static check, rendered check, accepted gap, honest-inert. One term per concept, in code and in prose.

---

*🤖 Generated with create-issue*
*🤖 Groomed with groom-issue*


