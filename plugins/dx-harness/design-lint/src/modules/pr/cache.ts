import fs from "node:fs";
import path from "node:path";
import type { Candidate, RuleModule } from "../../types.ts";

/* PR-7f: static assets carry a long cache lifetime. The rule reads three kinds of
   cache config: Netlify and Cloudflare _headers, vercel.json, and nginx.conf.
   For each asset pattern it builds a sample path, finds the rules that match the
   sample, and reads Cache-Control from the last of them. It reads the config,
   not the server: a header that a CDN adds is not seen. The nginx reader handles
   location blocks with add_header Cache-Control and expires, not include files. */

interface HeaderRule {
  match: RegExp;
  cacheControl: string | null;
  line: number;
}

const globToRegExp = (g: string) =>
  new RegExp(`^${g.replace(/\\(.)/g, "$1").replace(/\(\.\*\)/g, "*").replace(/[.+?^${}|()[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);

function fromHeadersFile(text: string): HeaderRule[] {
  const rules: HeaderRule[] = [];
  let current: HeaderRule | null = null;
  text.split(/\r?\n/).forEach((raw, i) => {
    if (!raw.trim() || raw.trim().startsWith("#")) return;
    if (/^\S/.test(raw)) {
      current = { match: globToRegExp(raw.trim()), cacheControl: null, line: i + 1 };
      rules.push(current);
    } else if (current) {
      const m = raw.trim().match(/^cache-control\s*:\s*(.*)$/i);
      if (m) current.cacheControl = m[1];
    }
  });
  return rules;
}

function fromVercel(text: string): HeaderRule[] {
  const json = JSON.parse(text) as { headers?: { source: string; headers: { key: string; value: string }[] }[] };
  const lines = text.split(/\r?\n/);
  return (json.headers ?? []).map((h) => {
    const line = Math.max(1, lines.findIndex((l) => l.includes(JSON.stringify(h.source))) + 1);
    const source = h.source.replace(/:\w+\*/g, "*").replace(/:\w+/g, "*");
    return {
      match: globToRegExp(source),
      cacheControl: h.headers.find((x) => x.key.toLowerCase() === "cache-control")?.value ?? null,
      line,
    };
  });
}

const UNITS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400, w: 604800, M: 2592000, y: 31536000 };

function expiresToControl(value: string): string {
  if (value === "max") return "max-age=315360000";
  if (value === "off") return "";
  if (/^-/.test(value) || value === "epoch") return "no-cache";
  const total = [...value.matchAll(/(\d+)\s*([smhdwMy]?)/g)].reduce((n, m) => n + Number(m[1]) * (UNITS[m[2] || "s"] ?? 1), 0);
  return `max-age=${total}`;
}

function fromNginx(text: string): HeaderRule[] {
  const rules: HeaderRule[] = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*location\s+(?:(~\*|~|=|\^~)\s+)?(\S+)\s*\{/);
    if (!m) continue;
    let body = "";
    let depth = 1;
    let j = i + 1;
    for (; j < lines.length && depth > 0; j++) {
      depth += (lines[j].match(/\{/g) ?? []).length - (lines[j].match(/\}/g) ?? []).length;
      body += `${lines[j]}\n`;
    }
    const [, op, pat] = m;
    const match = op === "~" || op === "~*" ? new RegExp(pat.replace(/^"|"$/g, ""), op === "~*" ? "i" : "") : op === "=" ? new RegExp(`^${pat}$`) : new RegExp(`^${pat.replace(/[.+?^${}|[\]\\]/g, "\\$&")}`);
    const header = body.match(/add_header\s+Cache-Control\s+"?([^";]+)"?\s*;/i);
    const expires = body.match(/^\s*expires\s+([^;]+);/m);
    rules.push({ match, cacheControl: header ? header[1].trim() : expires ? expiresToControl(expires[1].trim()) : null, line: i + 1 });
  }
  return rules;
}

function readRules(file: string): HeaderRule[] {
  const text = fs.readFileSync(file, "utf8");
  const base = path.basename(file).toLowerCase();
  if (base.endsWith(".json")) return fromVercel(text);
  if (base.endsWith(".conf")) return fromNginx(text);
  return fromHeadersFile(text);
}

export function maxAge(control: string): number | null {
  const m = control.match(/(?:^|[,\s])max-age\s*=\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

export const pr7f: RuleModule = {
  code: "PR-7f",
  surface: "project",
  locate({ root, params }) {
    const out: Candidate[] = [];
    const min = Number(params.minCacheSeconds);
    const files = (params.cacheConfigFiles as string[]).map((f) => path.join(root, f));
    const present = files.filter((f) => fs.existsSync(f));
    if (present.length === 0) {
      return [{ file: root, line: 1, column: 1, data: { problem: `None of the cache config files exists: ${(params.cacheConfigFiles as string[]).join(", ")}.` } }];
    }
    const rules = present.flatMap((file) => {
      try {
        return readRules(file).map((r) => ({ ...r, file }));
      } catch {
        return [];
      }
    });
    for (const pattern of params.assetPatterns as string[]) {
      const samples = [`/${pattern.replace(/\*/g, "asset")}`, `/dir/${pattern.replace(/\*/g, "asset")}`];
      const hits = rules.filter((r) => r.cacheControl !== null && samples.some((s) => r.match.test(s)));
      const win = hits[hits.length - 1];
      let problem: string | null = null;
      if (!win) problem = `No rule sets Cache-Control for ${pattern}.`;
      else if (/no-store|no-cache/i.test(win.cacheControl!)) problem = `The rule for ${pattern} sets "${win.cacheControl}", which stops caching.`;
      else {
        const age = maxAge(win.cacheControl!);
        if (age === null || age < min) problem = `The rule for ${pattern} sets a max-age of ${age ?? "none"} seconds, below the minimum of ${min}.`;
      }
      if (problem) out.push({ file: win?.file ?? present[0], line: win?.line ?? 1, column: 1, data: { problem } });
    }
    return out;
  },
  decide(candidate) {
    return (candidate.data as { problem: string }).problem;
  },
};
