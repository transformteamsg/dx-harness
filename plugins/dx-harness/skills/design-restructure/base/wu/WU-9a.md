---
code: WU-9a
dss: WU-9
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  helpSelector: null
  positionTolerance: 8
  viewports: [320, 768, 1280]
  pages: null
---

# WU-9a: help and support sit in the same position on every page

## Statement

The help and support entry sits in the same place on every page.

## Check

Applies when `helpSelector` and `pages` are set. At each width in `viewports`, finds the element that matches `helpSelector` on each page. Fails when any of these holds:

- A page has no match.
- The match is not in the same landmark on every page.
- Its offset differs between pages by more than `positionTolerance` pixels. The offset is measured from the top left of its landmark, so that a footer that moves with the height of the content does not count as a change. A match outside a landmark is measured from the document.

An unset `helpSelector` reports "not configured".

## Recommendations

- Use the official government footer (`TL-4`) to place help in one position.
- Cover contact details, FAQs, chat, and messaging.

## Not required for

None listed.

## Rationale

Users who need help look where they found it before. `BD-9a` checks that a channel exists, and `WU-9b` judges its use.
