# Deploy: Airbase

The website deploys as a container to Airbase, a Singapore Government platform that runs on the Government Commercial Cloud. Docs: https://docs.app.tc1.airbase.sg/

The old Vercel project (`tfx-design-standard`) was deleted; there is no auto-deploy from `main` yet (tracked separately, see Out of scope on issue #142).

## Known blocker: Airbase's CSP breaks this site (as of 2026-08-14)

The site deploys and every route answers HTTP 200, but **the page renders blank in a real browser.** Confirmed by comparing a raw `curl` (full, correct HTML: header, nav, heading text all present) against an actual browser screenshot (blank) and the live DOM after JS ran (the visible markup is gone, replaced by inert, never-executed script tags).

Root cause: Airbase's edge unconditionally adds `Content-Security-Policy: script-src 'self'` to every response, with no override. Their own docs confirm this in [reference/security-csp](https://docs.app.tc1.airbase.sg/reference/security-csp/): "You cannot: Override the CSP policy, Add additional CSP directives, Disable CSP enforcement." (The one workaround listed, an Nginx proxy, is Python-only and explicitly documented as weakening security.)

This CSP blocks Next.js's inline `<script>self.__next_f.push(...)</script>` tags, which the framework always emits to carry server-rendered data to the client for hydration (App Router's RSC payload; the Pages Router's `__NEXT_DATA__` script has the same shape). This isn't specific to how this site is built or rendered; it's how Next.js delivers data to the browser at all, so a static export wouldn't avoid it either as long as the page has any client-side interactivity to hydrate. Airbase's own [how-to/csp-compliance](https://docs.app.tc1.airbase.sg/how-to/csp-compliance/) guide claims "Next.js 13+ is CSP-compliant by default"; that claim doesn't hold for real Next.js apps with client components, which this site has (sidebar, mobile nav).

No documented self-serve fix exists (checked `reference/security-csp`, `how-to/csp-compliance`, `how-to/troubleshoot-csp`). This needs either an exception from Airbase's platform team, or a decision to rearchitect the site to avoid Next.js's hydration model entirely (a large change, not a config fix). Until one of those happens, treat the site as **not actually usable** on Airbase despite passing every automated HTTP check.

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
