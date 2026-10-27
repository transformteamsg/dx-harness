# Config file

Status: draft. A product sets the values that its rules read in one file, `design-lint.config.json`, at the repository root. A JSON Schema validates the file and gives editor hints.

## Shape

```json
{
  "$schema": "https://example.invalid/design-lint.config.schema.json",
  "product": {
    "serviceType": "website",
    "productUrl": "https://example.gov.sg",
    "audience": "public",
    "locales": ["en", "zh"]
  },
  "pages": {
    "all": ["/", "/search", "/contact"],
    "entry": ["/", "/login"],
    "authenticated": ["/account"]
  },
  "flows": {
    "apply": ["start", "details", "review", "success"]
  },
  "rules": {
    "BD-4a": { "maxGrade": 9, "locale": "en" }
  }
}
```

| Key | Holds |
| --- | --- |
| `select` | The rules to run, as codes or category prefixes. A `--select` flag overrides it. |
| `serve` | The directory that the rendered rules serve, relative to the config file. It defaults to the first path that the command receives. |
| `render` | `waitUntil`, either `networkidle` (the default) or `load`. A static site can use `load`, which is faster. |
| `product` | Facts that many rules read. One value serves every rule that reads that name. |
| `pages` | Named page groups. A page is a path or a file. A designer lists each page once. |
| `flows` | Ordered lists of page groups or pages. One declaration serves every rule that reads a flow. |
| `rules` | Overrides for one rule. The key is the rule code and the value is a map of parameters. |

`$schema` is a placeholder. The real URL is set when the package is published.

## How a rule gets a value

For a parameter `P` of rule `R`, the runner takes the first value that it finds, in this order:

1. `rules.R.P`
2. `product.P`
3. The page group that `P` names, when `P` is a page parameter (see the table below)
4. The default in the rule file
5. Nothing. The rule reports "not configured" and does not pass.

This is the order of ADR 0001 for the product layer. The domain preset and the custom layer slot in between steps 3 and 4 when they exist.

A product cannot override an L0 rule through `rules`. The runner reports the skipped line and applies the rule.

## Page parameters

| Parameter in a rule file | Page group in `pages` |
| --- | --- |
| `pages` | `all` |
| `entryPages` | `entry` |
| `authenticatedPages` | `authenticated` |
| `loginPages` | `login` |
| `startPages` | `start` |
| `successPages` | `success` |
| `failurePages` | `failure` |
| `paymentPages` | `payment` |
| `transactionalPages` | `transactional` |
| `errorPages` | `error` |

`transactionalFlows` and `flows` both read the `flows` key. The two names in the rule files are unified later under `flows`.

## Starting list for `product`

These parameters are product facts. Each one has a default of `null` in at least one rule file.

`serviceType`, `productUrl`, `audience`, `locale`, `locales`, `agencyName`, `customisable`, `designSystem`, `availability`, `institutionType`, `storesPaymentDetails`, `hasFaq`, `hasSitemap`, `distributionChannels`, `authMethods`, `storeDeveloperName`, `currentYear`, `minBrowsers`, `lastReviewDate`, `reviewIntervalDays`.

Selectors, thresholds, and file globs stay per rule. A product sets them under `rules` only when it needs a value other than the default.

## Open

- The list of keys in `product` is a first pass from the parameters that default to `null`. Review it against the rule files.
- A rule file can name a page parameter that has no group yet. The schema needs a check for this.
- A single-page prototype lists one page. Decide whether `pages.all` defaults to the pages that `design-lint init` finds.
