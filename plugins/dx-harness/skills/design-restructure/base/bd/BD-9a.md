---
code: BD-9a
dss: BD-9
tier: L1
check: lint
surface: project
engine: custom
parameters:
  channels: ["mailto:", "tel:", "contact page", "contact form"]
---

# BD-9a: at least one contact channel exists

## Statement

The service provides at least one contact channel for help or assistance.

## Check

Fails when no page has a link or form that matches an entry in `channels`: a `mailto:` link, a `tel:` link, a link to a contact page, or a contact form.

## Recommendations

- Provide contact channels such as a phone number, email, a contact form, or live chat.
- Link to the contact channels in the footer. Control TL-4 requires this.
- Place help and support in a consistent position across pages. Control WU-9 requires this.

## Not required for

None listed.

## Rationale

Users who cannot finish a task need a way to ask for help. `BD-9b` judges whether the channel serves them.
