# WP: WCAG Perceivable

Source: [DSS WCAG Perceivable](https://info.standards.tech.gov.sg/control-catalog/dss/wp/). Status: draft. The decisions and open items are in the [category README](README.md).

A parameter that the table lists as an exemption comes from the DSS "Not required for" text. A rule skips only when the product config sets the parameter. An unset parameter reports "not configured".

| DSS control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| WP-1 Text alternatives for non-text content | [`WP-1a`](WP-1a.md) Non-text content has a text alternative | lint | rendered | axe `image-alt`, `input-image-alt`, `role-img-alt`, `svg-img-alt`, `object-alt`, `area-alt` | `pages` |
| | [`WP-1b`](WP-1b.md) JSX images have alt text | lint | source | jsx-a11y `alt-text` | None |
| | [`WP-1c`](WP-1c.md) Alt text is within the length limit | lint | rendered | custom | `maxAltLength` (125), `pages` |
| | `WP-1d` Alt text is accurate, and decorative content is marked. Lint part: [`WP-1e`](WP-1e.md). | judged | | | |
| | [`WP-1e`](WP-1e.md) Alt text is not a file name, an extension, or a placeholder word. Lint part of `WP-1d`. | lint | source | jsx-a11y `img-redundant-alt`; custom | `placeholderWords` |
| WP-2 Captions for prerecorded media | [`WP-2a`](WP-2a.md) Every video has a captions track | lint | rendered | axe `video-caption` | `mediaAlternativeSelector` (exemption), `pages` |
| | [`WP-2b`](WP-2b.md) JSX media elements have a captions track | lint | source | jsx-a11y `media-has-caption`, custom for HTML `<audio>` | `mediaAlternativeSelector` (exemption) |
| | `WP-2c` Captions are accurate, aligned, and readable. Lint part: [`WP-2d`](WP-2d.md). | judged | | | |
| | [`WP-2d`](WP-2d.md) Caption files parse, cues do not overlap, and lines stay within the limit. Lint part of `WP-2c`. | lint | project | custom | `captionFiles`, `maxLineCharacters` (42), `maxLines` (2) |
| WP-3 Text or audio alternatives for prerecorded media | [`WP-3a`](WP-3a.md) Media has a captions track, a descriptions track, or a described text alternative | lint | source | custom | None |
| | `WP-3b` The alternative is equivalent to the media | judged | | | |
| WP-4 Live captions | `WP-4a` Live content has accurate captions | judged | | | |
| WP-5 Audio description for prerecorded video content | `WP-5a` Retired. Merged into [`WP-3a`](WP-3a.md) | retired | | | |
| | `WP-5b` The audio description covers the critical visual content | judged | | | |
| WP-6 Presentation of info and relationships | [`WP-6a`](WP-6a.md) Lists, tables, and headings are marked up correctly | lint | rendered | axe `list`, `listitem`, `definition-list`, `dlitem`, `th-has-data-cells`, `td-headers-attr`, `td-has-header`, `scope-attr-valid`, `table-fake-caption`, `heading-order`, `empty-heading` | `pages` |
| | [`WP-6b`](WP-6b.md) ARIA roles and properties are valid | lint | source | jsx-a11y `aria-role`, `aria-props`, `aria-proptypes`, `aria-unsupported-elements`, `role-has-required-aria-props`, `role-supports-aria-props`, `no-redundant-roles`, `no-noninteractive-element-to-interactive-role`, `no-interactive-element-to-noninteractive-role` | None |
| | [`WP-6c`](WP-6c.md) Form controls and ARIA parents are related in the markup | lint | rendered | axe `form-field-multiple-labels`, plus custom | `pages` |
| | `WP-6d` The structure fits the content, and ARIA is not overused. Lint part: [`WP-6e`](WP-6e.md). | judged | | | |
| | [`WP-6e`](WP-6e.md) A native element is used where one exists for the role. Lint part of `WP-6d`. | lint | source | jsx-a11y `prefer-tag-over-role`, custom for HTML | None |
| WP-7 Meaningful content order | [`WP-7a`](WP-7a.md) No positive tabindex | lint | source | jsx-a11y `tabindex-no-positive`, custom for HTML | None |
| | [`WP-7b`](WP-7b.md) Visual order matches the order of the code | lint | rendered | custom | `orderTolerancePx` (8), `direction`, `pages` |
| | `WP-7c` A screen reader reads the content in a logical order | judged | | | |
| WP-8 Describing displayed controls | [`WP-8a`](WP-8a.md) Instructions do not rely on sensory characteristics | lint | rendered | custom | `sensoryTerms`, `controlTerms`, `pages` |
| | `WP-8b` Each flagged instruction names the control | judged | | | |
| WP-9 Display orientation | [`WP-9a`](WP-9a.md) CSS does not lock the orientation | lint | rendered | axe `css-orientation-lock` | `orientationRequired` (exemption), `pages` |
| | [`WP-9b`](WP-9b.md) Scripts and manifests do not lock the orientation | lint | source | custom | `orientationRequired` (exemption) |
| | `WP-9c` Functions work in each orientation | judged | | | |
| WP-10 Identify input purpose | [`WP-10a`](WP-10a.md) Autocomplete values are valid on the rendered page | lint | rendered | axe `autocomplete-valid` | `pages` |
| | [`WP-10b`](WP-10b.md) Autocomplete values are valid in JSX | lint | source | jsx-a11y `autocomplete-valid` | None |
| | [`WP-10c`](WP-10c.md) Common inputs declare their purpose | lint | rendered | custom | `purposeMap`, `pages` |
| | [`WP-10d`](WP-10d.md) Similar fields have distinct accessible names | lint | rendered | custom | `pages` |
| | `WP-10e` The format of an ambiguous input is stated | judged | | | |
| WP-11 Use of colour | [`WP-11a`](WP-11a.md) Links in text are not distinguished by colour alone | lint | rendered | axe `link-in-text-block` | `pages` |
| | [`WP-11b`](WP-11b.md) Error states carry text or an icon | lint | rendered | custom | `errorSelector`, `pages` |
| | `WP-11c` No other meaning depends on colour alone | judged | | | |
| WP-12 Audio control | [`WP-12a`](WP-12a.md) Audio that plays automatically can be stopped | lint | rendered | axe `no-autoplay-audio` | `maxAutoplaySeconds` (3), `pages` |
| | [`WP-12b`](WP-12b.md) Autoplay media is muted or has controls | lint | source | custom | None |
| | `WP-12c` The audio control is near the start of the service. Lint part: [`WP-12d`](WP-12d.md). | judged | | | |
| | [`WP-12d`](WP-12d.md) An audio control is among the first tab stops. Lint part of `WP-12c`. | lint | rendered | custom | `maxTabStops` (3), `audioControlNames` (pause, stop, mute), `pages` |
| WP-13 Minimum contrast | [`WP-13a`](WP-13a.md) Text meets the minimum contrast ratio | lint | rendered | axe `color-contrast` | `normalRatio` (4.5), `largeRatio` (3), `largeTextPt` (18), `largeBoldTextPt` (14), `decorativeSelector` (exemption), `inactiveSelector` (exemption), `pages` |
| | [`WP-13b`](WP-13b.md) Declared colour token pairs meet the minimum contrast ratio | lint | project | custom | `tokenPairs`, `normalRatio` (4.5) |
| WP-14 Text scaling | [`WP-14a`](WP-14a.md) Text scaled to 200 percent loses no content | lint | rendered | custom | `scalePercent` (200), `viewports`, `pages` |
| | [`WP-14b`](WP-14b.md) Font sizes use relative units | lint | source | custom | `allowedUnits` |
| WP-15 Images of text | [`WP-15a`](WP-15a.md) Images do not hold text. Lint part of `WP-15b`. | lint | rendered | custom | `minWords` (4), `ocrLanguages`, `exemptSelector` |
| | `WP-15b` A necessary image of text has a text equivalent. Lint part: [`WP-15a`](WP-15a.md). | judged | | | |
| WP-16 Content reflow | [`WP-16a`](WP-16a.md) Content reflows at the reflow width | lint | rendered | custom | `reflowWidth` (320), `twoDimensionalSelector` (exemption), `pages` |
| | `WP-16b` Two-dimensional content stays usable | judged | | | |
| WP-17 Non-text contrast | [`WP-17a`](WP-17a.md) Input and button boundaries meet the minimum contrast ratio | lint | rendered | custom | `minRatio` (3), `inputSelector`, `buttonSelector`, `stateSelector`, `pages` |
| | `WP-17b` Graphical objects that convey information meet the ratio | judged | | | |
| | [`WP-17c`](WP-17c.md) Declared boundary token pairs meet the minimum contrast ratio | lint | project | custom | `minRatio` (3), `boundaryTokenPairs` |
| WP-18 Text spacing | [`WP-18a`](WP-18a.md) Inline styles do not block text spacing overrides | lint | rendered | axe `avoid-inline-spacing` | `pages` |
| | [`WP-18b`](WP-18b.md) Text with adjusted spacing loses no content | lint | rendered | custom | `lineHeight` (1.5), `paragraphSpacing` (2), `letterSpacing` (0.12), `wordSpacing` (0.16), `pages` |
| | [`WP-18c`](WP-18c.md) Style sheets do not force text spacing | lint | source | custom | `properties` |
| WP-19 Content on hover or focus | [`WP-19a`](WP-19a.md) Hover and focus content is dismissible with Escape | lint | rendered | custom | `popupTriggerSelector`, `pages` |
| | [`WP-19b`](WP-19b.md) Hover content stays while the pointer is over it | lint | rendered | custom | `popupTriggerSelector`, `minVisibleMs` (5000), `pages` |
| | [`WP-19c`](WP-19c.md) CSS reveals content on focus as well as on hover | lint | source | custom | None |
| | `WP-19d` Hover and focus content is readable and usable. Lint part: [`WP-19e`](WP-19e.md). | judged | | | |
| | [`WP-19e`](WP-19e.md) Hover and focus content stays visible and can be dismissed. Lint part of `WP-19d`. | lint | rendered | custom | `triggerSelector`, `dismissKey` (Escape), `waitMs` (3000), `pages` |
