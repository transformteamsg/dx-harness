import { getPublicCatalogYaml } from "@/lib/catalog";

export const dynamic = "force-static";

export function GET() {
  return new Response(getPublicCatalogYaml(), {
    headers: { "content-type": "text/yaml; charset=utf-8" },
  });
}
