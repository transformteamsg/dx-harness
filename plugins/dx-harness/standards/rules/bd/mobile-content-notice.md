---
code: BD-1d
slug: mobile-content-notice
dss: BD-1
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: BD-1c
parameters:
  mobileViewport: 320
  desktopViewport: 1280
  minWords: 30
  contentSelector: "main"
  noticeSelector: "[data-mobile-unavailable]"
  intentionalHideSelector: "[data-responsive-duplicate]"
  pages: null
---

# BD-1d: content that is disabled on mobile has a notice with a way to reach it

## Statement

When content is not available at the mobile width, the page shows a notice that gives the reason and a way to reach the content.

## Check

Applies when `pages` is set. Loads each page at `mobileViewport` and at `desktopViewport`. Finds a candidate when any of these holds:

- The text of `contentSelector` at the mobile width holds fewer than half the words that it holds at the desktop width, and the difference is `minWords` or more.
- An element inside `contentSelector` holds `minWords` or more words, is visible at the desktop width, and has `display: none` at the mobile width.
- The page at the mobile width shows text that asks the user to use a desktop or a larger screen.

Skips an element that matches `intentionalHideSelector`, such as a duplicate that the page shows in another form.

Fails a candidate when the page at the mobile width has no element that matches `noticeSelector`, or the notice has no text, or the notice has no link and no named alternative.

The rule finds candidates and does not decide. It warns and never blocks. `BD-1c` judges whether the reason is clear and whether the alternative works.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Disable mobile access only for content that is unsuitable for a small screen.
- Explain why the content is disabled and how users can reach it.

## Not required for

None listed.

## Rationale

A user who cannot open content on a phone needs to know why and what to do next. A silent gap leaves the user with no route.
