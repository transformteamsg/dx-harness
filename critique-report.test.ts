import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* A script builds the critique report from a findings file and this run's
   captures, so the agent writes no base64. The agent checks the crops on the
   contact sheet the script writes. The script runs against throwaway captures,
   and the prose checks guard what the report step tells the agent to do. See
   issue #455. */

const ROOT = process.cwd();
const HARNESS = "plugins/dx-harness";
const SCRIPT = path.join(ROOT, HARNESS, "scripts/critique-report.py");
const REPORT = `${HARNESS}/skills/design/dx-design-critique/report.md`;
const INSTALL = "python3 -m pip install --user Pillow";

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

function size(file: string) {
  const read = python(["-c", `from PIL import Image; print(*Image.open(${JSON.stringify(file)}).size)`]);
  if (read.status !== 0) throw new Error(read.out);
  return read.stdout.trim().split(" ").map(Number);
}

/* A throwaway run directory: two full-size captures at a device pixel ratio
   of 2, and a findings file that names them. Box coordinates are in the
   pixels of the scaled copy the agent judged from. */
function run() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "critique-report-"));
  fs.mkdirSync(path.join(dir, "captures"));
  for (const page of ["home", "class"]) {
    const file = path.join(dir, "captures", `1280-${page}.png`);
    const made = python(["-c", `from PIL import Image; Image.new("RGB", (2560, 1800), "white").save(${JSON.stringify(file)})`]);
    if (made.status !== 0) throw new Error(`could not make a test capture: ${made.out}`);
  }
  const findings = {
    title: "Teacher workspace home",
    product: "tw",
    catalogue: "1.4.0",
    date: "2026-10-26",
    facts: [
      ["Run URL", "http://localhost:3000/"],
      ["Pages captured", "Home and Class at 1280"],
      ["Checks run", "rendered-check.py"],
      ["Catalogue coverage", "56 rules"],
    ],
    verdict: "The page is calm, but the header drifts between pages.",
    suggestions: [
      { id: "S1", text: "Use one header on every page", fixes: ["F1"], controls: ["LAY-5"], impact: "High", cost: "S", quickWin: true },
      { id: "S2", text: "Raise the contrast of the hint text", fixes: ["F2", "F3"], controls: ["A11Y-1"], impact: "Med", cost: "S", quickWin: false },
    ],
    declined: "None.",
    upstream: "None.",
    findings: [
      {
        id: "F1",
        title: "The header drifts between pages",
        tier: "L1",
        controls: ["LAY-5"],
        fix: "S1",
        text: "The header is 64 pixels tall on Home and 80 on Class.",
        crops: [
          { capture: "captures/1280-home.png", page: "Home", region: [0, 0, 1280, 200], box: [20, 10, 600, 64] },
          { capture: "captures/1280-class.png", page: "Class", region: [0, 0, 1280, 200], box: [20, 10, 600, 80] },
        ],
      },
      {
        id: "F2",
        title: "The hint text is <faint>",
        tier: "L0",
        controls: ["A11Y-1"],
        fix: "S2",
        text: "The hint text has a contrast ratio of 3.1 to 1.",
        crops: [{ capture: "captures/1280-home.png", page: "Home", region: [100, 300, 600, 300], box: [120, 340, 300, 24] }],
      },
    ],
    codeFindings: [{ id: "F3", tier: "L0", text: "The hint colour is hard-coded", location: "src/Hint.tsx:12", fix: "S2" }],
    coverage: [
      { rule: "A11Y-1", verdict: "fail", note: "The hint text fails." },
      { rule: "LAY-5", verdict: "partial", note: "The header drifts." },
      { rule: "MOT-1", verdict: "verify", note: "The 360 width did not capture." },
    ],
    preserve: ["The rounded card corners are deliberate."],
    captures: [
      { path: "captures/1280-home.png", caption: "Home at 1280" },
      { path: "captures/1280-class.png", caption: "Class at 1280" },
    ],
  };
  const file = path.join(dir, "findings.json");
  fs.writeFileSync(file, JSON.stringify(findings, null, 2));
  return { dir, file, out: path.join(dir, "report") };
}

/* The path the script prints after a label, such as "report: <path>". */
function printed(stdout: string, label: string) {
  const line = stdout.split("\n").find((l) => l.startsWith(`${label}: `));
  return line?.slice(label.length + 2).trim();
}

/* The data URIs embedded in the report. */
function dataUris(html: string) {
  return html.match(/data:image\/png;base64,[A-Za-z0-9+/=]+/g) ?? [];
}

