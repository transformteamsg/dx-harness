# Surface assessment (shared procedure)

[issue-contract.md](issue-contract.md) runs this to decide which surfaces an
issue's work touches.

## The values

The assessment takes one of four values and nothing else:

| Value | The work touches |
| --- | --- |
| `frontend` | A surface a person sees or operates: markup, styles, component state, or the copy inside it |
| `backend` | A data or service layer: a schema, a query, an endpoint, a scheduled job, or a rule that runs away from the browser |
| `both` | One of each, where the criteria need both to be observable |
| `neither` | No product surface: tooling, a check, a shared procedure, or documentation |

`neither` is a real answer. Forcing work that touches no product surface into
`frontend` or `backend` makes the assessment state something false.

## How to derive it

Read the acceptance criteria one at a time and ask what the criterion makes
observable. The surface that has to change before a reader observes it is the
surface that item touches. The issue's assessment is the union of its items.

Derive it from the criteria, not from the issue's title, its labels, or the
directory names in the repository.

Two readings settle most items:

- **A criterion someone confirms by looking at a screen** touches the frontend. Where the value on that screen has to change too, the item touches both.
- **A criterion about stored data, a response, a permission, or a rule** touches the backend. It reaches the frontend only where a criterion also names what a person sees.

State the assessment once, with the item numbers behind it:

```
Surface assessment, contract #<issue>: <value>
  <item number> <what the criterion makes observable> -> <value>
```

## What the assessment changes

- **`frontend`**: plan no backend work, and leave the data and service layers alone. Say what the run would have needed from the backend if the criteria had implied any, so the next reader tells a deliberate boundary from an oversight.
- **`backend`**: plan no frontend work, and say the same thing in the other direction.
- **`both`**: read the next section.
- **`neither`**: plan against the tooling or the document the criteria name, and do not go looking for a product surface to change.

## When the work touches both

Say so in the plan. Then take one of two outcomes, and there is no third.

1. **Sequence them in one branch.** Build the backend item first, then the frontend item that observes it, and commit each against its own contract item.
2. **Stop and ask.** Where the two halves are large enough to review separately, or where one of them is blocked, name the split you would make and leave the choice to the developer. `dx-split-issue` cuts the issue where the answer is two issues.

Never report a criterion as met when only one of its two surfaces is built.
A criterion needing both is unsatisfied until both are there, and the half that
exists is worth naming as what is done rather than as what was asked for.

## When the criteria do not say

Some criteria name an outcome without naming a surface, because the reading turns
on facts the issue does not carry.

Name what is ambiguous, give the readings you can see, and ask. Put the item
number in front, name each reading as a surface, and end on the question:

> "Criterion <n>, '<the criterion>', reads two ways. As a frontend item it is
> <reading>. As a backend item it is <reading>. Which is it?"

Stop there. One surface can make it observable under one reading and not under
the other, so a run that picks a reading builds against a criterion nobody
agreed to.
