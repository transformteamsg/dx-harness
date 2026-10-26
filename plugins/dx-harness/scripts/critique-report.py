#!/usr/bin/env python3
"""
critique-report.py - build the critique report from a findings file.

The agent writes the findings file, and this script does the rest: it crops
each finding from this run's full-size captures, draws the redline box, stacks
a finding's crops into one image, writes one contact sheet of every crop for
the agent to check, and writes the self-contained HTML report with every
image embedded as a base64 data URI. The agent writes no base64.

Coordinates in the findings file are in the pixels of the copy the agent
judged from, which is --width wide. The script scales them to each full-size
capture, so a capture taken at a device pixel ratio of 2 crops at full
resolution.

The findings file is JSON. Paths are relative to the findings file:

  {
    "title": "...", "product": "tw", "catalogue": "1.4.0", "date": "2026-10-26",
    "facts": [["Run URL", "..."], ["Pages captured", "..."], ...],
    "uncaptured": ["Class at 360"],
    "verdict": "...",
    "suggestions": [{"id": "S1", "text": "...", "fixes": ["F1"],
                     "controls": ["LAY-5"], "impact": "High", "cost": "S",
                     "quickWin": true}],
    "declined": "...", "upstream": "...",
    "findings": [{"id": "F1", "title": "...", "tier": "L1",
                  "controls": ["LAY-5"], "fix": "S1", "text": "...",
                  "crops": [{"capture": "captures/1280-home.png",
                             "page": "Home", "region": [x, y, w, h],
                             "box": [x, y, w, h]}]}],
    "codeFindings": [{"id": "F3", "tier": "L0", "text": "...",
                      "location": "src/Hint.tsx:12", "fix": "S2"}],
    "coverage": [{"rule": "A11Y-1", "verdict": "fail", "note": "..."}],
    "preserve": ["..."],
    "captures": [{"path": "captures/1280-home.png", "caption": "Home at 1280"}]
  }

`region` is the crop and `box` is the element the finding names, both as
x, y, width, and height on the page. `uncaptured`, `declined`, `upstream`,
`codeFindings`, and `preserve` are optional.

The command prints two lines: `report: <path>` and `contact sheet: <path>`.

Usage:
  python3 scripts/critique-report.py <findings.json> --out <dir> [--width 1280]

Exit codes:
  0  wrote the report and the contact sheet
  2  the findings file is not valid; nothing was written
  4  Pillow is not installed, or a capture is missing or unreadable (a tool
     failure); nothing was written
"""

import argparse
import base64
import html
import io
import json
import os
import sys

DEFAULT_WIDTH = 1280
INSTALL = "python3 -m pip install --user Pillow"
CROP_WIDTH = 760
APPENDIX_WIDTH = 1280
REDLINE = "#e11d63"
TIERS = ("L0", "L1", "L2", "craft")
VERDICTS = ("pass", "fail", "partial", "verify", "n-a")


class FindingsError(Exception):
    """The findings file does not hold what the report needs."""


class CaptureError(Exception):
    """A capture the findings file names cannot be read."""


def esc(value):
    return html.escape(str(value))


def require(record, keys, where):
    missing = [k for k in keys if k not in record]
    if missing:
        raise FindingsError(f"{where} has no {', '.join(missing)}")


def validate(doc):
    require(doc, ("title", "product", "catalogue", "date", "facts", "verdict",
                  "suggestions", "findings", "coverage", "captures"), "the findings file")
    ids = set()
    for f in doc["findings"]:
        require(f, ("id", "title", "tier", "controls", "fix", "text", "crops"), "a finding")
        if not f["crops"]:
            raise FindingsError(f"{f['id']} has no crops; move it to codeFindings")
        for crop in f["crops"]:
            require(crop, ("capture", "page", "region", "box"), f"a crop of {f['id']}")
        ids.add(f["id"])
    for f in doc.get("codeFindings", []):
        require(f, ("id", "tier", "text", "location", "fix"), "a code finding")
        if f["id"] in ids:
            raise FindingsError(f"{f['id']} is used twice; F-ids are one series")
        ids.add(f["id"])
    for f in doc["findings"] + doc.get("codeFindings", []):
        if f["tier"] not in TIERS:
            raise FindingsError(f"{f['id']} has tier {f['tier']}; use one of {', '.join(TIERS)}")
    for s in doc["suggestions"]:
        require(s, ("id", "text", "fixes", "controls", "impact", "cost"), "a suggestion")
    for row in doc["coverage"]:
        require(row, ("rule", "verdict", "note"), "a coverage row")
        if row["verdict"].lower() not in VERDICTS:
            raise FindingsError(f"{row['rule']} has verdict {row['verdict']}; use one of {', '.join(VERDICTS)}")


