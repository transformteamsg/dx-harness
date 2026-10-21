# Rule-writing standard

This file sets the standard for writing a rule file in the rebuilt catalogue. Read it before you write or review a rule. The category reviews (C4 to C13) write each rule to it, and a reviewer checks each draft against it.

A rule is one file at `standards/rules/<category>/<slug>.md`. Start from the template at `plugins/dx-harness/standards/rules/_template.md`. The [decision record 0001](../../../docs/adr/0001-rule-set-and-presets.md) sets the frontmatter. This file sets the body and the discipline that keeps a rule generic.

## The standard in two sentences

A check reads the frontmatter and never the prose. A rule states a requirement that holds for any product, and a preset or `DESIGN.md` supplies the values that differ.

## Frontmatter

The frontmatter has the fields that decision 3 of the record sets, and no others:

| Field | Value |
| --- | --- |
| `code` | `PREFIX-N` |
| `slug` | Kebab-case name |
| `category` | One of `A11Y`, `TOK`, `COL`, `TYP`, `CMP`, `CNT`, `LAY`, `MOT` |
| `tier` | `L0`, `L1`, or `L2` |
| `status` | `preview`, `stable`, `deprecated`, or `removed` |
| `check` | `deterministic`, `judgment`, or `hybrid` |
| `applies_to` | A list from `page`, `component`, `flow`, and `content` |
| `parameters` | A map from name to `default`, `type`, and `description` |

Do not add `products`, `audiences`, `enforced`, `script`, `gap`, `phase`, or `refs`. The record drops them. A rule file does not name the script that checks it. A check names the rules that it implements.

## Parameters

A value that a check reads is a parameter in the frontmatter. A check never parses prose.

A value is a parameter when any of these is true:

- A check compares a measurement to it, such as a size, a ratio, a duration, or a count.
- A check matches against it, such as a word list, a list of allowed values, or a pattern.
- A product or a domain can reasonably set it differently, such as a colour, a typeface, a scale, or a spelling locale.

Write each parameter with these keys:

- `type`: `integer`, `number`, `string`, `boolean`, or a list of one of those.
- `default`: the value that applies when no layer sets one. Omit `default` when the rule has no sound generic value. A parameter with no `default` is required, and a check reports "not configured" when no layer sets it.
- `description`: one sentence that says what the value controls and its unit.

Choose a default only when the generic requirement supports it. A default that names a portfolio value, such as one product's colour, is not generic. Leave `default` out and make the parameter required.

A setting that several rules read, such as the audience, the stack, or the spelling locale, takes one shared name across those rules. Reuse the name that another rule already uses. Decision 5 of the record says where the value sits in a product, and decision 6 sets the order in which the layers resolve it.

### A threshold or word list that appears only in prose is a defect

A draft that states a threshold, a list of values, or a word list only in its prose is defective. A check cannot read the prose, so the value is either unchecked or hard-coded in a script that drifts from the rule.

A reviewer who finds one does this:

1. Names the draft as defective in the review comment.
2. Moves the value into `parameters` with a `type`, a `default` (or none, if the parameter is required), and a `description`.
3. Rewrites the prose to refer to the parameter by name, without repeating the value as the only statement of it.

The examples in the body can show a value. The requirement and the check description must refer to the parameter by name.

## A rule stays generic

A rule's requirement names no product, audience, or stack. A reviewer who finds one in a draft does this:

1. Names the draft as defective.
2. Turns the value into a parameter. For a stack, the parameter holds the token set, the scale, or the component library. For an audience, it holds the measure the audience changes, such as a reading level or a target size. For a product, it holds the value the product owns, such as a colour.
3. Leaves the value to a preset or to `DESIGN.md`, which sets it. A value shared by every product of a domain sits in the domain preset. A value for one product sits in its `DESIGN.md`.

The test is a substitution. Replace the named product, audience, or stack with another. If the requirement is still true as written, it is generic. If you have to edit the sentence, the named thing is a parameter.

| Instead of | Write |
| --- | --- |
| Primary actions use Teacher Workspace blue. | Primary actions use the colour in `primary-colour`. |
| Spacing comes from the Tailwind scale. | Spacing comes from the scale in `spacing-scale`. |
| Copy suits a primary school student. | Copy meets the reading level in `max-reading-grade`. |

An example may name a product or a stack to make a case concrete. Mark it as an example and keep the requirement free of the name.

A rule that cannot be stated without a named product is not a rule for the shared catalogue. It belongs in a preset's `add` list, under the preset's own prefix (decision 4).

## Sections

Every rule file has these five sections, in this order, with these headings. Do not add a section, and do not leave one out. A section that has nothing to say is a sign that the rule is incomplete.

### What the rule checks

The section holds the requirement, and nothing else.

