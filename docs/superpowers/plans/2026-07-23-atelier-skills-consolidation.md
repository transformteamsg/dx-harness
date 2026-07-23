# Atelier Skills Consolidation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the 8 engineering skills from `gh-ai-first-taskforce` and the 11 design skills (+ standards catalog, checks, evaluator agent) from `tfx-design-standard` into a single Claude Code plugin `tfx` inside the `atelier` repo, installable via a marketplace and portable to Claude Desktop / other harnesses.

**Architecture:** One marketplace (`.claude-plugin/marketplace.json`) → one plugin (`plugins/tfx/`). Skills live in two flat category folders (`skills/engineering/`, `skills/design/`) loaded via a `skills` array in `plugin.json`; both invoked under the single `/tfx:` namespace. The design bundle's supporting `standards/`, `checks/`, and `agents/evaluator.md` sit at the plugin root, preserving the design skills' `../../../` relative paths unchanged.

**Tech Stack:** Markdown skills (`SKILL.md`), JSON plugin manifests, Python 3 check scripts (moved verbatim, not modified).

## Global Constraints

- One plugin only, named `tfx`; single invocation namespace `/tfx:`.
- Skills grouped into `plugins/tfx/skills/engineering/` and `plugins/tfx/skills/design/`, each **flat one level deep** (`<category>/<skill>/SKILL.md`).
- **No skill folder directly under a bare `skills/` root** — Claude Code always also scans `skills/`, so a stray skill there would double-load.
- Engineering skills drop the `aif-` prefix (dir name + frontmatter `name:` + all cross-references); design skills keep their names and existing `/tfx:` references.
- Bring only: the 19 skills, `standards/`, `checks/`, `agents/evaluator.md`. Leave behind both source repos' websites, gh-extension entry point, git hooks, templates, trials, sample apps, plans, evals-harness, and prose docs.
- Design skills' relative locators (`../../../standards/…`, `../../../checks/…`) MUST remain valid — the layout is chosen to preserve them; verify, do not rewrite.
- All work on a feature branch, never directly on `main`.
- Marketplace name: `atelier`. Plugin `version` resets to `0.1.0`.
- Catalog control count is **70** (any count claim in the plugin README must equal this).

---

### Task 1: Scaffold the repo skeleton, feature branch, and JSON adapters

**Files:**
- Create: `.claude-plugin/marketplace.json`
- Create: `plugins/tfx/.claude-plugin/plugin.json`
- Create (dirs): `plugins/tfx/skills/engineering/`, `plugins/tfx/skills/design/`, `plugins/tfx/agents/`, `docs/`

**Produces:** the directory tree and both manifests that Tasks 2–4 populate.

- [ ] **Step 1: Create the feature branch**

Run from `/Users/nicholaslim/transform-repos/atelier`:
```bash
git checkout -b feat/consolidate-skills
```
Expected: `Switched to a new branch 'feat/consolidate-skills'`

- [ ] **Step 2: Clone both source repos to a temp workspace**

```bash
SRC="${TMPDIR:-/tmp}/atelier-src"
rm -rf "$SRC" && mkdir -p "$SRC"
git clone --depth 1 https://github.com/string-dxd/gh-ai-first-taskforce.git "$SRC/aif"
git clone --depth 1 https://github.com/transformteamsg/tfx-design-standard.git "$SRC/tfx"
```
Expected: both `Cloning into …` complete. A `failed to store: 100001` keychain warning is harmless — verify success with:
```bash
test -d "$SRC/aif/skills" && test -d "$SRC/tfx/harness/.claude/skills" && echo "SOURCES OK"
```
Expected: `SOURCES OK`

- [ ] **Step 3: Create the directory skeleton**

```bash
cd /Users/nicholaslim/transform-repos/atelier
mkdir -p .claude-plugin plugins/tfx/.claude-plugin plugins/tfx/skills/engineering plugins/tfx/skills/design plugins/tfx/agents docs
```

- [ ] **Step 4: Write `.claude-plugin/marketplace.json`**

```json
{
  "name": "atelier",
  "description": "Atelier — consolidated engineering and design skills for agentic product development.",
  "owner": {
    "name": "TransformX, GovTech Singapore"
  },
  "plugins": [
    {
      "name": "tfx",
      "source": "./plugins/tfx",
      "description": "Engineering + design skills: GitHub issue workflow, code review, lint/hooks setup, dependency hygiene, and the TFX design loop with standards catalog + evaluator agent."
    }
  ]
}
```

