# Design never had exact answers

> Draft for the GTO design practice blog (contact: Mimi, design practice comms).
> Publish mid-October. Audience: GovTech designers first, then PMs, engineers,
> and the public. Written in Wondo's voice — an "I" narrator telling a "we"
> story. Length relaxed from the 1,000-word template by the author (2026-09-02).
> Image slots are marked `[Visual: …]` for Mimi to plan against.

---

For the past two months, my main design tool has been a chat box.

The same is true for most designers on our team. We don't hand mockups over a
wall anymore. We open the product's codebase — the folder of code that *is* the
product, the same one engineers work in — and describe what we want to an AI
coding agent: a program you talk to in plain language, and it writes the code.
The first time it works, it feels like a superpower. You type "design a student
profile page" and watch the screen assemble itself.

The second time, you start to see the problem.

[Visual: short screen recording — a plain-language prompt in the coding agent,
and the designed screen appearing.]

## The agent has no taste

The agent is fast, confident, and tireless. What it doesn't have is taste. Ask
it for the same screen twice and you'll get two different answers, delivered
with the same confidence. It learned from the whole internet, which means it
learned the average of the whole internet. And the average of the internet is
what designers now call AI slop: purple gradients, cards nested inside cards,
copy that promises much and says nothing.

A subtler problem sits underneath. Even an agent with good general taste has no
taste in *your* product. It doesn't know your colours, your voice, or the
reason your buttons look the way they do. Those decisions live in designers'
heads. So every designer on our team was solving the same problem alone, one
prompt at a time, and every solution evaporated when the chat ended.

I kept coming back to how we onboard a junior designer. We don't hand them a
longer set of instructions every morning. We give them three things once: the
standards, the product's design language, and a senior who reviews their work.
Then they get good. The agent needed the same three things. Nobody had written
them down in a form an agent could use, because until now there was no reason
to.

So, with the engineers on our team, we wrote them down. The result is a tool.

## What we built

dx-harness is a plugin (a package you install once) for the coding agent. You
add it to a product's repo (short for repository: the shared, versioned folder
where that product's code lives), and everyone working there, designer or
engineer or agent, now works against the same standard. Four parts do the work.

- **A skill you talk to.** You describe what you want. It asks the questions a
  senior designer would ask, then routes the work to specialists for copy,
  flow, pattern, motion, and polish. Nothing to memorise.
- **The standards.** 72 rules for what good interfaces do, written so they can
  be checked. Four never bend, including readable contrast and undo for
  destructive actions. The rest bend, but only with a written reason.
- **A design language file per product.** The standards carry what's true
  everywhere. A small file in each repo carries what's true of that product:
  its colours, its type, its voice. One tool serves many products without
  flattening them into one look.
- **A review with eyes.** When the work is done, a separate reviewer captures
  the finished screens and grades what it sees against both. The agent that
  built the screen never marks its own work.

[Visual: the architecture sketch — context on the left, the orchestrator
routing to specialist skills on the right.]

## It depends

Here's the part I'm most protective of. Most tooling for agents is
deterministic: rules in, one exact answer out. That's the right shape for
checking code style, and the wrong one for design, because design is the
practice that never had exact answers. Ask a designer where the button should
go and you'll hear "it depends". People tease us for that answer. But it's the
correct answer, and a tool that pretends otherwise will flatten every screen
into the same safe one.

So the standards run on a spectrum from deterministic to abstract. Contrast is
arithmetic; a script measures it. Whether a page feels calm is judgment; the
rule says what a reviewer should weigh, never what to conclude. And before
anything gets built, the harness offers two or three directions instead of one.
You choose. The taste you built by looking at thousands of screens isn't
replaced by any of this. It's the input the whole loop runs on: see it, then
fix it.

[Visual: before/after — the same brief with and without the harness.]

## The last stretch is your hands

The harness carries a screen from brief to good, and that's about 70% of the
work. We're deliberate about the rest. Some decisions shouldn't pass through a
prompt at all. You want your hands on the thing: nudge the spacing, feel the
hover.

