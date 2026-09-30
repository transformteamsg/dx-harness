import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/* The marketplace entry is how a user installs the plugin, so it must keep
   pointing at a plugin manifest that names dx-harness. See issue #401. */

function readRoot(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

describe("the plugin marketplace", () => {
  type Marketplace = { plugins?: { name?: string; source?: string }[] };
  const marketplace: Marketplace = JSON.parse(readRoot(".claude-plugin/marketplace.json"));
  const entry = marketplace.plugins?.find((plugin) => plugin.name === "dx-harness");

  it("installs dx-harness from ./plugins/dx-harness", () => {
    expect(entry?.source).toBe("./plugins/dx-harness");
  });

  it("points at a plugin manifest that names dx-harness", () => {
    const manifest = JSON.parse(readRoot(path.join(entry?.source ?? "", ".claude-plugin/plugin.json")));
    expect(manifest.name).toBe("dx-harness");
  });
});