def open_capture(base, rel, Image):
    path = os.path.join(base, rel)
    try:
        image = Image.open(path)
        image.load()
    except OSError as exc:
        raise CaptureError(f"cannot read {path}: {exc}")
    return image.convert("RGB")


def crop(capture, region, box, width, Image, ImageDraw):
    """One redlined crop, downscaled to CROP_WIDTH at most."""
    scale = capture.width / width
    x, y, w, h = (round(v * scale) for v in region)
    # A region past the edge of the capture is clamped, so the crop shows no
    # fill that is not on the page.
    x, y = max(0, x), max(0, y)
    right, bottom = min(capture.width, x + w), min(capture.height, y + h)
    if right <= x or bottom <= y:
        raise FindingsError(f"a crop region {region} is outside its capture")
    piece = capture.crop((x, y, right, bottom))
    bx, by, bw, bh = (round(v * scale) for v in box)
    stroke = max(3, round(3 * scale))
    ImageDraw.Draw(piece).rounded_rectangle(
        (bx - x, by - y, bx - x + bw, by - y + bh),
        radius=max(4, round(4 * scale)), outline=REDLINE, width=stroke)
    if piece.width > CROP_WIDTH:
        piece = piece.resize((CROP_WIDTH, round(piece.height * CROP_WIDTH / piece.width)), Image.LANCZOS)
    return piece


def stack(images, Image, gap=12, label=None, ImageDraw=None):
    """Images one above the other on a white sheet, with an optional label."""
    top = 24 if label else 0
    sheet = Image.new("RGB", (max(i.width for i in images),
                              top + sum(i.height for i in images) + gap * (len(images) - 1)), "white")
    if label:
        ImageDraw.Draw(sheet).text((4, 4), label, fill="black")
    y = top
    for image in images:
        sheet.paste(image, (0, y))
        y += image.height + gap
    return sheet


