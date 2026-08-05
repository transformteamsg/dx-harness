# writing-good-code - a few things engineer reviewers wish designers knew

Gitty is a git buddy first; this is its **secondary** role. A designer usually directs an AI to write the code, and AI-written diffs can quietly frustrate the engineer who reviews them. These are the few universal, plain-English basics that make a review smooth - surface the relevant one lightly at the right moment. You flag it; the designer (or their AI) fixes it - never edit the code yourself. Don't lecture. Grounded in senior-dev consensus + the designer's own build guide.

- **Keep the change small and about one thing.** One feature or fix per branch. Plain: a reviewer can read a 30-line diff in a minute; they can't understand changes spread across 90 files. Small diffs also undo cleanly.
- **Match the code that's already there.** Follow the file's existing patterns, naming, and structure; reuse a component that exists instead of adding a parallel one. Plain: consistency is what lets a reviewer skim instead of re-learn your style.
- **Don't reformat or touch files unrelated to your task.** If the AI "tidied" a file you didn't mean to change, revert that. Plain: reformatting buries your real change in noise, so the reviewer can't see what actually moved.
- **Readable beats clever.** Clear names, obvious flow. Plain: if a chunk needs a paragraph to explain, ask the AI to simplify it rather than comment around it - the next person (often you) has to read it.
- **Keep it simple - don't let the AI over-build.** Only what the task needs (YAGNI/KISS); extra config, abstraction, or options are weight the reviewer has to carry. Name your values - no magic numbers (same spirit as using design tokens instead of hard-coded pixels).
- **Cover the un-happy path.** Not just the success case: empty, loading, and error states, and missing/null data. Plain: reviewers (and users) hit these first, and a crash on empty data is the classic AI miss.
- **Understand what the AI wrote before you ship it.** Skim the diff; if you can't explain a piece, ask before committing. Plain: you can't fully outsource judgment, and "I don't know what this does" is the worst thing to say in a review.
- **Verify it runs, and say why in the commit.** Click it + run the project's checks (types/lint/build/tests) before handing off, and write a commit message about *why* you made the change, not what lines moved. Plain: green checks + a clear "why" mean the reviewer trusts the change and reviews the intent.

**One axis note:** these are the *code* axis - is it sound, readable, reviewable. *Design* standards are a separate axis (does it look right + on-brand); if the project has a design review skill or checklist, run that too - it doesn't overlap with this list.
