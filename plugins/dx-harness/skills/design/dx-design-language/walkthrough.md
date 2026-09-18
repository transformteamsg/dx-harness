# The walkthrough (companion to SKILL.md)

One ordered pass through the ten sections on a first run; a targeted single-section
edit on a re-run. Confirm-or-correct is the approval: what the person confirms is
what gets written.

## Evidence sources and the source-of-truth election

Evidence is the code first, plus two built-in ingest steps when the person offers
them:

- **Figma via MCP.** Set the MCP up yourself; ask the person only when you are
  blocked (a token, a file link, a permission).
- **Pasted brand docs or screenshots.** Read what they drop in.

When sources disagree, the person makes a **source-of-truth election**: code wins,
Figma wins, or a hybrid split per part. The election guides elicitation only; code
stays the runtime authority. Where the elected source beats shipped code, file a
fix-todo: title `Design fix: <what>`, label `design-fix-todo`, body citing the
elected source and the code it beats (`../../../procedures/design-tickets.md`; with
no tracker, append to `docs/design-tickets/TODO.md`). You never write product code.

## Per-section mechanics

- **Mine, then confirm-or-correct** for the minable sections (Colour, Typography,
  Tokens, Motion, Layout system, Components): show what the code says, ask the
  guiding questions only where the evidence is silent or contradicts itself, and let
  the person confirm or correct. In interview-first mode, ask the guiding questions
  instead; record decisions with no code target with a "not yet implemented" note
  plus a fix-todo.
- **Interview** for Essence, Voice & Tone, and Guardrails. These cannot be mined;
  ask, listen, and draft in the person's words.
- **Skip** = portfolio default, said out loud: "Skipping Motion: portfolio defaults
  now apply to motion." The assembled file then has no such section. Essence is the
  exception, and the only one: nothing defaults it, so say what skipping actually
  means — "Skipping Essence: this product declares none, and no default stands in"
  (`../../../procedures/design-essence.md`).
- **Defer** = one tracker issue for that section: title `DESIGN.md: <section>`,
  label `design-language-todo`, body carrying the section's guiding questions below
  (`../../../procedures/design-tickets.md` §Related issues; with no tracker, append
  to `docs/design-tickets/TODO.md`). The assembled file has no such section until
  the issue is resolved.
- Keep every section in the DESIGN.md rules: values and decisions with control ids
  cited, never a restated rule. Layout system bullets are machine-read; keep them
  exact (`- key: value`).

## The ten sections, in order

1. **Essence** (interview). What should this product feel like, in one sentence?
   When two good options compete, which instinct wins? The one section with no
   portfolio default behind it, so skipping it is a decision to declare none, not an
   inheritance.
2. **Colour** (mine, then confirm). What is the one primary? Where does functional
   colour come from (accent vs the scales)? Cites COL-1, COL-2.
3. **Typography** (mine, then confirm). One family or two? Base size and leading?
   Scale steps? Where are numerals tabular?
4. **Tokens** (mine, then confirm). Source file? Prefix? Spacing base? Dark-mode
   strategy? Pointers into the code; the code is the authority.
5. **Motion** (mine, then confirm). Signature entrance? State change? Durations and
   ease? Signature moves only; MOT, SLP, and A11Y controls bind unstated.
6. **Voice & Tone** (interview). Register? Person? Locale? What do empty states do?
   This product's weighting of content §6 only.
7. **Layout system** (mine, then confirm; machine-read, bullets kept exact).
   Columns, gutter, margins, breakpoints, max content width?
8. **Components** (mine, then confirm). Manifest path? Product-level component
   decisions (pairing rules, fallback conventions)?
9. **Guardrails** (interview). What must an agent never do in this product? What
   realities does no catalogue control cover? Ten bullets max, never restating a
   control.
10. **Overrides**. Starts empty; filled only by the waiver promotion flow or a
    volunteered deviation (SKILL.md). Never ask whether the team "has any
    deviations". If one is volunteered, record it as a structured line in the
    grammar with its reason (and approver on L1), and let the generator validate it.

## Assemble, preview, write

1. Assemble the file in the template's shape (`../../../docs/templates/DESIGN.md`),
   skipped and deferred sections absent.
2. Render one preview of the whole file and ask for a yes. The per-section
   confirmations plus this preview are the approval; there is no other gate.
3. Write `DESIGN.md` at the product repo root, regenerate the projection
   (`python3 <harness>/scripts/generate-design-json.py <repo-root>`, with
   `<harness>` the resolved harness root from SKILL.md's path note), and offer to
   commit both files. If the generator rejects a line, fix it with the person and
   regenerate; nothing ships past a rejected line.

## Re-runs

When `DESIGN.md` already exists, default to a targeted edit: name the section the
person wants changed (or the waiver being promoted), run just that section's
mechanics, preview only the changed section in context, then write and regenerate as
above. Do not re-walk the other nine sections unless asked.
