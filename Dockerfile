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

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Runtime: the full app tree (not a pruned/standalone output), since routes
# such as /llms.txt, /standards/catalog.yaml and /md/[...path] read content/
# and plugins/dx-harness/standards/ from disk. Copying everything sidesteps
# having to keep a manual file-tracing list in sync with those routes.
FROM gdssingapore/airbase:node-22
WORKDIR /app
COPY --chown=app:app --from=builder /app /app
USER app

ENV NODE_OPTIONS=--max-old-space-size=400
EXPOSE 3000

CMD ["sh", "-c", "exec ./node_modules/.bin/next start -p \"${PORT:-3000}\" -H 0.0.0.0"]
