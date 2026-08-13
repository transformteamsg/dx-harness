# Design tickets (shared procedure)

Design work is recorded on the tracker, one long-lived ticket per surface, so any
run can read the surface's history and append to it.

## The ticket

- **One long-lived issue per surface** (page or flow). Title: `Design: <surface>`,
  where `<surface>` is the route path (`/marks`) or the flow name
  (`marks entry wizard`). Label: `design`.
- **The first run that touches the surface creates the ticket** (the builder, a
  pass, or critique). Later runs find it by label + title match. Sub-issues are only
  for genuinely separate work items.
- `dx-design-setup` checks and wires the tracker. It uses the repo's issue-tracker
  doc where one exists. A repo without a tracker falls back to local markdown
  (below).

## Comment formats

Every comment opens with a typed heading, so agents can parse the history:

- **Run record** — `## Run — <date> — <skill>`. It holds: the approved plan (or
  "explicit build ask — counted as approval"); the waivers granted this run (plain
  title + id, tier, reason, approver for L1); the design review verdict with the fix
  re-checks (resolved / partial / unresolved); a link to the commit or PR.
- **Findings** — `## Findings — <date> — <pass or critique>`. A ranked list, up to
  five for a pass. Each finding is named plain-title-first where a control applies
  (`catalogue-mechanics.md`, beside this file). Each is marked `accepted` /
  `not accepted` when the human responds; nothing is silently dropped. An accepted
  finding links to the run record of the build run that built it.
- **Waiver record** — `## Waiver — <date>`. The orchestrator's rule-question route
  writes this when a waiver is approved outside a run. Same fields as run-record
  waivers.

## Related issues (not on the design ticket)

- **Deferred DESIGN.md section** (from the design-language skill): one issue per
  skipped section. Title: `DESIGN.md: <section>`. Label: `design-language-todo`. The
  body carries that section's guiding questions.
- **Fix-todo** (code catch-up after a source-of-truth election): title
  `Design fix: <what>`, label `design-fix-todo`. The body cites the elected source
  and the code it beats.

## Local-markdown fallback

No tracker: one file per surface, `docs/design-tickets/<surface-slug>.md` in the
product repo. The same typed blocks are appended in time order. Deferred sections
and fix-todos append to `docs/design-tickets/TODO.md` as checklist items with the
same titles.
