# Pull request mechanics (shared procedure)

This is the shared home for the command mechanics every skill needs when it opens,
updates, or finishes a pull request. `dx-create-pr` owns the standard itself: what a
body says and when a request opens. This file owns the parts that do not change
between skills, so a correction lands once. A skill that opens a pull request
references this file rather than restating it, and states only what is specific to
it: the usage label it applies, and the footer it signs.

## Naming the platform before running anything

Never assume GitHub. Read the remote first:

```sh
git remote get-url origin
```

A host containing `github.com` is GitHub, and one containing `gitlab` is GitLab. If
the remote names neither, or the command fails because the directory has no remote,
say so and stop rather than guessing at a CLI.

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
- **If the command fails for any other reason**: surface the real error and stop.
  Do not retry with different flags, and do not fall back to the manual path, which
  would hide a permission or authentication problem the developer needs to see.
