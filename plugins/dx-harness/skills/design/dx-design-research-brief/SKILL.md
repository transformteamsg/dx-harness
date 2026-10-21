---
name: dx-design-research-brief
description: 'Build a user research plan or research brief for any study: generative, evaluative, or hybrid. Use when someone needs to plan a research project, write a research plan, create a research brief, document study goals and methodology, align stakeholders on a study, or structure a new research request. Triggers include "write me a research plan", "help me plan this study", "I need a research brief", "create a research plan for", "we''re starting a new research project", "how do I structure this research request", and "help me document this study".'
---

# Research plan builder

Write a research plan with 12 components, in a fixed order, from what the requester
tells you.

## 1. Collect the inputs

Read the request and the conversation, then list what they already give you:

1. The research request: what triggered the project
2. The business problem and the user problem, separately
3. The research goal: what the team needs to learn, and which decisions the findings support
4. The stakeholders: who is involved, informed, or consulted
5. What is already known: previous research, analytics, and assumptions
6. The timeline: when the team needs insights, and why that date

Check these in order and take the first that fits:

- The request names what the team needs to learn ("learn how supervisors decide on overtime") -> Step 2
- The request names no research goal, or names only a business metric ("we need some research on onboarding", "sign-ups dropped 18%") -> ask for the goal and stop. Write no part of the plan until the goal comes back

A business metric is not a research goal. Where the request names one, put the questions in Step 2 in the message that asks for the goal.

In the message that asks for the goal, also ask for the other inputs the request does not give. Where the inputs must come from a stakeholder outside the conversation ("leadership wants research on it"), add the intake questions in Step 1a to that message.

Where the request names the goal, ask nothing more. Write `[To confirm]` in the part of the plan that a missing input feeds.

### 1a. Intake questions

Send these as one form for the stakeholder to fill in. Their answers feed Step 1.

```
Background
1. What led you to request research support now?
2. What phase is your project in: discovering new information, testing a concept, or something else?

The big picture
3. What impact will this research have on your team?
4. How will this research affect other teams or the organisation?

The research need
5. What support do you need: recruitment, guide writing, moderation, or analysis?
6. What are your questions for this project?
7. Which groups of customers do you want to learn about?
8. What customer problem or need are you trying to solve?
9. How do you know this is a customer problem or need?
10. What will you do with the insights? Is someone ready to act on them?
11. When do you need insights to move forward, and why that date?
12. Any other relevant context?

Looking back
13. What previous research, analytics, or data supports the solution you designed?
14. Which important questions remain unanswered after you reviewed past research?
15. Include links to any prototypes or concepts.
```

## 2. Separate the business problem from the user problem

Translate the business problem into a user problem with these questions:

- Is this a customer problem?
- Could a technical issue cause this instead?
- Why would customers care about this?
- How could this affect customers?
- Would solving this help customers? If so, how?
- Has previous research raised this?

Name both problems in the plan, and write the goals against the user problem. Then go
to Step 3.

## 3. Settle the study type

Classify the study from the goal and the method the requester names. Check these in
order and take the first that fits:

- The goal is to measure, benchmark, or test a design or a live product ("how many users finish checkout", "test the new prototype") -> evaluative
- The goal has a discovery phase and a testing phase ("learn how they plan meals, then test two concepts") -> hybrid
- The goal is to discover behaviour, needs, or mental models ("how do nurses hand over a shift") -> generative

The study type decides whether Step 4 reads the guidance for component 7.

## 4. Write the plan

Read [references/components.md](references/components.md) and write the components
in this order:

1. Project background
2. Internal stakeholders
3. Hypotheses and assumptions
4. Research statement and goals
5. Success criteria
6. Methodology
7. UX metrics
8. Participants and recruitment
9. Deliverables and next steps
10. Approximate timeline
11. Discussion guide or task script
12. Resources

For component 7, branch on the study type from Step 3:

- An evaluative or hybrid study -> read [references/ux-metrics.md](references/ux-metrics.md). List the metrics for a quantitative phase, or write `Not applicable: qualitative study` where no phase is quantitative
- A generative study -> write `Not applicable: generative study` under the heading, and do not read `ux-metrics.md`

Write every component, including one with no content yet. Mark a gap `[To confirm]`
instead of leaving the component out.

## 5. Format and hand over

Lay the plan out as [references/output-format.md](references/output-format.md) shows,
and end with the researcher reminders that file lists.

Then list each `[To confirm]` item and who can answer it.

## Rules

- Do not write interview questions, a discussion guide, a screener survey, or a synthesis. Component 11 links to the guide, and component 8 links to the screener.
