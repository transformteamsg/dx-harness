import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* An agent judges a capture from a copy scaled to the width the capture
   procedure names, and the full-size file stays the source for crops. Diverge
   writes wireframe pages when a person asks for rough directions. The scaling
   runs against throwaway frames, and the prose checks guard which file each
   reader opens. See issue #480. */

const ROOT = process.cwd();
const HARNESS = "plugins/dx-harness";
const SCRIPT = path.join(ROOT, HARNESS, "scripts/scale-capture.py");
const PROCEDURE = `${HARNESS}/procedures/capture.md`;
const CRITIQUE = `${HARNESS}/skills/design/dx-design-critique/critique.md`;
const PASS = `${HARNESS}/skills/design/dx-design-critique/pass.md`;
const REPORT = `${HARNESS}/skills/design/dx-design-critique/report.md`;
const VERIFY = `${HARNESS}/skills/design/dx-design-execute/verify.md`;
const AGENT = `${HARNESS}/agents/dx-design-review.md`;
const DIVERGE = `${HARNESS}/skills/design/dx-design-execute/references/diverge.md`;

/* The width the procedure names, written out here so the expected side does
   not come from the code under test. */
const WIDTH = 1280;

/* A tolerant read, because the implementation half writes some of this
   prose. A missing file reads as empty and fails an assertion. */
function flat(file: string) {
  const full = path.join(ROOT, file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8").replace(/\s+/g, " ") : "";
}

function python(args: string[], env: NodeJS.ProcessEnv = process.env) {
  const run = spawnSync("python3", args, { cwd: ROOT, encoding: "utf8", env });
  return { status: run.status, out: `${run.stdout ?? ""}${run.stderr ?? ""}`, stdout: run.stdout ?? "" };
}

/* A throwaway PNG frame of the given size, made with Pillow. */
function frame(width: number, height: number) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scale-capture-"));
  const file = path.join(dir, `${width}-home.png`);
  const made = python(["-c", `from PIL import Image; Image.new("RGB", (${width}, ${height}), "white").save(${JSON.stringify(file)})`]);
  if (made.status !== 0) throw new Error(`could not make a test frame: ${made.out}`);
  return file;
}

function size(file: string) {
  const read = python(["-c", `from PIL import Image; print(*Image.open(${JSON.stringify(file)}).size)`]);
  if (read.status !== 0) throw new Error(read.out);
  return read.stdout.trim().split(" ").map(Number);
}

/* The PNG files in a frame's directory. */
function pngs(file: string) {
  return fs.readdirSync(path.dirname(file)).filter((name) => name.endsWith(".png")).sort();
}

/* The paths the command prints, one to a line, for the agent to read. */
function printed(stdout: string) {
  return stdout.split("\n").map((line) => line.trim()).filter((line) => line.endsWith(".png"));
}

/* Contract item 1: an agent reads a scaled copy, and crops come from the
   full-size file. */
describe("1. an agent judges a 1280 capture from a scaled copy", () => {
  it("writes a copy no wider than the named width and keeps the full-size file", () => {
    const original = frame(2 * WIDTH, 1800);
    const before = fs.readFileSync(original);
    const run = python([SCRIPT, "--width", String(WIDTH), original]);
    expect(run.status, run.out).toBe(0);
    const [copy] = printed(run.stdout);
    expect(copy, "the command prints no path to read").toBeDefined();
    expect(path.resolve(copy)).not.toBe(path.resolve(original));
    expect(size(copy)).toEqual([WIDTH, 900]);
    expect(fs.readFileSync(original).equals(before), "the full-size file changed").toBe(true);
  });

  it("scales to 1280 when no width is given", () => {
    const original = frame(2 * WIDTH, 400);
    const run = python([SCRIPT, original]);
    expect(run.status, run.out).toBe(0);
    expect(size(printed(run.stdout)[0])[0]).toBe(WIDTH);
  });

  it("writes no copy of a frame that is already within the width, and prints the frame itself", () => {
    const original = frame(360, 800);
    const run = python([SCRIPT, "--width", String(WIDTH), original]);
    expect(run.status, run.out).toBe(0);
    expect(printed(run.stdout).map((p) => path.resolve(p))).toEqual([path.resolve(original)]);
    expect(pngs(original)).toEqual(["360-home.png"]);
  });

  it("prints one path for each frame, in the order given", () => {
    const wide = frame(2 * WIDTH, 400);
    const narrow = frame(720, 400);
    const run = python([SCRIPT, wide, narrow]);
    expect(run.status, run.out).toBe(0);
    expect(printed(run.stdout)).toHaveLength(2);
    expect(path.dirname(printed(run.stdout)[0])).toBe(path.dirname(wide));
    expect(path.dirname(printed(run.stdout)[1])).toBe(path.dirname(narrow));
  });

  it("the capture procedure names the width and runs the command on each frame", () => {
    const procedure = flat(PROCEDURE);
    expect(procedure.length, `${PROCEDURE} is missing or empty`).toBeGreaterThan(0);
    expect(procedure, "the procedure does not run the scaling command").toContain("scale-capture.py");
    expect(procedure, "the procedure does not name the width").toMatch(new RegExp(`--width ${WIDTH}`));
    expect(procedure, "the procedure does not add the scaled copy to the capture set").toMatch(/scaled cop(y|ies)/i);
  });

  it.each([CRITIQUE, PASS, VERIFY])("%s judges from the scaled copy", (file) => {
    const text = flat(file);
    expect(text.length, `${file} is missing or empty`).toBeGreaterThan(0);
    expect(text, `${file} does not name the scaled copy`).toMatch(/scaled cop(y|ies)/i);
    expect(text, `${file} does not point at the capture procedure`).toContain("capture.md");
  });

  it("the reviewer grades from the scaled copies", () => {
    const agent = flat(AGENT);
    expect(agent.length, `${AGENT} is missing or empty`).toBeGreaterThan(0);
    expect(agent, "the reviewer does not read the scaled copies").toMatch(/scaled cop(y|ies)/i);
  });

  it("the report crops from the full-size file, not the scaled copy", () => {
    const report = flat(REPORT);
    expect(report.length, `${REPORT} is missing or empty`).toBeGreaterThan(0);
    expect(report, "the report does not crop from the full-size file").toMatch(/crop[^.]*full-size/i);
    expect(report, "the report does not keep crops off the scaled copy").toMatch(/never crop from (the|a) scaled copy/i);
  });
});
