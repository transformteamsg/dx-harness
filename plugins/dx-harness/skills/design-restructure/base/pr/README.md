# PR: Performance and Reliability

Source: [DSS Performance and Reliability](https://info.standards.tech.gov.sg/control-catalog/dss/pr/). Status: draft.

The category has 7 DSS controls and 22 rules: 14 lintable, 3 judged, and 5 out of scope for the design linter. The rule format is in the [top-level README](../../README.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

| Rule | Title | Surface |
| --- | --- | --- |
| [PR-1b](PR-1b.md) | The review date in the config is not older than the interval | project |
| [PR-2a](PR-2a.md) | The WOGAA tracking code is present on each public page | source |
| [PR-2d](PR-2d.md) | The page loads the WOGAA Sentiments script | source |
| [PR-3c](PR-3c.md) | A page states the operational hours when the service is not available 24/7 | rendered |
| [PR-4c](PR-4c.md) | A downtime notice carries each required field | rendered |
| [PR-5a](PR-5a.md) | No link on a page is broken | rendered |
| [PR-6a](PR-6a.md) | The browser support list is declared and meets the minimum | project |
| [PR-6b](PR-6b.md) | The service passes smoke checks in the listed browser engines | rendered |
| [PR-7a](PR-7a.md) | Page load time is at or below the limit | rendered |
| [PR-7b](PR-7b.md) | Core Web Vitals are within the limits | rendered |
| [PR-7c](PR-7c.md) | Page weight is at or below the limit | rendered |
| [PR-7d](PR-7d.md) | Images use a modern format and are not oversized | rendered |
| [PR-7e](PR-7e.md) | Images below the fold load lazily | source |
| [PR-7f](PR-7f.md) | Static assets carry a long cache lifetime | project |

## Judged rules

The 3 judged rules have no file. Each needs a rubric from `dx-design-judge`.

| Rule | Title |
| --- | --- |
| `PR-2c` | WOGAA Sentiments is enabled |
| `PR-3b` | Operational hours are stated when the service is not available 24/7 |
| `PR-4b` | A downtime notice carries the date, time, duration, reason, and affected features |

## Out of scope for the design linter

The 5 rules below concern runtime operations, a registry, or a process. A design linter cannot decide them, so no check exists: `PR-1a`, `PR-2b`, `PR-3a`, `PR-4a`, and `PR-5b`. The reason for each is in [MAPPING.md](MAPPING.md).

## Decisions

- An exemption is a parameter in the product config. The inline waiver is not used for an exemption.
- A DSS parameter, such as the load-time limit of `pr-7_prm_1`, defaults to `null`. An unset value reports "not configured".
- The Core Web Vitals limits in `PR-7b` are not in the DSS. They default to the published "good" thresholds from Google.
- `PR-7a` to `PR-7d` read one rendered run per page, so the linter runs the page once and shares the result.
- `PR-7a` to `PR-7d` run on a fixed viewport, a fixed network profile, and a fixed CPU throttle. Each is a parameter.
- `PR-2a` skips when `customisable` is `false`, which matches the DSS exception for software-as-a-service (SaaS) and commercial off-the-shelf (COTS) products.
- Tiers are provisional until [#432](https://github.com/transformteamsg/dx-harness/issues/432) classifies which controls a script can decide.

## Open

- Lighthouse audit names in `MAPPING.md` and the rule files are marked "verify against installed version". Check each name before the port.
- `PR-6b` runs Firefox and WebKit through the Playwright API in CI only. The plan's CDP-only adapter covers Chromium, so this rule needs a second path. Update the plan.
- `PR-7a`: Lighthouse has no audit for the load event. The rule reads navigation timing through a custom rule. Decide whether Lighthouse `interactive` is an acceptable substitute.
- `PR-7b`: the Interaction to Next Paint (INP) audit needs a user interaction. A lab run has none, so decide whether to use Total Blocking Time as the proxy.
- `PR-5a`: decide whether external links are checked in a pre-push run, because they need network access and can be flaky.
- `PR-2a`: the WOGAA script URL pattern is not published in the control. Set `trackingScriptPattern` from the WOGAA setup guide.
- The page fetch returned paraphrased control text. Compare the statements and recommendations with the source before the rule files are final.
- `PR-1a` could become a project rule that reads a review date from the product config. Decide whether the DSS intends that.

## Reviewed decisions

- `PR-6b`: lint, opt-in in CI, at tier L2. It runs smoke checks in Firefox and WebKit through Playwright. The Playwright WebKit build is not Safari.
- Second pass: `PR-1b` added as lint, for the review date in the config. `PR-1a` stays out of scope.
- Second pass: `PR-2d` added as lint, for the Sentiments script. `PR-2c` stays judged.
- Second pass: `PR-3c` added as lint, for the stated hours. `PR-3b` stays judged.
- Second pass: `PR-4c` added as lint, at tier L2, for the notice fields. `PR-4b` stays judged.

## Built

All 14 lint rules have a module in `packages/design-lint/src/modules/pr/`. No rule is left unbuilt.

- `PR-1b`: the rule file gains `reviewDateFile`, default empty. A break patch edits only files of the site, so a date that lives only in the config cannot be patched. When the file exists and holds `lastReviewDate`, it wins over the config value. The demo sets both to the same date.
- `PR-2a`, `PR-2d`, `PR-3c`: the rule files gain a `pages` parameter. The source rules check the pages in the list and not every HTML file, so a product with pages that are not public can leave them out. `PR-3c` names the first page in `pages` in its finding. The demo narrows `PR-2a` and `PR-2d` to its own page, because the shared pages carry no WOGAA script. Add the scripts to the shared pages, then remove the narrowing.
- `PR-2a`, `PR-2d`: the pattern is a regular expression tested against the `src` of each script. The demo values match `wogaa-demo.js` and `wogaa-sentiments-demo.js`, which are stand-ins and not the published WOGAA addresses.
- `PR-4c`: a field has text when a child marked `data-field` has text, or when the notice has the label of the field followed by a colon and text. The rule does not read synonyms.
- `PR-5a`: an internal link is requested from the page, and an external link from Node. The demo and the fixtures use no external link that needs a network. The failing fixture uses a closed local port.
- `PR-6a`: the Browserslist data is not installed, so only a query that names a browser counts. `defaults` and `> 0.5%` count for none. The demo reads `pr/.browserslistrc` through `browserSupportSource`.
- `PR-6b`: the rule file gains `viewports`, which copies the default of `BD-1b`, and `engines` also accepts `chromium`. The runner has no channel for a note from a module, so an engine that does not start gives a finding that starts with "Not run". It never passes. `test/pr-6b.test.ts` tests that path with a Firefox executable that does not exist. Firefox and WebKit are not installed on the build machine, so the run in those engines is untested. Set `DESIGN_LINT_FIREFOX` or `DESIGN_LINT_WEBKIT` to override the Playwright build.
- `PR-6b`: the runner skips the rule unless `--ci` is set, and it reads `runOn` from the rule file and not from the config. The fixture test and the patch test run with `ci` off, so `fixtures/PR-6b/expected.json` and `demo/patches/PR-6b.json` expect nothing. `fixtures/PR-6b/expected-ci.json` and `test/pr-6b.test.ts` hold the real checks with `ci` on, in Chromium. A runner that read `runOn` from the config would remove the gap.
- `PR-7a`: the rule starts a Chromium of its own, because the session interface has no network or CPU control. It loads the page with the cache off, under the profile and the throttle, and reads `loadEventEnd` from navigation timing. The demo limit is 2.5 s under 100 ms of latency, 1500 kbps, and a 4x CPU slowdown. A normal page loads in about half a second. The break patch blocks the load event for six seconds.
- `PR-7b` to `PR-7d`: Lighthouse is not installed, so each rule reads browser APIs. The measurement is one fresh page for each path, shared by the three rules. The page is fresh, because the axe runs of other rules add long tasks to a shared page. The rule waits for the first paint, which can come after the load event on a busy machine, and then 500 ms.
- `PR-7b`: TBT is an estimate that starts at the first contentful paint and has no Time to Interactive end. CLS is a plain sum. There is no break patch for LCP or TBT limits alone. The `PR-7a` patch also breaks TBT, and `test/pr-modules.test.ts` tests the LCP and TBT limits on given values.
- `PR-7c`: the limit in the demo is 120,000 bytes. A normal page weighs about 15,000 bytes. The patch loads a 260 KB script.
- `PR-7d`: the demo limit is 10,000 bytes. The patch changes three conditions in one patch, because a rule has one patch file.
- `PR-7e`: source has no layout, so the first image or frame is above the fold and the others are below. `foldViewports` is not read. The rule finds one image in `wp-a/media.html` that is not lazy.
- `PR-7f`: the demo reads `pr/_headers`, because a file at the site root belongs to the shared pages.
- The demo narrows `PR-7a` to `PR-7d` and `PR-6b` to `/` and its own page, to keep the lab runs short and stable.
- Lab thresholds are for a machine that is not under heavy load. On a machine that runs many browsers, a load time or a long task can pass the limit by chance.
