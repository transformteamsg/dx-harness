"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type NavLeaf = { href: string; title: string };
type NavSubGroup = { label: string; items: NavLeaf[] };
type NavItem = NavLeaf | NavSubGroup;
type NavGroup = { label: string; href?: string; items: NavItem[] };

const isSubGroup = (item: NavItem): item is NavSubGroup => "items" in item;
const leafHrefs = (items: NavItem[]): string[] =>
  items.flatMap((item) =>
    isSubGroup(item) ? item.items.map((leaf) => leaf.href) : [item.href],
  );

const nav: NavGroup[] = [
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
      { href: "/harness/tools", title: "Tools" },
      { href: "/harness/on-ramp", title: "Designer on-ramp" },
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

const groupLabel = "px-1 py-1.5 text-xs font-semibold";

export function AppSidebar() {
  const pathname = usePathname();
  /* Groups collapse by default; the group holding the current page opens
     itself. An explicit toggle overrides until the next toggle. */
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  if (pathname === "/") return null; // landing page is full-width, no docs chrome

  const renderLeaf = (item: NavLeaf) => (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton
        isActive={pathname === item.href}
        render={<Link href={item.href} />}
      >
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar>
      <SidebarContent className="px-2 py-4">
        {nav.map((group) => {
          const holdsCurrentPage =
            pathname === group.href || leafHrefs(group.items).includes(pathname);
          const open = toggled[group.label] ?? holdsCurrentPage;
          const onOpenChange = (o: boolean) =>
            setToggled((prev) => ({ ...prev, [group.label]: o }));

          return (
            <Collapsible
              key={group.label}
              open={open}
              onOpenChange={onOpenChange}
              className="mb-0.5"
            >
              <SidebarGroup className="p-0">
                <div className="flex items-center gap-0.5">
                  <CollapsibleTrigger
                    aria-label={`${open ? "Collapse" : "Expand"} ${group.label}`}
                    className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                  >
                    <ChevronRight
                      className={clsx(
                        "size-3.5 transition-transform duration-200",
                        open && "rotate-90"
                      )}
                    />
                  </CollapsibleTrigger>
                  {group.href ? (
                    <Link
                      href={group.href}
                      className={clsx(
                        "flex-1 rounded-md text-muted-foreground hover:text-foreground",
                        groupLabel,
                        pathname === group.href && "text-foreground"
                      )}
                    >
                      {group.label}
                    </Link>
                  ) : (
                    <CollapsibleTrigger
                      className={clsx(
                        "flex-1 rounded-md text-left text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)",
                        groupLabel
                      )}
                    >
                      {group.label}
                    </CollapsibleTrigger>
                  )}
                </div>
                <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-starting-style:h-0 data-ending-style:h-0">
                  <SidebarGroupContent className="pt-0.5">
                    <SidebarMenu className="ml-6 gap-0.5 border-l border-sidebar-border pl-2">
                      {group.items.map((item) => {
                        if (!isSubGroup(item)) return renderLeaf(item);

                        const subKey = `${group.label}/${item.label}`;
                        const subOpen =
                          toggled[subKey] ??
                          item.items.some((leaf) => pathname === leaf.href);

                        return (
                          <SidebarMenuItem key={item.label}>
                            <Collapsible
                              open={subOpen}
                              onOpenChange={(o) =>
                                setToggled((prev) => ({ ...prev, [subKey]: o }))
                              }
                            >
                              <CollapsibleTrigger
                                aria-label={`${subOpen ? "Collapse" : "Expand"} ${item.label}`}
                                className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                              >
                                <ChevronRight
                                  className={clsx(
                                    "size-3.5 shrink-0 transition-transform duration-200",
                                    subOpen && "rotate-90"
                                  )}
                                />
                                <span>{item.label}</span>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-starting-style:h-0 data-ending-style:h-0">
                                <SidebarMenu className="ml-3 gap-0.5 border-l border-sidebar-border pl-2 pt-0.5">
                                  {item.items.map(renderLeaf)}
                                </SidebarMenu>
                              </CollapsibleContent>
                            </Collapsible>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
