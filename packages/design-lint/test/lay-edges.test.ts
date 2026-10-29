import { describe, expect, it } from "vitest";
import { lay1a, trackCount } from "../src/modules/lay/lay-1.ts";

/* The track counts that the LAY-1a fixtures do not reach. */
describe("trackCount", () => {
  it.each([
    ["repeat(2, minmax(0, 1fr))", 2],
    ["repeat(2, 1fr 2fr)", 4],
    ["minmax(10rem, 1fr) 3fr", 2],
    ["[full-start] 1fr [content-start] 4fr [content-end] 1fr [full-end]", 3],
    ["fit-content(20rem) 1fr", 2],
  ])("counts %s as %i tracks", (value, tracks) => {
    expect(trackCount(value)).toBe(tracks);
  });

  it.each(["none", "subgrid", "repeat(auto-fit, 10rem)", "var(--cols)", "repeat(var(--n), 1fr)", "inherit"])(
    "does not count %s",
    (value) => {
      expect(trackCount(value)).toBeNull();
    },
  );
});

describe("LAY-1a decide", () => {
  const decide = (tracks: number) => lay1a.decide({ file: "a.css", line: 1, column: 1, data: { tracks } }, { gridColumns: 12 });

  it("passes a count that divides the grid, and the full grid", () => {
    expect(decide(1)).toBeNull();
    expect(decide(12)).toBeNull();
  });

  it("fails a count that does not divide the grid, and a count above it", () => {
    expect(decide(5)).toMatch(/5 columns/);
    expect(decide(24)).toMatch(/24 columns/);
  });
});
