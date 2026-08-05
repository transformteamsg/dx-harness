# Focused pass — shared procedure

The five focused passes (`copy`, `polish`, `motion`, `flow`, `layout`) run this one
procedure, each scoped to its own dimension. A pass is a small loop, not a lawless
edit: it still captures the surface, still stops at the plan gate, and still verifies.
The pass SKILL.md that sent you here names the dimension's control-id subset and its
reference files — read those first; everything below is the shared shape.

Brand essence is **Kind Utility** — useful first, kind at the surface. You never propose
a change before you have seen and judged the current state, and you never restyle a
deliberate choice without asking.

## Run it

1. **Capture the surface.** Same mechanism order as `critique.md` (beside this file) —
   read its step 1 and follow it; do not fabricate what the page looks like. A pass that
   changes responsive behaviour captures 360 too.
2. **Load only your slice.** Load the pass's control-id subset (named in the SKILL.md
   that sent you here) from `../../../standards/catalog.yaml`, read each control's
   `detail` file when it has one, and load the pass's named reference files — nothing
   wider. The dimension is the boundary; the catalog ids are the rules.
3. **Findings, then up to five ranked suggestions — inside the dimension only.**
   Ground each in the captured surface. Rank by impact on the teacher's task; note cost
   (S/M) and the control or pattern each serves. Anything you notice **outside** the
   dimension is NOTED and routed, never fixed here — "the spacing rhythm is a `layout`
   matter", "that wording is a `copy` matter". Suggestions are offers, not a plan.
4. **Plan gate — the user approves before any edit.** Present the findings and the
   ranked suggestions, then stop for the user to pick. Unpicked suggestions are recorded
   as "considered", never silently dropped. A pass never bypasses this gate.
5. **Implement, then verify.** Build only the accepted suggestions, then run
   `../design/verify.md` (beside the design skill) in order — a scoped pass still proves
   its changed surface. Report a `checks/`-backed control as "verified manually" or
   "could not verify mechanically" whenever no script ran; never as "passed".

## L0 is never scoped out

The four non-negotiables — AA contrast (A11Y-1), keyboard reach with visible focus
(A11Y-2), a visible label on every field (A11Y-3), destructive actions show consequences
and offer undo or confirm (CMP-2) — bind every pass regardless of dimension. A contrast
failure surfaces even in a `motion` pass. When you hit one, either fix it in this pass
(and say so) or route it explicitly — you may never let an L0 failure stand because it
sat outside the dimension you were asked to work in.

Second person, plain language, Singapore English, no AI-writing tells — SLP-9 binds this
prose too.