/* Contract item 1: a script makes the HTML from the findings and the crops. */
describe("1. a script builds the report", () => {
  it("writes a self-contained report from the findings file", () => {
    const r = run();
    const build = python([SCRIPT, r.file, "--out", r.out]);
    expect(build.status, build.out).toBe(0);
    const report = printed(build.stdout, "report");
    expect(report, "the script prints no report path").toBeDefined();
    const html = fs.readFileSync(report!, "utf8");
    /* Two crops for F1 stack into one image, one crop for F2, and two
       appendix captures. */
    expect(dataUris(html).length).toBeGreaterThanOrEqual(4);
    expect(html, "the report makes an external request").not.toMatch(/(src|href)=["']?(https?:)?\/\/[^"']*\.(png|css|js)|<link[^>]+stylesheet|@import/i);
    expect(html, "the report has no dark theme").toMatch(/prefers-color-scheme:\s*dark/);
    expect(html, "the report has no theme override").toMatch(/data-theme/);
  });

  it("keeps the locked document structure, in order", () => {
    const r = run();
    const build = python([SCRIPT, r.file, "--out", r.out]);
    expect(build.status, build.out).toBe(0);
    const html = fs.readFileSync(printed(build.stdout, "report")!, "utf8");
    const order = [
      "Teacher workspace home",
      "no code changed",
      "Run URL",
      "reply with S-numbers to approve",
      "Use one header on every page",
      "The header drifts between pages",
      "src/Hint.tsx:12",
      "MOT-1",
      "The rounded card corners are deliberate.",
      "Class at 1280",
    ];
    const at = order.map((text) => html.indexOf(text));
    at.forEach((index, i) => expect(index, `the report does not carry "${order[i]}"`).toBeGreaterThan(-1));
    expect([...at].sort((a, b) => a - b), "the sections are out of order").toEqual(at);
    expect(html, "the quick-win line is missing").toMatch(/approving .quick wins. takes all 1/i);
  });

  it("escapes the text from the findings file", () => {
    const r = run();
    const build = python([SCRIPT, r.file, "--out", r.out]);
    expect(build.status, build.out).toBe(0);
    const html = fs.readFileSync(printed(build.stdout, "report")!, "utf8");
    expect(html).toContain("&lt;faint&gt;");
    expect(html).not.toContain("<faint>");
  });

  it("the report step runs the script, and the agent writes no base64", () => {
    const report = flat(REPORT);
    expect(report.length, `${REPORT} is missing or empty`).toBeGreaterThan(0);
    expect(report, "the report step does not run the script").toContain("critique-report.py");
    expect(report, "the report step does not name the findings file").toMatch(/findings file/i);
    expect(report, "the report step lets the agent write base64").toMatch(/never write (base64|a data URI)/i);
  });
});

/* Contract item 2: the agent checks the crops on the contact sheet only. */
describe("2. the agent reads the contact sheet only", () => {
  it("writes one contact sheet that holds every crop", () => {
    const r = run();
    const build = python([SCRIPT, r.file, "--out", r.out]);
    expect(build.status, build.out).toBe(0);
    const sheet = printed(build.stdout, "contact sheet");
    expect(sheet, "the script prints no contact sheet path").toBeDefined();
    expect(fs.existsSync(sheet!), "the contact sheet is missing").toBe(true);
    const [width, height] = size(sheet!);
    expect(width).toBeGreaterThan(0);
    /* Two findings with crops: the sheet is taller than one crop row. */
    expect(height).toBeGreaterThan(200);
  });

  it("the report step reads the contact sheet and does not read each crop again", () => {
    const report = flat(REPORT);
    expect(report, "the report step does not read the contact sheet").toMatch(/read the contact sheet/i);
    expect(report, "the report step reads each crop again").toMatch(/do not read (each|the) crops? (again|one by one|separately)/i);
  });
});

/* Contract item 3: no Pillow, no report. */
describe("3. the report script stops when Pillow is not installed", () => {
  /* A PIL package that fails to import, ahead of the real one on the path. */
  function withoutPillow() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "no-pillow-"));
    fs.mkdirSync(path.join(dir, "PIL"));
    fs.writeFileSync(path.join(dir, "PIL", "__init__.py"), 'raise ImportError("No module named PIL")\n');
    return { ...process.env, PYTHONPATH: dir };
  }

  it("exits with an error that names the install step and writes no report", () => {
    const r = run();
    const build = python([SCRIPT, r.file, "--out", r.out], withoutPillow());
    expect(build.status).not.toBe(0);
    expect(build.status, "a missing Pillow is a tool failure, not success").not.toBeNull();
    expect(build.out).toContain(INSTALL);
    expect(printed(build.stdout, "report"), "the script printed a report path").toBeUndefined();
    expect(fs.existsSync(path.join(r.out, "report.html")), "a report was written").toBe(false);
  });

  it("the report step stops when the script exits with an error", () => {
    const report = flat(REPORT);
    expect(report, "the report step does not stop on a script error").toMatch(/critique-report\.py[^.]*exits with an error[^.]*stop/i);
    expect(report, "the report step lost the placeholder rule").toMatch(/never ship a report with placeholder images/i);
  });
});
