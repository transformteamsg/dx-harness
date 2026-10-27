# TL: Trust and Legitimacy

Source: [DSS Trust and Legitimacy](https://info.standards.tech.gov.sg/control-catalog/dss/tl/). Status: draft.

The category has 6 DSS controls and 18 rules: 13 lintable and 5 judged. The rule format is in the [top-level README](../../README.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

| Rule | Title | Surface |
| --- | --- | --- |
| [TL-1a](TL-1a.md) | The service uses an official domain | project |
| [TL-2a](TL-2a.md) | The logo is at the top left and links to the homepage | rendered |
| [TL-2b](TL-2b.md) | The logo renders without distortion or pixellation | rendered |
| [TL-2d](TL-2d.md) | The logo file matches an official logo hash | project |
| [TL-3a](TL-3a.md) | The banner is the topmost component of every page | rendered |
| [TL-3b](TL-3b.md) | The banner is the SGDS component, with its text intact | source |
| [TL-4a](TL-4a.md) | The footer carries the official links in order | rendered |
| [TL-4b](TL-4b.md) | The footer carries the copyright statement | rendered |
| [TL-4d](TL-4d.md) | Each footer link resolves | project |
| [TL-5a](TL-5a.md) | A mobile app is distributed only through official app stores | project |
| [TL-5b](TL-5b.md) | A mobile app is not released under a free-distribution licence | project |
| [TL-6a](TL-6a.md) | The store developer account carries the agency name | project |
| [TL-6c](TL-6c.md) | The manifest developer name equals the agency name | project |

The 5 judged rules have no file yet. Each needs a rubric from `dx-design-judge`: `TL-1b`, `TL-2c`, `TL-4c`, `TL-5c`, and `TL-6b`.

## Decisions

- An exemption is a parameter in the product config. `customisable` covers the SaaS and COTS exemption of TL-3. `transactionalPages` covers the transactional exemption of TL-4.
- `TL-3` and `TL-4` apply only to a `.gov.sg` host, read from `productUrl`. `TL-1a` checks the domain itself.
- `TL-4` is split in two: the links and their order in `TL-4a`, the copyright statement in `TL-4b`. The link order follows the DSS recommendation.
- `BD-9a` refers to `TL-4`. The Contact link in `TL-4a` is the footer link to the contact channels.
- `TL-5` and `TL-6` apply when `serviceType` is `mobile-app`. The parameter is the one that `BD-2a` reads.
- The banner and footer selectors default to SGDS class names. A product that imports SGDS needs no change.
- Tiers are provisional until [#432](https://github.com/transformteamsg/dx-harness/issues/432) classifies which controls a script can decide.

## Reviewed decisions

- Second pass: `TL-2d` added as lint.
- Second pass: `TL-4d` added as lint.
- Second pass: `TL-6c` added as lint.

## Open

- `TL-4a`: the DSS marks the FAQ and sitemap links "if any". The rule asks the config through `hasFaq` and `hasSitemap`. Decide whether the linter can detect the pages instead.
- `TL-4b`: `currentYear` needs a value `auto` that the linter resolves. Confirm the config grammar.
- `TL-5a`: decide where the linter reads `distributionChannels`, for example a store config file or the product config.
- `TL-5b`: the check reads the `license` field of `package.json`. A native app project has no such file. Decide the manifest for each platform.
- `TL-1a`: a pre-production host is not `.gov.sg`. Decide whether the config needs a separate production URL.

## Built

All 13 rules have a module in `packages/design-lint/src/modules/tl/`.

- `pages` parameter: `TL-2a`, `TL-2b`, `TL-3b`, `TL-4a`, and `TL-4b` gained `pages: null`. `TL-3a` gained `bannerPages: null` instead. `TL-3a` is L0, so the runner ignores a `rules` override of `pages`, and a demo site with shared pages that carry no banner needs a list of its own. `bannerPages` is not in the page-group table, so a product sets it under `product`.
- `TL-1a` also checks the host of each absolute `<link rel="canonical">`. A fixture pair and a break patch need an input that a file can carry, and `productUrl` is config only. A relative canonical link is skipped. A non-`.gov.sg` `productUrl` is tested in `test/tl-edges.test.ts`.
- `TL-3b` reads only the pages in `pages`, and only HTML. A selector is a simple one: a tag, `#id`, `.class`, and `[attr]` parts, with no combinator. It does not read JSX or TSX.
- `TL-3a` takes the banner as first when it is the first rendered child (not `script`, `style`, `template`, and not `display: none`) at every level from `<body>` down. A visually hidden skip link before the banner fails it. The banner is visible when its top is within 1 pixel of the page top.
- `TL-2a` uses the centre of the logo to decide the half of the viewport (1280 pixels wide). It reads the first match of `logoSelector`.
- `TL-2b` skips the aspect test when `object-fit` is not `fill`. An SVG without an intrinsic size passes both tests.
- `TL-2d` takes `logoFiles` as a glob with `*`, `**`, and `?`, relative to the project root.
- `TL-4a` picks the footer that is not inside `article`, `section`, `aside`, `main`, or `nav`. A conditional link is required unless its flag (`hasFaq`, `hasSitemap`) is `false`. It checks the order of the first match of each link. A link text matches without regard to case and spacing.
- `TL-4b` accepts `currentYear: "auto"`, which means the year of the run date. The demo sets 2026 so that it does not change on 1 January.
- `TL-4d` changed. The rule asked a link not to lead back to its own page, but a footer that every page shares links to its own page on that page. The check now fails an empty or fragment-only `href`, a local link to no file, and an external link that does not respond or returns an error status when `checkExternal` is `true`. A `mailto:` or `tel:` link is skipped. A test checks the external path against a local server only.
- `TL-5a` and `TL-6a` changed. `distributionChannels` and `storeDeveloperName` were config values that a file edit cannot change. They now come from `channels` and `developerName` in the JSON file at `storeListingFile` (default `store-listing.json`). The rules answer the open question about where the linter reads the channels.
- `TL-5b` gained `manifestFile` (default `package.json`). It reads JSON only.
- `TL-6c` reads each `manifestFiles` entry as a path relative to the project root. It reads a developer name from JSON (`developerName`, `developer`, or `author`), a property list (`DeveloperName`), and Android XML (a `<meta-data>` element). It does not read other keys.
- The demo is a website, so `TL-5a`, `TL-5b`, and `TL-6a` take `serviceType: "mobile-app"` from a `rules` override in `demo/config.d/tl.json`. The files are in `demo/site/tl/app/`.
- The fixture pair of `TL-1a` covers the canonical link only, because a pair shares one config. The other branches are in `test/tl-edges.test.ts`.

Rules not built: none.