- State one requirement in one or two sentences, as an instruction in the second person or as a plain statement of what must be true of the surface.
- State what is graded: which surface, which element, which property. Name the surface the way `applies_to` does.
- Refer to a threshold or a list by its parameter name in code font. Do not write the value as the only statement of it.
- Do not give the reason, an example, or the method. Those have their own sections.
- Keep one requirement per rule. A requirement that needs "and" to describe is two rules.

A reader who stops after this section can say what passes and what fails.

### Why it matters

The section holds the harm that the rule prevents, in terms of the person who uses the surface.

- Name who is affected and what goes wrong for them, in one to three sentences.
- Cite a standard where one sets the requirement, such as a WCAG success criterion, by its number and name.
- Do not restate the requirement, and do not argue for the harness. Do not name a product or an audience as the only person harmed, because the rule applies to every product.

A reviewer uses this section to decide whether the rule is worth its cost, and an agent uses it to decide a close case.

### Failing example

The section holds one concrete example that the rule rejects.

- Show the smallest realistic case: a code excerpt, a copy string, a layout description, or a measured value. Use a code block for code.
- Give a value that the default parameters reject, and say which one.
- Say after the example why it fails, in one sentence that names the parameter or the requirement.
- Make the example fail for one reason. An example that fails two rules teaches neither.

An example that a check could not reject is not a failing example. If the check is `judgment`, the example is a case that a reasonable reviewer rejects, and the sentence says what the reviewer sees.

### Passing example

The section holds one example that the rule accepts, written as the repair of the failing example.

- Change only what makes the rule pass. A reader can lay the two examples side by side and see the one difference.
- Say after the example why it passes, in one sentence.
- Where the rule has a boundary, show the value just inside it, and say that the boundary is the parameter's value.

### How it is checked

The section says how a check decides, so that a person can reproduce the decision and a check author knows what to build.

- Open with the `check` value: `deterministic`, `judgment`, or `hybrid`.
- For `deterministic`, say what the check measures and which parameters it reads. A check reads the resolved value of each, so name each one.
- For `judgment`, state the test as a question about the text or the surface that has one answer, and the evidence a reviewer cites. Do not write "use good judgment".
- For `hybrid`, say which part a script decides and which part a reviewer decides. Say what a reviewer does with a script's finding.
- If the rule has a required parameter, say that the check reports "not configured" when no layer sets it, and does not pass.
- Do not name the script or its path. The check names the rules it implements (D14).

## Review checklist

A reviewer opens a draft rule and works down this list. Any "no" returns the draft.

1. Does the frontmatter hold exactly the fields above, with valid values?
2. Does the file have the five sections, in order, under these headings?
3. Does the requirement state one requirement?
4. Does every threshold, list, and scale that a check reads sit in `parameters`?
5. Does the prose refer to a parameter by name, rather than state the value alone?
6. Does the requirement name no product, audience, or stack?
7. Does each parameter have a `type` and a `description`, and a `default` only where the generic rule supports one?
8. Does the failing example fail for one reason, and does the passing example differ from it by that reason only?
9. If the rule has a required parameter, does the checked section say that an unset value reports "not configured"?

## Worked rule

The rule below is an illustration. It is not part of the catalogue, and its code does not exist. It shows the form of a rule file, including a threshold and a list as parameters and a requirement that names no product.

````markdown
---
code: CNT-900
slug: button-label-length
category: CNT
tier: L2
status: preview
check: hybrid
applies_to: [component, content]
parameters:
  max-label-words:
    default: 3
    type: integer
    description: The most words a button label can hold.
  vague-labels:
    default: [Submit, OK, Click here]
    type: [string]
    description: Labels that name no action, matched without regard to case.
---

# CNT-900: Button labels name the action

## What the rule checks

A button label names the action that the button performs, in no more than `max-label-words` words. A label in `vague-labels` fails.

## Why it matters

A person who uses a screen reader hears the label out of context, in a list of controls. A label that names no action leaves them to guess what the control does before they activate it. This supports WCAG 2.2 success criterion 2.4.6, Headings and Labels.

## Failing example

```html
<button type="submit">Submit</button>
```

`Submit` is in `vague-labels`, so the label names no action.

## Passing example

```html
<button type="submit">Save changes</button>
```

`Save changes` names the action and holds two words, which is inside `max-label-words`. A label of four words, such as `Save your changes now`, fails at the default.

## How it is checked

The check is `hybrid`.

A script reads the resolved `max-label-words` and `vague-labels`, finds each button label in the source, and reports a label that is over the limit or in the list.

A reviewer decides the rest: whether a label of an allowed length names an action. The reviewer cites the label and the action the button performs. A label that is a noun with no verb, such as `Settings` on a button that saves, fails.

Both parameters have defaults, so the check always has a value to read.
````
