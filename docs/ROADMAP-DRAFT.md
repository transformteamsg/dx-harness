# Roadmap

**Last reviewed:** 2026-08-17 · **Owner:** Nicholas Lim

> Provisional filename. Settles once the delivery roadmap lands and we have picked which
> document owns the word "roadmap".

What we are building, in what order, and how we will know each piece landed. Why these
three bets and why in this order is argued in [STRATEGY.md](./STRATEGY.md); this document
does not repeat the argument.

## Horizon

| Bet | Horizon | State |
|---|---|---|
| 1. AI in the SDLC | 2026 | In flight, both halves |
| 2. AI for builders | 2026 | In flight |
| 3. AI for teachers (TWLabs) | 2027 | Not started, gated on bet 1 |

Bets 1 and 2 run at the same time. Bet 3 does not start until bet 1's four entry conditions
hold; those conditions, and who signs them open, are in the strategy.

## Bet 1 — AI in the SDLC

**Where we are.** The ceremonies happen, but their output varies with whoever ran them.
Issue authoring is the exception: it now decides the shape of the work rather than handing
you a template, so what lands in the backlog is consistent. Everything around it —
briefing, epic shaping, grooming, planning — is still carried by experience. On the
enforcement side, engineering rigour is built and in use on our own repositories: lint and
formatting setup, pre-commit and pre-push gates, automated code review, dependency auditing
with a release cooldown. Design rigour is the same idea in another discipline: a control
catalog, deterministic scripts, and an evaluator that grades what the generator produced.

**The gap.** Upstream, work enters already shaped, which means the shaping was done by
whoever happened to know how, and nothing catches it when they got it wrong. Downstream,
the gates leak: a large minority of controls declare a deterministic check with no script
behind them, and some of the scripts that do exist answer wrongly, so the loop passes work
a machine should have stopped. A design run has been reported to cost around 24 minutes of
human attention, paid every run. The harness has no instrumentation, so "is this working"
is currently anecdote — including that number, which is one report rather than a
measurement.

**The ceremonies.** Each of these already happens; the work is making it produce reliable
output instead of depending on who ran it.

- **Briefing.** A draft requirement meets the people who have to build it and comes out
  revised, with the changes recorded rather than remembered.
- **Epic and story shaping.** Interrogate product-level intent the way issue authoring
  already interrogates a story, so what enters the backlog is decidable.
- **Grooming and splitting.** Turn a large issue into genuinely atomic pieces, with
  dependencies and design scope made explicit rather than discovered at implementation.
- **Planning and sizing.** Sequencing and estimates a team can argue with, grounded in what
  the tracker shows rather than in recall.
- **Definition of done.** Enforced at the gate, not remembered in a meeting.

**The gates inside them.** The engineering rigour that makes each ceremony more than a
conversation.

- A check runner that grades a rendered page in a browser, so accessibility and visual
  rules are tested on the thing a person actually sees rather than on source.
- Scanners for the anti-patterns the catalog names but cannot yet detect: the default AI
  aesthetic, component misuse, motion and identity violations.
- Repairs to the checks that currently answer wrongly, and a rule that no control may claim
  a deterministic check without a script behind it.
- Instrumentation: which skills get used, where runs fail, and full run transcripts rather
  than a final message.

**Ordering inside the bet.** The gates come first. They cost the most today, they are what
bet 3's entry gate measures, and until instrumentation exists no cost claim in this document
can be checked by anyone. The ceremonies can proceed in parallel with different people, but
briefing and epic shaping come before grooming and planning: grooming a badly-shaped epic
only moves the problem downstream.

**Done means.** Each step of the lifecycle hands the next one something it can use without
rework. No control claims a check it does not have. A review costs minutes, not tens of
minutes. And we can see from data which parts of this earn their keep.

## Bet 2 — AI for builders

**Where we are.** Issue authoring has been rebuilt so the shape of the work is decided for
you: story, task, chore or bug. It encodes a real taxonomy rather than a template. A task's
parent is a story or a chore. Chore versus task turns on whether something bigger already
tracks the work, never on the technology. Acceptance criteria are Given-When-Then plus an
optional invariants checklist. Downstream, an issue can be carried to a pull request without
a person translating it first. On the design side there is a full loop with focused
single-dimension passes, a critique path, a per-product design language file, and a git
companion that exists because designers now commit code.

**The gap.** The handover is still there. A designer can produce a convincing prototype and
a product manager can specify precisely, and both then hand the work to an engineer who
builds it again. Everything so far has shortened that handover; none of it has removed it.

**What we build.**

- **Idea to a running thing.** A designer or a product manager gets a real, working version
  of a change inside the actual product, not a mock that someone else has to rebuild.
- **Prototype to production without a rebuild.** What you made is what ships, carrying the
  same gates, instead of being handed over and redone.
- **Orientation for people who do not read code fluently.** Where does this surface live,
  what does it touch, and what breaks if I change it.
- **Self-review for low-risk work.** The harness reviews the change, so merging does not
  depend on finding an engineer with time to approve it.
- **A running product without an engineer's help.** Environment and data in one step,
  because "I could not get it running" is where most non-engineers stop.
- **Every remaining engineering prerequisite, removed as it surfaces.** Version control was
  the first one worth solving. It will not be the last.

**Ordering inside the bet.** Getting the product running, and getting a change running,
come first: everything else assumes someone got past that point, and it is where people
actually stop. Self-review comes last of the six, because it consumes bet 1's gates and
cannot be more trustworthy than they are.

**Done means.** Someone whose title is not engineer ships to production, through the same
gates as everyone else, without a specialist reviewing on their behalf.

## Bet 3 — AI for teachers (TWLabs)

Working name, open definition, and nothing starts before the gate opens. The hypothesis,
the four entry conditions and the three parked questions are in the strategy.

**What 2026 owes it.** Three of the four entry conditions are bet 1 deliverables — check
completeness, instrumentation, and a review cost low enough that a teacher would pay it. The
fourth is not a build at all: written answers to what a teacher builds, what the blast
radius is, and who approves it, in a form someone outside the team can disagree with.

**What we would build.** Illustrative only, and the shape depends on answers we do not have
yet.

- A teacher-facing vocabulary over the existing catalog, so the bar is enforced without
  anyone having to read a control.
- An approval model that works when nobody in the room is paid to own design quality.
- A blast-radius boundary: what a teacher-built thing is allowed to touch, and what it
  never is.

## Dependencies worth watching

- **Bet 2's self-review needs bet 1's gates.** Shipping it early gives non-engineers a
  review they can trust less than the engineer it replaced.
- **Bet 3's entry needs bet 1 finished, not merely progressing.** Three of its four
  conditions are bet 1 deliverables.
- **Every cost claim here needs instrumentation.** Until it exists, the numbers in this
  document are reports, and should be read that way.

## What this document is not

- **Not the week-to-week board.** Near-horizon tracking lives in the delivery roadmap.
- **No dates finer than a year, and no issue links.** Both rot faster than this gets edited.
  The reasoning is in the strategy.

## Keeping this current

Review when a bet's "done means" changes, when an ordering constraint turns out to be wrong,
or when something moves between bets. If an item here has been "what we build" for two
reviews running and nothing has started, say so in the entry rather than leaving it to imply
progress.
