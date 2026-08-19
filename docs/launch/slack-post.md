# Slack launch posts

Two messages: the launch post for `#dx-harness` (all builders), and a shorter one for
the design team channel. Post once the domain resolves and the marketplace install is
confirmed from a clean machine.

## 1 — Launch post, `#dx-harness`

---

🧭 **dx-harness is out**

Designers on our team design in code now. The agent they work with is fast, but it
doesn't know what good design is, and it doesn't know your product. dx-harness fixes
the context: it's a Claude Code plugin that carries our design standard, so your agent
builds to the bar instead of to the average of the internet.

**What you get**

- An orchestrator you talk to in plain language. No command names — describe the
  screen, it routes the work to specialist skills for copy, flow, pattern, motion and
  polish.
- The standards: 70 checkable rules for what good interfaces do, including eleven
  that name AI slop as numbered violations.
- A DESIGN.md generated for your repo, so the harness speaks your product's design
  language, not a generic one.
- An auto-triggered design review that grades the result against both. The agent that
  built the screen never marks its own work.

**Why this one, when there are many.** Most agent harnesses are deterministic: rules
in, one exact answer out. Design never had exact answers, so this one separates
arithmetic from judgment. Scripts measure what scripts can measure; judgment rules say
what to weigh; the loop diverges into directions before it builds, and you choose. It
also has eyes: the review grades the rendered screens, not the code, and shows you
what to fix the way designers already work. See it, then fix it. And it assumes no
terminal skills: one of our least technical designers took it from install to shipped
screen.

**If your team has no designer yet.** The harness is your floor: tokens that hold,
contrast that passes, states that exist, copy without slop, checked in every session.
Not the ceiling a designer would reach, but far above default agent output. And the
designers we do have stop policing that floor: review time goes to the 20% that
deserves argument.

**Try it** — docs and quick start: `https://dx-harness.example` _(final domain to follow)_

In Claude Code, in your product repo:

```
/plugin marketplace add transformteamsg/dx-harness
/plugin install dx-harness@dx-harness
```

Then run `/dx-harness:dx-design-setup` once (the design checks need Python 3 +
PyYAML), and type what you want to build. On Claude Desktop and the web app, add the
marketplace and install from the plugin directory — no command line needed.

**Who made it.** Designers and engineers, together. The design harness stands on an
engineering one: the same plugin ships eight engineering skills, and every check is
code with self-tests. Builders and system thinkers, craft and user experience at
speed and at scale.

Today is a big start, and the harness grows by use: waive a rule that doesn't fit,
and the recurring waivers become rule proposals. Tell us what breaks and what you
build. 🙌

---

## 2 — Design team post

🧭 **dx-harness, for designers**

You can design in code now, in the product repo, with your agent doing the building.
What the agent lacks is judgment: what good design is, and what your product's design
language is. dx-harness carries both, and it's live today.

What it changes for you:

- **Nothing to memorise.** Describe the screen you want in plain language. The
  orchestrator asks what a senior designer would ask, then routes the work. No
  command names, no flags.
- **"It depends" is respected.** The standards range from deterministic to abstract.
  Scripts measure what scripts can measure, like contrast and tokens. Judgment rules
  say what to weigh, never what to conclude. The loop brings you two or three
  directions, and you choose.
- **It has eyes.** The review grades the rendered screens, state by state, and you
  see the same captures it grades. The taste you built by looking at thousands of
  screens is the input the loop runs on: see it, then fix it.
- **Your product keeps its own voice.** The harness generates a DESIGN.md for your
  repo, so it speaks your product's design language, not a generic one.

Get started, in your product repo in Claude Code:

```
/plugin marketplace add transformteamsg/dx-harness
/plugin install dx-harness@dx-harness
```

Then run `/dx-harness:dx-design-setup` once. It checks your tools and generates your
DESIGN.md. After that, type what you want to build.

Docs and quick start: `https://dx-harness.example` _(final domain to follow)_

We tested the full path with one of our least technical designers, and they shipped.
If it fights you anywhere, that's a bug. Tell me in #dx-harness.

---

## Before posting

- [ ] Replace `https://dx-harness.example` with the live domain.
- [ ] Confirm the marketplace install works from a clean machine.
- [ ] Check the skill count (`21`) and control count (`70`) still match the standards
      (the `catalog.yaml` artifact keeps its name).
- [ ] The "least technical designer" line appears in both messages and points at a
      real colleague. Get their OK before posting, or cut it.
- [ ] Fill in the design team channel name.
