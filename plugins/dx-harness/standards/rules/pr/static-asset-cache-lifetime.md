---
code: PR-7f
slug: static-asset-cache-lifetime
dss: PR-7
tier: L1
check: lint
surface: project
engine: custom, with Lighthouse uses-long-cache-ttl as a rendered cross-check (verify against installed version)
parameters:
  cacheConfigFiles: null
  assetPatterns: ["*.js", "*.css", "*.woff2", "*.png", "*.jpg", "*.webp", "*.avif", "*.svg"]
  minCacheSeconds: null
---

# PR-7f: static assets carry a long cache lifetime

## Statement

The server configuration sets a cache lifetime of at least the minimum for each static asset.

## Check

Applies when `cacheConfigFiles` and `minCacheSeconds` are set. Reads the headers rules in `cacheConfigFiles`, such as `_headers`, `vercel.json`, or `nginx.conf`. Fails an asset pattern in `assetPatterns` when any of these holds:

- No rule sets `Cache-Control` for it.
- The `max-age` is below `minCacheSeconds`.
- The rule sets `no-store` or `no-cache`.

When either parameter is unset, the rule reports "not configured" and does not pass.

The rule reads Netlify and Cloudflare `_headers` files, `vercel.json`, and `nginx.conf`. For each asset pattern it builds a sample path, finds the rules that match, and reads `Cache-Control` from the last of them. In `nginx.conf` it reads `location` blocks with `add_header Cache-Control` or `expires`, and not included files. It reads the config and not the server, so a header that a CDN adds is not seen.

## Recommendations

- Use content hashes in file names so a long lifetime is safe.
- Set a short lifetime for HTML.

## Not required for

None listed.

## Rationale

A cached asset needs no second download. This rule supports `PR-7a`. The DSS sets no lifetime, so the parameter has no default.
