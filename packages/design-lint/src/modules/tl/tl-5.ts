import fs from "node:fs";
import path from "node:path";
import type { Candidate, Params, RuleModule } from "../../types.ts";
import { norm, readJson } from "./shared.ts";

/* TL-5 and TL-6: a mobile app. Each rule applies when serviceType is mobile-app.
   TL-5a and TL-6a read the store listing, a JSON file with "channels" and
   "developerName". The path is the parameter storeListingFile, relative to the
   project root. */

const mobile = (params: Params) => params.serviceType === "mobile-app";

function listing(root: string, params: Params): { file: string; json: Record<string, unknown> | null } {
  const file = path.join(root, String(params.storeListingFile));
  const json = readJson(file);
  return { file, json: json && typeof json === "object" && !Array.isArray(json) ? (json as Record<string, unknown>) : null };
}

export const tl5a: RuleModule = {
  code: "TL-5a",
  surface: "project",

  locate({ root, params }) {
    if (!mobile(params)) return [];
    const { file, json } = listing(root, params);
    return [{ file: json ? file : root, line: 1, column: 1, data: { channels: json?.channels ?? null } }];
  },

  decide(candidate, params) {
    const { channels } = candidate.data as { channels: unknown };
    if (!Array.isArray(channels)) return `${String(params.storeListingFile)} is missing or has no "channels" list.`;
    const allowed = (params.allowedStores as string[]).map(String);
    const bad = channels.map(String).filter((c) => !allowed.includes(c));
    return bad.length > 0 ? `Distribution through ${bad.join(", ")} is not allowed. Use ${allowed.join(", ")}.` : null;
  },
};

export const tl5b: RuleModule = {
  code: "TL-5b",
  surface: "project",

  locate({ root, params }) {
    if (!mobile(params)) return [];
    const file = path.join(root, String(params.manifestFile));
    const json = readJson(file) as Record<string, unknown> | null;
    return [{ file: json ? file : root, line: 1, column: 1, data: { manifest: json !== null, licence: json?.license ?? null } }];
  },

  decide(candidate, params) {
    const { manifest, licence } = candidate.data as { manifest: boolean; licence: unknown };
    if (!manifest) return `${String(params.manifestFile)} is missing or is not JSON.`;
    const allowed = (params.allowedLicences as string[]).map(String);
    if (typeof licence !== "string") return `The manifest has no license field. Set it to ${allowed.join(" or ")}.`;
    return allowed.includes(licence) ? null : `The licence ${licence} is not allowed. Use ${allowed.join(" or ")}.`;
  },
};

export const tl6a: RuleModule = {
  code: "TL-6a",
  surface: "project",

  locate({ root, params }) {
    if (!mobile(params)) return [];
    const { file, json } = listing(root, params);
    return [{ file: json ? file : root, line: 1, column: 1, data: { name: json?.developerName ?? null } }];
  },

  decide(candidate, params) {
    const { name } = candidate.data as { name: unknown };
    if (typeof name !== "string") return `${String(params.storeListingFile)} is missing or has no "developerName".`;
    return norm(name) === norm(String(params.agencyName)) ? null : `The store developer name "${name}" is not the agency name "${String(params.agencyName)}".`;
  },
};

/* The developer name of a manifest, by format. JSON: the first key named
   developerName, developer, or author (a string, or an object with a name).
   Property list: the key DeveloperName. Android XML: a meta-data element named
   developerName or developer. */
export function developerName(file: string, text: string): string | null {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".json") {
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return null;
    }
    const find = (v: unknown): string | null => {
      if (!v || typeof v !== "object") return null;
      for (const [k, val] of Object.entries(v)) {
        if (["developername", "developer", "author"].includes(k.toLowerCase())) {
          if (typeof val === "string") return val;
          if (val && typeof val === "object" && typeof (val as { name?: unknown }).name === "string") return (val as { name: string }).name;
        }
      }
      for (const val of Object.values(v)) {
        const found = find(val);
        if (found !== null) return found;
      }
      return null;
    };
    return find(json);
  }
  if (ext === ".plist") return /<key>\s*DeveloperName\s*<\/key>\s*<string>([^<]*)<\/string>/i.exec(text)?.[1] ?? null;
  if (ext === ".xml") {
    for (const tag of text.match(/<meta-data\b[^>]*>/g) ?? []) {
      const name = /android:name\s*=\s*"([^"]*)"/.exec(tag)?.[1];
      if (name && ["developername", "developer"].includes(name.toLowerCase())) return /android:value\s*=\s*"([^"]*)"/.exec(tag)?.[1] ?? null;
    }
  }
  return null;
}

export const tl6c: RuleModule = {
  code: "TL-6c",
  surface: "project",

  locate({ root, params }) {
    const out: Candidate[] = [];
    for (const entry of params.manifestFiles as string[]) {
      const file = path.join(root, entry);
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
      const name = developerName(file, fs.readFileSync(file, "utf8"));
      if (name !== null) out.push({ file, line: 1, column: 1, data: { name } });
    }
    if (out.length === 0) out.push({ file: root, line: 1, column: 1, data: { name: null } });
    return out;
  },

  decide(candidate, params) {
    const { name } = candidate.data as { name: string | null };
    if (name === null) return `No file of ${(params.manifestFiles as string[]).join(", ")} holds a developer name.`;
    return norm(name) === norm(String(params.agencyName)) ? null : `The manifest developer name "${name}" is not the agency name "${String(params.agencyName)}".`;
  },
};
