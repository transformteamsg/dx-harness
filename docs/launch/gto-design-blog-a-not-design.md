# The part that isn't design

> Direction A of two. Core theme: I make harnesses, and making them is not
> design; it is a tool and a process that gives design its time back. Draft for
> the GTO design practice blog (contact: Mimi). Essay form: continuous prose, no
> headings, lists, or call to action. Wondo's voice. Visual placements in the
> editor notes.

---

I make design harnesses now, and I don't think making them is design.

That is an odd thing for a design lead to say while in the middle of building
one, so I should say what I mean. Over the past year, designers on my team
started building the products they design, in code, working with AI coding
agents (programs you talk to in ordinary language, and they write the code). I
built most of the tooling that makes this go well: written standards for what
good interfaces do, a small file per product describing its own design
language, and a review that looks at the finished screens and grades them.
People call this designing with AI. I'd call it a design tool, and a process for
using it. The design is still the thing we were doing before the tool existed.
The tool exists to give us more time for it.

I want to be careful here, because design leaders are under real pressure at
the moment to look good at AI, and the pressure does something to the word
"design". A designer I follow put it sharply recently: the tools are bad at
design, the leaders are under pressure to show they're good at using them, so
the definition quietly shifts to fit the tool. Design starts to mean building
and shipping and prompting. The parts the machines aren't good at, understanding
people, deciding what matters, knowing a screen is wrong before you can say why,
slide out of the definition because they are inconvenient to keep in it. I've
felt that pull. I've made a harness, which is about as tooling-heavy as a
designer's work gets. So it seems worth being exact about what it is and isn't.

What it isn't is the design. When we watch a teacher try to enter marks between
two classes and see where they hesitate, that is design. When we spend a week
arguing about whether a warning should interrupt or wait, that is design. When
I look at a screen and know it's wrong before I can explain why, that is design,
and the harness does none of it. It can't. It has never met a teacher.

What it is: the removal of most of what stood between designers and that work.
Before the agents, a large share of a designer's week went to what I'd call the
production hand-off. Writing up something you had already decided. Annotating
the mockup. Explaining the spacing to whoever would build it, then checking
whether it came out right, then filing a ticket when it didn't, then watching
the ticket lose to a feature. None of that is design either. Call it the tax on
getting design into the product. Coding agents cut that tax and then added a new
one: now you explained everything to the agent instead, every session, because
it forgot. We'd spent about a year working out what good looked like for
Teacher Workspace, the product we design for teachers, and I was retyping it
into a chat window every morning.

So the harness is a way of paying the tax once. We wrote down what we knew, in
files the agent reads: one set for what's true of good interfaces anywhere, and
one small file for what's true of ours. We gave the agent a separate reviewer
that looks at the finished pixels rather than the code and grades them against
those files, so the person who cares about the craft isn't the only line of
defence. Then other designers wanted it, and it had to work for people who
hadn't built it and didn't want to learn it, which is when it became a tool
rather than a shortcut. We tested that on the least technical designer on the
team, and it held. Engineers did at least half of the work: every check is code
with its own tests, and the whole thing installs with two commands.

Here is what came back. Time, first, and a particular kind of time. The hours
that used to go to explaining and checking and re-filing went back to looking
and deciding. Review changed. It used to be mostly catching drift: the spacing
is off again, the wrong grey, the missing empty state. Now the floor holds on
its own, and reviews are arguments about whether this is the right screen at
all. A designer on the team who doesn't write code shipped a change to the
product themselves, from brief to review, without waiting for anyone. I don't
have numbers I'd trust yet; the harness is a few months old. What I have is the
change in what we talk about, and it is the change I wanted.

I also notice the risk, and it's in me as much as anywhere. Making a harness is
satisfying the way engineering is satisfying. It's deterministic. It finishes.
It can be right. Design rarely feels like any of that, so the pull toward
tooling is partly a pull toward work that can be finished. The way I resist it
is by keeping the harness's job narrow. It exists to hand designers' time back
to design. Every hour it takes that it doesn't return is a failure, however
clever the hour was.

So I'll keep making harnesses, and I'll keep saying they aren't design. Both are
true, and the second is the reason for the first.

The harness is open source, if you want to look at it:
[github.com/transformteamsg/dx-harness](https://github.com/transformteamsg/dx-harness).

---

## Editor notes (not for publication)

- Direction A: the author is a harness maker who does not call harness-making
  design. The "however" is the time and attention that came back to designers.
  Written 2026-09-03 after the author shared a LinkedIn post by Hang Xu arguing
  that AI is bad at design and the definition of design is shifting to fit the
  tools. The essay paraphrases that argument without naming the author ("a
  designer I follow put it sharply recently"); attribute by name if the author
  wants, and confirm the paraphrase with them if so.
- Three design moments are illustrative, not reported: a teacher entering
  marks between classes, a week-long argument about whether a warning
  interrupts or waits, knowing a screen is wrong before you can say why.
  Replace with real moments from the team's research and reviews; real beats
  plausible.
- Impact paragraph is deliberately hedged ("I don't have numbers I'd trust
  yet"). If the team has any real before/after (hours per week on hand-off,
  ticket counts, review topics), it belongs here.
- The designer who shipped without writing code and the "least technical
  designer" may be the same colleague. Get their OK or cut.
- Teacher Workspace is named once. Mimi to confirm for a public blog.
- The visual editor is not mentioned in this direction; the theme is the
  harness's purpose, not the toolset.
- Visual placements: (1) after "retyping it into a chat window every morning":
  a real session, the same context typed again. (2) after "installs with two
  commands": the architecture sketch. (3) after "the change I wanted": a review
  thread before and after, if one can be shown. (4) near the close: the
  builders illustration.
- Word count: ~1,050 for the body.
- Standing items: counts verified 2026-08-28 (72 standards, 4 non-negotiable),
  re-verify before publication; coding agent named generically, Mimi to advise
  on vendor naming.
