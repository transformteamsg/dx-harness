# PR: Performance and Reliability

Source: [DSS Performance and Reliability](https://info.standards.tech.gov.sg/control-catalog/dss/pr/). Status: draft. The decisions and open items are in the [category README](README.md).

A parameter that the table lists as an exemption comes from the DSS "Not required for" text. A rule skips only when the product config sets the parameter. An unset parameter reports "not configured". Lighthouse audit names are marked "verify against installed version".

Check values: `lint`, `judged`, or `out of scope` for the design linter.

| DSS control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| PR-1 Digital service review | `PR-1a` The service is reviewed at the set interval. Lint part: [`PR-1b`](PR-1b.md). | out of scope | | | A review is an organisational process. `PR-1b` checks the recorded date only. |
| | [`PR-1b`](PR-1b.md) The review date in the config is not older than the interval. Lint part of `PR-1a`. | lint | project | custom | `lastReviewDate`, `reviewIntervalDays`, `reviewDateFile` |
| PR-2 Digital service registration | [`PR-2a`](PR-2a.md) The WOGAA tracking code is present on each public page | lint | source | custom | `trackingScriptPattern`, `customisable`, `pages` |
| | `PR-2b` The service is registered with WOGAA | out of scope | | | The registry is outside the product. |
| | `PR-2c` WOGAA Sentiments is enabled. Lint part: [`PR-2d`](PR-2d.md). | judged | | | |
| | [`PR-2d`](PR-2d.md) The page loads the WOGAA Sentiments script. Lint part of `PR-2c`. | lint | source | custom | `sentimentsScriptPattern`, `pages` |
| PR-3 Digital service availability | `PR-3a` The service is available 24/7 | out of scope | | | Availability is a runtime property. |
| | `PR-3b` Operational hours are stated when the service is not available 24/7. Lint part: [`PR-3c`](PR-3c.md). | judged | | | |
| | [`PR-3c`](PR-3c.md) A page states the operational hours when the service is not available 24/7. Lint part of `PR-3b`. | lint | rendered | custom | `availability`, `hoursSelector`, `hoursPattern`, `pages` |
| PR-4 Notify of scheduled downtime | `PR-4a` Notice is given at least the set number of days ahead | out of scope | | | A notice date is a runtime event. |
| | `PR-4b` The notice carries the date, time, duration, reason, and affected features. Lint part: [`PR-4c`](PR-4c.md). | judged | | | |
| | [`PR-4c`](PR-4c.md) A downtime notice carries each required field. Lint part of `PR-4b`. | lint | rendered | custom | `noticeSelector`, `requiredFields`, `pages` |
| PR-5 Manage broken links | [`PR-5a`](PR-5a.md) No link on a page is broken | lint | rendered | custom | `linkScope`, `linkTimeoutMs`, `pages` |
| | `PR-5b` A broken link is fixed within the set number of days | out of scope | | | The fix time is a process measure. |
| PR-6 Browser compatibility | [`PR-6a`](PR-6a.md) The browser support list is declared and meets the minimum | lint | project | custom | `minBrowsers`, `browserSupportSource` |
| | [`PR-6b`](PR-6b.md) The service passes smoke checks in the listed browser engines | lint | rendered | Playwright multi-engine | `engines`, `smokeChecks`, `viewports`, `pages`, `runOn` (ci) |
| PR-7 Optimise load times | [`PR-7a`](PR-7a.md) Page load time is at or below the limit | lint | rendered | custom, navigation timing | `maxLoadSeconds`, `pages`, `viewport`, `networkProfile`, `cpuThrottle` |
| | [`PR-7b`](PR-7b.md) Core Web Vitals are within the limits | lint | rendered | Lighthouse `largest-contentful-paint`, `cumulative-layout-shift`, `total-blocking-time` (verify against installed version) | `lcpMs`, `clsMax`, `tbtMs`, `pages` |
| | [`PR-7c`](PR-7c.md) Page weight is at or below the limit | lint | rendered | Lighthouse `total-byte-weight` (verify against installed version) | `maxPageBytes`, `pages` |
| | [`PR-7d`](PR-7d.md) Images use a modern format and are not oversized | lint | rendered | Lighthouse `modern-image-formats`, `uses-responsive-images` (verify against installed version) | `imageFormats`, `maxImageBytes`, `pages` |
| | [`PR-7e`](PR-7e.md) Images below the fold load lazily | lint | source | Lighthouse `offscreen-images` for the rendered cross-check (verify against installed version), custom for source | `foldViewports` |
| | [`PR-7f`](PR-7f.md) Static assets carry a long cache lifetime | lint | project | custom, Lighthouse `uses-long-cache-ttl` for the rendered cross-check (verify against installed version) | `cacheConfigFiles`, `minCacheSeconds`, `assetPatterns` |

## Counts

- Controls: 7.
- Rules: 22.
- Lintable: 14 (`PR-1b`, `PR-2a`, `PR-2d`, `PR-3c`, `PR-4c`, `PR-5a`, `PR-6a`, `PR-6b`, `PR-7a`, `PR-7b`, `PR-7c`, `PR-7d`, `PR-7e`, `PR-7f`).
- Judged: 3 (`PR-2c`, `PR-3b`, `PR-4b`).
- Out of scope: 5 (`PR-1a`, `PR-2b`, `PR-3a`, `PR-4a`, `PR-5b`).