- [ ] **Step 5: Write `plugins/tfx/.claude-plugin/plugin.json`**

```json
{
  "name": "tfx",
  "displayName": "Atelier (TFX)",
  "version": "0.1.0",
  "license": "MIT",
  "description": "Engineering + design skills for agentic product development: issue workflow, code review, lint/hooks, dependency hygiene, and the TFX design loop with standards catalog + evaluator agent.",
  "keywords": ["skills", "design", "engineering", "code-review", "design-system", "tfx"],
  "skills": ["./skills/engineering/", "./skills/design/"],
  "agents": ["./agents/evaluator.md"]
}
```

- [ ] **Step 6: Validate both JSON files parse**

```bash
python3 -c "import json; json.load(open('.claude-plugin/marketplace.json')); json.load(open('plugins/tfx/.claude-plugin/plugin.json')); print('JSON OK')"
```
Expected: `JSON OK`

- [ ] **Step 7: Commit**

```bash
git add .claude-plugin plugins/tfx/.claude-plugin
git commit -m "chore: scaffold atelier marketplace + tfx plugin manifests"
```

---

### Task 2: Migrate the design bundle (skills + agent + standards + checks)

**Files:**
- Create: `plugins/tfx/skills/design/{start,setup,design,critique,standards,copy,polish,motion,flow,layout,feedback}/…`
- Create: `plugins/tfx/agents/evaluator.md`
- Create: `plugins/tfx/standards/…`, `plugins/tfx/checks/…`

**Consumes:** the skeleton and `$SRC/tfx` from Task 1.
**Produces:** the design half of the plugin, with `../../../` relative paths intact.

- [ ] **Step 1: Copy the 11 design skills into the `design/` category folder**

```bash
SRC="${TMPDIR:-/tmp}/atelier-src"
cd /Users/nicholaslim/transform-repos/atelier
cp -R "$SRC"/tfx/harness/.claude/skills/. plugins/tfx/skills/design/
```
Verify all 11 present:
```bash
ls plugins/tfx/skills/design | sort | tr '\n' ' '
```
Expected: `copy critique design feedback flow layout motion polish setup standards start`

- [ ] **Step 2: Copy the evaluator agent, standards catalog, and checks**

```bash
cp "$SRC"/tfx/harness/.claude/agents/evaluator.md plugins/tfx/agents/evaluator.md
cp -R "$SRC"/tfx/harness/standards plugins/tfx/standards
cp -R "$SRC"/tfx/harness/checks    plugins/tfx/checks
```
Verify:
```bash
test -f plugins/tfx/agents/evaluator.md && test -f plugins/tfx/standards/catalog.yaml && test -f plugins/tfx/checks/validate.py && echo "BUNDLE OK"
```
Expected: `BUNDLE OK`

- [ ] **Step 3: Verify the design skills' `../../../` locators still resolve**

This is the critical layout invariant. From a design skill dir, `../../../standards/…` must reach the real catalog:
```bash
test -f plugins/tfx/skills/design/design/../../../standards/catalog.yaml && \
test -f plugins/tfx/skills/design/critique/../../../standards/catalog.yaml && \
test -f plugins/tfx/skills/design/setup/../../../checks/README.md && \
echo "RELATIVE PATHS OK"
```
Expected: `RELATIVE PATHS OK`
(If this fails, the category-folder depth is wrong — STOP and re-check the tree before proceeding.)

- [ ] **Step 4: Verify the catalog parses and has the expected control count**

```bash
python3 -c "import yaml; c=yaml.safe_load(open('plugins/tfx/standards/catalog.yaml'))['controls']; print('CATALOG OK', len(c), 'controls'); assert len(c)==70, 'expected 70'"
```
Expected: `CATALOG OK 70 controls`

- [ ] **Step 5: Confirm every control's detail file came across**

```bash
python3 -c "
import yaml, os
c=yaml.safe_load(open('plugins/tfx/standards/catalog.yaml'))['controls']
missing=[x['id'] for x in c if x.get('detail') and not os.path.exists(os.path.join('plugins/tfx/standards', x['detail']))]
print('MISSING DETAILS:', missing or 'none')
assert not missing"
```
Expected: `MISSING DETAILS: none`

