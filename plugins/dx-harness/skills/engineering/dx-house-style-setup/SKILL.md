---
name: dx-house-style-setup
description: Use when the user wants to turn on, check, or share the dx-harness house style output style — for example "set up house style", "turn on the harness style", "make house style the default here", or "is house style active?". Activates plugins/dx-harness/output-styles/dx-house-style.md, the bundled output style, at the scope the user picks: this session, this project, or every project on their machine. Not for asking Claude to write more concisely in the moment ("be less verbose") — just comply directly, that is not a setup request. Not for wiring artifact-writing skills to house style prose rules; those already carry their own reference to procedures/house-style.md.
---

# House style setup

`dx-harness` ships a bundled output style, `plugins/dx-harness/output-styles/dx-house-style.md`, that governs the whole session's prose: explanations, plans, commit messages, and any terminal response. It is opt-in, never forced on: a repo installing this plugin may want a different voice, so this skill only ever activates the style when a person asks for it here.

This is a different lever from the house-style rules already wired into `dx-create-story`, `dx-create-task`, `dx-create-chore`, `dx-create-bug`, `dx-create-pr`, `dx-code-review`, and `dx-design-feedback`. Those apply automatically, with no setup, the moment any of those skills runs, because each carries its own reference to `plugins/dx-harness/procedures/house-style.md`. This skill only affects the output style, the ambient default for everything else.

## Step 1: Confirm the style is available

Check that the plugin's copy exists:

```sh
test -f plugins/dx-harness/output-styles/dx-house-style.md && echo "found" || echo "missing"
```

If missing, the plugin installed is stale or the path changed. Say so and stop; do not improvise a replacement file.

## Step 2: Ask the scope

Claude Code has no verified command to activate a plugin-bundled output style directly from a script; the supported path is the `/config` menu, which correctly discovers plugin styles and writes the resolved value itself. Ask which scope the user wants, and state what each one commits them to:

- **This session or project, just for me.** Saved to `.claude/settings.local.json`. Nobody else who clones the repo is affected.
- **This project, for everyone who clones it.** Saved to `.claude/settings.json`, a tracked file. Say plainly that this commits a team-wide default and ask them to confirm before you touch a shared file.
- **Every project on this machine, for me.** Saved to `~/.claude/settings.json`. Say plainly that this changes behaviour outside the current repo.

## Step 3: Activate, then read back the resolved value

Tell the user to run `/config`, open **Output style**, and select **dx-house-style**. Wait for them to confirm they've done it.

Then read `.claude/settings.local.json` for the `outputStyle` key Claude Code just wrote there:

```sh
cat .claude/settings.local.json 2>/dev/null | grep outputStyle
```

**Never write a guessed value into any settings file yourself.** The exact reference string for a plugin-bundled style is not documented; only `/config` resolves it correctly. This skill only ever copies a value Claude Code has already resolved and written.

- **If the user chose "just for me" in Step 2**: nothing more to do. `.claude/settings.local.json` already carries it.
- **If the user chose a wider scope**: copy the same `outputStyle` value into the target file (`.claude/settings.json` or `~/.claude/settings.json`), creating it if it does not exist and preserving every other key already there. Show the exact change and get confirmation before writing to `.claude/settings.json`, since that's a tracked, shared file.

## Step 4: Report

Say which file now carries the setting and at what scope, and that it takes effect on the next new session (an output style loads once, at session start, so the current session keeps its current behaviour).

## Checking whether it's already active

For "is house style active?", read the `outputStyle` key from all three files in precedence order, project-local first, then shared project, then user-global, and report which one wins and what it's set to. Report "not set anywhere" rather than guessing from the plugin being installed; installed and active are different things.
