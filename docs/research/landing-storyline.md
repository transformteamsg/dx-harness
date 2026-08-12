# Landing-page storyline research: Pocock sites, "impeccable" principles, and DX Harness candidates

Research date: 2026-08-06. Primary sources fetched live (WebFetch) plus local skill and repo files. Written for the landing redesign on branch `feat/landing-redesign`; the current page is judged "too literal a Grafana clone."

Convention note: no existing research-notes convention fits — `review/` holds tool-maintained registries (`review/agent-patterns.md`), `content/research/` is published site MDX. This file therefore lives at `docs/research/landing-storyline.md` as a new location.

---

## 1. Matt Pocock's sites (fetched live)

### mattpocock.com (source: https://www.mattpocock.com)

A deliberately tiny page — closer to a business card than a funnel:

- **Hero:** "Hey, I'm Matt!" plus a three-sentence bio (educator/content creator/engineer, voice coach → Vercel → AI education). First person, exclamation points, short sentences.
- **Inline nav:** Twitter, YouTube, Discord, FAQ, Course — links as prose, not chrome.
- **One CTA:** "I'm building AI Hero, the perfect course for web devs to retrain as AI Engineers" → single "Learn More" button.
- **Visuals:** three images total (logo, course graphic, personal photo). No feature grids, no cards.

Lesson: a personal page earns trust through voice and restraint, not surface area. One promise, one action.

### totaltypescript.com (source: https://www.totaltypescript.com)

The full hook → problem → promise → proof → path arc:

1. **Hook:** "Become the TypeScript Wizard at Your Company" / "Master the deep magic of types with bite-sized challenges that stretch your brain." A status-based promise (what you become at work), not a feature list.
2. **Problem:** developers are "fighting TypeScript" — named specifics: no systematic approach, bad mental model of `any`, incomplete generics. Precision over vagueness; the reader recognizes themselves.
3. **Promise/transformation:** reach "a point of mastery where very little surprises you any more"; TypeScript becomes "simple, predictable and malleable." The promise is emotional state, not curriculum.
4. **Proof:** testimonials chosen for emotional transformation ("I feel like I have superpowers," "like you're doing a 1 on 1 with Matt Pocock"), mixing recognizable names (Tomasz Łakomy, John D. Jameson) with anonymous ones. Then methodology-as-proof: the exercise loop (problematic code → explanation → challenge → walkthrough) is described concretely enough to be believable.
5. **Path:** five named workshops in progressive order — the reader can see the whole journey before buying. Two pricing tiers, "Best Value" anchor, 30-day guarantee at each CTA.

**Voice:** second person, conversational-direct with aspirational spikes ("You deserve so much better," "You are indispensable"). Short sentences. Specific nouns (`any`, generics, workshop names) do the persuading.

**Visual technique:** one metaphor (wizard) threads the whole page; UI screenshots of the actual exercise interface stand in for stock imagery; checkmark lists carry concrete outcomes; creator bio (XState core team, Vercel) placed late, as proof rather than opener. CTAs appear only after the promise is established, then repeat at the path/pricing section — rhythm, not saturation.

---

## 2. The "impeccable" landing philosophy

Source: `/Users/rezailmi/.claude/skills/impeccable/SKILL.md`, `reference/new-work.md`, `reference/craft-floor.md`.

Principles most relevant to a storyline-first landing page (all quotes from those files):

