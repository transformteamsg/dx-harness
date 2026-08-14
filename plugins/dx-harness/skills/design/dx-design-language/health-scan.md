# Health scan (companion to SKILL.md)

Decide whether this repo can be mined for its design language before anyone is
interviewed. Reuse the existing check scripts as heuristics; do not reimplement
them, and do not treat their findings as a grade here. The scan reads; it never
fixes.

## Run the heuristics

Resolve the harness root first (SKILL.md's path note: the directory three levels
above this skill's directory) and substitute it for `<harness>`. Then, from the
product repo root, run each step and note what it shows:

1. **Token files present.** Discover the candidate token files yourself: look for
   `tokens.css`, `globals.css`, `theme.css`, a `styles/` or `tokens/` directory,
   and a Tailwind config with a `theme` block. Open what you find and confirm it
   defines design tokens (CSS custom properties or a theme scale). The audit
   script reports violations only, so a silent audit alone cannot tell a healthy
   tokenized repo from a token-less repo with no raw values; this discovery step
   is the evidence for "a token layer exists".
2. **Hex sprawl.**
   `python3 <harness>/checks/token-audit.py <repo-root>`
   Count the raw-hex / raw-colour findings: a handful is noise; raw hex across
   many components is sprawl.
3. **Consistent spacing and type scales.**
   `python3 <harness>/checks/type-scan.py <repo-root>`
   Few or no off-scale findings means the scales are consistent enough to mine.
4. **Component manifest present.**
   `.dx/component-manifest.json` at the repo root, verified with
   `python3 <harness>/checks/component-manifest.py .dx/component-manifest.json <repo-root>`
   when it exists. Absent is common and only weakens the Components section's
   evidence.

If a script crashes or Python is missing, say so and fall back to reading the code
directly (a `tokens.css`, `globals.css`, or Tailwind config; the spacing values in a
few components). Never claim a scan you did not run.

## State the verdict

Say the verdict and the evidence in two or three plain lines, for example: "Tokens
file at `src/styles/tokens.css`, 3 raw-hex findings, type scale consistent: this
repo is healthy. I will mine the code and you confirm or correct each section."

- **Evidence-first** (healthy: a tokens file, low sprawl, consistent scales): mine
  the code for each minable section and present findings to confirm or correct.
- **Interview-first** (no tokens file, or raw values sprawl, or scales are
  inconsistent): guide the person to define the language; the code cannot speak for
  itself yet.

**The person can overrule either verdict.** Ask once ("scan says evidence-first;
happy with that?") and follow their answer. In interview-first mode, decisions with
no code target are recorded with a "not yet implemented" note plus a fix-todo; you
never write the code yourself.
