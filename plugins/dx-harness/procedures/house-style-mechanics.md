# House style mechanics

This file holds the formatting half of the [house style](house-style.md): Google's
rules for capitalisation, punctuation, numbers, lists, headings, and code and UI
conventions, plus the four closed word lists.

Read it when the artifact carries a command, a placeholder, a UI element name, a
number or a range, or a table. The house style file holds what you need while you
draft. This file holds what you need while you check. Skip any Google rule scoped to
Google's own products, Android, or Google Cloud. None of them applies here.

`scripts/house-style-lint.py` parses the four word-list tables at runtime, so the
lint and this file cannot diverge. Run the lint rather than reading those tables. If
you rename a heading or change a table's shape, run `--self-test` to confirm that the
lint still parses it.

## Capitalisation, beyond sentence case

- No caps for emphasis. No ALL-CAPS or camelCase outside a literal identifier or an
  official name.
- Lowercase the first word after a colon, unless a proper noun, a full heading, a
  quotation, or a label such as "Note:" follows it.
- Use sentence case inside lists, tables, and captions too, not only headings.
- A hyphenated term at the start of a sentence or heading capitalises its first
  element only, unless a later element is a proper noun.
- State the naming requirement instead of the casing convention. Say what the
  identifier must look like, not "use camelCase".

## Articles, prepositions, and pronouns

- Never drop `a`, `an`, or `the` to shorten a sentence or heading: "Create a branch",
  not "Create branch".
- No rule bans a sentence that ends in a preposition. Place it where the sentence
  reads clearest, and cut it only if the sentence stays as clear without it.
- Every pronoun needs a clear antecedent. Follow a demonstrative with the noun it
  refers to: "Set this value to true", not "Set this to true". A bare "it" that
  stands in for a whole idea needs a rewrite, not a word swap.
- Use `that` for a restrictive clause, with no comma. Use `which` for a
  nonrestrictive one, with a comma before it. Compare "the build that fails blocks
  merge" with "the build, which takes ten minutes, blocks merge".
- Use singular `they`, never `he/she` or a generic `he`.
- Never make a product, feature, or code identifier possessive: "the `wordCount`
  method's return value", not "`wordCount`'s return value".

## Plurals and abbreviations

- Use regular plurals. Never put an apostrophe before the `s`.
- Pluralise an abbreviation like a word (`APIs`, `SKUs`). Never pluralise one that a
  number already pairs with (`64 GB`, not `64 GBs`).
- Use no periods inside an acronym or an initialism, and none in `US`.
- Never turn an abbreviation into a verb: "use SSH to log in", not "ssh into".
- Choose the article by sound, not spelling: "a SQL query", "an SDK".

## Punctuation

| Mark | Rule |
| --- | --- |
| Colon | What precedes it must stand alone as a complete sentence: "The fields are defined as follows:" not "The fields are:". |
| Comma | Put a comma after an introductory phrase, and before a conjunction that joins two independent clauses, unless both are very short. Put one before a nonrestrictive `which`. Put none before `because`, unless `because` opens a nonrestrictive clause. |
| Semicolon | Avoid by default. Three uses are allowed: to join two closely related independent clauses; before a conjunctive adverb such as `therefore` that joins two independent clauses; to separate list items that carry their own commas. |
| Dash | Never substitute an en dash for an em dash. Avoid en dashes. For a range, use a hyphen or the word `to`. |
| Hyphen | Use no hyphen on a plain prefix plus noun (`preprocessing`, `metadata`). Hyphenate a `self-` or `cross-` prefix, a prefix before a capitalised word or a number, and a prefix before an already-hyphenated term. Hyphenate a compound modifier before a noun when clarity needs it (`well-designed app`), and a number plus a spelled-out unit before a noun (`64-bit system`). Never hyphenate an `-ly` adverb plus an adjective (`highly available`, not `highly-available`). A range takes a hyphen and never mixes with `from` (`8-20 files`, not `from 8-20 files`). |
| Parentheses | Never hide required information inside them, because some readers skip them. Keep a parenthetical short, and split a long one into its own sentence. |
| Period | Every complete sentence ends with one, except a list item or a heading. Never end a sentence with a bare URL. Use one space between sentences. |
| Quotation marks | Use straight quotes, never curly ones. Use single quotes only for a quotation inside another quotation. Never quote text that is already in code font, unless the quotes belong to the string. |
| Exclamation mark | Do not use one. |
| Ellipsis | Do not use one in prose, for an omission or to trail off. Cut what the reader does not need, and state what the reader does. |
| Slash | Avoid outside code, paths, and URLs. Never use it for "or" and "and". Never write a slash fraction in prose (`3/4`); use a decimal or spell it out. |