- **Persuade mode:** "the visitor decides and acts; design is the product... Earn attention and action." The opening must "make the offer intelligible and desirable, expose a clear action, and demonstrate something only this product can prove" (new-work.md §3). A first-time visitor should know what this is, why it matters, and what to do within seconds (§7).
- **First viewport is a thesis, not a header.** "Demonstrate the mechanism immediately... The memory test: if someone left after one viewport, what would they describe an hour later? If the honest answer is a mood, the concept has not committed yet" (§6).
- **Prove, don't claim.** "Show the subject doing its job: the interface at work, the mechanism dramatized, specifics a competitor could not copy-paste. Sections that restate a claim in different words add length, not substance" (§6). This is exactly Total TypeScript's methodology section.
- **Pace the scroll like a studio.** "Vary density, scale, image, motion, and quiet inside one grammar; a dense passage earns a quiet one, and the page ends anchored by a real close" (§6).
- **Distinctive, not templated.** The calibration test: "if someone could guess your aesthetic from the category alone, or from category-plus-avoidance, rework" (§4). Refuse-list defaults include icon-card grids as page structure, hero-metric templates, kickers/eyebrows (a hard ban), section numbers, gradient text, monospace-as-technical-costume (craft-floor.md).
- **Cognitive load:** one authored motion moment, obvious type-scale steps, tight groups / generous separation, controls that name their action, every brief requirement findable within seconds (craft-floor.md Verify list).
- **Storytelling as contract:** the direction is recorded as THESIS / STORY / FIRST VIEWPORT blocks — "STORY: what the visitor understands, believes, and does" (new-work.md §5). The narrative arc is a designed artifact, not emergent.

---

## 3. Current landing page — what exists

Source: `/Users/rezailmi/.herdr/worktrees/dx-harness/landing-page/app/(landing)/page.tsx`, `DESIGN.md`, `PRODUCT.md`, `README.md`.

Current section order: hero ("Design / to the bar." + three tape strips + install commands) → "One loop, five phases." → "Thirteen design skills." + engineering skill list → "The bar, shown." (`SlopCompare`) → "No command line?"

Where it reads Grafana-derivative:

- The direction is literally pinned as "Hex's Grafana identity work" (`DESIGN.md` line 75: "Pinned direction: Hex's Grafana identity work") and a waiver in `page.tsx` cites "the Hex×Grafana direction." The tape strips, print-flat dark world, and oversized grotesk display are the Grafana identity's signature moves reproduced, not translated.
- **No narrative arc.** The page is inventory-ordered (loop → skill list → comparison → install fallback), not story-ordered. There is no problem statement anywhere — nothing names the pain (agents shipping slop, design intent lost between prompt and PR) before offering the fix. By Total TypeScript's arc it opens at "path" and never visits "problem" or "promise."
- **Claims over proof.** "70 checkable controls" and "an evaluator that never grades its own work" are asserted in tape strips; the one demonstration (`SlopCompare`) sits fourth, under a heading ("The bar, shown.") that means nothing until you've read everything above it. impeccable's rule — demonstrate the mechanism in the first viewport — is inverted.
- **Two flat lists** (13 design + 8 engineering skills) are catalog UI, not persuasion; on Pocock's page the path section works because each workshop has a one-line transformation, not a definition.
- The tape strips carry the page's densest claims as decorative, `aria-hidden` background texture — the most important copy is literally marked as not-content.

What's genuinely good and worth keeping: the two-command install block in the hero (concrete, honest CTA), the "No command line?" escape hatch, the calm one-accent restraint, and `SlopCompare` itself (real proof material — it just needs promotion).

Product truth for the storylines (README.md, PRODUCT.md): dx-harness is a single Claude Code plugin — 8 engineering + 13 design skills under one `/dx` prefix — carrying a design loop with a human approval gate, a 70-control checkable standards catalog, and an evaluator agent that never grades its own work. Audiences: humans mid-task and agents reading `/llms.txt`. Brand: "Kind Utility. Calm, exact, quietly warm" (PRODUCT.md).

---

## 4. Candidate storylines

