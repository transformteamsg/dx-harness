import { axeRule } from "../engines/axe.ts";

/* WR-1: name, role, and value. The first three rules are sets of axe rules.
   test/axe.test.ts checks the ids against the installed axe-core. */

export const WR_AXE_IDS: Record<string, string[]> = {
  "WR-1a": [
    "button-name", "link-name", "input-button-name", "select-name", "label",
    "aria-command-name", "aria-input-field-name", "aria-toggle-field-name", "aria-dialog-name",
    "aria-meter-name", "aria-progressbar-name", "aria-tooltip-name", "aria-treeitem-name",
  ],
  "WR-1b": ["aria-roles", "aria-allowed-role", "aria-required-attr", "aria-required-children", "aria-required-parent"],
  "WR-1c": ["aria-valid-attr", "aria-valid-attr-value", "aria-allowed-attr", "aria-prohibited-attr", "aria-hidden-body", "aria-hidden-focus"],
};

export const wr1a = axeRule("WR-1a", WR_AXE_IDS["WR-1a"]);
export const wr1b = axeRule("WR-1b", WR_AXE_IDS["WR-1b"]);
export const wr1c = axeRule("WR-1c", WR_AXE_IDS["WR-1c"]);
