# Strategy

**Last reviewed:** 2026-08-17 · **Owner:** Nicholas Lim

Where dx-harness is going and why. Written for the team building the harness, and for
TFX teams deciding whether to adopt it. This document carries the argument; what gets
built, in what order, and how we will know it landed is in the
[roadmap](./ROADMAP-DRAFT.md).

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
4. **Evidence.** A skill is a prompt that runs many times, so a change to it is a
   behaviour change and needs proof. Evals cover that where we have written them. The other
   half — a record of what real runs actually did — is bet 1 work and does not exist yet.

**The claim this strategy rests on:** the machine is audience-neutral. Pointing it at a new
group of people should cost a catalog, a vocabulary, and an approval model — not a rebuild
of the loop. The third is the one we have never had to build, because every audience so far
arrived with someone already paid to own quality. Bet 3 is the test. If it costs as much as
bet 2 did, the claim was wrong and this document should say so.

## The three bets

| Bet | Year | What it moves |
|---|---|---|
| 1. AI in the SDLC | 2026, in flight | **Depth.** Every step of the lifecycle produces reliable work, and the gates inside it hold without a person enforcing them. |
| 2. AI for builders | 2026, in flight | **Width.** Anyone on a product team can do those steps, whatever their discipline. |
| 3. AI for teachers (TWLabs) | 2027, not started | **Reach.** Builders outside the product team. |

The line between the first two: bet 1 asks whether each step of the lifecycle produces good
work; bet 2 asks whether anyone can do that step. These are lenses, not buckets. Much of
what gets built serves both, and the bet says why we are doing something rather than who
owns it. The issue taxonomy is the clearest case: deciding what shape a piece of work is
raises the quality of what enters the backlog *and* means a designer can file it without
asking an engineer first. Automated review is another — bet 1 builds the gate, bet 2 is
what the gate makes possible.

Bets 1 and 2 run at the same time and pull against each other; see
[the tension to manage in 2026](#the-tension-to-manage-in-2026). Bet 3 is hard-gated on
bet 1.

## Bet 1: AI in the SDLC (2026)

**Thesis.** Most of a product's quality is decided before anyone writes code, in how work
is framed, split and specified — and then defended afterwards by whether the gates hold.
Both halves currently depend on the right person being in the room. Put the harness
through the whole lifecycle so they do not.

Where this stands, what gets built and in what order: see the
[roadmap](./ROADMAP-DRAFT.md).

## Bet 2: AI for builders (2026)

**Thesis.** Same skills, same catalog, same gate, whatever your discipline. A designer
files the story, an engineer takes the design slice, a product manager reviews the
acceptance criteria, a coding agent implements. The harness stops caring about job titles.

This is already the plugin's naming thesis: `dx` is deliberately open-ended, so it reads as
Developer Experience to an engineer and Designer Experience to a designer. The task skill
follows it, covering a slice that is engineering *or* design without making you choose.

Where this stands, what gets built and in what order: see the
[roadmap](./ROADMAP-DRAFT.md).

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

**Entry gate — all four true before this starts, and signed open by this document's owner:**

1. **Every control that claims a deterministic check has one**, and the set has been run
   against a deliberately bad surface without a person correcting the result. A designer
   who hits a bad check can fall back on reading the catalog; a teacher cannot.
2. **The harness is instrumented**, with enough recorded runs to state a median cost rather
   than repeat a single report. Extending to a non-technical audience on anecdote is a
   guess, not a decision.
3. **A design run costs under five minutes of human attention**, taken from that
   instrumentation rather than estimated.
4. **The three open questions below have written answers** that someone outside the team
   can read and disagree with.

Each condition is checkable by a person who did not build the thing, which is the point. A
gate whose conditions are prose gets waived under delivery pressure and nobody notices.

**Open questions, parked deliberately.** Is TWLabs a surface inside Teacher Workspace or a
sandbox beside it. Do teachers build, or do they specify and review while the harness
builds. What is the governance model when there is no design lead to sign a waiver.

## The tension to manage in 2026

Bets 1 and 2 are not sequential, and bet 2 is currently ahead. Designers run the design
loop today against a catalog where some controls promise a deterministic check that was
never written. Every one of those is paid for in reviewer minutes, per run, indefinitely.

So the risk this year is width outrunning depth. Two consequences worth holding onto:

- **Bet 1 is not hygiene.** It is what makes bet 2 cheap. Deferring it raises the running
  cost of every bet 2 win.
- **The gate is soft in 2026 and hard at the 2027 boundary.** We can tolerate a designer
  working around a missing check. We cannot hand that to a teacher.

## If a bet does not land

Bet 1 is the one with a dependent. If it has not landed by the end of 2026, bet 3 slips
rather than shrinks. Starting TWLabs on leaky gates would put the weakest version of the
harness in front of the audience least able to work around it. Slipping is the designed
response, and writing it down now is what stops it being renegotiated later under delivery
pressure.

Bet 2 failing looks different. Nothing depends on it, so it degrades quietly rather than
blocking anything: the harness stays useful to the people who already know how to use it,
and the widening simply does not happen. That is the smaller failure and the easier one to
miss, which is why it is worth naming.

## What we are not doing

- **Not building a general-purpose agent platform.** The harness is opinionated on
  purpose: it encodes one portfolio's standards, and that is where its value comes from.
- **Not costing the bets here.** Resourcing and spend get decided per quarter against the
  delivery roadmap, not in a document that changes a few times a year. The absence is
  deliberate, not an oversight.

## Keeping this current

Review at each bet boundary, and whenever a bet's thesis stops being the reason we are
doing the work. Resist adding issue links: they close faster than this document gets
edited, and the delivery roadmap already carries them.
