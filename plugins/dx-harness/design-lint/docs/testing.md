# Testing and demonstrating the rules

Status: built for every lint rule. The formats below are the ones in use.

A rule is proven by a case that fails it, a case that passes it, and a run of the linter over both. The same cases serve the tests, the live demo, and the rule documentation.

## Three layers

| Layer | Tests | Runs |
| --- | --- | --- |
| Rule fixtures | One rule on a small snippet that fails and one that passes | Vitest, on every change |
| Site pair | The whole linter on a passing site and on a failing site | Vitest and CI. The rendered rules need a browser. |
| Calibration corpus | The linter on real pages that the team did not write, to measure false findings | On demand |

The first two layers show that a rule fires and stays quiet when it should. The third checks what a fixture cannot: whether a rule fires wrongly on real markup. The L2 heuristics, such as `BD-1d` and `WO-15a`, need it most.

## Rule fixtures

```
plugins/dx-harness/design-lint/fixtures/<CODE>/
  pass/           a small site that passes the rule
  fail/           a small site that fails it
  expected.json
  config.json     optional
  pass.config.json, fail.config.json     optional
```

`pass.config.json` and `fail.config.json` merge over `config.json`, for a rule that reads a value from the config and needs a different value in each case, such as the login methods of `WU-14a`.

`pass` and `fail` are directories, so one format serves every surface: a rendered rule serves the directory, and a project rule reads across its files.

`expected.json` lists the findings that `fail` must produce. Each entry has a `file`, relative to the site root. A rendered finding names the page path, as in `/`. `line` and `column` are optional, and an entry without them matches any position. The test fails on a missing finding and on an extra one. `pass` must produce no finding and no note.

## Site pair

```
plugins/dx-harness/design-lint/demo/
  site/                  the passing site
  patches/<CODE>.json    one break patch for each rule
  demo.ts                the demo script
```

One passing site passes every rule that exists. The failing site is the passing site with the break patches applied. A hand-written pair drifts, and the failing site gains differences that have nothing to do with the rule.

A break patch is the smallest change that makes one rule fail:

```json
{
  "code": "BD-1a",
  "describe": "Remove the viewport meta tag from the home page.",
  "edits": [
    {
      "file": "index.html",
      "find": "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n",
      "replace": ""
    }
  ],
  "expect": [{ "file": "index.html", "line": 3, "column": 1 }]
}
```

A patch has edits, a config override, or both. An edit is an exact text replacement in one file, or, with `files` and a glob, in every matching file that holds the text. It fails when `find` occurs other than once, so a patch never silently changes nothing. `expect` follows the format of `expected.json`. An entry can carry a `code`, when the patch also breaks another rule. A patch can set `config`, which merges over the config of the site. Use it when the failure is a product choice and not a change to a page: a product that requires a phone line and has none. A patch marked `"exclusive": true` conflicts with other patches, so the failing site leaves it out.

The test for each patch:

1. Apply the patch to a copy of the site. The patch reports which files it changed.
2. Run the linter on the pages that those files make, and on the first page, which is the reference for a rule that compares pages. If the patch changed a file that is not a page, such as a stylesheet, or set only a config value, the run keeps every page.
3. Run the rules of the same DSS control (WP-6a, WP-6b, and WP-6c for a patch of WP-6b), and any rule that `expect` names.
4. Expect exactly the findings in `expect`.

A finding that `expect` does not list means that the rule is wrong or that the patch breaks too much. This test catches a patch that breaks a second rule of its own control. It does not catch a patch that breaks a rule of another control or category. Running every rule on every patch took over 20 minutes and overloaded the machine, and running a whole category timed out for the large ones.

Three more tests cover the whole site:

- The demo site passes every rule that exists. This is the guard against a page of one category breaking a rule of another.
- The failing site holds the patches that share no file with another patch, and leaves out the patches marked exclusive. It expects each finding of those patches to be present. It compares the file and the rule only, because patches shift each other's lines, and it does not check for extra findings, because patches that interact change each other's results. Fourteen patches qualify.
- The patches that are marked exclusive are the ones that the test names: `BD-2a` removes the search form that other rules need, and `WU-5a` makes a page submit when a field gets focus.

The demo site is a small public service. It grew to about 37 pages as each category added the pages that its rules need.

The suite takes about 3.5 minutes on a quiet machine: about 2.5 minutes for the patches and 1 minute for everything else. Do not run it while other test runs are open. Each rendered test starts Chrome processes, and a dozen concurrent runs pushed the load of the machine above 150.

## The live demo

