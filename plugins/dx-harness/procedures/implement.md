# Implement (shared procedure)

Build exactly the approved plan. One frontend-only implementer applies the accepted
changes; the passes and critique never edit the product. Structure drift from the
approved plan is a defect: if implementation reveals the plan was wrong, go back to
the person, do not silently improvise.

## Branch guard

Before any edit to the product, run the guard:

1. **Fetch first.** Run a `git fetch` so the remote state is current.
2. **Check the branch.** If the person is on `main`/`master`, or their branch is
   behind the remote default branch, stop and hand off to the git helper
   (`dx-design-git`). The helper explains the risk in plain words and proposes the
   fix (a new branch, or a pull). It acts only after the person agrees.
3. **No time heuristic.** The guard triggers on branch state only, never on how long
   ago something happened.

## Frontend-only constraints

The implementer edits the product's frontend surface only: markup, styles, tokens,
component composition, and the UI-side state and copy the approved plan names. It
never edits backend logic, data models, schemas, or infrastructure. A change that
turns out to need backend work is a blocking question back to whoever started the
run, not something to improvise.

Constraints, non-negotiable while building:

- **Conservative, reversible defaults.** Do not restyle what is already deliberate.
  Established iconography, radius, layout structure, and settled copy are presumed
  intentional; if a change to one is genuinely warranted, flag it explicitly as a
  proposed change with rationale and a one-line revert note, never silently. Default
  to the smallest reversible change that meets the contract. But preserved is not
  waived: "deliberate" protects an element's look from restyling, never its
  compliance from verification.
- **Catalogue controls bind throughout.** Load `../standards/catalog.yaml` and
  filter to the in-scope controls per `catalogue-mechanics.md` (beside this file);
  read a control's detail file before applying it. The L0 floor never bends.
- Compose only manifest components (CMP-1); semantic tokens only, no raw colour or
  off-scale spacing/radius (TOK-1..3); the portfolio typefaces only, on-scale sizes
  (TYP-1..3); functional colours from the Radix scales (COL-2).
- Accessibility floor: AA contrast (A11Y-1), keyboard reach with visible focus
  (A11Y-2), a visible label on every field (A11Y-3), targets at least 24px (A11Y-4),
  reduced motion respected (A11Y-5), plus the structural controls (A11Y-6..10).
- Every async state change picks one announcement channel (A11Y-11), declared per
  state in the approved plan alongside CMP-3's state enumeration. Destructive
  actions show consequences and offer undo or confirm before execution (CMP-2, L0).
- Anti-slop is standard (SLP-1..11); re-read the SLP block before styling anything.
- One primary action per view (CMP-5); components at their defaults and the way
  sibling pages use them (CMP-7).
- Copy follows the copy pass skill as you write it, not as a cleanup pass; SLP-9
  (AI-writing tells) binds all of it.
- **Make every asserted state reachable for evidence.** If a control claims
  loading/success/error states, the design review must photograph them; build a
  clearly marked demo-only hook where needed and note it in the decision record. A
  state that cannot be demonstrated cannot be verified.

After the build, the run proceeds to `design-review.md` (beside this file). Record
the run on the surface's design ticket per `design-tickets.md`.
