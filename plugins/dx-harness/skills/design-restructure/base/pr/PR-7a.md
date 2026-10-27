---
code: PR-7a
dss: PR-7
tier: L2
check: lint
surface: rendered
engine: custom, navigation timing
parameters:
  maxLoadSeconds: null
  pages: null
  viewport: { width: 1350, height: 940 }
  networkProfile: null
  cpuThrottle: null
---

# PR-7a: page load time is at or below the limit

## Statement

Each page loads within the set number of seconds.

## Check

Applies when `maxLoadSeconds`, `pages`, `networkProfile`, and `cpuThrottle` are set. Loads each page in `pages` at `viewport` under the network profile and CPU throttle. Fails a page when the load event ends after `maxLoadSeconds`.

When any of the four required parameters is unset, the rule reports "not configured" and does not pass.

`networkProfile` is an object with `latencyMs`, `downloadKbps`, and `uploadKbps`. `cpuThrottle` is a slowdown factor, where 4 means four times slower. The rule loads each page in a headless Chromium of its own, applies both through the DevTools protocol with the cache off, and reads the end of the load event from navigation timing. The run is a lab figure on a local server and is not a field measurement. The limit is a parameter, so choose it for the profile.

## Recommendations

- Track or test performance regularly.
- Optimise with WOGAA and Google PageSpeed Insights.

## Not required for

None listed.

## Rationale

Slow pages lose users. The DSS leaves the limit to each service, so the parameter has no default. `PR-7b` to `PR-7f` check the usual causes.
