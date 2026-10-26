# Phase 2: Diverge

Produce 2–3 clearly different directions and render each one as a real,
self-contained HTML page, so the person picks between things they can see, not
descriptions. Skip diverge only when the structure is fixed (the modification entry
in `../SKILL.md`) or the ask names a chosen direction.

**Rendering and hosting.** Each direction is one self-contained HTML file: inline
CSS, no external requests, honest content (the real headings and copy from Phase 1,
not lorem ipsum). In Claude Code, publish the pages as Claude Artifacts; they open
in the browser automatically. In a harness without artifact publishing, write the
HTML files locally and open them in the browser (`open <file>` on macOS, or the
platform equivalent). In a headless or unattended run where no browser can open,
print the file paths or artifact URLs and ask for the pick; NEVER silently choose a
direction yourself.

**The accompanying summary.** Beside the rendered pages, give each direction a short
text summary: layout structure, which existing components it composes, how the flow
splits across steps, a one-line **visual thesis** (the mood and energy it carries,
stated as an extension of the product's existing system, never an invented new
aesthetic), and one sentence on the trade-off.

**The pick is the contract.** Record the chosen direction on the surface's design
ticket run record (`../../../../procedures/design-tickets.md`); the design review
audits the built result against it.

Use the product's component manifest
(`.dx/component-manifest.json`, filtered to `status: "stable"` entries) —
options may only compose components that exist in the manifest (CMP-1 applies from
here on). If the product has no manifest yet, fall back to the v0-limit procedure
in CMP-1's `--for review` part and note "asserted, no manifest".
Progressive disclosure is the default pattern: show the core path, reveal complexity
on demand. Three anti-slop controls bind at this altitude: a complex multi-section
task gets a page, never a modal (SLP-10) — if an option puts tabs, columns, or its
own scrolling inside a dialog, it is not an option; a grid of identical cards is
not a default layout (SLP-5) — structure should come from the task's hierarchy, not
a template; and a card is only for an interactive unit (SLP-11) — if an option boxes
static content in card chrome where spacing, type, and a divider would group it, that
is a finding, not a layout. Two lenses bind here too: simplicity is not minimalism (HIG: Simplicity) —
keep the important things close and let the rest fall away, never hide what the task
needs; and keep the teacher free to move (HIG: Agency) — an option that locks people
into a guided flow or mode must make it easy to skip or escape.

**Compose, don't fill.** Treat the first screen as a composition, not a container to
pack: one clear focal point — the teacher's primary task and its single primary action
(CMP-5) — with related content grouped by proximity and a shared region rather than
boxed in cards (SLP-11), and everything else stepped down so hierarchy does the
explaining (SLP-6). Each option's layout is graded at verify against LAY-3 (does it fit
a known page template for its type?), LAY-5 (does its density fit the task?), LAY-6
(do shared edges align?), and LAY-7 (one primary focal region; does the visual reading
order match the task's priority order — the squint test) — design to them now, not as
a cleanup pass.

Output: the rendered direction pages plus their summaries, with a recommendation.
The user picks; the pick becomes the contract above.
