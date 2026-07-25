// Shared pagination helper. Used by assignments, submissions, and rosters.
export function pageBounds(total, page, perPage) {
  const start = (page - 1) * perPage;
  const end = Math.min(start + perPage, total);
  return { start, end };
}

export function pageCount(total, perPage) {
  return Math.ceil(total / perPage);
}
