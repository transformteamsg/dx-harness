"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DxdMark } from "@/components/dxd-mark";

export function TopBar() {
  const pathname = usePathname();
  const showNavToggle = pathname !== "/"; // landing has no docs sidebar

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
          {showNavToggle && (
            <SidebarTrigger
              aria-label="Open navigation"
              className="-ml-1 size-11 shrink-0 sm:-ml-1.5 sm:size-7 lg:hidden"
            />
          )}
          <Link href="/" className="flex min-h-11 shrink-0 items-center gap-2 sm:min-h-6 sm:gap-2.5">
            <DxdMark className="size-7 shrink-0 text-(--dxd-lime-deep)" />
            <span className="font-display text-base font-semibold tracking-tight">
              <span className="sm:hidden">dx</span>
              <span className="hidden sm:inline">DX Design Harness</span>
            </span>
            <span className="hidden rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground sm:inline-flex">
              v0.1 draft
            </span>
          </Link>
        </div>
        {/* The bar's right side is deliberately empty: the "For agents" link was
            removed on 2026-08-18 at the builder's request, and the whole nav
            landmark went with it rather than leaving an empty one for assistive
            tech to announce (A11Y-7). The page it pointed at was removed on
            2026-08-19; machine readers now start at /llms.txt. */}
      </div>
    </header>
  );
}
