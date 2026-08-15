# Catalog-change records

One file per catalogue decision: a ratchet admission or rejection, a harness rule
(like `evd-1-async-evidence.md`), a control amendment, or a removal (like
`idn-4-removal.md`). The catalog validator (`checks/validate.py`) sweeps every `.md`
here for control-id cross-references, and `checks/audit-record.py` requires that any
record a decision record cites actually exists.

A removal record is the one place a retired control id may still be named — the sweep
reads `retired_ids` from `standards/schema.json` for files in this directory only.
See authoring rule 7 in `standards/README.md`.

## Records cited before this directory existed

Several catalog comments and control detail files cite records by name that were
approved in working sessions before this directory was first committed
(2026-08-13, [#123](https://github.com/transformteamsg/dx-harness/issues/123))
and were never written down:

`glow-pilot-col1-typ1-tok3.md`, `contrast-functional-chips-step-12.md`,
`cmp-4-empty-state-clarity.md`, `component-default-consistency.md`,
`cmp-8-draft-safety-escapability.md`, `cross-user-html-sanitisation.md`,
`cnt-4-domain-fidelity.md`, `idn-2-*.md` / `idn-3-*.md` / `idn-4-*.md`,
`lay-7-focal-point.md`, `slp-9-ai-writing-tells.md`.

Those citations are provenance pointers (who approved what, when), not normative
authority — the normative content lives in the catalog entries and detail files
themselves. Treat a citation to one of the names above as "approved in-session,
record not reconstructed". New decisions must not follow that precedent: cite a
record only after committing it here.
