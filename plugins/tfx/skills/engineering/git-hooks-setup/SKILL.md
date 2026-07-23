---
name: git-hooks-setup
description: Use when setting up pre-commit and pre-push git hooks on any project (JS/TS, Go, shell scripts, or mixed), auditing whether an existing hook setup meets minimum requirements, or adding new mandatory checks to existing hooks. Triggered by "set up commit hooks", "add pre-commit checks", "wire up pre-push tests", "check if our hooks are good enough", or "add a new gate before push". Supports Husky (JS/TS only) and Lefthook (language-agnostic). This skill wires hooks around whatever linters are already configured — if no linters are set up yet, point the user to lint-setup first.
---

# Git Hooks Setup

## Overview

Installs git hooks using either **Husky** (shell scripts + lint-staged) or **Lefthook** (YAML config with built-in staged-file filtering), enforcing whatever quality tools are already configured in the repo.

This skill **does not install or configure linters or formatters** — it detects what's already there and wires the hooks accordingly. If linters aren't configured yet, use `lint-setup` first, then return here.

---

## Phase 0: Assess

**Step 1 — Detect the project type.** Look for these signals:

- JS/TS: `package.json` present, or `.ts`/`.tsx`/`.js`/`.jsx` files tracked
- Go: `go.mod` present
- Shell: `.sh` files present, or files with a `#!/bin/bash` / `#!/bin/sh` shebang

If no signals are found, stop — there is nothing to hook.

**Step 2 — Detect the existing hook manager.** Check:

- `lefthook.yml` present → go to **Path B-Lefthook: Audit**
- `.husky/` directory present → go to **Path B-Husky: Audit**
- Neither present → go to **Path A: Fresh Install**

**Step 3 — For fresh installs, choose a hook manager.** Ask the user if they have no preference:

- **Husky** — shell scripts in `.husky/`, staged-file filtering via lint-staged. Requires Node.js; only suitable for JS/TS projects.
- **Lefthook** — single `lefthook.yml`, staged-file filtering built-in. Language-agnostic Go binary; works for any project type.

If the repo has no `package.json` (Go, shell, or other), Husky is not an option — proceed with Lefthook only without asking.

---

## Phase 1: Detect — runs before any path

Gather this information from the repo before writing anything.

### Package manager (JS/TS projects only)

| Lockfile | Package manager |
|----------|----------------|
| `bun.lock` / `bun.lockb` | bun |
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
| `package-lock.json` | npm |
| none | ask the user |

### Node version manager (JS/TS projects only)

| Signal | Manager |
|--------|---------|
| `.nvmrc` / `.node-version` | nvm |
| `.tool-versions` | asdf |
| `volta` key in `package.json` | volta |
| none found | ask the user |

### Linters and formatters already configured

Check for config files and installed tools. These determine what runs on staged files:

**JS/TS**

| Tool | Detection signal | Command |
|------|-----------------|---------|
| ESLint | `eslint.config.js`, `.eslintrc*` present | `eslint --fix` |
| oxlint | `.oxlintrc.json` present, or `oxlint` in devDeps | `oxlint --fix` |
| Biome | `biome.json` present | `biome check --fix` |
| Prettier | `.prettierrc*` or `prettier` key in package.json | `prettier --write` |
| oxfmt | `.oxfmtrc.json` present, or `oxfmt` in devDeps | `oxfmt --write` |

**Go**

| Tool | Detection signal | Command |
|------|-----------------|---------|
| golangci-lint | `.golangci.yaml` / `.golangci.yml` present | `golangci-lint run` (or `make lint` if a `lint` target is defined in `Makefile`) |

**Shell**

| Tool | Detection signal | Command |
|------|-----------------|---------|
| shellcheck | `.shellcheckrc` present, or `shellcheck` in PATH | `shellcheck <files>` |

If **no linters or formatters are found at all**: tell the user and recommend running `lint-setup` first. Ask whether they want to continue anyway — hooks will be wired but linting will do nothing until tools are configured. Wait for their answer before proceeding.

### TypeScript (JS/TS projects only)

TypeScript type checking runs in the pre-commit hook when both are true:
- `tsconfig.json` is present within 3 directory levels
- `typescript` is in `devDependencies`

### gitleaks

Check: `which gitleaks` or `gitleaks version`. If not installed:

