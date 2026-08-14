/**
 * Harness-side eslint flat config — checks/eslint/jsx-a11y.config.mjs
 *
 * Runs eslint-plugin-jsx-a11y's maintained `recommended` preset (31 of its 39
 * rules) over a target repo's source WITHOUT installing or configuring
 * anything in that repo: no config file, no plugin entry, no dependency, no
 * lockfile change. `checks/a11y-eslint.py` invokes eslint with
 * `--no-config-lookup --config <this file>` and the target root as CWD, so the
 * target's own eslint config never loads and never changes the result.
 *
 * This file sits outside the target's module tree, so a bare
 * `import "eslint-plugin-jsx-a11y"` here would not resolve. The wrapper
 * resolves the plugin and the TypeScript parser from the TARGET repo's own
 * node_modules and passes their absolute paths in:
 *
 *   DX_A11Y_PLUGIN  absolute path to eslint-plugin-jsx-a11y (required)
 *   DX_A11Y_PARSER  absolute path to a TypeScript-capable parser (optional —
 *                   without it, only .js/.jsx/.mjs/.cjs are parsed and the
 *                   wrapper says so, routing the .tsx controls to manual
 *                   verification rather than reporting a clean pass)
 *
 * The preset's severities and per-rule options are used verbatim: the eight
 * rules its maintainers leave off (prefer-tag-over-role,
 * control-has-associated-label, label-has-for, anchor-ambiguous-text,
 * accessible-emoji, lang, no-aria-hidden-on-focusable, no-onchange) stay off,
 * and no option object is overridden. All 39 was measured on this repo and
 * rejected: 8 findings against the preset's 1, and all 7 extras are
 * deliberately suppressed by the maintainers.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const pluginPath = process.env.DX_A11Y_PLUGIN;
if (!pluginPath) {
  throw new Error(
    "DX_A11Y_PLUGIN is not set: run this config through checks/a11y-eslint.py, " +
      "which resolves eslint-plugin-jsx-a11y from the target repo.",
  );
}

const jsxA11y = require(pluginPath);
const parserPath = process.env.DX_A11Y_PARSER;
const parser = parserPath ? require(parserPath) : null;

const recommended = jsxA11y.flatConfigs.recommended;

const files = parser
  ? ["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs", "**/*.ts", "**/*.tsx"]
  : ["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs"];

export default [
  // Mirrors checklib.SKIP_DIRS so a broad target path never walks a vendored
  // or build tree.
  { ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/out/**"] },
  {
    ...recommended,
    files,
    languageOptions: {
      ...recommended.languageOptions,
      ecmaVersion: "latest",
      sourceType: "module",
      ...(parser ? { parser } : {}),
    },
  },
];
