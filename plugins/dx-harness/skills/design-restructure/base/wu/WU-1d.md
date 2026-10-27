---
code: WU-1d
dss: WU-1
tier: L1
check: lint
surface: project
engine: custom
judgedRemainder: WU-1c
parameters:
  pdfFiles: null
---

# WU-1d: each PDF file declares its language

## Statement

Each Portable Document Format (PDF) file has a language in its catalogue.

## Check

Applies when `pdfFiles` lists a glob. Reads the document catalogue of each matching file. Fails when a file has no `/Lang` entry or an empty one.

The project has no PDF library, so the check reads the bytes. It finds the catalogue object in the plain text of the file. A file whose catalogue sits inside a compressed object stream cannot be read this way, and the check reports it as unreadable and not as a pass.

When `pdfFiles` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Set the document language when you export the PDF file.

## Not required for

None listed.

## Rationale

Screen readers pick the voice and pronunciation from the declared language. `WU-1c` still judges the language of mobile applications, which a script cannot decide.
