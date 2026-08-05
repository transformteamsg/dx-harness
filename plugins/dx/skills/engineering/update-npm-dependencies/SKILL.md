---
name: update-npm-dependencies
description: Use when a dependency audit flags vulnerable packages in a JavaScript/TypeScript project, when CI fails a security check, or when preparing a branch for merge and security hygiene is required. Works across npm, pnpm, Yarn (classic and berry), and Bun — detects the package manager automatically. Trigger this whenever someone mentions "audit", "vulnerable dependency", "CVE in a package", "npm audit failing", "supply-chain risk", or "bump the insecure transitive dep", even if they don't name a package manager. Applies a 7-day release cooldown to avoid pulling in freshly-published malicious versions.
---

# Updating Vulnerable Dependencies (npm / pnpm / Yarn / Bun)

## Overview

Resolve dependency vulnerabilities with the minimum blast radius, regardless of which package manager the project uses. The escalation order is the same everywhere: **update within range → upgrade the parent → override as a last resort.** Overrides are a last resort and should be removed once the parent ships a fix.

**Avoid freshly-published versions (7-day cooldown).** Supply-chain attacks routinely ship as a brand-new "patch" release of a popular package — a compromised maintainer token or a hijacked publish — and get pulled into projects within hours. Defend against this by never adopting a version that was published in the **last 7 days**. Prefer the oldest patched release that fixes the vulnerability, and let new releases age before you trust them. The one exception is when the *only* version that fixes a real vulnerability is younger than 7 days — then stop and surface the tradeoff to a human (a known CVE vs. an un-aged release) rather than auto-installing either way.

