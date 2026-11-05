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
async function run(event: LabelEvent, removeError?: { status: number }) {
  const added: string[] = [];
  const removed: string[] = [];
  const github = {
    rest: {
      issues: {
        addLabels: async ({ labels }: { labels: string[] }) => {
          added.push(...labels);
        },
        removeLabel: async ({ name }: { name: string }) => {
          if (removeError) throw Object.assign(new Error(`status ${removeError.status}`), removeError);
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

describe("a chore filed by dx-create-chore", () => {
  it("keeps chore and loses Feature when a bot adds Feature next to it", async () => {
    const writes = await run({ action: "labeled", label: "Feature", labelsAfter: ["chore", "skill:dx-create-chore", "Feature"], sender: appBot });
    expect(writes.removed).toEqual(["Feature"]);
    expect(writes.added).toEqual([]);
  });
});

describe("an issue filed with no shape label", () => {
  it("loses Feature when a bot adds it", async () => {
    const writes = await run({ action: "labeled", label: "Feature", labelsAfter: ["Feature"], sender: appBot });
    expect(writes.removed).toEqual(["Feature"]);
  });
});

describe("a label change the workflow leaves alone", () => {
  it.each([
    ["a person", { type: "User", login: "a-person" }],
    ["the workflow's own token", { type: "Bot", login: "github-actions[bot]" }],
  ] as const)("makes no write when %s removes task or adds Feature", async (_who, sender) => {
    const unlabeled = await run({ action: "unlabeled", label: "task", labelsAfter: [], sender });
    const labeled = await run({ action: "labeled", label: "Feature", labelsAfter: ["Feature"], sender });
    expect([...unlabeled.added, ...unlabeled.removed, ...labeled.added, ...labeled.removed]).toEqual([]);
  });
  it("makes no write when a bot removes a label that is not a shape label", async () => {
    const writes = await run({ action: "unlabeled", label: "priority: medium", labelsAfter: ["task"], sender: appBot });
    expect(writes).toEqual({ added: [], removed: [] });
  });
  it("adds back a shape label whatever its case", async () => {
    const writes = await run({ action: "unlabeled", label: "Task", labelsAfter: [], sender: appBot });
    expect(writes.added).toEqual(["Task"]);
  });
});

describe("a Feature label that is already off the issue", () => {
  it("does not fail the run when the removal returns 404", async () => {
    await expect(run({ action: "labeled", label: "Feature", labelsAfter: [], sender: appBot }, { status: 404 })).resolves.toEqual({ added: [], removed: [] });
  });
  it("fails the run on any other error", async () => {
    await expect(run({ action: "labeled", label: "Feature", labelsAfter: ["Feature"], sender: appBot }, { status: 403 })).rejects.toThrow("status 403");
  });
});
