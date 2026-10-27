# Building a rule

How to turn a lint rule file into a working check. Follow the pattern of the categories BD and WR. They are complete, and their modules, fixtures, and patches are the examples.

A rule is done when it has a module, a fixture pair, a break patch, and a passing test. Do the work for one rule at a time.

## The pieces

| Piece | Path | Holds |
| --- | --- | --- |
| Rule file | `plugins/dx-harness/skills/design-restructure/base/<cat>/<CODE>.md` | The standard. Read it first. Do not change its meaning. |
| Module | `packages/design-lint/src/modules/<cat>/<name>.ts` | The check |
| Registration | `packages/design-lint/src/modules/<cat>/index.ts` | The array that lists the modules of the category |
| Fixtures | `packages/design-lint/fixtures/<CODE>/` | A passing site, a failing site, and the expected findings |
| Demo pages | `packages/design-lint/demo/site/<cat>/` | Pages that the rule needs on the demo site |
| Config fragment | `packages/design-lint/demo/config.d/<cat>.json` | The rules to run, the pages, and the parameter values for the demo |
| Patch | `packages/design-lint/demo/patches/<CODE>.json` | The smallest change that makes the rule fail |

The category WP is split in two, so that two people can work at once. WP-1 to WP-9 use `src/modules/wp/a.ts`, `demo/config.d/wp-a.json`, and `demo/site/wp-a/`. WP-10 to WP-19 use `src/modules/wp/b.ts`, `demo/config.d/wp-b.json`, and `demo/site/wp-b/`. For every other category, `<cat>` is the lower-case prefix, and the module file is `src/modules/<cat>/index.ts` or files that it imports.

Edit only the files of your category. Do not run `pnpm add` or change `package.json`: if a rule needs a library that is not installed, build the check without it, or leave the rule unbuilt and say why. Do not edit `src/registry.ts`, `src/types.ts`, the shared demo pages (the files directly under `demo/site/`), `demo/design-lint.config.json`, or the files of another category.

## A module

A module has a `code`, a `surface`, a `locate` function, and a `decide` function. `locate` finds candidates. `decide` applies the policy and the parameters, and returns a message for a finding or `null` for a pass.

```ts
export const wp3a: RuleModule = {
  code: "WP-3a",
  surface: "source",            // "source", "project", or "rendered"
  locate({ files, root, params, rendered }) { /* return Candidate[] */ },
  decide(candidate, params) { /* return string | null */ },
};
```

A `Candidate` has `file`, `line`, `column`, and `data`. A rendered rule reports the page path as the file, and the position of the element as the line and column.

Use the helpers that exist:

| Need | Use |
| --- | --- |
| Parse HTML with positions | `elements()`, `matches()`, `closest()`, `hasAncestor()` in `src/html.ts` |
| Read pages, resolve links, find a search form | `src/project.ts` |
| Read form controls and labels | `src/forms.ts` |
| Scan CSS for raw colours | `src/css.ts` |
| Run axe-core rules in a page | `axeRule(code, ids)` in `src/engines/axe.ts`. See `src/modules/wr-1.ts`. |
| Run jsx-a11y rules on JSX and TSX | `jsxRule(code, ids)` in `src/engines/jsx-a11y.ts` |
| Open a page in the browser | `rendered.open(path, viewport)`, then `page.evaluate(fn, arg)` |
| Press a key, hover, click, focus, take a screenshot | `page.press(key)`, `page.hover(sel)`, `page.click(sel)`, `page.focus(sel)`, `page.screenshot(sel?)`. Open the page with `{ fresh: true }`, because these change the page, and the default page is shared with other rules. |
| Check a rule on HTML and on JSX and TSX | `combineRules(code, [htmlPart, jsxRule(code, ids)])` in `src/engines/combine.ts`. Do this for a source rule that names a jsx-a11y rule, so that it works on a plain HTML project and on a React project. |
| Readability | `src/readability.ts` |

Rules for a module:

