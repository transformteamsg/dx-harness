---
name: dx-trim-leakage
description: 'Use when auditing or fixing prose that reads like a leaked reasoning transcript or an authoring session''s own narration rather than a fact stated from the repository''s current state: dead references to a plan, a discussion, or an unmerged draft ("the plan said", "per our discussion"); PR- or session-vantage phrasing ("this PR adds", "in this branch"); change narration ("used to", "no longer", "the old version"); reviewer-addressed justification ("this is safe because, trust me"); narrated control flow in a comment; first-person session narration ("I decided to", "the assistant added"); or undated hedges and planning residue ("should be fine for now"). Applies to `docs/`, `CONTEXT.md`, decision records, READMEs, GitHub issue bodies, PR descriptions, code review comments, and `SKILL.md` files.'
---

# Trim leaked session narration

You are removing prose whose vantage is this authoring session, a chat thread, a PR
discussion, or an unmerged draft, rather than the repository as it stands at `HEAD`.
The fix is never deletion alone when a passage carries a real fact: restate the fact
from the repository's own vantage, then delete the transcript wrapper around it. A
passage that carries no fact at all, such as a dead citation or narrated control
flow, is deleted outright.

This complements two sibling checks rather than duplicating them. `dx-trim-doc`
protects behaviour during a length trim; this skill protects resolvability, whether a
passage that has nothing to do with length still fails a reader with no session
access. `house-style.md`'s own "Before you post it" step already bans hedges and
hidden-plan phrasing inside a freshly drafted issue, PR, or decision record; this
skill extends the same discipline to a wider set of surfaces (comments, READMEs,
`SKILL.md` files) and to a wider set of failure classes.

## The one test

For every candidate passage, ask: could a reader at `HEAD`, with no access to this
session, the PR thread that produced it, or an unmerged draft, resolve every
reference and verify every claim? If no, restate the surviving fact from the
repository's own vantage and delete the rest. If yes, it is not leakage. Resolving
is only the first bar: a resolvable change story can still be change
narration that belongs in a different genre; check the taxonomy's exemptions before
you decide a resolvable passage is safe where it sits.

## Taxonomy

Read [references/taxonomy.md](references/taxonomy.md) for the eight classes, worked
examples, and the keep-list of what survives: issue and PR references,
decision-record citations, `CHANGELOG` entries, dated research records, suppression
justifications, and provenanced measurements. Classify every candidate passage
against it before touching anything.

## Workflow

1. **Scope.** Take an explicit target: a file, a PR, or a directory. Do not sweep
   the whole repository unless asked to.
2. **Search, then read.** Grep the taxonomy's own phrases first (`used to`,
   `no longer`, `the plan said`, `per our discussion`, `rejected in review`,
   `I decided`, `the assistant`, `for now`, `should be enough`, `as discussed`), then
   read the densest prose in scope, such as module-level comments, README sections,
   or decision records, without a pattern in hand. A grep alone misses a leak that
   avoids every listed phrase and still narrates from the wrong vantage.
3. **Classify.** For every hit, apply the one test and the taxonomy. A passage
   inside a `CHANGELOG` entry, a dated research record, or a decision record's
   Chosen approach, Rejected options, or Tradeoffs sections is exempt from the
   change-narration and review-choreography classes: narrating the change is what
   those genres are for.
4. **Fix owner-first.** Restate the surviving fact in place. Where a real durable
   owner exists, such as a GitHub issue or PR number, a decision record's path, or a
   design ticket a design skill already tracks, cite that owner instead of the dead
   reference. Where none exists, state the fact and drop the citation.
5. **Verify.** Re-run the search expecting only sanctioned keeps. Confirm every
   remaining citation resolves: an issue or PR number opens with
   `gh issue view`/`gh pr view`, a decision-record path exists on disk.
6. **Report.** Name the surface checked, show two or three representative
   before/after fixes, and flag any citation you could not resolve to a real owner
   rather than inventing one.

## Rules

- Delete the transcript wrapper, never the fact inside it. A passage that fails the
  one test still gets read for a surviving proposition before anything is cut.
- A genre exemption covers only the sections it names. A decision record's Rejected
  options section is exempt; the rest of the same record is not.
- Grep is a starting point, not the definition. The densest, unpatterned prose in
  scope still needs a direct read.
- An unresolved citation is reported, never guessed at. Naming the wrong issue
  number is worse than leaving the dead one for a person to fix.
- This skill does not chase length. A verbose but fully resolvable passage is out of
  scope; send it to `dx-trim-doc` instead.
