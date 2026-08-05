# Grill the plan — sharpen it before the gate

Read this at Phase 3, once the plan is exposed and before you ask for approval. The
plan gate is the cheapest place to catch a structural or intent mistake — a rebuild
costs a session, a sharp question costs a sentence. Grilling makes sure the human
signs off on a *sharpened* plan, not a first draft, and that the approval rests on
**shared understanding**: they know what they are approving, you know what they meant.
Adapted from the `grilling` interview skill
(<https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md>):
interrogate relentlessly, one question at a time, a recommended answer each time, facts
looked up rather than asked — with the harness's guardrails layered on.

## What grilling is for

Intent without loss is the harness's one promise, and a plan drifts from intent
quietly: a done-criterion silently dropped, an async state hand-waved, a waiver taken
because it was the easy way out. Grilling is the adversarial read of your own plan
that surfaces the drift while it is still cheap to fix.

Grilling sharpens; it does not restyle and does not relax a control. It cannot waive
an L0 or L1 control, and it cannot add scope the Phase-1 contract does not carry. If a
question's answer changes the chosen structure, go back to Phase 2 — do not patch it
into the plan.

## The procedure

1. **Red-team your own plan across the lenses below.** Do not defend the plan; try to
   break it. List the candidate questions first, then cut them down in steps 2–3.
2. **Separate facts from decisions.** A *fact* is anything the context can settle —
   the catalog, the sprint contract, the product's `DESIGN.md`, the code. Look facts
   up; never ask the human something you could read. A *decision* is a genuinely open
   choice, and decisions are the human's — put each one to them and wait, even when
   you hold a strong recommendation. A decision the contract or catalog has already
   made is not open: resolve it into the plan and move on.
3. **Ask one question at a time, in dependency order.** Walk down each branch of the
   design's decision tree, resolving upstream decisions before the ones that depend on
   them; among independent branches, highest leverage first. Use an `AskUserQuestion`
   with a *single* question and the **recommended answer as the first option** (suffix
   its label "(Recommended)"), plus the real alternatives. Never batch the grill into
   a wall of questions — multiple questions at once are bewildering; one decision,
   resolved, then the next.
4. **Fold each answer back into the plan before the next question**, and show the
   one-line delta ("Plan now: …"). The plan is a living artifact through the grill.
5. **Stop at shared understanding — when nothing sharp remains.** A tight plan may
   survive on one question; a loose one may take four or five. Do not manufacture
   questions to hit a count, and do not skip the grill because the plan "looks fine" —
   put at least the intent-drift and control-at-risk lenses to the user out loud
   unless the context has plainly closed them.
6. **Honour an early approval.** If the human gives a clear, unprompted approval after
   the plan is exposed or mid-grill, do not force the remaining questions on them:
   resolve the outstanding candidates yourself as in an unattended run, record them,
   and go straight to the structured ask so they confirm exactly what they approved.
   A vague "continue" is not an approval.

## Lenses (portfolio-tuned)

- **Intent drift** — does the plan still meet every Phase-1 done-criterion, and has it
  added anything the contract does not ask for? Name the drift.
- **The stressed teacher, the worst day** — does it hold when the network drops
  mid-action, the class picked is the wrong one, the draft is half-written? Say what
  happens to the teacher's work in each case; "your draft is saved" is a behaviour to
  design, not a phrase to assume.
- **The ducked decision** — what did the plan leave vague? An unenumerated async
  state, an announcement channel not chosen (A11Y-11), an edge case named but not
  resolved, a name that needs a waiver.
- **The cheaper design** — is there a smaller structure that still meets the contract
  (HIG: Simplicity)? Make the case to shrink or cut before committing to the larger
  one.
- **The control most at risk** — which in-scope control will this plan most likely
  fail at build, and is the plan specific enough to pass it? Weight the L0 tier,
  reflow, and the high-frequency anti-slop traps — take the current tiers and the SLP
  family from `standards/catalog.yaml` at grill time, not from a remembered list,
  which goes stale the day the catalog ratchets.
- **Waiver honesty** — for every proposed waiver: is it genuinely mandated or
  unavoidable, or is it convenience? Check what the waiver's tier demands via the
  `standards` skill — the tier rules live there, not here — and name the approver
  now, not later.

## Recording it

Note in the decision record's plan section that the plan was grilled, and list the
decisions the grill resolved — one line each, including any resolved under the
early-approval rule. In an unattended run there is no human to answer the grill, so
grill yourself: write the questions and your reasoned answers into that same section,
so the async reviewer sees what was interrogated (the parallel of the operator-proxy
rule for the approval gate).
