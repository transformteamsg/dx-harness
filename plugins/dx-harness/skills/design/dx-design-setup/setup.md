# Harness setup checklist

Check, install, and verify the tools the harness relies on, wire the
design-ticket tracker, and set up commit signing. Everything here is
per-person, per-machine. Repo-level adoption (stack, component manifest,
record locations, the named L1 approver) lives in the team onboarding guide
(`../../../docs/ONBOARDING.md`, relative to this file; it ships with the
plugin).

Two rules bind every row:

- **Ask before installing.** Show the exact command, get a yes, then run it.
  In an unattended run, install nothing — list what is missing with the
  commands a human should run, marked "missing, not installed".
- **Verify, then say so.** A tool is set up when its check command passes;
  report the actual output. Never claim more than the check shows — the same
  honesty line the checks hold (`../../../checks/README.md`).

Work the table top to bottom: run the check; if it passes, move on; if not,
offer the install, run it (or hand it to the user where marked), and re-run
the check. Then continue with the tracker and commit-signing steps below.

The axe row names `${CLAUDE_PLUGIN_ROOT}`: the plugin's own installation
directory. Claude Code resolves it when it loads `SKILL.md`, so the absolute
path is already in your context before you open this checklist. It is not a
shell environment variable. If either command still carries the literal text,
put the path in yourself. Never run either command with an empty value,
because `npm install --prefix ""` installs in the wrong place.

| Tool | Why the harness needs it | Check (exit 0 = present) | Install |
|---|---|---|---|
| `agent-browser` CLI | First-preference screenshot capture in the design loop's critique and verify phases | `agent-browser --help` | `npm i -g agent-browser && agent-browser install` (the second command downloads its Chromium; needs Node 18+) |
| agent-browser skill | Teaches the agent the CLI's full command set (recommended; the CLI alone is enough for capture) | ask the user: `/plugin list` shows `agent-browser` | the user types `/plugin marketplace add vercel-labs/agent-browser`, then `/plugin install agent-browser@agent-browser`, then `/reload-plugins` — Claude Code commands, not shell |
| `gh` CLI, authenticated | The `feedback` skill files issues through `scripts/file-feedback-issue.py` | `gh auth status` | `brew install gh`, then the user runs `gh auth login` themselves (interactive — never run it for them) |
| Python 3 + PyYAML | The `checks/*.py` scripts import `yaml` | `python3 -c "import yaml"` | `python3 -m pip install --user pyyaml` |
| Pillow | The critique report step crops and annotates screenshots | `python3 -c "import PIL"` | `python3 -m pip install --user Pillow` |
| axe on Playwright (harness-side) | The rendered check drives axe against the page already open in the capture session | `node -e "require('node:module').createRequire('${CLAUDE_PLUGIN_ROOT}/').resolve('@axe-core/playwright')"` | `npm install --prefix "${CLAUDE_PLUGIN_ROOT}"` — installs into the plugin's own `node_modules` only; nothing is installed into the repo being checked. Missing is not a failure: the rendered check says it did not run and sends its controls to manual verification |
| `dx-harness` plugin (product repos only) | The harness itself; skills load from the installed `dx-harness` plugin, same as any product repo | ask the user: `/plugin list` shows `dx-harness` | the two commands in the README Install section (`../../../README.md`) |

## Wire the design-ticket tracker

Design work is recorded on one long-lived ticket per surface (a page or a
flow). Wire the conventions once:

1. **Confirm a repo checkout.** Run `git rev-parse --show-toplevel`. If it
   fails, setup is running outside a repo: skip this whole section, say so,
   and continue with commit signing. Never create the fallback directory
   outside a checkout.
2. **Follow the repo's issue-tracker doc where one exists.** In this repo
   that is `docs/agents/issue-tracker.md`. The doc wins, even when it names
   a tracker other than GitHub: follow its workflow and skip the GitHub
   probe below.
3. **No doc: detect GitHub.** A GitHub tracker is present when
   `gh auth status` exits 0 and `gh repo view --json nameWithOwner` resolves
   the current repo.
