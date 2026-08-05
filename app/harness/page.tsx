import { SectionIndex } from "@/components/section-index";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Harness", ...mdAlternate("/harness") };

export default function Page() {
  return <SectionIndex sectionKey="harness" />;
}
