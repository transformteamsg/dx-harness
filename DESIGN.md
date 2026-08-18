# DESIGN.md — DX Harness website

<!--
Regenerate the typed projection after every edit:
    python3 plugins/dx-harness/scripts/generate-design-json.py .

Scope note, deliberate: this file records what this repo's code and decision
records already decide. It is evidence, not invention. Sections the site does not
differ from the portfolio default on are omitted, per the template's rule that
absent means default. Two are omitted on purpose and named here so their absence
reads as a decision rather than an oversight:

  - Layout system. Declaring one would switch LAY-1 from N/A to graded, and this
    site has two layouts, not one: a 1040px sheet on the landing routes and a
    sidebar shell at 1320px on the docs routes. Declaring either would create
    false failures on the other. It stays undeclared until the two are one system
    or the control learns to be told about two.
  - Overrides. There are none, and every decision record in docs/decisions/ says
    so. An empty section would project as an empty list, which reads the same;
    omitting it keeps the claim in one place.

The interpretive half of a design language — essence weighting, a motion
signature, voice — is the builders' to set, not an agent's to draft. What is here
is what the code and the records already establish. Where this file states a
judgment rather than a measurement, it says so.
-->

## Essence

Drafting-table plainness. The site reads as a measured sheet: hairline rules, a
1040px plate, construction marks that answer to real numbers. When two options
compete, the quieter one wins, and a mark earns its place by deriving from
something already on the page rather than by decoration.

<!-- Judgment, not measurement: this paraphrases the direction recorded in
     docs/decisions/landing.md ("Frame", chosen from three explorations) and
     landing-sheet-ground.md. Builders should confirm or replace the wording. -->

## Colour

<!-- Cites COL-1, COL-2. `pairs` is machine-read by checks/contrast.py: each
     [foreground, background] pair is measured against WCAG AA, which is what
     turns A11Y-1 (L0) from a manual check into a scripted one for these
     pairings. Every pair below is one the site actually renders, and each was
     measured before being declared. Computed colours on a rendered page are
     still out of scope for any token check. -->

- primary: --site-accent #BDEE63 (Radix lime-9), with --site-accent-hover lime-10 and --site-accent-text lime-11 darkened to #587828
- functional: none declared; this site carries no success/warning/danger surface
- pairs: [["--foreground", "--background"], ["--foreground", "--surface"], ["--foreground", "--muted"], ["--foreground", "--sheet-band"], ["--foreground", "--site-accent"], ["--prose-body", "--background"], ["--prose-body", "--surface"], ["--muted-foreground", "--background"], ["--muted-foreground", "--surface"], ["--muted-foreground", "--muted"], ["--muted-foreground", "--sheet-band"], ["--site-accent-text", "--background"], ["--site-accent-text", "--surface"], ["--site-accent-text", "--muted"], ["--site-accent-text", "--sheet-band"]]

Two tokens are darkened from their Radix source for one reason, recorded here
because it is the kind of thing a later edit undoes by accident:
`--muted-foreground` from zinc-500 and `--site-accent-text` from lime-11, each so
it clears AA on every ground it lands on rather than only on the page background.

## Typography

<!-- Cites TYP-1 through TYP-6. -->

- display: Plus Jakarta Sans Variable
- body: Inter Variable
- families: those two only; code chips use the body face at the body size
- scale: 12, 14, 16, 18, 20, 24, 30, 36 (Tailwind default steps)
- numerals: tabular where figures align in a column

## Tokens

<!-- Pointers into the code; the code is the authority. Cites TOK-1 to TOK-3. -->

- source: app/globals.css
- spacing: Tailwind default scale; no custom spacing tokens
- radius: --radius 0.5rem, with rounded-lg the site's one shape
- dark-mode: none; this site is light-only and declares no `.dark` layer

## Motion

<!-- Signature values only. MOT and A11Y-5 bind unstated. -->

- durations: --motion-fast 120ms, --motion-base 200ms, --motion-slow 300ms
- narrative: --motion-story 600ms, for explanatory figures only, never task UI
- easings: --ease-out for entrances and exits, --ease-in-out for on-screen movement
- reduced-motion: every consumer ships a variant; narrative figures rest on their finished state

## Voice & Tone

Second person, active voice, sentence case, Singapore English. The audience is
designers and engineers working with coding agents, so the register is plain and
technical without being clipped. "Catalog" keeps its US spelling as the artifact's
own name; everything else follows the SG spelling map.

The fuller account lives at content/guidelines/voice-tone.mdx and is the
authority; this section records only the weighting.
