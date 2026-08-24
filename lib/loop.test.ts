import { describe, expect, it } from "vitest";
import { LOOP_PHASES } from "@/components/diagrams/loop-data";

/* Shape tests for the design-loop phase data. The OrbitLoop diagram and the
   loop page both lean on this module being exactly six ordered phases with
   one plan approval; content/harness/loop.mdx no longer restates the phases,
   so this data is the only copy of record. */

describe("LOOP_PHASES", () => {
  it("has exactly six phases", () => {
    expect(LOOP_PHASES.length).toBe(6);
  });

  it("numbers the phases 1–6, unique and in order", () => {
    expect(LOOP_PHASES.map((p) => p.n)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("has exactly one approval stop: plan at n=3", () => {
    const gated = LOOP_PHASES.filter((p) => p.gate !== undefined);
    expect(gated.length).toBe(1);
    expect(LOOP_PHASES.find((p) => p.n === 3)?.gate).toBe("plan");
  });

  it("gives every phase a non-empty label, note, detail, and you line", () => {
    for (const p of LOOP_PHASES) {
      expect(p.label.trim().length).toBeGreaterThan(0);
      expect(p.note.trim().length).toBeGreaterThan(0);
      expect(p.detail.trim().length).toBeGreaterThan(0);
      expect(p.you.trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps every ring note at six words or fewer", () => {
    for (const p of LOOP_PHASES) {
      expect(p.note.trim().split(/\s+/).length).toBeLessThanOrEqual(6);
    }
  });
});
