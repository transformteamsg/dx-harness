# Seeded README

Step 2 of `SKILL.md` writes this file when it creates a new ADR directory. Copy it
verbatim, with one substitution: replace `<DIR>` with the directory that was
created.

Write it once, on the run that creates the directory. Never rewrite it on a later
run, because a team will edit it and an overwrite would throw that away.

---

```markdown
# Architecture decision records

This directory holds architecture decision records (ADRs): short documents that
say what was decided about this codebase, what else was considered, and why. Each
record is written once and never edited after it is accepted. A decision that
changes gets a new record that supersedes the old one, so the history stays
readable.

## Format

Records follow [MADR](https://adr.github.io/) 4.0.0.

Files are named `NNNN-title-with-dashes.md`, where `NNNN` is the next free number
in sequence. Numbers are never reused, including for a record that was rejected or
abandoned, because a reused number breaks every link written before the change.

Each record opens with frontmatter carrying at least a `status` and a `date`:

| Status | Means |
| --- | --- |
| `proposed` | Written, not yet agreed |
| `accepted` | In force |
| `rejected` | Considered and turned down, kept so the reasoning is not repeated |
| `deprecated` | No longer relevant, but not replaced |
| `superseded by ADR-NNNN` | Replaced, with the replacement named |

## Adding a record

Run the `dx-create-adr` skill. It picks the next number, chooses the template that
fits the weight of the decision, and checks the new decision against the records
already here.

To write one by hand instead, copy the shape of the most recent record, take the
next free number, and set `status` and `date`.

## What belongs here

A decision belongs here when it changes an interface, adds or removes a
dependency, or constrains what someone can do later. A change that does none of
those is better recorded in a commit message or a pull request description, where
it sits next to the code it explains.
```
