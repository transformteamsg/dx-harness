import { llmsFull } from "@/lib/llms";

export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFull(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
