# A harness for designing in code

> Draft for the GTO design practice blog (contact: Mimi, design practice comms).
> Target: 800–1,000 words, publish mid-October. Audience: GovTech designers first,
> then PMs, engineers, and the public. Written in Wondo's voice.
> Image slots are marked `[Visual: …]` for Mimi to plan against.

---

My main design tool this year is a chat box.

Designers on my team design in code now. Not mockups handed over a wall — real
screens, in the product repo, built in conversation with an AI coding agent. The
first time it works, it feels like a superpower. You describe a screen in plain
language and watch it appear.

The second time, you start to see the problem.

[Visual: short screen recording — a plain-language prompt in the coding agent,
and the designed screen appearing.]

## The agent has no taste

The agent is fast, confident, and tireless. What it doesn't have is judgment. Ask
it twice and you get two different answers. It has read the whole internet and
learned the average of it, and the average is what designers now call AI slop:
purple gradients, cards nested inside cards, copy that promises much and says
nothing.

It also knows nothing about your product. Your colour, your voice, the reason
your buttons look the way they do. Every designer on my team was solving this
alone, one prompt at a time, and every fix lived and died inside a single chat.

I kept thinking about what we give a new designer on their first week. We don't
hand them a longer prompt. We give them context: the standards, the product's
design language, and a senior who reviews their work. The agent needed the same
three things. So, with the engineers on our team, we built them once, as a tool.

## What we built

dx-harness is an open-source plugin for the coding agent. Install it in a product
repo and every designer, engineer, and agent working there shares the same
standard. Four parts do the work:

- **A skill you talk to.** Describe what you want. It asks what a senior designer
  would ask, then routes the work to specialists for copy, flow, pattern, motion,
  and polish. No commands to memorise.
- **The standards.** 72 rules for what good interfaces do, written to be checked.
  Four never bend, including contrast and undo for destructive actions. The rest
  bend with a written reason.
- **A design language file per product.** The standards carry what is true
  everywhere. Each repo carries what is true of that product, so one tool serves
  many products without flattening them into one look.
- **A review with eyes.** A separate reviewer captures the rendered screens and
  grades what it sees against both. The agent that built the screen never marks
  its own work.

[Visual: the architecture sketch — context on the left, the orchestrator routing
to specialist skills on the right.]

## Design never had exact answers

Here is what makes me protective of this work. Most agent tooling is
deterministic: rules in, one exact answer out. That is the right shape for lint
rules and the wrong one for design, because design is the practice that never
had exact answers. Ask a designer where the button goes and you'll hear
"it depends". They're right.

So the standards range from deterministic to abstract. A script measures
contrast, because contrast is arithmetic. A judgment rule states what a reviewer
weighs, never what to conclude. The loop offers two or three directions before it
builds, and you choose. The taste you built by looking at thousands of screens
isn't replaced here. It's the input the whole loop runs on: see it, then fix it.

[Visual: before/after — the same brief with and without the harness.]

## The part I couldn't have built alone

I want to be honest about the collaboration, because the harness is half
engineering and I'm a designer who needed partners.

Designers wrote the judgment end of the standards, the voice rules, and the flow
of the tool itself. Engineers made the standard trustworthy: every check is code
with its own tests, the standards file is validated on every change, and the
whole thing installs with two commands. When our first end-to-end run found gaps
in our own checks, we fixed the checks and kept the findings on record, the way
engineers keep a decision log. The standard gets stricter the same way code
does: by review.

That mix taught me a better name for what we are: builders. System thinkers who
care about craft and user experience, at speed and at scale.

[Visual: the builders illustration — one team around one sheet of work.]

## Who this is for

Designers first. We tested the whole path with one of the least technical
designers on the team, and they shipped. That is the bar: if the setup needs an
engineer, it's a bug.

But the honest maths of any large org is that there are more products than
designers. A team with no design support gets a floor from the harness: tokens
that hold, contrast that passes, states that exist, copy without slop. Not the
ceiling a designer would reach, but far above what shipped before. And the
designers we do have stop policing that floor. Review time goes to the questions
that deserve a designer.

The harness has almost no screens of its own, and it is still the most designed
thing I've shipped this year. Design was never only the pixels: it is deciding
what good means, then building the path that gets everyone there.

dx-harness is open source at
[github.com/transformteamsg/dx-harness](https://github.com/transformteamsg/dx-harness).
If you design with an agent, try it, and tell me what breaks.

---

## Editor notes (not for publication)

- Word count: ~890 for the article body.
- Counts verified against the repo on 2026-08-28: 72 standards, 4 non-negotiable.
  Re-verify before publication; they move.
- "One of the least technical designers" points at a real colleague. Get their OK
  or cut it.
- Product specifics (Teacher & School portfolio, MOE) are deliberately absent;
  Mimi to advise on the sensitivity line.
- Colleagues are named by role only ("the engineers on our team"). Add names and
  credits only with their OK.
- The coding agent is named generically; the repo README says Claude Code. Mimi
  to advise whether the blog names vendor tools.
