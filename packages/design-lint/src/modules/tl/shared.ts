import fs from "node:fs";
import path from "node:path";

/* Helpers that the TL modules share. */

export const VIEWPORT = { width: 1280, height: 800 };

/* The host of a URL, or null when the value is not an absolute URL. */
export function hostOf(url: unknown): string | null {
  try {
    return new URL(String(url)).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/* TL-3 and TL-4 apply only to a .gov.sg host, read from productUrl. */
export function isGovSg(params: Record<string, unknown>): boolean {
  const host = hostOf(params.productUrl);
  return host !== null && host.endsWith(".gov.sg");
}

export const rel = (root: string, file: string) => path.relative(root, file).split(path.sep).join("/");

export function readJson(file: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
