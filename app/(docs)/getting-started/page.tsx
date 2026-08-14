import { SectionIndex } from "@/components/section-index";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Start with code", ...mdAlternate("/getting-started") };

export default function Page() {
  return <SectionIndex sectionKey="getting-started" />;
}
