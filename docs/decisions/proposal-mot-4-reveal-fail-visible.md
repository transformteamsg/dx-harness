# Proposal — MOT-4: an entrance animation fails visible

- **Status:** proposed, not adopted. Nothing in `standards/` has been changed.
- **Date:** 2026-08-13
- **Raised by:** the design review of the light landing rebuild
  (`docs/decisions/landing-light-return.md`)
- **Scope note:** adopting this amends the shared rulebook for every product
  using the harness, not just this website. That is why it is a proposal here
  rather than an edit to `standards/catalog.yaml`.

## The gap this closes

MOT-3 already requires that an animated surface communicate the same
information with animations **off**. It says nothing about the case where
animation is **on** but never plays.

A JS-driven entrance animation works by hiding content first and revealing it
on a trigger. That splits the hidden state and the thing that clears it across
two mechanisms. If the second one never runs, the content is gone — not
degraded, not unemphasised, absent — and no existing control catches it. The
reduced-motion and no-JS paths are both fine, because neither ever applies the
hidden state. The broken path is the ordinary one.

## The bug that raised it

`components/landing/full-map-diagram.tsx` armed its hidden state and observed
with `{ threshold: 0.2 }`. An `IntersectionObserver` ratio threshold asks for
20% of the **element** to be on screen at once, so it is unsatisfiable whenever
the element is taller than `1 / 0.2 = 5x` the viewport. The figure measures
~1090px, so any viewport shorter than 218px stranded the entire architecture
diagram at `opacity: 0` — after a full scroll of the page, with no error, no
console warning, and no way for the reader to recover it.

Verified failing at 210px and 150px viewport heights before the fix; verified
passing at both after. The threshold scales with content: had the figure grown
to 3000px it would have needed 600px of viewport and broken on ordinary phones
in landscape.

The same file also armed the hidden state on the line *before* constructing the
observer, so a missing or throwing `IntersectionObserver` would have hidden the
content with nothing left to reveal it.

## Proposed control

```yaml
id: MOT-4
source: DX-DS
title: An entrance animation fails visible — content hidden to be animated in is revealed by a mechanism that cannot fail to run
tier: L1
check: judgment
phase: [implement, verify]
applies_to: [page, component]
verify: "For every surface that hides content to animate it in: the hidden state is applied only after its reveal mechanism is constructed and attached, and the reveal trigger is satisfiable at any content height and viewport size. Confirm the content is visible after a full scroll at a viewport shorter than the animated element."
waiver: approver
```

**Requirement.** Content hidden in order to be animated in must be revealed by
a mechanism that cannot fail to run. Two obligations follow:

1. **Arm last.** Everything that can fail — feature detection, observer
   construction, element lookup — happens *before* the hidden state is applied.
   If any of it fails, the finished layout stands untouched.
2. **Use a satisfiable trigger.** A trigger whose condition depends on the
   ratio of element to viewport is not satisfiable at all content heights. Use
   a height-independent condition — for `IntersectionObserver`, `threshold: 0`
   with a `rootMargin` inset rather than a ratio threshold.

Tier L1 rather than L2 because the failure destroys content rather than
degrading presentation, and it is invisible to the author: it reproduces only
at viewport sizes nobody tests, and it fails silently when it does.

## How to verify

Judgment, with one deterministic probe worth automating: load the page at a
viewport shorter than the tallest animated element, scroll to the bottom, and
assert no element is left at `opacity: 0`. That probe is what caught this one —
see `.reveal-probe.mjs` in the run's scratch notes for the shape of it.

A grep for `threshold:` followed by a non-zero number in an
`IntersectionObserver` call would catch the common instance of the second
obligation cheaply, and could reasonably be a sub-check.

## If adopted

Three edits, all of which the validator will otherwise reject as inconsistent:

1. `standards/catalog.yaml` — add the entry above.
2. `standards/controls/mot-4.md` — the control detail file; filename must match
   the lowercased id, and the frontmatter fields must equal the catalog values.
3. Wire `MOT-4` into at least one skill or procedure, or add it to the orphan
   allowlist — `validate.py` errors on any catalog id mentioned nowhere.