4. **Tracker present: create the label idempotently.**

   ```sh
   gh label list --limit 200 --json name --jq '.[].name' | grep -qx design ||
     gh label create design --description "Design ticket, one long-lived issue per surface" --color 5319e7
   ```

   An existing label is success, not an error. Anything else that makes the
   command fail (issues disabled, a token that cannot manage labels, the API
   down) is a real failure: report the error, do not claim the tracker is
   wired, and use the local-markdown fallback in the next step instead.
   Once the label verifiably exists, state the conventions
   setup has wired: one long-lived issue per surface; title
   `Design: <surface>`, where `<surface>` is the route path (`/marks`) or the
   flow name; label `design`; runs find the ticket by label plus title match;
   the first run that touches a surface creates it.
5. **No tracker: set up the local-markdown fallback.** A missing tracker is
   not a failure. Create `docs/design-tickets/` and say plainly that the
   fallback is active and why: runs will append typed blocks to
   `docs/design-tickets/<surface-slug>.md`, and deferred sections and
   fix-todos go to `docs/design-tickets/TODO.md`.

The canonical conventions doc is `../../../procedures/design-tickets.md`;
follow it where it ships with this plugin build. The facts above stand on
their own either way.

## Set up commit signing (once per machine)

Some repos require verified signatures on the default branch, and an unsigned
commit then blocks every merge. Whether the current repo enforces this does
not gate the flow: always report the config state, and offer fixes only for
what is missing. The two binding rules above apply to every write here,
including git config changes and the key registration.

1. **Check the machine-wide git config.** This is once-per-machine setup, so
   read the global scope, not the current repo:

   ```sh
   git config --global --get gpg.format
   git config --global --get user.signingkey
   git config --global --get commit.gpgsign
   ```

   Signing is configured only when all three return values **and**
   `commit.gpgsign` is `true`. A `false` value means signing is off: treat
   it the same as missing. If everything passes, report the existing values
   and change nothing. Also read the same three keys without `--global` when
   inside a repo; where local values override the global ones (for example a
   local `commit.gpgsign false`), report the override so the person can
   decide what to do with it. If anything is missing or off, ask first, then
   configure SSH signing:

   ```sh
   git config --global gpg.format ssh
   git config --global user.signingkey ~/.ssh/<key>.pub
   git config --global commit.gpgsign true
   ```

2. **Test a signature locally.**

   ```sh
   echo test | ssh-keygen -Y sign -f ~/.ssh/<key> -n git
   ```

   This must produce an `SSH SIGNATURE` block.

3. **Check the key on GitHub as a signing key.** Signing keys are separate
   from auth keys; an auth-only key does not verify commits.

   ```sh
   gh api user/ssh_signing_keys
   ```

   Compare the result against the local public key. This call needs the
   `admin:ssh_signing_key` scope on the gh token. If it fails with HTTP 403
   or a scope error, do not fail silently and do not skip the step: show the
   person the exact command

   ```sh
   gh auth refresh -h github.com -s admin:ssh_signing_key
   ```

   and wait while they complete the device login themselves (interactive;
   never run it for them), then re-run the check.

4. **Add the key if absent.**

   ```sh
   gh api --method POST user/ssh_signing_keys -f title="<machine>" -f key="$(cat ~/.ssh/<key>.pub)"
   ```

   If the key is already on the account as a signing key, skip the POST and
   report "already on GitHub as a signing key". Never re-register the same
   key.

5. **Explain the order rule.** GitHub never verifies retroactively: commits
   pushed before the key was registered stay unverified. The fix, after the
   key exists, is `git rebase --force-rebase <base>` to re-sign the commits,
   then a force-push.

## Close out

Close with one end-to-end health check:
`agent-browser doctor --offline --quick` → exit 0. If it fails, plain
`agent-browser doctor` diagnoses; `doctor --fix` makes destructive repairs —
ask before running it.

Finish by telling the user what passed, what was installed, and what is
still missing (and why), in one short list.