So the other tool we're building is a visual editor over the live product. You
select an element and adjust it directly, the way you would on a canvas, while
git (the system engineers use to keep every version of the code, so nothing is
ever truly lost) quietly keeps a working copy and a save point for every
change. No prompt sits between your taste and the pixel. The harness gets the
work to good, your hands take it the rest of the way, and the review grades all
of it the same.

[Visual: short screen recording — selecting an element in the live product and
adjusting it directly, no prompt.]

## The part I couldn't have built alone

I should be honest about the collaboration, because the harness is half
engineering and I'm a designer who needed partners.

Designers wrote the judgment end of the standards, the voice rules, and the
flow of the tool itself. Engineers made the standard trustworthy: every check
is code with its own tests, the standards file is validated on every change,
and the whole thing installs with two commands. When our first end-to-end run
found gaps in our own checks, we fixed the checks and kept the findings on
record, the way engineers keep a decision log. The standard gets stricter the
same way code does: by review.

All of it lives in git, our single source of truth: the standards, each
product's design language file, the decision records, and the checks that
enforce them. A rule and the code it governs travel together, so neither can
quietly drift from the other.

That mix taught me a better name for what we are: builders. System thinkers who
care about craft and user experience, at speed and at scale.

[Visual: the builders illustration — one team around one sheet of work.]

## Who this is for

Designers first. We tested the whole path with one of the least technical
designers on the team, and they shipped. That's the bar we hold: if the setup
needs an engineer, it's a bug.

But the honest maths of any large organisation is that there are more products
than designers. A team with no design support gets a floor from the harness:
colours and spacing that stay consistent, contrast that passes, empty and error
states that exist, copy without slop. That floor isn't the ceiling a designer
would reach. It's still far above what shipped before. And the designers we do
have stop policing the floor. Their review time goes to the questions that
deserve a designer.

The harness went from first commit to a launched tool in about three weeks, and
it has almost no screens of its own. Even so, it's the most designed thing
we've shipped. That sounds like a contradiction only if design means drawing
screens. Design is deciding what good means, then building the path that gets
everyone there. The screens are where the decisions become visible.

dx-harness is open source at
[github.com/transformteamsg/dx-harness](https://github.com/transformteamsg/dx-harness).
If you design with an agent, try it, and tell me what breaks.

---

## Editor notes (not for publication)

- Style pass 2026-09-02: rewritten toward Paul Graham's essay register —
  concrete opening, argument from experience, short declarative sentences,
  contractions, jargon glossed inline (coding agent, codebase, plugin, repo,
  git), ending widened to a principle. House copy rules still applied
  (Singapore English, no buzzwords, no AI-writing tells).
- Narrative stance, decided 2026-09-02: an "I" narrator telling a "we" story.
  Observations, arguments, and reflection are "I"; building, shipping, and
  testing are "we". Hold this line in future edits.
- Title changed from "A harness for designing in code" to "Design never had
  exact answers" (the thesis). The old title works as a subtitle if the
  platform wants one. The section that carried this phrase is now titled
  "It depends".
- Word count: ~1,120 for the article body. The 1,000-word template was relaxed
  by the author on 2026-09-02; confirm with Mimi.
- Counts verified against the repo on 2026-08-28: 72 standards, 4
  non-negotiable. Re-verify before publication; they move.
- Timeline from the public repo, verified 2026-08-28: first commit 2026-07-23,
  renamed dx-harness 2026-08-05, v0.4.0 to installed users 2026-08-14 (the
  "about three weeks" claim), site landing merged 2026-08-19.
- "One of the least technical designers" points at a real colleague. Get their
  OK or cut it.
- Product specifics (Teacher & School portfolio, MOE) are deliberately absent;
  Mimi to advise on the sensitivity line.
- Colleagues are named by role only ("the engineers on our team"). Add names
  and credits only with their OK.
- The coding agent is named generically; the repo README says Claude Code.
  Mimi to advise whether the blog names vendor tools.
- "The last stretch is your hands" describes a second, unreleased tool without
  naming or linking it, because its repo is not public. Confirm its public
  name and whether it may be mentioned at all before publication. The 70/30
  split is the author's framing.
