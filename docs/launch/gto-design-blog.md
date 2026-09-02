# What the agent didn't know

> Draft for the GTO design practice blog (contact: Mimi, design practice comms).
> Publish mid-October. Audience: GovTech designers first, then PMs, engineers,
> and the public. Written in Wondo's voice as an essay: continuous prose, no
> section headings, no lists, no call to action. Length relaxed from the
> 1,000-word template by the author (2026-09-02). Visual placements are in the
> editor notes at the end, so the body reads clean.

---

I kept explaining the same things to the agent.

A few of us on the design team had started designing in code, using one of the
AI coding agents: a program you talk to in ordinary language, and it writes the
code. We did it out of curiosity, mostly. When something new appears that might
change how the work gets done, we tend to try it and see. So we opened the
codebase of the product we work on (the folder of code that is the product, the
same one the engineers work in), described a screen, and watched the agent build
it. The agent was fast, and it was often wrong in ways I could see immediately
but couldn't easily put into words.

The reason it was wrong wasn't mysterious. We'd spent about a year working out
what good looked like for Teacher Workspace, the product we design for teachers.
Not only the brand, but hundreds of smaller decisions: how much space things
get, how we talk to a teacher who is already tired, why we don't use the
gradient everyone else uses. The agent knew none of this. So every session
started with me explaining it again, our colours, our tone, keep it calm, no
gradients, and every session ended with the agent forgetting all of it.

At first that was tedious. After a while it was strange, and the strangeness was
more interesting than the tedium. The agent could make the screen. What it
couldn't do was the part we'd spent a year on, which meant that part was the
design. I would have said so before if you'd asked me, but I'd never seen it
demonstrated so literally: here is a thing that produces interfaces on demand
and still can't design, and the difference is everything it doesn't know.

So the first version of what became the harness wasn't a tool for anyone. It
was us writing down what we knew, in files the agent could read, so we could
stop repeating ourselves. One set of files for what's true of good interfaces in
general: contrast, spacing, what an error message should say. One small file for
what's true of ours. We put them in the product's repo (short for repository,
the shared folder where the code lives and everyone building the product works
from), because that is where the agent looks.

It worked well enough that other designers on the team asked for it, and that
changed the problem. A thing you made for yourself can be as rough as you like.
A thing other people will use has to be designed, and the hardest people to
design for are the ones who didn't make it and don't want to learn it. That is
when it became the harness: a plugin (something you install once) for the
coding agent. You describe what you want. It asks the questions a senior
designer would ask, then does the work with the standards and your product's
file in front of it. When it finishes, a separate reviewer looks at the finished
screens, the actual pixels rather than the code, and grades them against the
same two files. The agent that built a screen doesn't get to mark it. You don't
have to remember any commands. We tested that last claim on one of the least
technical designers on the team, and it held.

Writing the standards down turned up a problem I should have expected. Most
rules for agents are deterministic: a rule goes in and one right answer comes
out. That is the right shape for checking code style and the wrong shape for
design, because design never had exact answers. Ask a designer where a button
should go and you'll hear "it depends". People tease us for that, but it is the
true answer, and any tool that pretends otherwise ends up producing the same
safe screen every time.

So the standards had to run on a spectrum. Contrast is arithmetic; a script can
measure it and nothing is left to discuss. Whether a page feels calm is a
judgment, and the best a rule can do is say what to look at, not what to
conclude. We have 72 of these rules now. Four never bend. The rest can, if you
write down why. And before the harness builds anything it offers two or three
directions instead of one, because choosing between directions is exactly what
a designer is for. You still have to look at the result and decide whether it
is right. The tool's job is to make that possible, not to do it for you. Your
taste, the thing you built by looking at thousands of screens, is what all of
this depends on.

Not everything should go through language, though. The harness gets a screen
from a brief to something good, most of the way there, maybe 70% of it, though
I don't know how you would measure that. Some of what's left shouldn't be a
prompt at all. You want to put your hands on it: move the spacing a little,
feel the hover state. So the other thing we're building is a visual editor over
the live product, where you select an element and change it directly, the way
you would in a design tool, while git (the system engineers use to keep every
version of the code) keeps a copy and a save point for each change. The review
then checks that work the same way it checks everything else.