The *workflow* below is identical across package managers — only the *commands* and the *overrides field* differ. The [Command reference](#command-reference) table is the single place that maps each logical step to the concrete command for npm, pnpm, Yarn, and Bun. Read the package manager you detected in Step 0, then follow the steps using that column.

## Step 0: Detect the package manager (and abort if this isn't a JS project)

There is nothing to audit if the repo has no JavaScript/TypeScript dependencies. Bail out early rather than running an audit command that errors or silently does nothing.

Run this detection first:

```bash
# 1. No package.json → not a Node/JS project. Abort.
if [ ! -f package.json ]; then
  echo "No package.json found — this is not a JS/TS project. Nothing to audit."
  exit 0
fi

# 2. package.json exists but declares no dependencies of any kind, and there's no
#    lockfile → nothing is installed to audit. Abort.
has_deps=$(node -e "const p=require('./package.json');\
  const keys=['dependencies','devDependencies','optionalDependencies','peerDependencies'];\
  console.log(keys.some(k=>p[k]&&Object.keys(p[k]).length))" 2>/dev/null)
has_lockfile=$(ls pnpm-lock.yaml yarn.lock bun.lockb bun.lock package-lock.json npm-shrinkwrap.json 2>/dev/null | head -n1)

if [ "$has_deps" != "true" ] && [ -z "$has_lockfile" ]; then
  echo "package.json declares no dependencies and there is no lockfile. Nothing to audit."
  exit 0
fi
```

If you don't have `node` available, inspect `package.json` by reading it: if the `dependencies`/`devDependencies`/`optionalDependencies`/`peerDependencies` objects are all absent or empty **and** no lockfile exists, abort with the same message.

**Then determine which package manager to use**, in priority order:

1. **`packageManager` field** in `package.json` (e.g. `"packageManager": "pnpm@9.1.0"`) — authoritative when present. The prefix before `@` is the package manager.
2. **Lockfile present** (when no `packageManager` field):

   | Lockfile                                | Package manager |
   | --------------------------------------- | --------------- |
   | `pnpm-lock.yaml`                        | pnpm            |
   | `yarn.lock`                             | Yarn            |
   | `bun.lockb` or `bun.lock`               | Bun             |
   | `package-lock.json` / `npm-shrinkwrap.json` | npm         |

3. **No lockfile and no `packageManager` field** → default to **npm** (the most common toolchain) and note the assumption to the user.

If **multiple** lockfiles exist, the `packageManager` field wins; if there's no such field, prefer the lockfile that matches the most recently modified one and flag the ambiguity to the user.

**Yarn classic vs. berry** — these have different commands (see the table). Detect the version:

```bash
yarn --version    # >= 2.0.0 → berry (Yarn 2+).  1.x → classic.
```

A `.yarnrc.yml` file (instead of `.yarnrc`) or a `yarn.lock` that begins with `__metadata:` also indicates berry.

## Command reference

Use the column for the package manager you detected. `<pkg>` is the vulnerable package; `<v>` is a safe version; `<parent>` is the top-level dependency that pulls in `<pkg>`.

| Logical step                        | npm                                       | pnpm                                  | Yarn classic (1.x)              | Yarn berry (2+)                        | Bun                                |
| ----------------------------------- | ----------------------------------------- | ------------------------------------- | ------------------------------- | -------------------------------------- | ---------------------------------- |
| **Audit**                           | `npm audit`                               | `pnpm audit`                          | `yarn audit`                    | `yarn npm audit --all --recursive`     | `bun audit`                        |
| **Show dependency chain**           | `npm why <pkg>` (or `npm ls <pkg>`)       | `pnpm why <pkg>`                      | `yarn why <pkg>`                | `yarn why <pkg>`                       | `bun why <pkg>` (or `bun pm ls`)   |
| **Update all (within ranges)**      | `npm update`                              | `pnpm update`                         | `yarn upgrade`                  | `yarn up "*"`                          | `bun update`                       |
| **Update one (within range)**       | `npm update <pkg>`                        | `pnpm update <pkg>`                   | `yarn upgrade <pkg>`            | `yarn up <pkg>`                        | `bun update <pkg>`                 |
| **Install an exact safe version**   | `npm install <pkg>@<v>`                   | `pnpm add <pkg>@<v>`                  | `yarn add <pkg>@<v>`            | `yarn add <pkg>@<v>`                   | `bun add <pkg>@<v>`                |
| **List published versions**         | `npm view <pkg> versions --json`          | `pnpm info <pkg> versions --json`     | `yarn info <pkg> --json`        | `yarn npm info <pkg> --json`           | `bun pm view <pkg> versions`       |
| **Check dist-tags (latest/next)**   | `npm view <pkg> dist-tags`                | `pnpm info <pkg> dist-tags`           | `yarn info <pkg> dist-tags`     | `yarn npm info <pkg> --json`           | `bun pm view <pkg>`                |
| **Check a version's publish date**  | `npm view <pkg> time --json`              | `pnpm info <pkg> time --json`         | `yarn info <pkg> time`          | `npm view <pkg> time --json`           | `npm view <pkg> time --json`       |
| **Force fresh lockfile resolution** | `rm package-lock.json && npm install`     | `pnpm install --force`                | `yarn install --force`          | `rm yarn.lock && yarn install`         | `bun install --force`              |
| **Run tests**                       | `npm test`                                | `pnpm test`                           | `yarn test`                     | `yarn test`                            | `bun test`                         |
| **Overrides field in package.json** | `overrides`                               | `pnpm.overrides`                      | `resolutions`                   | `resolutions`                          | `overrides`                        |

Notes:

- **Bun's audit** (`bun audit`) and `bun why` require a recent Bun (≈ v1.2+). On older Bun, there is no native audit — install once with `bun install` and run `npm audit` against the resulting tree, or upgrade Bun.
- **Yarn classic `yarn audit`** is read-only (there is no safe `--fix`). Resolve via `yarn upgrade` or `resolutions`.
- Command flags drift between versions. If a command isn't recognized, check `<pm> <subcommand> --help` rather than guessing.

## Decision Flow

```mermaid
flowchart TD
    A([Step 0: detect PM / abort if not JS]) --> AA([audit])
    AA --> B{Vulnerabilities?}
    B -- no --> Z([Done ✓])
    B -- yes --> R[Reconcile existing overrides\nremove stale, re-pin bad ones]
    R --> C[Classify each vuln]
    C --> D{Direct dep?}

    D -- yes --> E[Verify safe version exists]
    E --> F[update / add &lt;package&gt;]
    F --> K

    D -- no - transitive --> G[update all]
    G --> H{Resolved?}
    H -- yes --> K
    H -- no --> I[why &lt;pkg&gt;\ncheck installed version]
    I --> J{Version changed?}
    J -- yes, still vulnerable --> L{Can parent be upgraded?}
    J -- no - stale lockfile --> M[force fresh resolution]
    M --> H

    L -- yes --> N[update &lt;parent&gt;]
    N --> K
    L -- no - abandoned / at latest / blocked --> O[Verify safe version exists]
    O --> P[Add overrides / resolutions\npinned to exact safe version]
    P --> K

    K([audit - final]) --> Q{All clear?}
    Q -- yes --> Z
    Q -- no - iterate --> C
```

## Step 1: Audit

Run the **Audit** command for your package manager. Read the output for each vulnerability:

- **Package** — the vulnerable package name
- **Paths / dependency chain** — `.>parent>vulnerable-pkg` means it's transitive
- **Patched versions** — the minimum safe version

## Step 2: Classify

| Type       | Signal                                                             | Fix path                |
| ---------- | ------------------------------------------------------------------ | ----------------------- |
| Direct     | Package is in your `package.json` `dependencies`/`devDependencies` | Update it directly      |
| Transitive | Appears under a chain in **Paths**                                 | Escalate in order below |

Use the **Show dependency chain** command to see the full path before acting — without it, you risk updating the wrong package.

## Step 3: Verify a safe version exists and is mature enough

Before upgrading or overriding, confirm the patched version is actually published, using the **List published versions** and **Check dist-tags** commands.

Pick the **lowest** published version that satisfies the **Patched versions** requirement from the audit report. Prefer a patch/minor bump over a major version change.

**Then check its publish date** with the **Check a version's publish date** command and apply the 7-day cooldown from the Overview. `npm view <pkg> time --json` returns a `version → ISO-timestamp` map; this command works regardless of package manager because npm ships with Node and reads the same registry. Find your candidate version's timestamp and confirm it is **at least 7 days old**:

```bash
npm view <pkg> time --json     # look up your candidate version's date in the output
# A version is too young if (today − publish date) < 7 days.
# Prefer the oldest version that still satisfies the patched-versions requirement.
```

- If a patched version **≥ 7 days old** exists, use it.
- If the **only** version that fixes the vulnerability was published in the last 7 days, **stop and ask a human.** Lay out the tradeoff explicitly: staying on the known-vulnerable version vs. installing an un-aged release that hasn't had time to be flagged. Do not silently pick either.

**pnpm enforces this natively.** pnpm (≥ 10.16) supports a `minimumReleaseAge` setting (minutes) in `pnpm-workspace.yaml`, which makes pnpm refuse to install versions younger than the threshold across the whole project — a durable guardrail beyond this one fix:

```yaml
# pnpm-workspace.yaml
minimumReleaseAge: 10080   # 7 days, in minutes
```

For npm, Yarn, and Bun, there's no equally universal native setting — rely on the manual publish-date check above (some Bun versions expose a `minimumReleaseAge` in `bunfig.toml`; check your version).

## Step 4: Fix (escalate in order)

### A. Reconcile any existing overrides first

Before escalating anything, deal with the overrides / `resolutions` already in `package.json`. Do this first for two reasons:

- **An override forces its pinned version across the whole tree.** If a flagged package sits under an existing override, no amount of updating or parent-upgrading will change what resolves — the override wins. Escalating against it is wasted effort; you must fix the override itself.
- **Overrides accumulate and rot.** A parent may since have shipped a fix, making the override redundant. Escalating on top of stale overrides just adds more cruft to reason about later.

**Important:** the **Show dependency chain** command with an override in place always shows the *overridden* version — it cannot tell you whether the override is still needed. You must remove the override and reinstall to see natural resolution.

For each existing override / `resolutions` entry:

1. Remove it from `package.json`
2. Run the plain install command
3. Check the naturally-resolved version with **Show dependency chain**
4. Run **Audit**
5. Audit clean → the override was stale; leave it removed
6. Audit reports a vulnerability → the override is still needed. Restore it — but if the vulnerability is in the *pinned version itself* (a CVE landed in the version you pinned), re-pin to a newer patched version per section E rather than restoring the bad one.

Then continue the ladder below for whatever the audit still reports.

### B. Direct dependency — update it

Run **Update one (within range)**. If a major bump is required, use **Install an exact safe version** with the safe version.

**Watch for an exact-pinned spec.** **Update one** only moves a dependency *within its declared range*. If the manifest pins an exact version (e.g. `"fast-xml-parser": "4.2.5"`, no `^` or `~`), that range is a single version — so `npm update` / `pnpm update` / `bun update` is a **no-op even when a safe newer version exists**, and you'll be misled into thinking nothing can be done. Whenever the current spec is exact, reach straight for **Install an exact safe version** to rewrite the pin. This applies to any bump, not just majors. (The same is true for an exact-pinned *parent* in section D.)

### C. Transitive — try updating everything first

Run **Update all (within ranges)**, then **Audit** again. This pulls transitive deps to the newest version allowed by their parents' declared ranges, and often resolves the vulnerability with no further action.

**If the audit still reports the vulnerability**, check whether the installed version actually changed — an update may have bumped a parent but left the transitive entry stale in the lockfile. Run the **Show dependency chain** command to confirm which version is actually installed.

If the installed version is still old despite the parent being updated, the lockfile has a stale entry. Run **Force fresh lockfile resolution**, then **Audit** again.

A forced re-resolution is the right tool here because the stale entry lives in the **lockfile** — it dictates which version is used. Pruning `node_modules` or the package store operates on a different layer and won't change what the lockfile resolves to; the package manager would just re-download the same old version the lockfile still specifies.

**STOP HERE if resolved.** Do not escalate to parent upgrades or overrides until you've confirmed the version did not change after a forced reinstall.

### D. Transitive — upgrade the parent if still unresolved

The parent's declared range may be too narrow to pull in the patched transitive version. Identify the top-level parent with the **Show dependency chain** command, then run **Update one (within range)** on the parent. If a major bump is needed, use **Install an exact safe version**. Re-run **Audit**.

**STOP HERE if resolved.**

### E. Override — last resort only

Use only when the parent **cannot** be upgraded (abandoned, API incompatibility, blocked by other constraints). Pin the override to the **exact patched version** — not a caret (`^`) or `>=` range. Two reasons:

- **Blast radius.** An override forces its version across the *entire* tree, including on parents that only ever expected an older range. The narrower you pin, the smaller the chance of a compatibility break.
- **Cooldown.** A range is actively unsafe here: `^1.2.3` lets the install silently adopt a *future* patch the moment it publishes, with **no 7-day cooldown** — precisely the fresh-release supply-chain risk this skill defends against everywhere else. Pinning exact keeps you in control; re-audit and re-pin deliberately when a newer patched version is actually needed.

The field name depends on the package manager (see the table):

**npm / Bun** — `overrides`:

```json
{
  "overrides": {
    "vulnerable-package": "<safe-version>"
  }
}
```

**pnpm** — `pnpm.overrides`:

```json
{
  "pnpm": {
    "overrides": {
      "vulnerable-package": "<safe-version>"
    }
  }
}
```

**Yarn (classic and berry)** — `resolutions`:

```json
{
  "resolutions": {
    "vulnerable-package": "<safe-version>"
  }
}
```

Then run the package manager's plain install command (`npm install` / `pnpm install` / `yarn install` / `bun install`) and **Audit** again.

**Confirm the forced version is actually compatible.** Because an override bypasses the resolver's normal range-checking, it can install a version a parent never declared support for. A clean audit does *not* mean the tree is sound. Check for the signals that the forced version doesn't fit:

- **Peer-dependency warnings or `ERESOLVE` errors in the install output** — don't dismiss them. An override that provokes these is forcing a version some parent explicitly disagrees with.
- **`npm ls <pkg>`** (or the PM equivalent from **Show dependency chain**) flagging the forced version as `invalid` or `unmet peer`.
- The **test suite** (Step 6) remains the backstop for behavioural breaks the install step can't surface.

If the safe version is incompatible with a parent that can't be upgraded, you're wedged between a known vulnerability and a broken build — don't paper over it. Prefer the safe version *closest* to what the parent expects (e.g. the lowest patched release in the major the parent already allows). If **no** version is both safe and compatible, stop and surface the tradeoff to a human — the same rule as the 7-day-cooldown deadlock in Step 3.

Document in the PR description why the override was necessary, what prevents a proper upgrade, and any compatibility caveats.

## Step 5: Final Verification

Run **Audit** one more time. All vulnerabilities must be resolved. If any remain, document them with a reason (e.g., no upstream fix exists yet).

**If you upgraded a parent this cycle, re-check any override you kept in Step 4A** — the upgrade may have made it redundant. Remove it, reinstall, and audit; if clean, leave it removed. This catches overrides that only became stale *because* of the upgrades you just did (which the up-front reconciliation couldn't have known about).

## Step 6: Run the Test Suite

A clean audit doesn't mean nothing broke. Dependency bumps — especially parent upgrades or overrides — can introduce subtle behavioural regressions even when semver says they shouldn't. Run the full test suite before committing:

```bash
# use the Run tests command for your package manager (see command reference)
npm test   # or pnpm test / yarn test / bun test
```

If tests fail, check whether the failure is in code that touches the updated package. Options in order of preference:

1. **Fix the calling code** — if the new version changed an API and your code used it, update the call site.
2. **Pin to an older patched version** — if a patch within the safe range introduced a regression, pin to the lowest safe version that passes tests.
3. **Do not silence or skip failing tests** — a test failure means the update isn't safe to ship yet.

If the project has no test suite, note that explicitly in the PR description so reviewers know the change is unvalidated.

## Step 7: Commit, push, and open a PR

Once the audit is clean and tests pass, offer to ship the changes — don't force it:

> "Want me to commit these dependency updates to a feature branch, push, and open a PR?"

If the user would rather review and push themselves, skip this — but ask them to add the `skill:update-npm-dependencies` label and the `*🤖 Generated with update-npm-dependencies*` footer when they open the PR. The label makes usage queryable with `gh pr list --label "skill:update-npm-dependencies"`.

If yes, run the full flow:

1. **Branch.** Check `git rev-parse --abbrev-ref HEAD`. If on a trunk branch (`main`, `master`, `develop`), create a feature branch — a PR cannot target the branch it is opened from; otherwise stay on the current feature branch:

   ```bash
   git checkout -b fix/update-vulnerable-deps
   ```

2. **Commit** the manifest and lockfile changes — stage only what changed (the exact lockfile depends on the package manager detected in Step 0):

   ```bash
   git add package.json package-lock.json pnpm-lock.yaml yarn.lock bun.lockb bun.lock pnpm-workspace.yaml 2>/dev/null
   git commit -m "chore: update vulnerable dependencies"
   ```

3. **Push** the branch to its remote (a PR needs the branch on the remote first):

   ```bash
   git push -u origin HEAD
   ```

4. **Open the PR.** Ensure the usage-tracking label exists, then create the PR with the label and a visible footer:

   ```bash
   gh label create "skill:update-npm-dependencies" --color ededed --description "Opened with the update-npm-dependencies skill" 2>/dev/null || true

   gh pr create --draft \
     --title "chore: update vulnerable dependencies" \
     --label "skill:update-npm-dependencies" \
     --body "$(cat <<'EOF'
   ## Summary

   <!-- Each package updated, the vulnerability fixed, and the approach (direct update / parent upgrade / override) -->

   ## Audit result

   All vulnerabilities resolved. Test suite passes (or: note if there is no test suite).

   ---

   *🤖 Generated with update-npm-dependencies*
   EOF
   )"
   ```

---

## Common Mistakes

| Mistake                                            | Correct approach                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Running an audit before detecting the PM           | Do Step 0 first — the wrong command errors or no-ops; a non-JS repo should abort early |
| Jumping to overrides for transitive vulns          | Always try the update-all step first — it often resolves without overrides             |
| Using `audit --fix` (or `npm audit fix`) blindly   | It can silently introduce breaking major-version bumps; fix manually                   |
| Skipping the dependency-chain check                | Without knowing the chain, you risk updating the wrong package                         |
| Forgetting the final audit                         | Always re-run audit — a fix for one vuln can reveal others                             |
| Skipping tests after the update                    | A clean audit doesn't mean nothing broke — run the full test suite before committing   |
| Adding transitive deps as direct devDependencies   | Use overrides/`resolutions` instead; don't pollute devDependencies                     |
| Using a range (`^` or `>=`) in an override         | Pin the *exact* patched version — a range widens the blast radius and lets a future patch install with no 7-day cooldown |
| Putting `overrides` where the PM expects `resolutions` (or vice versa) | Match the field to the package manager — npm/Bun use `overrides`, pnpm uses `pnpm.overrides`, Yarn uses `resolutions` |
| Leaving overrides in place permanently             | Check after each upgrade cycle whether the parent now resolves safely on its own       |
| Overriding before confirming a safe version exists | Check published versions / dist-tags first to confirm the patched release exists       |
| Assuming a clean audit means the override tree is sound | An override skips range-checking — also check install output for `ERESOLVE` / peer warnings and `npm ls` for `invalid` markers; if safe + compatible is impossible, ask a human |
| Installing a version published in the last 7 days  | Apply the cooldown — prefer the oldest patched release; if only a fresh version fixes it, ask a human before installing |
