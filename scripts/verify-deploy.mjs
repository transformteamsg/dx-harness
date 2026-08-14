#!/usr/bin/env node
// Checks that every statically published human and agent-facing route answers
// with 200 on a deployed site. Run after `pnpm build` and `airbase container
// deploy` (see docs/agents/deploy.md and issue #142's "every page and agent
// surface answers" acceptance criterion):
//
//   node scripts/verify-deploy.mjs https://staging--dx-harness.app.tc1.airbase.sg

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { findExecutableInlineScripts } from "./externalize-next-inline-scripts.mjs";

const DEFAULT_MANIFEST = path.join(process.cwd(), ".next", "prerender-manifest.json");

/* The production prerender manifest is the build's authoritative inventory of
   concrete static routes. It includes every generated document/control route
   and every agent surface, so new content cannot silently fall outside this
   verifier. Next records public Markdown twins under their internal `/md/`
   rewrite target; turn those back into the URLs callers actually request. */
export function deploymentRoutes(manifest) {
  if (!manifest || typeof manifest.routes !== "object" || Array.isArray(manifest.routes)) {
    throw new Error("Expected the prerender manifest to contain a routes object.");
  }

  return Array.from(
    new Set(
      Object.keys(manifest.routes)
        .filter((route) => route !== "/_not-found")
        .map((route) => (route.startsWith("/md/") ? route.slice(3) : route)),
    ),
  ).sort();
}

export function loadDeploymentRoutes(manifestPath = DEFAULT_MANIFEST) {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Could not read ${manifestPath}. Run pnpm build before verifying the matching deployment. ${message}`,
    );
  }
  return deploymentRoutes(manifest);
}

async function verifyRoute({ base, route, fetchImpl, timeoutMs }) {
  const url = new URL(route, base).toString();
  try {
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
    const isHtml = res.headers.get("content-type")?.includes("text/html") ?? false;
    const inlineScripts = isHtml ? findExecutableInlineScripts(await res.text()).length : 0;
    return {
      route,
      status: res.status,
      ok: res.status === 200 && inlineScripts === 0,
      detail: inlineScripts > 0 ? `${inlineScripts} executable inline script(s)` : "",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { route, status: message, ok: false, detail: "" };
  }
}

export async function verifyDeployment({
  base,
  routes,
  fetchImpl = fetch,
  timeoutMs = 10_000,
  // The deployed nano instance has 0.25 vCPU. Keep the full-manifest probe
  // bounded so verification does not become its own availability incident.
  concurrency = 4,
}) {
  if (!base) throw new Error("A base URL is required.");
  if (!Array.isArray(routes) || routes.length === 0) {
    throw new Error("At least one deployment route is required.");
  }
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error("Concurrency must be a positive integer.");
  }

  const results = new Array(routes.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < routes.length) {
      const index = nextIndex++;
      results[index] = await verifyRoute({ base, route: routes[index], fetchImpl, timeoutMs });
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, routes.length) }, () => worker()),
  );
  return results;
}

export async function main(args = process.argv.slice(2)) {
  const [base, manifestPath = DEFAULT_MANIFEST] = args;
  if (!base) {
    console.error("Usage: node scripts/verify-deploy.mjs <base-url> [prerender-manifest]");
    return 1;
  }

  const routes = loadDeploymentRoutes(manifestPath);
  const results = await verifyDeployment({ base, routes });

  for (const { route, status, ok, detail } of results) {
    console.log(`${ok ? "PASS" : "FAIL"}  ${status}  ${route}${detail ? `  ${detail}` : ""}`);
  }

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`\n${failed.length} of ${routes.length} routes failed.`);
    return 1;
  }

  console.log(
    `\nAll ${routes.length} built routes returned 200, and every HTML route contains no executable inline scripts.`,
  );
  return 0;
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  main()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
