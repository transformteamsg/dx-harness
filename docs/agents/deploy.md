# Deploy: Airbase

The website deploys as a container to Airbase, a Singapore Government platform that runs on the Government Commercial Cloud. Docs: https://docs.app.tc1.airbase.sg/

The website deploys from the private repository `transformteamsg/dx-harness-website`, not from this one. Follow the deploy steps in that repository's `docs/agents/deploy.md`.

This repository carries no Airbase project configuration. The project that the website repository deploys to serves production, so a deploy from a checkout of this repository would replace the live site with the older copy kept here until issue #401 removes it. Do not add an `airbase.json` file, and do not run `airbase container deploy` from this repository.

## Airbase CSP compatibility

Airbase adds `Content-Security-Policy: script-src 'self'` to every response and does not allow applications to override it. Its [CSP reference](https://docs.app.tc1.airbase.sg/reference/security-csp/) permits JavaScript served from the application's own origin but blocks inline scripts, `eval()`, and the `Function()` constructor. Its [CSP compliance guide](https://docs.app.tc1.airbase.sg/how-to/csp-compliance/) therefore requires framework build output to keep all JavaScript in external `.js` files.

Next.js 16's App Router does not meet that output contract by default: prerendered HTML includes inline `self.__next_f.push(...)` scripts containing the React Server Components payload. Airbase blocks those scripts, so the allowed external Next.js runtime starts without its payload and clears the server-rendered page.

`pnpm build` fixes the generated artifact in its `postbuild` step. `scripts/externalize-next-inline-scripts.mjs` moves executable inline scripts from every prerendered `.next/server/app/**/*.html` page into content-hashed files under `.next/static/csp-inline/`, then replaces them with same-origin `src` references. External scripts, empty scripts, and non-executable data blocks such as `type="application/json"` remain unchanged. The build fails if the expected prerendered output is missing or an executable inline script remains after processing.

Do not remove the `postbuild` step or run `next build` directly for an Airbase image. `pnpm build` runs the Next.js build and then CSP externalization. It does not run the standards checks: those are `pnpm check`. `scripts/verify-deploy.mjs` derives every concrete public route from that build's `.next/prerender-manifest.json`, then checks the live deployment and rejects HTML that still contains executable inline scripts. An HTTP 200 on a small sample can no longer hide a missing page or CSP failure.
