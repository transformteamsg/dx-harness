import path from "node:path";
import { defineConfig } from "vitest/config";
import { BaseSequencer } from "vitest/node";
import type { TestSpecification } from "vitest/node";
import { designLintProjects, shardSpecs } from "./vitest.projects.ts";

/* CI runs the tests as shards, each on a runner of its own, with --shard. */
class ProjectSequencer extends BaseSequencer {
  override async shard(files: TestSpecification[]): Promise<TestSpecification[]> {
    const { index, count } = this.ctx.config.shard!;
    const specs = files.map((spec) => ({ spec, project: spec.project.name, file: path.relative(this.ctx.config.root, spec.moduleId) }));
    return shardSpecs(specs, index, count).map((s) => s.spec);
  }
}

/* Node environment only: the tests read rule files from disk and need no DOM. */
export default defineConfig({
  test: {
    environment: "node",
    /* The rendered tests start a browser. */
    testTimeout: 120000,
    /* Closing a browser can wait on a busy machine. */
    hookTimeout: 60000,
    projects: designLintProjects(),
    sequence: { sequencer: ProjectSequencer },
  },
});