```sh
brew install gitleaks        # macOS
# Linux: go install github.com/gitleaks/gitleaks/v8@latest
```

After installing, check for `.gitleaks.toml`. If absent, create one:
```toml
[extend]
useDefault = true

[[allowlist]]
description = "allowlist"
paths = []
```

---

## Path A-Husky: Fresh Install

### Install Husky

Use Husky **v9 or above**. The v9+ conventions are a `.husky/` directory and a `prepare` script — there is no `husky install` command, no `husky add` command, and no `_/husky.sh` shim. Do not generate any of those.

```sh
# npm
npm install --save-dev husky && npx husky init

# yarn
yarn add --dev husky && yarn husky init

# pnpm
pnpm add -D husky && pnpm exec husky init

# bun
bun add -D husky && bunx husky init
```

`husky init` creates `.husky/pre-commit` (with a placeholder) and adds a `prepare` script to `package.json`. Replace the placeholder content with the correct hook per **Hook Requirements — Husky**. Any hook files created manually must also be made executable: `chmod +x .husky/<hook-name>`.

### Install lint-staged

lint-staged orchestrates linter runs on staged files. Install it if not already in `devDependencies`:

```sh
npm install --save-dev lint-staged   # use detected package manager
```

Then create a lint-staged config if none exists. The format depends on whether `package.json` contains `"type": "module"`:

- `"type": "module"` present → create `.lintstagedrc.js` (ESM)
- `"type": "module"` absent → create `.lintstagedrc.json`

If using `.lintstagedrc.js`, verify `"type": "module"` is set in `package.json` before writing the file — without it, Node will fail to load the ESM config. Add it if missing.

Linters and formatters use different globs because formatters handle more file types than linters:

- **Linters** (oxlint, eslint, biome): `*.{js,jsx,ts,tsx}` only
- **Formatters** (oxfmt, prettier): `*.{js,jsx,ts,tsx,md,html,css,json,jsonc,yaml,toml}`

If a tool acts as both linter and formatter (Biome), use the formatter glob.

**`.lintstagedrc.js`** (ESM — use when `"type": "module"` is set):

```js
/** @type {import('lint-staged').Configuration} */
export default {
  '*.{js,jsx,ts,tsx}': 'oxlint --fix',
  '*.{js,jsx,ts,tsx,md,html,css,json,jsonc,yaml,toml}': 'oxfmt --write',
};
```

**`.lintstagedrc.json`** (use when `"type": "module"` is not set):

```json
{
  "*.{js,jsx,ts,tsx}": "eslint --fix",
  "*.{js,jsx,ts,tsx,md,html,css,json,jsonc,yaml,toml}": "prettier --write"
}
```

Use a bare string when only one command maps to a glob; use an array only when multiple commands share the same glob (e.g. oxlint and eslint both on JS/TS files). Include only the commands for tools detected in Phase 1. If no linters were found and the user chose to continue, use an empty array.

Then proceed to **Hook Requirements — Husky**.

---

## Path A-Lefthook: Fresh Install

### Install Lefthook

```sh
# npm
npm install --save-dev lefthook && npx lefthook install

# yarn
yarn add --dev lefthook && yarn lefthook install

# pnpm
pnpm add -D lefthook && pnpm exec lefthook install

# bun
bun add -D lefthook && bunx lefthook install
```

No `prepare` script is needed — `lefthook install` wires the hooks directly into `.git/hooks/`.

lint-staged is **not needed** with Lefthook — use Lefthook's native `glob` and `stage_fixed` instead.

Then proceed to **Hook Requirements — Lefthook**.

---

## Path B-Husky: Audit Existing Setup

Re-confirm the package manager from the lockfile. Run each check, report all failures first, then fix them one by one. Never modify a passing item.

### Pre-commit checks

| Check | Pass condition |
|-------|---------------|
| Husky installed | `husky` in `package.json` devDependencies |
| Pre-commit hook exists | `.husky/pre-commit` exists and is executable |
| Hook calls lint-staged | `grep -q 'lint-staged' .husky/pre-commit` |
| lint-staged installed | `lint-staged` in devDependencies |
| lint-staged config has commands | `.lintstagedrc.js`, `.lintstagedrc.json`, or `lint-staged` key in package.json contains at least one command |
| Hook calls tsc | `grep -q 'tsc' .husky/pre-commit` (TS projects only) |
| Hook calls gitleaks | `grep -q 'gitleaks' .husky/pre-commit` |
| gitleaks available | `gitleaks` is in PATH |

