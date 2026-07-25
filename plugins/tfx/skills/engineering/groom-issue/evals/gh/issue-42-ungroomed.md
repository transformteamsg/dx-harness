## User story

As a teacher, I want to set a due date on an assignment, so that students see a deadline and late submissions are flagged.

## Background

Teachers currently track deadlines in a separate spreadsheet, which drifts out of sync with the assignment list. Support sees roughly 15 tickets a month from teachers asking why a submission was not marked late. Spec: https://example.com/specs/due-dates

## Acceptance criteria

### Due date is saved on an assignment

- **Given** a teacher is editing an assignment
- **When** they set a due date and save
- **Then** the due date is stored and shown on the assignment list

### Due date in the past is rejected

- **Given** a teacher is editing an assignment
- **When** they set a due date earlier than the current time and save
- **Then** the assignment is not saved and an error explains the due date must be in the future

## Out of scope

- Timezone selection per course (assume the course timezone)
- Notifying students when a due date changes

## Design assets

https://figma.com/file/example/due-dates

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
