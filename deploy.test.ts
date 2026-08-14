import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for the Airbase container build (Dockerfile,
   airbase.json). These can't exercise an actual `docker build` or a live
   deploy (see docs/agents/deploy.md for that), so they guard the
   properties that are the most likely to silently regress: the standards
   gate running unskipped and exactly once, and the runtime contract
   Airbase requires. See issue #142. */

function readRoot(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

describe("airbase.json", () => {
  const config = JSON.parse(readRoot("airbase.json"));

  it("targets a container build", () => {
    expect(config.framework).toBe("container");
  });

  it("has a team/project handle", () => {
    expect(config.handle).toEqual(expect.stringContaining("/"));
  });

  it("matches the port the Dockerfile's CMD falls back to", () => {
    const dockerfile = readRoot("Dockerfile");
    expect(dockerfile).toContain(`\${PORT:-${config.port}}`);
  });

  it("requests the nano instance size", () => {
    expect(config.instanceType).toBe("nano");
  });
});

describe("Dockerfile", () => {
  const dockerfile = readRoot("Dockerfile");

  it("uses a node-22 base image (Airbase has no node-24 variant)", () => {
    expect(dockerfile).toContain("gdssingapore/airbase:node-22");
    expect(dockerfile).not.toContain("node-24");
  });

  it("installs python3 and pyyaml so check:python can run in the image", () => {
    expect(dockerfile).toMatch(/python3\b/);
    expect(dockerfile).toContain("python3-yaml");
  });

  it("never reintroduces the Vercel prebuild skip", () => {
    expect(dockerfile).not.toContain("VERCEL");
  });

  it("runs the standards gate through `pnpm build`, not a second time directly", () => {
    expect(dockerfile).toContain("pnpm build");
    // The gate already runs once via `pnpm build`'s prebuild hook (see
    // ci.yml); a direct RUN of either check script here would run it twice.
    expect(dockerfile).not.toMatch(/^RUN.*check-standards\.mjs/m);
    expect(dockerfile).not.toMatch(/^RUN.*check:python/m);
  });

  it("installs dependencies fresh, rather than copying node_modules from the host", () => {
    expect(dockerfile).toContain("pnpm install");
    expect(dockerfile).not.toMatch(/COPY[^\n]*node_modules/);
  });

  it("binds 0.0.0.0 and falls back to a default port, per the Airbase runtime contract", () => {
    expect(dockerfile).toContain("0.0.0.0");
    expect(dockerfile).toMatch(/\$\{PORT:-\d+\}/);
  });
});

describe("next.config.mjs", () => {
  it("does not opt into standalone output", () => {
    // Runtime stage ships the full app tree instead of a pruned/standalone
    // output, so this doesn't silently regress into relying on the
    // outputFileTracingIncludes list matching every fs read at runtime.
    const config = readRoot("next.config.mjs");
    expect(config).not.toContain("standalone");
  });
});

describe("Airbase CSP build output", () => {
  it("externalizes Next.js inline scripts after every production build", () => {
    const pkg = JSON.parse(readRoot("package.json"));

    expect(pkg.scripts.postbuild).toBe("node scripts/externalize-next-inline-scripts.mjs");
  });

  it("derives deployed routes from the production build and checks HTML scripts", () => {
    const verifier = readRoot("scripts/verify-deploy.mjs");

    expect(verifier).toContain("prerender-manifest.json");
    expect(verifier).toContain("findExecutableInlineScripts");
    expect(verifier).toContain("executable inline script(s)");
  });
});

describe(".dockerignore", () => {
  const ignore = readRoot(".dockerignore");

  it("excludes node_modules and env files from the build context", () => {
    expect(ignore).toContain("node_modules");
    expect(ignore).toContain(".env*");
  });
});

describe("docs/agents/deploy.md", () => {
  const doc = readRoot("docs/agents/deploy.md");

  it("documents the build and deploy commands", () => {
    expect(doc).toContain('airbase container build --tag "$IMAGE"');
    expect(doc).toContain('airbase container deploy --yes --image "$IMAGE" staging');
  });

  it("documents the staging URL pattern", () => {
    expect(doc).toContain("staging--");
    expect(doc).toContain("app.tc1.airbase.sg");
  });
});
