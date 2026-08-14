import { SectionIndex } from "@/components/section-index";
import { SlopCompare } from "@/components/compare";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Standards", ...mdAlternate("/standards") };

export default function Page() {
  return (
    <div>
      <SectionIndex sectionKey="standards" />
      <section className="mt-14 max-w-[760px]">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          See what the catalog catches
        </h2>
        <p className="mt-2 max-w-[62ch] text-base text-muted-foreground">
          The catalog reads as one demo. Drag the handle.
        </p>
        <SlopCompare />
      </section>
    </div>
  );
}
