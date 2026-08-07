import { SectionIndex } from "@/components/section-index";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Products", ...mdAlternate("/products") };

export default function Page() {
  return <SectionIndex sectionKey="products" />;
}
