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

import { nav, isSubGroup, type NavItem, type NavLeaf } from "@/lib/nav";

const leafHrefs = (items: NavItem[]): string[] =>
  items.flatMap((item) =>
    isSubGroup(item) ? item.items.map((leaf) => leaf.href) : [item.href],
  );

const groupLabel = "px-1 py-1.5 text-sm font-semibold";

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
        className="text-sm text-muted-foreground hover:text-foreground data-active:text-foreground"
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
                {/* Clerk-style group row: label on the left, collapse chevron
                    on the right edge. */}
                <div className="flex items-center gap-0.5">
                  {group.href ? (
                    <Link
                      href={group.href}
                      className={clsx(
                        "flex-1 rounded-md text-foreground/80 hover:text-foreground",
                        groupLabel,
                        pathname === group.href && "text-foreground"
                      )}
                    >
                      {group.label}
                    </Link>
                  ) : (
                    <CollapsibleTrigger
                      className={clsx(
                        "flex-1 rounded-md text-left text-foreground/80 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)",
                        groupLabel
                      )}
                    >
                      {group.label}
                    </CollapsibleTrigger>
                  )}
                  <CollapsibleTrigger
                    aria-label={`${open ? "Collapse" : "Expand"} ${group.label}`}
                    className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                  >
                    <ChevronRight
                      className={clsx(
                        "size-3.5 transition-transform duration-200",
                        open ? "rotate-90" : "rotate-0"
                      )}
                    />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-starting-style:h-0 data-ending-style:h-0">
                  <SidebarGroupContent className="pt-0.5">
                    <SidebarMenu className="ml-2 gap-0.5 border-l border-sidebar-border pl-2">
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
                                <span className="flex-1 text-left">{item.label}</span>
                                <ChevronRight
                                  className={clsx(
                                    "size-3.5 shrink-0 transition-transform duration-200",
                                    subOpen && "rotate-90"
                                  )}
                                />
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
