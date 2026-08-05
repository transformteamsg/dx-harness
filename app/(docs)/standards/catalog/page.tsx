import { getCatalog, getScopeMeta } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/catalog-browser";
import { Breadcrumb } from "@/components/breadcrumb";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Control catalog", ...mdAlternate("/standards/catalog") };

export default function CatalogPage() {
  const controls = getCatalog();
  const scopeMeta = getScopeMeta();
  return (
    <div>
      <div className="max-w-[720px]">
        <Breadcrumb
          section={{ label: "Standards", href: "/standards" }}
          current="Control catalog"
        />
        <span className="mb-2 inline-block rounded-full border border-warning-muted bg-warning-subtle px-2 py-0.5 text-xs font-medium text-warning">
          ⚑ Proposed seed — v0.1
        </span>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Control catalog
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Every control in the standard — one verifiable statement each, with its tier, fail
          conditions, and how it&apos;s checked. Cite IDs in review; agents read the same list.
        </p>
        <p className="mt-3 text-base text-muted-foreground">
          Machine-readable source:{" "}
          <a
            className="text-tw-blue underline underline-offset-2"
            href="/standards/catalog.yaml"
          >
            catalog.yaml
          </a>
        </p>
      </div>
      <CatalogBrowser
        controls={controls}
        productNames={scopeMeta.products}
        audienceNames={scopeMeta.audiences}
      />
    </div>
  );
}
