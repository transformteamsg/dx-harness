# The annotated-evidence report (present step)

Every critique run ends with a shareable, self-contained HTML report: each finding
sits beside a redlined crop of the live surface. The report is the default output of
every critique run, not an opt-in. Only critique produces it; the five passes never
do. The report proposes only. Critique never edits the product, and the report says
so in its lede.

Run this step after `critique.md` (beside this file) completes, with the findings
and ranked suggestions in hand.

## 1. Source images

Use the full-res 1280 captures from this run's capture step. Never redline a page
you did not capture this run. If capture failed on a page, do not fake evidence:
every control that needed that page takes a "verify" verdict in the coverage table
(evidence incomplete, never "failed"), and the lede states which pages were not
captured.

## 2. Redlined crops

PIL (Pillow) is a setup dependency, not a runtime surprise. Detect it before
cropping; if it is missing, offer setup once via `../dx-setup/setup.md`, then
proceed. Never fake crops, and never ship a report with placeholder images.

For each annotated finding:

1. Choose the crop region by judgment from the capture: the element the finding
   names, plus enough surrounding context to orient the reader.
2. With PIL, crop from the full-res image, draw a 3px rounded rectangle (#e11d63)
   on the specific element, and downscale the crop to ~760px wide.
3. Comparison findings (for example header drift across pages) stack crops from
   several pages into one image.
4. Give each crop a figcaption naming the page it came from.

## 3. Contact sheet (mandatory)

Assemble every crop into one contact-sheet image, render it, and re-read it
visually before publishing. This self-check is mandatory before every publish,
first run and re-runs alike, and it blocks publishing until it passes. When you
find a misplaced box: fix the box, regenerate the crop and the sheet, and re-read
the sheet again. Never publish unchecked crops.

## 4. HTML assembly

One self-contained file: every image embedded as a base64 data URI, tokens themed
for light and dark via prefers-color-scheme plus data-theme overrides, no external
requests. Style the suggestions table as the decision surface: quick-win rows get a
green left edge, and the table states "approving 'quick wins' takes all N".

### Document structure (locked, in this order)

The structure below is locked on the reference-format comment of
[tfx-design-standard#39](https://github.com/transformteamsg/tfx-design-standard/issues/39).
Do not restructure or reorder it.

1. **Title + one-line lede.** Product, catalogue version, explicit "no code
   changed".
2. **Fact grid** (not prose): run URL or mocks, pages captured + widths,
   deterministic checks run, catalogue coverage, date.
3. **Summary block**: a one-sentence verdict leading with the dominant theme;
   finding counts by tier (L0/L1/L2/craft/passing/N-A); a "how to respond" line
   ("reply with S-numbers to approve"); a tier legend (L0 floor-no-waiver / L1
   documented / L2 rationale); a linked table of contents.
4. **Suggestions table first**: it is the decision surface. Columns: S#,
   suggestion, Fixes (links to F#), controls, impact (High/Med/Low only), cost
   (S/M). Below the table: a "considered and declined" line for anything the lead
   rejects (a declined suggestion keeps its S-number and is never silently
   dropped), and an "upstream, not local" note for design-system-owned debt.
5. **Annotated findings (F1..Fn)**: grid rows, redlined crop left (~400px column),
   text right. Each carries the F-id + title, a tier pill, control IDs, a
   "Fix: S#" chip linking to the table, and a figcaption naming the page the crop
   came from.
6. **Code-level findings** as a numbered table; F-ids continue the same series.
   Columns: tier, location (file:line), fix S#.
7. **Full catalogue coverage table**: every control with a verdict of
   pass/fail/partial/verify/N-A plus a one-line note. "Verify" means evidence
   incomplete; it is never counted or styled as "failed".
8. **What works, preserve**: deliberate choices protected from restyling;
   compliance still checked.
9. **Appendix**: full captures.

## 5. Numbering rules

- F-ids are one series across annotated and code-level findings.
- F- and S-numbers are stable across revisions of the same surface's report: a
  removed finding leaves a gap, never a renumber, so circulated references keep
  working.
- New findings on a re-run take fresh numbers after the highest number ever used.

## 6. Publish

Publish the HTML as an artifact. On every re-run for the same surface, republish
to the same artifact URL with a version label; a new URL is a defect. If artifact
publishing is unavailable, fall back to writing the self-contained HTML to a local
file and opening it in the browser; say so in the Findings comment and link the
file path instead of a URL.

Then link the report URL (or the fallback file path) from the Findings comment on
the surface's design ticket (`../../../procedures/design-tickets.md`) and stop.
Approval happens on the ticket: the human replies with S-numbers, and each
approved S# marks the F-findings it fixes as `accepted` for `dx-design-execute`.
