import { ESLint } from "eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import type { Candidate, RuleModule } from "../types.ts";

/* The eslint-plugin-jsx-a11y wrapper. A rule names jsx-a11y rules by id. The
   wrapper lints the JSX and TSX files with a harness-side config, so the product
   needs no ESLint config of its own, and turns each message into a candidate. A
   violation is a finding. The module decides nothing. */

const JSX_FILE = /\.(?:jsx|tsx)$/i;

/* The ids of the installed plugin. Tests check that the ids a rule names exist. */
export function installedJsxA11yRules(): string[] {
  return Object.keys(jsxA11y.rules);
}

export interface JsxMessage {
  ruleId: string;
  message: string;
  line: number;
  column: number;
}

export async function runJsxA11y(root: string, files: string[], ruleIds: string[]): Promise<{ file: string; messages: JsxMessage[] }[]> {
  const targets = files.filter((f) => JSX_FILE.test(f));
  if (targets.length === 0) return [];
  const rules = Object.fromEntries(ruleIds.map((id) => [`jsx-a11y/${id}`, "error" as const]));
  const eslint = new ESLint({
    overrideConfigFile: true,
    /* ESLint reads only the files under its base path, so that is the project root. */
    cwd: root,
    overrideConfig: [
      {
        files: ["**/*.{jsx,tsx}"],
        languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
        plugins: { "jsx-a11y": jsxA11y as never },
        rules,
      },
    ],
    /* The product's own ignore file must not hide a file that the rule should read. */
    ignore: false,
  });
  const results = await eslint.lintFiles(targets);
  return results.map((r) => ({
    file: r.filePath,
    messages: r.messages
      .filter((m) => m.ruleId !== null)
      .map((m) => ({ ruleId: String(m.ruleId).replace(/^jsx-a11y\//, ""), message: m.message, line: m.line, column: m.column })),
  }));
}

/* A rule that is a set of jsx-a11y rules, run on the JSX and TSX files. */
export function jsxRule(code: string, ruleIds: string[]): RuleModule {
  return {
    code,
    surface: "source",

    async locate({ files, root }) {
      const out: Candidate[] = [];
      for (const r of await runJsxA11y(root, files, ruleIds)) {
        for (const m of r.messages) out.push({ file: r.file, line: m.line, column: m.column, data: m });
      }
      return out;
    },

    decide(candidate) {
      const m = candidate.data as JsxMessage;
      return `${m.message} (jsx-a11y ${m.ruleId})`;
    },
  };
}
