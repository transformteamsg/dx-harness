import { SectionIndex } from "@/components/section-index";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Foundations", ...mdAlternate("/foundations") };

export default function Page() {
  return <SectionIndex sectionKey="foundations" />;
}
