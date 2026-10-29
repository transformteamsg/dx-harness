# BD: Baseline Design Practices

Source: [DSS Baseline Design Practices](https://info.standards.tech.gov.sg/control-catalog/dss/bd/). Status: draft. The decisions and open items are in the [category README](README.md).

A parameter that the table lists as an exemption comes from the DSS "Not required for" text. A rule skips only when the product config sets the parameter. An unset parameter reports "not configured".

| DSS control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| BD-1 Responsive web design | [`BD-1a`](viewport-meta.md) Viewport meta present and zoom allowed | lint | source | axe `meta-viewport` | None |
| | [`BD-1b`](no-horizontal-scroll.md) No horizontal scroll at each viewport width | lint | rendered | custom | `viewports` (320, 768, 1280), `pages` |
| | `BD-1c` The reason for disabled mobile content is clear, and the way to reach it works. A script checks that a notice exists: see [`BD-1d`](mobile-content-notice.md) | judged | | | |
| | [`BD-1d`](mobile-content-notice.md) Content that is disabled on mobile has a notice with a way to reach it. Lint part of `BD-1c` | lint | rendered | custom | `mobileViewport` (320), `desktopViewport` (1280), `minWords` (30), `contentSelector`, `noticeSelector`, `intentionalHideSelector`, `pages` |
| BD-2 Site search | [`BD-2a`](search-form-present.md) A multi-page site has a search form | lint | project | custom | `serviceType` |
| | `BD-2b` Search is easy to find. A task test, such as first-click success, stays judged. Lint parts: [`BD-2c`](search-visible-on-desktop.md), [`BD-2d`](search-in-header-on-every-page.md), and [`BD-2e`](search-input-width-and-tab-order.md). | judged | | | |
| | [`BD-2c`](search-visible-on-desktop.md) The search form is visible in the first screen at desktop size. Lint part of `BD-2b`. | lint | rendered | custom | `serviceType`, `desktopViewport` (1280), `desktopHeight` (800), `searchSelector`, `pages` |
| | [`BD-2d`](search-in-header-on-every-page.md) The search form is on every page, in the header, in the same place. Lint part of `BD-2b`. | lint | rendered | custom | `serviceType`, `pages`, `searchSelector`, `headerSelector`, `positionTolerancePx` (40) |
| | [`BD-2e`](search-input-width-and-tab-order.md) The search input is wide enough and early in the tab order. Lint part of `BD-2b`. | lint | rendered | custom | `serviceType`, `pages`, `searchInputSelector`, `minChars` (27), `maxTabStops` (5) |
| BD-3 Support multiple languages | [`BD-3a`](locales-and-language-switcher.md) At least two locales are declared and a language switcher links to each | lint | project | custom | `locales` |
| | `BD-3b` Translation quality, and a switcher at key entry points. Lint part: [`BD-3c`](language-switcher-on-entry-pages.md). | judged | | | |
| | [`BD-3c`](language-switcher-on-entry-pages.md) The language switcher appears on each entry page. Lint part of `BD-3b`. | lint | project | custom | `entryPages`, `switcherSelector` |
| BD-4 Clear and concise content | [`BD-4a`](readability-grade.md) Readability grade of each text block is at or below the limit | lint | rendered | custom | `maxGrade`, `locale`, `contentSelector`, `exemptSelector`, `pages` |
| | [`BD-4b`](complex-words.md) Words from the complex-word list are flagged | lint | rendered | custom | `complexWords`, `pages` |
| | `BD-4c` User testing shows that the content is clear | judged | | | |
| BD-5 Search engine optimisation | [`BD-5a`](title-description-canonical.md) Title, meta description, and canonical link are present and within length | lint | source | custom, or a Lighthouse SEO audit | `titleLength`, `descriptionLength`, `audience` |
| | `BD-5b` The title and abstract are informative and relevant. Lint part: [`WO-8d`](../wo/page-titles-unique.md). | judged | | | |
| BD-6 Consistent UI design | [`BD-6a`](design-system-imported.md) The declared design system is imported | lint | project | custom | `designSystem` |
| | [`BD-6b`](token-values.md) Values come from tokens, not raw values | lint | source | ported TOK rules | Set by the TOK rules. Only the raw colour part of TOK-1 is ported |
| | `BD-6c` Consistency that tokens cannot show | judged | | | |
| BD-7 Mandatory and optional fields | [`BD-7a`](required-field-markers.md) Every `required` control has a visible marker and a programmatic marker | lint | source | custom, with axe `label` as support | `mandatoryMarker`, `optionalLabel`, `loginException` |
| | [`BD-7b`](one-marker-style.md) One marker style across the project | lint | project | custom | `mandatoryMarker` |
| BD-8 Log-in indication | [`BD-8a`](account-identifier-in-header.md) The account identifier is visible in the header of each authenticated page | lint | rendered | custom | `authenticatedPages`, `accountSelector` (`[data-account-name]`) |
| | `BD-8b` The location of the identifier is clear | judged | | | |
| BD-9 Contact channels | [`BD-9a`](contact-channel.md) At least one contact channel exists: `mailto:`, `tel:`, a contact link, or a contact form | lint | project | custom | `channels` |
| | `BD-9b` The channel serves the users | judged | | | |
