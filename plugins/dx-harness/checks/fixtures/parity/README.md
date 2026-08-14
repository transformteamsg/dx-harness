# The parity corpus

This corpus is the gate that let `token-audit.py` and `type-scan.py` move their
matching layer to ast-grep. It exists to prove one thing: **only how a candidate
is found changed, never what is reported about it.**

## Layout

```
known-positive/   files both engines must report, in every context that matters
known-negative/   files both engines must stay silent on
expected/         <fixture>.<check>.txt — the recorded PRE-SWAP output
```

Each `expected/*.txt` holds the exact lines the **pre-swap** engine printed for
that fixture and that check, in emission order, with the fixture's own basename
in place of the relative path. Every line's file, line number and control id is
therefore asserted, which the older `"fail" in filename` convention never did.
A `known-negative` record is empty.

`token-audit.py --self-test` and `type-scan.py --self-test` compare the whole
corpus line by line on every run.

## The records are pre-swap and must stay that way

The records were produced by the engine as it stood on `origin/main`, exported
with `git show`, before either script's matching layer changed. That is what
makes them a gate rather than a snapshot.

**Do not regenerate them from the current engine.** There is deliberately no
`--record` flag: regenerating would turn a real regression into a green run, and
the two CLI signatures are frozen anyway. To re-record after a *fixture* changes,
export the pre-swap scripts from git history and run them over the corpus, the way
the swap commit did. A diff to `expected/` in review means either a fixture
changed or the swap changed a decision, and the second is not allowed.

## What each fixture is for

| Fixture | What it pins |
|---|---|
| `known-positive/className.tsx` | a raw value inside a `className` string |
| `known-positive/style-object.tsx` | a `style={{}}` object — reached by the front end, still declined by the unchanged style-context policy |
| `known-positive/template-literal.tsx` | a styled-components body spanning several lines; each finding lands on the value's own line |
| `known-positive/multiline-jsx.tsx` | the attribute three lines below its opening tag |
| `known-positive/declaration.css` | a spacing shorthand, a radius, a size and a line-height in one rule |
| `known-positive/inline-style.html` | a `style="…"` attribute |
| `known-positive/attribute.vue` | `.vue`, which is not an ast-grep language at 0.44.1 and is reached only through `languageGlobs` |
| `known-positive/type-assertion.ts` | `.ts` is matched by `language: ts` rules; aliased to tsx this file measurably returns zero findings at exit 0 |
| `known-positive/heading-scope.css` | TYP-2's band is body-scoped: an `h1` rule is excluded, `.lead` and a mixed `.lead, h2` group are not |
| `known-positive/dx-tokens-region.css` | the comment-delimited exemption, which stays a Python line filter |
| `known-positive/waiver-claimed.css` | the L1 `[waiver-claimed]` downgrade, read from the raw source line |
| `known-positive/line-boundary-first.css` | ast-grep's 0-based line converted exactly once: the only finding is on line 1 |
| `known-positive/line-boundary-last.css` | the same at the other boundary, on a file with no trailing newline |
| `known-negative/tokens-only.css` | every value through `var(…)` or on scale |
| `known-negative/semantic-classes.tsx` | every colour through a semantic class |

## The weak evidence, labelled as such

The original parity evidence for the swap was a zero-findings match on this
repo's `components/`. That proves agreement on the empty case and nothing more,
so it is not part of this corpus and no self-test asserts it. Run it by hand as a
second opinion, never as the gate:

```
python3 plugins/dx-harness/checks/token-audit.py app components lib
python3 plugins/dx-harness/checks/type-scan.py app components
```

Both are silent at exit 0 before and after the swap.

## Two places the swap sharpens a message

Neither changes a decision about real code, so neither has a record here — a
record made by the pre-swap engine would enshrine the old text. Each has its own
self-test case instead, in the script that owns it:

- **A multi-line html comment is a syntax node now.** The old `<!-- … -->` strip
  ran per line, so only a comment that opened and closed on one line was removed,
  and a class or a size named inside a multi-line comment was reported.
- **A value is no longer read past the end of the node holding it.** The whole
  line used to be the style context of an inline `style` attribute, so an
  unterminated declaration swept the markup after it into the message
  (`off-scale spacing 15px">x`).
