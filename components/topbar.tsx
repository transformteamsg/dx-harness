"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-tw-blue text-xs font-semibold text-white">
              tf
            </span>
            <span className="font-display text-base font-semibold tracking-tight">
              <span className="sm:hidden">TFX</span>
              <span className="hidden sm:inline">TFX Design Standard</span>
            </span>
            <span className="hidden rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground sm:inline-flex">
              v0.1 draft
            </span>
          </Link>
        </div>
        <nav aria-label="Primary" className="flex items-center text-sm font-medium text-muted-foreground">
          <Link href="/for-agents" className="inline-flex min-h-11 items-center px-2 hover:text-foreground sm:min-h-6 sm:px-0">For agents</Link>
        </nav>
      </div>
    </header>
  );
}
