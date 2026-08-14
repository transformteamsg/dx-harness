# git-answers - Gitty's deeper Q&A + recovery cookbook

The single source of truth for the questions a designer asks *off* the happy path. Each entry pairs the **accurate answer** - grounded in the official git docs at git-scm.com, with every git command linked to its page - with a **plain read**, so they learn the real word while understanding it. When a question isn't here, open the official doc - don't guess.

**Safety:** any recipe marked ⚠️ rewrites history or throws away work. Gitty still runs it through the confirmation gate in SKILL.md (typed "yes" + a safer option first). This file is the knowledge; the gate lives there.

---

(Everyday terms - `branch`, `commit`, `push`, `working tree`, `staging`, `HEAD`, `origin` - are defined in SKILL.md's teach list. This file covers what that list doesn't.)

## Everyday questions

- **fetch vs pull.** `git fetch` downloads new commits from the server but leaves your files untouched; `git pull` does a fetch *and* merges them into your branch. Plain: fetch = "show me what's new, don't touch my stuff"; pull = "grab what's new and apply it." (git-scm.com/docs/git-fetch, /docs/git-pull)
- **.gitignore.** A file listing paths git should ignore (`node_modules`, `.env`, build output) so they never get committed. Plain: "the do-not-save list." (git-scm.com/docs/gitignore)
- **CI.** Continuous integration - automated build/test checks the server runs when you push. It is *not* a deploy. Plain: "robots that check your work didn't break anything."

## "Did I break it?" - recovery cookbook

Open with reassurance: git almost never loses committed work, and `git reflog` remembers everywhere you've been. Then:

- **Undo the last commit, keep the edits.** `git reset --soft HEAD~1` - moves the save back one step but keeps your changes staged. Plain: "un-save the last save, keep the work." ⚠️ if that commit was already pushed (it rewrites shared history) - otherwise safe. (git-scm.com/docs/git-reset)
- **Discard a file's changes (throw the edits away).** `git restore <file>` (older git: `git checkout -- <file>`). Plain: "put this file back the way it was at the last save." ⚠️ the uncommitted edits are gone for good. (git-scm.com/docs/git-restore)
- **Unstage a file (keep the edit, just un-pick it).** `git restore --staged <file>`. Plain: "take it back out of the box, don't delete it." Safe. (git-scm.com/docs/git-restore)
- **I committed on `main` by mistake (not pushed).** Put the commit on its own branch and move there in one step: `git switch -c my-work` (this carries the commit *and* switches you to it, so nothing's lost and nothing looks gone). Then tidy main: `git switch main`, `git fetch origin`, `git reset --hard origin/main`, and `git switch my-work` to carry on. Plain: "give the commit its own branch, hop onto it, then rewind main back to the server." ⚠️ the `reset --hard` step - only once `my-work` exists. (git-scm.com/docs/git-switch, /docs/git-reset)
- **Recover "lost" work.** `git reflog` lists every position HEAD has held; find the commit and `git branch rescue <hash>`. Plain: "git's own undo history - almost nothing is truly gone." Safe (read-only until you branch). (git-scm.com/docs/git-reflog)
- **Detached HEAD.** You're sitting on a specific old commit instead of a branch, so anything you commit here belongs to no branch and can slip away when you leave. Made any edits or commits? Turn them into a real branch first: `git switch -c new-branch`. Otherwise just hop back: `git switch -` (or `git switch main`). Already left and it looks gone? `git reflog` finds it (above). Plain: "you time-travelled to an old snapshot - branch it before you leave, or reflog your way back." (git-scm.com/docs/git-switch)
