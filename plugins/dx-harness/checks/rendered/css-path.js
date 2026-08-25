// A stable-enough CSS path for an element, used to name a waiver marker and
// to key a reduced-motion finding's dedup set. Shared verbatim between
// rendered-check.py and axe-driver.mjs (both read this file's text and
// interpolate it into a page.evaluate expression) so the two runners cannot
// silently disagree on what counts as "the same element" — a divergence here
// previously dropped distinct reduced-motion findings as false duplicates.
function cssPath(el) {
  if (!el || el.nodeType !== 1) return "(no element)";
  if (el.id) return "#" + CSS.escape(el.id);
  const parts = [];
  let node = el;
  while (node && node.nodeType === 1 && parts.length < 6) {
    let part = node.localName;
    const cls = (node.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean);
    if (cls.length) part += "." + cls.slice(0, 2).map(CSS.escape).join(".");
    const parent = node.parentElement;
    if (parent) {
      const sibs = Array.from(parent.children).filter((c) => c.localName === node.localName);
      if (sibs.length > 1) part += ":nth-of-type(" + (sibs.indexOf(node) + 1) + ")";
    }
    parts.unshift(part);
    if (node.id) { parts[0] = "#" + CSS.escape(node.id); break; }
    node = node.parentElement;
  }
  return parts.join(" > ");
}
