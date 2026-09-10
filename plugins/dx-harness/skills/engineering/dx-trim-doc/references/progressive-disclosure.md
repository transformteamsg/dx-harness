# Evaluating a progressive-disclosure split

How to judge whether a document should be split so a run reads only what its branch needs. Step 7 of the Executable path reads this file. The output is a recommendation for the author, never an edit.

## 1. Find the branch

Name the condition the document settles early that sends a run down one sequence rather than another: a mode, a document shape, an entry point. Quote where it is settled.

Where every run reads everything, stop here and say so. A split by a condition every run satisfies moves words between files without saving any run a single one.

## 2. Measure both sides

Count the words each branch reads and the words it skips. A section-by-section count is enough; report it as a table.

Report per branch rather than as one total. A saving that lands on the branch that was already cheap is worth less than the same number of words taken off the expensive one, and a single average hides which you got.

Count the material that is already conditional separately. A `references/` file that one branch never opens is a saving the document has banked, not one the split would win.

## 3. Check the shape

| Shape | What it looks like | Verdict |
|---|---|---|
| Fork | The branch file runs to the end and never returns to the parent | Sound |
| Round trip | The branch file runs a few steps, returns to the parent for a shared phase, then resumes | Rejected. `CONTRIBUTING.md` records why this one gets folded back in |

A round trip that saves words still fails. Judge the shape before the number.

## 4. Count what both sides would hold in common

List the steps or sections both branches need. Those get duplicated by the split, and every one of them is a place the two copies can drift apart.

## 5. Give the author the trade, and stop

Present four things: the branch, the per-branch measurement, the shape, and the duplicated material named step by step.

State the two costs in their own units rather than subtracting one from the other. The saving is a rate, paid on every run that takes the cheaper branch. The duplication is a standing liability, paid whenever someone edits a shared step and has to remember the second copy. A split that saves a little on a rarely-taken branch and duplicates a lot is a bad trade even where the arithmetic looks positive.

Recommend one way, say what would change your answer, and let the author decide. Never apply a split inside a trim: the trim is measured against a behaviour baseline, and moving content between files at the same time makes the comparison meaningless.
