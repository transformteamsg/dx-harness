# CNT: Content

Source: the CNT controls of [`catalog.yaml`](../../catalog.yaml), from the DX design standard. Status: draft. The decisions and open items are in the [category README](README.md).

The CNT controls list no "Not required for" text, so no row has an exemption parameter. `CNT-1` and `CNT-10` port to existing rules, and `CNT-14` is domain, so they have no row.

| Control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| CNT-2 Plain feature and page names | `CNT-2a` Feature and page names use plain language, with no invented portmanteaus and no internal codenames | judged | | | |
| CNT-3 Second person and active voice | `CNT-3a` Copy speaks to the user as "you" and uses active voice | judged | | | |
| CNT-4 Faithful real-world content | `CNT-4a` Content that models a real-world artefact is faithful to it, or is labelled illustrative | judged | | | |
| CNT-5 Device-neutral action words | [`CNT-5a`](device-verbs.md) Action words do not name the input device. Lint part of CNT-5b. | lint | rendered | custom | `deviceVerbs`, `pages` (unset) |
| | `CNT-5b` Action words name the action in the cases that a word list cannot decide. Lint part: [CNT-5a](device-verbs.md). | judged | | | |
| CNT-6 No low-information words | [`CNT-6a`](low-information-words.md) Copy has no empty openers and no filler words. Lint part of CNT-6b. | lint | rendered | custom | `openers`, `fillerWords`, `pages` (unset) |
| | `CNT-6b` Copy has no other low-information words, unless removing them hurts clarity. Lint part: [CNT-6a](low-information-words.md). | judged | | | |
| CNT-7 Purpose before mechanism | `CNT-7a` Descriptive copy states its purpose for the user before the mechanism | judged | | | |
| CNT-8 Plain verbs, not nominalisations | `CNT-8a` Copy uses plain action verbs, not nominalised verbs and "to be" constructions | judged | | | |
| CNT-9 Clear copy | `CNT-9a` Copy has one idea per sentence, no double negatives, and no noun stacks | judged | | | |
| CNT-11 Established UI terms | `CNT-11a` UI terms match the established word that users meet in other products | judged | | | |
| CNT-12 Sentence case | [`CNT-12a`](sentence-case.md) Headings, labels, and buttons use sentence case. Lint part of CNT-12b. | lint | rendered | custom | `labelSelector`, `properNouns`, `pages` (unset) |
| | `CNT-12b` Running prose and the remaining labels use sentence case. Lint part: [CNT-12a](sentence-case.md). | judged | | | |
| CNT-13 Spelling and Singapore English | [`CNT-13a`](spelling.md) Copy uses British spelling and has no common misspellings. Lint part of CNT-13b. | lint | rendered | custom | `usToUk`, `typos`, `pages` (unset) |
| | `CNT-13b` Copy has no contextual typos, homophones, or doubled words. Lint part: [CNT-13a](spelling.md). | judged | | | |

## Judged reasons

| Rule | Reason |
| --- | --- |
| `CNT-2a` | Whether a name needs an explanation depends on the words that the users know. |
| `CNT-3a` | Voice and person depend on the grammar of each sentence, and labels and fragments are out of scope. |
| `CNT-4a` | Fidelity is a comparison with the real artefact, which the page does not hold. |
| `CNT-5b` | "Press" and "see" have common meanings that are not device actions, so a list reports too much. |
| `CNT-6b` | Words such as "that" and "the" are too common to list, and each removal needs a clarity check. |
| `CNT-7a` | The purpose of a thing and its mechanism are meanings, not patterns. |
| `CNT-8a` | Many nouns that end in "-tion" or "-ment" are correct, so the ending alone does not decide. |
| `CNT-9a` | One idea per sentence and a double negative depend on the meaning of the sentence. |
| `CNT-11a` | The established term for an element comes from other products, not from the page. |
| `CNT-12b` | Prose holds names that no list knows, so each capital in prose is a judgment. |
| `CNT-13b` | A homophone or a wrong word is spelled correctly, so only the meaning shows the error. |
