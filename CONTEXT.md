# dx-harness

A Claude Code plugin of design and engineering skills that help agents ship frontend work a designer would sign off on.

## Language

**Orchestrator**:
The `dx-design` skill that talks to the person first, works out what they want, and hands the work to the right specialist skill.
_Avoid_: Router, dispatcher, dx-start

**Pass**:
A single-dimension review skill (copy, motion, flow, pattern, polish) that proposes up to five ranked findings in its dimension, records them on the surface's design ticket, and hands accepted ones to dx-design-make to build. A pass never edits the product itself.
_Avoid_: Audit, sweep, review-and-fix

**Pattern inventory**:
The named UI patterns (list, cards, master-detail, wizard, empty state) and when each fits — guidance kept beside the control catalogue, never controls themselves; a control always wins on conflict.
_Avoid_: Pattern library, pattern catalogue

**Plan approval**:
The point where a run stops, shows the person its plan, and waits for their OK before building. An explicit ask to build a specific plan or chosen direction already counts as approval.
_Avoid_: Plan gate, gate, sign-off

**Diverge**:
The step where dx-design-make presents 2–3 genuinely different design directions for the person to choose between, rendered as HTML pages.
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

**Source-of-truth election**:
The human's choice, during a dx-design-language session, of which evidence source — code, Figma, or a hybrid split per part — seeds DESIGN.md's decisions when sources disagree. Guides elicitation only; code stays the runtime authority, and fix-todos bring it in line with the elected source.
_Avoid_: Precedence override, truth source
