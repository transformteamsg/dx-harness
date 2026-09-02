# Teaching the agent what we already knew

> Draft for the GTO design practice blog (contact: Mimi, design practice comms).
> Publish mid-October. Audience: GovTech designers first, then PMs, engineers,
> and the public. Written in Wondo's voice: an "I" narrator telling a "we"
> story, plain register, no hooks. Length relaxed from the 1,000-word template
> by the author (2026-09-02). Image slots are marked `[Visual: …]` for Mimi.

---

I kept telling the agent the same things.

A few of us on the design team had started designing in code. Nobody asked us
to. We're the kind of team that tries every new way of working to see what it
does to the work, and learns from whoever is doing it best. Coding agents were
the newest thing worth trying: an AI you talk to in plain language, and it
writes the code. So we opened the product's codebase (the folder of code that
is the product, the same one the engineers work in), described a screen, and
watched it appear. It was fast. It was also, often, wrong in ways that were
easy to see and hard to explain.

The wrong wasn't random. Over the previous year we had put a lot of work into
what good looks like for Teacher Workspace, the product we design for teachers:
the brand, the principles, the small rules about spacing and copy and colour
that make a product feel like itself. The agent had none of it. So every
session began the same way. Here's our colour. Here's our voice. Don't do the
gradient thing. Teachers are busy, keep it calm. And every session ended the
same way, with all of it forgotten.

That's an odd position for a designer to be in. The hard part of design was
never producing the screen. The hard part is deciding what good looks like for
this product and these people, and we had done that. We were watching it
evaporate at the end of every chat.

[Visual: a real session — the same context being typed into the agent, again.]

## Making it remember

The first version of the harness was for us. We wanted the agent to remember
what we'd already decided so we could stop re-explaining it. So we wrote it
down, not as a longer prompt but as files that live in the product's repo
(short for repository: the shared folder where the product's code lives, which
everyone building it works from). One set of files for what's true of good
interfaces in general. One small file for what's true of ours.

It worked well enough that the next problem showed up on its own. The rest of
the team wanted it. And the moment a tool has to work for people who didn't
build it, it stops being a shortcut and becomes a product. You have to design
it.

## What we built

dx-harness is a plugin (a package you install once) for the coding agent.
Install it in a product's repo and everyone working there, designer, engineer,
or the agent itself, works from the same standard. Four parts.

- **A skill you talk to.** You describe what you want. It asks what a senior
  designer would ask, then hands the work to specialists for copy, flow,
  pattern, motion, and polish. Nothing to memorise.
- **The standards.** 72 rules for what good interfaces do, written so they can
  be checked. Four never bend, including readable contrast and undo for
  destructive actions. The rest bend, with a written reason.
- **A design language file per product.** The standards hold what's true
  everywhere. A small file in each repo holds what's true of that product: its
  colours, its type, its voice. One tool, many products, none of them flattened
  into the same look.
- **A review with eyes.** When the work is done, a separate reviewer captures
  the finished screens and grades what it sees against both. The agent that
  built the screen doesn't mark its own work.

[Visual: the architecture sketch — context on the left, the orchestrator
routing to specialist skills on the right.]

## It depends

I care most about getting this next part right. Most tooling for agents is
deterministic: rules in, one exact answer out. That's fine for checking code
style and the wrong shape for design, because design never had exact answers.
Ask a designer where the button should go and you'll hear "it depends". People
make fun of us for that. But it's the true answer, and a tool that pretends
otherwise turns every screen into the same safe one.

So the standards run on a spectrum. Contrast is arithmetic, and a script
measures it. Whether a page feels calm is judgment, and the rule can only say
what a reviewer should look at, not what to conclude. Before anything gets
built, the harness offers two or three directions instead of one, and you
choose. Your taste, the thing you built by looking at thousands of screens, is
what the whole loop runs on. The tool shows you the screen. You decide.

[Visual: before/after — the same brief with and without the harness.]

## The last stretch is your hands

The harness gets a screen from a brief to good, and that's most of the work,
maybe 70% of it. Some of what's left shouldn't go through a prompt at all. You
want your hands on the thing: nudge the spacing, feel the hover.

