import { llmsIndex } from "@/lib/llms";

export const dynamic = "force-static";

/* /llms.txt is the curated index (llmstxt.org): it links each page's `.md`
   twin (append `.md` to any path) and the optional /llms-full.txt corpus. */
export function GET() {
  return new Response(llmsIndex(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