- [ ] **Step 6: Sanity-check the check tooling is intact**

```bash
python3 plugins/tfx/checks/validate.py --self-test
```
Expected: exits 0 (self-test passes). NOTE: a full `python3 checks/validate.py` run also enforces repo-specific tfx-sync markers (COUNT-SYNC against README, WIRING-SYNC against CI) that assume the source website repo; getting those green in atelier is **out of scope** for this consolidation (see spec). The `--self-test` confirms the script itself survived the move.

- [ ] **Step 7: Commit**

```bash
git add plugins/tfx/skills/design plugins/tfx/agents plugins/tfx/standards plugins/tfx/checks
git commit -m "feat: migrate TFX design skills, standards catalog, checks, and evaluator agent"
```

---

### Task 3: Migrate the engineering skills and drop the `aif-` prefix

**Files:**
- Create: `plugins/tfx/skills/engineering/{code-review,create-issue,groom-issue,split-issue,implement-issue,lint-setup,git-hooks-setup,update-npm-dependencies}/…`

**Consumes:** the skeleton and `$SRC/aif` from Task 1.
**Produces:** the engineering half of the plugin, all skills renamed without the `aif-` prefix.

- [ ] **Step 1: Copy the 8 engineering skills, renaming each folder to drop `aif-`**

```bash
SRC="${TMPDIR:-/tmp}/atelier-src"
cd /Users/nicholaslim/transform-repos/atelier
for d in "$SRC"/aif/skills/aif-*/; do
  name=$(basename "$d" | sed 's/^aif-//')
  cp -R "$d" "plugins/tfx/skills/engineering/$name"
done
ls plugins/tfx/skills/engineering | sort | tr '\n' ' '
```
Expected: `code-review create-issue git-hooks-setup groom-issue implement-issue lint-setup split-issue update-npm-dependencies`

- [ ] **Step 2: Strip the `aif-` prefix from every reference inside the engineering skills**

This rewrites frontmatter `name:` values and all inter-skill references (`aif-code-review` → `code-review`, etc.):
```bash
cd /Users/nicholaslim/transform-repos/atelier
find plugins/tfx/skills/engineering -type f \( -name '*.md' -o -name '*.json' \) -exec sed -i '' 's/aif-//g' {} +
```
Verify no `aif-` tokens remain:
```bash
grep -rn "aif-" plugins/tfx/skills/engineering && echo "STILL PRESENT — FIX" || echo "PREFIX CLEARED"
```
Expected: `PREFIX CLEARED`

- [ ] **Step 3: Fix the two `~/.claude/skills/...` absolute path references**

