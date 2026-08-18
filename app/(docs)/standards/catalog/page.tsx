import { getCatalog, getScopeMeta } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/catalog-browser";
import { SectionIndex } from "@/components/section-index";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = {
  title: "Standards and control catalog",
  ...mdAlternate("/standards/catalog"),
};

export default function CatalogPage() {
  const controls = getCatalog();
  const scopeMeta = getScopeMeta();
  return (
    <div>
      <SectionIndex sectionKey="standards" omitHref="/standards/catalog" />
      <section className="mt-14 max-w-[720px] border-t border-border pt-10">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Control catalog
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Every control in the standard — one verifiable statement each, with its tier, fail
          conditions, and how it&apos;s checked. Cite IDs in review; agents read the same list.
        </p>
        <p className="mt-3 text-base text-muted-foreground">
          Machine-readable source:{" "}
          <a
            className="text-site-accent-text underline underline-offset-2"
            href="/standards/catalog.yaml"
          >
            catalog.yaml
          </a>
        </p>
      </section>
      <CatalogBrowser
        controls={controls}
        productNames={scopeMeta.products}
        audienceNames={scopeMeta.audiences}
      />
    </div>
  );
}
