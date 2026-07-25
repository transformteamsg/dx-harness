#!/usr/bin/env bash
# Builds the branch diff that the code-review evals are graded against.
#
# The fixture tree (committed to main by the runner) is the "before" state.
# This script creates a feature branch and applies five defects, each chosen to
# sit squarely inside a different one of the skill's seven review angles and to
# be unambiguous enough that a reviewer either finds it or does not -- there is
# no judgement call about whether these are real:
#
#   1. off-by-one          `i <= subs.length` walks one past the end
#   2. efficiency          per-row db.findOne inside that loop (N+1)
#   3. error handling      empty catch swallows the insert failure
#   4. removed behavior    the title validation guard is deleted
#   5. altitude            shared pageBounds branches on a specific caller
#
# Defect 5 also drops the Math.min clamp on `end`, so the shared helper now
# reports bounds past `total`.
set -euo pipefail

git checkout -q -b feat/submission-listing

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

git add -A
git commit -q -m "feat(\`submissions\`): list submissions with student details"
