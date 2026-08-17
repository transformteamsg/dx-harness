#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SCRIPT_RE = /<script(?<attrs>[^>]*)>(?<body>[\s\S]*?)<\/script>/gi;
const CSP_ASSET_RE = /\/_next\/static\/csp-inline\/(?<asset>[a-f0-9]+\.js)/g;
const JAVASCRIPT_TYPES = new Set(["", "application/javascript", "module", "text/javascript"]);

function attributeValue(attrs, name) {
  const match = attrs.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match ? (match[1] ?? match[2] ?? match[3] ?? "") : null;
}

function isExecutableInlineScript(attrs, body) {
  if (!body.trim() || attributeValue(attrs, "src") !== null) return false;
  const type = attributeValue(attrs, "type");
  return JAVASCRIPT_TYPES.has((type ?? "").trim().toLowerCase());
}

export function findExecutableInlineScripts(html) {
  return [...html.matchAll(SCRIPT_RE)].filter(({ groups }) =>
    isExecutableInlineScript(groups?.attrs ?? "", groups?.body ?? ""),
  );
}

export function externalizeNextInlineScripts({ appDir, staticDir }) {
  if (!fs.existsSync(appDir)) {
    throw new Error(`Next.js prerendered app output not found: ${appDir}`);
  }

  const assetDir = path.join(staticDir, "csp-inline");
  fs.mkdirSync(assetDir, { recursive: true });

  let htmlFilesScanned = 0;
  let htmlFilesChanged = 0;
  let scriptsExternalized = 0;
  let assetsWritten = 0;
  const referencedAssets = new Set();

  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(file);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".html")) continue;

      htmlFilesScanned += 1;
      const original = fs.readFileSync(file, "utf8");
      const transformed = original.replace(SCRIPT_RE, (whole, _attrs, _body, _offset, _html, groups) => {
        const attrs = groups?.attrs ?? "";
        const body = groups?.body ?? "";
        if (!isExecutableInlineScript(attrs, body)) return whole;

        const hash = crypto.createHash("sha256").update(body).digest("hex").slice(0, 24);
        const assetName = `${hash}.js`;
        const assetPath = path.join(assetDir, assetName);
        if (!referencedAssets.has(assetName)) {
          fs.writeFileSync(assetPath, body);
          assetsWritten += 1;
          referencedAssets.add(assetName);
        }
        scriptsExternalized += 1;
        return `<script${attrs} src="/_next/static/csp-inline/${assetName}"></script>`;
      });

      for (const { groups } of transformed.matchAll(CSP_ASSET_RE)) {
        if (groups?.asset) referencedAssets.add(groups.asset);
      }

      if (transformed === original) continue;
      const remaining = findExecutableInlineScripts(transformed);
      if (remaining.length > 0) {
        throw new Error(`${file} still contains ${remaining.length} executable inline script(s)`);
      }
      fs.writeFileSync(file, transformed);
      htmlFilesChanged += 1;
    }
  }

  visit(appDir);
  if (htmlFilesScanned === 0) {
    throw new Error(`No prerendered HTML files found under ${appDir}`);
  }
  for (const asset of referencedAssets) {
    if (!fs.existsSync(path.join(assetDir, asset))) {
      throw new Error(`Prerendered HTML references a missing CSP script asset: ${asset}`);
    }
  }
  for (const entry of fs.readdirSync(assetDir, { withFileTypes: true })) {
    if (entry.isFile() && !referencedAssets.has(entry.name)) {
      fs.rmSync(path.join(assetDir, entry.name));
    }
  }

  return {
    htmlFilesScanned,
    htmlFilesChanged,
    scriptsExternalized,
    assetsWritten,
    assetsReferenced: referencedAssets.size,
  };
}

function run() {
  const distDir = path.resolve(process.cwd(), process.env.NEXT_DIST_DIR || ".next");
  const result = externalizeNextInlineScripts({
    appDir: path.join(distDir, "server", "app"),
    staticDir: path.join(distDir, "static"),
  });
  console.log(
    `[csp] Externalized ${result.scriptsExternalized} inline scripts from ` +
      `${result.htmlFilesChanged}/${result.htmlFilesScanned} prerendered pages ` +
      `using ${result.assetsReferenced} same-origin assets (${result.assetsWritten} written).`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run();
}
