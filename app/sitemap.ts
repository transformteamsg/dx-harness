import type { MetadataRoute } from "next";
import { allTwins } from "@/lib/markdown-twin";

export const dynamic = "force-static";

/* HTML URLs only. The `.md` twins are noindex (see markdownResponse), so they
   stay out of the sitemap. Set NEXT_PUBLIC_SITE_URL on deploy for absolute
   URLs; without it the paths are root-relative, valid for a sitemap served at
   the site root. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const paths = Array.from(new Set(allTwins().map((t) => t.htmlPath))).sort();
  return paths.map((p) => ({ url: `${base}${p}` }));
}
