import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/* An app outside the repository relabels each new issue once: it removes the
   shape label and adds Feature. The keep-shape-label workflow undoes that.
   These run the workflow's github-script step on simulated events; whether
   GitHub runs the workflow is confirmed on a new issue after the merge. See
   issue #609. */

type Step = { uses?: string; with?: { script?: string } };
type Workflow = { jobs?: Record<string, { steps?: Step[] }> };

function readScript() {
  const workflow: Workflow = parse(fs.readFileSync(path.join(process.cwd(), ".github/workflows/keep-shape-label.yml"), "utf8"));
  const steps = Object.values(workflow.jobs ?? {}).flatMap((job) => job.steps ?? []);
  const script = steps.find((step) => step.uses?.startsWith("actions/github-script"))?.with?.script;
  if (script === undefined) throw new Error("keep-shape-label.yml has no github-script step");
  return script;
}

type Sender = { type: "Bot" | "User"; login: string };
type LabelEvent = { action: "labeled" | "unlabeled"; label: string; labelsAfter: string[]; sender: Sender };

const appBot: Sender = { type: "Bot", login: "some-app[bot]" };

/* Runs the script the way actions/github-script does, and returns the label
   writes it made. */
async function run(event: LabelEvent) {
  const added: string[] = [];
  const removed: string[] = [];
  const github = {
    rest: {
      issues: {
        addLabels: async ({ labels }: { labels: string[] }) => {
          added.push(...labels);
        },
        removeLabel: async ({ name }: { name: string }) => {
          removed.push(name);
        },
      },
    },
  };
  const context = {
    eventName: "issues",
    repo: { owner: "transformteamsg", repo: "dx-harness" },
    issue: { owner: "transformteamsg", repo: "dx-harness", number: 1 },
    payload: {
      action: event.action,
      label: { name: event.label },
      sender: event.sender,
      issue: { number: 1, labels: event.labelsAfter.map((name) => ({ name })) },
    },
  };
  const core = { info: () => {}, notice: () => {}, warning: () => {}, setFailed: (message: string) => { throw new Error(message); } };
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
  await new AsyncFunction("github", "context", "core", readScript())(github, context, core);
  return { added, removed };
}

describe("a task filed by dx-create-task", () => {
  it("gets its task label back when a bot removes it", async () => {
    const writes = await run({ action: "unlabeled", label: "task", labelsAfter: ["skill:dx-create-task"], sender: appBot });
    expect(writes.added).toEqual(["task"]);
    expect(writes.removed).toEqual([]);
  });
  it("loses Feature when a bot adds it", async () => {
    const writes = await run({ action: "labeled", label: "Feature", labelsAfter: ["skill:dx-create-task", "Feature"], sender: appBot });
    expect(writes.removed).toEqual(["Feature"]);
    expect(writes.added).toEqual([]);
  });
});

