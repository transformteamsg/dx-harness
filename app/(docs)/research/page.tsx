import { SectionIndex } from "@/components/section-index";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Research", ...mdAlternate("/research") };

export default function Page() {
  return <SectionIndex sectionKey="research" />;
}
