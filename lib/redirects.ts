/* Pages this repo has removed or moved, and where a reader should land
   instead. One map, two consumers: middleware.ts issues permanent redirects
   for the HTML paths, and markdown-twin.ts aliases the old `.md` twins so
   published machine-reader URLs keep resolving. No fs access — middleware
   imports it. */

export const movedPages: Record<string, string> = {
  "/principles": "/overview",
  "/principles/brand-principles": "/overview",
  "/principles/product-design-principles": "/overview",
  "/guidelines": "/standards/catalog",
  "/guidelines/ui-text": "/standards/writing",
  "/guidelines/voice-tone": "/standards/voice-tone",
  "/guidelines/grammar-mechanics": "/standards/grammar-mechanics",
  "/guidelines/text-patterns": "/standards/text-patterns",
  "/guidelines/naming": "/standards/naming",
  "/guidelines/interaction": "/standards/interaction",
  "/guidelines/web-interface": "/standards/web-interface",
  "/guidelines/data-viz": "/standards/data-viz",
  "/guidelines/illustration": "/standards/illustration",
  "/guidelines/product-icons": "/standards/product-icons",
  "/foundations/colour": "/standards/colour",
  "/foundations/typography": "/standards/typography",
  "/foundations/spacing-radius": "/standards/spacing-radius",
  "/foundations/iconography": "/standards/iconography",
  "/foundations/motion": "/standards/motion",
  "/foundations/tokens": "/standards/tokens",
  "/foundations": "/standards/catalog",
  "/research": "/harness/research-brief",
  "/research/research-brief": "/harness/research-brief",
};
