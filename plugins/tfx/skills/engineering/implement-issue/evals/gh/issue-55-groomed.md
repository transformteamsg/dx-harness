## User story

As a teacher, I want submissions after the due date to be flagged as late, so that I can see at a glance who missed the deadline.

## Background

Teachers currently compare timestamps by hand. Support sees roughly 15 tickets a month about submissions that should have been marked late.

## Acceptance criteria

### Submission before the due date is marked on time

- **Given** an assignment with a due date in the future
- **When** a student submits
- **Then** the submission is recorded as on time

### Submission after the due date is marked late

- **Given** an assignment whose due date has passed
- **When** a student submits
- **Then** the submission is recorded as late

## Out of scope

- Notifying students that their submission was late
- Any grade penalty for lateness

## Design assets

N/A

## Grooming checklist

- [x] API contract filled or N/A confirmed
- [x] Data model filled or N/A confirmed
- [x] Patterns to follow named

---

## Technical context

Implementation lives in `src/submissions.js`. Follow the validation and error style already used in `src/assignments.js`: guard clauses at the top of the function, thrown `Error` with a plain message.

## Data model

Extend the submission record with one field:

- `isLate` (boolean, required, defaults to false) - true when `submittedAt` is strictly after the assignment's `dueAt`.

## API contract

N/A. This change is internal to the submission recording function; no HTTP surface changes.

## Error contract

N/A. No new error cases; an assignment with no `dueAt` records `isLate` as false.

## Additional test scenarios

### Submission exactly at the due date is on time

- **Given** an assignment whose due date is exactly the submission time
- **When** a student submits
- **Then** the submission is recorded as on time (the boundary is inclusive)

## Hard constraints

- Do not add any new npm dependency; use the standard library only.
- Do not change the signature of `listAssignments`.

---

*🤖 Generated with create-issue*
*🤖 Groomed with groom-issue*
