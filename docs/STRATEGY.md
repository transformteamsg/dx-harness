# Strategy

**Last reviewed:** 2026-08-17 · **Owner:** Nicholas Lim

Where dx-harness is going and why. Written for the team building the harness, and for
TFX teams deciding whether to adopt it.

## North star

Every year, more people here can ship production-quality software, and the bar goes up
rather than down. dx-harness is how the bar travels to people who never had a specialist
standing over their shoulder.

## How the harness works

Four parts. Every bet below either strengthens one of them or points them at new people.

1. **Encoded standards.** What a specialist held in their head becomes a machine-readable
   control. Seventy of them today in `standards/catalog.yaml`, with tiers and a waiver
   path, so a rule can be overridden on the record instead of quietly ignored.
2. **Deterministic checks.** Anything a script can decide, a script decides. Human
   judgment is spent only where judgment is genuinely needed.
3. **A gated loop.** Intent, diverge, plan (human gate), implement, verify — with a
   generator/evaluator split, so the agent that produced the work is not the one that
   grades it.
4. **Evidence.** Evals before a skill change ships, run records after. A skill is a
   prompt that runs many times, so a change to it is a behaviour change and needs proof.

**The claim this strategy rests on:** that machine is audience-neutral. Pointing it at a
new group of people should cost a catalog and a vocabulary, not a rebuild. Bet 3 is the
test. If it costs as much as bet 2 did, the claim was wrong and this document should say
so.

## The three bets

| Bet | Year | What it moves |
|---|---|---|
| 1. AI in the SDLC | 2026, in flight | **Depth.** Every step of the lifecycle produces reliable work, and the gates inside it hold without a person enforcing them. |
| 2. AI for builders | 2026, in flight | **Width.** Anyone on a product team can do those steps, whatever their discipline. |
| 3. AI for teachers (TWLabs) | 2027, not started | **Reach.** Builders outside the product team. |

The line between the first two: bet 1 asks whether each step of the lifecycle produces good
work; bet 2 asks whether anyone can do that step. Some work serves both. The issue taxonomy
is the clearest case, since deciding what shape a piece of work is raises the quality of
what enters the backlog *and* means a designer can file it without asking an engineer
first.

