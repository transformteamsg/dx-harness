# MADR templates

Two variants of the MADR 4.0.0 template. Step 6 of `SKILL.md` chooses between them
and fills one in. Copy the variant, replace every angle-bracket placeholder, and
delete no headings: a section with nothing to say gets `N/A` and a one-line reason.

The frontmatter below is MADR's, tightened with three fields the Transform house
template (`ADR_TEMPLATE.md` in `transformteamsg/design-documents`) carries and stock
MADR does not: `authors`, `discussion`, and `supersedes`. Each closes a gap that
costs a reader something real. This skill also makes MADR's own `status` and `date`
required rather than optional.

## Frontmatter

Both variants share this block. MADR treats every field as optional; this skill does
not. `status`, `date`, `authors`, and `discussion` are required on every record.

```yaml
---
status: accepted
date: YYYY-MM-DD
authors:                          # who WROTE the record, not who decided
  - Name / [@handle](https://github.com/handle)
decision-makers: <names, or N/A>  # who settled it; often not the authors
discussion: <where this was argued>
supersedes: <ADR-NNNN, omitted when this record replaces nothing>
---
```

`authors` and `decision-makers` sit adjacent and sound alike, so fill them
separately. A record is often written up by one person after a group settled it, and
a reader with a question needs the writer rather than the room.

Fill `discussion` even when no RFC was raised: write what happened instead, such as
`settled in grooming on 2026-09-03; no RFC issue was raised`. Never reach for the
nearest issue to have something to link. A delivery ticket that does not hold the
argument looks like a trail and leads nowhere, which is worse than the plain
sentence.

### Status values

Exactly these five. Never invent a sixth.

| Status | Means |
| --- | --- |
| `proposed` | Written, not yet agreed. Use when the record itself is the thing under review. |
| `accepted` | In force. |
| `rejected` | Considered and turned down, kept so the reasoning is not repeated. |
| `deprecated` | No longer relevant, and not replaced. |
| `superseded by ADR-NNNN` | Replaced, with the replacement named. |

Ask which one applies rather than defaulting. Guessing `accepted` on a proposal makes
the record read as settled to everyone who finds it later. Where a house process
treats an open RFC issue as the proposal, `proposed` will rarely be right: the record
reaches the repository only once its RFC is accepted.

## Minimal

Use this when the decision has few options and a rationale that fits in a
paragraph. Most records are this shape.

```markdown
# NNNN Short title naming the decision, not the problem

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

## More Information

<Links to the spike, the benchmark, or the issue. Write "N/A" if there is nothing
to point at. The link to where the decision was argued belongs in the `discussion`
frontmatter field, not only here.>
```

## Full

Use this when the decision has several options, a migration cost, or consequences
worth separating from the rationale.

```markdown
# NNNN Short title naming the decision, not the problem

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

<Links to the spike, the benchmark, or the issue. The link to where the decision was
argued belongs in the `discussion` frontmatter field, not only here. Write "N/A" if
there is nothing further to point at.>
```

## Source material no heading covers

A source may carry material MADR has no section for: a diagram, worked examples, a
migration table. Do not drop it, and do not force it under a heading it does not
belong to. Give it a named section of its own, immediately before `More
Information`, collapsed:

```markdown
<details>
<summary>Worked examples</summary>

<the material>

</details>
```

Keep the blank lines above and below the content. Without them the markdown inside
does not render.

Collapse it because a reader opens a record for the decision, not the appendix. The
record stays scannable, and the material is one click away rather than lost.

## Writing the body

- Lead the title with the record number, then name the decision. `0002 Adopt the
  release-PR model for versioned images` beats `0002 Release strategy`, and beats an
  unnumbered title: a directory listing is how people find a record, a listing of
  topics tells nobody what was decided, and a record pasted into a chat or rendered
  without its filename still has to say which one it is.
- Write the context so it can expire. A reader two years out needs to know whether
  the constraint still holds, and cannot tell that from a description of the
  solution.
- Record the options that were genuinely considered. A single-option record is a
  note, not a decision, and it hides the fact that nobody weighed an alternative.
  Keep them here even when an RFC issue holds them too: the repository should not
  depend on a tracker staying reachable.
- Do not use em dashes. Use colons, parentheses, or separate sentences.
