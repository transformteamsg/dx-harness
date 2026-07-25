#!/usr/bin/env node
// No dependencies on purpose: this CLI only uses the Node standard library.
import { readFile } from "node:fs/promises";

const [, , path] = process.argv;
const rows = JSON.parse(await readFile(path, "utf8"));
for (const row of rows) {
  console.log([row.id, row.name, row.email].join(","));
}
