// In-memory store, sufficient for the unit tests in this project.
const tables = { assignments: [], submissions: [] };
let nextId = 1;

export const db = {
  query(sql, params) {
    return [];
  },
  insert(table, row) {
    const record = { id: nextId++, ...row };
    tables[table].push(record);
    return record;
  },
  findOne(table, where) {
    return (
      tables[table].find((row) =>
        Object.entries(where).every(([key, value]) => row[key] === value),
      ) ?? null
    );
  },
  reset() {
    for (const key of Object.keys(tables)) tables[key] = [];
    nextId = 1;
  },
};
