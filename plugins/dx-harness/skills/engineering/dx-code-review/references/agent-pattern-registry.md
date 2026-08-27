# Agent Pattern Registry

Used by the Analysis Phase (shared by both review paths) to persist and promote AI-characteristic findings. The shipped standard lives in this skill's [references/agent-patterns.md](../references/agent-patterns.md), which ships the 9 built-in patterns as unobserved rows (`Confirmed by: 0`) — the Analysis Phase fills each one in on its first real match and appends genuinely new patterns beyond the 9 as they're found.

## File schema

```markdown
# Agent Pattern Registry

> Auto-maintained by `dx-code-review`. Read by `dx-implement-issue` as an anti-pattern list.
> Deduplication key: Pattern name (case-insensitive). Increment "Confirmed by" on recurrence.
> When a pattern is promoted to a programmatic guard, remove its row and note the guard location in a comment above the table.
> A suppressed row stays. It is the only record that the pattern was tried and rejected.

| ID | Angle | Pattern name | Trigger | Prevention | Concrete example | First seen | Severity | Confirmed by | Rejected by | Status |
|----|-------|-------------|--------|-----------|-----------------|------------|----------|-------------|-------------|--------|
```

- **ID**: sequential `AP-NNN`, never reused
- **Angle**: one of the 8 review angle names (e.g. Reuse, Security, Altitude)
- **Pattern name**: directive form, 3–6 words, title-cased — the deduplication key (e.g. "Search Before Implementing Utilities")
- **Trigger**: one sentence describing the concrete condition that matches this pattern (e.g. "logic re-implemented that already exists in a shared or utils module")
- **Prevention**: one sentence, imperative voice, stating what to do instead
- **Concrete example**: one sentence anchored to this project with a file path or function name — `—` for an unobserved row in the standard
- **First seen**: ISO date — `—` for an unobserved row in the standard
- **Severity**: 🔴 Important / 🟡 Nit / 🟣 Pre-existing — `—` for an unobserved row in the standard
- **Confirmed by**: `N review(s)` — `0` for a row in the standard that has not been observed here; set to `1 review` on its first real match; incremented on each recurrence
- **Rejected by**: `N review(s)` — `0` until a reviewer first rejects a finding this pattern tagged; incremented on each rejection. Never incremented by a finding the reviewer accepted, and never decremented
- **Status**: `active`, or `suppressed (YYYY-MM-DD)` with the date suppression was applied. A suppressed row is not raised and is not promotable

## Recording what a review learned

Classification (Analysis Phase step 7) only reads and tags. Recording happens after the author has said which findings were real, which is why it belongs to the Local Branch Review Path's registry step rather than to the shared Analysis Phase.

**The overlay belongs to the reviewed repository, not to the reviewer's working directory.** The local branch path reads `review/agent-patterns.md` from disk, which is correct there because the branch under review is checked out. The PR review path fetches it from the pull request's own repository, because that path deliberately needs no checkout, so a file at that path on disk belongs to whatever project the reviewer is sitting in. Matching one project's findings against another's rows would tag findings on rows that mean nothing here, and after the suppression rule would silently drop findings on the strength of a decision taken in a different codebase.

**The PR review path records nothing.** It sources its diff from GitHub and needs no branch checked out, so any write lands on whatever branch the reviewer is parked on, unrelated to the pull request under review and often `main`. It has no triage either, so it has no verdict to record. It reports the rows it would have added and stops.

**A dismissal never counts in a pattern's favour, and counts against it.** Triage offers three answers, and the third rejects the finding outright. An accepted finding, whether the author fixes it now or later, increments `Confirmed by`. A rejected one increments `Rejected by` instead, and is never proposed, locally or upstream. Only an accepted finding can become a proposal, because an issue asking a team to adopt a rule their own reviewer just threw out is worse than silence. A pattern that produces false positives must get quieter, not climb towards promotion on findings the author threw out.

Whether a rejection creates a row depends on what the finding matched, and the two cases differ:

- **It matched a pattern**, from the shipped standard or from a row already here. Record the rejection, creating the overlay row if the match came from the shipped standard and this repository has none yet. A rejection of a shipped pattern is exactly the evidence that pattern is wrong here, and it is lost if there is nowhere to put it.
- **It matched nothing.** Create no row, file no issue, and do not ask. This is the discovery case, and discovery belongs to accepted findings only: the author rejected this one, so it established no pattern to disconfirm and none worth proposing. Inventing a row, or an issue, to record the rejection of a pattern that never existed would make the registry longer without making it truer.

### Suppression

After updating the counts, suppress the pattern when **`Rejected by` is 2 or more and exceeds `Confirmed by`**. Set `Status` to `suppressed (YYYY-MM-DD)` and leave both counts in place, because they are the evidence for the decision.

Two rejections rather than one, deliberately. The nine shipped patterns start at `Confirmed by: 0`, so a bare majority would let a single rejection kill a shipped pattern on its first outing, before it had ever been confirmed once.

**Suppression is permanent until a human edits the row.** This is structural rather than a preference: a suppressed pattern is never raised, so it can never accumulate the confirmations that would let it earn its way back. Nothing automatic reverses it, and no cooldown exists. The row carries its counts and its date so someone can see why and undo it deliberately.

