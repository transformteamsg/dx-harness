import { axeRule } from "../../engines/axe.ts";
import { jsxRule } from "../../engines/jsx-a11y.ts";
import type { RuleModule } from "../../types.ts";
import { axeRuleWith } from "./b-axe.ts";
import { wp12d, wp17a } from "./b-controls.ts";
import { wp10c, wp10d, wp11b } from "./b-forms.ts";
import { wp14a, wp16a, wp18b } from "./b-layout.ts";
import { wp19a, wp19b, wp19e } from "./b-popup.ts";
import { wp12b, wp14b, wp18c, wp19c } from "./b-source.ts";
import { wp13b, wp17c } from "./b-tokens.ts";

/* The rule modules of WP-10 to WP-19. WP-15a is not built: it needs OCR, and no
   OCR library is installed. test/wp-b-axe.test.ts checks the engine rule ids. */

export const WP_B_AXE_IDS: Record<string, string[]> = {
  "WP-10a": ["autocomplete-valid"],
  "WP-11a": ["link-in-text-block"],
  "WP-12a": ["no-autoplay-audio"],
  "WP-13a": ["color-contrast"],
  "WP-18a": ["avoid-inline-spacing"],
};

export const WP_B_JSX_IDS: Record<string, string[]> = {
  "WP-10b": ["autocomplete-valid"],
};

const exempt = (params: Record<string, unknown>) => [params.decorativeSelector, params.inactiveSelector].map((s) => String(s)).filter((s) => s !== "");

export const wpBModules: RuleModule[] = [
  axeRule("WP-10a", WP_B_AXE_IDS["WP-10a"]),
  /* WP-10b reads JSX and TSX only. WP-10a covers plain HTML on the rendered page. */
  jsxRule("WP-10b", WP_B_JSX_IDS["WP-10b"]),
  wp10c,
  wp10d,
  axeRule("WP-11a", WP_B_AXE_IDS["WP-11a"]),
  wp11b,
  axeRuleWith("WP-12a", WP_B_AXE_IDS["WP-12a"], (p) => ({
    checks: { "no-autoplay-audio": { allowedDuration: Number(p.maxAutoplaySeconds) } },
    incompleteFails: ["no-autoplay-audio"],
    waitForMedia: true,
  })),
  wp12b,
  wp12d,
  axeRuleWith("WP-13a", WP_B_AXE_IDS["WP-13a"], (p) => ({
    checks: {
      "color-contrast": {
        contrastRatio: { normal: { expected: Number(p.normalRatio) }, large: { expected: Number(p.largeRatio) } },
        largeTextPt: Number(p.largeTextPt),
        boldTextPt: Number(p.largeBoldTextPt),
      },
    },
    exclude: exempt(p),
  })),
  wp13b,
  wp14a,
  wp14b,
  wp16a,
  wp17a,
  wp17c,
  axeRule("WP-18a", WP_B_AXE_IDS["WP-18a"]),
  wp18b,
  wp18c,
  wp19a,
  wp19b,
  wp19c,
  wp19e,
];
