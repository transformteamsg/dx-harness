# House style (shared procedure)

This file sets the concision standard for prose that a human reads once, then acts
on. It covers issue bodies, pull and merge request descriptions, decision records,
and code review comments. A skill that writes one of these follows this file.

The mechanics sit elsewhere. The Technical documents section of `CLAUDE.md` puts these
artifacts under the Google developer documentation style guide. That guide settles
capitalisation, punctuation, numbers, headings, spelling, and the word list. This file
adds what it leaves out: a concision bar, an evidence bar, and a test for length.

This is the canonical copy. The repository's output style,
`.claude/output-styles/house-style.md`, carries the same rules in shorter form for a
whole session rather than one artifact. Change this file first, then carry it across.

Never append this file, or an output-style copy of it, to a skill's system prompt as a
bolt-on quality lever. A repository trial found that this makes output worse. To make
a skill read like house style, trim its own `SKILL.md` with `dx-trim-doc` instead.

Every rule here is a default, not a ban on judgment. A short word that confuses a
reader who does not know the codebase is worse than a long word that does not.

## Scope

This file does not govern:

- **Product UI copy.** SLP-9 governs the text a product's own users read, and the
  `dx-design-copy` skill carries it.
- **Published technical documents.** `docs/`, `CONTEXT.md`, and READMEs take Google's
  mechanics without this concision bar.
- **Code and code comments.** `CLAUDE.md` already sets the default to no comments.

## Word choice

`CLAUDE.md` names the terms that add nothing. Apply these tests to a word it leaves
out:

- Prefer the short word. Write `use`, not `utilise`; `help`, not `facilitate`.
- Cut a word that dates the sentence: `currently`, `now`, `existing`, `soon`. Give a
  date or a version instead. Keep one only where it contrasts with a named earlier
  state.
- Cut a word that certifies your own claim: `real`, `actually`, `truly`. The noun
  already carries it.
- Cut a figure of speech you are used to seeing in print. An issue does not need a
  "north star". Name the thing it means.
- Define a coined term where it outlives the issue, or use the plain phrase.

## Claims and evidence

- Use no superlatives (`best`, `fastest`, `never`, `always`) and no absolute claims
  (`ensure`, `guarantee`), unless you can point to what verifies them.
- A security or reliability claim says that a feature "helps with" or "is designed
  for" its goal, never that it "prevents" or "guarantees" it. One incident disproves
  the stronger claim.
- Never describe an unreleased capability as though it already exists.
- Never copy third-party text, code, or images word for word. Paraphrase, and link to
  the source.

## Sentence construction (ASD-STE100)

From the Simplified Technical English specification, the parts that Google leaves
out:

- Put one instruction in one sentence. Write a numbered step for each action in a
  sequence, rather than one sentence that joins them with "and".
- Use a verb in its infinitive, imperative, simple past, or past participle form. An
  `-ing` form belongs in a technical name only, such as "a floating point number".
  Never use one to compress a clause: write "the file that fails the check", not "the
  file failing the check".
- State a warning or a constraint before the step it applies to, never after.
- Use one term per concept, spelled and capitalised the same way throughout. Never
  stack more than two nouns as a modifier.
- Hold a paragraph to one idea in six sentences at most, and open it with the most
  important point. A reader who scans an issue does not read every word.

No word cap applies to a sentence here. A mechanical cap fires hardest on the
technical prose that needs the words.

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

Read the draft once as the person who acts on it. Two things survive every
cut: an instruction, and a condition that adds a case, an exception, or a limit
and changes what the reader does. Test a candidate clause by removing it,
inventing a case where the rule is ambiguous, and checking whether your answer
changes. If it does, restore the clause; see `dx-trim-doc`'s edge test for the
full mechanism.

Cut everything else that meets one of these tests:

- It restates a heading, a parent issue, or another section of the same body.
- It gives a rule's rationale, and the rule reads the same without it. Keep the
  rationale only where the rule resolves ambiguity: there, the rationale is the
  rule.
- It hedges without narrowing anything: `generally`, `in most cases`, or
  `it should be noted`.
- It rehearses the reasoning that led to the conclusion. Keep the conclusion and the
  one piece of evidence that supports it. Cut the rest.

Then check whether anything only resolves inside this session. A reference to a
plan, a discussion, or a draft nobody else can see fails that check. So does
first-person narration of what you decided, or an undated hedge with no owner.
`dx-trim-leakage` names the full taxonomy and what survives.

A note that stays accurate only until something else changes must say so. A coupling
between two files breaks the moment someone edits one of them.

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

This procedure ships with the harness plugin, not the product repository. From a
skill directory, it sits three levels up at `../../../procedures/house-style.md`.
