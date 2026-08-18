/* Docs navigation tree — single source of truth. The sidebar renders it;
   prev/next pagination walks its leaves in order. */

export type NavLeaf = { href: string; title: string; hidden?: boolean };
export type NavSubGroup = { label: string; items: NavLeaf[] };
export type NavItem = NavLeaf | NavSubGroup;
export type NavGroup = { label: string; href?: string; items: NavItem[]; hidden?: boolean };

export const isSubGroup = (item: NavItem): item is NavSubGroup => "items" in item;

export const nav: NavGroup[] = [
  {
    label: "Harness",
    href: "/overview",
    items: [
      { href: "/harness/install", title: "Quick start" },
      { href: "/harness/skills", title: "Skills" },
      { href: "/harness/loop", title: "The loop" },
      { href: "/harness/on-ramp", title: "Designer on-ramp", hidden: true },
      { href: "/harness/tools", title: "Tools" },
      { href: "/harness/research-brief", title: "Research brief" },
    ],
  },
  {
    label: "Design in Code",
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
    /* The group label itself lands on the consolidated catalog; the sub-pages
       are the standard split by dimension. */
    label: "Standards",
    href: "/standards/catalog",
    items: [
      {
        label: "Writing",
        items: [
          { href: "/standards/writing", title: "Overview" },
          { href: "/standards/voice-tone", title: "Voice & tone" },
          { href: "/standards/grammar-mechanics", title: "Grammar & mechanics" },
          { href: "/standards/text-patterns", title: "Components & text patterns" },
          { href: "/standards/naming", title: "Naming" },
        ],
      },
      { href: "/standards/colour", title: "Colour" },
      { href: "/standards/typography", title: "Typography" },
      { href: "/standards/spacing-radius", title: "Spacing & radius" },
      { href: "/standards/tokens", title: "Tokens" },
      { href: "/standards/iconography", title: "Iconography" },
      { href: "/standards/motion", title: "Motion" },
      { href: "/standards/interaction", title: "Interaction" },
      { href: "/standards/web-interface", title: "Web interface" },
      { href: "/standards/data-viz", title: "Data visualisation" },
      { href: "/standards/illustration", title: "Illustration" },
      { href: "/standards/product-icons", title: "Product icons" },
    ],
  },
  {
    label: "Products",
    hidden: true,
    href: "/products",
    items: [
      { href: "/products/teacher-workspace", title: "Teacher Workspace" },
      { href: "/products/casesync", title: "CaseSync" },
      { href: "/products/glow", title: "Glow" },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/how-to-read", title: "How to read the system" },
      { href: "/for-agents", title: "For agents" },
      { href: "/governance", title: "How this evolves" },
      { href: "/governance/changes", title: "Change log" },
    ],
  },
];

const visibleItems = (items: NavItem[]): NavItem[] =>
  items.reduce<NavItem[]>((visible, item) => {
    if (isSubGroup(item)) {
      const leaves = item.items.filter((leaf) => !leaf.hidden);
      if (leaves.length > 0) visible.push({ ...item, items: leaves });
    } else if (!item.hidden) {
      visible.push(item);
    }
    return visible;
  }, []);

/* Some pages remain available to direct links and machine readers without
   taking up primary-navigation space. */
export const visibleNav: NavGroup[] = nav
  .filter((group) => !group.hidden)
  .map((group) => ({ ...group, items: visibleItems(group.items) }));

export function isVisibleNavHref(href: string): boolean {
  return visibleNav.some(
    (group) =>
      group.href === href ||
      group.items.some((item) =>
        isSubGroup(item)
          ? item.items.some((leaf) => leaf.href === href)
          : item.href === href,
      ),
  );
}

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
  for (const group of visibleNav) {
    if (group.href) push({ href: group.href, title: group.label });
    for (const item of group.items) {
      if (isSubGroup(item)) item.items.forEach(push);
      else push(item);
    }
  }
  return out;
})();
