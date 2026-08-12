/* Docs navigation tree — single source of truth. The sidebar renders it;
   prev/next pagination walks its leaves in order. */

export type NavLeaf = { href: string; title: string };
export type NavSubGroup = { label: string; items: NavLeaf[] };
export type NavItem = NavLeaf | NavSubGroup;
export type NavGroup = { label: string; href?: string; items: NavItem[] };

export const isSubGroup = (item: NavItem): item is NavSubGroup => "items" in item;

export const nav: NavGroup[] = [
  {
    label: "Get oriented",
    items: [
      { href: "/overview", title: "Overview" },
      { href: "/how-to-read", title: "How to read this" },
      { href: "/for-agents", title: "For agents" },
    ],
  },
  {
    label: "Start with code",
    items: [
      { href: "/getting-started", title: "Overview" },
      { href: "/getting-started/git-basics", title: "Introducing Git" },
      { href: "/getting-started/guardrails", title: "Step 0: Prep guardrails" },
      { href: "/getting-started/set-up", title: "Step 1: Set up" },
      { href: "/getting-started/plan", title: "Step 2: Plan" },
      { href: "/getting-started/build", title: "Step 3: Build" },
      { href: "/getting-started/ship", title: "Step 4: Ship" },
      { href: "/getting-started/help", title: "Help & prompts" },
    ],
  },
  {
    label: "Principles",
    href: "/principles",
    items: [
      { href: "/principles/brand-principles", title: "Brand Principles" },
      { href: "/principles/product-design-principles", title: "Product Design Principles" },
    ],
  },
  {
    label: "Standards",
    href: "/standards",
    items: [{ href: "/standards/catalog", title: "Control catalog" }],
  },
  {
    label: "Guidelines",
    href: "/guidelines",
    items: [
      {
        label: "Content",
        items: [
          { href: "/guidelines/voice-tone", title: "Voice & tone" },
          { href: "/guidelines/ui-text", title: "UI text" },
          { href: "/guidelines/grammar-mechanics", title: "Grammar & mechanics" },
          { href: "/guidelines/text-patterns", title: "Components & text patterns" },
          { href: "/guidelines/naming", title: "Naming" },
        ],
      },
      { href: "/guidelines/interaction", title: "Interaction" },
      { href: "/guidelines/web-interface", title: "Web interface" },
      { href: "/guidelines/data-viz", title: "Data visualization" },
      { href: "/guidelines/illustration", title: "Illustration" },
      { href: "/guidelines/product-icons", title: "Product icons" },
    ],
  },
  {
    label: "Foundations",
    href: "/foundations",
    items: [
      { href: "/foundations/colour", title: "Colour" },
      { href: "/foundations/typography", title: "Typography" },
      { href: "/foundations/spacing-radius", title: "Spacing & radius" },
      { href: "/foundations/iconography", title: "Iconography" },
      { href: "/foundations/motion", title: "Motion" },
      { href: "/foundations/tokens", title: "Tokens" },
    ],
  },
  {
    label: "Research",
    href: "/research",
    items: [{ href: "/research/research-brief", title: "Research brief" }],
  },
  {
    label: "Products",
    href: "/products",
    items: [
      { href: "/products/teacher-workspace", title: "Teacher Workspace" },
      { href: "/products/casesync", title: "CaseSync" },
      { href: "/products/glow", title: "Glow" },
    ],
  },
  {
    label: "Harness",
    href: "/harness",
    items: [
      { href: "/harness/install", title: "Install" },
      { href: "/harness/loop", title: "The loop" },
      { href: "/harness/skills", title: "Skills" },
      { href: "/harness/on-ramp", title: "Designer on-ramp" },
      { href: "/harness/tools", title: "Tools" },
    ],
  },
  {
    label: "Governance",
    href: "/governance",
    items: [
      { href: "/governance", title: "How this evolves" },
      { href: "/governance/changes", title: "Change log" },
    ],
  },
];

/* Reading order for prev/next: each group's index page (when it has one),
   then its leaves. Deduped so a group href that repeats as a leaf
   (e.g. /governance) appears once. */
export const readingOrder: NavLeaf[] = (() => {
  const seen = new Set<string>();
  const out: NavLeaf[] = [];
  const push = (leaf: NavLeaf) => {
    if (seen.has(leaf.href)) return;
    seen.add(leaf.href);
    out.push(leaf);
  };
  for (const group of nav) {
    if (group.href) push({ href: group.href, title: group.label });
    for (const item of group.items) {
      if (isSubGroup(item)) item.items.forEach(push);
      else push(item);
    }
  }
  return out;
})();
