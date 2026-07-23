---
name: feedback
description: Capture feedback about the TFX design harness itself — a confusing skill or gate, a check that flagged wrongly or is missing, a process or onboarding gap — and file it as a `[harness-feedback]` GitHub issue on the harness repo. Use when the user gives such feedback in ANY session, including mid-task while another skill is running, or asks to "file this as harness feedback". NOT for feedback about a product's design or page (that is design-loop material), and NOT for proposing a new catalog control (that is the ratchet, via the standards skill).
---

# Harness feedback → GitHub issue

The user just told you something about the harness itself, not the product you're
building. Capture it now — it evaporates when the session ends — then file it
correctly. Full process spec: `../../../docs/harness-feedback.md` (resolve relative
to this SKILL.md, three levels up — it ships with the plugin).

## Procedure

1. **Recognise and hold, don't derail.** If you're mid-task (e.g. inside the design
   loop), acknowledge the feedback in one line, capture it (step 2) into a note,
   finish the current gate/step, then run steps 3–5 before the turn ends. Never let
   the capture die with the session; never abandon the user's main task to go file
   paperwork.
2. **Capture context while fresh**: what the user said (quote them), which
   skill/phase/check/control surfaced it, the evidence (command output, control id,
   or gate in question), and the session's product repo. This becomes the issue body
   per `../../../docs/harness-feedback.md`.
3. **Classify**: one severity + category label(s) from the doc's scheme (read the
   doc; do not trust memory for the label lists). Boundary check: if the feedback is
   really a control proposal, route to the ratchet via the `standards` skill instead
   and say so.
4. **Confirm before filing** — filing an issue is an outward, visible side effect on
   a repo the user may not own. Show the exact title, labels, and body (use the
   helper's `--dry-run` output) and ask the user to approve, edit, or skip. In an
   unattended run, do NOT file — emit the dry-run output into the session/record and
   mark it "queued, not filed".
5. **File via the helper, never raw `gh issue create`**:
   `python3 <this-skill-dir>/../../../scripts/file-feedback-issue.py --severity … --category … --title … --body …`
   It dedups, validates labels, targets the harness repo
   (`transformteamsg/tfx-design-standard`) regardless of the session's cwd, and fails
   honestly. If it exits non-zero, relay its would-be-issue output and the reason
   verbatim — never claim an issue was filed when it wasn't, and never retry into the
   product repo.
6. **Close the loop**: give the user the issue URL; if the helper reported a
   duplicate, give the existing issue's URL and offer to add their context as a
   comment instead.

## Stay honest

- Restate no label lists or the marker string here — `../../../docs/harness-feedback.md`
  and the helper own them; read the doc, don't rely on memory.
- Never file a real issue in an unattended run, and never file without the user's
  explicit approval of the shown title/labels/body.
