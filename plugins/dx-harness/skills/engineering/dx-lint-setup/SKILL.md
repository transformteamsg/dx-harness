---
name: dx-lint-setup
description: Set up linting and/or formatting for a repository workspace. Detects project types (JS/TS, Go, shell scripts), audits existing lint configuration for gaps, presents tool options, and installs + configures the chosen tools. Use when asked to "set up linting", "add a linter", "configure ESLint / Biome / oxlint / oxfmt / golangci-lint / shellcheck", "our project has no lint", or when a PR review flags missing lint config. For JS/TS, lets the user independently pick linters (ESLint, oxlint, Biome) and formatters (Prettier, oxfmt) — multiple tools can be set up in one go. Does NOT wire linters into git hooks — point the user to git-hooks-setup for that after this skill completes.
---

# lint-setup

Set up linting and/or formatting for a repo. Handles JS/TS, Go, and shell scripts.

## Three-phase workflow

```
Phase 1: Detect   →   Phase 2: Choose   →   Phase 3: Install
scan project           present options        write configs +
types & existing       confirm with user      run installs
lint config            before any change
```

This skill does **not** wire linters into git hooks. After completing, remind the user they can use `git-hooks-setup` to enforce lint on commit.

---

## Phase 1: Detect Project Types and Existing Config

Scan the repo root for signals:

**JS/TS detected if:** `package.json` exists, or `.ts`/`.tsx`/`.js`/`.jsx` files are present.

**Go detected if:** `go.mod` exists.

**Shell scripts detected if:** `*.sh` files exist, or files with a `#!/bin/bash` or `#!/bin/sh` shebang.

**Existing lint config to check:**

| Ecosystem | Files that indicate existing config |
|-----------|-------------------------------------|
| JS/TS | `eslint.config.js`, `.eslintrc*`, `biome.json`, `.oxlintrc.json`, `.prettier*`, `.oxfmtrc.json` |
| Go | `.golangci.yaml`, `.golangci.yml`, `.golangci.toml` |
| Shell | `.shellcheckrc` |

Report what was found before presenting options. This helps the user understand what will actually change.

---

## Phase 2: Present Options and Get Confirmation

For each detected project type, show what's already configured and what's missing. **Do not write any files until the user confirms the plan.**

### JS/TS — two independent choices

Ask the user to select from each group. Multiple tools from each group can be set up together.

**Linters** (pick any combination):

| Tool | What it does | Good fit when |
|------|-------------|---------------|
| **ESLint** | Full-featured linter with type-aware rules (`eslint.config.js`) | Need the complete ESLint plugin ecosystem |
| **oxlint** | Rust-based linter, 50-100x faster than ESLint, 520+ rules | Speed-first, or want a fast pre-pass alongside ESLint |
| **Biome** | All-in-one linter + formatter in a single binary | New project wanting one tool for both lint and format |

**Formatters** (pick any combination; skip if Biome is already selected above):

| Tool | What it does | Good fit when |
|------|-------------|---------------|
| **Prettier** | Opinionated formatter, largest ecosystem, 8+ years proven | Widest editor/tool integration |
| **oxfmt** | Rust-based formatter, ~30x faster than Prettier, 100% Prettier conformance | Speed-critical pipelines, large codebases |

> **Compatibility wiring (handled automatically):**
> - ESLint + Prettier or oxfmt: install `eslint-config-prettier` and add it last in `eslint.config.js` to disable conflicting formatting rules.
> - ESLint + oxlint: install `eslint-plugin-oxlint` to disable ESLint rules already covered by oxlint, avoiding double-reporting.

> **ESLint version note:** ESLint v10 requires flat config (`eslint.config.js`). Do not generate `.eslintrc.*` files for new setups.

### Go — confirm:

- **golangci-lint**: `.golangci.yaml` with a `formatters` block (`gofmt`, `goimports`) and a pinned local install via `Makefile`. Linters rely on golangci-lint's defaults. If a `.golangci.yaml` already exists, audit whether the `formatters` block is present with at minimum `gofmt` and `goimports`, and report any gaps.

