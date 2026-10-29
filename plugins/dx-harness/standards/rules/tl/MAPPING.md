# TL: Trust and Legitimacy

Source: [DSS Trust and Legitimacy](https://info.standards.tech.gov.sg/control-catalog/dss/tl/). Status: draft. The decisions and open items are in the [category README](README.md).

A parameter that the table lists as an exemption comes from the DSS "Not required for" text. A rule skips only when the product config sets the parameter. An unset parameter reports "not configured".

| DSS control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| TL-1 Official Government Domain | [`TL-1a`](official-domain.md) The service uses an official domain | lint | project | custom | `productUrl`, `institutionType`, `agencySuffix`, `educationSuffix` |
| | `TL-1b` The domain is registered on the DNS and ITSM portals | judged | | | |
| TL-2 Agency or Initiative Logo | [`TL-2a`](logo-top-left-links-home.md) The logo is at the top left and links to the homepage | lint | rendered | custom | `pages`, `logoSelector`, `homepagePath`, `maxLogoTop`, `logoHalf` |
| | [`TL-2b`](logo-not-distorted.md) The logo renders without distortion or pixellation | lint | rendered | custom | `pages`, `logoSelector`, `aspectTolerance`, `minPixelRatio` |
| | `TL-2c` The logo is the official logo of the agency or initiative. Lint part: [`TL-2d`](official-logo-hash.md). | judged | | | |
| | [`TL-2d`](official-logo-hash.md) The logo file matches an official logo hash. Lint part of `TL-2c`. | lint | project | custom | `logoFiles`, `officialLogoHashes` |
| TL-3 Official Government Banner | [`TL-3a`](government-banner-topmost.md) The banner is the topmost component of every page | lint | rendered | custom | `bannerPages`, `productUrl`, `customisable` (exemption), `bannerSelector` |
| | [`TL-3b`](sgds-banner-component.md) The banner is the SGDS component, with its text intact | lint | source | custom | `pages`, `productUrl`, `customisable` (exemption), `bannerSelector`, `bannerText` |
| TL-4 Official Government Footer | [`TL-4a`](footer-official-links.md) The footer carries the official links in order | lint | rendered | custom | `pages`, `productUrl`, `transactionalPages` (exemption), `footerSelector`, `footerLinks`, `conditionalLinks`, `hasFaq`, `hasSitemap` |
| | [`TL-4b`](footer-copyright.md) The footer carries the copyright statement | lint | rendered | custom | `pages`, `productUrl`, `transactionalPages` (exemption), `footerSelector`, `ownerName`, `currentYear` |
| | `TL-4c` Each footer link leads to the content that its label names. Lint part: [`TL-4d`](footer-links-resolve.md). | judged | | | |
| | [`TL-4d`](footer-links-resolve.md) Each footer link resolves. Lint part of `TL-4c`. | lint | project | custom | `footerSelector`, `timeoutSeconds`, `checkExternal` |
| TL-5 Mobile App Ownership and Distribution | [`TL-5a`](official-app-stores.md) A mobile app is distributed only through official app stores | lint | project | custom | `serviceType`, `storeListingFile`, `allowedStores` |
| | [`TL-5b`](no-free-distribution-licence.md) A mobile app is not released under a free-distribution licence | lint | project | custom | `serviceType`, `manifestFile`, `allowedLicences` |
| | `TL-5c` The agency retains the intellectual property rights and meets the endorsement guidelines | judged | | | |
| TL-6 Application Store Listings | [`TL-6a`](store-account-agency-name.md) The store developer account carries the agency name | lint | project | custom | `serviceType`, `agencyName`, `storeListingFile` |
| | `TL-6b` The developer name is the full official agency name. Lint part: [`TL-6c`](manifest-developer-name.md). | judged | | | |
| | [`TL-6c`](manifest-developer-name.md) The manifest developer name equals the agency name. Lint part of `TL-6b`. | lint | project | custom | `agencyName`, `manifestFiles` |
