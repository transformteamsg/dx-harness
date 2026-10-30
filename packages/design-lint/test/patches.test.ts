import fs from "node:fs";
import { describe, expect, it } from "vitest";
import type { Config } from "../src/types.ts";
import { applyPatch, patchedConfig } from "../src/patch.ts";
import { modules } from "../src/registry.ts";
import { BASE, compare } from "./helpers.ts";
import { browser, checkPatch, config, copySite, everyCode, needsBrowser, patches, rules, run } from "./demo-site.ts";
import packageConfig from "../vitest.config.ts";

/* The tests of each break patch are in category.test.ts. */

describe("the demo site", () => {
  it.skipIf(!browser)("passes every rule that exists", async () => {
    const result = await run(copySite(), everyCode);
    expect(result.findings).toEqual([]);
    expect(result.notes).toEqual([]);
  });

  it("has a break patch for each rule that has a module", () => {
    const withModule = modules.map((m) => m.code).sort();
    expect([...everyCode].sort()).toEqual(withModule);
  });
});

/* Vitest runs the file of each project in a worker of its own, which starts a
   browser of its own, so the categories run side by side. */
describe("the config of the package", () => {
  it("runs the break patches of each category in a project of its own", () => {
    const folders = fs
      .readdirSync(BASE, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    const projects = (packageConfig.test?.projects ?? []) as { test?: { include?: string[]; provide?: { category?: string } } }[];
    const categories = projects.filter((p) => p.test?.include?.some((f) => f.endsWith("test/category.test.ts"))).map((p) => p.test?.provide?.category);
    expect(categories.sort()).toEqual(folders.sort());
    const prefixes = [...new Set(everyCode.map((c) => c.split("-")[0].toLowerCase()))];
    expect(prefixes.filter((p) => !folders.includes(p))).toEqual([]);
  });
});

describe("a break patch", () => {
  it("names the patch and its findings when it makes a finding that it does not expect", async () => {
    const patch = patches.find((p) => !needsBrowser(p.code) && p.expect.length > 0)!;
    const finding = patch.expect[0];
    await expect(checkPatch({ ...patch, expect: [] })).rejects.toThrow(new RegExp(`${patch.code}[\\s\\S]*${finding.file}`));
  });

  it("fails when the text to replace is not found exactly once", () => {
    const site = copySite();
    const bad = { ...patches[0], edits: [{ file: "index.html", find: "this text is not on the page", replace: "" }] };
    expect(() => applyPatch(site, bad)).toThrow(/has 0 matches/);
  });
});

describe("the failing site", () => {
  /* Patches that edit the same file change each other's results, so the failing
     site holds only the patches that share no file with another patch. An
     exclusive patch is left out too. BD-2a removes the search form that other rules
     need. WU-5a makes a page submit when a field gets focus, and other rules focus
     every field. */
  const changedBy = new Map<string, Set<string>>();
  for (const patch of patches) changedBy.set(patch.code, new Set(applyPatch(copySite(), patch)));
  const together = patches.filter((patch) => {
    if (patch.exclusive) return false;
    return patches.every((other) => other === patch || other.exclusive || [...changedBy.get(patch.code)!].every((f) => !changedBy.get(other.code)!.has(f)));
  });

  /* Most patches share a file with another one: a page that several rules need, or a
     stylesheet. The failing site holds the rest, and it must not be empty. */
  it("holds some patches", () => {
    expect(together.length).toBeGreaterThan(0);
  });

  it.skipIf(!browser)("is the passing site with those patches applied, and every expected finding is there", async () => {
    const site = copySite();
    for (const patch of together) applyPatch(site, patch);
    const merged = together.reduce<Config>((c, p) => patchedConfig(c, p), config);
    const result = await run(site, everyCode, merged);
    /* The file and the rule only: the patches shift each other's lines, and the
       single-patch tests above check the positions and the extra findings. */
    const wanted = together.flatMap((p) => p.expect.map((e) => ({ file: e.file, code: e.code ?? p.code })));
    expect(compare(result.findings, site, rules, wanted).missing).toEqual([]);
  });

  it("leaves out only the patches that are marked exclusive", () => {
    /* The patches that may be exclusive, in the categories that exist so far. */
    const known = ["BD-2a", "WU-5a"].filter((code) => patches.some((p) => p.code === code));
    expect(patches.filter((p) => p.exclusive).map((p) => p.code)).toEqual(known);
  });
});
