import fetch from "node-fetch";
import PQueue from "p-queue";

const queue = new PQueue({ concurrency: 4 });

export function sendWebhook(url, payload) {
  return queue.add(() =>
    fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
    }),
  );
}
