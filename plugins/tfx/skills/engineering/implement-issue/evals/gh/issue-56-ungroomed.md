## User story

As a teacher, I want to reorder assignments in a course, so that the list matches the teaching sequence.

## Background

Assignments currently sort by creation date, which rarely matches how they are taught.

## Acceptance criteria

### Assignment order is saved

- **Given** a teacher is viewing a course's assignment list
- **When** they drag an assignment to a new position and the change is saved
- **Then** the list keeps that order on reload

### Reordering is rejected for an assignment in another course

- **Given** an assignment that belongs to a different course
- **When** a reorder is attempted against this course
- **Then** the reorder is rejected and the order is unchanged

## Out of scope

- Reordering across courses
- Bulk reordering by import

## Design assets

N/A

## Grooming checklist

- [ ] API contract filled or N/A confirmed
- [ ] Data model filled or N/A confirmed
- [ ] Patterns to follow named

---

## Technical context

_Pending grooming._

## Data model

_Pending grooming._

## API contract

_Pending grooming._

## Error contract

_Pending grooming._

## Additional test scenarios

_Pending grooming._

## Hard constraints

_Pending grooming._

---

*🤖 Generated with create-issue*
