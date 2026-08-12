# Health scan (companion to SKILL.md)

Decide whether this repo can be mined for its design language before anyone is
interviewed. Reuse the existing check scripts as heuristics; do not reimplement
them, and do not treat their findings as a grade here. The scan reads; it never
fixes.

## Run the heuristics

From the product repo root, run each script and note what it shows (paths are
relative to this skill directory):

1. **Tokens file present, and hex sprawl.**
   `python3 ../../../checks/token-audit.py <repo-root>`
   A tokens file the script locates (its token-definition blocks) says the repo has
   a token layer. Count the raw-hex / raw-colour findings: a handful is noise; raw
   hex across many components is sprawl.
2. **Consistent spacing and type scales.**
   `python3 ../../../checks/type-scan.py <repo-root>`
   Few or no off-scale findings means the scales are consistent enough to mine.
3. **Component manifest present.**
   `.dx/component-manifest.json` at the repo root, verified with
   `python3 ../../../checks/component-manifest.py .dx/component-manifest.json <repo-root>`
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
