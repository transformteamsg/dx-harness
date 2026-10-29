# WP: WCAG Perceivable

Source: [DSS WCAG Perceivable](https://info.standards.tech.gov.sg/control-catalog/dss/wp/). Status: draft.

The category has 19 DSS controls and 57 rules: 41 lintable and 16 judged. The rule format is in the [top-level README](../../rules.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

| Rule | Title | Surface |
| --- | --- | --- |
| [WP-1a](text-alternatives.md) | Non-text content has a text alternative | rendered |
| [WP-1b](jsx-image-alt.md) | JSX images have alt text | source |
| [WP-1c](alt-text-length.md) | Alt text is within the length limit | rendered |
| [WP-1e](alt-text-not-placeholder.md) | Alt text is not a file name, an extension, or a placeholder word | source |
| [WP-2a](video-captions.md) | Every video has a captions track | rendered |
| [WP-2b](jsx-media-captions.md) | JSX media elements have a captions track | source |
| [WP-2d](caption-file-quality.md) | Caption files parse, cues do not overlap, and lines stay within the limit | project |
| [WP-3a](media-text-alternative.md) | Media has a captions track, a descriptions track, or a described text alternative | source |
| [WP-6a](semantic-structure.md) | Lists, tables, and headings are marked up correctly | rendered |
| [WP-6b](valid-aria.md) | ARIA roles and properties are valid | source |
| [WP-6c](form-and-aria-relationships.md) | Form controls and ARIA parents are related in the markup | rendered |
| [WP-6e](native-elements.md) | A native element is used where one exists for the role | source |
| [WP-7a](no-positive-tabindex.md) | No positive tabindex | source |
| [WP-7b](visual-order-matches-code.md) | Visual order matches the order of the code | rendered |
| [WP-8a](no-sensory-instructions.md) | Instructions do not rely on sensory characteristics | rendered |
| [WP-9a](css-orientation-lock.md) | CSS does not lock the orientation | rendered |
| [WP-9b](script-orientation-lock.md) | Scripts and manifests do not lock the orientation | source |
| [WP-10a](autocomplete-rendered.md) | Autocomplete values are valid on the rendered page | rendered |
| [WP-10b](autocomplete-jsx.md) | Autocomplete values are valid in JSX | source |
| [WP-10c](input-purpose.md) | Common inputs declare their purpose | rendered |
| [WP-10d](distinct-field-names.md) | Similar fields have distinct accessible names | rendered |
| [WP-11a](links-not-colour-alone.md) | Links in text are not distinguished by colour alone | rendered |
| [WP-11b](error-states-not-colour-alone.md) | Error states carry text or an icon | rendered |
| [WP-12a](autoplay-audio-stoppable.md) | Audio that plays automatically can be stopped | rendered |
| [WP-12b](autoplay-media-muted-or-controlled.md) | Autoplay media is muted or has controls | source |
| [WP-12d](audio-control-early-in-tab-order.md) | An audio control is among the first tab stops | rendered |
| [WP-13a](text-contrast.md) | Text meets the minimum contrast ratio | rendered |
| [WP-13b](token-text-contrast.md) | Declared colour token pairs meet the minimum contrast ratio | project |
| [WP-14a](text-resize.md) | Text scaled to 200 percent loses no content | rendered |
| [WP-14b](relative-font-units.md) | Font sizes use relative units | source |
| [WP-15a](no-images-of-text.md) | Images do not hold text | rendered |
| [WP-16a](reflow.md) | Content reflows at the reflow width | rendered |
| [WP-17a](boundary-contrast.md) | Input and button boundaries meet the minimum contrast ratio | rendered |
| [WP-17c](token-boundary-contrast.md) | Declared boundary token pairs meet the minimum contrast ratio | project |
| [WP-18a](inline-text-spacing.md) | Inline styles do not block text spacing overrides | rendered |
| [WP-18b](text-spacing-no-loss.md) | Text with adjusted spacing loses no content | rendered |
| [WP-18c](stylesheet-text-spacing.md) | Style sheets do not force text spacing | source |
| [WP-19a](hover-content-dismissible.md) | Hover and focus content is dismissible with Escape | rendered |
| [WP-19b](hover-content-hoverable.md) | Hover content stays while the pointer is over it | rendered |
| [WP-19c](hover-content-on-focus.md) | CSS reveals content on focus as well as on hover | source |
| [WP-19e](hover-content-persistent.md) | Hover and focus content stays visible and can be dismissed | rendered |

The 16 judged rules have no file yet. Each needs a rubric from `dx-design-judge`: `WP-1d`, `WP-2c`, `WP-3b`, `WP-4a`, `WP-5b`, `WP-6d`, `WP-7c`, `WP-8b`, `WP-9c`, `WP-10e`, `WP-11c`, `WP-12c`, `WP-15b`, `WP-16b`, `WP-17b`, and `WP-19d`.

## Decisions

- An exemption is a parameter in the product config. The inline waiver is not used for an exemption.
- axe-core (rendered) and eslint-plugin-jsx-a11y (source) decide a rule where they have an engine rule. A custom rule fills a gap only.
- A rule that axe decides on the rendered page and jsx-a11y decides in source has two codes, one for each surface. Examples are `WP-1a` and `WP-1b`.
- `jsx-a11y` reads JSX and TSX only. The rendered rule covers plain HTML.
- No rule is `L0`. Each DSS control with an exemption can be relaxed, and the product decides the rest.
- `WP-4` has no lintable part. A linter cannot see live captions.
- `WP-16a` and `BD-1b` share the horizontal-scroll measurement. They differ in width and in the exemption.
- `WP-9a` and `WP-9b` use `orientationRequired`. The value `true` skips both rules.
- `WP-13a` carries two exemption parameters, one for each DSS exemption. Axe skips disabled controls by itself, so `inactiveSelector` covers other inactive states.
- `WP-7b` needs `direction` from the config because the reading direction depends on the locale.
- `WP-8a` reports a warning to review and does not block. `WP-8b` judges each one.
- Tiers are provisional until [#432](https://github.com/transformteamsg/dx-harness/issues/432) classifies which controls a script can decide.

## Open

- Verify against the installed version of axe-core: `video-caption`, `css-orientation-lock`, `no-autoplay-audio` and its `allowedDuration` option, `avoid-inline-spacing`, `link-in-text-block`, `autocomplete-valid`, `td-has-header`, `table-fake-caption`, `empty-heading`, and `fieldset-legend`.
- Verify against the installed version of axe-core: whether `color-contrast` accepts the `contrastRatio`, `largeTextPt`, and `boldTextPt` options that `WP-13a` passes.
- Verify against the installed version of eslint-plugin-jsx-a11y: `alt-text`, `media-has-caption`, `autocomplete-valid`, `tabindex-no-positive`, and the ARIA rule names in `WP-6b`.
- `WP-17a` has no engine rule. Check whether a current axe release adds a non-text contrast rule before a custom rule is written.
- `WP-6c`: if the installed axe has no `fieldset-legend` rule, the check becomes custom.
- `WP-15a`: check that a Node OCR library, such as `tesseract.js`, runs inside the linter and gives results that are stable across runs.
- `WP-8a`: the word lists suit English only. A rule for other locales needs other lists.
- `WP-7b`: check that visual order measured from layout boxes is stable across browsers.

## Reviewed decisions

- `WP-3a`: lint, strict. It passes only with a captions or descriptions track, or an `aria-describedby` or `aria-details` target with text. Both parameters are dropped.
- `WP-5a`: retired and merged into `WP-3a`. `WP-5b` judges the audio description. `WP-3a` lists `WP-5a` in `redirects`.
- `WP-17a`: inputs and buttons with different tests. An input must have an identifying edge at the ratio. A button is tested only when it has an edge. `WP-17c` is new and tests declared token pairs.
- `WP-15a`: lint at tier L2, on OCR candidates. It warns and never blocks. The judged part is now `WP-15b`.
- Second pass: `WP-1e` added as lint.
- Second pass: `WP-2d` added as lint.
- Second pass: `WP-6e` added as lint.
- Second pass: `WP-12d` added as lint.
- Second pass: `WP-19e` added as lint.
- `WP-6e`: narrowed to `prefer-tag-over-role`, because `WP-6b` already reports `no-redundant-roles`.

## Built (WP-1 to WP-9)

All 17 rules have a module, a fixture pair, and a break patch. Every rendered rule gained a `pages` parameter. The modules are in `src/modules/wp/a.ts`. The reader of JSX in `src/modules/wp/a-jsx.ts` serves `WP-1e`, `WP-3a`, and the `WP-2b` exemption.

- `WP-1b`, `WP-6b`: JSX and TSX only, through `jsxRule`. `WP-1a`, `WR-1b`, and `WR-1c` already cover plain HTML on the rendered page, so a plain HTML part would report one fault twice.
- `WP-1c`: reports length only. A file name in the alt text moved to `WP-1e`, so that one fault is reported once.
- `WP-1e`: reads HTML, JSX, and TSX. The `placeholderWords` test applies to all three. In JSX and TSX, `jsx-a11y/img-redundant-alt` adds findings, and it is stricter than the parameter: it fails "Image of a cat". The plain HTML part does not do this. `jsx-a11y/alt-text` is left to `WP-1b`. axe `image-redundant-alt` is not used, because it is a rendered check and the rule is a source rule.
- `WP-2a`: axe `video-caption` never reports a violation in a browser, because it cannot tell whether a video has audio. It returns a video with no captions track as "incomplete". The module counts an incomplete result as a finding. A muted video with no captions track therefore fails unless `mediaAlternativeSelector` matches it.
- `WP-2b`: JSX and TSX through jsx-a11y, plus a plain HTML part for `<audio>` only. A plain HTML `<video>` is `WP-2a`. The selector exemption on JSX matches the static attributes of the element only. `muted` exempts, as in jsx-a11y.
- `WP-2d`: a hand-written WebVTT reader, because no WebVTT library is installed. It checks the header, the timing syntax, an end that is not after the start, a start before the previous cue ends, the line count, and the line length with tags removed. It does not check cue settings or region and style blocks. `captionFiles` is a glob list, relative to the project root, and accepts `*`, `**`, and `?`.
- `WP-3a`: reads HTML, JSX, and TSX. A dynamic value in JSX (`kind={x}`, `aria-describedby={x}`, a spread) passes, because the check cannot read it. A bare video fails `WP-2b` or `WP-2a` and `WP-3a`, because they are separate DSS controls.
- `WP-6a`: pure axe. `WP-6c`: narrowed. `WR-1a` reports `label`, and `WR-1b` reports `aria-required-parent` and `aria-required-children`, so `WP-6c` drops them. The installed axe-core has no `fieldset-legend`, so a custom check fails a `<fieldset>` with no `<legend>` that has text. A second custom check fails a `<label for>` that points at no form control. axe `form-field-multiple-labels` stays in the rule, but it reports "needs review" in practice, so it rarely produces a finding.
- `WP-6e`: HTML flags a `div` or `span` with a role that has a native element. The role table is in the module and is short. A role with no native element, such as `search`, passes.
- `WP-7a`: JSX through jsx-a11y, HTML through a custom check.
- `WP-7b`: a heuristic. It lists leaf text blocks in DOM order and compares each block with the previous one. It fails a block that sits above the previous block in the same column, or beside it on the wrong side. A block in another column is not compared, because a column that reads down and then across is a valid order. `direction` is `ltr` or `rtl`.
- `WP-8a`: tier L2. It matches whole words, case-insensitively, in each sentence of the text that an element holds itself. A quoted name in double quotes, curly quotes, or straight single quotes passes. The word lists suit English only.
- `WP-9a`: axe `css-orientation-lock`. `orientationRequired` set to `true` skips the rule. The finding sits at the page, with the position 0, 0.
- `WP-9b`: scans `.js`, `.mjs`, `.cjs`, `.jsx`, `.ts`, `.tsx`, and `.html` files for `screen.orientation.lock(`, and `manifest.json` and `.webmanifest` files for an `orientation` other than `any` or `natural`. It does not follow a call through an alias.

No rule of WP-1 to WP-9 is left unbuilt.

## Built (WP-10 to WP-19)

23 of 24 rules have a module, a fixture pair, and a break patch. `WP-15a` is not built. The modules are in `src/modules/wp/b.ts` and the files `b-*.ts` beside it. Every rendered rule of the set gained a `pages` parameter, and `WP-19e` gained `waitMs` (3000).

- `WP-15a`: not built. It needs OCR, no OCR library is installed, and a check that guesses at text in an image is not honest. The rule file says so. The rule has no module, so a run reports "no linter module yet".
- `WP-10a`, `WP-11a`, `WP-18a`: pure axe. `WP-10b`: JSX and TSX through `jsxRule` only. `WP-10a` covers plain HTML, so a plain HTML part would report one fault twice.
- `WP-12a`: axe `no-autoplay-audio` is a review-on-fail rule. It reports a failure as "incomplete", so the module counts an incomplete result as a failure when the media has a known length. The module waits for the metadata of autoplay media first. The demo and fixtures use a `data:` URI for audio, because the demo server sends a `.wav` file as `application/octet-stream`, which the browser refuses.
- `WP-13a`, `WP-12a`: axe options go through `axe.configure` from the rule parameters, in `b-axe.ts`, and axe is reset after the run. The shared wrapper in `engines/axe.ts` has no options. The two exemption selectors become axe `exclude` entries. A colour that axe cannot read stays "incomplete" and passes.
- `WP-18a`: axe fails an `!important` spacing value only when it is below the WCAG minimum, and reads a line height only on text that wraps. A larger value with `!important` passes.
- `WP-10c`: a control matches a key when its `name`, `id`, or `type` equals the key, ignoring case and treating `_` and `-` alike. The last word of `autocomplete` is compared, because section and `billing` or `shipping` words come first.
- `WP-10d`: the accessible name is a short computation: `aria-labelledby`, `aria-label`, `<label>`, `title`, `placeholder`. Text in an `aria-hidden` element is left out. Buttons are not compared. The finding sits on each control after the first.
- `WP-11b`: two changes to the rule file. An element with no area, such as an empty alert region, is skipped. A form control cannot hold a child, so its text or icon is the element that `aria-errormessage` or `aria-describedby` names. Without these, every invalid input and every empty live region fails.
- `WP-12b`: reads HTML, JSX, and TSX. A dynamic `muted` or `controls` in JSX passes, and a dynamic `autoplay` is not read.
- `WP-12d`: tier L2. Audio that plays automatically is an `<audio>` or `<video>` with `autoplay` that is not muted. The autoplaying element with native `controls` counts as an audio control when it is focused within `maxTabStops`.
- `WP-13b`, `WP-17c`: resolve hex, `rgb()`, `white`, `black`, and `var()` chains from the custom properties of every style sheet and `<style>` block. `color-mix()` is not resolved. A pair is `["--fg", "--bg"]`, with the component as a third item for `WP-17c`. A token that does not resolve is a finding. The finding sits on the foreground token.
- `WP-14a`, `WP-18b`: both measure lost content before and after the change, in one shared function, and report only the new losses, so a fault that exists at the normal size stays with the rule that owns it. Lost content is a clipped or truncated text element, two text boxes that share a quarter of the smaller one, or a control outside the viewport. `WP-14a` sets the root `font-size` as a percentage, so text in `px` does not grow. `WP-14b` reports that. `WP-18b` uses `em` multiples on every element and on `p`.
- `WP-14b`: tier L2. Every number with a unit in the value is read, so `clamp()` and `calc()` fail on a `px` or `vw` part. A keyword such as `medium` passes. A `var()` is followed through the project's custom properties, and one that does not resolve is not read. JSX style objects are not read.
- `WP-16a`: reads one width. `BD-1b` reads three widths with no exemption, so both report a page that overflows at 320 pixels. The demo and the fixtures keep the two apart by page. A page passes when the overflow comes only from `twoDimensionalSelector` content.
- `WP-17a`: when a control has a border and a fill, the stronger part counts. A checkbox, radio button, or range input with its default appearance passes, because the browser draws its boundary. Focus adds the outline to the edge. When the background is an image or a gradient, the contrast cannot be computed. The rule reports a finding, because a module cannot report "not run".
- `WP-18c`, `WP-19c`, `WP-14b`: read `.css` files and `<style>` blocks with a small reader in `b-css.ts`, and read at-rule blocks as rules. Inline `!important` is `WP-18a`.
- `WP-19c`: a rule reveals content when it shows a target that another rule hides with `display`, `visibility`, or `opacity`. The target is the last compound selector. A hover rule on a target that is never hidden, such as a link colour change, is not a reveal. The twin rule must repeat the selector with `:focus`, `:focus-within`, or `:focus-visible`.
- `WP-19a`, `WP-19b`, `WP-19e`: each trigger gets a page of its own. Content is an element that became visible, or a `::before` or `::after` of the trigger that came into view. A trigger that shows nothing is skipped. A trigger that cannot take focus shows no content on focus, so only `WP-19c` sees a hover-only popup. `WP-19b` cannot move the pointer onto pseudo-element content.
- The three popup rules overlapped, so `WP-19e` is narrowed. `WP-19a` presses Escape with the pointer on the trigger and with focus on it. `WP-19b` tests that the content stays when the pointer reaches it, and stays for `minVisibleMs`. `WP-19e` tests content that the pointer has reached, which must last `waitMs` and answer `dismissKey`, and content that focus shows, which must last `waitMs`. Content that hides as soon as the pointer reaches it is `WP-19b` only.
- The demo config sets `pages` for each of these rules to the pages in `demo/site/wp-b/`, and the pages are not added to `pages.all`. A shared page that fails (`WP-10c` on the email field of `apply.html`) is not mine to edit, and `WP-16a` and `BD-1b` would report the same patch twice.
