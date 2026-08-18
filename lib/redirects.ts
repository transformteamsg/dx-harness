/* Pages this repo has removed or moved, and where a reader should land
   instead. One map, two consumers: middleware.ts issues permanent redirects
   for the HTML paths, and markdown-twin.ts aliases the old `.md` twins so
   published machine-reader URLs keep resolving. No fs access — middleware
   imports it. */

export const movedPages: Record<string, string> = {
  "/principles": "/overview",
  "/principles/brand-principles": "/overview",
  "/principles/product-design-principles": "/overview",
};
