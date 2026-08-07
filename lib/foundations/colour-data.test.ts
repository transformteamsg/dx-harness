import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { indigo, orange, grass, amber, red } from "@radix-ui/colors";

/* Sync tests for the colour token mirror. app/globals.css declares the
   canonical --casesync, --glow, and functional (success/warning/danger)
   values; colour-data.ts (and this test) assert they still match the
   @radix-ui/colors package the colour foundations page claims to render
   from. These fail whenever one side moves without the other. */

function readGlobalsCss() {
  const file = path.join(process.cwd(), "app", "globals.css");
  return fs.readFileSync(file, "utf8");
}

function cssHex(css: string, token: string): string {
  const m = css.match(new RegExp(`--${token}:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!m) throw new Error(`--${token} not found in app/globals.css file`);
  return m[1].toLowerCase();
}

describe("colour tokens — CSS ↔ Radix sync", () => {
  const css = readGlobalsCss();

  it("--casesync matches Radix indigo-9", () => {
    expect(cssHex(css, "casesync")).toBe(indigo.indigo9.toLowerCase());
  });

  it("--glow matches Radix orange-9", () => {
    expect(cssHex(css, "glow")).toBe(orange.orange9.toLowerCase());
  });

  it("--success-9 matches Radix grass-9", () => {
    expect(cssHex(css, "success-9")).toBe(grass.grass9.toLowerCase());
  });

  it("--warning-9 matches Radix amber-9", () => {
    expect(cssHex(css, "warning-9")).toBe(amber.amber9.toLowerCase());
  });

  it("--danger-9 matches Radix red-9", () => {
    expect(cssHex(css, "danger-9")).toBe(red.red9.toLowerCase());
  });

  it("--success matches Radix grass-11", () => {
    expect(cssHex(css, "success")).toBe(grass.grass11.toLowerCase());
  });

  it("--danger matches Radix red-11", () => {
    expect(cssHex(css, "danger")).toBe(red.red11.toLowerCase());
  });

  /* --warning is deliberately darkened past Radix amber-11 (#ab6400) to
     #8a5300 — amber-11 alone caps ~4.6:1 even on white and fails AA on the
     tinted --warning-subtle background (rationale: app/globals.css:41). Do
     not assert this against amber.amber11. */
  it("--warning is the deliberately darkened #8a5300, not amber-11 directly", () => {
    expect(cssHex(css, "warning")).toBe("#8a5300");
  });
});
