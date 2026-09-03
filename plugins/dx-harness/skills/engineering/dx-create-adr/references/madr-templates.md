# MADR templates

Two variants of the MADR 4.0.0 template. Step 6 of `SKILL.md` chooses between them
and fills one in. Copy the variant, replace every angle-bracket placeholder, and
delete no headings: a section with nothing to say gets `N/A` and a one-line reason.

Both variants share the same frontmatter. Every field is optional in MADR itself,
but `status` and `date` are required here, because a record without them cannot be
read as current or historic later.

```yaml
---
status: proposed | accepted | rejected | deprecated | superseded by ADR-NNNN
date: YYYY-MM-DD
decision-makers: <names, or N/A>
consulted: <names, or N/A>
informed: <names, or N/A>
---
```

Use `proposed` when the decision still needs someone's agreement, and `accepted`
when it is already in force. Ask which one applies rather than defaulting, because
guessing `accepted` on a proposal makes the record read as settled to everyone who
finds it later.

## Minimal

Use this when the decision has few options and a rationale that fits in a
paragraph. Most records are this shape.

```markdown
# <Short title naming the decision, not the problem>

## Context and Problem Statement

<What forced a decision. Two to four sentences. State the constraint that made the
status quo untenable, so a reader can tell whether it still holds.>

## Considered Options

- <Option 1>
- <Option 2>

## Decision Outcome

Chosen option: "<option>", because <the reason that decided it>.

<What follows from this: what becomes easier, what becomes harder, and what a
future change would have to undo.>
```

## Full

Use this when the decision has several options, a migration cost, or consequences
worth separating from the rationale.

```markdown
# <Short title naming the decision, not the problem>

## Context and Problem Statement

<What forced a decision, and the constraint that made the status quo untenable.>

## Decision Drivers

- <The thing that mattered most>
- <The next thing>

## Considered Options

- <Option 1>
- <Option 2>
- <Option 3>

## Decision Outcome

Chosen option: "<option>", because <the reason that decided it>.

### Consequences

- Good, because <what this makes easier>
- Bad, because <what this makes harder, or what it costs to undo>

### Confirmation

<How anyone checks the decision is actually in force: a test, a lint rule, a
check in CI, or a named review step. Write "N/A" and say why if nothing enforces
it, because an unenforced decision drifts and the record should admit that.>

## Pros and Cons of the Options

### <Option 1>

- Good, because <reason>
- Bad, because <reason>

### <Option 2>

- Good, because <reason>
- Bad, because <reason>

## More Information

<Links to the discussion, the spike, the benchmark, or the issue. Write "N/A" if
there is nothing to point at.>
```

## Writing the body

- Name the decision in the title, not the problem. "Use Postgres for the write
  model" beats "Database choice", because a directory listing is how people find a
  record and a listing of problems tells nobody what was decided.
- Write the context so it can expire. A reader two years out needs to know whether
  the constraint still holds, and cannot tell that from a description of the
  solution.
- Record the options that were genuinely considered. A single-option record is a
  note, not a decision, and it hides the fact that nobody weighed an alternative.
- Do not use em dashes. Use colons, parentheses, or separate sentences.
