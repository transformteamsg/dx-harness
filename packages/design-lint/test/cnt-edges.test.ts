import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { lint } from "../src/lint.ts";
import { launchBrowser } from "../src/rendered.ts";
import type { Browser } from "playwright-core";
import { loadRules } from "../src/rules/load.ts";
import { titleCaseWord } from "../src/modules/cnt/cnt-12.ts";
import { wordsPattern } from "../src/modules/cnt/text.ts";
import { BASE } from "./helpers.ts";

/* Cases that a fixture pair cannot show: the branches of the shared text scan,
   a product's own word list, and the words that keep a capital. */

const { rules } = loadRules(BASE);
let shared: Browser | null = null;
try {
  shared = await launchBrowser();
} catch {
  shared = null;
}
afterAll(async () => {
  await shared?.close();
});
const skip = shared === null && !process.env.CI;

function page(main: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Home</title></head><body><main>${main}</main></body></html>`;
}

async function run(code: string, main: string, params: Record<string, unknown> = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cnt-"));
  fs.writeFileSync(path.join(dir, "index.html"), page(main));
  const result = await lint({
    rules,
    config: { render: { waitUntil: "load" }, pages: { all: ["/"] }, rules: { [code]: params } },
    configDir: dir,
    paths: [dir],
    surfaces: ["rendered"],
    select: [code],
    ignore: [],
    ci: false,
    browser: shared ?? undefined,
  });
  return result.findings.map((f) => f.message);
}

describe("titleCaseWord", () => {
  it("returns the first word after the first that starts with a capital", () => {
    expect(titleCaseWord("View Class Details", [])).toBe("Class");
  });

  it("keeps a capital on an acronym, on I, and on the first word of a sentence", () => {
    expect(titleCaseWord("Upload the CCE record", [])).toBeNull();
    expect(titleCaseWord("Can I change it later", [])).toBeNull();
    expect(titleCaseWord("Saved. Close the form", [])).toBeNull();
    expect(titleCaseWord("Step 1: Your details", [])).toBeNull();
  });

  it("keeps the capitals of a proper noun, and takes the longest name first", () => {
    expect(titleCaseWord("Open Example Portal Help", ["Example Portal"])).toBe("Help");
    expect(titleCaseWord("Open Example Portal Help", ["Example Portal", "Example Portal Help"])).toBeNull();
  });
});

describe("wordsPattern", () => {
  it("matches a whole word in any case, and a phrase across any space", () => {
    expect("Clicked it".match(wordsPattern(["clicked"]))).toEqual(["Clicked"]);
    expect("onClick".match(wordsPattern(["click"]))).toBeNull();
    expect("There  is a gap".match(wordsPattern(["there is"]))).toEqual(["There  is"]);
  });
});

describe.skipIf(skip)("the shared text scan", () => {
  it("does not read text that is hidden or in another language", async () => {
    const main = `<p hidden>Click Save.</p><p lang="ms">Click Simpan.</p><div style="display:none">Tap here.</div>`;
    expect(await run("CNT-5a", main)).toEqual([]);
  });

  it("reads a sentence across inline elements as one sentence", async () => {
    expect(await run("CNT-6a", "<p><strong>There</strong> is a gap.</p>")).toHaveLength(1);
  });

  it("does not join the words on each side of a link that it leaves out", async () => {
    expect(await run("CNT-5a", `<p>Use the<a href="/x">menu</a>tap.</p>`)).toHaveLength(1);
    expect(await run("CNT-5a", `<p>Re<a href="/x">menu</a>tap</p>`, { deviceVerbs: ["retap"] })).toEqual([]);
  });
});

describe.skipIf(skip)("a product's own word lists", () => {
  it("CNT-5a reports a verb that the product adds", async () => {
    expect(await run("CNT-5a", "<p>Press Save.</p>", { deviceVerbs: ["press"] })).toHaveLength(1);
  });

  it("CNT-6a reports nothing when both lists are empty", async () => {
    expect(await run("CNT-6a", "<p>There is just one.</p>", { openers: [], fillerWords: [] })).toEqual([]);
  });

  it("CNT-13a gives the right spelling, and reads a key in any case", async () => {
    const messages = await run("CNT-13a", "<p>Pick a Gray card.</p>", { usToUk: { Gray: "grey" }, typos: {} });
    expect(messages).toEqual([`Write "grey", not "Gray".`]);
  });

  it("CNT-12a reads only the elements that labelSelector matches", async () => {
    expect(await run("CNT-12a", "<p>Read The Guide.</p><h2>Read The Guide</h2>", { labelSelector: "p" })).toHaveLength(1);
  });
});
