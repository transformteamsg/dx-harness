#!/usr/bin/env bash
# Variant of setup.sh that leaves the planted defects as uncommitted changes on
# main instead of committing them to a feature branch.
#
# This exists to make the "refuse to review the trunk" eval actually measure
# something. With a clean main, a skill-less Claude also declines -- not because
# it knows the rule, but because there is honestly nothing to review, so every
# assertion passes in both configurations and the eval reports no signal. Give
# main real uncommitted changes and the two diverge properly: base Claude has a
# diff in front of it and reviews it, while the skill still has to stop on the
# branch-name check.
set -euo pipefail

cat > src/util/pagination.js <<'EOF'
// Shared pagination helper. Used by assignments, submissions, and rosters.
export function pageBounds(total, page, perPage, callerContext) {
  const start = (page - 1) * perPage;

  if (callerContext === "submissions") {
    return { start, end: start + perPage + 1 };
  }

  const end = start + perPage;
  return { start, end };
}

export function pageCount(total, perPage) {
  return Math.ceil(total / perPage);
}
EOF

cat > src/assignments.js <<'EOF'
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
  try {
    return db.insert("assignments", { courseId, title });
  } catch (err) {
  }
}
EOF

cat > src/submissions.js <<'EOF'
import { pageBounds } from "./util/pagination.js";
import { db } from "./db.js";

export function listSubmissionsWithStudents(assignmentId, page = 1, perPage = 20) {
  const total = db.count("submissions", { assignmentId });
  const { start, end } = pageBounds(total, page, perPage, "submissions");

  const subs = db.query(
    "SELECT id, studentId, submittedAt FROM submissions WHERE assignmentId = ? LIMIT ? OFFSET ?",
    [assignmentId, end - start, start],
  );

  const out = [];
  for (let i = 0; i <= subs.length; i++) {
    const submission = subs[i];
    const student = db.findOne("students", { id: submission.studentId });
    out.push({ ...submission, student: student });
  }

  return out;
}
EOF

# Deliberately left uncommitted, and deliberately still on main.
