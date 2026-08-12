"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { readingOrder } from "@/lib/nav";

/* Sequential page navigation at the foot of every docs page, driven by the
   same tree the sidebar renders. Pages outside the tree (e.g. control detail
   pages) render nothing. */
export function PrevNext() {
  const pathname = usePathname();
  const index = readingOrder.findIndex((leaf) => leaf.href === pathname);
  if (index === -1) return null;

  const prev = index > 0 ? readingOrder[index - 1] : null;
  const next = index < readingOrder.length - 1 ? readingOrder[index + 1] : null;
  if (!prev && !next) return null;

  const card =
    "group flex min-h-11 flex-col gap-0.5 rounded-lg border border-border p-4 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)";

  return (
    <nav
      aria-label="Sequential pages"
      className="mt-16 grid max-w-[720px] grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link href={prev.href} className={card}>
          <span className="text-xs text-muted-foreground">← Previous</span>
          <span className="text-sm font-medium group-hover:text-tw-blue">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}
      {next && (
        <Link href={next.href} className={`${card} sm:text-right`}>
          <span className="text-xs text-muted-foreground">Next →</span>
          <span className="text-sm font-medium group-hover:text-tw-blue">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