## Numbers, beyond the threshold

`CLAUDE.md` holds the zero-to-nine rule, the numerals-from-10 rule, and their
exceptions. These extend it:

- **Ranges**: hyphenate with no spaces: `2012-2016`.
- **Percentages**: a numeral plus `%` with no space: `40%`. Spell out both if the
  sentence starts with it: "Forty percent of the files".
- **Decimals**: keep a leading zero: `0.3`. Treat a decimal as plural even at 1.0:
  "1.0 inches".
- **Large numbers**: group with commas from the decimal point leftward:
  `1,532,784 bytes`.
- **Currency**: a comma for thousands, a period for the decimal: `$10,000`.

## Lists and tables

- Use a **numbered** list for a sequence where order matters, a **bulleted** list for
  anything else, and a **description list** for term-and-explanation pairs.
- Introduce a list with a complete sentence that ends in a colon. Write "Use the
  **Submit** button for any of the following purposes:", not "Use the **Submit**
  button to:".
- Keep list items parallel in structure. Punctuate an item as a sentence, with a
  capital letter and a period, only when the item is a full sentence.
- Use a table when a row carries three or more related fields, such as a name, a
  type, and a description. A single column belongs in a list.
- Write table headers in sentence case, with no end punctuation.

## Headings and links

- Write a task heading as a bare imperative: "Create the branch", not "Creating the
  branch".
- Write a concept heading as a noun phrase: "Branch naming", not "Naming branches".
- Use one `h1` per document. Skip no heading level. Leave no heading with nothing
  under it.
- Prefix an optional section with `Optional:`, rather than a trailing "(optional)".
- Introduce a cross-reference with "For more information, see X". Link to a
  destination once per document, unless the document is long.

## Code, commands, and UI elements

- Code font covers more than an inline snippet. It also covers:
  - filenames and paths
  - environment variables
  - CLI tool names, such as `gcloud`
  - HTTP verbs and status codes, such as `POST` and `400 Bad Request`
  - ports and IP addresses
  - enum, constant, class, and method names
- A URL used as literal input takes code font. A URL that someone opens in a browser
  stays plain text.
- Never inflect a code element or use it as a verb: "send a `POST` request", not
  "`POST` the data".
- Name a placeholder in `UPPER_SNAKE_CASE` (`PROJECT_ID`), never with hyphens or
  camelCase. For one placeholder, write "Replace `PLACEHOLDER` with its value." For
  several, write "Replace the following:" and one bullet per placeholder, in the
  order they appear.
- Mark command-line syntax with `[optional]` in square brackets, `{a|b}` for "choose
  exactly one", and three literal dots for "repeat this". Never use the ellipsis
  character.
- Show command output only when it adds value, and introduce it with "The output is
  similar to the following:".
- Mark an omitted line in a code sample with that language's own comment syntax,
  never with `...`.
- Match a UI element's own on-screen capitalisation, but write it in sentence case
  when the screen shows it in all caps.
- Never turn a UI element into a verb or a noun: "In the **Name** field, enter a
  name", not "**Name** the account".
- A checkbox is "selected" or "not selected", never "checked". A menu path reads
  `**View > Tools**`.
- Use no directional language ("above", "the right-hand side"). Position is not
  stable across screen widths, or for a screen reader.

## Word choice: cut

