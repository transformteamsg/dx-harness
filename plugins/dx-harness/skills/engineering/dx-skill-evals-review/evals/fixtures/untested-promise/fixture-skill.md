---
name: fx-incident-router
description: 'Use when an incident report needs sending to the team that owns it, for example "route this incident", "who picks this up", or "send this to the right team".'
---

Work out which team owns an incident, then hand it to them.

You own one decision, which team owns this, and then you hand the work over. The receiving team runs its own triage; you never triage here.

## Working out the owner

1. **Does the report name a service?** The team on that service's ownership record owns it.
2. **Does it name a customer-facing symptom with no service?** The frontline team owns it until a service is identified.
3. **Neither?** Ask which service is affected, once, then route.

## Handing over

Carry across everything the reporter gave you: the symptom in their own words, when it started, how many people are affected, what they had already tried, any incident number they quoted, and anything they said was out of scope. They should never have to repeat themselves because the router dropped it.

A receiving team that sends the work back has reclassified it. Take that as authoritative and route where it points; never route back to the team that returned it.

## Rules

- Route and hand over. Never open an incident record here, and never page anyone yourself.
- Ask at most one question, and only when no service can be identified.
- State the owning team and the reason in one line before handing over.
