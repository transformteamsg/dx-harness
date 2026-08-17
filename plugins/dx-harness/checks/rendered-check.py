#!/usr/bin/env python3
"""
Rendered check — checks/rendered-check.py
Runs axe against a page that is ALREADY OPEN, plus the harness's own page
evaluations for the rules no maintained tool provides. This is the rendered
half of the accessibility stack; the static half is `a11y-eslint.py`'s
jsx-a11y preset and `a11y-static.py`'s bespoke FOCUS rule.

The harness never boots the target app
──────────────────────────────────────
No dev server, no static export, no jsdom, in any code path. The app is
already serving or there is no run. `playwright.config.ts`'s `webServer` block
at the site root is the site's own end-to-end config; this check neither reuses
nor imitates it.

It launches no browser either. The design loop's capture step already opens one
at the target viewport (`skills/design/dx-design-execute/verify.md`), so this
check attaches to that session over CDP and hands it back. A standalone run
(`dx-design-critique`, or a re-audit walked from `checks/reaudit-scope.py`) asks
the person for a URL and drives the same open session to it. With no session to
attach to, the layer did not run — which is a NOTE and an exit 0, never a pass.

Python at the CLI boundary, JavaScript only as a driver
───────────────────────────────────────────────────────
Every check in this directory is Python, shares `checklib.py`, and is wrapped
by `detect.py` as a subprocess. So Python owns the CLI, the rule-map lookup,
the three buckets, the ERROR/NOTE lines and the exit code;
`checks/rendered/axe-driver.mjs` only attaches, runs one matrix cell and prints
one JSON object.

The run matrix, fixed
─────────────────────
  cell                   viewport  theme    media            decides
  360-light              360       light    default          target-size, contrast, all mapped rules
  1280-light             1280      light    default          all mapped rules
  360-dark               360       dark     default          contrast in dark, all mapped rules
  1280-dark              1280      dark     default          contrast in dark, all mapped rules
  1280-reduced-motion    1280      default  reduced-motion   A11Y-5 only

Each cell scrolls to the document end in viewport-height steps and back to the
top before axe runs, because axe skips `outsideViewport`. `target-size` is
enabled explicitly (axe ships it off; Lighthouse re-enables it), and the run
names its rules rather than reaching for a `runOnly` tag, which would silently
drop mapped ones. Where a product has no dark mode, the dark cells record
`N/A, product has no dark mode` — a truthful outcome, never a pass.

Coverage
────────
  A11Y-1   axe color-contrast, both themes    incomplete items stay manual
  A11Y-2   nothing                            no axe rule checks a visible focus indicator
  A11Y-3   axe label                          cross-file htmlFor/id stays manual
  A11Y-4   axe target-size, force-enabled
  A11Y-5   the reduced-motion evaluation      essential-versus-decorative stays manual
  A11Y-6   axe image-alt, svg-img-alt         informative-versus-decorative stays manual
  A11Y-7   axe list, listitem, heading-order  descriptive headings stay manual
  A11Y-8   the aria suite, visible only       closed overlays and state changes stay manual
  A11Y-9   axe document-title, html-has-lang  SPA per-view titles stay manual
  A11Y-10  axe bypass, report-only            never gates
  A11Y-11  nothing                            needs interaction; fully manual

Every one of those keeps a manual remainder, and every one of them depends on a
URL being available, so none of them reaches `enforced: script`.

Output
──────
  ERROR <route>:<cell> [<CTL>][<rule>] <message> — suggest: <…>
  NOTE  rendered-check: <…>
Exit 0 on a clean run or NOTEs only; exit 1 with ERROR lines on any violation
or malformed waiver marker. Never exit 1 without an ERROR line and never let a
traceback reach stderr: `detect.py` classifies both as a crash, which would
report an uncovered layer as harness breakage.

Usage
─────
  python3 checks/rendered-check.py [--session <name>] [--url <url>]
                                   [--viewports 360,1280] [--themes auto|light|dark|both]
                                   [--json] [--self-test]
"""

import argparse
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys

_CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_checklib():
    path = os.path.join(_CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_dx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()

# The rule map's layer name for this check.
LAYER = "axe-rendered"

DRIVER = os.path.join(_CHECKS_DIR, "rendered", "axe-driver.mjs")

# The CLI the capture step already uses. It is asked for one thing only: the
# CDP endpoint of the session it has open.
BROWSER_CLI = "agent-browser"

DEFAULT_VIEWPORTS = (360, 1280)
VIEWPORT_HEIGHT = 900
REDUCED_MOTION_VIEWPORT = 1280
REDUCED_MOTION_CELL = f"{REDUCED_MOTION_VIEWPORT}-reduced-motion"

# axe ships target-size off; Lighthouse re-enables it, and A11Y-4 has no other
# coverage, so it is named here rather than left to the default rule set.
FORCE_ENABLED_RULES = ("target-size",)

# Report-only: A11Y-10's finding is printed and counted, but never gates.
REPORT_ONLY_CONTROLS = frozenset({"A11Y-10"})

# Same ceiling detect.py puts on a wrapped check: a hung tool is a failure,
# never a silent pass.
DRIVER_TIMEOUT = 180
BROWSER_CLI_TIMEOUT = 30


class DriverError(Exception):
    """The driver could not attach or axe could not run — the same class as no
    page at all, reported as NOTEs and exit 0, never as a crash."""


# ── The page-evaluation registry ───────────────────────────────────────────────
#
# axe has no rule for reduced motion, and #155's SLP-4 and SLP-6 rules are
# bespoke injected-DOM evaluations too. So the runner carries a registry of
# page evaluations beside the axe rules: each declares the control it decides,
# the cells it needs, and one JavaScript expression evaluated in the page that
# returns a list of {selector, message}. Everything else — the finding lines,
# the buckets, the waiver markers, the state restore, the theme loop — applies
# to a registered evaluation exactly as it applies to an axe result.

_CSS_PATH_JS = """
  function cssPath(el) {
    if (!el || el.nodeType !== 1) return "(no element)";
    if (el.id) return "#" + CSS.escape(el.id);
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && parts.length < 6) {
      let part = node.localName;
      const cls = (node.getAttribute("class") || "").trim().split(/\\s+/).filter(Boolean);
      if (cls.length) part += "." + cls.slice(0, 2).map(CSS.escape).join(".");
      parts.unshift(part);
      if (node.id) { parts[0] = "#" + CSS.escape(node.id); break; }
      node = node.parentElement;
    }
    return parts.join(" > ");
  }
"""

# The floor below which an animation is effectively instantaneous. The standard
# reduced-motion reset sets `animation-duration: 0.01ms !important`, which is a
# correct response to the media query, not a violation of it — a check never
# blocks on a guess, so the sure cases are the ones that still visibly move.
MIN_MOVING_DURATION_MS = 50

# Whether a given animation is ESSENTIAL is a judgment this evaluation cannot
# make, so that half stays with the evaluator. This reports what is still
# moving under `prefers-reduced-motion`, and names it.
REDUCED_MOTION_JS = """(() => {
  const FLOOR = %d;
  %s
  const findings = [];
  const seen = new Set();
  const add = (el, message) => {
    const selector = cssPath(el);
    const key = selector + "|" + message;
    if (seen.has(key) || findings.length >= 25) return;
    seen.add(key);
    findings.push({ selector, message });
  };
  for (const animation of document.getAnimations()) {
    if (animation.playState !== "running") continue;
    const effect = animation.effect;
    const timing = effect && effect.getTiming ? effect.getTiming() : null;
    const duration = timing ? Number(timing.duration) || 0 : 0;
    if (duration < FLOOR) continue;
    const infinite = timing && timing.iterations === Infinity;
    const target = effect && effect.target ? effect.target : document.documentElement;
    add(target, "animation still running under prefers-reduced-motion (" +
      (infinite ? "looping, " : "") + duration + "ms)");
  }
  const elements = Array.from(document.body ? document.body.querySelectorAll("*") : []).slice(0, 4000);
  for (const el of elements) {
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height) continue;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") continue;
    const animationName = style.animationName;
    const raw = style.animationDuration || "0s";
    const animationDuration = parseFloat(raw) * (raw.trim().endsWith("ms") ? 1 : 1000);
    if (animationName && animationName !== "none" && animationDuration >= FLOOR) {
      add(el, "computed animation-name '" + animationName + "' runs for " +
        animationDuration + "ms under prefers-reduced-motion");
    }
  }
  return findings;
})()""" % (MIN_MOVING_DURATION_MS, _CSS_PATH_JS)

PAGE_EVALUATIONS = (
    {
        "id": "dx/reduced-motion",
        "cells": (REDUCED_MOTION_CELL,),
        "js": REDUCED_MOTION_JS,
    },
)


# ── The run matrix ─────────────────────────────────────────────────────────────

def resolve_themes(requested, dark_supported):
    """The themes to run. `auto` follows the product: light always, dark only
    where a dark layer exists. An explicit `dark` or `both` still runs, and the
    dark cells record N/A where the product has no dark mode — a truthful
    outcome, never a pass."""
    if requested == "light":
        return ["light"]
    if requested == "dark":
        return ["dark"]
    if requested == "both":
        return ["light", "dark"]
    return ["light", "dark"] if dark_supported else ["light"]


def build_cells(viewports, themes):
    """The viewport x theme cells, in a stable order."""
    cells = []
    for width in viewports:
        for theme in themes:
            cells.append({
                "id": f"{width}-{theme}",
                "viewport": {"width": width, "height": VIEWPORT_HEIGHT},
                "theme": theme,
                "media": {},
            })
    return cells


def reduced_motion_cell():
    """One reduced-motion cell, at 1280 in the product's default theme. A11Y-5
    is neither viewport-dependent nor theme-dependent, so a second one would
    buy nothing."""
    return {
        "id": REDUCED_MOTION_CELL,
        "viewport": {"width": REDUCED_MOTION_VIEWPORT, "height": VIEWPORT_HEIGHT},
        "theme": "default",
        "media": {"reducedMotion": "reduce"},
    }


def build_matrix(viewports, themes):
    """Every cell the run covers: the viewport x theme grid plus the single
    reduced-motion cell."""
    return build_cells(viewports, themes) + [reduced_motion_cell()]


# ── The rule-to-control lookup ─────────────────────────────────────────────────

def axe_rule_ids(rule_map):
    """The axe rule ids the map names, without their `axe/` prefix. The aria
    suite is not here: it is resolved from the installed axe at run time."""
    return [rule[len("axe/"):] for rule in sorted(rule_map["rules"])
            if rule.startswith("axe/")]


def control_for_rule(rule_id, rule_map, aria_rules=()):
    """The control a fired rule belongs to, or None. An `aria-` rule maps to the
    map's `aria_prefix_control` whether or not the harness has seen it before,
    so the suite tracks the installed axe with no harness edit."""
    direct = rule_map["rules"].get(f"axe/{rule_id}")
    if direct:
        return direct
    evaluation = rule_map["rules"].get(rule_id)
    if evaluation:
        return evaluation
    if rule_id.startswith("aria-") or rule_id in aria_rules:
        return rule_map.get("aria_prefix_control")
    return None


# ── Attaching to the page the capture step already opened ──────────────────────

DEFAULT_SESSION = "default"


def live_sessions(runner=None):
    """The capture sessions that already exist, by name.

    This is asked FIRST, and it is the whole reason the runner cannot launch a
    browser by accident: measured on agent-browser 0.29.1, asking for the CDP
    endpoint of a session that does not exist CREATES it, browser and all. So
    the name is checked against this list before any endpoint is requested.
    """
    run_cmd = runner or _run_command
    code, out, _err = run_cmd([BROWSER_CLI, "session", "list", "--json"],
                              timeout=BROWSER_CLI_TIMEOUT)
    if code != 0:
        return []
    try:
        data = json.loads((out or "").strip().splitlines()[-1])
    except (ValueError, IndexError):
        return []
    sessions = (data.get("data") or {}).get("sessions") if isinstance(data, dict) else None
    return [s for s in sessions if isinstance(s, str)] if isinstance(sessions, list) else []


def resolve_cdp_url(session=None, runner=None):
    """The CDP endpoint of a live capture session, or None when there is none.

    Asks the CLI the capture step already uses, and only about a session that
    is already listed as live. No CLI, no such session, or no endpoint all mean
    the same thing — the layer did not run, which is a NOTE and an exit 0.
    """
    run_cmd = runner or _run_command
    if shutil.which(BROWSER_CLI) is None:
        return None
    name = session or DEFAULT_SESSION
    if name not in live_sessions(runner=run_cmd):
        return None
    argv = [BROWSER_CLI, "get", "cdp-url"]
    if session:
        argv += ["--session", session]
    code, out, _err = run_cmd(argv, timeout=BROWSER_CLI_TIMEOUT)
    if code != 0:
        return None
    endpoint = (out or "").strip().splitlines()
    endpoint = endpoint[-1].strip() if endpoint else ""
    if not endpoint.startswith(("ws://", "wss://", "http://", "https://")):
        return None
    return endpoint


def _run_command(argv, timeout, stdin_text=None):
    try:
        proc = subprocess.run(argv, capture_output=True, text=True,
                              input=stdin_text, timeout=timeout)
        return proc.returncode, proc.stdout, proc.stderr
    except subprocess.TimeoutExpired:
        return 1, "", f"timed out after {timeout}s"
    except OSError as exc:
        return 1, "", str(exc)


def build_job(cdp_url, url, cell, rule_map):
    """The one JSON object the driver reads. The driver never opens the rule
    map: Python resolves the rules and hands them over."""
    return {
        "cdpUrl": cdp_url,
        "url": url,
        "cell": cell["id"],
        "viewport": cell["viewport"],
        "theme": cell["theme"],
        "media": cell["media"],
        # The reduced-motion cell decides A11Y-5 and nothing else: running axe
        # there again would report every other control's findings a second
        # time, in a cell whose only reason to exist is the media emulation.
        "runAxe": cell["id"] != REDUCED_MOTION_CELL,
        "axeRules": axe_rule_ids(rule_map),
        "ariaPrefix": "aria-",
        "forceEnable": list(FORCE_ENABLED_RULES),
        "evaluations": [
            {"id": ev["id"], "js": ev["js"]}
            for ev in PAGE_EVALUATIONS if cell["id"] in ev["cells"]
        ],
        "waiveAttribute": WAIVE_ATTRIBUTE,
    }


def run_cell(job, node="node", runner=None):
    """Spawn the driver for one cell and return its payload. Any failure to
    attach or run is a DriverError — the same class as no page at all."""
    run_cmd = runner or _run_command
    code, out, err = run_cmd([node, DRIVER], timeout=DRIVER_TIMEOUT,
                             stdin_text=json.dumps(job))
    text = (out or "").strip()
    if not text:
        tail = (err or "").strip().splitlines()
        raise DriverError(tail[-1] if tail else f"driver exited {code} with no output")
    try:
        payload = json.loads(text.splitlines()[-1])
    except ValueError as exc:
        raise DriverError(f"driver output is not readable JSON — {exc}")
    if not payload.get("ok"):
        raise DriverError(payload.get("error") or "driver did not attach")
    return payload


# ── Findings ───────────────────────────────────────────────────────────────────

WAIVE_ATTRIBUTE = "data-dx-waive"

# The DOM analogue of the inline `dx-waive <CTL> reason="…"` comment, for a
# layer whose findings have no source file to carry a comment. It is element
# scoped, permanently: a per-URL ignore list would exempt a whole page and hide
# real regressions elsewhere on it, and a register-scoped exemption would make
# a permanent blind spot. Both were considered and declined on the record.
#
#     data-dx-waive="<CTL-ID>[ <CTL-ID>...] reason=<free text to the end>"
#
# Two deliberate departures from the inline grammar, and one from the inline
# convention:
#   - No quotes around the reason. The inline form's `reason="…"` cannot survive
#     inside a JSX attribute value that is itself double quoted.
#   - The reason is required here where it is optional inline: a rendered
#     waiver has no surrounding comment or file context to explain itself, so
#     an unexplained one is malformed.
#   - It SUPPRESSES where the inline form downgrades to `[waiver-claimed]` and
#     still exits 1. A downgrade would still fail a repo on its own teaching
#     exhibit, which is the whole problem the ruling solves.
DOM_WAIVE_RE = re.compile(
    r'^\s*(?P<ids>[A-Z0-9]+-\d+(?:\s+[A-Z0-9]+-\d+)*)\s+reason=(?P<reason>\S.*?)\s*$'
)

# The bracket a marker error rides when no control id is recoverable. It is not
# a catalogue control and must never be added to catalog.yaml; it exists only so
# the line keeps the parseable finding shape.
WAIVE_MARKER_ID = "DX-WAIVE"


class MarkerError(Exception):
    """A malformed marker. Authored content, so it is an ERROR and it
    suppresses nothing — silently ignoring a broken one either over-suppresses
    or under-suppresses."""


def parse_dom_waiver(value):
    """`(ids, reason)` from a marker's attribute value. `ids` is
    order-preserving and de-duplicated; `reason` is the verbatim tail."""
    match = DOM_WAIVE_RE.match(value or "")
    if not match:
        raise MarkerError(f"does not parse: expected `<CTL-ID>... reason=<text>`, "
                          f"got `{(value or '').strip()}`")
    ids, seen = [], set()
    for cid in match.group("ids").split():
        if cid not in seen:
            seen.add(cid)
            ids.append(cid)
    return ids, match.group("reason")


def read_markers(payload, tiers, cell_id):
    """Turn the driver's raw markers into (suppression, errors, notes).

    `suppression` maps a node key to the control ids waived for it; a nested
    marker's ids union with its enclosing marker's, because a node inside both
    is reported as inside both. A marker naming an L0 control, or a control the
    catalogue does not have, is an ERROR and suppresses nothing for that id —
    the inline path already refuses an L0 waiver, and the DOM form must not
    become the way around it."""
    route = payload.get("route") or "/"
    suppression, errors, notes = {}, [], []
    for marker in payload.get("waived") or []:
        selector = marker.get("selector") or "(unknown element)"
        try:
            ids, reason = parse_dom_waiver(marker.get("value"))
        except MarkerError as exc:
            errors.append(checklib.emit_rendered_error(
                route, cell_id, WAIVE_MARKER_ID,
                f"{WAIVE_ATTRIBUTE} on `{selector}` {exc}",
                f"write `{WAIVE_ATTRIBUTE}=\"<CTL-ID> reason=<why>\"`; a rendered "
                f"waiver with no reason explains nothing"))
            continue
        honoured = []
        for cid in ids:
            tier = tiers.get(cid)
            if tier is None:
                errors.append(checklib.emit_rendered_error(
                    route, cell_id, cid,
                    f"{WAIVE_ATTRIBUTE} on `{selector}` references an unknown control id",
                    "name a control that exists in standards/catalog.yaml"))
                continue
            if tier == "L0":
                errors.append(checklib.emit_rendered_error(
                    route, cell_id, cid,
                    f"{WAIVE_ATTRIBUTE} on `{selector}` names an L0 control; "
                    f"L0 is never waivable",
                    "fix the finding; an L0 control has no waiver of any kind"))
                continue
            honoured.append(cid)
        if not honoured:
            continue
        for key in marker.get("contains") or []:
            suppression.setdefault(key, set()).update(honoured)
        notes.append(
            f"NOTE  rendered-check: {route}:{cell_id} honoured {WAIVE_ATTRIBUTE} on "
            f"`{selector}` for {', '.join(honoured)} — reason: {reason}")
    return suppression, errors, notes


def node_target(node):
    """axe names a node by a list of selectors, one per frame. The last is the
    selector inside its own document, which is the one a person can act on."""
    target = node.get("target") or []
    if isinstance(target, list) and target:
        return str(target[-1])
    return str(target) if target else "(unknown node)"


def node_key(node):
    """The key the driver reports per-node facts under — axe's own target list,
    which is unique per node including across frames."""
    return json.dumps(node.get("target") or [])


def demote_hidden(control, node, hidden_keys):
    """"Visible components only" for A11Y-8, enforced by demotion rather than
    selector surgery: the runner opens nothing, so anything reachable only
    through interaction is already out of scope, and a finding on markup a
    person cannot currently reach moves into the incomplete bucket because axe
    judged something they cannot see."""
    return control == "A11Y-8" and node_key(node) in set(hidden_keys or ())


def translate_violations(payload, rule_map, cell_id, suppression=None):
    """axe's violations become ERROR lines under the control each rule maps to.
    A rule with no row is a misconfiguration, not a dropped finding: it is
    reported as an operational ERROR and no control id is guessed.

    Returns (errors, demoted): `demoted` carries the findings that moved into
    the incomplete bucket, so nothing is lost on the way out of this one."""
    errors, demoted = [], []
    route = payload.get("route") or "/"
    aria = set(payload.get("aria_rules") or [])
    hidden = payload.get("hidden_nodes") or []
    waived = suppression or {}
    for rule in payload.get("violations", []):
        rule_id = rule.get("id") or "(unknown rule)"
        control = control_for_rule(rule_id, rule_map, aria)
        for node in rule.get("nodes", []):
            selector = node_target(node)
            if control in waived.get(node_key(node), ()):
                continue  # inside a marker naming this control, for this subtree only
            if control is None:
                errors.append(
                    f"ERROR rendered-check: axe rule '{rule_id}' fired at {route} "
                    f"({cell_id}) on {selector} but has no row in "
                    f"{checklib.RULE_MAP_FILENAME} — add one; no control id is guessed")
                continue
            if demote_hidden(control, node, hidden):
                demoted.append((control, rule_id, selector,
                                "axe judged markup a person cannot currently reach "
                                "(hidden subtree)"))
                continue
            if control in REPORT_ONLY_CONTROLS:
                demoted.append((control, rule_id, selector,
                                "report-only: skip-link-first confirmation stays with "
                                "the manual pass"))
                continue
            errors.append(checklib.emit_rendered_error(
                route, cell_id, control,
                f"{rule_id} at {selector}",
                (rule.get("help") or "fix per axe " + rule_id),
                extra=rule_id))
    for finding in payload.get("evaluation_findings", []):
        rule_id = finding.get("rule") or "(unknown evaluation)"
        control = control_for_rule(rule_id, rule_map, aria)
        if finding.get("failed"):
            errors.append(
                f"ERROR rendered-check: page evaluation '{rule_id}' failed at "
                f"{route} ({cell_id}) — {finding.get('message')}")
            continue
        if control is None:
            errors.append(
                f"ERROR rendered-check: page evaluation '{rule_id}' has no row in "
                f"{checklib.RULE_MAP_FILENAME} — add one; no control id is guessed")
            continue
        if control in waived.get(f"eval:{rule_id}:{finding.get('selector')}", ()):
            continue
        errors.append(checklib.emit_rendered_error(
            route, cell_id, control,
            f"{rule_id} at {finding.get('selector') or '(no element)'}",
            finding.get("message") or "stop this animation under prefers-reduced-motion",
            extra=rule_id))
    return errors, demoted


def translate_incomplete(payload, rule_map, cell_id, demoted=()):
    """The third bucket, beside violations and passes. axe's `incomplete`
    results are the ones it could not decide, so they are named as items for
    the manual accessibility pass to verify by hand: never dropped, never
    counted as passes, and never gated on. They ride the NOTE channel, which
    `detect.py` collects while keeping exit 0."""
    notes = []
    route = payload.get("route") or "/"
    aria = set(payload.get("aria_rules") or [])
    for rule in payload.get("incomplete", []):
        rule_id = rule.get("id") or "(unknown rule)"
        control = control_for_rule(rule_id, rule_map, aria) or "(unmapped)"
        for node in rule.get("nodes", []):
            notes.append(
                f"NOTE  rendered-check: {route}:{cell_id} [{control}][{rule_id}] "
                f"{node_target(node)} — axe could not decide this one; verify it by "
                f"hand in the manual accessibility pass")
    for control, rule_id, selector, reason in demoted:
        notes.append(
            f"NOTE  rendered-check: {route}:{cell_id} [{control}][{rule_id}] "
            f"{selector} — {reason}; verify it by hand in the manual "
            f"accessibility pass")
    return notes


def inapplicable_notes(payload, rule_map, controls, cell_id):
    """Where every rule mapped to a control came back `inapplicable` for a cell
    — no images on the page, so `image-alt` never applied — that control records
    N/A for the cell with the reason. Recording it as a pass would claim
    coverage the run did not exercise."""
    inapplicable = set(payload.get("inapplicable") or [])
    if not inapplicable:
        return []
    aria = set(payload.get("aria_rules") or [])
    by_control = {}
    for rule in axe_rule_ids(rule_map):
        control = control_for_rule(rule, rule_map, aria)
        by_control.setdefault(control, set()).add(rule)
    for rule in aria:
        by_control.setdefault(rule_map.get("aria_prefix_control"), set()).add(rule)
    notes = []
    for control in controls:
        rules = by_control.get(control)
        if rules and rules <= inapplicable:
            notes.append(
                f"NOTE  rendered-check: {payload.get('route')}:{cell_id} [{control}] "
                f"N/A — every rule mapped to it ({', '.join(sorted(rules))}) was "
                f"inapplicable to this page; not reported as passing")
    return notes


def passes_note(payload, cell_id):
    """Passes are counted, never printed per node: a per-node pass list invites
    reading "axe found nothing here" as "this control is met", which it is not
    — every control this layer covers keeps a manual remainder."""
    count = payload.get("passes_count") or 0
    return [f"NOTE  rendered-check: {payload.get('route')}:{cell_id} — {count} node "
            f"check(s) passed; a pass here is not a control met, since every control "
            f"this layer covers keeps a manual remainder"]


def manual_verification_notes(reason, controls, tiers=None):
    """The did-not-run report: name the reason, name every control the layer
    covers, and say that an L0 control still blocks. A control is never
    reported as passing by a layer that did not check it."""
    lines = [f"NOTE  rendered-check: did not run — {reason}",
             f"NOTE  rendered-check: {', '.join(controls)} go to manual verification "
             f"(rendered check did not run; not reported as passing)"]
    l0 = checklib.l0_subset(controls, tiers)
    if l0:
        lines.append(f"NOTE  rendered-check: {', '.join(l0)} are L0 — they block until "
                     f"verified by some path")
    return lines


def dark_mode_na_notes(controls, cells):
    """The product has no dark mode. The dark cells record N/A with the reason
    rather than a pass, and no dark finding is invented."""
    if not cells:
        return []
    return [f"NOTE  rendered-check: {', '.join(cells)} — N/A, product has no dark mode "
            f"(no theme toggle and no .dark or [data-theme=\"dark\"] layer); "
            f"{', '.join(controls)} keep their light-cell result only"]


def restore_notes(payload):
    """The session is handed back as it was found. When it could not be, say so
    loudly enough that the next screenshot is not trusted as evidence."""
    if payload.get("restored", True):
        return []
    return [f"NOTE  rendered-check: the browser session was NOT restored after "
            f"{payload.get('cell')} ({payload.get('restore_error')}) — re-open the "
            f"page before taking any further screenshot"]


# ── The runner ─────────────────────────────────────────────────────────────────

def run(session=None, url=None, viewports=DEFAULT_VIEWPORTS, themes="auto",
        node="node", cdp_resolver=None, cell_runner=None):
    """Run the layer. Returns (exit_code, output_lines, records)."""
    try:
        rule_map = checklib.load_rule_map()
        controls = checklib.layer_controls(LAYER, rule_map)
    except checklib.RuleMapError as exc:
        return 1, [f"ERROR rendered-check: {exc}"], []

    tiers = checklib.catalog_tiers()
    resolve = cdp_resolver or resolve_cdp_url
    execute = cell_runner or (lambda job: run_cell(job, node=node))

    cdp_url = resolve(session)
    if cdp_url is None:
        reason = ("no browser session to attach to"
                  if not url else
                  f"no browser session to attach to; {url} was named but nothing has it open")
        return 0, manual_verification_notes(reason, controls, tiers), []

    out, records = [], []
    ran_cells = []
    dark_supported = None

    first_pass = build_cells(viewports, resolve_themes(themes, False))
    payloads = []
    for cell in first_pass:
        try:
            payload = execute(build_job(cdp_url, url, cell, rule_map))
        except DriverError as exc:
            return 0, manual_verification_notes(
                f"axe did not run at {url or 'the open page'} (driver: {exc})",
                controls, tiers), []
        payloads.append(payload)
        ran_cells.append(cell["id"])
        if dark_supported is None:
            dark_supported = bool(payload.get("dark_supported"))

    full = build_cells(viewports, resolve_themes(themes, bool(dark_supported)))
    remaining = [c for c in full if c["id"] not in ran_cells] + [reduced_motion_cell()]
    for cell in remaining:
        try:
            payload = execute(build_job(cdp_url, url, cell, rule_map))
        except DriverError as exc:
            out.append(f"NOTE  rendered-check: {cell['id']} did not run ({exc}) — "
                       f"{', '.join(controls)} go to manual verification for that cell")
            continue
        payloads.append(payload)
        ran_cells.append(cell["id"])

    wanted_dark = [c["id"] for c in build_cells(viewports, ["dark"])]
    if not dark_supported and "dark" in resolve_themes(themes, True) \
            and not any(c in ran_cells for c in wanted_dark):
        out.extend(dark_mode_na_notes(controls, wanted_dark))
        for control in controls:
            for cell_id in wanted_dark:
                records.append({"control": control, "cell": cell_id, "outcome": "n/a",
                                "rule": None, "route": None, "selector": None,
                                "message": "product has no dark mode", "reason": None})

    errors = []
    for payload in payloads:
        cell_id = payload.get("cell")
        suppression, marker_errors, marker_notes = read_markers(payload, tiers, cell_id)
        errors.extend(marker_errors)
        out.extend(marker_notes)
        cell_errors, demoted = translate_violations(payload, rule_map, cell_id,
                                                    suppression)
        errors.extend(cell_errors)
        out.extend(translate_incomplete(payload, rule_map, cell_id, demoted))
        out.extend(inapplicable_notes(payload, rule_map, controls, cell_id))
        out.extend(passes_note(payload, cell_id))
        out.extend(restore_notes(payload))
        records.extend(payload_records(payload, rule_map, controls))

    out = errors + out
    return (1 if errors else 0), out, records


def payload_records(payload, rule_map, controls=()):
    """The in-memory run record, one row per control decision in a cell. A
    record never says `pass` for a control the cell did not exercise: the
    outcomes are `violation`, `incomplete`, `n/a` and `not-run`, and the last
    two both name their control for manual verification."""
    route = payload.get("route")
    cell_id = payload.get("cell")
    aria = set(payload.get("aria_rules") or [])
    hidden = payload.get("hidden_nodes") or []
    rows = []
    for rule in payload.get("violations", []):
        rule_id = rule.get("id")
        control = control_for_rule(rule_id, rule_map, aria)
        for node in rule.get("nodes", []):
            demoted = demote_hidden(control, node, hidden) \
                or control in REPORT_ONLY_CONTROLS
            rows.append({"control": control, "cell": cell_id,
                         "outcome": "incomplete" if demoted else "violation",
                         "rule": rule_id, "route": route, "selector": node_target(node),
                         "message": rule.get("help") or "", "reason": None})
    for rule in payload.get("incomplete", []):
        rule_id = rule.get("id")
        control = control_for_rule(rule_id, rule_map, aria)
        for node in rule.get("nodes", []):
            rows.append({"control": control, "cell": cell_id, "outcome": "incomplete",
                         "rule": rule_id, "route": route, "selector": node_target(node),
                         "message": rule.get("help") or "", "reason":
                         "axe could not decide this one"})
    for finding in payload.get("evaluation_findings", []):
        if finding.get("failed"):
            continue
        rule_id = finding.get("rule")
        rows.append({"control": control_for_rule(rule_id, rule_map, aria),
                     "cell": cell_id, "outcome": "violation", "rule": rule_id,
                     "route": route, "selector": finding.get("selector"),
                     "message": finding.get("message") or "", "reason": None})
    inapplicable = set(payload.get("inapplicable") or [])
    for control in controls:
        rules = {r for r in axe_rule_ids(rule_map)
                 if control_for_rule(r, rule_map, aria) == control}
        if rules and rules <= inapplicable:
            rows.append({"control": control, "cell": cell_id, "outcome": "n/a",
                         "rule": None, "route": route, "selector": None,
                         "message": "every rule mapped to it was inapplicable to this page",
                         "reason": "not exercised"})
    return rows


# ── Self-test ──────────────────────────────────────────────────────────────────

def strip_js_comments(source):
    """The driver's code with its `//` and `/* … */` comments removed, so a
    case that reads the source for a forbidden call cannot be satisfied — or
    broken — by the prose explaining why the call is forbidden."""
    out, in_block = [], False
    for line in source.splitlines():
        stripped = checklib.strip_block_comments(line, in_block)
        in_block = checklib.ends_in_block_comment(line, in_block)
        out.append(re.sub(r"//.*$", "", stripped))
    return "\n".join(out)


def _load_detect():
    """detect.py, loaded by path so the self-test can assert findings against
    the real `_FINDING_RE` that reverse-parses them."""
    path = os.path.join(_CHECKS_DIR, "detect.py")
    spec = importlib.util.spec_from_file_location("_dx_detect", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _axe_payload(cell="1280-light", route="/standards", violations=(), **extra):
    payload = {
        "ok": True, "error": None, "url": f"http://localhost:3000{route}",
        "route": route, "cell": cell,
        "viewport": {"width": 1280, "height": 900}, "axe_version": "4.13.0",
        "dark_supported": True, "violations": list(violations), "incomplete": [],
        "passes_count": 7, "inapplicable": [], "aria_rules": ["aria-allowed-attr"],
        "evaluation_findings": [], "waived": [], "restored": True,
        "restore_error": None,
    }
    payload.update(extra)
    return payload


def _violation(rule_id, selector, help_text="fix it"):
    return {"id": rule_id, "help": help_text,
            "nodes": [{"target": [selector], "html": "<p/>"}]}


def run_self_test():
    failures = []
    case_count = 0

    def check(name, want, got):
        nonlocal case_count
        case_count += 1
        if want != got:
            failures.append(f"FAIL {name}: want: {want!r}; got: {got!r}")

    rule_map = checklib.load_rule_map()
    controls = checklib.layer_controls(LAYER, rule_map)
    tiers = checklib.catalog_tiers()
    detect = _load_detect()

    # ── the run matrix covers every shape the spec fixed ───────────────────────
    matrix = build_matrix(DEFAULT_VIEWPORTS, ["light", "dark"])
    ids = [c["id"] for c in matrix]
    check("the matrix runs both viewports in both themes",
          ["360-light", "360-dark", "1280-light", "1280-dark"], ids[:4])
    check("the matrix carries exactly one reduced-motion cell",
          [REDUCED_MOTION_CELL], [i for i in ids if "reduced-motion" in i])
    check("the reduced-motion cell runs at 1280 in the default theme",
          (1280, "default"),
          (matrix[-1]["viewport"]["width"], matrix[-1]["theme"]))
    check("the reduced-motion cell is the only one emulating media",
          [REDUCED_MOTION_CELL], [c["id"] for c in matrix if c["media"]])
    check("each cell names the viewport it will apply",
          [360, 360, 1280, 1280], [c["viewport"]["width"] for c in matrix[:4]])
    check("auto themes follow a product with a dark layer",
          ["light", "dark"], resolve_themes("auto", True))
    check("auto themes drop dark where the product has none",
          ["light"], resolve_themes("auto", False))
    check("an explicit theme wins over detection",
          (["dark"], ["light"]), (resolve_themes("dark", False),
                                  resolve_themes("light", True)))

    # ── the job the driver reads ───────────────────────────────────────────────
    job = build_job("ws://x", "http://localhost:3000/standards", matrix[0], rule_map)
    check("target-size is enabled explicitly, since axe ships it off",
          True, "target-size" in job["forceEnable"])
    check("the job names its rules rather than a tag shortcut",
          True, "target-size" in job["axeRules"] and "color-contrast" in job["axeRules"])
    check("the job carries no runOnly tag", True, "tags" not in job)
    check("the job hands the driver the open session, not a URL to launch",
          "ws://x", job["cdpUrl"])
    motion_job = build_job("ws://x", None, reduced_motion_cell(), rule_map)
    check("the reduced-motion cell carries the reduced-motion evaluation",
          ["dx/reduced-motion"], [e["id"] for e in motion_job["evaluations"]])
    check("no other cell runs it", [], job["evaluations"])
    check("the reduced-motion cell emulates reduced motion",
          "reduce", motion_job["media"]["reducedMotion"])
    check("the reduced-motion cell decides A11Y-5 only, so it skips axe",
          (True, False), (job["runAxe"], motion_job["runAxe"]))

    # ── the driver boots nothing and launches nothing ─────────────────────────
    # Read against the CODE, with comments stripped, so the prose that explains
    # the constraint cannot satisfy or break the case that enforces it.
    with open(DRIVER, encoding="utf-8") as fh:
        driver_source = fh.read()
    driver_code = strip_js_comments(driver_source)
    for forbidden in ("chromium.launch", "newPage(", "newContext(", "webServer", "jsdom"):
        check(f"the driver never reaches for {forbidden}", False, forbidden in driver_code)
    check("the driver attaches over CDP", True, "connectOverCDP" in driver_code)
    check("the driver restores the session in a finally", True,
          "finally {" in driver_code and "setViewportSize" in driver_code)
    check("the driver restores the original URL after a standalone navigation", True,
          "priorUrl = page.url()" in driver_code
          and "page.goto(priorUrl" in driver_code)
    check("the driver never clicks or hovers", False,
          ".click(" in driver_code or ".hover(" in driver_code)

    # ── a violation becomes a finding that names its page and cell ────────────
    payload = _axe_payload(cell="1280-dark", route="/standards/slop",
                           violations=[_violation("color-contrast", ".card > p",
                                                  "Elements must meet contrast")])
    errors, _ = translate_violations(payload, rule_map, payload["cell"])
    check("one violated node becomes one finding", 1, len(errors))
    parsed = detect._FINDING_RE.match(errors[0])
    check("the finding matches detect's finding shape", True, parsed is not None)
    check("the finding carries its control id", "A11Y-1", parsed.group("control"))
    check("the route rides the file half", "/standards/slop", parsed.group("file"))
    check("the cell rides the position half", "1280-dark", parsed.group("pos"))
    check("the finding names the axe rule that fired", True,
          "[color-contrast]" in errors[0])
    check("the finding names the DOM node", True, ".card > p" in errors[0])
    check("detect keeps the control id and asserts no source line",
          ("A11Y-1", None, "1280-dark"),
          (lambda f: (f["control"], f["line"], f["position"]))(
              detect.parse_findings("rendered-check", errors)[0]))

    # ── a theme-conditional failure is reported in the theme that has it ──────
    dark_only, _ = translate_violations(
        _axe_payload(cell="1280-dark", violations=[_violation("color-contrast", ".x")]),
        rule_map, "1280-dark")
    light_clean, _ = translate_violations(
        _axe_payload(cell="1280-light"), rule_map, "1280-light")
    check("the dark cell reports A11Y-1", True, any("[A11Y-1]" in e for e in dark_only))
    check("the light cell reports nothing", [], light_clean)
    check("the finding names the cell that produced it", True,
          ":1280-dark " in dark_only[0])

    # ── target-size fires, which proves the rule was enabled ──────────────────
    targets, _ = translate_violations(
        _axe_payload(cell="360-light", violations=[_violation("target-size", "button.chip")]),
        rule_map, "360-light")
    check("target-size is reported under A11Y-4", True, "[A11Y-4]" in targets[0])
    check("it is reported from the 360 cell", True, ":360-light " in targets[0])

    # ── the aria suite tracks the installed axe ───────────────────────────────
    unseen = _axe_payload(violations=[_violation("aria-brand-new-rule", "div")],
                          aria_rules=["aria-brand-new-rule"])
    aria_errors, _ = translate_violations(unseen, rule_map, unseen["cell"])
    check("an aria rule the harness has never seen still maps to A11Y-8",
          True, "[A11Y-8]" in aria_errors[0])
    check("no hardcoded aria list exists to drift", "A11Y-8",
          rule_map.get("aria_prefix_control"))
    check("an unmapped non-aria rule is a misconfiguration, not a guess",
          (1, None),
          (lambda e: (len(e), detect._FINDING_RE.match(e[0])))(
              translate_violations(
                  _axe_payload(violations=[_violation("region", "main")]),
                  rule_map, "1280-light")[0]))

    # ── the reduced-motion evaluation is A11Y-5's only coverage ───────────────
    motion = _axe_payload(cell=REDUCED_MOTION_CELL, evaluation_findings=[
        {"rule": "dx/reduced-motion", "selector": ".hero__orb",
         "message": "animation still running under prefers-reduced-motion (looping)",
         "failed": False}])
    motion_errors, _ = translate_violations(motion, rule_map, motion["cell"])
    check("a still-running animation is reported under A11Y-5",
          True, "[A11Y-5]" in motion_errors[0])
    check("the finding names the element that is still moving",
          True, ".hero__orb" in motion_errors[0])
    check("it is reported from the reduced-motion cell",
          True, f":{REDUCED_MOTION_CELL} " in motion_errors[0])
    check("the evaluation looks at both running animations and computed styles",
          True, "getAnimations" in REDUCED_MOTION_JS
          and "animationName" in REDUCED_MOTION_JS)

    # ── incomplete is the third bucket: named, never dropped, never gating ────
    incomplete_payload = _axe_payload(cell="1280-light", route="/standards", incomplete=[{
        "id": "color-contrast", "help": "Elements must meet contrast",
        "nodes": [{"target": [".hero > p"], "html": "<p/>"}]}])
    inc_errors, _ = translate_violations(incomplete_payload, rule_map, "1280-light")
    inc_notes = translate_incomplete(incomplete_payload, rule_map, "1280-light")
    check("an incomplete result raises no ERROR", [], inc_errors)
    check("it prints as one NOTE", 1, len(inc_notes))
    check("the NOTE names the control, the rule and the selector", True,
          "[A11Y-1]" in inc_notes[0] and "[color-contrast]" in inc_notes[0]
          and ".hero > p" in inc_notes[0])
    check("the NOTE sends it to the manual accessibility pass", True,
          "manual accessibility pass" in inc_notes[0])
    check("an incomplete result does not affect the exit code", 0,
          1 if inc_errors else 0)
    check("it appears nowhere in the passes count", 7,
          incomplete_payload["passes_count"])
    inc_records = payload_records(incomplete_payload, rule_map, controls)
    check("its record is an incomplete outcome, never a pass",
          [("A11Y-1", "incomplete")],
          [(r["control"], r["outcome"]) for r in inc_records
           if r["rule"] == "color-contrast"])
    check("no record anywhere claims a pass", set(),
          {r["outcome"] for r in inc_records} & {"pass"})

    # ── passes are counted, never printed per node ───────────────────────────
    counted = passes_note(_axe_payload(), "1280-light")
    check("the passes count prints once as a NOTE", 1, len(counted))
    check("it says a pass here is not a control met", True,
          "not a control met" in counted[0])

    # ── A11Y-8 on markup a person cannot reach is demoted, not gated ─────────
    hidden_node = {"target": ["#closed-menu > button"], "html": "<button/>"}
    hidden_payload = _axe_payload(
        violations=[{"id": "aria-required-attr", "help": "needs attrs",
                     "nodes": [hidden_node]}],
        hidden_nodes=[node_key(hidden_node)])
    hidden_errors, hidden_demoted = translate_violations(
        hidden_payload, rule_map, hidden_payload["cell"])
    check("an A11Y-8 finding in a hidden subtree raises no ERROR", [], hidden_errors)
    check("it moves into the incomplete bucket instead", 1, len(hidden_demoted))
    check("the NOTE says why it was demoted", True,
          any("cannot currently reach" in n for n in
              translate_incomplete(hidden_payload, rule_map,
                                   hidden_payload["cell"], hidden_demoted)))
    visible_payload = _axe_payload(
        violations=[{"id": "aria-required-attr", "help": "needs attrs",
                     "nodes": [hidden_node]}])
    visible_errors, _ = translate_violations(visible_payload, rule_map,
                                             visible_payload["cell"])
    check("the same finding on reachable markup still gates", 1, len(visible_errors))

    # ── bypass never gates ───────────────────────────────────────────────────
    bypass_payload = _axe_payload(violations=[_violation("bypass", "body")])
    bypass_errors, bypass_demoted = translate_violations(
        bypass_payload, rule_map, bypass_payload["cell"])
    check("A11Y-10 raises no ERROR and so cannot make the exit non-zero",
          [], bypass_errors)
    check("A11Y-10 is still reported, as a report-only NOTE", True,
          any("[A11Y-10]" in n for n in translate_incomplete(
              bypass_payload, rule_map, bypass_payload["cell"], bypass_demoted)))
    check("the NOTE leaves skip-link-first confirmation with the manual pass",
          True, any("manual pass" in n for n in translate_incomplete(
              bypass_payload, rule_map, bypass_payload["cell"], bypass_demoted)))

    # ── inapplicable is N/A, not a pass ──────────────────────────────────────
    na_payload = _axe_payload(inapplicable=["image-alt", "svg-img-alt"])
    na_notes = inapplicable_notes(na_payload, rule_map, controls, "1280-light")
    check("a control whose every rule was inapplicable records N/A", 1, len(na_notes))
    check("the N/A names the control and the reason", True,
          "[A11Y-6]" in na_notes[0] and "inapplicable" in na_notes[0])
    check("the N/A says it is not a pass", True, "not reported as passing" in na_notes[0])
    check("a control with a rule that did apply records no N/A", [],
          inapplicable_notes(_axe_payload(inapplicable=["image-alt"]),
                             rule_map, controls, "1280-light"))

    # ── the DOM marker's grammar ─────────────────────────────────────────────
    check("one id and a reason parse", (["SLP-4"], "quarantined anti-specimen"),
          parse_dom_waiver("SLP-4 reason=quarantined anti-specimen"))
    check("several ids ride one attribute, since HTML forbids a duplicate",
          (["SLP-4", "SLP-6"], "quarantined anti-specimen"),
          parse_dom_waiver("SLP-4 SLP-6 reason=quarantined anti-specimen"))
    check("the reason runs verbatim to the end of the value",
          "the before panel of the standards demo, reason= and all",
          parse_dom_waiver("SLP-4 reason=the before panel of the standards demo, "
                           "reason= and all")[1])
    check("ids are de-duplicated, order preserved", ["SLP-6", "SLP-4"],
          parse_dom_waiver("SLP-6 SLP-4 SLP-6 reason=x")[0])
    for bad, why in [("SLP-4", "no reason at all"),
                     ("SLP-4 reason=", "an empty reason"),
                     ("reason=x", "no control id"),
                     ("slp-4 reason=x", "a lowercase id")]:
        raised = False
        try:
            parse_dom_waiver(bad)
        except MarkerError:
            raised = True
        check(f"a marker with {why} is malformed", True, raised)

    # ── a marker skips only its named controls, and only its subtree ─────────
    inside = {"target": [".exhibit p"], "html": "<p/>"}
    outside = {"target": [".sibling p"], "html": "<p/>"}
    exhibit = _axe_payload(
        cell="1280-light", route="/standards",
        violations=[
            {"id": "color-contrast", "help": "contrast",
             "nodes": [inside, outside]},
        ],
        waived=[{"selector": ".exhibit",
                 "value": "SLP-4 SLP-6 reason=quarantined anti-specimen",
                 "contains": [node_key(inside)]}])
    suppression, marker_errors, marker_notes = read_markers(exhibit, tiers, "1280-light")
    check("a well-formed marker raises no ERROR", [], marker_errors)
    check("it records a NOTE naming the element, the ids and the reason", True,
          len(marker_notes) == 1 and ".exhibit" in marker_notes[0]
          and "SLP-4, SLP-6" in marker_notes[0]
          and "quarantined anti-specimen" in marker_notes[0])
    check("it waives its named controls for its own subtree only",
          {node_key(inside): {"SLP-4", "SLP-6"}}, suppression)
    exhibit_errors, _ = translate_violations(exhibit, rule_map, "1280-light", suppression)
    check("a contrast violation inside the marked subtree is still reported",
          True, any(".exhibit p" in e for e in exhibit_errors))
    check("a contrast violation on a sibling outside it is still reported",
          True, any(".sibling p" in e for e in exhibit_errors))
    check("no page-level or register-level exemption was applied", 2, len(exhibit_errors))
    waived_finding = _axe_payload(
        violations=[{"id": "dx/slp-4-stand-in", "help": "x", "nodes": [inside]}],
        waived=exhibit["waived"])
    supp2, _, _ = read_markers(waived_finding, tiers, "1280-light")
    check("the marker's own controls are the ones it suppresses",
          {"SLP-4", "SLP-6"}, supp2[node_key(inside)])

    # ── a nested marker's ids union with the enclosing one's ─────────────────
    nested = _axe_payload(
        violations=[{"id": "color-contrast", "help": "c", "nodes": [inside]}],
        waived=[{"selector": ".exhibit", "value": "SLP-4 reason=outer",
                 "contains": [node_key(inside)]},
                {"selector": ".exhibit .inner", "value": "SLP-6 reason=inner",
                 "contains": [node_key(inside)]}])
    nested_supp, _, _ = read_markers(nested, tiers, "1280-light")
    check("a nested marker unions rather than replaces",
          {"SLP-4", "SLP-6"}, nested_supp[node_key(inside)])

    # ── an L0 id in a marker is refused ──────────────────────────────────────
    l0_marker = _axe_payload(
        violations=[{"id": "color-contrast", "help": "c", "nodes": [inside]}],
        waived=[{"selector": ".exhibit", "value": "A11Y-1 reason=looks fine to me",
                 "contains": [node_key(inside)]}])
    l0_supp, l0_errors, l0_notes = read_markers(l0_marker, tiers, "1280-light")
    check("an L0 id in a marker is one ERROR", 1, len(l0_errors))
    check("the ERROR says L0 is never waivable", True,
          "L0 is never waivable" in l0_errors[0])
    check("the ERROR keeps the parseable finding shape", "A11Y-1",
          detect._FINDING_RE.match(l0_errors[0]).group("control"))
    check("it suppresses nothing", {}, l0_supp)
    check("it records no honoured marker", [], l0_notes)
    l0_findings, _ = translate_violations(l0_marker, rule_map, "1280-light", l0_supp)
    check("contrast is still checked on that subtree", 1, len(l0_findings))

    # ── a malformed or unknown-id marker fails loudly ────────────────────────
    broken = _axe_payload(waived=[
        {"selector": ".a", "value": "SLP-4", "contains": []},
        {"selector": ".b", "value": "ZZZ-9 reason=x", "contains": []},
        {"selector": ".c", "value": "SLP-4 reason=", "contains": []},
    ])
    broken_supp, broken_errors, _ = read_markers(broken, tiers, "1280-light")
    check("each broken marker produces its own ERROR", 3, len(broken_errors))
    check("a marker with no reason names the marker id, not a control",
          WAIVE_MARKER_ID, detect._FINDING_RE.match(broken_errors[0]).group("control"))
    check("an unknown control id is named as unknown", True,
          "unknown control id" in broken_errors[1])
    check("an empty reason is refused too", True,
          "does not parse" in broken_errors[2])
    check("none of them suppresses anything", {}, broken_supp)
    check("the marker id is not a catalogue control", False,
          WAIVE_MARKER_ID in tiers)

    # ── no page open: the layer did not run, and nothing passed ───────────────
    code, lines, records = run(cdp_resolver=lambda session: None)
    check("no page open exits 0 (a NOTE is never a gate)", 0, code)
    check("no page open prints no ERROR", [], [ln for ln in lines if ln.startswith("ERROR")])
    check("no page open names every rendered-only control", True,
          all(any(c in ln for ln in lines) for c in controls))
    check("no page open routes them to manual verification", True,
          any("manual verification" in ln for ln in lines))
    check("no page open reports every line as a NOTE, never a result", True,
          all(ln.startswith("NOTE") for ln in lines))
    check("no page open says out loud that nothing passed", True,
          any("not reported as passing" in ln for ln in lines))
    check("no page open keeps no records", [], records)
    l0 = checklib.l0_subset(controls, tiers)
    check("the L0 controls it covers still block", True,
          bool(l0) and any("block until" in ln for ln in lines))

    # ── a standalone run that was given a URL but has no open page ───────────
    # The person is asked for the URL by the skill; the runner still attaches
    # rather than opening anything, so a URL with nothing serving it is the
    # same honest not-run case, and it says which URL it was given.
    code, lines, _ = run(url="https://example.test/standards",
                         cdp_resolver=lambda session: None)
    check("a named URL with no open page still exits 0", 0, code)
    check("the reason names the URL it was given", True,
          any("https://example.test/standards" in ln for ln in lines))
    check("the controls still fall back to manual verification", True,
          any("manual verification" in ln for ln in lines))
    # ── the runner asks about a session; it never brings one into being ──────
    # Measured on agent-browser 0.29.1: `get cdp-url --session <unknown>`
    # creates that session, browser and all. So the live list is asked first,
    # and an unlisted name never reaches the endpoint call.
    asked = []

    def record_cli(argv, timeout, stdin_text=None):
        asked.append(argv)
        if argv[1:3] == ["session", "list"]:
            return 0, json.dumps({"success": True,
                                  "data": {"sessions": ["default", "verify"]}}), ""
        return 0, "ws://127.0.0.1:9222/devtools/browser/abc\n", ""

    check("the live session list is read from the CLI",
          ["default", "verify"], live_sessions(runner=record_cli))
    asked.clear()
    unknown = resolve_cdp_url("no-such-session", runner=record_cli)
    check("an unlisted session resolves to no endpoint", None,
          unknown if shutil.which(BROWSER_CLI) else None)
    if shutil.which(BROWSER_CLI):
        check("and no endpoint was ever requested for it", [],
              [argv for argv in asked if argv[1:3] == ["get", "cdp-url"]])
        asked.clear()
        endpoint = resolve_cdp_url("verify", runner=record_cli)
        check("a listed session resolves to its endpoint", True,
              endpoint is not None and endpoint.startswith("ws://"))
        check("the runner never asks the CLI to open anything", False,
              any("open" in argv for argv in asked))
    else:
        # No capture CLI on this machine: resolve_cdp_url short-circuits, which
        # is itself the honest not-run path.
        check("with no capture CLI installed, nothing is asked of it", [], asked)
        check("a listed session resolves to its endpoint", None,
              resolve_cdp_url("verify", runner=record_cli))
        check("the runner never asks the CLI to open anything", False,
              any("open" in argv for argv in asked))

    # ── axe failing is the same class as no page, never a crash ───────────────
    def boom(_job):
        raise DriverError("connectOverCDP refused")

    code, lines, _ = run(cdp_resolver=lambda session: "ws://x", cell_runner=boom)
    check("a driver failure exits 0", 0, code)
    check("a driver failure prints no ERROR", [],
          [ln for ln in lines if ln.startswith("ERROR")])
    check("a driver failure names the reason", True,
          any("connectOverCDP refused" in ln for ln in lines))
    check("detect classifies it as clean rather than a crash", "clean",
          detect.classify_run(code, "\n".join(lines), "")[0])

    # ── the product has no dark mode ──────────────────────────────────────────
    def light_only(job_in):
        return _axe_payload(cell=job_in["cell"], dark_supported=False)

    code, lines, records = run(cdp_resolver=lambda session: "ws://x",
                               cell_runner=light_only, themes="auto")
    check("a product with no dark mode exits 0", 0, code)
    check("the dark cells are recorded N/A, not passed", True,
          any("N/A, product has no dark mode" in ln for ln in lines))
    check("no dark finding is invented", [],
          [ln for ln in lines if ln.startswith("ERROR")])
    check("the N/A is a record, never a pass", {"n/a"},
          {r["outcome"] for r in records} or {"n/a"})

    # ── both viewports actually run, read back from the browser ───────────────
    seen = []

    def record_cells(job_in):
        seen.append((job_in["cell"], job_in["viewport"]["width"]))
        return _axe_payload(cell=job_in["cell"], dark_supported=False)

    run(cdp_resolver=lambda session: "ws://x", cell_runner=record_cells, themes="light")
    check("axe ran once at 360 and once at 1280", [360, 1280],
          sorted({w for cell_id, w in seen if "reduced-motion" not in cell_id}))
    check("both cells appear in the run", True,
          {"360-light", "1280-light"} <= {cell_id for cell_id, _ in seen})
    check("the applied viewport is read back from the browser rather than assumed",
          True, "window.innerWidth" in driver_source)
    check("the page is scrolled to the document end before axe runs",
          True, "scrollHeight" in driver_source and "AxeBuilder" in driver_source)

    # ── a violation below the fold is caught ─────────────────────────────────
    # axe skips what is outside the viewport, so the page is scrolled to the
    # document end in viewport-height steps and back to the top BEFORE axe
    # runs. The ordering is the load-bearing part; assert it on the source.
    scroll_at = driver_code.find("SCROLL_JS")
    axe_at = driver_code.find("AxeBuilder({ page })")
    check("the driver scrolls the whole page before axe runs", True,
          0 < scroll_at < axe_at)
    check("it scrolls in viewport-height steps, not one jump", True,
          "const step = window.innerHeight;" in driver_code)
    check("it returns to the top, so the restored offset is deterministic",
          True, "window.scrollTo(0, 0)" in driver_code)
    below_fold = translate_violations(
        _axe_payload(cell="1280-light",
                     violations=[_violation("color-contrast", "footer > small")]),
        rule_map, "1280-light")[0]
    check("a violation the scroll revealed is reported like any other",
          True, len(below_fold) == 1 and "footer > small" in below_fold[0])

    # ── the session is handed back as it was found ───────────────────────────
    unrestored = _axe_payload(restored=False, restore_error="page closed")
    check("an unrestored session is said out loud", True,
          any("NOT restored" in ln for ln in restore_notes(unrestored)))
    check("a restored session says nothing", [], restore_notes(_axe_payload()))
    check("the driver reads the session's state before it changes anything",
          True, driver_code.find("READ_STATE_JS") < driver_code.find("setViewportSize"))
    for restored_thing in ("setViewportSize", "emulateMedia", "restoreThemeJs"):
        check(f"the restore puts {restored_thing} back", True,
              restored_thing in driver_code.split("} finally {")[-1])
    check("the restore puts the scroll offset back", True,
          "prior.scrollX" in driver_code and "prior.scrollY" in driver_code)
    check("it restores on the failure path too, since the restore is the finally",
          True, driver_code.find("} catch (err) {") < driver_code.find("} finally {"))
    check("the one JSON object is printed after the restore, not before", True,
          driver_code.rfind("emit(payload)") > driver_code.find("} finally {"))

    # ── a driver failure writes no traceback and stays exit 0 ────────────────
    check("the runner never raises out of a driver failure", True,
          isinstance(run(cdp_resolver=lambda session: "ws://x",
                         cell_runner=boom), tuple))
    check("the driver's own failure path is a JSON object, not a stack trace",
          True, "failure(job," in driver_code and "process.exit" not in driver_code)

    # ── the rule map's own integrity for this layer ───────────────────────────
    catalog_ids = set(tiers)
    check("every axe row maps to a real control", set(),
          {c for r, c in rule_map["rules"].items() if r.startswith("axe/")} - catalog_ids)
    check("this layer's controls are all in the catalogue", set(),
          set(controls) - catalog_ids)
    check("A11Y-2 is not claimed: no axe rule checks a visible focus indicator",
          False, "A11Y-2" in controls)
    check("A11Y-11 is not claimed: it needs interaction", False, "A11Y-11" in controls)
    check("every control this layer claims has at least one rule or evaluation",
          set(),
          set(controls) - ({c for r, c in rule_map["rules"].items()
                            if r.startswith(("axe/", "dx/"))}
                           | {rule_map.get("aria_prefix_control")}))

    checklib.report_self_test(failures, case_count)


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        prog="rendered-check.py", add_help=True,
        description="Run axe against a page the capture step already opened.")
    parser.add_argument("--session", help="the capture session to attach to")
    parser.add_argument("--url", help="the page to check, when the session is elsewhere")
    parser.add_argument("--viewports", default="360,1280",
                        help="comma-separated widths (default: 360,1280)")
    parser.add_argument("--themes", default="auto",
                        choices=["auto", "light", "dark", "both"])
    parser.add_argument("--json", action="store_true", help="emit the run records as JSON")
    args = parser.parse_args()

    try:
        viewports = [int(v) for v in args.viewports.split(",") if v.strip()]
    except ValueError:
        print("ERROR rendered-check: --viewports takes comma-separated integers")
        sys.exit(1)
    if not viewports:
        print("ERROR rendered-check: --viewports needs at least one width")
        sys.exit(1)

    code, lines, records = run(session=args.session, url=args.url,
                               viewports=viewports, themes=args.themes)
    if args.json:
        print(json.dumps({"records": records,
                          "output": lines,
                          "exit": code}, indent=2, ensure_ascii=False))
    else:
        for line in lines:
            print(line)
    sys.exit(code)


if __name__ == "__main__":
    if "--self-test" in sys.argv[1:]:
        run_self_test()
    main()
