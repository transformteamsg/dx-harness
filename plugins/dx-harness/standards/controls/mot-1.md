---
id: MOT-1
source: DX-DS
title: Interface motion is 100-300ms with standard easing; no decorative motion on critical paths
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [page, component]
verify: "Animation durations in 100-300ms with standard easing; none on critical paths beyond functional feedback"
waiver: rationale
enforced: partial
script: checks/motion-scan.py
fails_when:
  - animations over 300ms on task flows
  - transition-all
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Interface motion runs between 100ms and 300ms with standard easing. Below 100ms a
transition reads as a jump; above 300ms it reads as a wait. Standard easing means an
ease-out or ease-in-out curve — never bounce or elastic, which SLP-8 forbids outright.

On a critical path — the steps a user takes to complete a task — motion is limited to
functional feedback: a state change, a control responding, a surface arriving. Decorative
motion belongs elsewhere.

`transition-all` is always a finding. It animates every property that happens to change,
including layout properties that cannot be animated cheaply, and it makes the set of
animated properties impossible to reason about.

## Rationale

Motion on a task flow is a cost paid by every user on every repetition. A 500ms reveal is
pleasant once and an obstacle the fiftieth time, and the people using these surfaces are
using them all day. The 100-300ms band is where a transition is fast enough to feel like
a response and slow enough to be followed.

The boundary with the neighbouring motion controls: MOT-1 bounds *where* motion may run
and *how long*; MOT-2 bounds *where its values come from*; MOT-3 bounds *what it may
carry*. A11Y-5 requires a reduced-motion variant to exist, which is a separate obligation
from any of the three.

## Why this is hybrid

**Static-check half.** Durations, easing functions, and `transition-all` are literal
values in stylesheets and component source, and finding those that fall outside the band
is mechanical. That half is built in #157 as `checks/motion-scan.py`.

**Judgment half.** "Critical path" and "decorative" are not properties of the source. A
300ms transition is legal by the band and still wrong if it sits between two steps of a
form a user completes forty times a day, and a longer duration can be right on a
first-run surface nobody repeats. Deciding which flows are critical, and which motion is
functional feedback rather than decoration, is the evaluator's.

## Passes when

- Interface transitions land between 100ms and 300ms.
- Easing is a standard ease-out or ease-in-out curve.
- Motion on task flows is limited to functional feedback.
- Transitions name the properties they animate.

## Fails when

- A transition on a task flow runs longer than 300ms.
- `transition-all` appears anywhere in product UI.
- Decorative motion — a reveal, a parallax, an ambient loop — runs on a critical path.

## Evaluator guidance

**Flag**:

- Durations outside the 100-300ms band on interface elements.
- `transition-all`, without exception.
- Decorative motion on a surface a user passes through repeatedly to finish a task.

**Do not flag**:

- Narrative or marketing surfaces that are not task flows, where longer motion is a
  deliberate choice with a recorded rationale.
- Loading and progress indicators, whose duration is set by the work rather than by the
  designer.
- Motion whose value comes from the declared motion token set — MOT-2 governs that
  question, and a token-sourced duration still has to sit inside this band.
- A recorded rationale for a duration outside the band — this is an L2 control with
  `waiver: rationale`.
