import { SectionIndex } from "@/components/section-index";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Principles", ...mdAlternate("/principles") };

export default function Page() {
  return <SectionIndex sectionKey="principles" />;
}
