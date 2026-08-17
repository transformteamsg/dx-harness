import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { externalizeNextInlineScripts } from "./externalize-next-inline-scripts.mjs";

const scratchDirs = [];

afterEach(() => {
  for (const dir of scratchDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function fixture(htmlByRoute) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "dx-harness-csp-"));
  scratchDirs.push(root);

  const appDir = path.join(root, "server", "app");
  const staticDir = path.join(root, "static");
  for (const [route, html] of Object.entries(htmlByRoute)) {
    const file = path.join(appDir, route);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }

  return { root, appDir, staticDir };
}

describe("externalizeNextInlineScripts", () => {
  it("fails when the Next.js prerendered output is missing", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "dx-harness-csp-"));
    scratchDirs.push(root);

    expect(() =>
      externalizeNextInlineScripts({
        appDir: path.join(root, "missing", "server", "app"),
        staticDir: path.join(root, "missing", "static"),
      }),
    ).toThrow("Next.js prerendered app output not found");
  });

  it("moves executable inline scripts to same-origin hashed assets", () => {
    const { appDir, staticDir } = fixture({
      "index.html": [
        "<!doctype html><body>",
        "<h1>Still server-rendered</h1>",
        "<script>(self.__next_f=self.__next_f||[]).push([0])</script>",
        "<script>self.__next_f.push([1,\"payload\"])</script>",
        "</body>",
      ].join(""),
    });

    const result = externalizeNextInlineScripts({ appDir, staticDir });
    const transformed = fs.readFileSync(path.join(appDir, "index.html"), "utf8");

    expect(result).toMatchObject({ htmlFilesChanged: 1, scriptsExternalized: 2 });
    expect(transformed).toContain("<h1>Still server-rendered</h1>");
    expect(transformed).not.toContain("<script>(self.__next_f");
    expect(transformed.match(/src="\/_next\/static\/csp-inline\/[a-f0-9]+\.js"/g)).toHaveLength(2);

    const assets = fs.readdirSync(path.join(staticDir, "csp-inline"));
    expect(assets).toHaveLength(2);
    expect(
      assets.map((asset) => fs.readFileSync(path.join(staticDir, "csp-inline", asset), "utf8")),
    ).toEqual(
      expect.arrayContaining([
        "(self.__next_f=self.__next_f||[]).push([0])",
        'self.__next_f.push([1,"payload"])',
      ]),
    );
  });

  it("keeps external, empty, and non-JavaScript data scripts unchanged", () => {
    const original = [
      "<!doctype html><body>",
      '<script src="/_next/static/chunks/app.js" async></script>',
      '<script id="empty"></script>',
      '<script id="data" type="application/json">{"theme":"light"}</script>',
      "</body>",
    ].join("");
    const { appDir, staticDir } = fixture({ "index.html": original });

    const result = externalizeNextInlineScripts({ appDir, staticDir });

    expect(result).toMatchObject({ htmlFilesChanged: 0, scriptsExternalized: 0 });
    expect(fs.readFileSync(path.join(appDir, "index.html"), "utf8")).toBe(original);
  });

  it("deduplicates identical payloads across prerendered routes", () => {
    const payload = "self.__next_f.push([1,\"shared\"])";
    const { appDir, staticDir } = fixture({
      "index.html": `<script>${payload}</script>`,
      "overview.html": `<main>Overview</main><script>${payload}</script>`,
    });

    const result = externalizeNextInlineScripts({ appDir, staticDir });

    expect(result).toMatchObject({ htmlFilesChanged: 2, scriptsExternalized: 2, assetsWritten: 1 });
    expect(fs.readdirSync(path.join(staticDir, "csp-inline"))).toHaveLength(1);
  });

  it("is safe to run again on an already externalized build", () => {
    const { appDir, staticDir } = fixture({
      "index.html": "<script>self.__next_f.push([1,\"payload\"])</script>",
    });

    const first = externalizeNextInlineScripts({ appDir, staticDir });
    const transformed = fs.readFileSync(path.join(appDir, "index.html"), "utf8");
    const second = externalizeNextInlineScripts({ appDir, staticDir });

    expect(first).toMatchObject({ scriptsExternalized: 1, assetsWritten: 1 });
    expect(second).toMatchObject({
      scriptsExternalized: 0,
      assetsWritten: 0,
      assetsReferenced: 1,
    });
    expect(fs.readFileSync(path.join(appDir, "index.html"), "utf8")).toBe(transformed);
    expect(fs.readdirSync(path.join(staticDir, "csp-inline"))).toHaveLength(1);
  });
});
