import { SectionIndex } from "@/components/section-index";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Guidelines", ...mdAlternate("/guidelines") };

export default function Page() {
  return <SectionIndex sectionKey="guidelines" />;
}
