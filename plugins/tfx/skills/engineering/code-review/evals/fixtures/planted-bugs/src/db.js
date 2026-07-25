// Thin synchronous wrapper over better-sqlite3, stubbed for the eval fixture.
export const db = {
  query(sql, params) {
    return [];
  },
  count(table, where) {
    return 0;
  },
  insert(table, row) {
    return { id: 1, ...row };
  },
  findOne(table, where) {
    return null;
  },
};

export const log = {
  error(message, err) {},
  info(message) {},
};
