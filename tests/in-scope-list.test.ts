import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* Structural checks for the design skills reading the in-scope rule list
   instead of all of `standards/catalog.yaml`. A skill run decides what it
   reads, so nothing here can exercise a live run. These guard the prose that
   decides it: that every run gets its list from `scripts/in-scope-rules.py`,
   reads only the detail files that list names, reports the selection, and
   stops when the command fails. The command itself is covered by
   `in-scope-rules.test.ts`. See issue #478. */

const HARNESS = "plugins/dx-harness";
const MECHANICS = `${HARNESS}/procedures/catalogue-mechanics.md`;
const COMMAND = "in-scope-rules.py";

function read(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

function flat(file: string) {
  return read(file).replace(/\s+/g, " ");
}

function markdownUnder(dir: string): string[] {
  return fs.readdirSync(path.join(process.cwd(), dir), { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(dir, file));
}

/* The text of one `## ` section, from its heading to the next. */
function section(file: string, heading: string) {
  const text = read(file);
  const start = text.indexOf(`## ${heading}`);
  expect(start, `${file} has no "## ${heading}" section`).toBeGreaterThanOrEqual(0);
  const end = text.indexOf("\n## ", start + 1);
  return text.slice(start, end === -1 ? undefined : end).replace(/\s+/g, " ");
}

const LIST = "The in-scope list";

/* The files a run starts from, and the flags each one passes. A build covers
   every phase and every surface, so it narrows by product and audience only.
   A pass narrows to its dimension. */
const STARTERS = [
  { file: `${HARNESS}/skills/design/dx-design-execute/SKILL.md`, flags: ["--product", "--audience"], not: ["--phase", "--surface", "--dimension"] },
  { file: `${HARNESS}/skills/design/dx-design-critique/SKILL.md`, flags: ["--phase verify", "--product", "--audience"], not: ["--dimension"] },
  { file: `${HARNESS}/skills/design/dx-design-critique/pass.md`, flags: ["--dimension", "--phase verify"], not: [] },
  { file: `${HARNESS}/procedures/capture.md`, flags: ["--dimension", "--phase verify"], not: [] },
  { file: `${HARNESS}/skills/design/dx-design-language/SKILL.md`, flags: ["--product"], not: ["--dimension"] },
];

/* The files that use a list a run already has. */
const USERS = [
  `${HARNESS}/skills/design/dx-design/SKILL.md`,
  `${HARNESS}/skills/design/dx-design-execute/grill.md`,
  `${HARNESS}/procedures/implement.md`,
  `${HARNESS}/procedures/design-review.md`,
  `${HARNESS}/agents/dx-design-review.md`,
];

describe("1. a run reads only the rules on its list", () => {
  it("the catalogue mechanics give the list command", () => {
    const list = section(MECHANICS, LIST);
    expect(list).toContain(`scripts/${COMMAND}`);
  });

  it("reads the detail of a listed rule only, at the path the list gives", () => {
    const list = section(MECHANICS, LIST);
    expect(list).toMatch(/read the detail of no rule outside the list/i);
    expect(list).toMatch(/path the list gives/i);
  });

  it.each(STARTERS)("$file gets the list with its own flags", ({ file, flags, not }) => {
    const text = flat(file);
    expect(text, `${file} does not run the list command`).toContain(COMMAND);
    for (const flag of flags) expect(text, `${file} does not pass ${flag}`).toContain(flag);
    const command = text.match(new RegExp(`${COMMAND.replace(".", "\\.")}[^\`]*\``))?.[0] ?? "";
    for (const flag of not) expect(command, `${file} narrows its list with ${flag}`).not.toContain(flag);
  });

  it.each(USERS)("%s works from the run's in-scope list", (file) => {
    expect(flat(file)).toMatch(/in-scope list/i);
  });

  it("the reviewer grades the judgment and hybrid rules on the list it receives", () => {
    const agent = flat(`${HARNESS}/agents/dx-design-review.md`);
    expect(agent).toMatch(/in-scope list/i);
    expect(agent).toMatch(/`check: judgment` or `check: hybrid`/);
  });
});

describe("2. a run reports the selection it applied", () => {
  it("the mechanics report the Selection line to the person", () => {
    const list = section(MECHANICS, LIST);
    expect(list).toMatch(/report (its|the) `Selection:` line to the person/i);
  });

  it("reports it also when the product has no DESIGN.md", () => {
    expect(section(MECHANICS, LIST)).toMatch(/no `DESIGN\.md`/);
  });

  it.each(STARTERS)("$file reports the selection", ({ file }) => {
    expect(flat(file), `${file} does not report the selection`).toMatch(/`Selection:` line/);
  });
});

describe("3. a failed list command stops the run", () => {
  it("stops before it reviews or builds anything, and shows the error", () => {
    const list = section(MECHANICS, LIST);
    expect(list).toMatch(/exits with an error/i);
    expect(list).toMatch(/stop before you review or build anything/i);
    expect(list).toMatch(/show the error to the person/i);
  });

  it.each(STARTERS)("$file stops on a failed list", ({ file }) => {
    expect(flat(file), `${file} does not stop on a failed list`).toMatch(/exits with an error/i);
  });
});

describe("4. no design skill or procedure reads the whole catalogue", () => {
  const files = [
    ...markdownUnder(`${HARNESS}/skills/design`),
    ...markdownUnder(`${HARNESS}/procedures`),
    ...markdownUnder(`${HARNESS}/agents`),
  ];

  it("finds the files it checks", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("names catalog.yaml nowhere but the catalogue mechanics", () => {
    const naming = files.filter((file) => file !== MECHANICS && read(file).includes("catalog.yaml"));
    expect(naming).toEqual([]);
  });

  it("the catalogue mechanics tell a run not to open catalog.yaml", () => {
    expect(flat(MECHANICS)).toMatch(/do not open `\.\.\/standards\/catalog\.yaml`/i);
  });

  it("the critique coverage table covers the list, not the whole catalogue", () => {
    const report = flat(`${HARNESS}/skills/design/dx-design-critique/report.md`);
    expect(report).not.toMatch(/full catalogue coverage/i);
    expect(report).toMatch(/every rule on the run's in-scope list/i);
  });
});
