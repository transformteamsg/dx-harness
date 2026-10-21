---
name: dx-design-research-brief
description: 'Build a user research plan or research brief for any study: generative, evaluative, or hybrid. Use when someone needs to plan a research project, write a research plan, create a research brief, document study goals and methodology, align stakeholders on a study, or structure a new research request. Triggers include "write me a research plan", "help me plan this study", "I need a research brief", "create a research plan for", "we''re starting a new research project", "how do I structure this research request", and "help me document this study".'
---

# Research plan builder

Write a research plan with 12 components, in a fixed order, from what the requester
tells you.

## 1. Collect the inputs

From the request and the conversation, find the research request, the business and user
problems, the research goal, the stakeholders, what is already known, and the timeline.

Check these in order and take the first that fits:

- The request names what the team needs to learn ("learn how supervisors decide on overtime") -> Step 2
- The request names no research goal, or names only a business metric ("sign-ups dropped 18%") -> ask for the goal and the missing inputs, then stop. Write no part of the plan until the goal comes back

A business metric is not a research goal. Put the questions in Step 2 in the message that asks for the goal. Where the inputs must come from a stakeholder outside the conversation ("leadership wants research on it"), add the form in [references/intake.md](references/intake.md).

Where the request names the goal, ask nothing more. Write `[To confirm]` where an input is missing.

## 2. Separate the business problem from the user problem

Translate the business problem into a user problem with these questions:

- Is this a customer problem?
- Could a technical issue cause this instead?
- Why would customers care about this?
- How could this affect customers?
- Would solving this help customers? If so, how?
- Has previous research raised this?

Write the goals against the user problem.

## 3. Settle the study type

Check these in order and take the first that fits:

- The goal is to measure, benchmark, or test a design or a live product ("test the new prototype") -> evaluative: read [references/evaluative.md](references/evaluative.md)
- The goal has a discovery phase and a testing phase ("learn how they plan meals, then test two concepts") -> hybrid: read both study-type references
- The goal is to discover behaviour, needs, or mental models ("how do nurses hand over a shift") -> generative: read [references/generative.md](references/generative.md), and do not read the evaluative reference

## 4. Write the plan

Read [references/components.md](references/components.md). Write all 12 components in
its output format. Mark a gap `[To confirm]` instead of leaving a component out. Then
list each `[To confirm]` item and who can answer it.

## Rules

- Do not write interview questions, a discussion guide, a screener survey, or a synthesis. Component 11 links to the guide, and component 8 links to the screener.