**A suppressed row is never removed.** Removing it causes amnesia: a later review rediscovers the same pattern, adds it as a fresh row, has it rejected again, and re-suppresses it, forever. A promoted row can be removed because a lint rule succeeds it. Suppression has no successor.

### What the repository's file holds

`review/agent-patterns.md` holds **only the patterns this repository has actually observed**. The nine shipped patterns stay in the plugin, in `references/agent-patterns.md`, and are never copied into a repository. Classification reads the two together and the repository's file is the overlay: where both carry the same `AP-NNN`, its row wins, because it is the one with this repository's counts and status.

So the file does not exist until the first accepted finding matches a pattern, and the review that creates it writes exactly one row: the one it just observed. It grows a row at a time, and every row in it is something that happened here.

Copying the shipped standard into each repository instead would cost four things, and the first is already real:

- **Version skew with no migration.** The standard gained `Rejected by` and `Status` columns. Any repository holding a copy of the older table now has a file that this logic does not match, and nothing upgrades it.
- **The file stops answering its own question.** Nine rows at `Confirmed by: 0` around one real observation means "what has this repository learned" cannot be read off it.
- **Improvements never reach anyone.** A better Prevention written in the plugin would never arrive in a repository that forked its copy on the first review.
- **`dx-implement-issue` binds on fiction.** It treats every Prevention as a constraint for the session, so a materialised copy would constrain work against nine patterns the repository has never hit.

### A finding that matched an existing row

Update the row:

- **Matched the shipped standard, with no row here yet** — create the row in this repository's file, **keeping its `AP-NNN` ID from the standard** along with its Angle, Pattern name, Trigger, and Prevention, and filling in `First seen` (today), `Concrete example` (this instance), `Severity` (this finding's severity), and `Status` `active`. The two counts come from the verdict: an accepted finding starts the row at `Confirmed by` `1 review` and `Rejected by` `0`, and a rejected one starts it the other way round. Keeping the ID is what stops a later review reading the same pattern as a new discovery and adding it twice. Create the file itself here if it does not exist, with the header and column row from § File schema and this one row beneath it.
- **Already has a row here** — increment `Confirmed by` and append `(also seen: <file>)` to the `Concrete example`.

Then decide whether to commit, by asking whether the project opted in:

```sh
git ls-files --error-unmatch -- review/agent-patterns.md
```

- **Exit 0, the file is tracked**: apply the update and commit it, `docs(review): update agent-patterns.md [skip ci]`. Putting a file under version control is an act the review cannot perform for itself, which is what makes it usable as consent.
- **Non-zero, so untracked, absent, or gitignored**: write it to disk, run no `git` command at all, and print the opt-in line in the summary. A gitignored registry needs no separate case, because it cannot become tracked without a deliberate `git add -f`.

  ```
  Registry updated: review/agent-patterns.md (untracked). To share it with the project:
    git add review/agent-patterns.md && git commit -m "docs(review): add agent-pattern registry"
  ```

Never ask here. An increment carries no decision, and a prompt on every review taxes the developer for a choice they did not need to make.

### A finding that matched nothing, meaning a new pattern

The only case that asks anything, and a rare one: the shipped standard covers the common agent pathologies, so most findings increment rather than discover.

**Nothing is written here.** A new pattern is proposed, never added. The registry gains a row when a human agrees it should, which is what the issues below are for. A row nobody agreed to is a constraint nobody chose, and `dx-implement-issue` will treat it as binding on every future session.

Be exact about what counts as new: a finding that matched **nothing at all**, neither a row here nor a shipped pattern. The first observation of a shipped pattern is not a discovery, and it takes the increment path above.

Judge the pattern's generality and state the verdict with its reasoning, rather than routing silently:

- **Universal**: the Trigger and Prevention stay actionable and correct in a repository sharing none of this project's stack, conventions, or domain. Every pattern in the standard passes this test.
- **Project-specific**: the Prevention names a file, framework, convention, or domain term from this project. "Take colours from `app/globals.css`, never raw hex" is one design system's rule, not everyone's.

Then ask:

> "This review found a pattern that is in neither this repository's registry nor the shipped standard: **<Pattern name>**, <Trigger>.
>
> It looks **<universal | project-specific>**: <one line of reasoning>.
>
> Track it? I will open an issue here proposing it, <and one on dx-harness proposing it as part of the shipped standard | which is where it stays, since it only makes sense in this codebase>. I will not add it to `review/agent-patterns.md`; that is for whoever picks the issue up."

On no, write nothing and file nothing. Note the pattern in the summary so the observation is not lost, and move on.

### Filing the local issue

On yes, open an issue in the repository under review. It proposes the row rather than being the row, so it carries everything a person needs to judge it: the Angle, the proposed Pattern name, the Trigger, the Prevention, the concrete example with its file and line, and the finding that prompted it.

```sh
gh label create "agent-pattern" --color ededed --description "A proposed agent-pattern registry row" 2>/dev/null || true

gh issue create --title "Add <Pattern name> to the agent-pattern registry" --body-file <path> --label "agent-pattern"
```

