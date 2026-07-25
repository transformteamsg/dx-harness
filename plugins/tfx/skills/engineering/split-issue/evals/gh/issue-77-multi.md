## User story

As a school administrator, I want to manage the teaching roster and export attendance reports, so that staffing and compliance reporting are both handled in the admin console.

## Background

The admin console is being consolidated. Two long-standing manual processes are moving into it: assigning teachers to classes, and producing the termly attendance export the ministry requires. Both were requested in the same planning round. Spec: https://example.com/specs/admin-console

## Acceptance criteria

### Teacher is assigned to a class

- **Given** an administrator is viewing a class with no assigned teacher
- **When** they select a teacher and save
- **Then** the teacher appears as that class's assigned teacher

### Teacher assignment is rejected when the teacher is at capacity

- **Given** a teacher is already assigned to the maximum number of classes
- **When** an administrator tries to assign them to another class
- **Then** the assignment is rejected and an error explains the capacity limit

### Attendance report is exported as CSV

- **Given** an administrator is viewing the attendance page for a term
- **When** they request an export
- **Then** a CSV of per-student attendance for that term is downloaded

### Attendance export is rejected for a term with no records

- **Given** a term that has no attendance records
- **When** an administrator requests an export
- **Then** no file is produced and a message explains there is nothing to export

## Out of scope

- Bulk teacher import from CSV
- Scheduled or emailed report delivery

## Design assets

https://figma.com/file/example/admin-console

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
