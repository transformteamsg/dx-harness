# WO: WCAG Operable

Source: [DSS WCAG Operable](https://info.standards.tech.gov.sg/control-catalog/dss/wo/). Status: draft. The decisions and open items are in the [category README](README.md).

A parameter that the table lists as an exemption comes from the DSS "Not required for" text. A rule skips only when the product config sets the parameter. An unset parameter reports "not configured". Engine rule names are from memory and need a check against the installed version.

| DSS control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| WO-1 Keyboard equivalent | [`WO-1a`](pointer-handler-keyboard-equivalent.md) Pointer handlers have a keyboard handler | lint | source | jsx-a11y `click-events-have-key-events`, `no-static-element-interactions` | None |
| | [`WO-1b`](interactive-elements-focusable.md) Interactive elements are focusable | lint | source | jsx-a11y `interactive-supports-focus` | None |
| | `WO-1c` Every function works by keyboard, with no timing demands | judged | | | |
| WO-2 No keyboard trap | [`WO-2a`](no-keyboard-trap.md) Keyboard focus leaves every component | lint | rendered | custom | `tabLimit` (200), `pages` |
| | `WO-2b` A component that holds focus tells users how to leave | judged | | | |
| WO-3 Character key shortcuts | `WO-3a` Single-key shortcuts can be disabled or remapped. Lint part: [`WO-3b`](single-character-shortcuts.md). | judged | | | |
| | [`WO-3b`](single-character-shortcuts.md) Key handlers do not test a single character without a modifier. Lint part of `WO-3a`. | lint | source | custom | `keyEvents`, `exemptSelectors` |
| WO-4 Adjustable timings | [`WO-4a`](no-timed-refresh.md) No timed page refresh or redirect | lint | rendered | axe `meta-refresh` | `maxRefreshDelaySeconds` (72000), `timeLimitExemption`, `pages` |
| | `WO-4b` Time limits in script can be turned off, adjusted, or extended | judged | | | |
| WO-5 Pause, stop, hide | [`WO-5a`](no-marquee-or-blink.md) No marquee or blink elements | lint | source | jsx-a11y `no-distracting-elements` | None |
| | [`WO-5b`](moving-content-control.md) Moving content that runs longer than the limit has a control | lint | rendered | custom | `maxAutoSeconds` (5), `pauseControlNames`, `pages` |
| | `WO-5c` Auto-updating content can be paused, stopped, or hidden | judged | | | |
| WO-6 Reduce flash triggers | `WO-6a` Content does not flash more than three times a second, or has a warning | judged | | | |
| WO-7 Bypass repeating content | [`WO-7a`](skip-link.md) A page has a mechanism to skip repeated blocks | lint | rendered | axe `bypass` | `pages` |
| | [`WO-7b`](content-in-landmarks.md) Page content is inside landmarks | lint | rendered | axe `region` | `pages` |
| WO-8 Page title and purpose | [`WO-8a`](page-title-present.md) Each page has a non-empty title | lint | rendered | axe `document-title` | `pages` |
| | [`WO-8b`](single-page-view-title.md) Each single-page view sets its own title | lint | rendered | custom | `spaRoutes` |
| | `WO-8c` The title describes the purpose of the page. Lint part: [`WO-8d`](page-titles-unique.md). | judged | | | |
| | [`WO-8d`](page-titles-unique.md) Page titles are unique and not generic. Lint part of `WO-8c` and `BD-5b`. | lint | project | custom | `genericTitles` |
| WO-9 Sequential focus order | `WO-9a` Retired. Covered by [`WP-7a`](../wp/no-positive-tabindex.md) | retired | | | |
| | [`WO-9b`](no-positive-tabindex-rendered.md) No positive tabindex in the rendered page | lint | rendered | axe `tabindex` | `pages` |
| | [`WO-9c`](modal-focus.md) Focus moves into a modal and returns when it closes | lint | rendered | custom | `modalSelector`, `pages` |
| | `WO-9d` The focus order preserves meaning and operation. Lint part: [`WO-9e`](tab-sequence-order.md). | judged | | | |
| | [`WO-9e`](tab-sequence-order.md) The tab sequence does not jump far up or left. Lint part of `WO-9d`. | lint | rendered | custom | `maxJumpPixels` (400), `pages` |
| WO-10 Link text and purpose | [`WO-10a`](link-accessible-name.md) Each link has an accessible name | lint | rendered | custom | `pages` |
| | [`WO-10b`](anchor-content.md) Each anchor has content in source | lint | source | jsx-a11y `anchor-has-content` | None |
| | [`WO-10c`](no-vague-link-text.md) Link text is not vague | lint | source | jsx-a11y `anchor-ambiguous-text` | `vagueLinkWords` |
| | `WO-10d` Link text names the purpose of the link on its own | judged | | | |
| WO-11 Multiple ways | `WO-11a` At least two ways reach the same content. Lint part: [`WO-11b`](multiple-ways.md). | judged | | | |
| | [`WO-11b`](multiple-ways.md) The site offers at least two ways to reach content. Lint part of `WO-11a`. | lint | project | custom | `minWays` (2), `wayKinds` (navigation, search, sitemap, index), `serviceType` |
| WO-12 Headings and labels | `WO-12a` Retired. Covered by [`WP-6a`](../wp/semantic-structure.md) | retired | | | |
| | `WO-12b` Retired. Covered by [`WP-6a`](../wp/semantic-structure.md) | retired | | | |
| | `WO-12c` Retired. Covered by [`WR-1a`](../wr/control-accessible-name.md) | retired | | | |
| | `WO-12d` Headings and labels are descriptive | judged | | | |
| WO-13 Focus visible and not obscured | [`WO-13a`](focus-indicator-kept.md) The focus indicator is not removed | lint | source | custom, ported from `a11y-static.py` | `replacementProperties` |
| | [`WO-13b`](focus-not-obscured.md) Focused elements are not covered | lint | rendered | custom | `viewports` (320, 1280), `maxObscuredRatio` (0), `pages` |
| WO-14 Simple pointer alternatives | `WO-14a` A single-point alternative exists for each multipoint or path-based gesture. Lint part: [`WO-14b`](gesture-handlers.md). | judged | | | |
| | [`WO-14b`](gesture-handlers.md) Multipoint and path-based gesture handlers are flagged. Lint part of `WO-14a`. | lint | source | custom | `gestureEvents`, `gestureLibraries` |
| WO-15 Pointer cancellation | [`WO-15a`](no-down-event-activation.md) Activation controls do not run an action on a down event | lint | source | custom | `downEvents`, `activationSelector`, `essentialDownEventSelectors` |
| | `WO-15b` Critical actions can be cancelled or undone | judged | | | |
| WO-16 Label in name | [`WO-16a`](label-in-name.md) The accessible name contains the visible label | lint | rendered | axe `label-content-name-mismatch` | `pages` |
| WO-17 Motion actuation | [`WO-17a`](motion-listeners.md) Motion listeners are flagged | lint | source | custom | `motionEvents`, `motionEssential` |
| | `WO-17b` A setting disables motion, and an alternative control exists | judged | | | |
| WO-18 Minimum pointer target size | [`WO-18a`](target-size.md) Pointer targets are at least the minimum size | lint | rendered | axe `target-size` | `minSize` (24), `pages` |
