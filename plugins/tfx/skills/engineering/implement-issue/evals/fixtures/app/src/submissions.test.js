import { test } from "node:test";
import assert from "node:assert/strict";
import { recordSubmission } from "./submissions.js";
import { db } from "./db.js";

test("recordSubmission", async (t) => {
  await t.test("stores the submission", () => {
    db.reset();
    const want = "student-1";
    const got = recordSubmission("assignment-1", "student-1", "2026-01-01T00:00:00Z").studentId;
    assert.equal(got, want, `want: ${want}; got: ${got}`);
  });
});
