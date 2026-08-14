#!/usr/bin/env node
// Checks that every human and agent-facing route answers with 200 on a
// deployed site. Run after `airbase container deploy` (see
// docs/agents/deploy.md and issue #142's "every page and agent surface
// answers" acceptance criterion):
//
//   node scripts/verify-deploy.mjs https://staging--dx-harness.app.tc1.airbase.sg

const base = process.argv[2];
if (!base) {
  console.error("Usage: node scripts/verify-deploy.mjs <base-url>");
  process.exit(1);
}

// Mirrors tests/site-contract.spec.ts's route list, plus the agent-facing
// surfaces next.config.mjs traces content/ and standards/ into.
const routes = [
  "/",
  "/overview",
  "/how-to-read",
  "/standards/catalog",
  "/for-agents",
  "/harness/loop",
  "/standards",
  "/foundations/motion",
  "/foundations/tokens",
  "/governance/changes",
  "/llms.txt",
  "/llms-full.txt",
  "/standards/catalog.yaml",
  "/standards/catalog/a11y-1",
  "/overview.md",
  "/sitemap.xml",
];

const results = await Promise.all(
  routes.map(async (route) => {
    const url = new URL(route, base).toString();
    try {
      const res = await fetch(url);
      return { route, status: res.status, ok: res.status === 200 };
    } catch (err) {
      return { route, status: err.message, ok: false };
    }
  }),
);

for (const { route, status, ok } of results) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${status}  ${route}`);
}

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.error(`\n${failed.length} of ${routes.length} routes failed.`);
  process.exit(1);
}
console.log(`\nAll ${routes.length} routes returned 200.`);
