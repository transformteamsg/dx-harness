import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.ts";
import { lint } from "../src/lint.ts";
import { launchBrowser } from "../src/rendered.ts";
import type { Browser } from "playwright-core";
import { loadRules } from "../src/rules/load.ts";
import { developerName } from "../src/modules/tl/tl-5.ts";
import { globToRegExp } from "../src/modules/tl/tl-2.ts";
import { BASE } from "./helpers.ts";
import type { Config } from "../src/types.ts";

/* Cases that a fixture pair cannot show, because the pair shares one config:
   a host that is not .gov.sg, an exemption, the other branches of a check. */

const FIXTURES = path.resolve(import.meta.dirname, "../fixtures");
const { rules } = loadRules(BASE);
let shared: Browser | null = null;
try {
  shared = await launchBrowser();
} catch {
  shared = null;
}
afterAll(async () => {
  await shared?.close();
});

async function run(code: string, site: string, patch: Config) {
  const dir = path.join(FIXTURES, code);
  const base = loadConfig(path.join(dir, "config.json")) ?? {};
  const config: Config = {
    ...base,
    product: { ...base.product, ...patch.product },
    rules: { ...base.rules, ...Object.fromEntries(Object.entries(patch.rules ?? {}).map(([k, v]) => [k, { ...base.rules?.[k], ...v }])) },
  };
  return lint({
    rules,
    config,
    configDir: dir,
    paths: [path.join(dir, site)],
    surfaces: ["source", "project", "rendered"],
    select: [code],
    ignore: [],
    ci: false,
    browser: shared ?? undefined,
  });
}

describe("TL-1a", () => {
  it("fails a host that is not .gov.sg, and accepts .edu.sg for an education institution", async () => {
    const bad = await run("TL-1a", "pass", { product: { productUrl: "https://example.com" } });
    expect(bad.findings.map((f) => f.message).join()).toMatch(/example\.com/);
    const edu = { product: { productUrl: "https://school.edu.sg", institutionType: "education" } };
    expect((await run("TL-1a", "pass", edu)).findings).toEqual([]);
    const eduOnly = { product: { productUrl: "https://school.edu.sg", institutionType: "agency" } };
    expect((await run("TL-1a", "pass", eduOnly)).findings.length).toBeGreaterThan(0);
  });
});

describe("TL-3 and TL-4 on a host that is not .gov.sg", () => {
  const other = { product: { productUrl: "https://example.com" } };
  it("TL-3b skips", async () => {
    expect((await run("TL-3b", "fail", other)).findings).toEqual([]);
  });
  for (const code of ["TL-3a", "TL-4a", "TL-4b"]) {
    it.skipIf(shared === null)(`${code} skips`, async () => {
      expect((await run(code, "fail", other)).findings).toEqual([]);
    });
  }
  it("TL-3b skips when customisable is false", async () => {
    expect((await run("TL-3b", "fail", { product: { customisable: false } })).findings).toEqual([]);
  });
});

describe("TL-2d", () => {
  it("fails when the glob matches no file", async () => {
    const r = await run("TL-2d", "pass", { rules: { "TL-2d": { logoFiles: "nothing/*.svg" } } });
    expect(r.findings.length).toBe(1);
  });
  it("matches globs", () => {
    expect(globToRegExp("a/**/b*.svg").test("a/x/y/bc.svg")).toBe(true);
    expect(globToRegExp("a/*.svg").test("a/x/c.svg")).toBe(false);
  });
});

describe("TL-5 and TL-6 on another service type", () => {
  for (const code of ["TL-5a", "TL-5b", "TL-6a"]) {
    it(`${code} skips a website`, async () => {
      expect((await run(code, "fail", { rules: { [code]: { serviceType: "website" } } })).findings).toEqual([]);
    });
  }
  it("TL-6c fails when no manifest exists", async () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), "tl6c-"));
    const r = await lint({
      rules, config: { product: { agencyName: "A" } }, configDir: empty, paths: [empty],
      surfaces: ["project"], select: ["TL-6c"], ignore: [], ci: false,
    });
    expect(r.findings.length).toBe(1);
  });
  it("reads a developer name by format", () => {
    expect(developerName("a.json", '{"expo":{"author":{"name":"X"}}}')).toBe("X");
    expect(developerName("a.plist", "<key>DeveloperName</key><string>Y</string>")).toBe("Y");
    expect(developerName("a.xml", '<meta-data android:value="Z" android:name="developer"/>')).toBe("Z");
    expect(developerName("a.xml", "<manifest/>")).toBeNull();
  });
});

describe("TL-4d external links", () => {
  it("checks an external link only when checkExternal is true, against a local server", async () => {
    const server = http.createServer((req, res) => {
      res.statusCode = req.url === "/ok" ? 200 : 404;
      res.end();
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const { port } = server.address() as { port: number };
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tl4d-"));
    fs.writeFileSync(
      path.join(dir, "index.html"),
      `<footer><a href="http://127.0.0.1:${port}/ok">A</a><a href="http://127.0.0.1:${port}/gone">B</a></footer>`,
    );
    const go = (checkExternal: boolean) =>
      lint({
        rules, config: { rules: { "TL-4d": { checkExternal } } }, configDir: dir, paths: [dir],
        surfaces: ["project"], select: ["TL-4d"], ignore: [], ci: false,
      });
    try {
      expect((await go(false)).findings).toEqual([]);
      const found = (await go(true)).findings;
      expect(found.length).toBe(1);
      expect(found[0].message).toMatch(/404/);
    } finally {
      server.close();
    }
  });
});
