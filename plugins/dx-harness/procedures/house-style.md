# House style (shared procedure)

This file sets the concision standard for prose that a human reads once, then acts
on. It covers issue bodies, pull and merge request descriptions, decision records,
and code review comments. A skill that writes one of these follows this file.

This is the canonical copy. The repository's output style,
`.claude/output-styles/house-style.md`, carries the same rules in a shorter form
for a whole session rather than one artifact. Change this file first, then carry
the change across.

Every rule here is a default, not a ban on judgment. A short word that confuses a
reader who does not know the codebase is worse than a long word that does not.

Two files carry the rest of the standard:

- [House style mechanics](house-style-mechanics.md) holds Google's formatting rules:
  capitalisation, punctuation, numbers, lists, headings, code, and UI. Read it when
  the artifact carries a command, a placeholder, a UI element name, a number, or a
  table.
- `scripts/house-style-lint.py` enforces the four closed word lists, so you never
  need to read them. Before you post it names the command.

## Scope

This file does not govern:

- **Product UI copy.** SLP-9 governs the text a product's own users read, and the
  `dx-design-copy` skill carries it.
- **Published technical documents.** `docs/`, `CONTEXT.md`, and READMEs follow the
  Google developer documentation style guide, which the Technical documents section
  of `CLAUDE.md` names. That guide sets the mechanics. This file adds a stricter
  concision bar, for the short artifacts named above.
- **Code and code comments.** `CLAUDE.md` already sets the default to no comments.

## Word choice: general tests

The lint enforces four closed word lists. Apply these tests to a word that no list
names:

- Prefer the short word. Write `use`, not `utilise`; `help`, not `facilitate`;
  `start`, not `commence`.
- Cut a figure of speech that you are used to seeing in print. An issue does not need
  a "north star" or a "single source of truth". Name the thing it means.
- Define a coined term where it outlives the issue, or use the plain phrase. A term
  invented for one issue ("honest-inert", "anchor") is jargon until you define it
  somewhere durable.

## Voice, tense, and person

- Use the passive only to emphasise the object, or when the actor does not matter:
  "The file is saved."
- Do not hedge a present-tense fact with `would`. Write `the server removes you`,
  not `the server would then remove you`.
- Never describe an unreleased capability as though it already exists.
- Keep an instruction imperative. `you` is implied: "Click **Submit**", not "You
  click Submit".
- Use the third person for what software or another person does. Use the second
  person only to instruct the reader.
- `we` and `our` name the author, and only with a clear antecedent such as a named
  team. Decide once who `you` addresses, then hold it for the whole artifact.

## Claims and evidence

- Use no superlatives (`best`, `fastest`, `never`, `always`) and no absolute claims
  (`ensure`, `guarantee`), unless you can point to what verifies them.
- A security or reliability claim says that a feature "helps with" or "is designed
  for" its goal, never that it "prevents" or "guarantees" it. One incident disproves
  the stronger claim.
- Never copy third-party text, code, or images word for word. Paraphrase, and link to
  the source.

## Sentence construction (ASD-STE100)

From the Simplified Technical English specification, the parts that Google leaves
out:

- Keep an instruction to 20 words or fewer, and a descriptive sentence to 25.
- Put one instruction in one sentence. Write a numbered step for each action in a
  sequence, rather than one sentence that joins them with "and".
- Use a verb in its infinitive, imperative, simple past, or past participle form. An
  `-ing` form belongs in a technical name only, such as "a floating point number".
  Never use one to compress a clause: write "the file that fails the check", not "the
  file failing the check".
- State a warning or a constraint before the step it applies to, never after.

## Sentence and paragraph mechanics

- **Context before instruction.** State the condition or the goal before the action.
  Write "To delete the document, click **Delete**", not "Click **Delete** if you want
  to delete the document."
- **No anthropomorphism.** Software has no senses and no intent. Write "the script
  detects the change", not "the script sees the change".
- **Contractions are fine for negation.** A reader misreads `isn't`, `don't`, and
  `can't` less often than a bare "not". Never invent one (`guides're`) or stack three
  words into one (`mightn't've`).
- **A paragraph holds one idea in six sentences at most**, and opens with its most
  important point. A reader who scans an issue does not read every word.
- **Left-align, and use no manual line breaks inside a paragraph.** They render
  inconsistently at different widths.
- **One term per concept.** Use the same word, spelled and capitalised the same way,
  through the whole artifact. Never stack more than two nouns as a modifier:
  "cloud-native pipeline", not "hybrid cloud-native DevSecOps pipeline".
- **Name the object of a reference, not the filename alone**: "the `example.yaml`
  file", not "`example.yaml`".

## How long

Length is a separate decision from wording, and it goes wrong more often. A review of
a nine-issue epic found bodies of more than 6,000 words for changes of a few hundred
lines.

- **Match the length to the task.** Cover the substance. Do not pad with filler
  sections, redundant summaries, or boilerplate.
- **A section with nothing to say takes `None`.** A template asks you to fill every
  section so that nothing required goes missing. It does not ask you to find
  something to write. `None` reads as a decision. Three sentences of restated context
  read as an oversight.
- **Length comes from load-bearing content only**: an acceptance criterion, a
  reproduction step, a verified fact, or a constraint someone must respect. It never
  comes from context that sits behind a link you already gave.
- **A long artifact is not wrong on its own.** A change that turns on 20 verified
  facts needs all 20. Ask whether each part is load-bearing, not whether the whole
  runs long. If every part is load-bearing and the artifact is still unwieldy, the
  problem is its scope: split the work.

## Before you post it

Run the lint first. It decides what a closed list can decide, and it exits 1 if any
`ERROR` line stands.

```bash
python3 <harness>/scripts/house-style-lint.py <<'EOF'
<the drafted body>
EOF
```

`<harness>` is the plugin directory, `plugins/dx-harness/` where a repository
vendors it. Fix every `ERROR`. A `WARN` names a term that is correct in some
clauses, so judge that one and move on.

Then read the draft once as the person who acts on it. Cut anything that meets one
of these tests:

- It restates a heading, a parent issue, or another section of the same body.
- It explains why a rule matters, when the rule alone tells the reader what to do.
- It hedges without narrowing anything: `generally`, `in most cases`, or
  `it should be noted`.
- It rehearses the reasoning that led to the conclusion. Keep the conclusion and the
  one piece of evidence that supports it. Cut the rest.

A table, a note, or an aside that stays accurate only until something else changes
must say so. A coupling between two files, for example, breaks the moment someone
edits one of them. Undated prose that is true only today reads as current long after
it goes stale.

## A worked example

Before, 75 words:

> It is worth noting that the validator currently enforces this rule by checking
> whether the relevant field is present in the catalogue entry, and in order to
> ensure that the check does not fire on controls where it should not apply, an
> allowlist mechanism has been introduced which is intended to grandfather in the
> controls that are still pending their own script, so that the build continues to
> pass while the remaining work is completed.

After, 23 words:

> The validator requires this field. A temporary allowlist exempts controls whose
> script is still pending, so the build passes until each one lands.

Nothing in the first version is wrong. The second says all of it.

## Path resolution

This procedure ships with the harness plugin, not the product repository. Both files
sit in `procedures/`, so the same locator reaches either one.

- From a procedure doc in `procedures/`: this file, directly.
- From a skill directory (`skills/engineering/<dir>/SKILL.md` or
  `skills/design/<dir>/SKILL.md`): three levels up,
  `../../../procedures/house-style.md`.
- From `docs/harness-feedback.md`: one level up, `../procedures/house-style.md`.
- The lint sits at `../../../scripts/house-style-lint.py` from a skill directory.
