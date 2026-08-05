/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Dev runs with NEXT_DIST_DIR=.next-dev so `next build` (default .next) never
     clobbers a running dev server's chunks. Unset elsewhere (incl. Vercel), so
     production builds keep the default .next. */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  /* The llms routes and catalog route read content/ and plugins/dx-harness/standards/
     with fs at build time; include them in file tracing for deploys. */
  outputFileTracingIncludes: {
    "/llms.txt": ["./content/**/*", "./plugins/dx-harness/standards/**/*"],
    "/llms-full.txt": ["./content/**/*", "./plugins/dx-harness/standards/**/*"],
    "/standards/catalog.yaml": ["./plugins/dx-harness/standards/**/*"],
    /* The per-control detail page reads the catalog + controls/<id>.md via
       getControlDetail at build time; trace those files into the route. */
    "/standards/catalog/[id]": ["./plugins/dx-harness/standards/**/*"],
    /* The .md twin route and the sitemap read content/ and plugins/dx-harness/standards/
       with fs at build time; include them so they bundle on deploy. */
    "/md/[...path]": ["./content/**/*", "./plugins/dx-harness/standards/**/*"],
    "/sitemap.xml": ["./content/**/*", "./plugins/dx-harness/standards/**/*"],
  },
};
export default nextConfig;