def png_uri(image):
    buffer = io.BytesIO()
    image.save(buffer, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")


CSS = """
:root { --bg: #ffffff; --fg: #1a1a1a; --muted: #5c5c5c; --line: #d9d9d9; --card: #f6f6f6;
  --accent: #0064ff; --quick: #1a7f37; --fail: #b42318; --partial: #b54708; --verify: #5c5c5c; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --bg: #141414; --fg: #ececec; --muted: #a3a3a3; --line: #333333;
    --card: #1e1e1e; --accent: #5c9dff; --quick: #4ac26b; --fail: #ff7b72; --partial: #f0a050; --verify: #a3a3a3; }
}
[data-theme="dark"] { --bg: #141414; --fg: #ececec; --muted: #a3a3a3; --line: #333333;
  --card: #1e1e1e; --accent: #5c9dff; --quick: #4ac26b; --fail: #ff7b72; --partial: #f0a050; --verify: #a3a3a3; }
body { background: var(--bg); color: var(--fg); font: 16px/1.5 system-ui, sans-serif; margin: 0 auto;
  max-width: 1200px; padding: 32px 24px; }
a { color: var(--accent); }
h1 { margin-bottom: 4px; }
.lede, .muted { color: var(--muted); }
dl.facts { display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; }
dl.facts dt { font-weight: 600; }
table { border-collapse: collapse; width: 100%; margin: 12px 0; }
th, td { border-bottom: 1px solid var(--line); padding: 8px; text-align: left; vertical-align: top; }
tr.quick td:first-child { border-left: 4px solid var(--quick); }
.finding { display: grid; grid-template-columns: 400px 1fr; gap: 24px; padding: 16px 0;
  border-bottom: 1px solid var(--line); }
.finding img, .appendix img { max-width: 100%; height: auto; border: 1px solid var(--line); }
figure { margin: 0; }
figcaption { color: var(--muted); font-size: 14px; }
.pill, .chip { display: inline-block; border-radius: 999px; padding: 0 8px; font-size: 13px;
  background: var(--card); border: 1px solid var(--line); }
.v-fail { color: var(--fail); } .v-partial { color: var(--partial); } .v-verify { color: var(--verify); }
"""


def build(doc, base, width, Image, ImageDraw):
    """The report HTML and the contact sheet image."""
    figures = {}
    for f in doc["findings"]:
        crops = [crop(open_capture(base, c["capture"], Image), c["region"], c["box"], width, Image, ImageDraw)
                 for c in f["crops"]]
        figures[f["id"]] = stack(crops, Image) if len(crops) > 1 else crops[0]
    sheet = stack([stack([figures[f["id"]]], Image, label=f"{f['id']}  {f['title']}", ImageDraw=ImageDraw)
                   for f in doc["findings"]], Image, gap=24)
    appendix = []
    for c in doc["captures"]:
        image = open_capture(base, c["path"], Image)
        if image.width > APPENDIX_WIDTH:
            image = image.resize((APPENDIX_WIDTH, round(image.height * APPENDIX_WIDTH / image.width)), Image.LANCZOS)
        appendix.append((c["caption"], png_uri(image)))

    all_findings = doc["findings"] + doc.get("codeFindings", [])
    counts = {tier: sum(1 for f in all_findings if f["tier"] == tier) for tier in TIERS}
    verdicts = [row["verdict"].lower() for row in doc["coverage"]]
    counts["passing"] = verdicts.count("pass")
    counts["N-A"] = verdicts.count("n-a")
    quick = [s for s in doc["suggestions"] if s.get("quickWin")]

    def link(fid):
        return f'<a href="#{esc(fid)}">{esc(fid)}</a>'

    out = []
    w = out.append
    w('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
      f"<title>{esc(doc['title'])}: design critique</title>\n<style>{CSS}</style>\n</head>\n<body>\n")

    # 1. Title and lede.
    lede = (f"A critique of {esc(doc['product'])} against catalogue version {esc(doc['catalogue'])}. "
            "This report proposes only: no code changed.")
    if doc.get("uncaptured"):
        lede += " Not captured: " + esc(", ".join(doc["uncaptured"])) + "."
    w(f"<header>\n<h1>{esc(doc['title'])}</h1>\n<p class=\"lede\">{lede}</p>\n</header>\n")

    # 2. Fact grid.
    w('<dl class="facts">\n')
    for label, value in doc["facts"] + [["Date", doc["date"]]]:
        w(f"<dt>{esc(label)}</dt><dd>{esc(value)}</dd>\n")
    w("</dl>\n")

    # 3. Summary block.
    w('<section id="summary">\n<h2>Summary</h2>\n')
    w(f"<p>{esc(doc['verdict'])}</p>\n<p>")
    w(", ".join(f"{label} {count}" for label, count in counts.items()))
    w("</p>\n<p><strong>How to respond:</strong> reply with S-numbers to approve.</p>\n")
    w('<p class="muted">L0: the floor, no waiver. L1: a waiver needs a documented decision. '
      "L2: a waiver needs a stated rationale.</p>\n")
    w('<nav><a href="#suggestions">Suggestions</a> · <a href="#findings">Findings</a> · '
      '<a href="#code">Code-level findings</a> · <a href="#coverage">Coverage</a> · '
      '<a href="#preserve">What works</a> · <a href="#appendix">Appendix</a></nav>\n</section>\n')

    # 4. Suggestions table.
    w('<section id="suggestions">\n<h2>Suggestions</h2>\n')
    if quick:
        w(f"<p>Approving “quick wins” takes all {len(quick)}.</p>\n")
    w("<table>\n<tr><th>S#</th><th>Suggestion</th><th>Fixes</th><th>Controls</th>"
      "<th>Impact</th><th>Cost</th></tr>\n")
    for s in doc["suggestions"]:
        cls = ' class="quick"' if s.get("quickWin") else ""
        w(f'<tr id="{esc(s["id"])}"{cls}><td>{esc(s["id"])}</td><td>{esc(s["text"])}</td>'
          f'<td>{", ".join(link(f) for f in s["fixes"])}</td><td>{esc(", ".join(s["controls"]))}</td>'
          f'<td>{esc(s["impact"])}</td><td>{esc(s["cost"])}</td></tr>\n')
    w("</table>\n")
    if doc.get("declined"):
        w(f"<p><strong>Considered and declined:</strong> {esc(doc['declined'])}</p>\n")
    if doc.get("upstream"):
        w(f"<p><strong>Upstream, not local:</strong> {esc(doc['upstream'])}</p>\n")
    w("</section>\n")

    # 5. Annotated findings.
    w('<section id="findings">\n<h2>Findings</h2>\n')
    for f in doc["findings"]:
        pages = ", ".join(dict.fromkeys(c["page"] for c in f["crops"]))
        w(f'<article class="finding" id="{esc(f["id"])}">\n<figure><img alt="{esc(f["title"])}" '
          f'src="{png_uri(figures[f["id"]])}">\n<figcaption>From {esc(pages)}</figcaption></figure>\n'
          f'<div><h3>{esc(f["id"])} {esc(f["title"])}</h3>\n<p><span class="pill">{esc(f["tier"])}</span> '
          f'{esc(", ".join(f["controls"]))} <a class="chip" href="#{esc(f["fix"])}">Fix: {esc(f["fix"])}</a></p>\n'
          f'<p>{esc(f["text"])}</p></div>\n</article>\n')
    w("</section>\n")

    # 6. Code-level findings.
    w('<section id="code">\n<h2>Code-level findings</h2>\n')
    if doc.get("codeFindings"):
        w("<table>\n<tr><th>F#</th><th>Finding</th><th>Tier</th><th>Location</th><th>Fix</th></tr>\n")
        for f in doc["codeFindings"]:
            w(f'<tr id="{esc(f["id"])}"><td>{esc(f["id"])}</td><td>{esc(f["text"])}</td><td>{esc(f["tier"])}</td>'
              f'<td><code>{esc(f["location"])}</code></td><td>{link(f["fix"])}</td></tr>\n')
        w("</table>\n")
    else:
        w("<p>None.</p>\n")
    w("</section>\n")

    # 7. Coverage table. "verify" means the evidence is incomplete, not failed.
    w('<section id="coverage">\n<h2>Coverage</h2>\n<table>\n<tr><th>Rule</th><th>Verdict</th><th>Note</th></tr>\n')
    for row in doc["coverage"]:
        verdict = row["verdict"].lower()
        w(f'<tr><td>{esc(row["rule"])}</td><td class="v-{esc(verdict)}">{esc(verdict)}</td>'
          f'<td>{esc(row["note"])}</td></tr>\n')
    w("</table>\n</section>\n")

    # 8. What works, preserve.
    w('<section id="preserve">\n<h2>What works, preserve</h2>\n<ul>\n')
    for item in doc.get("preserve", []):
        w(f"<li>{esc(item)}</li>\n")
    w("</ul>\n</section>\n")

    # 9. Appendix.
    w('<section id="appendix" class="appendix">\n<h2>Appendix: full captures</h2>\n')
    for caption, uri in appendix:
        w(f'<figure><img alt="{esc(caption)}" src="{uri}">\n<figcaption>{esc(caption)}</figcaption></figure>\n')
    w("</section>\n</body>\n</html>\n")
    return "".join(out), sheet


def main(argv=None):
    p = argparse.ArgumentParser(description="Build the critique report from a findings file.")
    p.add_argument("findings", help="the findings file the agent wrote")
    p.add_argument("--out", required=True, help="the directory for report.html and contact-sheet.png")
    p.add_argument("--width", type=int, default=DEFAULT_WIDTH,
                   help=f"the width of the copy the agent judged from (default {DEFAULT_WIDTH})")
    args = p.parse_args(argv)

    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print(f"ERROR critique-report.py: Pillow is not installed, so no report was built. "
              f"Install it with `{INSTALL}` and rerun.")
        return 4

    try:
        with open(args.findings, encoding="utf-8") as fh:
            doc = json.load(fh)
        validate(doc)
    except (OSError, ValueError, FindingsError) as exc:
        print(f"ERROR critique-report.py: the findings file is not valid: {exc}. Fix it and rerun.")
        return 2

    try:
        report, sheet = build(doc, os.path.dirname(os.path.abspath(args.findings)), args.width, Image, ImageDraw)
    except CaptureError as exc:
        print(f"ERROR critique-report.py: {exc}. Recapture the page and rerun.")
        return 4
    except FindingsError as exc:
        print(f"ERROR critique-report.py: the findings file is not valid: {exc}. Fix it and rerun.")
        return 2
    except (KeyError, TypeError, ValueError) as exc:
        print(f"ERROR critique-report.py: the findings file is not valid: {exc!r}. Fix it and rerun.")
        return 2

    os.makedirs(args.out, exist_ok=True)
    report_path = os.path.join(args.out, "report.html")
    sheet_path = os.path.join(args.out, "contact-sheet.png")
    sheet.save(sheet_path)
    with open(report_path, "w", encoding="utf-8") as fh:
        fh.write(report)
    print(f"report: {report_path}")
    print(f"contact sheet: {sheet_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