### Shell — confirm:

- **shellcheck**: `.shellcheckrc` with `shell=bash`. If already present, audit the config and report gaps.

---

## Phase 3: Install and Configure

> **Only create the files explicitly listed in each tool's section below. Do not write additional config or ignore files based on general knowledge of these tools.**

### Detect the package manager first

Check for lockfiles and config files in the repo root — do this before running any install command:

| Signal | Package manager |
|--------|----------------|
| `bun.lock` or `bun.lockb` | bun |
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
| `package-lock.json` | npm |
| none of the above | ask the user |

| Action | npm | yarn | pnpm | bun |
|--------|-----|------|------|-----|
| Add dev dep | `npm install --save-dev <pkg>` | `yarn add --dev <pkg>` | `pnpm add --save-dev <pkg>` | `bun add --dev <pkg>` |

Use the detected package manager consistently — don't mix commands within the same setup.

**Version selection:** Before installing any JS package, check npm for the most recent published version that is at least 7 days old, and install that exact version. Do not install `@latest` or leave the version unpinned.

Install each selected tool in turn, then apply any compatibility wiring at the end.

---

### ESLint

```bash
# npm
npm install --save-dev eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks globals
# yarn
yarn add --dev eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks globals
# pnpm
pnpm add --save-dev eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks globals
# bun
bun add --dev eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks globals
```

`eslint.config.js`:
```js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['**/build/**', '**/dist/**', '**/node_modules/**'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'no-console': 'warn',

      // Rules from oxlint not enabled by eslint:recommended
      'no-array-constructor': 'error',
      'no-case-declarations': 'error',
      'no-empty': 'error',
      'no-empty-function': 'error',
      'no-fallthrough': 'error',
      'no-prototype-builtins': 'error',
      'no-redeclare': 'error',
      'no-regex-spaces': 'error',
      'no-unexpected-multiline': 'error',

      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/ban-tslint-comment': 'error',
      '@typescript-eslint/class-literal-property-style': 'error',
      '@typescript-eslint/consistent-generic-constructors': 'error',
      '@typescript-eslint/consistent-indexed-object-style': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/consistent-type-definitions': 'error',
      '@typescript-eslint/no-confusing-non-null-assertion': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',

      'react/display-name': 'error',
      'react/jsx-no-comment-textnodes': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
);
```

Add to `package.json` scripts:
```json
"lint": "eslint .",
"lint:fix": "eslint . --fix"
```

---

### oxlint

```bash
# npm
npm install --save-dev oxlint
# yarn
yarn add --dev oxlint
# pnpm
pnpm add --save-dev oxlint
# bun
bun add --dev oxlint
```

`.oxlintrc.json` (write as JSONC — inline comments are valid and must be preserved):
```jsonc
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "ignorePatterns": ["**/build/**", "**/dist/**", "**/node_modules/**"],
  "env": {
    "browser": true,
    "node": true
  },
  "plugins": ["typescript", "react", "import"],
  "categories": {
    "correctness": "error"
  },
  "rules": {
    "eslint/no-console": "warn",
    "typescript/use-unknown-in-catch-callback-variable": "error",

    // Rules from the original ESLint config not enabled by default in Oxlint.
    "eslint/no-array-constructor": "error",
    "eslint/no-case-declarations": "error",
    "eslint/no-empty": "error",
    "eslint/no-empty-function": "error",
    "eslint/no-fallthrough": "error",
    "eslint/no-prototype-builtins": "error",
    "eslint/no-redeclare": "error",
    "eslint/no-regex-spaces": "error",
    "eslint/no-unexpected-multiline": "error",
    "typescript/adjacent-overload-signatures": "error",
    "typescript/array-type": "error",
    "typescript/ban-ts-comment": "error",
    "typescript/ban-tslint-comment": "error",
    "typescript/class-literal-property-style": "error",
    "typescript/consistent-generic-constructors": "error",
    "typescript/consistent-indexed-object-style": "error",
    "typescript/consistent-type-assertions": "error",
    "typescript/consistent-type-definitions": "error",
    "typescript/no-confusing-non-null-assertion": "error",
    "typescript/no-empty-object-type": "error",
    "typescript/no-explicit-any": "error",
    "typescript/no-inferrable-types": "error",
    "typescript/no-namespace": "error",
    "typescript/no-require-imports": "error",
    "typescript/no-unnecessary-type-constraint": "error",
    "typescript/no-unsafe-function-type": "error",
    "typescript/prefer-for-of": "error",
    "typescript/prefer-function-type": "error",
    "react/display-name": "error",
    "react/jsx-no-comment-textnodes": "error",
    "react/jsx-no-target-blank": "error",
    "react/no-unescaped-entities": "error",
    "react/no-unknown-property": "error",
    "react/rules-of-hooks": "error"
  }
}
```

