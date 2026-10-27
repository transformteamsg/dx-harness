# WO: WCAG Operable

Source: [DSS WCAG Operable](https://info.standards.tech.gov.sg/control-catalog/dss/wo/). Status: draft.

The category has 18 DSS controls and 40 rules: 26 lintable and 14 judged. The rule format is in the [top-level README](../../README.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

| Rule | Title | Surface |
| --- | --- | --- |
| [WO-1a](WO-1a.md) | Pointer handlers have a keyboard handler | source |
| [WO-1b](WO-1b.md) | Interactive elements are focusable | source |
| [WO-2a](WO-2a.md) | Keyboard focus leaves every component | rendered |
| [WO-3b](WO-3b.md) | Key handlers do not test a single character without a modifier | source |
| [WO-4a](WO-4a.md) | No timed page refresh or redirect | rendered |
| [WO-5a](WO-5a.md) | No marquee or blink elements | source |
| [WO-5b](WO-5b.md) | Moving content that runs longer than the limit has a control | rendered |
| [WO-7a](WO-7a.md) | A page has a mechanism to skip repeated blocks | rendered |
| [WO-7b](WO-7b.md) | Page content is inside landmarks | rendered |
| [WO-8a](WO-8a.md) | Each page has a non-empty title | rendered |
| [WO-8b](WO-8b.md) | Each single-page view sets its own title | rendered |
| [WO-8d](WO-8d.md) | Page titles are unique and not generic | project |
| [WO-9b](WO-9b.md) | No positive tabindex in the rendered page | rendered |
| [WO-9c](WO-9c.md) | Focus moves into a modal and returns when it closes | rendered |
| [WO-9e](WO-9e.md) | The tab sequence does not jump far up or left | rendered |
| [WO-10a](WO-10a.md) | Each link has an accessible name | rendered |
| [WO-10b](WO-10b.md) | Each anchor has content in source | source |
| [WO-10c](WO-10c.md) | Link text is not vague | source |
| [WO-11b](WO-11b.md) | The site offers at least two ways to reach content | project |
| [WO-13a](WO-13a.md) | The focus indicator is not removed | source |
| [WO-13b](WO-13b.md) | Focused elements are not covered | rendered |
| [WO-14b](WO-14b.md) | Multipoint and path-based gesture handlers are flagged | source |
| [WO-15a](WO-15a.md) | Activation controls do not run an action on a down event | source |
| [WO-16a](WO-16a.md) | The accessible name contains the visible label | rendered |
| [WO-17a](WO-17a.md) | Motion listeners are flagged | source |
| [WO-18a](WO-18a.md) | Pointer targets are at least the minimum size | rendered |

The 14 judged rules have no file yet. Each needs a rubric from `dx-design-judge`: `WO-1c`, `WO-2b`, `WO-3a`, `WO-4b`, `WO-5c`, `WO-6a`, `WO-8c`, `WO-9d`, `WO-10d`, `WO-11a`, `WO-12d`, `WO-14a`, `WO-15b`, and `WO-17b`.

## Decisions

- An exemption is a parameter in the product config. `WO-4a` reads `timeLimitExemption` and `WO-17a` reads `motionEssential`. The inline waiver is not used for an exemption.
- An unset exemption parameter reports "not configured". The rule does not pass.
- A rule that wraps an engine rule names the engine rule in `engine`. A rule file never names the module that runs it.
- axe-core rules run on the rendered page. `eslint-plugin-jsx-a11y` rules run on source. `WP-7a` (source) and `WO-9b` (rendered) cover a positive `tabindex` on both surfaces, because templates can add one that source does not show.
- A custom rendered rule applies only when the config lists `pages`, `spaRoutes`, or both. A product with no such list gets "not configured".
- The 24 pixel target size of `WO-18a` and the vague-word list of `WO-10c` are parameters that reach the engine through its configuration.
- `WO-13a` ports the `outline: none` check from `plugins/dx-harness/checks/a11y-static.py`.
- Tiers are provisional until [#432](https://github.com/transformteamsg/dx-harness/issues/432) classifies which controls a script can decide. Custom rendered rules sit at `L2`.

## Open

- Verify against the installed version: every engine rule name in the table, from memory. These are `click-events-have-key-events`, `interactive-supports-focus`, `no-static-element-interactions`, `no-distracting-elements`, `tabindex-no-positive`, `anchor-has-content`, `anchor-ambiguous-text`, and axe `meta-refresh`, `marquee`, `bypass`, `region`, `document-title`, `link-name`, `empty-heading`, `heading-order`, `label`, `label-content-name-mismatch`, `tabindex`, and `target-size`.
- `WO-16a`: `label-content-name-mismatch` is experimental in axe-core. The config must enable it, and the rule may change between versions.
- `WO-4a`: axe `meta-refresh` has its own threshold. Check that `maxRefreshDelaySeconds` reaches it, or whether a custom check is needed.
- `WO-8b`: the SPA route list needs a config field and a way to navigate each route. The mechanism is not designed.
- `WO-15a`: the rule still cannot tell an action from state tracking on an activation element. It stays at tier L2.
- `WO-18a`: axe `target-size` follows WCAG 2.2 spacing and inline exceptions. Check that this matches the DSS text.
- Judged rules need rubrics from `dx-design-judge`.

## Reviewed decisions

- `WO-5a`: kept as a source rule. The axe `marquee` support is removed from `WO-5b`, so each rule has one job.
- `WO-15a`: narrowed to activation elements at tier L2. Drag handles, range inputs, and canvas are skipped.
- Second pass: `WO-11b`, `WO-8d`, `WO-9e`, `WO-3b`, and `WO-14b` added as lint. The judged rules keep their codes and cover what a script cannot decide.

## Built

- `WO-9b` is built because no other rule reads the rendered page. The source check for a positive `tabindex` is `WP-7a`, which replaces the retired `WO-9a`.
- `WO-10a` is narrowed and its engine is `custom`. `WR-1a` runs axe `link-name`, which reports a link with no name. `WO-10a` reports a link whose only name is its `title` attribute, which axe accepts. Its Check section says so.
- `WO-16a` has no `enableExperimentalRules` parameter. In axe-core 4.14.0 the rule `label-content-name-mismatch` has no `experimental` tag, and `runOnly` with its id runs it. `test/wo-axe.test.ts` fails if a later version tags it. This closes the open item in this file.
- Every rendered rule file lists `pages: null`, and `MAPPING.md` lists it, because a rendered rule cannot load a page without a list. `WO-8b` reads `spaRoutes` instead.
- `WO-4a` passes `maxRefreshDelaySeconds` to axe as the `maxDelay` option of the `meta-refresh` check, with `minDelay` set to 0. A redirect with a delay of 0 passes. `WO-18a` passes `minSize` to both axe checks of `target-size`, the size and the spacing offset. Both options reach axe through `axe.configure`.
- `WO-7a`: axe `bypass` applies only to a page that has an `<a href>`, and it counts a skip link, a heading, or a `main` landmark. A `header` or `nav` landmark does not count. The rule file says "landmark region", and the engine decides.
- `WO-1a` and `WO-1b`: the HTML part covers only what `WR-1d` skips, so that no element is reported twice. It reads an `<a>` with no `href` that has a pointer handler and no role, an `<a>` with no `href` and an interactive role that is not focusable, and a non-native element with an interactive role and no handler. A non-native element with a handler is `WR-1d`'s. The JSX part runs the jsx-a11y rules in full, and a `<div onClick>` in JSX gets one finding from each rule that names it.
- `WO-10c` passes `vagueLinkWords` to `anchor-ambiguous-text` as its `words` option, which replaces the plugin list.
- `WO-2a` reads a trap as one element for three Tab presses, or a return to an element that focus already visited before it left the page. It then presses Tab six more times to find the members of the trap, presses Escape, and presses Tab four times. It passes when focus reaches a page element that is not a member, or the browser interface. Focus on `<body>` counts as the browser interface.
- `WO-9e` flags an upward jump of more than `maxJumpPixels`, or a leftward jump of more than `maxJumpPixels` to an element that is not below the current one. A wrap to the next row of a layout goes left and down, and is not flagged. The sequence stops when focus revisits an element.
- `WO-13b` compares the focused element with every `position: fixed` or `position: sticky` element that does not contain it. It adds the overlapping areas, so two overlays that overlap each other can count a pixel twice. The ratio is capped at 1.
- `WO-9c` finds a trigger as an element whose `aria-controls` names a dialog, an element with `role="dialog"` or `aria-modal="true"`, or an element that matches `modalSelector`. It does not find a modal that script opens with no `aria-controls`. It checks the close control only when Escape does not close the modal.
- `WO-5b` samples each page for `maxAutoSeconds` with a `MutationObserver` and reads the running animations with `document.getAnimations()`. It cannot set `prefers-reduced-motion`, so it reads the page as a visitor with no preference, and the passing case for reduced motion is not checked. A control counts when a button, link, or `role="button"` has a whole word from `pauseControlNames` in its text, label, or value. The pages are sampled together, so one run waits `maxAutoSeconds` once.
- `WO-8b` reads `spaRoutes` as page paths, with an optional fragment, such as `/app.html#/orders`. The first route is the entry. The rule reaches each later route by clicking an `<a href>` that equals the route or its fragment. A route with no such link fails.
- `WO-8d` leaves a page with no title to `WO-8a` and `BD-5a`.
- `WO-11b` reads a `<nav>` or a `role="navigation"` for navigation, a `role="search"` or `type="search"` for search, a page whose path or title has `sitemap` for a sitemap, and a page whose path or title has `A-Z` or `A to Z` for an index. The demo config sets `wayKinds` to `search` and `index` with `minWays` of 2, so that a patch to one page can break the rule.
- `WO-13a` reads CSS files, `<style>` blocks, inline `style` attributes, and Tailwind class tokens. A replacement counts when the same rule, or a `:focus` or `:focus-visible` rule of the same file for the same selector, sets a property in `replacementProperties` to a value other than `none`, `0`, or `transparent`. A replacement in another file is not seen.
- `WO-3b`, `WO-14b`, and `WO-17a` read the text of HTML, JS, JSX, TSX, and similar files. They match an event name as an inline attribute, a React prop, or a quoted string. `WO-3b` reads the 500 characters after the handler for `key === "x"` or `case "x":` with one non-space character and no `ctrlKey`, `altKey`, or `metaKey`. A single space is not a shortcut character. `WO-3b` applies `exemptSelectors` to inline handlers in HTML only.
- `WO-15a` reads HTML as elements and JSX and TSX as a syntax tree. It does not see a handler that `addEventListener` adds in script.
- Every source rule that names a jsx-a11y rule is a plain HTML part and a jsx-a11y part, built with `combineRules`.
- `WO-9a`, `WO-12a`, `WO-12b`, and `WO-12c` are retired. Each asked for a check that another rule already runs: `WP-7a` reports a positive `tabindex`, `WP-6a` runs axe `empty-heading` and `heading-order`, and `WR-1a` runs axe `label`. A module for them would report every fault twice. The covering rule lists the retired code in `redirects`.
