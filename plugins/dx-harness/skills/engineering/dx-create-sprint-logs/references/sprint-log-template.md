# Sprint log template

One log per workstream per sprint. Fill every field. A field with nothing in it
takes `None`, which is a finished answer.

Adapted from the [sprint handover audit logging template](https://ones.com/blog/sprint-handover-audit-logging-checklist-template/)
by ones.com, which logs a single handover event. A sprint is a handover too: one
squad hands a workstream to whoever holds it next, and the same twelve fields
apply once the work items become tables.

---

## Header

| Field | Entry |
|---|---|
| Log ID | `SL-<workstream>-<YYYY-MM-DD>` |
| Sprint | `<start> to <end>`, ISO 8601 dates |
| Workstream | Name, and a link to its repository |
| Squad | The squad that held it |
| Sprint goal | One sentence, copied from Sprint Planning |
| Goal met | `Yes`, `No`, or `Partly`, then one clause saying which part |
| Next holder | The squad that picks the workstream up, or `Unassigned` |

## Delivered

One row per item that closed. Nothing else belongs here.

| Item | Link | Points |
|---|---|---|
| What it delivers, one clause | Issue and PR | `sp:N`, or `unpointed` |

## Carried over

One row per item that did not close. The reason is one clause. If the reason
needs a paragraph, it belongs on the issue.

| Item | Link | Committed at planning? | Reason | Re-estimate? |
|---|---|---|---|---|
| One clause | Issue | `Yes` or `Raised mid-sprint` | One clause | `Yes` or `No`, and why not |

## Decisions

One row per decision taken this sprint. **The reasoning lives in the decision
record, not here.** A row with no link is a decision nobody wrote down: write it
down, then link it.

| Decision | Record | Approver |
|---|---|---|
| What was decided, one clause | Link to the decision record or the issue thread | Who approved it |

## Risks handed over

One row per risk the next holder inherits. Every risk has an owner and an issue.
A risk that exists only in this log is not tracked.

| Risk | Issue | Owner |
|---|---|---|
| What goes wrong, and to whom, one clause | Link | Named person or squad |

---

## Field mapping

For anyone checking this against the source template.

| Source field | Here |
|---|---|
| Log ID | Header, Log ID |
| Date & Time | Header, Sprint |
| Sprint / Iteration | Header, Sprint |
| Handover Type | Header, Workstream |
| From Team / Owner | Header, Squad |
| To Team / Owner | Header, Next holder |
| Work Items Transferred | Delivered, and Carried over |
| Carry-Over Reason | Carried over, Reason |
| Key Decisions | Decisions |
| Impediments / Risks | Risks handed over |
| Sign-off | **Dropped.** There is no formal sign-off process to record |
| Permanent Audit Link | **Dropped.** The log's own path in the repository is the permanent link |

## Frontmatter

This template covers the body. Where the product repository has its own
frontmatter convention, that convention wins and this template says nothing about
it. Follow the repository, and never invent a second schema beside one that a
check already enforces.
