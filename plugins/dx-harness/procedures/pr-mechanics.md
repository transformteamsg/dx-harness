# Pull request mechanics (shared procedure)

This is the shared home for the command mechanics every skill needs when it opens,
updates, reviews, or finishes a pull request. `dx-create-pr` owns the standard itself: what a
body says and when a request opens. This file owns the parts that do not change
between skills, so a correction lands once. A skill that opens a pull request
references this file rather than restating it, and states only what is specific to
it: the usage label it applies, and the footer it signs.

## Resolving the request and its repository

Never assume GitHub, and never assume the request belongs to the working directory.
Settle three things before running any command: the forge, the repository, and the
request number.

**A URL beats the remote.** When the developer supplies a request URL, it names its
own host and its own repository, and that settles both outright. Only fall back to
the remote when no URL was given. This ordering matters for a repository mirrored on
both forges, and for a request reviewed from a checkout of a different project.

- **Full URL** (`https://github.com/owner/repo/pull/42`, or
  `https://gitlab.com/owner/repo/-/merge_requests/42`): take the host, `{owner}`,
  `{repo}`, and `{number}` from the URL itself.
- **Number alone**: the request belongs to the repository the working directory is
  in, because a bare number means "here". Read the repository with
  `gh repo view --json owner,name` (or `glab repo view` on GitLab), and read the
  forge from the remote.
- **Neither**: ask which request, and stop. Do not scan for one.

Reading the forge from the remote:

```sh
git remote get-url origin
```

A host containing `github.com` is GitHub, and one containing `gitlab` is GitLab. If
the remote names neither, or the command fails because the directory has no remote,
say so and stop rather than guessing at a CLI.

**Carry the repository explicitly from then on.** Once `{owner}` and `{repo}` are
known, pass `--repo {owner}/{repo}` to every `gh` call and use both in every `gh api`
path. Never let a later command resolve the repository from the working directory
again: a skill that needs no checkout can be run from an unrelated project, and a
command that re-resolves silently reads the wrong repository.

**Check the CLI before the first call that matters**, rather than discovering it
mid-run. If `gh` or `glab` is absent, or present but unauthenticated, follow the
outcomes in Handling a failed command below: name the tool and the command that fixes
it, and stop.

## The command map

| Purpose | GitHub | GitLab |
| --- | --- | --- |
| Request name | pull request (PR) | merge request (MR) |
| Find an open one for a branch | `gh pr list --head <branch> --state open` | `glab mr list --source-branch <branch>` |
| Open a draft | `gh pr create --draft` | `glab mr create --draft` |
| Replace the body | `gh pr edit <number> --body-file <path>` | `glab mr update <number>` |
| Leave draft state | `gh pr ready <number>` | `glab mr update <number> --ready` |
| Template to follow, if the repo has one | `.github/pull_request_template.md` | `.gitlab/merge_request_templates/Default.md` |

The `gh` commands and flags above are stable. `glab` has moved its
description-from-file and draft flags between versions, so confirm the exact flag
with `glab mr create --help` or `glab mr update --help` before running it, rather
than trusting this table for the GitLab column. Fetch the help output; do not guess.

## Reviewing a request

A review needs more than the map above: it reads a request, its diff, and its existing
discussion, then writes back to specific lines. Those commands differ more between the
two platforms than the opening ones do, because GitHub threads a comment on a line
while GitLab pins a discussion to a position.

| Purpose | GitHub | GitLab |
| --- | --- | --- |
| Read the request | `gh pr view <n> --repo <o>/<r> --json ...` | `glab mr view <n> --repo <o>/<r>` |
| Read its diff | `gh pr diff <n> --repo <o>/<r>` | `glab mr diff <n> --repo <o>/<r>` |
| Read existing threads | `gh api graphql` on `reviewThreads` | `glab api projects/:id/merge_requests/:iid/discussions` |
| Post everything at once | `POST .../pulls/<n>/reviews` with a `comments` array | no equivalent: post each discussion, then one note |
| Post one inline comment | part of the review payload | `POST .../merge_requests/:iid/discussions` with `position` |
| Post a summary | `gh pr comment <n>` | `glab mr note <n>` |
| Resolve a thread | `resolveReviewThread` mutation | `PUT .../discussions/:id` with `resolved=true` |

Two differences are worth stating rather than discovering.

**GitLab has no batched review.** GitHub can post every finding as one review, which is
one notification. GitLab posts one discussion per finding, so an author gets one
notification each. Post the inline discussions first and the summary note last, so the
summary arrives after the things it summarises.

**A GitLab position is pinned to SHAs.** A discussion carries `base_sha`, `head_sha`,
`start_sha`, and both line numbers. A force-push during the review changes the head, and
a position built against the old head no longer describes the diff. Treat a rejected
position exactly as GitHub's 422 is treated: do not retry it against a guessed position.
Post that finding as a plain note naming the file and line it refers to, and say in the
summary that it could not be anchored.

## Reporting in the platform's own vocabulary

On GitLab, call it a merge request and use the MR number and the MR URL. A developer
working in GitLab does not have pull requests, so reporting one as a pull request
reads as a different object. This applies to what you say to the developer, not to
the body sections, which are the same on both platforms.

## Passing the body through a file

A body is markdown that holds backticks and other characters the shell treats as
syntax. An inline `--body "..."` lets the shell run a backticked span as command
substitution, so the body arrives mangled or the command fails outright. Write the
confirmed body to a temporary file and pass that file instead.

## Keeping the usage label idempotent

Create the label before applying it. `gh label create` exits non-zero when the label
already exists, which `|| true` swallows, so the line is safe to run every time:

```sh
gh label create "<label>" --color ededed --description "<description>" 2>/dev/null || true
```

The label makes usage queryable with `gh pr list --label "<label>"`, which is exact
in a way free-text search is not. The footer in the body carries the same
attribution for a human reader.

## Handling a failed command

Every skill handles the same three outcomes, and the distinction between the second
and the third matters: a missing CLI has a usable fallback, and any other failure
does not.

- **If the command succeeds**: report the request's number and URL, in the
  platform's vocabulary.
- **If the command fails with "command not found" or "'gh' is not recognized"**
  (or the same for `glab`): render the title and body as markdown and tell the
  developer to open or edit the request manually in the web interface. Say plainly
  that you could not verify the result.
- **If the CLI is present but not authenticated**: name the tool and the command that
  authenticates it, `gh auth login` or `glab auth login`, and stop. This is separate
  from a missing CLI because the fix is different and the developer can act on it in
  one command. A review must not fall back to the manual path here: it would hide an
  authentication problem behind output that looks like a finished review.
- **If the command fails for any other reason**: surface the real error and stop.
  Do not retry with different flags, and do not fall back to the manual path, which
  would hide a permission or authentication problem the developer needs to see.
