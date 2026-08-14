# Ratchet decision — LAY-4 / TYP-6 conflate the CSS `ch` unit with character count

- **Kind:** admit/reject decision on a ratchet candidate
  ([#123](https://github.com/transformteamsg/dx-harness/issues/123), candidate 6)
- **Decision:** **admitted as a measurement clarification** to the existing
  LAY-4 and TYP-6 detail files — not a new control, and no tier changes.
  Approval per `procedures/rule-proposal.md` lands with the merge of the PR
  carrying this record; the detail-file amendments ship separately.
- **Origin (evidence, not speculation):** in the first end-to-end run,
  `.prose { max-width: 70ch }` read as compliant against LAY-4's 80ch ceiling
  while rendering roughly 86 actual characters per line in Inter — about 12%
  over the real measure.

## The gap

The CSS `ch` unit is the advance width of the font's zero glyph, not an average
character width. In proportional text faces (Inter especially, whose zero is
wide relative to its lowercase), `N ch` fits noticeably more than N characters.
A declared `max-width: <n>ch` therefore under-states the rendered measure, and a
deterministic check that compares the declared number against the ceiling passes
lines that are really over it.

## The clarification to draft into the detail files

- The controls' ceilings are counted in **rendered characters per line**, not in
  CSS `ch` units. A declared `ch` value is a proxy that must be discounted for
  the face in use (for Inter, treat ~0.82 × the `ch` value as the character
  budget — i.e. a 65ch declaration is roughly an 80-character measure).
- Verification measures a rendered line (count characters in a screenshot or via
  the DOM), or applies the face's discount factor to the declared value; a bare
  `ch` comparison is not evidence of compliance.

## Re-audit set

Any shipped surface whose prose measure is declared in `ch` at or near the
ceiling — starting with the trial surface's `.prose { max-width: 70ch }`
([#38](https://github.com/transformteamsg/dx-harness/issues/38) efficacy
report). The amendment's arrival re-opens LAY-4 verification for those surfaces
only; everything comfortably under the discounted budget stays compliant.