Step 2 left two references pointing at the old flat install path (`~/.claude/skills/create-issue/issue-template.md`). Rewrite them to be install-location-neutral (relative to the skill's own directory).

In `plugins/tfx/skills/engineering/create-issue/SKILL.md`, replace:
```
The canonical structure is in `issue-template.md` in this skill's directory (`~/.claude/skills/create-issue/issue-template.md`). Read that file
```
with:
```
The canonical structure is in `issue-template.md` in this skill's directory. Read that file
```

In `plugins/tfx/skills/engineering/groom-issue/SKILL.md`, replace:
```
The canonical issue structure is defined in `~/.claude/skills/create-issue/issue-template.md`. Refer to it
```
with:
```
The canonical issue structure is defined in the `create-issue` skill's `issue-template.md` (invoke `/tfx:create-issue` or read that skill's directory). Refer to it
```

- [ ] **Step 4: Verify each engineering skill's frontmatter `name:` matches its new folder**

```bash
cd /Users/nicholaslim/transform-repos/atelier
for d in plugins/tfx/skills/engineering/*/; do
  n=$(basename "$d"); fn=$(grep -m1 '^name:' "$d/SKILL.md" | sed 's/name:[[:space:]]*//')
  [ "$n" = "$fn" ] && echo "OK  $n" || echo "MISMATCH  folder=$n frontmatter=$fn"
done
```
Expected: eight `OK …` lines, no `MISMATCH`.

- [ ] **Step 5: Confirm no leftover absolute-path references**

```bash
grep -rn "~/.claude/skills" plugins/tfx/skills/engineering && echo "FIX REMAINING" || echo "PATHS CLEAN"
```
Expected: `PATHS CLEAN`

- [ ] **Step 6: Commit**

```bash
git add plugins/tfx/skills/engineering
git commit -m "feat: migrate engineering skills, drop aif- prefix, neutralize install paths"
```

---

### Task 4: Author the READMEs and install/contributing docs

**Files:**
- Create: `README.md` (repo root — replace the stub)
- Create: `plugins/tfx/README.md`
- Create: `docs/install.md`
- Create: `docs/CONTRIBUTING.md`

**Produces:** the human-facing entry points and the tool-neutral install guidance.

- [ ] **Step 1: Replace the root `README.md`**

Write `/Users/nicholaslim/transform-repos/atelier/README.md`:
```markdown
# atelier

AI harness for agentic-driven product development — a single Claude Code plugin
bundling engineering-workflow skills and design skills under one `/tfx:` namespace.

- **19 skills** in two groups: 8 engineering (`code-review`, `create-issue`,
  `groom-issue`, `split-issue`, `implement-issue`, `lint-setup`, `git-hooks-setup`,
  `update-npm-dependencies`) and 11 design (`start`, `setup`, `design`, `critique`,
  `standards`, `copy`, `polish`, `motion`, `flow`, `layout`, `feedback`).
- The design skills ship with their standards catalog (`plugins/tfx/standards/`),
  deterministic checks (`plugins/tfx/checks/`), and an `evaluator` agent.

## Install

See [docs/install.md](docs/install.md) for Claude Code, Claude Desktop, and other
harnesses. Quickstart (Claude Code):

    /plugin marketplace add transformteamsg/atelier
    /plugin install tfx@atelier

Then invoke any skill as `/tfx:<name>` (e.g. `/tfx:code-review`, `/tfx:design`).

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).
```

- [ ] **Step 2: Write `plugins/tfx/README.md`**

Write a plugin-level catalogue. It MUST state the control count as **70** to stay consistent with the catalog (COUNT-SYNC):
```markdown
# tfx plugin

Engineering + design skills for agentic product development, under one `/tfx:` namespace.

## Engineering skills

| Skill | What it does |
|---|---|
| `/tfx:code-review` | Reviews code changes — inline PR comments or local branch review. |
| `/tfx:create-issue` | Creates a well-structured GitHub issue for a coding agent. |
| `/tfx:groom-issue` | Fills in the implementer sections of an existing issue. |
| `/tfx:split-issue` | Decomposes an issue into atomic, single-PR child issues. |
| `/tfx:implement-issue` | Implements a GitHub issue by number or pasted body. |
| `/tfx:lint-setup` | Sets up linting/formatting after detecting project types. |
| `/tfx:git-hooks-setup` | Sets up or audits pre-commit / pre-push hooks (Husky or Lefthook). |
| `/tfx:update-npm-dependencies` | Audits and updates vulnerable JS/TS deps with a release cooldown. |

## Design skills

The design skills orchestrate the TFX design loop against a **70-control** standards
catalog (`standards/`), with deterministic `checks/` and a generator/evaluator split
(`agents/evaluator.md`). Start with `/tfx:start` for orientation and routing.

| Skill | What it does |
|---|---|
| `/tfx:start` | Orientation, context check, routing to the right design skill. |
| `/tfx:setup` | Per-user tool setup + product context init. |
| `/tfx:design` | The full design loop: intent → diverge → plan (gate) → implement → verify. |
| `/tfx:critique` | Evaluate an existing page → ranked suggestions → gated fixes. |
| `/tfx:standards` | How to read, filter, and apply the control catalog. |
| `/tfx:copy` · `polish` · `motion` · `flow` · `layout` | Focused single-dimension passes. |
| `/tfx:feedback` | Captures harness feedback mid-turn and files it as an issue. |
```

- [ ] **Step 3: Write `docs/install.md`**

```markdown
# Installing atelier skills

## Claude Code (plugin marketplace) — primary

    /plugin marketplace add transformteamsg/atelier
    /plugin install tfx@atelier

Skills appear as `/tfx:<name>`. Update with `/plugin marketplace update atelier`
then `/reload-plugins`.

The design skills need Python 3 + PyYAML for the `checks/` scripts. Run `/tfx:setup`
(or `/tfx:start`) for the per-user tool checklist.

## Claude Desktop (folder import)

Each skill under `plugins/tfx/skills/<group>/<skill>/` is a self-contained folder you
can import. To use the design skills, import the whole `plugins/tfx/` folder so the
`standards/` catalog and `checks/` travel with them.

## Other harnesses (Pi, OSS agents)

The canonical, tool-neutral sources are the `SKILL.md` files under
`plugins/tfx/skills/`. Point your harness at those directories directly; the
`.claude-plugin/*.json` manifests are a Claude-specific adapter and can be ignored.
```

- [ ] **Step 4: Write `docs/CONTRIBUTING.md`**

```markdown
# Contributing a skill

- Add a skill under `plugins/tfx/skills/engineering/` or `plugins/tfx/skills/design/`
  as `<skill-name>/SKILL.md`. Keep each skill one level deep inside its category
  folder — never place a skill directly under `skills/`.
- `SKILL.md` frontmatter needs `name:` (matching the folder) and a trigger-rich
  `description:`. Keep the body tool-neutral — no Claude-only assumptions or absolute
  install paths (`~/.claude/...`); reference sibling files relatively.
- All skills are invoked `/tfx:<name>`; names must be unique across both groups.
- Design skills locate the catalog via `../../../standards/…` (three levels up from
  the skill dir). Preserve that depth.
- If you add a new skill folder, no manifest change is needed — the `skills` array in
  `plugin.json` scans both category directories.
```

- [ ] **Step 5: Commit**

```bash
git add README.md plugins/tfx/README.md docs/install.md docs/CONTRIBUTING.md
git commit -m "docs: add root + plugin READMEs and install/contributing guides"
```

---

### Task 5: Acceptance — install the plugin locally and invoke a skill

**Files:** none created — this is the end-to-end acceptance gate.

**Consumes:** the complete plugin from Tasks 1–4.

- [ ] **Step 1: Final structure audit**

```bash
cd /Users/nicholaslim/transform-repos/atelier
echo "engineering:"; ls plugins/tfx/skills/engineering | wc -l
echo "design:";      ls plugins/tfx/skills/design | wc -l
test -z "$(find plugins/tfx/skills -maxdepth 1 -name SKILL.md)" && echo "NO STRAY ROOT SKILLS" || echo "STRAY SKILL AT skills/ ROOT — FIX"
```
Expected: `engineering: 8`, `design: 11`, `NO STRAY ROOT SKILLS`.

- [ ] **Step 2: Add the local marketplace and install the plugin (manual, in Claude Code)**

In a Claude Code session, add the marketplace from the local path and install:
```
/plugin marketplace add /Users/nicholaslim/transform-repos/atelier
/plugin install tfx@atelier
```
Expected: marketplace `atelier` added; plugin `tfx` installs without manifest errors.

- [ ] **Step 3: Confirm all 19 skills are discovered under `/tfx:`**

In the same session, open the skill/command list (e.g. type `/tfx:` and inspect completions, or `/help`).
Expected: all 8 engineering + 11 design skills appear as `/tfx:<name>`; no skill is missing and none appears un-namespaced.

- [ ] **Step 4: Smoke-invoke one skill from each group**

- Invoke `/tfx:code-review` on a trivial local diff → it starts its review flow (engineering half loads).
- Invoke `/tfx:standards` → it locates and reads `standards/catalog.yaml` via its relative path without a "file not found" error (design half + bundle wiring loads).

Expected: both run past their initial load without path/manifest errors. This confirms the `skills` array, the namespace, and the preserved `../../../` locators all work end-to-end.

- [ ] **Step 5: Finish the branch**

Use superpowers:finishing-a-development-branch to decide merge / PR. Do not merge to `main` without that gate.

---

## Notes carried from the spec (not tasks)

- `code-review` (engineering diff review) and `critique` (design review) are adjacent
  but intentionally distinct — both retained.
- Full `checks/validate.py` green-ness (its COUNT-SYNC / WIRING-SYNC / SKILL-SYNC
  markers) is coupled to the source website repo's README/CI conventions and is
  deferred — see the spec's "Out of scope".