I couldn't have built any of this alone. The harness is half engineering.
Designers wrote the judgment end of the standards, the rules about voice, the
flow of the tool itself. Engineers made it trustworthy: every check is code with
its own tests, the standards file is validated every time it changes, and the
whole thing installs with two commands. When our first full run found gaps in
our own checks, they fixed the checks and kept a record of what had been wrong,
the way engineers keep decision logs. All of it lives in git, so a rule and the
code it governs stay together, and neither can drift without someone noticing.
Somewhere along the way it stopped being clear where the design ended and the
engineering began. I've come to think that is a good sign.

The thing I keep thinking about is who this is for. Designers, first; that is
who we made it for. But any large organisation has more products than
designers, and plenty of teams ship interfaces with no designer anywhere near
them. I think the harness gives those teams a floor: colours and spacing that
stay consistent, contrast that passes, empty and error states that exist, copy
that says something. That isn't the ceiling a designer would reach. Still, it's
well above what those teams shipped before, and it means the designers we do
have can stop spending their time policing the floor. I say "I think" because
the harness is new and I don't have the evidence yet. I would like to.

What I didn't expect was that building a tool with almost no screens of its own
would turn out to be the clearest design work I've done. It was the same work
we'd been doing all along, deciding what good looks like for particular people
and then making that decision hold, with the screens taken out. The screens
turned out to be the smaller part. I don't think I would have believed that a
year ago. I'm not sure I would have wanted to.

The harness is open source, if you want to look at it:
[github.com/transformteamsg/dx-harness](https://github.com/transformteamsg/dx-harness).

---

## Editor notes (not for publication)

- Form pass 2026-09-02, benchmarked against Paul Graham's essays after the
  author read the previous draft as still markety. What his essays do that the
  draft didn't: no section headings, no bulleted feature lists, no quotable
  lines engineered for effect, no self-description ("we're the kind of team
  that…"), no announced honesty ("I should be honest"), uncertainty stated
  where it exists, no call to action, the thing built described once and then
  left alone so the essay is about the idea. All of those are now applied.
  Removed as branding: "We're builders" (the idea survives as "it stopped
  being clear where the design ended and the engineering began").
- Narrative stance: "I" for observing and thinking, "we" for what a few of us
  did and then the team did. Belief earned by the story: the design was the
  part the agent couldn't do, stated early, paid off at the close.
- Title: "What the agent didn't know" (plain, describes the essay's subject).
  Alternatives: "It depends", "Teaching the agent what we already knew".
  Author to confirm.
- Visual placements for Mimi (body kept clean): (1) after "every session
  ended with the agent forgetting all of it": a real session, the same context
  typed again. (2) after "We tested that last claim… and it held": the
  architecture sketch. (3) after "what all of this depends on": before/after,
  same brief with and without the harness. (4) after "the same way it checks
  everything else": short recording of selecting an element in the live product
  and changing it directly. (5) after "I've come to think that is a good sign":
  the builders illustration.
- Teacher Workspace is named once because the origin is specific to it. Mimi
  to confirm for a public blog; if not, "the product we design for teachers"
  stands alone.
- Two honest hedges are deliberate: "maybe 70%… I don't know how you would
  measure that", and "I say 'I think' because the harness is new and I don't
  have the evidence yet." Keep them; they are the register.
- Word count: ~1,290 for the body. The 1,000-word template was relaxed by the
  author on 2026-09-02; confirm with Mimi.
- Counts verified against the repo on 2026-08-28: 72 standards, 4
  non-negotiable. Re-verify before publication; they move.
- "One of the least technical designers" points at a real colleague. Get their
  OK or cut the sentence.
- Colleagues are named by role only. Add names and credits only with their OK.
- The coding agent is named generically; the repo README says Claude Code.
  Mimi to advise whether the blog names vendor tools.
- The visual editor is described without a name or link because its repo is
  not public. Confirm its public name and whether it may be mentioned before
  publication.
