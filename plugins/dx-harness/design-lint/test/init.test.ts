import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* design-lint init finds the pages of a static HTML project, asks for the values
   that it cannot find, and writes design-lint.config.json. See issue #511. */

const PACKAGE = path.resolve(import.meta.dirname, "..");

const PAGE = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page</title></head>
<body><main><h1>Page</h1><p>Text.</p></main></body>
</html>
`;

/* A project folder with these files. A name that ends in .html gets a page. */
function project(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "design-lint-init-"));
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

const configOf = (dir: string) => path.join(dir, "design-lint.config.json");

/* The answers go to stdin, one line for each question. */
function init(dir: string, answers: string[]) {
  return spawnSync(process.execPath, ["src/cli.ts", "init", dir, "--config", configOf(dir)], {
    cwd: PACKAGE,
    encoding: "utf8",
    input: answers.map((a) => `${a}\n`).join(""),
  });
}

function readConfig(dir: string): Record<string, any> {
  return JSON.parse(fs.readFileSync(configOf(dir), "utf8"));
}

interface Note {
  code: string;
  kind: string;
  detail: string[];
}

function lint(dir: string, ...flags: string[]) {
  const run = spawnSync(process.execPath, ["src/cli.ts", dir, "--config", configOf(dir), "--json", ...flags], {
    cwd: PACKAGE,
    encoding: "utf8",
  });
  expect(run.stderr).toBe("");
  return JSON.parse(run.stdout) as { findings: { code: string }[]; notes: Note[] };
}

const unsetValues = (notes: Note[]) => notes.filter((n) => n.kind === "not-configured").flatMap((n) => n.detail);

describe("design-lint init on a static HTML project with no config", () => {
  const dir = project({ "index.html": PAGE, "about.html": PAGE, "help/index.html": PAGE });
  const run = init(dir, ["website"]);

  it("asks for the service type and writes the config", () => {
    expect(run.stderr).toBe("");
    expect(run.status).toBe(0);
    expect(run.stdout).toMatch(/service type/i);
    expect(fs.existsSync(configOf(dir))).toBe(true);
  });

  it("lists each page that it found, with the home page first", () => {
    expect(readConfig(dir).pages?.all).toEqual(["/", "/about.html", "/help/"]);
  });

  it("sets the service type to the answer", () => {
    expect(readConfig(dir).product?.serviceType).toBe("website");
  });

  it("leaves a run that lists only the values that are still unset", () => {
    const unset = unsetValues(lint(dir).notes);
    expect(unset).not.toEqual([]);
    expect(unset).not.toContain("serviceType");
    expect(unset).not.toContain("pages");
  });
});

describe("design-lint init on a config that already holds values", () => {
  it("keeps the values that the config holds, and adds only the keys that are missing", () => {
    const dir = project({ "index.html": PAGE, "about.html": PAGE });
    const existing = {
      select: ["BD"],
      product: { agencyName: "Agency" },
      rules: { "BD-4a": { maxGrade: 9 } },
    };
    fs.writeFileSync(configOf(dir), JSON.stringify(existing, null, 2));
    const run = init(dir, ["website"]);
    expect(run.stderr).toBe("");
    expect(run.status).toBe(0);
    const config = readConfig(dir);
    expect(config.select).toEqual(["BD"]);
    expect(config.rules).toEqual({ "BD-4a": { maxGrade: 9 } });
    expect(config.product).toEqual({ agencyName: "Agency", serviceType: "website" });
    expect(config.pages?.all).toEqual(["/", "/about.html"]);
  });

  it("does not change a service type or a page list that the config holds", () => {
    const dir = project({ "index.html": PAGE, "about.html": PAGE });
    const existing = { product: { serviceType: "transactional" }, pages: { all: ["/about.html"] } };
    fs.writeFileSync(configOf(dir), JSON.stringify(existing, null, 2));
    const run = init(dir, ["website", "/"]);
    expect(run.stderr).toBe("");
    expect(run.status).toBe(0);
    expect(readConfig(dir)).toEqual(existing);
  });
});

describe("design-lint init on a project where it finds no pages", () => {
  it("says that it found none, and writes the pages that the designer lists", () => {
    const dir = project({ "README.md": "# A project\n" });
    const run = init(dir, ["/start.html, /done.html", ""]);
    expect(run.stderr).toBe("");
    expect(run.status).toBe(0);
    expect(run.stdout).toMatch(/no pages/i);
    const config = readConfig(dir);
    expect(config.pages?.all).toEqual(["/start.html", "/done.html"]);
    expect(config.product?.serviceType).toBeUndefined();
    expect(run.stdout).toMatch(/serviceType/);
  });

  it("writes what it knows and lists the pages as unset when the designer lists none", () => {
    const dir = project({ "README.md": "# A project\n" });
    const run = init(dir, ["", "website"]);
    expect(run.stderr).toBe("");
    expect(run.status).toBe(0);
    expect(run.stdout).toMatch(/no pages/i);
    const config = readConfig(dir);
    expect(config.product?.serviceType).toBe("website");
    expect(config.pages?.all).toBeUndefined();
    expect(run.stdout.split("\n").some((line) => /^\s+\S+\s.*\bpages\b/.test(line))).toBe(true);
  });
});

describe("design-lint init on a single-page prototype", () => {
  const SEVERAL = ["BD-2a", "WO-11b"];
  const select = SEVERAL.flatMap((code) => ["--select", code]);
  const reported = (dir: string) => {
    const { findings, notes } = lint(dir, ...select);
    return [...findings.map((f) => f.code), ...notes.map((n) => n.code)].filter((c) => SEVERAL.includes(c));
  };

  it("lists the one page, and the rules that need several pages do not report", () => {
    const dir = project({ "index.html": PAGE });
    const run = init(dir, ["website"]);
    expect(run.stderr).toBe("");
    expect(run.status).toBe(0);
    expect(readConfig(dir).pages?.all).toEqual(["/"]);
    expect(reported(dir)).toEqual([]);
  });

  /* The proof that the rules ran: the same page twice makes both of them report. */
  it("reports from the same rules when the project has two pages", () => {
    const dir = project({ "index.html": PAGE, "about.html": PAGE });
    init(dir, ["website"]);
    const codes = lint(dir, ...select).findings.map((f) => f.code);
    expect(codes.sort()).toEqual([...SEVERAL].sort());
  });
});
