import { db } from "./db.js";

export function recordSubmission(assignmentId, studentId, submittedAt) {
  if (!assignmentId) {
    throw new Error("assignmentId is required");
  }
  if (!studentId) {
    throw new Error("studentId is required");
  }
  return db.insert("submissions", { assignmentId, studentId, submittedAt });
}
