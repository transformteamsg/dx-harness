---
id: TOK-1
source: TFX-DS
title: UI code contains no raw colour values — semantic (shadcn) tokens only
tier: L1
check: deterministic
phase: [implement, verify]
applies_to: [page, component]
verify: "Scan changed files for raw hex/rgb/hsl; checks/token-audit; exit 1 on violation"
waiver: documented
enforced: script
script: checks/token-audit.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Reference colour only through semantic shadcn tokens. No raw hex, rgb, hsl, or named
colours in UI code. Functional colours (success/warning/danger/info) resolve to Radix
Colors scales (COL-2); brand moments resolve to Teacher & School Blue or its ramp
(COL-1) — through tokens, not literals.

## Rationale

This is the control that stops inter-session drift — the "new blue" problem, where
each generation invents a slightly different value and inconsistency compounds
silently. The stack is deliberately boring and AI-legible (Base UI + Radix +
shadcn defaults): every deviation we don't make is consistency we get for free, and a
vocabulary agents already know.

## Passes when

- All colour in changed files resolves through the token layer
  (`var(--...)` / token-mapped utility classes).
- A genuinely missing token is raised as a finding in the plan, not improvised inline.

## Fails when

- A literal like `#0064FF`, `rgb(37, 99, 235)`, or `slate-ish` custom values appear in
  component code — even when the value happens to equal a token.
- Tailwind palette utilities bypass the semantic layer (`bg-blue-600` instead of the
  mapped semantic class/variable).
- Functional states use ad-hoc greens/reds instead of Radix scale tokens.

## How to verify

`checks/token-audit` (planned): scan changed files for raw colour patterns; exit 1
with file/line and the nearest token suggestion. Until then, grep changed files
manually and label the result "verified manually". Waiver: `documented` — named
approver in the decision record (e.g. a marketing surface intentionally outside the
product token set).
