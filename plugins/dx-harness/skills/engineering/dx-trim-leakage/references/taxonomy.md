# Leakage taxonomy

Apply the one test from `SKILL.md` first. These classes name the recurring shapes a
failing passage takes, and what to keep when you fix one.

## The eight classes

| Class | What it is | Example phrasing | Fix |
| --- | --- | --- | --- |
| 1. Dead session or plan citation | A reference that resolves only inside this conversation, a chat thread, or an unmerged draft | "the plan said", "per our discussion", "as agreed earlier" | If the fact has a durable, repository-native owner, such as a GitHub issue or PR (`#142`), a decision record under `docs/decisions/`, or a design ticket a design skill already tracks, cite that owner by number or path. Otherwise restate the fact and drop the citation. |
| 2. PR- or session-vantage narration | Prose that narrates the act of changing something instead of stating what it does now | "this PR adds", "we just changed", "in this branch" | State the shipped mechanism. A genuinely open follow-up becomes a `TODO` or a linked issue, not a promise sitting inside prose that goes stale the day it merges. |
| 3. Change narration and staleness stamps | Prose that contrasts the present with an unnamed past state | "used to", "no longer", "the old version", "now" (contrasting an earlier state) | State the present behaviour. A fixed regression becomes a present-tense counterfactual ("without the guard, a duplicate row is written"), not a history lesson. Does not apply inside a `CHANGELOG` entry or a decision record's Chosen approach, Rejected options, or Tradeoffs sections: narrating the change is those genres' whole job. `house-style-mechanics.md`'s cut list already flags a few of these words at the sentence level (`currently`, `now`, `existing`); this class catches the sentences that avoid every listed word and still narrate history, such as "the export button used to reload the page." |
| 4. Review or discussion choreography | Attribution to a specific round of review or a named reviewer's opinion | "rejected in review", "the reviewer asked for", "v2 of this comment" | Keep the surviving decision as plain fact; drop who raised it and when. A decision record's own Rejected options section is the sanctioned home for this: it exists specifically to keep the alternatives and why they lost, so do not strip it there. |
| 5. Self-justifying comment | A comment or a docs line arguing its own correctness to whoever is about to approve it, rather than stating a fact for whoever reads it next | "this is safe, trust me", "this works because it just does" | State the invariant that makes it true, for the next maintainer, not the case for the current reviewer. Where the invariant is already obvious from the code, delete the comment; `CLAUDE.md` already defaults to no comments for exactly this reason. |
| 6. Narrated derivation | Control-flow narration, a test walkthrough, or a restated obvious branch | "first this runs, then that happens" | Delete it. Keep only a non-obvious invariant or contract the code does not already show. |
| 7. First-person session narration | An authoring session's own voice bleeding into published prose | "I decided to", "the assistant added", "I chose this approach" | Restate in repository voice: what the code does, not what the agent that wrote it was thinking. `house-style.md` already reserves `we`/`our` for the author with a named antecedent; this class extends the same discipline to first-person singular and to narrating an agent's own process. |
| 8. Hedge or undated planning residue | A deferral with no owner and no bound | "should be fine for now", "probably enough", "good enough for now" | Promote it to a `TODO`, a linked issue, or the actual known bound; delete the hedge. `house-style.md`'s own "Before you post it" step already bans this for a freshly drafted issue, PR, or decision record; this class extends the same check to comments, READMEs, and `SKILL.md` files. |

## What survives

Unaided pattern-matching fails in both directions: it deletes durable references and
keeps dead ones. Apply these keep rules as written.

- **Issue and PR references** (`#142`, `TODO(name):`) resolve at `HEAD` through
  `gh issue view`/`gh pr view`, per `docs/agents/issue-tracker.md`. Keep them
  anywhere, including a README.
- **Decision-record citations by path** (`docs/decisions/<name>.md`) name a durable,
  checkable owner.
- **A decision record's Chosen approach, Rejected options, and Tradeoffs sections.**
  The template exists specifically to hold this history. Classes 3 and 4 do not
  apply there.
- **`CHANGELOG` entries.** The whole genre states what changed release over
  release. Class 3 does not apply to `plugins/dx-harness/CHANGELOG.md` or any other
  changelog.
- **Dated research records** under `docs/research/`. A run recorded with its date
  and its numbers is provenance, not leakage; the date is load-bearing.
- **Suppression or exception justifications.** A lint-disable comment or an
  empty-catch explanation with a real reason is required prose, not leakage. Fix a
  false reason; never delete a true one.
- **Counterfactual-present regression pins**, such as "without the check, a
  duplicate row is written." This resolves at `HEAD` and needs no history to
  verify.
- **Measured, provenanced constants**, such as "(measured: 512 nests, about
  0.15 s)." The word that names how the number was produced is load-bearing.