### Pre-push checks

| Check | Pass condition |
|-------|---------------|
| Pre-push hook exists | `.husky/pre-push` exists and is executable |
| Hook blocks push to main/master | `grep -qE 'main\|master' .husky/pre-push` and reads remote ref from stdin |
| Hook enforces branch naming | `grep -q 'BRANCH_PATTERN' .husky/pre-push` and `grep -q 'TRUNK_PATTERN' .husky/pre-push` |

For hook-level failures: fix using **Hook Requirements — Husky**. For missing lint configuration (empty lint-staged config): surface the gap and point to `lint-setup`.

---

## Path B-Lefthook: Audit Existing Setup

Re-confirm the package manager from the lockfile. Read `lefthook.yml` and check each item below. Report all failures first, then fix them one by one.

### Pre-commit checks

| Check | Pass condition |
|-------|---------------|
| Lefthook installed | `lefthook` in `package.json` devDependencies |
| `lefthook.yml` present | file exists at repo root |
| `pre-commit` section present | `pre-commit:` key exists in `lefthook.yml` |
| Linter commands cover JS/TS globs | at least one command targets `*.{js,jsx,ts,tsx}` with a detected linter |
| tsc command present | a command runs `tsc --noEmit` (TS projects only) |
| gitleaks command present | a command runs `gitleaks protect --staged` |
| gitleaks available | `gitleaks` is in PATH |

### Pre-push checks

| Check | Pass condition |
|-------|---------------|
| `pre-push` section present | `pre-push:` key exists in `lefthook.yml` |
| Hook blocks push to main/master | a command checks the remote ref for `main`/`master` |
| Hook enforces branch naming | a command checks `BRANCH_PATTERN` and `TRUNK_PATTERN` |

For failures: fix using **Hook Requirements — Lefthook**. For missing lint configuration: surface the gap and point to `lint-setup`.

---

## Hook Requirements — Husky

### Hook preamble

Every hook file must open with `set -e` immediately after the shebang. Without it, a failure in an early step silently continues instead of aborting:

```sh
#!/bin/sh
set -e
# version manager bootstrap follows (if applicable)
```

### Pre-commit — what must run

Configure `.husky/pre-commit` to run in this order:

1. **Node version manager bootstrap** — source the version manager so `node` is available in the non-interactive shell:

   ```sh
   # nvm
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

   # fnm
   eval "$(fnm env --use-on-cd)"

   # volta — no explicit sourcing needed if VOLTA_HOME is in the system PATH
   ```

2. **lint-staged** — runs only on staged files. Commands come from the lint-staged config (`.lintstagedrc.js` or `.lintstagedrc.json`). Invoke using the detected package manager so the local binary is used:

   ```sh
   # npm
   npx lint-staged
   # yarn
   yarn lint-staged
   # pnpm
   pnpm lint-staged
   # bun
   bunx lint-staged
   ```

3. **TypeScript type check** (TS projects only) — `tsc --noEmit` on the full project. TSC needs the whole graph, not just staged files. `tsconfig.json` must explicitly `exclude` gitignored output dirs — TSC does not read `.gitignore`.

4. **gitleaks** — scans staged changes for secrets:
   ```sh
   gitleaks protect --staged
   # if .gitleaks.toml is present: gitleaks protect --staged --config .gitleaks.toml
   ```

Make the hook executable: `chmod +x .husky/pre-commit`

### Pre-push — what must run

Configure `.husky/pre-push` to run (with the same version manager bootstrap as pre-commit):

1. **Block push to main/master** — reads the remote ref from stdin:

   ```sh
   while read local_ref local_sha remote_ref remote_sha; do
     if echo "$remote_ref" | grep -qE '^refs/heads/(main|master)$'; then
       echo "Direct push to ${remote_ref} is not allowed. Open a pull request instead."
       exit 1
     fi
   done
   ```

   > This does not fire when there is no stdin (e.g. `git push --dry-run`). Always pair with remote branch protection rules where the hosting platform supports it.