A terminal script, `pnpm --filter design-lint demo -- <rule code>`, in four steps:

1. Lint the passing site. It exits 0.
2. Apply the patch of the rule. Lint again. It prints the finding and exits 1.
3. State that the pre-commit hook stops the commit on that exit code. The script does not run a real hook.
4. Restore the site. Lint again. It exits 0.

The script works on a copy in `demo/.work/`, so the site never changes. It takes a rule code, so the same demo shows any rule that has a patch. A rendered rule needs a browser.

A later stage is a local page that shows both sites with the findings drawn over them. Source rules give a file and a line. Rendered rules can give the element.

## Calibration corpus

A list of real pages, and a record of a person's verdict on each finding. The run lints each page with the L2 rules and prints, for each rule, the findings, the false ones, the findings with no verdict, and the share of false findings. A later change uses the shares to set the tiers: a rule with many false findings moves to a lower tier, or goes back to judged.

```
plugins/dx-harness/design-lint/calibration/
  corpus.json      the pages, the config they run with, and the limit of false findings
  verdicts.json    the verdict record
  run.ts           the command
```

```sh
pnpm --filter design-lint calibrate
pnpm --filter design-lint calibrate -- --record
pnpm --filter design-lint calibrate -- --corpus <file> --verdicts <file> --no-rendered
```

`--record` adds each new finding to the verdict record with a verdict of `null`. A person then sets each verdict to `"true"` or `"false"`, and can add a `note`. `--no-rendered` runs the source and project rules only, for a machine with no browser.

### The corpus

```json
{
  "config": { "product": { "audience": "public", "serviceType": "website" } },
  "falseShareLimit": null,
  "pages": [
    { "id": "gov-uk-home", "url": "https://www.gov.uk/" },
    { "id": "saved-page", "file": "pages/saved-page.html" }
  ]
}
```

| Key | Holds |
| --- | --- |
| `config` | The design-lint config that each page runs with. `select` limits the rules. Without it, the run selects every L2 rule. |
| `falseShareLimit` | The share of false findings, from 0 to 1, above which the report flags a rule for a lower tier or for the judged list. `null` means that no limit is agreed, and no rule is flagged. |
| `pages` | Each page has a unique `id` and one of `url` or `file`. A `file` is relative to the corpus file. |

The run fetches a `url` page once and saves it as `index.html`, with a `<base>` element so that its styles, scripts, and images load from the origin. The rendered rules see the page at `/`. A page that does not load is reported with its error, and the run continues with the next page.

The pages in `corpus.json` are a placeholder of four public pages. The team replaces them with the pages it chooses. A saved `file` page gives the same markup on each run, and a live `url` page can change.

### The verdict record

```json
[
  {
    "page": "gov-uk-home",
    "code": "WU-8a",
    "at": "415:7",
    "message": "This control is named ...",
    "verdict": "false",
    "note": "The two links go to different places on the page."
  }
]
```

`page`, `code`, `at`, and `message` identify a finding. `at` is `line:column` for a source or project finding, and the element name, or `page`, for a rendered finding. `verdict` is `"true"`, `"false"`, or `null`. A finding with a `null` verdict, or with no entry, counts as unjudged, and the share of false findings counts only the judged findings. When a page or a rule changes, a finding can get a new `at` or `message`, and it shows as unjudged again.

A rule that gives no verdict on a page, because it is not configured or did not run, is listed with the reason.

## Tracer bullet

One rule for each surface proved the whole path before any volume. That was `BD-1a`, `BD-9a`, and `BD-1b`. The category BD followed.

| Rule | Surface | Proves |
| --- | --- | --- |
| `BD-1a` | source | The fixture format, the patch format, and a rule that wraps an existing engine |
| `BD-9a` | project | Config resolution, and a rule that reads across pages |
| `BD-1b` | rendered | The browser, a fixed viewport, and the rendered patch |

Each gets a fixture pair, a break patch, a test, and a step in the demo.

## Open

- Which pages the calibration corpus holds. Pages from the portfolio products are one source. Public pages are another.
- The limit of false findings, and the tier that each rule moves to.
- CI runs `playwright-core install --with-deps chromium`. The step is not tested on the runner yet. The rendered tests fail in CI when no browser exists, and skip on a developer machine.
- A pinned Chromium could not be downloaded in the first build session. The local run used the installed Chrome. Run the tests with the pinned build before you rely on a rendered pass.
- A patch can already replace a CSS file, as the `BD-1b` patch does. A patch that must change layout through script is not tried.
- The overlay page for the demo.
