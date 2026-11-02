import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { lint } from "../src/lint.ts";
import { cssMotion, classMotion } from "../src/modules/mot/scan.ts";
import { loadRules } from "../src/rules/load.ts";
import type { Config } from "../src/types.ts";
import { BASE } from "./helpers.ts";

/* Cases that a fixture pair cannot show, because the pair shares one config:
   a project with no motion token set, and the parts of a value that the scanner skips. */

const { rules } = loadRules(BASE);

function site(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-mot-"));
  for (const [name, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), text);
  }
  return dir;
}

const run = (dir: string, code: string, config: Config = {}) =>
  lint({ rules, config, configDir: dir, paths: [dir], surfaces: ["source"], select: [code], ignore: [], ci: false });

describe("MOT-2a", () => {
  it("does not apply to a project that declares no motion token set", async () => {
    const dir = site({ "styles.css": ".panel { transition: opacity 350ms cubic-bezier(0.4, 0, 0.2, 1); }\n" });
    expect((await run(dir, "MOT-2a")).findings).toEqual([]);
  });

  it("applies when a custom property defines a motion token", async () => {
    const dir = site({ "styles.css": ":root { --motion-fast: 150ms; }\n.panel { transition: opacity 350ms ease-out; }\n" });
    expect((await run(dir, "MOT-2a")).findings.map((f) => [f.line, f.column])).toEqual([[2, 30]]);
  });

  it("reads only the files of componentFiles", async () => {
    const dir = site({ "tokens.css": ":root { --motion-fast: 150ms; }\n", "vendor/lib.css": ".x { transition: opacity 350ms; }\n" });
    const config: Config = { rules: { "MOT-2a": { componentFiles: ["src/**"] } } };
    expect((await run(dir, "MOT-2a", config)).findings).toEqual([]);
  });
});

describe("MOT-1a", () => {
  it("reads the first time of an item as its duration, and a second time as a delay", () => {
    const values = cssMotion(".a { transition: opacity 200ms ease-out 900ms; }", 0);
    expect(values.map((v) => v.ms)).toEqual([200]);
  });

  it("does not read a time inside a cubic-bezier as a duration", () => {
    const values = cssMotion(".a { transition-timing-function: cubic-bezier(0.2, 0, 0, 1); }", 0);
    expect(values.map((v) => v.kind)).toEqual(["easing"]);
  });

  it("finds an overshooting curve in a Tailwind ease class, and passes a curve that does not", () => {
    expect(classMotion("ease-[cubic-bezier(0.3,1.6,0.5,1)]", 0)[0].overshoots).toBe(true);
    expect(classMotion("ease-[cubic-bezier(0.2,0,0,1)]", 0)[0].overshoots).toBe(false);
  });

  it("reads the minMs and maxMs of the config", async () => {
    const dir = site({ "styles.css": ".panel { transition: opacity 400ms ease-out; }\n" });
    expect((await run(dir, "MOT-1a", { rules: { "MOT-1a": { maxMs: 500 } } })).findings).toEqual([]);
  });
});
