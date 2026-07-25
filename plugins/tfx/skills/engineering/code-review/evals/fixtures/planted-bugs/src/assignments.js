import { pageBounds } from "./util/pagination.js";
import { db, log } from "./db.js";

export function listAssignments(courseId, page = 1, perPage = 20) {
  if (!courseId) {
    throw new Error("courseId is required");
  }
  const total = db.count("assignments", { courseId });
  const { start, end } = pageBounds(total, page, perPage);
  const rows = db.query(
    "SELECT id, title, dueAt FROM assignments WHERE courseId = ? LIMIT ? OFFSET ?",
    [courseId, end - start, start],
  );
  return { rows, total };
}

export function createAssignment(courseId, title) {
  if (!courseId) {
    throw new Error("courseId is required");
  }
  if (!title || title.trim().length === 0) {
    throw new Error("title is required");
  }
  try {
    return db.insert("assignments", { courseId, title });
  } catch (err) {
    log.error("failed to create assignment", err);
    throw err;
  }
}
