import Link from "next/link";

/* One level deep by design: section root → current page. */
export function Breadcrumb({
  section,
  current,
}: {
  section: { label: string; href: string };
  current: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs">
      <Link
        href={section.href}
        className="font-medium text-tw-blue underline-offset-2 hover:underline"
      >
        {section.label}
      </Link>
      <span aria-hidden="true" className="text-muted-foreground">
        /
      </span>
      <span className="text-muted-foreground">{current}</span>
    </nav>
  );
}
