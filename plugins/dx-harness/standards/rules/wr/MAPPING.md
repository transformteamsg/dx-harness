# WR: WCAG Robust

Source: [DSS WCAG Robust](https://info.standards.tech.gov.sg/control-catalog/dss/wr/). Status: draft. The decisions and open items are in the [category README](README.md).

A parameter that the table lists as an exemption comes from the DSS "Not required for" text. Neither WR control lists one. An unset parameter reports "not configured".

| DSS control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| WR-1 Name, Role, Value | [`WR-1a`](control-accessible-name.md) Every control has an accessible name | lint | rendered | axe `button-name`, `link-name`, `input-button-name`, `select-name`, `label`, `aria-command-name`, `aria-input-field-name`, `aria-toggle-field-name`, `aria-dialog-name`, `aria-meter-name`, `aria-progressbar-name`, `aria-tooltip-name`, `aria-treeitem-name`; source twin jsx-a11y `control-has-associated-label`, `label-has-associated-control`, `anchor-has-content` | `pages` |
| | [`WR-1b`](valid-roles.md) Roles are valid and carry their required properties | lint | rendered | axe `aria-roles`, `aria-allowed-role`, `aria-required-attr`, `aria-required-children`, `aria-required-parent`; source twin jsx-a11y `aria-role`, `role-has-required-aria-props` | `pages` |
| | [`WR-1c`](valid-aria-attributes.md) ARIA attributes are valid and supported | lint | rendered | axe `aria-valid-attr`, `aria-valid-attr-value`, `aria-allowed-attr`, `aria-prohibited-attr`, `aria-hidden-body`, `aria-hidden-focus`; source twin jsx-a11y `aria-props`, `aria-proptypes`, `role-supports-aria-props` | `pages` |
| | [`WR-1d`](custom-control-role-and-focus.md) A custom interactive element has a role and is focusable | lint | source | jsx-a11y `interactive-supports-focus`, `click-events-have-key-events`, `no-static-element-interactions`, `no-noninteractive-element-interactions` | None |
| | `WR-1e` The name describes the purpose, and states update on change | judged | | | |
| WR-2 Status Messages | [`WR-2a`](status-message-live-region.md) A status message sits in a live region | lint | source | custom | `statusSelectors`, `liveRoles` |
| | [`WR-2b`](valid-live-region.md) Live region values are valid | lint | rendered | custom. `WR-1c` covers the general ARIA validity | `allowedLiveValues`, `pages` |
| | `WR-2c` The message content and timing suit the user | judged | | | |
