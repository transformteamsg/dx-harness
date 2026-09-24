import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

/* react-hooks/set-state-in-effect came in with eslint-config-next 16 and was
   first set to warn over five effects that kept server and first client render
   in step. These guard that it stays an error for them and that they stay
   clean. See issue #394. */

const RULE = "react-hooks/set-state-in-effect";
const FILES = [
  "lib/motion.ts",
  "hooks/use-mobile.ts",
  "components/postcard.tsx",
  "components/landing/dxd-construction-preview.tsx",
];

const eslint = new ESLint({ cwd: process.cwd() });

function severity(entry: unknown): number | string | undefined {
  const level = Array.isArray(entry) ? entry[0] : entry;
  return level === "error" ? 2 : level === "warn" ? 1 : level === "off" ? 0 : (level as number);
}

describe(RULE, () => {
  it.each(FILES)("is an error for %s", async (file) => {
    const config = await eslint.calculateConfigForFile(file);
    expect(severity(config.rules?.[RULE])).toBe(2);
  });

  it("reports nothing in the effects it first flagged", async () => {
    const results = await eslint.lintFiles(FILES);
    const findings = results.flatMap((result) =>
      result.messages
        .filter((message) => message.ruleId === RULE)
        .map((message) => `${result.filePath.replace(`${process.cwd()}/`, "")}:${message.line}`),
    );
    expect(findings).toEqual([]);
  }, 60_000);
});