2. **Branch naming check** — enforces [Conventional Branch](https://conventionalbranch.org):

   ```sh
   BRANCH=$(git symbolic-ref HEAD 2>/dev/null | sed 's|refs/heads/||')
   BRANCH_PATTERN='^(feature|feat|bugfix|fix|hotfix|release|chore)/[a-z0-9]+([.-][a-z0-9]+)*$'
   TRUNK_PATTERN='^(main|master|develop)$'

   if [ -n "$BRANCH" ] && ! echo "$BRANCH" | grep -qE "$TRUNK_PATTERN" && ! echo "$BRANCH" | grep -qE "$BRANCH_PATTERN"; then
     echo "Branch name '$BRANCH' does not follow Conventional Branch naming."
     echo "Format: <type>/<description>  e.g. feat/add-login, fix/null-deref"
     echo "Valid types: feature, feat, bugfix, fix, hotfix, release, chore"
     echo "Rename with: git branch -m $BRANCH <new-name>"
     exit 1
   fi
   ```

Make the hook executable: `chmod +x .husky/pre-push`

---

## Hook Requirements — Lefthook

Lefthook config lives entirely in `lefthook.yml` at the repo root. Commands run sequentially by default — a failing command stops the chain, like `set -e` in shell.

Use `glob` to target specific file types; `stage_fixed: true` auto-restages files after a linter fixes them (equivalent to `git add` after `eslint --fix`). Use `{staged_files}` as the placeholder — Lefthook substitutes in only the staged files matching the glob.

### Pre-commit

Include only the commands for tools detected in Phase 1 — don't add entries for tools that aren't configured. If no linters were found and the user chose to continue, omit the linter commands entirely.

**JS/TS example** (ESLint + Prettier + TypeScript):

```yaml
pre-commit:
  commands:
    eslint:
      glob: "*.{js,jsx,ts,tsx}"
      run: eslint --fix {staged_files}
      stage_fixed: true
    prettier:
      glob: "*.{js,jsx,ts,tsx}"
      run: prettier --write {staged_files}
      stage_fixed: true
    tsc:
      run: tsc --noEmit
    gitleaks:
      run: gitleaks protect --staged
```

**Go example** (golangci-lint):

```yaml
pre-commit:
  commands:
    golangci-lint:
      glob: "*.go"
      run: golangci-lint run
    gitleaks:
      run: gitleaks protect --staged
```

**Shell example** (shellcheck):

```yaml
pre-commit:
  commands:
    shellcheck:
      glob: "*.sh"
      run: shellcheck {staged_files}
    gitleaks:
      run: gitleaks protect --staged
```

For gitleaks, if `.gitleaks.toml` is present use: `gitleaks protect --staged --config .gitleaks.toml`

### Pre-push

The main/master push block reads from stdin, which Lefthook forwards to `run` commands in the pre-push hook. For readability, put the complex shell logic in a dedicated script and call it from `lefthook.yml`:

**`scripts/hooks/check-push-target.sh`** (create if it doesn't exist, make it executable):

```sh
#!/bin/sh
set -e
while read local_ref local_sha remote_ref remote_sha; do
  if echo "$remote_ref" | grep -qE '^refs/heads/(main|master)$'; then
    echo "Direct push to ${remote_ref} is not allowed. Open a pull request instead."
    exit 1
  fi
done
```

```yaml
pre-push:
  commands:
    block-main:
      run: sh scripts/hooks/check-push-target.sh
    branch-naming:
      run: |
        BRANCH=$(git symbolic-ref HEAD 2>/dev/null | sed 's|refs/heads/||')
        BRANCH_PATTERN='^(feature|feat|bugfix|fix|hotfix|release|chore)/[a-z0-9]+([.-][a-z0-9]+)*$'
        TRUNK_PATTERN='^(main|master|develop)$'
        if [ -n "$BRANCH" ] && ! echo "$BRANCH" | grep -qE "$TRUNK_PATTERN" && ! echo "$BRANCH" | grep -qE "$BRANCH_PATTERN"; then
          echo "Branch '$BRANCH' does not follow Conventional Branch naming."
          echo "Format: <type>/<description>  e.g. feat/add-login, fix/null-deref"
          echo "Valid types: feature, feat, bugfix, fix, hotfix, release, chore"
          echo "Rename with: git branch -m $BRANCH <new-name>"
          exit 1
        fi
```

Make the script executable: `chmod +x scripts/hooks/check-push-target.sh`

---

## Adding a New Check

### Husky

1. Run `grep -q '<your-command>' .husky/<hook>` — if it exits 0 the command is already present; stop here.
2. If not found, append the command to the hook file using a file edit tool, not a shell redirect.
3. Make the hook executable: `chmod +x .husky/<hook>`

### Lefthook

1. Check `lefthook.yml` — if a command with the same key or `run` value already exists under the relevant hook section, stop here.
2. If not found, add a new named command entry under the appropriate section in `lefthook.yml`.
3. Run `lefthook install` to re-sync (Lefthook re-reads `lefthook.yml` on each run, but re-installing ensures the hook binary is up to date).

---

## Commit, push, and open a PR

Once the hooks are installed and verified, offer to ship the changes — don't force it:

> "Want me to commit these hook changes to a feature branch, push, and open a PR?"

If the user would rather review and push themselves, skip this — but ask them to add the `skill:git-hooks-setup` label and the `*🤖 Generated with git-hooks-setup*` footer when they open the PR, so usage stays trackable. The label makes usage queryable with `gh pr list --label "skill:git-hooks-setup"`.

If yes, run the full flow:

1. **Branch.** Check the current branch with `git rev-parse --abbrev-ref HEAD`. If it is a trunk branch (`main`, `master`, `develop`), create a feature branch — a PR cannot target the branch it is opened from:

   ```bash
   git checkout -b chore/setup-git-hooks
   ```

   If already on a feature branch, stay on it.

2. **Commit** the hook files and config:

   ```bash
   git add .husky lefthook.yml scripts/hooks .gitleaks.toml .lintstagedrc* package.json 2>/dev/null
   git commit -m "chore: set up git hooks"
   ```

   Stage only the files this skill actually created or changed — adjust the paths above to match the hook manager used.

3. **Push** the branch to its remote (a PR needs the branch to exist on the remote first):

   ```bash
   git push -u origin HEAD
   ```

4. **Open the PR.** Ensure the usage-tracking label exists, then create the PR with the label and a visible footer:

   ```bash
   gh label create "skill:git-hooks-setup" --color ededed --description "Opened with the git-hooks-setup skill" 2>/dev/null || true

   gh pr create --draft \
     --title "chore: set up git hooks" \
     --label "skill:git-hooks-setup" \
     --body "$(cat <<'EOF'
   ## Summary

   <!-- Hook manager (Husky/Lefthook), what runs on pre-commit and pre-push -->

   ---

   *🤖 Generated with git-hooks-setup*
   EOF
   )"
   ```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Node commands fail silently in Husky hook | Hooks run in non-interactive shells — source the version manager at the top of each hook |
| TSC errors on generated or dist files | TSC does not read `.gitignore` — add output dirs to `exclude` in `tsconfig.json` |
| TSC only checks staged files | Always `tsc --noEmit` without file args — TSC needs the full project graph |
| Husky hook file not executable | `chmod +x .husky/<hook-name>` — git silently skips non-executable hooks |
| Husky v8 patterns used instead of v9 | Do not generate `husky install`, `husky add`, or the `_/husky.sh` shim — these are v8 only. v9 uses `husky init` and a `prepare` script. |
| Main branch check never fires (Husky) | Use the `while read` stdin loop — `git branch --show-current` reads local state, not the push target |
| Branch pattern rejects detached HEAD | Guard with `[ -n "$BRANCH" ]` before pattern matching |
| Consecutive hyphens/dots pass naive pattern | Use `[a-z0-9]+([.-][a-z0-9]+)*` — requires every separator to be followed by alphanumeric |
| lint-staged wired but config is empty | The hook runs but does nothing — use `lint-setup` to configure what lint-staged runs |
| Lefthook `{staged_files}` empty on first commit | Expected — no staged files matching the glob means the command is skipped, not an error |
| Lefthook `stage_fixed: true` not set | Fixed files won't be restaged — the commit will contain the unfixed version |
| Lefthook not re-installed after `lefthook.yml` changes | `lefthook.yml` is read fresh on each hook run — no reinstall needed for config changes; only reinstall if the hook binary itself needs updating |