| Phrase | Why |
| --- | --- |
| `and so on`, `etc.` | Name the actual items, or use "such as". |
| `and/or` | Ambiguous. Pick the one you mean, or write "or" for the inclusive sense. |
| `currently`, `now`, `presently`, `at present`, `as of this writing`, `existing` | The write date already implies this. The word dates the sentence and can leak an unannounced plan. A dated run-record heading or a GitHub timestamp is not time-anchoring language. |
| `eventually`, `soon`, `in the future` | The same staleness risk. Give a date or a version, or cut it. |
| `vice versa` | Write out both directions. Otherwise the reader reconstructs the reversed sentence. |
| `real`, `genuine`, `genuinely`, `honestly`, `actually`, `truly` | Self-certifying: the noun already carries the claim. A bug is a bug. "Honestly" is worse than nothing, because it invites the reader to doubt every sentence you did not label. Keep one of these only where it marks a contrast the reader needs, such as a confirmed finding against a plausible one. |
| `please note`, `at this time`, `let's` (in an instruction) | Filler. Cut the phrase and keep the instruction. |
| `it is worth noting that`, `it should be noted`, `the fact that`, `needless to say` | Filler. The sentence loses nothing when you cut it. |
| `in order to` | Write `to`. |

## Word choice: replace

| Avoid | Use | Note |
| --- | --- | --- |
| `utilise`, `utilisation` | `use` | Keep `utilisation` only for a resource quantity, as in "CPU utilisation". |
| `comprise` | `consist of`, `contain`, `include` | |
| `functionality` | `capabilities`, `features` | When that is the meaning. Often overused. |
| `possible`, `impossible` (meaning can, cannot) | `can`, `can't` | |
| `performant` | Name the quality: `fast`, `reliable`, `accurate` | |
| `agnostic` | `platform-independent` | |
| `config` | `configuration`, `configuring` | Outside code font. |
| `k8s` | `Kubernetes` | |
| `regex` | `regular expression` | |
| `repo` | `repository` | On first use. `repo` is fine after that. |
| `vs.` | `versus` | |
| `aka` | "also known as", or parentheses | |
| `tl;dr` | "Summary:" | |
| `via` | `through`, `by`, `using` | |
| `hit` (meaning click, press, or type) | the specific verb | |
| `traditional` | `conventional`, or cut it | |
| `could`, `would` (meaning possibility) | `can` | |
| `shall` | `must` | Unless you write legal text. |

## Word choice: precision

| Term | Rule |
| --- | --- |
| `while` | Do not use it for contrast. Write `although` or `whereas`. It is fine for a span of time. |
| `since` | Do not use it to mean `because`. It is ambiguous with the passage of time. |
| `as` | The same ambiguity as `since`. Write `because`. |
| `for instance` | Write `for example`. `for instance` reads as the noun "instance". |
| `for example` | Follow it with a comma. |
| `each` | Means every item taken on its own, not the group. Do not use it for `all`. |
| `either` | Use it for a choice between two things, with parallel syntax: "either do X or do Y", not "either X or do Y". |
| `neither A nor B` | Not "neither A or B". |
| `between`, `among` | Use `between` for two or more distinct things. Use `among` for items inside a group. |
| "about", "on" (in "for more information about X") | Use `about`. |

## Inclusive and neutral language

| Avoid | Use |
| --- | --- |
| `blacklist`, `whitelist`, `graylist` | `denylist`, `allowlist`, `blocklist` (pick the term that matches whether a list is involved at all) |
| `master`, `slave` | `primary` and `secondary`, `primary` and `replica`, or a pair that matches the domain |
| `sanity check` | `quick check`, `confidence check` |
| `crazy`, `insane`, `lunatic`, `bonkers` (of a design or a system) | `complicated`, `unexpected` |
| `grandfathered` | `legacy`, `exempt` |
| generic `he`, `him`, `his` | singular `they`, `their` |
| `guys` | `everyone`, `folks` |
| `lame`, `crippled` (of a limitation) | Name the limitation precisely |
| `black-box`, `white-box` testing | `opaque-box`, `clear-box` testing |
| `man-hours`, `manpower` | `person-hours`, `staff time` |
| `wheelchair-bound`, `suffers from`, `victim of` | `uses a wheelchair`, or state the condition plainly |
| `elderly` | `older adults` |

## Modal verbs

| Word | Use for |
| --- | --- |
| `can` | permission, ability, or an optional action |
| `might` | possibility or an uncertain outcome |
| `must` | a required action or state |
| `we recommend` | an advisory action |
| `may` | official policy only. Use `can` for permission and `might` for possibility. |
| `should` | Avoid. It never says whether the action is required or advised. Use `must` or "we recommend". |
