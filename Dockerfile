# syntax=docker/dockerfile:1

# Builder: installs deps fresh for this platform (sharp and unrs-resolver need
# native builds, see pnpm-workspace.yaml's allowBuilds) and runs the same
# `pnpm build` CI runs, so the standards gate (prebuild -> check-standards.mjs
# + check:python) always runs here too -- see ci.yml's comment on why that
# gate must run exactly once per build.
FROM gdssingapore/airbase:node-22-builder AS builder
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-yaml \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@11 --activate

# The checks layer matches source structure through ast-grep, which is not a
# package dependency. Pin the same version ci.yml installs.
RUN npm install --global @ast-grep/cli@0.44.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# devDependencies (eslint, playwright, tailwindcss, typescript, vitest, ...) are
# only needed to build and test, never to run `next start`. Prune them so the
# runtime stage doesn't ship a build+test toolchain inside the served image.
RUN pnpm prune --prod

# Runtime: only what `next start` actually touches -- not the full repo tree,
# and not plugins/dx-harness/ (the AI harness plugin lives alongside this app
# in the same repo but is a build/dev-time concern, never a runtime one).
#
# content/ still has to ship: /products/[slug], /getting-started/[slug],
# /harness/[slug] and /standards/[slug] all leave dynamicParams at its default
# of true, so a slug outside generateStaticParams() renders on request and
# reads content/ from disk. plugins/dx-harness/standards/ does not: every
# route that reads it (/llms.txt, /llms-full.txt, /standards/catalog.yaml,
# /standards/catalog/[id], /md/[...path], /sitemap.xml) is either force-static
# or sets dynamicParams: false, so it's fully baked into .next at build time.
FROM gdssingapore/airbase:node-22
WORKDIR /app
COPY --chown=app:app --from=builder /app/package.json ./package.json
COPY --chown=app:app --from=builder /app/next.config.mjs ./next.config.mjs
COPY --chown=app:app --from=builder /app/public ./public
COPY --chown=app:app --from=builder /app/content ./content
COPY --chown=app:app --from=builder /app/.next ./.next
COPY --chown=app:app --from=builder /app/node_modules ./node_modules
USER app

ENV NODE_OPTIONS=--max-old-space-size=400
EXPOSE 3000

CMD ["sh", "-c", "exec ./node_modules/.bin/next start -p \"${PORT:-3000}\" -H 0.0.0.0"]
