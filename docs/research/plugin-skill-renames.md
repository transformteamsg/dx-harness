# Research: renaming skills in a published Claude Code plugin

**Issue:** [#35](https://github.com/transformteamsg/dx-harness/issues/35)
**Date:** 2026-08-06
**Sources:** Official Claude Code docs at code.claude.com (plugins, skills, plugin-marketplaces, plugins-reference, discover-plugins), verified 2026-08-06.

## Summary (answer first)

1. **There is no skill-level alias or deprecation mechanism.** Claude Code's only
   rename shim is the marketplace-level `renames` map, and it operates on **plugin**
   names, not skill names. Renaming a skill inside a plugin simply makes the old
   `/dx-harness:dx-<old>` command stop existing on the user's next plugin update —
   old invocations fail with "unknown command", with no migration notice.
2. **The invocation string comes from the SKILL.md frontmatter `name` field when
   present, falling back to the directory name.** All dx-harness skills set `name:`
   in frontmatter, so the user-facing command and the on-disk directory are
   independently renameable. This is the key staged-rename lever: you can change
   the command without touching the 20 relative-path cross-references
   (`../dx-critique/pass.md` etc.) that are bound to directory names — or keep a
   stub skill at the old name as a DIY deprecation shim.
3. **Updates are pull-based and gated by the `version` string.** dx-harness pins
   `"version": "0.1.0"` in `plugin.json`, so installed users receive *nothing* —
   including a rename — until that field is bumped *and* they refresh
   (`/plugin marketplace update dx-harness` + reinstall/`/plugin update`, or
   background auto-update, which is **off by default for third-party marketplaces**).
   A rename therefore lands atomically per user at update time, but stragglers keep
   the old names indefinitely; there is no forced migration.
4. **Practical consequence for dx-harness:** a rename is a breaking change that must
   ship in one version bump together with edits to every `/dx-harness:dx-<old>`
   string in READMEs/ONBOARDING/skill bodies, plus (if directories move) all
   relative cross-references. The safest staged pattern is: (a) rename via
   frontmatter `name` only, directories unchanged; (b) leave a deprecated stub skill
   under the old name for one or two releases whose body says "this skill was
   renamed; follow `../<new-dir>/SKILL.md`"; (c) delete the stub later.

## Details

### How installed plugins update when the marketplace repo changes

- Users refresh their local catalog with `/plugin marketplace update <name>`;
  installed plugins update via `/plugin update` or background auto-update.
  "Once your marketplace is live, you can update it by pushing changes to your
  repository. Users refresh their local copy with `/plugin marketplace update`."
  ([plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces))
- Version resolution order: `version` in the plugin's `plugin.json` → `version` in
  the marketplace entry → the git commit SHA of the plugin source. "If `plugin.json`
  declares `\"version\": \"1.0.0\"`, pushing new commits without changing that
  string does nothing for existing users, because Claude Code sees the same version
  and keeps the cached copy."
  ([plugins-reference § Version management](https://code.claude.com/docs/en/plugins-reference#version-management))
  dx-harness sets `"version": "0.1.0"` in
  `plugins/dx-harness/.claude-plugin/plugin.json`, so every release — including a
  rename — requires a version bump to reach users. Omitting `version` would switch
  to per-commit updates.
- Auto-update: "Claude Code checks for marketplace and plugin updates after your
  session starts, with a random delay of up to ten minutes … Official Anthropic
  marketplaces have auto-update enabled by default. **Third-party and local
  development marketplaces have auto-update disabled by default.**" Admins can set
  `"autoUpdate": true` on an `extraKnownMarketplaces` entry in managed settings.
  ([discover-plugins § Configure auto-updates](https://code.claude.com/docs/en/discover-plugins#configure-auto-updates))
- Plugins are copied into a local versioned cache at `~/.claude/plugins/cache`;
  users run the cached copy, not the repo.
  ([plugin-marketplaces § Plugin sources](https://code.claude.com/docs/en/plugin-marketplaces#plugin-sources))

### What controls the invocation string: frontmatter `name` vs directory name

From [skills § How a skill gets its command name](https://code.claude.com/docs/en/skills#how-a-skill-gets-its-command-name):

> "In a plugin skill, `name` sets the last segment of the command and the plugin
> prefix stays in place. … `my-plugin/skills/review/SKILL.md` with `name: fancy`
> becomes `/my-plugin:fancy`. The bare `/fancy` also invokes the skill unless
> another command already uses that name."

- Plugin `skills/` subdirectory: command = frontmatter `name` **or** the directory
  name, namespaced by plugin. All dx-harness skills declare `name:` (e.g.
  `name: dx-design`), so today the frontmatter is authoritative and the directory
  name is inert for invocation purposes.
- The bare un-namespaced form (`/dx-design`) also works when unambiguous
  (v2.1.216+ behavior), so renames also break users' short-form muscle memory.
- For personal/project (non-plugin) skills, `name` is display-only and the
  directory name is the command — a difference worth remembering when testing
  outside the plugin.

### Alias / deprecation mechanisms: plugin-level only

- The **only** rename machinery is the top-level `renames` map in
  `marketplace.json` (Claude Code v2.1.193+), and it maps **plugin** names:
  "Map from a former plugin `name` to its current name, or to `null` if the plugin
  was removed. Lets existing users migrate automatically." Claude Code follows
  chains, rewrites `enabledPlugins`/`pluginConfigs` across settings scopes, and
  shows a one-line rename notice. Treat it as append-only history.
  ([plugin-marketplaces § Rename or remove a plugin](https://code.claude.com/docs/en/plugin-marketplaces#rename-or-remove-a-plugin))
- `displayName` exists at the plugin level to change UI labels without breaking
  installs — again, plugin-level, not skill-level.
- **Nothing equivalent exists for skills.** No `renames`, no `aliases`, no
  `deprecated` frontmatter field is documented in the SKILL.md frontmatter
  reference ([skills § Frontmatter fields](https://code.claude.com/docs/en/skills)).
  A DIY shim is possible: keep a stub skill at the old name whose description says
  it is deprecated and whose body redirects to the new skill (community plugins use
  the same "deprecated alias kept so existing installs keep resolving" pattern at
  the plugin level, e.g. the `beads-dolt` → `dolt-mcp-vcs` rename noted in
  community marketplace prior art).

### Cross-skill references after a rename

dx-harness skills reference each other two ways, with different failure modes:

1. **Relative file paths** (`../dx-critique/pass.md`, `../dx-setup/setup.md`, …):
   resolved on disk inside the plugin cache, bound to **directory names** only.
   Renaming frontmatter `name` does not affect them; renaming directories breaks
   all 20 of them (inventory below).
2. **Prose routing names in frontmatter descriptions** ("those go to design",
   "use critique", "the copy skill"): model-facing text that the model resolves
   against the skill listing. These degrade silently — routing quality drops rather
   than erroring — so they must be swept in the same release.
3. **Namespaced command strings in docs and skill bodies**
   (`/dx-harness:dx-start`): plain text; break visibly for humans following docs.

The `dx-evaluator` **agent** is unaffected by skill renames (agents are declared
separately in `plugin.json` `agents`), but it is referenced by name in
`checks/validate.py`, `standards/README.md`, and `dx-design`'s SKILL.md/verify.md —
so an evaluator rename would have its own blast radius.

## Repo-reference inventory (what a skill rename touches)

Paths relative to repo root; line numbers at commit `263055c`.

### Invocation strings `/dx-harness:dx-<name>` (break when frontmatter `name` changes)

| File:line | Reference |
|---|---|
| `README.md:8-10` | prose list of all 19 skill names |
| `README.md:39` | `/dx-harness:dx-design`, update instructions |
| `README.md:42-43` | `/dx-harness:dx-setup`, `/dx-harness:dx-start` |
| `README.md:56` | `/dx-harness:dx-code-review`, `/dx-harness:dx-design` |
| `plugins/dx-harness/README.md:23,27-33` | full skill table (`dx-start`, `dx-setup`, `dx-design`, `dx-critique`, `dx-standards`, `dx-copy`, `dx-polish`, `dx-motion`, `dx-flow`, `dx-layout`, `dx-feedback`) |
| `plugins/dx-harness/docs/ONBOARDING.md:27,35-36` | `/dx-harness:dx-start`, `dx-setup` path |
| `plugins/dx-harness/skills/design/dx-start/SKILL.md:9` | self-reference `/dx-harness:dx-start` |
| `plugins/dx-harness/skills/design/dx-setup/SKILL.md:15` | `/dx-harness:dx-start` |

### Relative-path cross-references (break when skill *directories* are renamed)

| File:line | Target |
|---|---|
| `plugins/dx-harness/skills/design/dx-design/SKILL.md:92,95` | `../dx-critique/layout-patterns.md`, `../dx-critique/critique.md` |
| `plugins/dx-harness/skills/design/dx-design/SKILL.md:414` | `../dx-copy/SKILL.md` |
| `plugins/dx-harness/skills/design/dx-design/verify.md:42` | `../dx-setup/setup.md` |
| `plugins/dx-harness/skills/design/dx-critique/pass.md:31` | `../dx-design/verify.md` |
| `plugins/dx-harness/skills/design/dx-critique/critique.md:10` | `../dx-setup/setup.md` |
| `plugins/dx-harness/skills/design/dx-motion/SKILL.md:13,23,29` | `../dx-critique/pass.md`, `../dx-design/implement-craft.md` |
| `plugins/dx-harness/skills/design/dx-layout/SKILL.md:13,27,32` | `../dx-critique/pass.md`, `../dx-critique/layout-patterns.md` |
| `plugins/dx-harness/skills/design/dx-copy/SKILL.md:24` | `../dx-critique/pass.md` |
| `plugins/dx-harness/skills/design/dx-polish/SKILL.md:13,22,26` | `../dx-critique/pass.md`, `../dx-design/implement-craft.md` |
| `plugins/dx-harness/skills/design/dx-flow/SKILL.md:14,26,31` | `../dx-critique/pass.md`, `../dx-design/SKILL.md` |

### Prose routing names in frontmatter descriptions (silent routing degradation)

- `plugins/dx-harness/skills/design/dx-design/SKILL.md:3` — routes to "copy",
  "standards", "critique" by short name.
- `plugins/dx-harness/skills/design/dx-critique/SKILL.md:3` — routes to "design",
  "copy", "the evaluator agent".

### Evaluator-agent references (unaffected by skill renames; own blast radius)

- `plugins/dx-harness/agents/dx-evaluator.md:2` (`name: dx-evaluator`)
- `plugins/dx-harness/checks/validate.py:322,407`
- `plugins/dx-harness/standards/README.md:100,116`
- `plugins/dx-harness/skills/design/dx-design/SKILL.md:441`, `verify.md:63-75`

### Not affected

- `plugins/dx-harness/checks/*.py` never reference design-skill names (only the
  evaluator agent path in `validate.py`).
- `standards/catalog.yaml` and control files carry no skill names.
- `.claude-plugin/marketplace.json` and `plugin.json` reference skill *directories*
  only as the `skills` roots (`./skills/design/`), not individual names.

## Implications for a staged rename

1. **A rename ships as an ordinary release.** Bump `version` in `plugin.json`
   (currently pinned at `0.1.0` — nothing reaches users without a bump), and land
   the rename plus every doc/prose sweep in the same commit so no version ever has
   mixed names.
2. **Prefer frontmatter-only renames.** Change `name:` in SKILL.md and leave the
   directory alone: the command changes, all 20 relative-path cross-references keep
   working, and git history stays clean. Rename directories later (or never) as a
   separate mechanical commit that also rewrites the relative paths.
3. **Build your own deprecation shim; the platform gives you none.** For one or two
   releases, keep a stub skill under the old name (old `name:` in a new small
   directory, or the old directory retained) with `disable-model-invocation: true`
   and a body that tells the model/user the skill was renamed and where to go. This
   preserves `/dx-harness:dx-<old>` muscle memory and any external docs. Delete the
   stub in a later release. Note the 1,536-character description budget still
   applies to stubs, and each stub adds a listing entry (small context cost).
4. **Expect stragglers.** Auto-update is off by default for third-party
   marketplaces like this one; users on `0.1.0` keep old names until they run
   `/plugin marketplace update dx-harness` + `/plugin update`. The README's update
   instructions (README.md:39) are the only nudge — a rename release should update
   them and announce the mapping in the release notes/CHANGELOG.
5. **If the plugin itself is ever renamed**, use the marketplace `renames` map
   (v2.1.193+) — that migration is automatic. Skill renames have no such net.
6. **Sweep order for a rename PR:** frontmatter `name:` → the two frontmatter
   description routing sentences → `/dx-harness:dx-*` strings in both READMEs,
   ONBOARDING.md, dx-start and dx-setup bodies → (optional, separate commit)
   directory renames + all `../dx-*/` relative paths → version bump → CHANGELOG
   entry with old→new mapping.

## Sources

- [Create plugins — code.claude.com](https://code.claude.com/docs/en/plugins) (namespacing, folder-name → skill name, version field semantics)
- [Extend Claude with skills — code.claude.com](https://code.claude.com/docs/en/skills#how-a-skill-gets-its-command-name) (frontmatter `name` vs directory name, bare-command behavior, frontmatter reference)
- [Create and distribute a plugin marketplace — code.claude.com](https://code.claude.com/docs/en/plugin-marketplaces) (`/plugin marketplace update`, version resolution, plugin-level `renames` map, `displayName`)
- [Plugins reference — code.claude.com](https://code.claude.com/docs/en/plugins-reference#version-management) (version-as-cache-key, explicit vs commit-SHA versioning, plugin cache)
- [Discover and install prebuilt plugins — code.claude.com](https://code.claude.com/docs/en/discover-plugins#configure-auto-updates) (auto-update defaults and mechanics, `/plugin update`, reload behavior)
- Community prior art: plugin-level deprecated-alias renames in third-party marketplaces (e.g. `beads-dolt` → `dolt-mcp-vcs`); no skill-level equivalent found in [anthropics/claude-code](https://github.com/anthropics/claude-code) issues.