Add to `package.json` scripts:
```json
"lint": "oxlint",
"lint:fix": "oxlint --fix"
```

If ESLint is also selected, prefix the oxlint command so it runs first (faster feedback):
```json
"lint": "oxlint && eslint .",
"lint:fix": "oxlint --fix && eslint . --fix"
```

---

### Biome

```bash
# npm
npm install --save-dev @biomejs/biome
# yarn
yarn add --dev @biomejs/biome
# pnpm
pnpm add --save-dev @biomejs/biome
# bun
bun add --dev @biomejs/biome
```

`biome.json`:
```json
{
  "$schema": "https://biomejs.dev/schemas/2.0/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  }
}
```

Add to `package.json` scripts:
```json
"lint": "biome check .",
"lint:fix": "biome check --fix .",
"format": "biome format \"**/*.{js,jsx,ts,tsx,md,html,css,json,jsonc,yaml,toml}\""
```

---

### Prettier

```bash
# npm
npm install --save-dev prettier
# yarn
yarn add --dev prettier
# pnpm
pnpm add --save-dev prettier
# bun
bun add --dev prettier
```

`.prettierrc.json`:
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "singleQuote": true,
  "trailingComma": "all"
}
```

> Prettier does not natively sort imports. To match `sortImports: true` from oxfmt, install `@trivago/prettier-plugin-sort-imports` and add it to the config.

Add to `package.json` scripts:
```json
"format": "prettier --check \"**/*.{js,jsx,ts,tsx,md,html,css,json,jsonc,yaml,toml}\""
```

---

### oxfmt

```bash
# npm
npm install --save-dev oxfmt
# yarn
yarn add --dev oxfmt
# pnpm
pnpm add --save-dev oxfmt
# bun
bun add --dev oxfmt
```

`.oxfmtrc.json` (write as JSONC — trailing commas and inline comments are valid and must be preserved):
```jsonc
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "printWidth": 100,
  "tabWidth": 2,
  "singleQuote": true,
  "trailingComma": "all",

  "sortImports": true,
}
```

Add to `package.json` scripts:
```json
"format": "oxfmt --check \"**/*.{js,jsx,ts,tsx,md,html,css,json,jsonc,yaml,toml}\""
```

---

### Compatibility wiring (apply after individual installs)

**ESLint + any formatter (Prettier or oxfmt)**

Install `eslint-config-prettier` to disable ESLint's formatting rules, which would otherwise conflict.

> **Note:** `eslint-config-prettier` is a compatibility shim that disables ESLint's formatting rules — it is **not** Prettier. Installing it does not mean Prettier is in use. Do **not** create `.prettierrc.json`, `.prettierignore`, or any other Prettier-specific files unless the user explicitly selected Prettier as their formatter.

```bash
# npm
npm install --save-dev eslint-config-prettier
# yarn
yarn add --dev eslint-config-prettier
# pnpm
pnpm add --save-dev eslint-config-prettier
# bun
bun add --dev eslint-config-prettier
```

Add `prettier` (from `eslint-config-prettier`) **last** in `eslint.config.js`:
```js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,        // must be last
);
```

**ESLint + oxlint**

Install `eslint-plugin-oxlint` to disable ESLint rules already covered by oxlint, avoiding duplicate reports:

```bash
# npm
npm install --save-dev eslint-plugin-oxlint
# yarn
yarn add --dev eslint-plugin-oxlint
# pnpm
pnpm add --save-dev eslint-plugin-oxlint
# bun
bun add --dev eslint-plugin-oxlint
```

Add to `eslint.config.js`:
```js
import oxlint from 'eslint-plugin-oxlint';

