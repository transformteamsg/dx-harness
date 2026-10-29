# A11Y: Accessibility

Source: the generic A11Y controls of [`catalog.yaml`](../../catalog.yaml). The decisions and open items are in the [category README](README.md).

Each control here keeps a part that no DSS rule covers. `redirects.yaml` maps the control to every rule that replaces it, the DSS rules included. An unset parameter reports "not configured".

| Catalogue control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| A11Y-3 Programmatic, visible form label | [`A11Y-3a`](visible-field-label.md) Every form field has a visible label | lint | rendered | custom. `WR-1a`, `WP-6c`, and `WO-16a` cover the programmatic label | `pages` |
| A11Y-5 Reduced motion | [`A11Y-5a`](reduced-motion.md) No animation runs when the user asks for reduced motion | lint | rendered | custom | `pages`, `essentialSelectors`, `minDurationMs` |
| | `A11Y-5b` An animation that still runs is essential | judged | | | |
| A11Y-11 Announced async changes and focus management | [`A11Y-11a`](focus-target-not-live-region.md) A focus target is not also a live region | lint | source | custom. `WR-2a`, `WR-2b`, and `WR-2c` cover the live region | `liveRoles` |
| | [`A11Y-11b`](focus-not-stranded.md) Focus is not lost after a state change | lint | rendered | custom. `WO-9c` covers focus in a modal | `actions` |
| | `A11Y-11c` Each state change uses the right channel | judged | | | |
