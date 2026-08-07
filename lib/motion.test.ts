import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DUR, EASE_IN_OUT_POINTS, EASE_OUT_POINTS } from "./motion";

/* Sync tests for the motion token mirror. app/globals.css declares the
   canonical --motion-* durations and --ease-* beziers; lib/motion.ts mirrors
   them as numbers for motion/react. These tests fail whenever one side moves
   without the other (MOT-2). */

function readGlobalsCss() {
  const file = path.join(process.cwd(), "app", "globals.css");
  return fs.readFileSync(file, "utf8");
}

function cssDurationMs(css: string, token: string): number {
  const m = css.match(new RegExp(`--motion-${token}:\\s*(\\d+(?:\\.\\d+)?)ms;`));
  if (!m) throw new Error(`--motion-${token} not found in app/globals.css`);
  return Number(m[1]);
}

function cssBezierPoints(css: string, token: string): number[] {
  const m = css.match(
    new RegExp(`--ease-${token}:\\s*cubic-bezier\\(([^)]+)\\);`),
  );
  if (!m) throw new Error(`--ease-${token} not found in app/globals.css`);
  return m[1].split(",").map((p) => Number(p.trim()));
}

describe("motion tokens — CSS ↔ TS sync", () => {
  const css = readGlobalsCss();

  it("--motion-fast matches DUR.fast", () => {
    expect(cssDurationMs(css, "fast")).toBe(DUR.fast * 1000);
  });

  it("--motion-base matches DUR.base", () => {
    expect(cssDurationMs(css, "base")).toBe(DUR.base * 1000);
  });

  it("--motion-slow matches DUR.slow", () => {
    expect(cssDurationMs(css, "slow")).toBe(DUR.slow * 1000);
  });

  it("--motion-story matches DUR.story", () => {
    expect(cssDurationMs(css, "story")).toBe(DUR.story * 1000);
  });

  it("--ease-out matches EASE_OUT_POINTS", () => {
    expect(cssBezierPoints(css, "out")).toEqual([...EASE_OUT_POINTS]);
  });

  it("--ease-in-out matches EASE_IN_OUT_POINTS", () => {
    expect(cssBezierPoints(css, "in-out")).toEqual([...EASE_IN_OUT_POINTS]);
  });
});
