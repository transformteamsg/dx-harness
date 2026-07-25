import { db } from "./db.js";

export function listAssignments(courseId) {
  if (!courseId) {
    throw new Error("courseId is required");
  }
  return db.query("SELECT id, title, dueAt FROM assignments WHERE courseId = ?", [
    courseId,
  ]);
}

export function createAssignment(courseId, title, dueAt) {
  if (!courseId) {
    throw new Error("courseId is required");
  }
  if (!title || title.trim().length === 0) {
    throw new Error("title is required");
  }
  return db.insert("assignments", { courseId, title, dueAt });
}
