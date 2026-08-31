# Writing style (shared procedure)

This is the shared concision standard for prose a skill writes for a human to read
once: issue bodies, pull and merge request descriptions, decision records, and code
review comments. A skill that produces one of these follows this file rather than
inventing its own idea of "well written."

This file exists because a review measured the problem rather than assumed it.
Checking a nine-issue epic against its own code found issues running past 6,000
words to describe changes of a few hundred lines: tables restating one sequencing
rule three times, background sections repeating context the parent issue already
carried, and hedges that did no work ("it is worth noting that", "in order to
ensure that"). None of it was wrong. All of it cost the reader time for no return.

## Scope

This file governs prose written once for a human colleague to read once, then act
on. It does not govern:

- **Product UI copy.** Second-person text a product's own users read is a design
  concern with its own audience and constraints. SLP-9 governs it, and the
  `dx-design-copy` skill carries it. Do not apply this file there.
- **Published technical documents.** `docs/`, `CONTEXT.md`, and READMEs follow
  the Google developer documentation style guide; the Technical documents
  section of `CLAUDE.md` names it. That guide sets mechanics: sentence case, serial
  commas, numerals, present tense. This file adds a stricter concision bar on top
  of it, for the shorter, single-read artifacts named above.
- **Code and code comments.** `CLAUDE.md` already says to default to no comments.
  This file is about prose, not code.

## Orwell's six rules

From George Orwell's 1946 essay "Politics and the English Language." Each rule
names a concrete violation, so an agent can check a draft against it rather than
agree with it.

1. **Never use a metaphor, simile, or other figure of speech which you are used to
   seeing in print.** An issue does not need a "north star" or a "single source of
   truth" when it means one thing: name that thing.
2. **Never use a long word where a short one will do.** Write `use`, not `utilise`;
   `help`, not `facilitate`; `start`, not `commence`.
3. **If it is possible to cut a word out, always cut it out.** This is the rule
   that catches most of what an issue does not need: a background paragraph
   restating what the parent issue already says, a sentence that only restates its
   own heading, a hedge that changes nothing if deleted ("it is worth noting that",
   "in order to", "the fact that").
4. **Never use the passive where you can use the active.** "The script emits an
   error" over "an error is emitted by the script": the reader learns who does
   what without working it out.
5. **Never use a foreign phrase, a scientific word, or a jargon word if you can
   think of an everyday word that will serve.** Coining a term for one issue's use
   ("honest-inert", "anchor") without defining it anywhere durable is jargon by
   this rule's test, even when it names something real; define it once where it
   will still exist after the issue closes, or use the plain phrase instead.
6. **Break any of these rules sooner than say anything outright barbarous.** A
   short word that confuses a reader who does not already know the codebase is
   worse than a longer one that does not. These are defaults, not a ban on
   judgment.

## Google style guide reference

Condensed from the [Google developer documentation style guide](https://developers.google.com/style), filtered to what applies to issues, PR and MR descriptions, decision records, and review comments. The Technical documents section of `CLAUDE.md` already carries the guide's headline mechanics: second person, active voice, present tense, sentence case, serial commas, numerals, spelling out an abbreviation on first use, and "for example" over "e.g." This section carries what that summary leaves out. Skip anything scoped to Google's own products, Android, or Google Cloud; it does not apply here.

### Voice, tense, and person

- Passive is acceptable only to emphasise the object, de-emphasise an unimportant actor, or when the actor is irrelevant: "The file is saved," "The database was purged in January."
- Don't hedge a present-tense fact with "would": "If you send an unsubscribe message, the server removes you from the list," not "the server would then remove you."
- Never describe an unreleased capability in the present or future tense as though it already exists.
- Instructions stay imperative; `you` is implied, not stated: "Click **Submit**," not "You click Submit."
- Third person for what software or another person does; second person only to instruct the reader directly.
- `we`/`our` names the author only, and only with an unambiguous antecedent, such as a named team. Decide once who "you" addresses (the implementer, the reviewer) and hold it for the whole artifact.

### Capitalisation, beyond sentence case

- No caps for emphasis, and no ALL-CAPS or camelCase outside a literal identifier or an official name.
- Lowercase the first word after a colon, unless what follows is a proper noun, a full heading, a quotation, or a label such as "Note:".
- Sentence case inside lists, tables, and captions too, not only headings.
- A hyphenated term at a sentence or heading start capitalises only its first element, unless a later element is itself a proper noun.
- State the actual naming requirement instead of naming a casing convention: say what the identifier must look like, not "use camelCase".

### Articles, prepositions, pronouns

- Never drop `a`/`an`/`the` to shorten a sentence or heading: "Create a branch," not "Create branch."
- No rule against ending a sentence in a preposition; place it wherever the sentence reads clearest, and cut it only if the sentence is just as clear without it.
- Every pronoun needs an unambiguous antecedent. Follow a demonstrative with the noun it refers to: "Set this value to true," not "Set this to true." A bare "it" standing in for a whole preceding idea is a rewrite, not a word swap.
- `that` for a restrictive clause, no comma; `which` for a nonrestrictive one, comma before it: "the build that fails blocks merge" against "the build, which takes ten minutes, blocks merge."
- Singular `they`, never `he/she` or a generic `he`.
- Never make a product, feature, or code identifier possessive: "the `wordCount` method's return value," not "`wordCount`'s return value."

### Pluralisation and abbreviations

- Regular plurals; never an apostrophe before the `s`.
- Pluralise an abbreviation like a word (`APIs`, `SKUs`); never pluralise one already paired with a number (`64 GB`, not `64 GBs`).
- No periods inside an acronym or initialism, and none in `US`.
- Never turn an abbreviation into a verb: "use SSH to log in," not "ssh into."
- Article choice follows the sound, not the spelling: "a SQL query," "an SDK."

### Punctuation

| Mark | Rule |
| --- | --- |
| Colon | What precedes it must stand alone as a complete sentence: "The fields are defined as follows:" not "The fields are:". |
| Comma | Comma after an introductory phrase. Comma before a conjunction joining two independent clauses, unless both are very short. Comma before a nonrestrictive `which`. No comma before `because` unless it opens a nonrestrictive clause. |
| Semicolon | Avoid by default. The three allowed uses: joining two closely related independent clauses; before a conjunctive adverb such as `therefore` that joins two independent clauses; separating list items that already contain their own commas. |
| Dash | Never substitute an en dash for an em dash. Avoid en dashes entirely; for a range, use a hyphen or the word `to`. |
| Hyphen | No hyphen on a plain prefix plus noun (`preprocessing`, `metadata`). Hyphenate `self-`/`cross-` prefixes, a prefix before a capitalised word or number, or before an already-hyphenated term. Hyphenate a compound modifier before a noun when needed for clarity (`well-designed app`), and a number plus spelled-out unit before a noun (`64-bit system`). Never hyphenate an `-ly` adverb plus adjective (`highly available`, not `highly-available`). A range takes a hyphen, not an en dash, and never mixes with `from` (`8-20 files`, not `from 8-20 files`). |
| Parentheses | Never hide required information inside them; some readers skip them. Keep a parenthetical short, and split it into its own sentence if it runs long. |
| Period | Every complete sentence ends with one, list items and headings excepted. Never end a sentence with a bare URL. One space between sentences. |
| Quotation marks | Straight quotes only, never curly ones. Single quotes only for a quotation nested inside another. Never quote text already in code font unless the quotes are literally part of the string. |
| Ellipsis | Don't use one in prose, for an omission or for trailing off. Cut what's unneeded and state what's needed instead. |
| Slash | Avoid outside code, paths, and URLs. Never use it for "or"/"and", and never write a slash fraction in prose (`3/4`); use a decimal or spell it out. |

### Word choice: cut

| Phrase | Why |
| --- | --- |
| `and so on`, `etc.` | Name the actual items, or use "such as". |
| `and/or` | Ambiguous. Pick the one you mean, or write "or" and mean the inclusive sense. |
| `currently`, `now`, `presently`, `at present`, `as of this writing`, `existing` | The write date already implies this. Naming it dates the sentence and can leak an unannounced plan. |
| `eventually`, `soon`, `in the future` | Same staleness risk. Give a real date or version, or cut it. |
| `vice versa` | Write out both directions; a reader has to reconstruct the reversed sentence themselves otherwise. |

### Word choice: replace

| Avoid | Use | Note |
| --- | --- | --- |
| `utilize`, `utilization` | `use` | Keep `utilization` only for a resource quantity, as in "CPU utilization". |
| `comprise` | `consist of`, `contain`, `include` | |
| `functionality` | `capabilities`, `features` | When that is what is meant; often overused. |
| `possible`/`impossible` (meaning can/can't) | `can`/`can't` | |
| `performant` | Name the actual quality: `fast`, `reliable`, `accurate` | |
| `agnostic` | `platform-independent` | |
| `config` | `configuration`, `configuring` | Outside code font. |
| `k8s` | `Kubernetes` | |
| `regex` | `regular expression` | |
| `repo` | `repository` | On first use; `repo` is fine after. |
| `vs.` | `versus` | |
| `aka` | "also known as", or parentheses | |
| `tl;dr` | "Summary:" | |
| `via` | `through`, `by`, `using` | |
| `hit` (meaning click, press, or type) | the specific verb | |
| `traditional` | `conventional`, or cut it | |
| `could`, `would` (meaning possibility) | `can` | |
| `shall` | `must` | Unless writing legal text. |

### Word choice: precision

| Term | Rule |
| --- | --- |
| `while` | Don't use for contrast. Write `although` or `whereas`. Fine for a span of time. |
| `since` | Don't use to mean `because`; it is ambiguous with the passage of time. |
| `as` | Same ambiguity as `since`. Write `because`. |
| `for instance` | Write `for example` instead; `for instance` reads as the noun "instance". |
| `for example` | Follow it with a comma. |
| `each` | Means every item taken individually, not the group. Don't use it as a stand-in for `all`. |
| `either` | Only for a choice between two things, with parallel syntax: "either do X or do Y", not "either X or do Y". |
| `neither A nor B` | Not "neither A or B". |
| `between` vs `among` | `between` for two or more distinct things; `among` for items that are part of a group. |
| "about" vs "on" (in "for more information about/on X") | Use `about`. |

### Inclusive and neutral language

| Avoid | Use |
| --- | --- |
| `blacklist`/`whitelist`/`graylist` | `denylist`/`allowlist`/`blocklist` (pick the term that matches whether there is really a list) |
| `master`/`slave` | `primary`/`secondary`, `primary`/`replica`, or similar, matched to the domain |
| `sanity check` | `quick check`, `confidence check` |
| `crazy`, `insane`, `lunatic`, `bonkers` (of a design or system) | `complicated`, `unexpected` |
| `grandfathered` | `legacy`, `exempt` |
| generic `he`/`him`/`his` | singular `they`/`their` |
| `guys` | `everyone`, `folks` |
| `lame`, `crippled` (of a limitation) | name the limitation precisely |
| `black-box`/`white-box` testing | `opaque-box`/`clear-box` testing |
| `man-hours`, `manpower` | `person-hours`, `staff time` |
| `wheelchair-bound`, `suffers from`, `victim of` | `uses a wheelchair`, or state the condition plainly |
| `elderly` | `older adults` |

### Modal verbs

| Word | Use for |
| --- | --- |
| `can` | permission, ability, or an optional action |
| `might` | possibility or an uncertain outcome |
| `must` | a required action or state |
| `we recommend` | an advisory action |
| `may` | official policy only; use `can` for permission and `might` for possibility |
| `should` | avoid; it never says whether the action is required or only advised. Use `must` or "we recommend" instead. |

### Tone discipline

- No filler ("please note," "at this time"), no exclamation marks, no "let's" in an instruction.
- No superlatives (`best`, `fastest`, `never`, `always`) or absolute claims (`ensure`, `guarantee`) unless you can point to what verifies them.
- A security or reliability claim says a feature "helps with" or "is designed for" its goal, never that it "prevents" or "guarantees" it: one incident disproves the stronger claim.
- Don't pre-announce a capability that isn't built yet, even in passing.
- The time-anchoring words to cut are in Word choice: cut below. That rule governs sentences, not structural metadata: a dated run-record heading or a GitHub timestamp is not time-anchoring language.
- Never copy third-party text, code, or images verbatim. Paraphrase, and link to the source instead.

### Numbers, beyond the threshold

The zero-to-nine/numerals-10-and-above rule and its exceptions are in `CLAUDE.md`. These extend it:

- **Ranges**: hyphenate with no spaces: `2012-2016`.
- **Percentages**: numeral plus `%` with no space: `40%`. Spell out both if the sentence starts with it: "Forty percent of the files".
- **Decimals**: a leading zero: `0.3`. Treat as plural even at 1.0: "1.0 inches".
- **Large numbers**: comma-group from the decimal point leftward: `1,532,784 bytes`.
- **Currency**: comma for thousands, period for the decimal: `$10,000`.

### Sentence and paragraph mechanics

- **Context before instruction.** State the condition or goal before the action: "To delete the document, click Delete", not "Click Delete if you want to delete the document."
- **No anthropomorphism.** Software doesn't have senses or intent. Write "the script detects the change", not "the script sees the change"; "the config specifies X", not "the config tells the runner X".
- **Contractions are fine for negation.** `isn't`, `don't`, `can't` are harder to misread than "not" alone. Never invent one (`guides're`) or stack three words into one (`mightn't've`).
- **A paragraph holds one idea in five or six sentences at most**, and opens with its most important point. A reader scanning an issue does not read every word.
- **Left-align. No manual line breaks inside a paragraph**; they render inconsistently at different widths.
- **One term per concept.** Use the same word, spelled and capitalised the same way, everywhere in one artifact. Never stack more than two nouns as a modifier: "cloud-native pipeline," not "hybrid cloud-native DevSecOps pipeline."
- **Name the object of a reference, not just its filename**: "the `example.yaml` file," not "`example.yaml`."

### Lists and tables

- **Numbered** for a sequence where order matters; **bulleted** for anything else; a **description list** for term-and-explanation pairs.
- Introduce a list with a complete sentence ending in a colon. "Use the Submit button for any of the following purposes:", not "Use the Submit button to:".
- Keep list items parallel in structure. Punctuate as a sentence (capital letter, period) only when an item itself is a full sentence.
- Use a table when a row has three or more related fields (name, type, description); a single column belongs in a list instead.
- Table headers: sentence case, no ending punctuation.

### Headings and links

- A task-oriented heading is a bare imperative: "Create the branch", not "Creating the branch".
- A concept heading is a noun phrase: "Branch naming", not "Naming branches".
- One `h1` per document. Don't skip a heading level. Don't leave a heading with nothing under it.
- Prefix an optional section with `Optional:`, not a trailing "(optional)".
- Introduce a cross-reference with "For more information, see X", not "on X"; link to a destination once per document unless the document is long.

### Code, commands, and UI elements

- Code font also covers filenames and paths, environment variables, CLI tool names (`gcloud`), HTTP verbs and status codes (`POST`, `400 Bad Request`), ports, IP addresses, and enum, constant, class, or method names, not only inline snippets. A URL used as literal input is code font; a URL someone navigates to in a browser stays plain text.
- Never inflect a code element or use it as a verb: "send a `POST` request," not "`POST` the data."
- Name a placeholder in `UPPER_SNAKE_CASE` (`PROJECT_ID`), never hyphens or camelCase. One placeholder: "Replace `PLACEHOLDER` with its value." Several: "Replace the following:" then one bullet per placeholder, in the order they appear.
- Command-line syntax: `[optional]` in square brackets, `{a|b}` for "choose exactly one," three literal dots for "repeat this" (never the ellipsis character). Show command output only when it adds value, introduced by "The output is similar to the following:".
- A code sample marks an omitted line with that language's own comment syntax, never `...`.
- Match a UI element's own on-screen capitalisation, but write it in sentence case if the screen shows it in all caps. Never turn a UI element into a verb or noun: "In the **Name** field, enter a name," not "**Name** the account." A checkbox is "selected" or "not selected," never "checked." A menu path reads `**View > Tools**`. No directional language ("above," "the right-hand side"): position isn't stable across screen widths or for a screen reader.

## Before you post it

Read the draft once as the person who will act on it, not as the person who wrote
it, and cut anything that meets one of these tests:

- It restates a heading, a parent issue, or another section in this same body.
- It explains why a rule matters, when the rule alone would tell the reader what
  to do.
- It hedges without narrowing anything ("generally", "in most cases", "it should
  be noted").
- It is a worked example, a simulation, or a rehearsal of the reasoning that led
  here, rather than the conclusion. Keep the conclusion and the one piece of
  evidence that supports it; cut the rest of the working.

A table, a background note, or an aside that stays accurate only until something
else changes needs to say so, for example a coupling between two files that breaks
the moment one of them is edited. Undated prose that is only true today reads as
current long after it has gone stale.

## A worked example

Before, 75 words:

> It is worth noting that the validator currently enforces this rule by checking
> whether the relevant field is present in the catalogue entry, and in order to
> ensure that the check does not fire on controls where it should not apply, an
> allowlist mechanism has been introduced which is intended to grandfather in the
> controls that are still pending their own script, so that the build continues to
> pass while the remaining work is completed.

After, 23 words:

> The validator requires this field. A temporary allowlist grandfathers controls
> whose script is still pending, so the build passes until each one lands.

Nothing the first version says is wrong. The second says all of it.

## Path resolution

This file ships with the harness plugin, not the product repo.

- From a procedure doc in `procedures/`: this file, directly.
- From a skill directory (`skills/engineering/<dir>/SKILL.md` or
  `skills/design/<dir>/SKILL.md`): three levels up,
  `../../../procedures/writing-style.md`.
