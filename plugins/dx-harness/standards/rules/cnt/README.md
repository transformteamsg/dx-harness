# CNT: Content

Source: the CNT controls of [`catalog.yaml`](../../catalog.yaml), from the DX design standard. Status: draft.

This folder holds 11 controls and 15 rules: 4 lintable and 11 judged. The rule format is in the [top-level README](../../rules.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

A rule file exists only for a lintable rule.

| Rule | Title | Check |
| --- | --- | --- |
| `CNT-2a` | Feature and page names use plain language, with no invented portmanteaus and no internal codenames | judged |
| `CNT-3a` | Copy speaks to the user as "you" and uses active voice | judged |
| `CNT-4a` | Content that models a real-world artefact is faithful to it, or is labelled illustrative | judged |
| [`CNT-5a`](device-verbs.md) | Action words do not name the input device | lint |
| `CNT-5b` | Action words name the action in the cases that a word list cannot decide | judged |
| [`CNT-6a`](low-information-words.md) | Copy has no empty openers and no filler words | lint |
| `CNT-6b` | Copy has no other low-information words, unless removing them hurts clarity | judged |
| `CNT-7a` | Descriptive copy states its purpose for the user before the mechanism | judged |
| `CNT-8a` | Copy uses plain action verbs, not nominalised verbs and "to be" constructions | judged |
| `CNT-9a` | Copy has one idea per sentence, no double negatives, and no noun stacks | judged |
| `CNT-11a` | UI terms match the established word that users meet in other products | judged |
| [`CNT-12a`](sentence-case.md) | Headings, labels, and buttons use sentence case | lint |
| `CNT-12b` | Running prose and the remaining labels use sentence case | judged |
| [`CNT-13a`](spelling.md) | Copy uses British spelling and has no common misspellings | lint |
| `CNT-13b` | Copy has no contextual typos, homophones, or doubled words | judged |

## Decisions

- `CNT-5`, `CNT-6`, `CNT-12`, and `CNT-13` are hybrid. Each lint rule checks a word list or a pattern, and its judged rule covers what a list cannot decide.
- `CNT-2`, `CNT-3`, `CNT-4`, `CNT-7`, `CNT-8`, `CNT-9`, and `CNT-11` become one judged rule each.
- The rules keep only the parts that no DSS rule covers, per the [retirement spec](../../../../../docs/specs/2026-10-28-catalogue-retirement.md):
  - `CNT-2a` leaves plain words to `BD-4b` and `WU-3a`.
  - `CNT-3a` leaves sentence length to the readability grade of `BD-4a`.
  - `CNT-5a` and `CNT-5b` leave link text to `WO-10c`, and instructions that rely on a sense, such as position or shape, to `WP-8a`.
  - `CNT-9a` leaves short words, tense, and definitions to `BD-4a`, `BD-4b`, `WU-3a`, and `WU-4a`.
- The rules name the user of the product, so that they apply to any product.
- The word lists of `CNT-5a`, `CNT-6a`, and `CNT-13a` are parameters with the lists of the source controls as defaults. A product adds words in its config.
- `CNT-12a` reads labels only. Running prose holds many names that no list knows, so `CNT-12b` judges capitals in prose.
- `CNT-12` had no script, because copy does not mark which words are names. `CNT-12a` takes the names from `properNouns`, which closes that gap for labels.
- The four lint rules read rendered text rather than source strings. A source scan cannot tell copy from code, and the rendered page holds the copy that a user reads.
- `CNT-1` is not in this folder. It ports to existing rules, per the retirement spec. `CNT-10` also ports, and `CNT-14` is domain.

## Open

- The judged rules need rubrics from `dx-design-judge`: `CNT-2a`, `CNT-3a`, `CNT-4a`, `CNT-5b`, `CNT-6b`, `CNT-7a`, `CNT-8a`, `CNT-9a`, `CNT-11a`, `CNT-12b`, and `CNT-13b`.
- `checks/content-lint.py` still reads the word lists from `standards/controls/`. It retires with the catalogue controls in [#540](https://github.com/transformteamsg/dx-harness/issues/540).

## Built

The four lint rules have modules in `packages/design-lint/src/modules/cnt/`.

- All four read visible text through one shared scan. The scan skips hidden elements, text whose `lang` is not English, and `code`, `pre`, `kbd`, `samp`, `script`, `style`, `noscript`, and `template` content.
- `CNT-5a` also skips link text.
- `CNT-6a` splits the text of each block into sentences at `.`, `!`, and `?` followed by a space.
- `CNT-12a` reports an element once, with the first word that breaks sentence case.
- A finding is at the top left of the element that holds the text.
- The demo config is `demo/config.d/cnt.json`.

Rules not built: none.
