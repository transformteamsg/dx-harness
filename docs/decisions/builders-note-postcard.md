# Design decision record — builder's note postcard

- **Date:** 2026-08-19
- **Product:** other — the DX Design Harness site itself
- **Change type:** modification (the `/note` opening)
- **Page type:** narrative letter page
- **Run type:** attended — the builder directed each round in session
- **The reader and the moment:** a visitor opening the builder's note; the card
  is the letter's own form, not a doc-page figure.

## Sprint contract (done-criteria)

> Written retrospectively — this was an attended, session-directed run with no
> criteria declared upfront. The three below describe what the shipped
> component actually delivers, confirmed against the code on 2026-08-25.

1. The card opens picture-side up and flips to the message as the reader
   scrolls past the reference thresholds, and flips back above them —
   verified in both directions, plus an idle-timer fallback for a reader
   who never scrolls.
2. The message is the letter's actual opening prose and stays in the
   accessibility tree and in server-rendered (no-JS) HTML regardless of
   which face is visually showing.
3. Under reduced motion the two faces swap with no animated transition
   (verified: transition-duration 0s); the hidden face is marked inert
   so its content and alt text are never exposed or read twice.

## Chosen approach

The note opens as a postcard that arrives picture-side up and turns itself over
as the reader scrolls, mirroring the interaction contract of Dia's release-notes
postcard (thresholds, scroll-both-ways, idle-timer fallback) — the builder's
named reference. The message face holds the note's actual opening prose (left
half) and the address half (postmark, drawn symbolic Singapore stamp, blank
address rules, printed spine); the picture face holds the note's illustration
full-bleed with a mono header and the MOE, DXD mark. Decorative marks print in
Anonymous Pro (`--font-note-mark`), confined to the postcard.

## Rejected options

- **A click-toggle as the only flip control** — replaced at the builder's
  direction by the scroll-driven turn; the toggle was then removed outright
  because the message prose is never inert, so no content is locked behind the
  flip and the control had nothing left to unlock.
- **A real SingPost stamp image** — someone else's copyrighted artwork, and
  IDN-1's no-recreations rule cuts both ways; a symbolic orchid drawn in the
  site's ink line stands in.
- **A whole-card invisible flip button (Dia's own extra)** — killed by this
  repo's earlier review of the same component: an unlabelled control with no
  resting affordance (CMP-7, A11Y-6).

## Tradeoffs, named

- The flip runs at `--motion-story` (600ms), over MOT-1's 300ms interface
  ceiling, because it is narrative, not task UI. Waived below.
- A third typeface enters the site for this one device, against TYP-1.
  Anonymous Pro is the franking-machine voice of the postcard's decorative
  marks only — header, caption, spine, postmark, stamp — never product UI or
  body text. Waived below.
- The card auto-turns (scroll thresholds and a 2.5s idle timer), so a reader
  who wants the picture back must scroll up; there is no manual control. The
  message is never hidden from the accessibility tree, which is what makes
  this acceptable.

## Controls in scope

MOT-1, MOT-3, A11Y-5 (reduced-motion swap, verified), A11Y-6 (picture face
carries the illustration's alt), TYP-1/TYP-2/TYP-3 (HTML text on the 12px
floor and the scale; SVG postmark/stamp text graded as drawn-picture content),
SLP-4/SLP-11 (faces are siblings; the card is the page's one figure), TOK-1,
LAY-2 (no overflow at 320).

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| TYP-1 | L1 (`documented`) | The postcard's decorative marks (header, caption, spine, postmark, stamp) print in Anonymous Pro via the `--font-note-mark` token — the franking-machine register of the device, confined to the postcard component and never product UI or body text | wondopamine (builder; directed in session 2026-08-19: "for the serif font, plz use the Anonymous Pro") | inline `dx-waive TYP-1` at the token definition in `app/globals.css` |
| MOT-1 | L2 (`rationale`) | `--motion-story` is the declared narrative tier and the postcard turn on a letter page is the narrative case; the flip is the page's only animation | none required at L2 | inline `dx-waive MOT-1` in `components/postcard.tsx` |

## Plan approval

- **Approved by:** wondopamine (builder) — the direction is the builder's own:
  the Dia reference URL, two mock images (front and back), the Singapore-stamp
  ask, the serif ask, and "make it naturally flip upon scrolling the page
  itself", all given verbatim in session on 2026-08-19.

## Verify verdict

- **Original review:** Shipped after the dx-design-review agent's
  pass-with-findings verdict on the first (click-toggle) version; both
  blocking findings and all advisories were fixed before this scroll-driven
  revision, which keeps those fixes.

VERDICT: pass

Re-verified against the shipped scroll-driven revision (not the earlier
click-toggle draft the original dx-design-review pass-with-findings covered).
No blocking or advisory findings on this independent pass.

QUALITY GRADES:
Not separately graded — this run predates the quality-grades convention.
Today's re-verification is limited to mechanical/behavioural criteria; see
the verification ledger below.

| Control | Method | Evidence |
|---------|--------|----------|
| TOK-1 | script | `token-audit.py` clean on `postcard.tsx` + `/note` (exit 0) |
| TYP-1 | manual | inline `dx-waive TYP-1` at the `--font-note-mark` token definition in `app/globals.css`; `type-scan.py` also ran clean |
| TYP-2 / TYP-3 | script | `type-scan.py` clean on `postcard.tsx` + `/note` (exit 0) — no sub-14px body text, scale-compliant |
| MOT-1 | manual | inline `dx-waive MOT-1` recorded at the deviation site in `postcard.tsx` |
| MOT-3 | manual | live-verified: live region announces the state change and content stays in the DOM regardless of animation — meaning isn't carried by motion alone |
| A11Y-5 | manual | live-verified: `transition-duration: 0s` under `prefers-reduced-motion: reduce` |
| A11Y-6 | manual | live-verified: hidden face carries `inert` (toggles correctly), alt text present, live region announces each state |
| SLP-4 | manual | code inspection: `Postcard` sits directly in plain prose flow (`content/sections/builders-note.mdx`), not nested in another card |
| SLP-11 | manual | catalog marks this `check: judgment` (not script-checkable) — the postcard is itself the interactive unit (scroll-driven flip), not static content boxed for decoration |
| LAY-2 | script | Playwright probe: `scrollWidth === clientWidth` at 320px and 360px |

## Ratchet

1. [proposed — pending design-lead approval] type-scan.py's FONT rule
   (TYP-1) does not catch a non-standard typeface applied via a custom
   Tailwind utility class (e.g. `font-note-mark`, a project-defined class
   mapping to a CSS variable) rather than `font-family:`, `font-[…]`, or
   a named utility. This run's own `--font-note-mark` waiver passed the
   script silently — not because it was recognised as compliant, but
   because the rule has no pattern for that syntax at all. An undocumented
   future misuse via the same pattern would pass silently too. Candidate
   fix: extend FONT to flag any `font-{name}` utility class not in
   ALLOWED_FONT_TOKENS, not only the three named forms.
