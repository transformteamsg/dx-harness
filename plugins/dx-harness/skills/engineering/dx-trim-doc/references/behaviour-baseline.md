# Behaviour baseline

How to measure what a document makes an agent do, before and after a trim. Step 2 of `dx-trim-doc` reads this file, and Step 5 re-runs what it produces.

Use any runner that gives you three things: a way to load one copy of the document, a way to send a fixed prompt, and a way to read back every turn. A concrete Claude Code invocation appears at the end, as one way to get them.

## 1. Build one fixture per gate

A fixture is a single self-contained request that forces one gate to fire. Write it as the input a real author would send, not as a test case.

Three rules decide whether a fixture is worth running.

- **Target the gate, not the happy path.** A happy-path fixture passes under almost any trim, so it measures nothing. Allow one as a control, no more.
- **Make the input wrong in the way the gate exists to catch.** For a gate that routes technical work away from a story, write technical work in story shape. For a gate that splits an oversized issue, carry two unrelated capabilities.
- **Make it self-contained.** The run gets one turn to show its behaviour. A fixture that depends on answers arriving later cannot be scored. Where the document tells the agent to ask, asking is the pass, so state that in the checklist rather than feeding it answers.

Then write a checklist per fixture, six items or fewer, drawn from the document's own stated rules. Each item is one binary claim about the transcript. Score strictly: if the transcript is ambiguous, the item fails.

Include at least one negative item per fixture, such as "does not invent a persona" or "does not apply the label". A trim that loosens a prohibition shows up nowhere else.

## 2. Stop the run from acting

The run must not write to a tracker, a repository, or a remote. Append a condition block to the agent's instructions, identical for the untrimmed and trimmed arms, that states three things.

1. Render the artifact and stop. Print what you would create rather than creating it.
2. Answer nothing on the author's behalf. Where the document says to ask, ask and stop.
3. Any tool that reaches a remote is unavailable. Follow the document's own branch for that failure.

`dx-code-review`'s eval notes set this precedent. A run records what it would post, and posts nothing.

The block goes to both arms unchanged. A condition applied to one arm is a second variable.

## 3. Run both arms

Keep two copies of the document that differ only in the text under trial. Everything else, including sibling files the document loads, stays identical. Verify that with a recursive diff before running: if more than the intended file differs, the comparison is void.

Run every fixture against each arm at least three times. One run per cell cannot separate a real change from ordinary variance.

Use the same model for both arms. A model change swamps any trim effect. In one measured trial the gap between two models was four times the largest instruction-format effect.

## 4. Record the outcome

Per run, capture:

| Field | Why |
|---|---|
| Gate outcomes, item by item | The comparison that decides the trim |
| Words across every assistant turn | Whether the trim moved output length |
| Turns | An early exit shows up here first |
| Cost or output tokens | Whether a shorter document costs less to run |

The baseline is the gate outcomes for the untrimmed arm. Report a per-gate mean and the range across runs, never a mean alone. A gate that scores 1 in one run and 6 in another has not been measured, whatever the mean says.

## 5. Two traps that make a broken run look clean

Both of these produced wrong numbers in the trial this file comes from. Check for both before you trust a comparison.

**A rate-limited run can report success.** A throttled request may return a success status alongside an error flag and an error code. A runner that reads the status alone records a rate-limited run as a very short one. That reads as a terse arm rather than a failed call. Check both error fields on every run, and discard any run that carries either. Retry with a backoff rather than accepting the row.

**A final-message capture is not a transcript.** A runner that returns only the agent's last message hides every earlier turn. Verbosity measured that way is wrong, and a gate satisfied in an earlier turn scores as failed. Capture the streamed turns instead, and concatenate every assistant message.

**An output file exists from the first streamed line.** Counting files tells you how many runs started, not how many finished. A run still streaming reads as one that produced no `result` line. Score a run only once no runner process remains. Treat a missing `result` line as "not finished yet", not as a failure.

## 6. When no baseline is possible

Say so, and say why. Three usual reasons: the document has no gates, the fixtures would need a live remote, or the document is reference prose nobody executes.

Offer the edge test alone, and label the result an unverified trim. Name what to re-check by hand. Never report an unverified trim as verified.

## A concrete runner

One way to get the three things this method needs, using Claude Code. Any runner that loads a document, sends a fixed prompt, and returns every turn will do.

```sh
# Two arms that differ only in the file under trial
diff -rq arms/before arms/after   # expect exactly one differing file

# One run: stream every turn, keep the document under test loaded
printf '%s' "$FIXTURE" | claude -p \
  --plugin-dir arms/before \
  --add-dir arms/before \
  --model <one model, both arms> \
  --output-format stream-json --verbose \
  --append-system-prompt "$CONDITIONS" \
  --disallowedTools 'Write' 'Edit'
```

Read the streamed lines. Each `assistant` line carries one turn's text. The final `result` line carries the turn count, the cost, and the error fields from section 5. Pass the prompt on standard input: a variadic option such as `--disallowedTools` otherwise swallows a positional prompt.

`--add-dir` lets the run read the sibling files the document points to. Without it, a read outside the working directory is denied. The run then invents a substitute for the file, or stops to ask for access. A gate whose fixture needs that file cannot be scored at all. In the `dx-create-story` trial this voided one gate in every arm and aborted four runs. Pass it to both arms. Check an early transcript for a denied read before you run the full set.