Each maps sections to techniques observed above. All keep the install block as the recurring CTA (Total TypeScript's rhythm: CTA after promise, again after path) and open with a demonstration, not a mood (impeccable: first viewport is a thesis).

### Storyline A — "Your agent already writes the code. Now it holds the bar."

The transformation arc, straight from Total TypeScript's playbook. The reader is an engineer or designer whose agent ships fast but ships slop.

1. **Hook (first viewport):** a live or animated before/after — the `SlopCompare` mechanism promoted to the hero. One line over it: what your agent ships today vs. what it ships with the harness. Technique: TT's status-promise + impeccable's "demonstrate the mechanism immediately"; the page's one authored motion moment lives here.
2. **Problem, named specifically:** three or four exact failures agents produce (gradient text, nested cards, buzzword copy — the catalog's own SLP anti-references, PRODUCT.md). Technique: TT's "fighting TypeScript" specificity — the reader recognizes their own PR.
3. **Promise:** "intent without loss" (copy already exists in page.tsx line 150–152) — what you mean is written down first; every phase after is graded against it. Short, second person.
4. **Proof — the mechanism dramatized:** the five-phase loop shown as one worked example (one real intent flowing through Intent → Diverge → Plan gate → Implement → Verify, with the evaluator's verdict at the end), not a labeled list. Technique: TT's methodology section; impeccable's "prove, don't claim."
5. **Path + CTA:** two commands, then `/dx`. Skills grouped by moment-of-need ("when you're designing / when you're shipping / when you're reviewing") instead of two flat lists — TT's progressive-workshop framing.
6. **Close:** "No command line?" + link to the standard. A real close, not a fade-out (impeccable: "the page ends anchored by a real close").

### Storyline B — "The standard that travels with the agent."

Artifact-first: the catalog is the protagonist; the plugin is how it moves. Fits the docs-site audience (PRODUCT.md: "they arrive mid-task and want an answer, not a brochure").

1. **Hook:** one real control, full anatomy, rendered beautifully — ID, check, pass/fail example — with the line: there are 70 of these, and your agent can read every one. Technique: impeccable's "specifics a competitor could not copy-paste"; code/spec sample as design element (TT's exercise screenshots).
2. **Problem:** design standards die in PDFs and Figma files agents can't read; every review re-litigates the same arguments. (PRODUCT.md: "principles that settle arguments.")
3. **Promise:** machine-checkable, human-waivable, one prefix — the standard rides inside the plugin, so "any repo you open holds the same bar" (existing copy, page.tsx line 181).
4. **Proof:** the evaluator's independence ("never grades its own work") shown as an actual graded verdict; then `SlopCompare` as the outcome.
5. **Path + CTA:** install commands; `/llms.txt` and `catalog.yaml` for the agent audience — a deliberate second CTA for the machine reader, which no comparator site has and only this product can offer.
6. **Close:** the TFX Design Standard link — the landing hands off to Read mode.

### Storyline C — "Twenty-one skills, one voice." (personal/team register)

The mattpocock.com register scaled up: warm, first-person-plural, short. Fits "Kind Utility... like a knowledgeable colleague" (PRODUCT.md) and differentiates hardest from the Grafana look.

1. **Hook:** a plain, warm claim in two sentences — we built the harness we needed so our own agents would stop shipping slop; you can install it in two commands. (mattpocock.com's whole-page-as-introduction move.)
2. **Problem/promise fused:** one short paragraph — agentic development moved the bottleneck from writing code to holding quality; the harness is quality as an installable artifact.
3. **Proof:** one worked session, told as a story — a real prompt, the plan gate stopping for approval, the evaluator's verdict. Prose + one screenshot, not a diagram. (TT's "like a 1 on 1 with Matt" intimacy.)
4. **Path:** skills introduced by voice ("`/dx-critique` when you want honesty, `/dx-polish` before you ship") — each line a transformation, not a definition.
5. **CTA + close:** install block, `/dx`, no-CLI path, standard link.

### Recommendation

**A** is the strongest storyline-first redesign: it has the clearest arc, promotes the page's best existing proof asset (`SlopCompare`) to the position impeccable demands, and needs no new product claims. **B** is the best fit if the redesign must serve the mid-task/agent audience first. **C** is the cheapest to write but risks under-selling the mechanism. A hybrid A-with-B's-control-anatomy-as-proof-section is viable. Whichever wins, the fixes are constant: add a problem section, move proof above the catalog, kill the two flat lists in favor of grouped one-line transformations, and stop hiding the strongest claims in `aria-hidden` tape strips.

---

## Sources

- https://www.mattpocock.com (fetched 2026-08-06)
- https://www.totaltypescript.com (fetched 2026-08-06)
- `/Users/rezailmi/.claude/skills/impeccable/SKILL.md`, `reference/new-work.md`, `reference/craft-floor.md`
- Repo: `app/(landing)/page.tsx`, `DESIGN.md`, `PRODUCT.md`, `README.md`, `review/agent-patterns.md`, `content/research/research-brief.mdx`