Bets 1 and 2 run at the same time and pull against each other; see
[the tension to manage in 2026](#the-tension-to-manage-in-2026). Bet 3 is hard-gated on
bet 1.

## Bet 1: AI in the SDLC (2026)

**Thesis.** Most of a product's quality is decided before anyone writes code, in how work
is framed, split and specified — and then defended afterwards by whether the gates hold.
Both halves currently depend on the right person being in the room. Put the harness
through the whole lifecycle so they do not.

**Where we are.** The ceremonies happen, but their output varies with whoever ran them.
Issue authoring is the exception: it now decides the shape of the work rather than handing
you a template, so what lands in the backlog is consistent. Everything around it —
briefing, epic shaping, grooming, planning — is still carried by experience. On the
enforcement side, engineering rigour is real and in daily use: lint and formatting setup,
pre-commit and pre-push gates, automated code review, dependency auditing with a release
cooldown. Design rigour is the same idea in another discipline: a control catalog,
deterministic scripts, and an evaluator that grades what the generator produced.

**Where it breaks.** Upstream, work enters already shaped, which means the shaping was done
by whoever happened to know how, and nothing catches it when they got it wrong. Downstream,
the gates leak: some controls declare a deterministic check with no script behind them, so
the loop passes work a machine should have stopped. Eight checks are unwritten and two of
the existing ones answer wrongly. The cost is measured, not guessed: roughly 24 minutes of
human review per design run, paid every run, because the check that should have answered it
was never written. And the harness has no instrumentation, so "is this working" is
currently anecdote.

**What we build — the ceremonies.** Examples, not a backlog. Each of these already happens;
the work is making it produce reliable output instead of depending on who ran it.

- **Briefing.** A draft requirement meets the people who have to build it and comes out
  revised, with the changes recorded rather than remembered.
- **Epic and story shaping.** Interrogate product-level intent the way issue authoring
  already interrogates a story, so what enters the backlog is decidable.
- **Grooming and splitting.** Turn a large issue into genuinely atomic pieces, with
  dependencies and design scope made explicit rather than discovered at implementation.
- **Planning and sizing.** Sequencing and estimates a team can argue with, grounded in
  what the tracker shows rather than in recall.
- **Definition of done.** Enforced at the gate, not remembered in a meeting.

**What we build — the gates inside them.** The engineering rigour that makes each ceremony
more than a conversation:

- A check runner that grades a rendered page in a browser, so accessibility and visual
  rules are tested on the thing a person actually sees rather than on source.
- Scanners for the anti-patterns the catalog names but cannot yet detect: the default AI
  aesthetic, component misuse, motion and identity violations.
- Repairs to the checks that currently answer wrongly, and a rule that no control may
  claim a deterministic check without a script behind it.
- Instrumentation: which skills get used, where runs fail, and full run transcripts rather
  than a final message.

**Landed looks like.** Each step of the lifecycle hands the next one something it can use
without rework. No control claims a check it does not have. A review costs minutes, not
tens of minutes. And we can see from data which parts of this earn their keep.

## Bet 2: AI for builders (2026)

**Thesis.** Same skills, same catalog, same gate, whatever your discipline. A designer
files the story, an engineer takes the design slice, a product manager reviews the
acceptance criteria, a coding agent implements. The harness stops caring about job titles.

This is already the plugin's naming thesis: `dx` is deliberately open-ended, so it reads as
Developer Experience to an engineer and Designer Experience to a designer. The task skill
follows it, covering a slice that is engineering *or* design without making you choose.

**Where we are.** Issue authoring has been rebuilt so that the shape of the work is
decided for you: story, task, chore or bug. It encodes a real taxonomy rather than a
template. A task's parent is a story or a chore. Chore versus task turns on whether
something bigger already tracks the work, never on the technology. Acceptance criteria are
Given-When-Then plus an optional invariants checklist. Downstream, an issue can be carried
to a pull request without a person translating it first. On the design side there is a
full loop with focused single-dimension passes, a critique path, a per-product design
language file, and a git companion that exists because designers now commit code.

**Where it breaks.** The handover is still there. A designer can produce a convincing
prototype and a product manager can specify precisely, and both then hand the work to an
engineer who builds it again. Everything so far has shortened that handover; none of it has
removed it. Until the person who had the idea can carry it to production themselves, they
are contributing to a build rather than doing one.

**What we build.** Examples, not a backlog:

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

**Landed looks like.** Someone whose title is not engineer ships to production, through the
same gates as everyone else, without a specialist reviewing on their behalf.

**Adopting it.** Everyone gets the same harness, so there is no per-discipline entry point
to describe here. Type `/dx` and the whole set surfaces; the plugin README lists what each
skill does.

## Bet 3: AI for teachers — TWLabs (2027)

**Working name, open definition.** What follows is a hypothesis and its entry conditions,
not a plan.

**Hypothesis.** The machine that lets a designer ship safely can let a teacher assemble
something useful inside Teacher Workspace, because the constraint was never job title. It
was whether the bar could be enforced without a specialist in the room. This is plausible
rather than wishful for one reason: it is the third audience for a stack that already
serves two, and Teacher Workspace is the portfolio's reference build, so much of the
catalog it would need already exists.

**The leap is bigger than it looks.** Engineer to designer was a change of discipline
inside one team. Product team to teacher changes everything else: no shared vocabulary, no
L1 approver standing over the work, and no professional stake in the catalog.

**Entry gate — all four true before this starts:**

1. **Bet 1 has landed.** A designer who hits a bad check can fall back on reading the
   catalog. A teacher cannot.
2. **The harness is instrumented.** Extending to a non-technical audience on anecdote is a
   guess, not a decision.
3. **Cost per run is low.** A teacher will not spend 24 minutes.
4. **Someone has answered:** what does a teacher build, what is the blast radius when it
   is wrong, and who approves it.

**What we would build.** Illustrative only, and the shape depends on answers we do not
have yet:

- A teacher-facing vocabulary over the existing catalog, so the bar is enforced without
  anyone having to read a control.
- An approval model that works when nobody in the room is paid to own design quality.
- A blast-radius boundary: what a teacher-built thing is allowed to touch, and what it
  never is.

**Open questions, parked deliberately.** Is TWLabs a surface inside Teacher Workspace or a
sandbox beside it. Do teachers build, or do they specify and review while the harness
builds. What is the governance model when there is no design lead to sign a waiver.

## The tension to manage in 2026

Bets 1 and 2 are not sequential, and bet 2 is currently ahead. Designers run the design
loop today against a catalog where some controls promise a deterministic check that was
never written. The 24 minutes above is the invoice: every missing check is paid for in
reviewer minutes, per run, indefinitely.

So the risk this year is width outrunning depth. Two consequences worth holding onto:

- **Bet 1 is not hygiene.** It is what makes bet 2 cheap. Deferring it raises the running
  cost of every bet 2 win.
- **The gate is soft in 2026 and hard at the 2027 boundary.** We can tolerate a designer
  working around a missing check. We cannot hand that to a teacher.

## What we are not doing

- **No dates finer than a year.** Dated plans in this repo have gone stale within a day of
  being written. The delivery roadmap carries week to week; this carries direction.
- **Not building a general-purpose agent platform.** The harness is opinionated on
  purpose: it encodes one portfolio's standards, and that is where its value comes from.
- **Not committing to the open architecture questions.** Moving toward Agent Plugins, and
  adopting STE100 as a ubiquitous spec language, stay open questions until something
  forces the decision.

## Keeping this current

Review at each bet boundary, and whenever a bet's "landed looks like" changes. Resist
adding issue links: they close faster than this document gets edited, and the delivery
roadmap already carries them.
