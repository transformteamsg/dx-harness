import { describe, expect, it, vi } from "vitest";
import { deploymentRoutes, verifyDeployment } from "./verify-deploy.mjs";

describe("deploymentRoutes", () => {
  it("derives every public route from the production prerender manifest", () => {
    const manifest = {
      routes: {
        "/_not-found": {},
        "/": {},
        "/overview": {},
        "/llms.txt": {},
        "/md/index.md": {},
        "/md/overview.md": {},
        "/standards/catalog/a11y-1": {},
        "/md/standards/catalog/a11y-1.md": {},
      },
    };

    expect(deploymentRoutes(manifest)).toEqual([
      "/",
      "/index.md",
      "/llms.txt",
      "/overview",
      "/overview.md",
      "/standards/catalog/a11y-1",
      "/standards/catalog/a11y-1.md",
    ]);
  });

  it("rejects a manifest without a route table", () => {
    expect(() => deploymentRoutes({})).toThrow("routes object");
  });
});

describe("verifyDeployment", () => {
  it("checks every supplied route and rejects executable inline scripts", async () => {
    const fetchImpl = vi.fn(async (url) => {
      const pathname = new URL(url).pathname;
      if (pathname === "/unsafe") {
        return new Response("<script>window.bad = true</script>", {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      return new Response("ok", { status: pathname === "/missing" ? 404 : 200 });
    });

    const results = await verifyDeployment({
      base: "https://example.test",
      routes: ["/ok", "/unsafe", "/missing"],
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(results).toEqual([
      { route: "/ok", status: 200, ok: true, detail: "" },
      {
        route: "/unsafe",
        status: 200,
        ok: false,
        detail: "1 executable inline script(s)",
      },
      { route: "/missing", status: 404, ok: false, detail: "" },
    ]);
  });

  it("turns request failures into failed route results", async () => {
    const results = await verifyDeployment({
      base: "https://example.test",
      routes: ["/broken"],
      fetchImpl: async () => {
        throw new Error("network unavailable");
      },
    });

    expect(results).toEqual([
      { route: "/broken", status: "network unavailable", ok: false, detail: "" },
    ]);
  });

  it("limits simultaneous route checks", async () => {
    let active = 0;
    let maxActive = 0;
    const fetchImpl = vi.fn(async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return new Response("ok", { status: 200 });
    });

    await verifyDeployment({
      base: "https://example.test",
      routes: Array.from({ length: 8 }, (_, index) => `/route-${index}`),
      fetchImpl,
      concurrency: 2,
    });

    expect(maxActive).toBe(2);
  });
});