Do not assume the repository uses this plugin's issue shapes. It is somebody else's repository and may have its own conventions, so write a plain, complete body rather than reaching for `dx-create-chore`.

This issue is filed whether the pattern is universal or project-specific. Every proposal concerns the repository that found it.

### Proposing a pattern upstream

Only when the pattern reads as universal and the developer agreed to track it. A project-specific pattern stops at the local issue: a rule that only makes sense in one codebase does not belong on a public tracker, and filing it there puts project detail one mistake away from publication.

**Strip everything project-anchored.** The issue carries the Angle, Pattern name, Trigger, Prevention, and a generic example written fresh. Never the `Concrete example` cell, which is a path and an excerpt from the repository under review. `transformteamsg/dx-harness` is a public tracker, so an unstripped row publishes a client's code.

Render the full body and wait for confirmation before filing. Nothing from the reviewed codebase leaves the machine without the developer reading it first.

File it as a chore, because a new row in the standard is maintenance of the shipped registry and nothing a user observes:

```sh
gh label create "agent-pattern" --color ededed --description "Proposed addition to the agent-pattern standard" 2>/dev/null || true

gh issue create --repo transformteamsg/dx-harness \
  --title "chore(\`dx-code-review\`): add <Pattern name> to the shipped agent-pattern standard" \
  --body-file <path> --label "agent-pattern"
```

Pass the body through a file. It holds backticks, and an inline `--body` lets the shell run a backticked span as command substitution.

Handle the three outcomes the way the rest of this plugin does:

- **It succeeds**: report the issue number and URL.
- **`gh` is missing** ("command not found", or "'gh' is not recognized"): render the title and body as markdown, tell the developer to file it themselves, and say plainly that you could not verify the result.
- **It fails any other way**: surface the real error and stop. Do not retry with different flags, and do not fall back to the manual path, which would hide an authentication problem the developer needs to see.

File the local issue first, and reference each issue from the other so the pair is traceable across repositories. If the upstream filing fails, the local issue still stands on its own: it is the one that matters to the repository that found the pattern.

## Programmability evaluation (triggered at `Confirmed by: 3`)

Assess all five criteria:

| Criterion | Question | Disqualifier |
|-----------|----------|--------------|
| **Specificity** | Can this be expressed as an AST rule, regex, or grep without matching valid code? | High false-positive rate |
| **Repeatability** | Does the check produce the same result every run on the same code? | Non-deterministic |
| **Speed** | ≤5 s → pre-commit; ≤30 s → pre-push; slower → CI only | Must fit one tier |
| **Tool availability** | Does an existing linter rule, hook, or binary implement this? | Prefer existing over custom |
| **Semantic dependency** | Does detecting it require understanding code *intent*, not just *structure*? | If yes → not programmable |

A pattern is promotable when: Specificity OK, Repeatability YES, Semantic dependency NO, and Speed fits a tier.

**Known programmability of the 9 built-in criteria:**

| Pattern | Promotable | Tier | Tool |
|---------|-----------|------|------|
| Log or Re-throw in Every Catch | Yes | Pre-commit | ESLint `no-empty` / `@typescript-eslint/no-empty-function`; Go `errcheck` |
| Parameterise Instead of Copy-Pasting | Partial | Pre-push | `jscpd` with minimum-token threshold |
| Update All Callers on Signature Change | Yes (typed langs) | Pre-commit | `tsc --noEmit`; Go compiler |
| Document Before Deleting Tests or Guards | Partial | Pre-push | `git diff` detecting net deletion of `*.test.*` / `*_test.go` files |
| Use Installed API Version | Yes | Pre-commit | `tsc --noEmit`; `go build` (caught by compiler) |
| Use Domain-Specific Variable Names | Partial | Pre-commit | Grep/semgrep — use only if false-positive rate is acceptable |
| Search Before Implementing Utilities | No | — | Requires semantic similarity judgment |
| Fix Inside the Function Not at the Call Site | No | — | Requires understanding layer boundaries |
| Justify Every New Abstraction Layer | No | — | Requires understanding intent |

### Promoting a pattern that passes

On the Local Branch Review Path only, and after the author has accepted the finding that took the count to 3. Promotion writes to the repository, so the PR review path evaluates nothing and promotes nothing; it reports that the count reached 3 and leaves the decision to a local run.

- Implement the guard using `dx-lint-setup` (lint rule) or `dx-git-hooks-setup` (hook script), whichever the Speed tier points to.
- Remove the pattern's row from `review/agent-patterns.md`.
- Prepend a promotion comment above the table: `<!-- AP-NNN "<Pattern name>" promoted to <tool> (<tier>) on <date> -->`
- If the guard needs CI pipeline changes, recommend it to the developer rather than implementing it directly.

**A suppressed pattern is never promoted, whatever its `Confirmed by` count.** Refuse the promotion, leave the row in place, and record the refusal in the row's Status: `suppressed (YYYY-MM-DD), promotion refused (YYYY-MM-DD)`. A pattern the authors here keep rejecting must not become a lint rule that fires on valid code across the whole repository.

