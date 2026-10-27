import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig, mergeConfig } from "../src/config.ts";

function write(dir: string, name: string, obj: unknown) {
  fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
  fs.writeFileSync(path.join(dir, name), JSON.stringify(obj));
}

describe("mergeConfig", () => {
  it("unions select and page groups, and merges rules by parameter", () => {
    const merged = mergeConfig(
      { select: ["BD-1a"], pages: { all: ["/"] }, rules: { "BD-4a": { maxGrade: 9, locale: "en" } } },
      { select: ["WP-1a", "BD-1a"], pages: { all: ["/x"], entry: ["/"] }, rules: { "BD-4a": { maxGrade: 7 } } },
    );
    expect(merged.select).toEqual(["BD-1a", "WP-1a"]);
    expect(merged.pages).toEqual({ all: ["/", "/x"], entry: ["/"] });
    expect(merged.rules).toEqual({ "BD-4a": { maxGrade: 7, locale: "en" } });
  });

  it("lets the later product value win", () => {
    expect(mergeConfig({ product: { a: 1, b: 1 } }, { product: { b: 2 } }).product).toEqual({ a: 1, b: 2 });
  });
});

describe("loadConfig with extends", () => {
  it("loads each extended file first and merges the file over them", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-cfg-"));
    write(dir, "parts/wp.json", { select: ["WP-1a"], pages: { all: ["/wp"] } });
    write(dir, "parts/wo.json", { select: ["WO-1a"], rules: { "WO-1a": { x: 1 } } });
    write(dir, "base.json", { extends: ["parts/wp.json", "parts/wo.json"], select: ["BD-1a"], serve: "site" });
    const cfg = loadConfig(path.join(dir, "base.json"));
    expect(cfg?.select).toEqual(["WP-1a", "WO-1a", "BD-1a"]);
    expect(cfg?.pages).toEqual({ all: ["/wp"] });
    expect(cfg?.serve).toBe("site");
    expect(cfg?.extends).toBeUndefined();
  });

  it("keeps the page list of the file ahead of the pages that a fragment adds", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-cfg-"));
    write(dir, "parts/wp.json", { pages: { all: ["/wp", "/shared"] } });
    write(dir, "base.json", { extends: ["parts/wp.json"], pages: { all: ["/", "/shared"] } });
    expect(loadConfig(path.join(dir, "base.json"))?.pages?.all).toEqual(["/", "/shared", "/wp"]);
  });

  it("fails when an extended file does not exist", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-cfg-"));
    write(dir, "base.json", { extends: ["missing.json"] });
    expect(() => loadConfig(path.join(dir, "base.json"))).toThrow(/does not exist/);
  });
});