- Read every value from `params`. Never hard-code a value that the rule file lists as a parameter.
- The function that you pass to `page.evaluate` runs in the browser. It must not use anything outside itself. Pass values in through the argument.
- A rendered rule has a `pages` parameter. If the rule file lacks one, add `pages: null` to its frontmatter and its mapping row.
- Do not report one fault twice. If another rule already reports it, narrow your rule and say so in the rule file.
- If a rule file's design cannot work, change the rule file minimally, and record why in the category README under **Built**.
- Write comments in the style of the existing modules: a short block comment on the module and on each decision that a reader would otherwise question.

When a rule file names an axe or jsx-a11y rule, check that the id exists in the installed version. Add the ids to a `*_IDS` constant and a test, as `test/axe.test.ts` does. If an id does not exist, find the right one and fix the rule file.

## Registering

Add the module to the array in `src/modules/<cat>/index.ts`. Create one file for each rule, or for each set of related rules, as BD and WR do.

## Fixtures

```
fixtures/<CODE>/
  pass/            a small site that passes the rule
  fail/            a small site that fails it
  expected.json    the findings that fail/ must produce
  config.json      optional
```

`expected.json` is a list of `{ "file", "line", "column", "code" }`. A source or project finding names a file relative to `fail/`. A project finding that is about the whole site uses `"."`. A rendered finding names the page path, such as `"/"`, and omits the line and the column. `code` is optional and defaults to the rule.

`config.json` holds the values that the rule needs. `pass.config.json` and `fail.config.json` merge over it, when the passing site and the failing site need different values: `pages`, `product`, `rules`, and `render`. For a rendered rule set `"render": { "waitUntil": "load" }`, which is faster for static pages.

Write the smallest fixtures that prove the rule. Use more than one failing file when the rule has several conditions, and cover each condition. Compute a source position with care, or run the fixture and check that the finding sits on the right element. Do not accept a position without checking it.

## The demo site and the patch

The demo site passes every rule that exists. If the rule needs something that the site lacks, add a page. Make pages with the generator:

```sh
pnpm --filter design-lint new-page <cat>/<name>.html --title "..." --description "..." --main <file>
```

The generator writes the standard head and header, so that the page passes the rules of BD and WR. The title is 10 to 60 characters and the description is 50 to 160. Add the page to `pages.all` in your config fragment. The generator refuses to overwrite a file.

Your config fragment, `demo/config.d/<cat>.json`, is a JSON object with `select` (the codes of your rules), `pages` (page groups to add to), and `rules` (parameter values). It merges with the base config. Add every code that you build to `select`.

A patch is a JSON file:

```json
{
  "code": "WP-3a",
  "describe": "Remove the captions track from the video.",
  "edits": [{ "file": "wp/video.html", "find": "<track ...>", "replace": "" }],
  "expect": [{ "file": "wp/video.html", "line": 12, "column": 3 }]
}
```

Each edit is an exact text replacement. `find` must occur exactly once in the file. An edit can name `files` with a glob, such as `**/*.html`, and then replaces the text in every matching file that holds it. A patch can also set `config`, which merges over the site config: use it when the failure is a product choice, such as a required phone line, and not a change to a page. Edit only your own pages. Do not edit a shared page. If your rule needs a failure that only a shared page can show, make the page your own.

`expect` lists every finding that the patch causes. If the patch also breaks another rule of your category, list that finding with its `code`. Use `"exclusive": true` only when the patch conflicts with another patch of yours.

The patches of one category run against each other in one test. Choose edits that do not overlap. Two patches must not replace the same text.

## Check your work

Run these from `packages/design-lint`:

```sh
pnpm typecheck
pnpm exec vitest run test/fixtures.test.ts -t "<CODE>"     # the fixtures of one rule
pnpm exec vitest run test/patches.test.ts                  # every patch, and the demo site
node src/cli.ts demo/site --rendered --config demo/design-lint.config.json    # lint the demo site
node demo/demo.ts <CODE>                                   # the live demo of one rule
```

The demo site must lint clean: no finding and exit 0. A finding on your own page, or on a page of another category, means that something is wrong. Fix your own. Report the other.

Before you finish, run `pnpm typecheck`, the fixtures and patches tests, and `pnpm check` from the repository root. Do not commit.

## What to write down

For each rule that you build, in the category README under **Built**, record a decision that a reader would not guess: a rule file that you changed, a limit of the check, a heuristic and its threshold. List a rule that you could not build, with the reason. Do not claim a check that the module does not make.
