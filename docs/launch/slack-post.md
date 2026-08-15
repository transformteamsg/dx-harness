# Slack launch post

Target channel: `#dx-harness`. Post once the domain resolves and the marketplace
install is confirmed from a clean machine.

---

🧭 **dx-harness is out**

Designers on our team design in code now. The agent they work with is fast, but it
doesn't know what good design is, and it doesn't know your product. dx-harness fixes
the context: it's a Claude Code plugin that carries our design standard, so your agent
builds to the bar instead of to the average of the internet.

**What you get**

- An orchestrator you talk to in plain language. No command names — describe the
  screen, it routes the work to specialist skills for copy, flow, pattern, motion and
  polish.
- A control catalog: 70 checkable rules for what good interfaces do, including eleven
  that name AI slop as numbered violations.
- A DESIGN.md generated for your repo, so the harness speaks your product's design
  language, not a generic one.
- An auto-triggered design review that grades the result against both. The agent that
  built the screen never marks its own work.

**Try it** — docs and quick start: `https://dx-harness.example` _(final domain to follow)_

In Claude Code, in your product repo:

```
/plugin marketplace add transformteamsg/dx-harness
/plugin install dx-harness@dx-harness
```

Then run `/dx-harness:dx-design-setup` once (the design checks need Python 3 +
PyYAML), and type what you want to build. On Claude Desktop and the web app, add the
marketplace and install from the plugin directory — no command line needed.

This is a big start, and it grows by use: waive a rule that doesn't fit, and the
recurring waivers become rule proposals. Tell us what breaks and what you build. 🙌

---

## Before posting

- [ ] Replace `https://dx-harness.example` with the live domain.
- [ ] Confirm the marketplace install works from a clean machine.
- [ ] Check the skill count (`21`) and control count (`70`) still match the catalog.