So the other tool we're building is a visual editor over the live product. You
select an element and change it directly, the way you would on a canvas, while
git (the system engineers use to keep every version of the code, so nothing is
lost) keeps a working copy and a save point for every change. Nothing sits
between your taste and the pixel. The harness gets the work to good, your hands
take it the rest of the way, and the review checks all of it the same way.

[Visual: short screen recording — selecting an element in the live product and
adjusting it directly, no prompt.]

## The part I couldn't have built alone

I should be honest about the collaboration, because the harness is half
engineering and I'm a designer who needed partners.

Designers wrote the judgment end of the standards, the voice rules, and the
flow of the tool. Engineers made it trustworthy: every check is code with its
own tests, the standards file is validated on every change, and the whole thing
installs with two commands. When our first end-to-end run found gaps in our own
checks, we fixed them and kept the findings on record, the way engineers keep a
decision log. The standard gets stricter the same way code does: by review.

All of it lives in git, one source of truth: the standards, each product's
design language file, the decision records, and the checks. A rule and the code
it governs travel together, so neither drifts from the other without someone
noticing.

Somewhere in there, the job titles stopped describing the work. We're builders.
We care about craft, and about getting it into a lot of hands without waiting
years.

[Visual: the builders illustration — one team around one sheet of work.]

## Who this is for

Designers first. We tested the whole path with one of the least technical
designers on the team, and they shipped. If the setup needs an engineer, we
treat that as a bug.

But any large organisation has more products than designers. A team with no
design support gets a floor from the harness: colours and spacing that stay
consistent, contrast that passes, empty and error states that exist, copy that
says something. That floor isn't the ceiling a designer would reach. It's still
well above what shipped before. And the designers we do have stop spending
their time policing the floor. Their attention goes to the questions that
need a designer.

The harness has almost no screens of its own. Building it was still design
work, and maybe the clearest design work I've done: deciding what good means,
writing it down so it survives, and building the path that gets everyone
there. Which, looking back, is what we were doing the whole time we were
repeating ourselves to the agent. We hadn't finished.

dx-harness is open source at
[github.com/transformteamsg/dx-harness](https://github.com/transformteamsg/dx-harness).
If you design with an agent, try it, and tell me what breaks.

---

## Editor notes (not for publication)

- Register pass 2026-09-02, after the author's note that the previous opening
  read as forced and markety: hooks removed ("main design tool has been a chat
  box", "superpower", "the most designed thing we've shipped", "at speed and at
  scale", the repeated "see it, then fix it"). The opening is now the honest
  origin: re-explaining the Teacher Workspace context to an agent that forgot
  it every session. Plain sentences, contractions, jargon glossed in
  parentheses (coding agent, codebase, repo, plugin, git).
- Narrative stance: an "I" narrator telling a "we" story. The origin is
  honestly "a few of us", the build is "we", the reflection is "I".
- Structure: belief earned by the story. The belief that the hard part of
  design is deciding what good looks like is stated in the opening and paid
  off in the close; "It depends" carries the second belief.
- Title changed to "Teaching the agent what we already knew" (describes what
  happened, no trick). Previous candidates: "Design never had exact answers",
  "A harness for designing in code". Author to confirm.
- Teacher Workspace is now named once, because the honest origin is specific
  to it. Mimi to confirm this is fine for a public blog; if not, "the product
  we design for teachers" stands alone.
- Word count: ~1,150 for the article body. The 1,000-word template was relaxed
  by the author on 2026-09-02; confirm with Mimi.
- Counts verified against the repo on 2026-08-28: 72 standards, 4
  non-negotiable. Re-verify before publication; they move.
- "One of the least technical designers" points at a real colleague. Get their
  OK or cut it.
- Colleagues are named by role only ("the engineers on our team"). Add names
  and credits only with their OK.
- The coding agent is named generically; the repo README says Claude Code.
  Mimi to advise whether the blog names vendor tools.
- "The last stretch is your hands" describes a second, unreleased tool without
  naming or linking it, because its repo is not public. Confirm its public
  name and whether it may be mentioned at all before publication. The 70/30
  split is the author's framing.
