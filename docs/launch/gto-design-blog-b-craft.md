# The craft gets through

> Direction B of two. Core theme: for the first time, designers control the
> user-facing front end, so the craft reaches the user without dying in a
> hand-off, a backlog, or a prompt. Draft for the GTO design practice blog
> (contact: Mimi). Essay form: continuous prose, no headings, lists, or call to
> action. Wondo's voice. Visual placements in the editor notes.

---

For most of my career, the craft didn't make it to the user.

I don't mean the work was bad. I mean the part of design I care most about, the
hundreds of small decisions that make a screen feel considered, mostly died
somewhere between the mockup and the release. Sometimes it died in the
hand-off: a spec is a lossy format, and spacing that was exactly right in the
file came out approximately right in the product. More often it died in the
backlog. A fix to the interface competes with features, the feature wins, the
fix waits, and after enough waiting you stop filing them. Every designer I know
keeps a private list of things that shipped wrong and stayed wrong, and has
learned not to look at it.

I had accepted this as the cost of working in a team. Then, over the past year,
it changed, and the change matters more to me than anything else that has
happened to the work.

Designers on my team now build the interfaces they design, in code, in the
actual product. We do it with AI coding agents (programs you talk to in ordinary
language, and they write the code), and with a harness we built so the agent
starts from our written standards and our product's design language, and a
separate reviewer grades the finished screens against them. I could write a
whole piece about the harness, and probably will. What I want to write about
here is what all of it did to the craft. It let the craft through.

When the person who noticed the spacing was wrong is the same person who can
fix it, and fixing it takes a minute rather than a ticket, the spacing gets
fixed. Not usually. Every time. That sounds like a small thing, and it isn't. It
means the standard of what ships is set by the people who care most about it,
instead of by whatever survived negotiation. It means the recurring meeting
about whether interface quality is worth it this sprint doesn't happen, because
quality stopped being a line item. It's how the work gets done now, or the work
doesn't get done.

I should say that the first version of this wasn't much better than the old
way. Designing with an agent replaced one lossy format with another. Instead of
writing a spec for an engineer, you wrote a prompt for a machine and hoped it
understood "a little more room to breathe" the way you meant it. It often
didn't, and arguing with a machine about spacing is more tiring than arguing
with a colleague, because the machine agrees with you and then does the wrong
thing. Craft that has to pass through language loses something on the way,
whoever is reading.

The harness fixed part of that. Because the agent reads our standards and our
product's file before it starts, it begins from our taste rather than the
internet's, and the reviewer catches what slips. But the fix I care about more
is the other tool we're building: a visual editor over the live product, where
you select the element and move it, the way you would in a design tool, while
git (the versioning system engineers use) keeps a save point behind you. No
prompt. Nothing translating. Your intention goes from your hands to the pixel.
That is the first time in my working life it has been true of production
software, and I keep going back to check that it still is.

Two things I want to be careful about. The first is that control isn't the same
as good. A designer with their hands on production and no standard to hold them
is how you get a product that drifts a different way every week. The harness is
the reason this works: the standards and the review hold the floor, so control
means the craft gets through, not that anything goes. The second is a claim I'm
not making. A story is going around that designers who build with AI are better
or more valuable than those who don't, and I don't believe it. Building doesn't
make you a better designer. But a designer whose decisions reach the user is
doing the whole job, and a designer whose decisions die in a backlog is doing
part of it, through no fault of their own. For the first time, which of those
you are is a choice, and not a fact about where you sit in the organisation.

None of this pushed the engineers out, which surprised me. It moved the line
between us. They stopped receiving tickets about spacing and started building
the thing that makes spacing hold: the checks, the validation, the way the
standards travel with the code. I had expected a turf argument and instead got
better partners, because the argument we'd been having for years was never
between designers and engineers. It was between craft and the backlog,
and we were both losing it.

So this is what changed. Not that designers learned to code, although some did.
The craft stopped needing permission to reach the person it was for. I've spent
a career making decisions that mostly didn't survive the trip. Now they do, and
I find I'm checking them more carefully, not less, because they'll arrive.

The harness is open source, if you want to look at it:
[github.com/transformteamsg/dx-harness](https://github.com/transformteamsg/dx-harness).

---

## Editor notes (not for publication)

- Direction B: craft, and finally having control of the user-facing front end.
  Written 2026-09-03. The "story going around" that designers who build with AI
  are more valuable is a paraphrase of a point in Hang Xu's LinkedIn post that
  prompted this round; the essay disagrees with the ranking while agreeing with
  the worry. Attribute by name if the author wants.
- "Every designer I know keeps a private list of things that shipped wrong" is
  the author's claim about the profession; keep only if it's true of the
  author's own experience. A real item from that list would make the opening
  land harder than the generalisation.
- "It moved the line between us" describes the engineers' role shifting from
  implementing UI tickets to building the checks. Confirm the engineers on the
  team recognise this account before it goes public; add names only with OK.
- The visual editor is described without a name or link because its repo is
  not public. This direction leans on it more than A does, so the naming call
  matters more here.
- Deliberate hedges: "I keep going back to check that it still is"; "I don't
  have… " is absent here by design, since the claim is about control, not
  measured outcomes. If the team has a real before/after on UI fixes shipped vs
  backlogged, it belongs after "Every time".
- Teacher Workspace is not named in this direction. Add it if Mimi is
  comfortable and the author wants the specificity.
- Visual placements: (1) after "learned not to look at it": a backlog or ticket
  board with UI fixes ageing, if one can be shown honestly. (2) after "It let
  the craft through": before/after, same brief with and without the harness.
  (3) after "check that it still is": short recording of selecting an element in
  the live product and moving it, no prompt. (4) after "we were both losing
  it": the builders illustration.
- Word count: ~1,150 for the body.
- Standing items: counts verified 2026-08-28 (72 standards, 4 non-negotiable),
  re-verify before publication; coding agent named generically, Mimi to advise
  on vendor naming.
