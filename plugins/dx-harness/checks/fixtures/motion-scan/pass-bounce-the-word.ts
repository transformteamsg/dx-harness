// The word "bounce" in prose or test data is not an easing. SLP-8 matches the
// named overshoot utilities by name, so the catalogue's own fails_when text and
// a search-filter test stay quiet.
export const SLP_3 = {
  id: "SLP-3",
  fails_when: ["Gradient text uses purple hues", "Bounce easing on entrance"],
};

export const QUERY = { q: "bounce", tier: "L1" };
