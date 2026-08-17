# Strategy

**Last reviewed:** 2026-08-17 · **Owner:** Nicholas Lim

Where dx-harness is going and why. Written for the team building the harness, and for
TFX teams deciding whether to adopt it. This document carries the argument; what gets
built, in what order, and how we will know it landed is in the
[roadmap](./ROADMAP-DRAFT.md).

## North star

Every year, more people here can ship production-quality software, and the bar goes up
rather than down. dx-harness is how the bar reaches the work a specialist has no time to
sit beside — so that what a specialist knows is available to everyone, all the time.

## How the harness works

Four parts. Every bet below either strengthens one of them or points them at new people.

1. **Encoded standards.** What a specialist held in their head becomes a machine-readable
   control, with tiers and a waiver path, so a rule can be overridden on the record instead
   of quietly ignored. Seventy of them today, all design. The set is meant to widen across
   the other axes of the work, and to be revised as we get better at saying what good
   means — a standard that never changes is one nobody is learning from.
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
| 1. AI in the SDLC | 2026, in flight | **Depth.** Every step of the lifecycle produces reliable work, and reviewers spend their attention on judgement rather than on catching the mechanical. |
| 2. AI for builders | 2026–2027, in flight | **Width.** Each role can carry its own work further before handing it on, with the same standards behind it. |
| 3. AI for teachers (TWLabs) | 2027, not started | **Reach.** Builders outside the product team. |

The line between the first two: bet 1 asks whether each step of the lifecycle produces good
work; bet 2 asks whether anyone can do that step. These are lenses, not buckets. Much of
what gets built serves both, and the bet says why we are doing something rather than who
owns it. The issue taxonomy is the clearest case: deciding what shape a piece of work is
raises the quality of what enters the backlog *and* means a designer is not waiting on an
engineer to file it. Automated checks are another — bet 1 makes them trustworthy, bet 2 is
what that trust lets people do.

Bets 1 and 2 run at the same time and pull against each other; see
[the tension to manage in 2026](#the-tension-to-manage-in-2026). Bet 3 leans on bet 1: how
much of it has landed is what decides whether 2027 is the right time to start.

## Bet 1: AI in the SDLC (2026)

**Thesis.** Most of a product's quality is decided before anyone writes code, in how work
is framed, split and specified — and then defended afterwards by whether the checks hold.
Both halves currently depend on the right person being in the room at the right moment. Put
the harness through the whole lifecycle so that the knowledge is there even when they are
not, and so their attention goes to the parts only a person can judge.

Where this stands, what gets built and in what order: see the
[roadmap](./ROADMAP-DRAFT.md).

## Bet 2: AI for builders (2026)

**Thesis.** No role should be held back by tooling that assumed a different one. A designer
files the story, an engineer takes the design slice, a product manager reviews the
acceptance criteria — each with the same standards behind them, and each supported in the
way their role actually works. The harness is not role-blind, and should not be: a product
manager writing a story and an engineer writing a task want different things from the same
skill, which is why the skills name the roles they serve.

What widens is what each role can carry on their own before handing over. Nobody is being
handed someone else's job, and no role is being designed out — the handovers that exist
because the tooling assumed an engineer are the ones we want to remove.

Where this stands, what gets built and in what order: see the
[roadmap](./ROADMAP-DRAFT.md).

## Bet 3: AI for teachers — TWLabs (2027)

**Working name, open definition.** What follows is a hypothesis and what would make it a
good idea, not a plan.

**Hypothesis.** The machine that lets a designer ship safely can let a teacher assemble
something useful inside Teacher Workspace, because the constraint was never job title. It
was whether the bar could be enforced without a specialist in the room. This is plausible
rather than wishful for one reason: it is the third audience for a stack that already
serves two, and Teacher Workspace is the portfolio's reference build, so much of the
catalog it would need already exists.

**The leap is bigger than it looks.** Engineer to designer was a change of discipline
inside one team. Product team to teacher changes everything else: no shared vocabulary, no
L1 approver standing over the work, and no professional stake in the catalog.

**What would make 2027 the right time.** Four things decide whether starting is a good
idea. None of them is a permission to be granted.

1. **The gates hold.** A designer who hits a bad check can fall back on reading the
   catalog. A teacher cannot, so every gap left in bet 1 costs more once the audience
   widens again.
2. **We can see what a run costs.** Extending to a non-technical audience on anecdote is a
   guess rather than a decision.
3. **A run is cheap enough that a teacher would pay it.** Nobody outside a product team
   spends twenty minutes on a review.
4. **The questions below have written answers**, in a form someone outside the team can
   read and disagree with.

Starting before these hold is not forbidden. It is expensive: it puts the weakest version
of the harness in front of the audience least able to work around it. If we choose to start
anyway, that is the trade being made, and it should be made out loud.

**Open questions, parked deliberately.** Is TWLabs a surface inside Teacher Workspace or a
sandbox beside it. Do teachers build, or do they specify and review while the harness
builds. What is the governance model when there is no design lead to sign a waiver.

## The tension to manage in 2026

Width has already outrun depth in practice. People build with the harness today against a
catalog where some controls promise a deterministic check that was never written, and every
one of those is paid for in reviewer minutes, per run, indefinitely. The plan for 2026 is
depth catching up, not width slowing down. That leaves two pressures worth holding onto.

- **Almost everything lands in the same year, and the load-bearing parts are the invisible
  ones.** Gates that hold, and runs we can actually see, are what 2027 borrows its trust
  from. They are also the least demonstrable work in the plan, and they will lose to
  anything with a screenshot unless someone protects them.
- **For a year, people can try things but not land them.** That is the deliberate
  consequence of putting "ideas can be tried" in 2026 and "reaches production without a
  rebuild" in 2027. The rework this bet exists to remove survives another year, and someone
  who can make a change but not land it will either wait for us or route around us. Worth
  deciding which we are asking for.

And one that carries past 2026: **a teacher will have no fallback.** We can tolerate a
designer working around a missing check, because they can read the catalog themselves. The
same gap costs far more the next time the audience widens.

## If a bet does not land

Bet 1 is the one the others lean on. If it has not landed by the end of 2026, the sensible
answer is to give bet 3 more time rather than a smaller scope: a thinner TWLabs still puts
the weakest version of the harness in front of the audience least able to work around it.
Writing that down now is cheaper than arguing it later under delivery pressure.

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
