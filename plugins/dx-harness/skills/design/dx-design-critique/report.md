# The annotated-evidence report (present step)

Every critique run ends with a shareable, self-contained HTML report: each finding
sits beside a redlined crop of the live surface. `../../../scripts/critique-report.py`
builds it, and you control it through the findings file alone.

Run this step after `critique.md` (beside this file) completes, with the findings
and ranked suggestions in hand.

## 1. Source images

Crop from the full-size 1280 captures from this run's capture step. Never crop from
a scaled copy: it is for judging only. Never redline a page you did not capture this
run. If capture failed on a page, do not fake evidence:
every control that needed that page takes a "verify" verdict in the coverage table
(evidence incomplete, never "failed"), and the lede states which pages were not
captured.

## 2. Findings file

Write one JSON findings file for the run. `../../../scripts/critique-report.py`
states the format in its header. Change the report by changing the findings file,
not the HTML. Fill it in as follows:

- **Facts**: the run URL or mocks, the pages captured and their widths, the
  deterministic checks run, and the catalogue coverage.
- **Uncaptured**: each page or width that did not capture, so the lede names it.
- **Verdict**: one sentence that leads with the dominant theme.
- **Suggestions**: each with its S#, the F-ids it fixes, its controls, an impact of
  High, Med, or Low only, and a cost of Small or Medium. Mark a quick win as one.
- **Declined**: a "considered and declined" line for anything the lead rejects. A
  declined suggestion keeps its S-number and is never silently dropped.
- **Upstream**: design-system-owned debt, kept apart from local findings.
- **Findings**: each annotated finding with its tier, controls, the S# that fixes
  it, and its crops. A finding with no crop is a code-level finding, with its
  `file:line` location.
- **Coverage**: every rule on the run's in-scope list with a verdict of
  pass/fail/partial/verify/N-A plus a one-line note. "Verify" means evidence
  incomplete; it is never a "failed".
- **Preserve**: the deliberate choices protected from restyling. Their compliance
  is still checked.
- **Captures**: the full captures for the appendix.

For each annotated finding:

1. Choose the crop region by judgment from the scaled copy you judged from: the
   element the finding names, plus enough surrounding context to orient the reader.
2. Give the region and the box around the element in the pixels of that scaled
   copy. Name the full-size capture as the source. The script scales the
   coordinates to it.
3. Give a comparison finding, such as header drift across pages, one crop for each
   page. The script stacks them into one image.
4. Name the page each crop came from.

Never write base64 or a data URI yourself. The script embeds every image.

## 3. Build and contact sheet (mandatory)

Run `python3 ../../../scripts/critique-report.py <findings file> --out <dir>`. It
crops from the full-size captures, draws each redline box, writes the contact sheet
of every crop, and assembles the report. It prints the path of each file.

When `critique-report.py` exits with an error, stop and show the error. Do not
publish. When Pillow is not installed, the error names the install step. Run that
step, then rerun the script. Never fake crops, and never ship a report with
placeholder images.

Read the contact sheet before you publish. Do not read the crops again one by one:
the sheet holds every crop. This self-check is mandatory before every publish, first
run and re-runs alike, and it blocks publishing until it passes. When you find a
misplaced box, fix its coordinates in the findings file, rerun the script, and read
the new sheet. Never publish unchecked crops.

## 4. Numbering rules

- F-ids are one series across annotated and code-level findings.
- F- and S-numbers are stable across revisions of the same surface's report: a
  removed finding leaves a gap, never a renumber, so circulated references keep
  working.
- New findings on a re-run take fresh numbers after the highest number ever used.

## 5. Publish

Publish the HTML as an artifact. On every re-run for the same surface, republish
to the same artifact URL with a version label; a new URL is a defect. If artifact
publishing is unavailable, fall back to writing the self-contained HTML to a local
file and opening it in the browser; say so in the Findings comment and link the
file path instead of a URL.

Then link the report URL (or the fallback file path) from the Findings comment on
the surface's design ticket (`../../../procedures/design-tickets.md`) and stop.