export default tseslint.config(
  // ... existing config ...
  oxlint.configs['flat/recommended'],
);
```

---

### golangci-lint

golangci-lint is installed locally and pinned to a specific version via the `Makefile` — do not install it globally with brew or go install.

**`Makefile`** — check if one exists first; if so, merge these targets in. If not, create it. Recipe lines must use a real tab character, not spaces.

```makefile
SHELL := /bin/bash
BIN   := $(CURDIR)/bin

GOLANGCI_VERSION := v2.12.2
GOLANGCI_LINT    := $(BIN)/golangci-lint-$(GOLANGCI_VERSION)

$(BIN):
	mkdir -p $(BIN)

$(GOLANGCI_LINT): | $(BIN)
	curl -sSfL https://golangci-lint.run/install.sh | sh -s -- -b $(BIN) $(GOLANGCI_VERSION)
	mv $(BIN)/golangci-lint $@

.PHONY: tools
tools: $(GOLANGCI_LINT)

.PHONY: lint
lint: $(GOLANGCI_LINT)
	$(GOLANGCI_LINT) run
```

`.golangci.yaml`:
```yaml
version: '2'

formatters:
  enable:
    - gofmt
    - goimports
  settings:
    gofmt:
      rewrite-rules:
        - pattern: interface{}
          replacement: any

```

---

### shellcheck

```bash
# macOS
brew install shellcheck

# Debian/Ubuntu
apt-get install shellcheck
```

`.shellcheckrc`:
```
shell=bash
enable=all
disable=SC2086
```

`SC2086` (word splitting on unquoted variables) is disabled by default because it is extremely common and usually intentional in simple scripts — re-enable it if the project has strict quoting requirements.

---

## Post-Setup

After installing and configuring:

1. Run the linter(s) once to confirm they work and surface any initial findings.
2. Remind the user about hook integration:
   > "Lint is now configured. To enforce it automatically on commit, use the `git-hooks-setup` skill."
3. Offer to commit, push, and open a PR for these changes — don't force it:
   > "Want me to commit the lint setup to a feature branch, push, and open a PR?"

   If the user would rather review and push themselves, skip this — but ask them to add the `skill:lint-setup` label and the `*🤖 Generated with lint-setup*` footer when they open the PR. The label makes usage queryable with `gh pr list --label "skill:lint-setup"`.

   If yes, run the full flow:

   **Branch** — check `git rev-parse --abbrev-ref HEAD`. If on a trunk branch (`main`, `master`, `develop`), create a feature branch (a PR cannot target the branch it is opened from); otherwise stay on the current feature branch:

   ```bash
   git checkout -b chore/setup-linting
   ```

   **Commit** the config files and `package.json` script changes — stage only what this skill created or changed:

   ```bash
   git add eslint.config.js .oxlintrc.json biome.json .prettierrc.json .oxfmtrc.json .golangci.yaml .shellcheckrc Makefile package.json 2>/dev/null
   git commit -m "chore: set up linting"
   ```

   **Push** the branch to its remote (a PR needs the branch on the remote first):

   ```bash
   git push -u origin HEAD
   ```

   **Open the PR** — ensure the usage-tracking label exists, then create the PR with the label and a visible footer:

   ```bash
   gh label create "skill:lint-setup" --color ededed --description "Opened with the lint-setup skill" 2>/dev/null || true

   gh pr create --draft \
     --title "chore: set up linting" \
     --label "skill:lint-setup" \
     --body "$(cat <<'EOF'
   ## Summary

   <!-- Tools configured (linters/formatters) and what changed -->

   ---

   *🤖 Generated with lint-setup*
   EOF
   )"
   ```
