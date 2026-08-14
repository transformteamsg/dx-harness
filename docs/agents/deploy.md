# Deploy: Airbase

The website deploys as a container to Airbase, a Singapore Government platform that runs on the Government Commercial Cloud. Docs: https://docs.app.tc1.airbase.sg/

The old Vercel project (`tfx-design-standard`) was deleted; there is no auto-deploy from `main` yet (tracked separately, see Out of scope on issue #142).

## Airbase CSP compatibility

Airbase adds `Content-Security-Policy: script-src 'self'` to every response and does not allow applications to override it. Its [CSP reference](https://docs.app.tc1.airbase.sg/reference/security-csp/) permits JavaScript served from the application's own origin but blocks inline scripts, `eval()`, and the `Function()` constructor. Its [CSP compliance guide](https://docs.app.tc1.airbase.sg/how-to/csp-compliance/) therefore requires framework build output to keep all JavaScript in external `.js` files.

Next.js 15's App Router does not meet that output contract by default: prerendered HTML includes inline `self.__next_f.push(...)` scripts containing the React Server Components payload. Airbase blocks those scripts, so the allowed external Next.js runtime starts without its payload and clears the server-rendered page.

`pnpm build` fixes the generated artifact in its `postbuild` step. `scripts/externalize-next-inline-scripts.mjs` moves executable inline scripts from every prerendered `.next/server/app/**/*.html` page into content-hashed files under `.next/static/csp-inline/`, then replaces them with same-origin `src` references. External scripts, empty scripts, and non-executable data blocks such as `type="application/json"` remain unchanged. The build fails if the expected prerendered output is missing or an executable inline script remains after processing.

Do not remove the `postbuild` step or run `next build` directly for an Airbase image. `pnpm build` runs the standards checks, the Next.js build, and CSP externalization in order. `scripts/verify-deploy.mjs` also rejects live HTML that still contains executable inline scripts, so an HTTP 200 alone can no longer hide this failure.

## One-time setup (human only, needs TechPass)

1. Install the CLI: `curl -fsSL https://console.airbase.tech.gov.sg/dist/install.sh | sh`
2. Log in: `airbase login` (opens a browser for a TechPass or gov.sg verification code)
3. Create the team and project at https://go.gov.sg/airbase, named `dx-harness`
4. Install Docker and make sure the daemon is running (`docker info` succeeds)
5. Edit `airbase.json`'s `handle` field: replace `<team-name>/dx-harness` with the real team name from step 3

## Deploy to staging

From the repository root, with Docker running:

```sh
airbase container build
airbase container deploy --yes staging
```

The site will be live at `https://staging--dx-harness.app.tc1.airbase.sg`.

Check every page and agent surface answers correctly:

```sh
node scripts/verify-deploy.mjs https://staging--dx-harness.app.tc1.airbase.sg
```

## Deploying again

Re-running the same two commands from an updated branch replaces the running staging version. There's no need to delete the previous deployment first; this is standard Airbase behavior, not something this repo configures.

## What's deliberately not automated yet

- **Production.** This only covers staging. Production (`https://dx-harness.app.tc1.airbase.sg`, no `staging--` prefix) is a separate, later step.
- **CI auto-deploy.** Deploying on every green `main` needs an `AIRBASE_TOKEN` repository secret and a workflow; that's a follow-up issue, not part of this one.
- **Image size.** The runtime image ships the full repository tree (including `plugins/dx-harness/checks`, `skills`, etc.), not just the files each route actually reads, so it doesn't need to keep a manual file-tracing list in sync with every route. Worth revisiting once the size becomes a problem.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `airbase container deploy` can't resolve the handle | The Console project doesn't exist yet, or `airbase.json`'s `handle` still has the `<team-name>` placeholder |
| Docker build fails on `check:python` | `python3`/`python3-yaml` didn't install in the builder stage; check the `apt-get install` step in `Dockerfile` |
| Staging URL times out or 502s | `PORT` / `airbase.json`'s `port` likely disagree with what the app binds; the `Dockerfile`'s `CMD` must read `$PORT` and bind `0.0.0.0` |
| A page 404s on staging but works locally | Something the route reads from disk (`content/`, `plugins/dx-harness/standards/`) didn't make it into the image; the `Dockerfile`'s runtime stage copies the full app tree specifically to avoid this |
