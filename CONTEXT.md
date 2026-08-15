# dx-harness

A Claude Code plugin of design and engineering skills that help agents ship frontend work a designer would sign off on.

## Language

**Orchestrator**:
The `dx-design` skill that talks to the person first, works out what they want, and hands the work to the right specialist skill.
_Avoid_: Router, dispatcher, dx-start

**Pass**:
A single-dimension review skill (copy, motion, flow, pattern, polish) that proposes up to five ranked findings in its dimension, records them on the surface's design ticket, and hands accepted ones to dx-design-execute to build. A pass never edits the product itself. A pass takes open-ended asks that name its dimension but not the exact edit; a stated edit goes to dx-design-execute (pattern swaps stay the pattern pass's even when stated as an edit).
_Avoid_: Audit, sweep, review-and-fix

**Pattern inventory**:
The named UI patterns (list, cards, master-detail, wizard, empty state) and when each fits — guidance kept beside the control catalogue, never controls themselves; a control always wins on conflict.
_Avoid_: Pattern library, pattern catalogue

**Plan approval**:
The point where a run stops, shows the person its plan, and waits for their OK before building. An explicit ask to build a specific plan or chosen direction already counts as approval.
_Avoid_: Plan gate, gate, sign-off

**Diverge**:
The step where dx-design-execute presents 2–3 genuinely different design directions for the person to choose between, rendered as HTML pages.
_Avoid_: Options phase, concept round

**Design ticket**:
A long-lived issue on the repo's tracker that holds one surface's design history; each run appends its record (approved plan, waivers, design review verdict) as a comment.
_Avoid_: Decision record, decision file

**Rule proposal**:
The only way the control catalogue grows: a real failure shows a gap, someone proposes a new control, and the design lead approves it by a small PR. Never from speculation.
_Avoid_: Ratchet, catalogue growth

**Standing override**:
A product-level deviation from a catalogue control, declared once in DESIGN.md's Overrides section rather than at each site. Never allowed for L0; L1 needs a named approver; L2 needs a reason.
_Avoid_: Overlay, exception, per-product rule

**Guardrails**:
Product-specific instructions an agent obeys verbatim, covering realities no catalogue control addresses. Live in DESIGN.md; never restate a control.
_Avoid_: Agent instructions, do's and don'ts

**Design review**:
The fresh-eyes check on finished design work, done by a design reviewer agent that did not watch the build. It proposes findings but never edits, and re-checks fixes from new screenshots — the builder's word is not evidence.
_Avoid_: Evaluator, verify phase, grading

**Design language**:
The small set of decisions that make a product itself — essence, colour, typography, motion signature, voice, guardrails — recorded in DESIGN.md, which never restates the catalogue.
_Avoid_: Brand guide, style guide, theme

**Branch guard**:
The branch-state check every design build runs before it implements: if the person is on main/master, or their branch is behind the remote default branch after a fetch, the run hands off to the git helper, which explains the risk in plain words and acts only after the person agrees.
_Avoid_: Branch check, git precheck

**Source-of-truth election**:
The human's choice, during a dx-design-language session, of which evidence source — code, Figma, or a hybrid split per part — seeds DESIGN.md's decisions when sources disagree. Guides elicitation only; code stays the runtime authority, and fix-todos bring it in line with the elected source.
_Avoid_: Precedence override, truth source

**Quality bar**:
The ceiling artifact kept beside the control catalogue: what good looks like once no control is broken. Four criteria — design quality, originality, craft, functionality — each graded strong / acceptable / weak, with every grade quoting the pairing or threshold that decided it. Read at plan, graded at design review; it never blocks — a miss is evidence for a grade, never a finding.
_Avoid_: Ceiling file, rubric, taste standard

**Register**:
A class of surface with its own idea of what good looks like, declared in the quality bar and selected once per product repo in DESIGN.md's Quality bar section; no declaration selects the default. A register may vary a criterion's By-surface rows and thresholds, never its pairings. Distinct from the tone register (IDN-3), which calibrates one product's voice.
_Avoid_: Surface class, surface register, mode

**Anchor**:
A pairing, a By-surface row, or a threshold in the quality bar — the piece of written calibration a grade quotes to justify itself. Anchors carry no ids on purpose: an id-shaped reference in a report would read as a control and send the reader to the catalogue to look for something that is not there. Cite one by quotation, never by handle.
_Avoid_: Criterion item, ceiling rule, quality control

**Static check**:
A deterministic check that reads source files only, run from harness-held config with nothing installed in the target repo.
_Avoid_: Tier 1, static pass, source scan

**Rendered check**:
A deterministic check that runs against the open page during verify, or against a URL the person supplies; the harness never boots the target app to get one. A control whose rendered check did not run falls back to manual verification — it never silently passes.
_Avoid_: Tier 2, rendered pass, rendered-DOM tier

**Accepted gap**:
A control nobody checks by machine, on purpose — recorded on the control itself with a one-line reason. An accepted gap is the only thing that makes an unchecked deterministic or hybrid control legal; without one the catalogue is in error. An L0 control can never hold one.
_Avoid_: Known gap, TODO, planned script, honest gap

**Honest-inert**:
A check that ships and reports N/A until the thing it reads is declared, rather than passing silently or waiting to be written. The N/A is the honest answer: nothing was checked because nothing was declared. Distinct from an accepted gap, where no check exists at all.
_Avoid_: No-op check, stub check, inert pass
