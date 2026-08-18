/* Generates lib/third-party-notices.generated.ts and NOTICE.md from the
   installed production dependency tree.

   Most of this site's dependencies are MIT/ISC/BSD, which grant the right to
   redistribute only while their copyright and permission notices travel with
   the copies you ship. This script reads each package's own LICENSE file from
   node_modules so the notices we publish are the ones that were actually
   installed, rather than a hand-kept list that silently drifts.

   Each entry also carries a link to its upstream source. The link is
   provenance, not discharge: the notice text still has to travel with the copy,
   and a reader who wants to check it against the current upstream can follow the
   link to do so.

   Run: pnpm gen:notices  (after adding or upgrading a production dependency)
   Verify: pnpm check:notices  (regenerates in memory and fails on any drift —
   wired into prebuild, so a forgotten regeneration cannot ship) */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHECK_ONLY = process.argv.includes("--check");

const TS_PATH = "lib/third-party-notices.generated.ts";
const MD_PATH = "NOTICE.md";

/* pnpm buckets these into the production tree even though package.json lists
   them under devDependencies. They are test tooling and never reach a user, so
   naming them here would misdescribe what the site ships. */
const DEV_ONLY = new Set(["@playwright/test", "playwright", "playwright-core"]);

const LICENSE_FILE = /^(licen[cs]e|copying|notice)(\..*)?$/i;

/* Platform binaries install one variant per build host: this machine gets
   @img/sharp-darwin-arm64, the deployment container gets the linux-x64 one. Two
   reasons to canonicalise the name rather than publish whichever happened to be
   installed. It is more truthful — the published notices should not name a macOS
   binary the container never ships — and it makes the generated files
   host-independent, without which --check would fail on CI for a reason that is
   not drift. The notice text itself is the same across a family's variants. */
const PLATFORM_SUFFIX =
  /-(darwin|linux|win32|freebsd|android)-(arm64|x64|arm|ia32|s390x|ppc64)(-(gnu|musl|msvc))?$/;
const canonicalName = (name) => name.replace(PLATFORM_SUFFIX, "-{platform}");

/* Whether a package installs only on some hosts. `os`/`cpu` in its own manifest
   is the exact signal — it is how npm decides whether to install an optional
   native dependency at all — and it matters because canonicalising names is not
   enough to make this list host-independent: fsevents (`os: ["darwin"]`) has no
   Linux counterpart, so this machine sees 192 packages where the Linux CI runner
   sees 191. A byte-for-byte comparison of the generated files therefore cannot
   hold across hosts, which is what --check has to work around below. */
function isHostDependent(pkgPath, name) {
  if (PLATFORM_SUFFIX.test(name)) return true;
  try {
    const m = JSON.parse(fs.readFileSync(path.join(pkgPath, "package.json"), "utf8"));
    return Boolean(m.os || m.cpu);
  } catch {
    return false;
  }
}

/* The repository a package declares, normalised to something a reader can open.
   npm allows "git+https://host/x/y.git", "git://…", "host/x/y" shorthand, and an
   object form; homepage is the fallback, and an entry with neither simply gets no
   link rather than a guessed URL. */
function sourceUrlFor(pkgPath, homepage) {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(pkgPath, "package.json"), "utf8"));
  } catch {
    return homepage || "";
  }
  const repo = manifest.repository;
  const raw = typeof repo === "string" ? repo : repo?.url || "";
  if (!raw) return homepage || manifest.homepage || "";
  let url = raw
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/^ssh:\/\/git@/, "https://")
    .replace(/^git@([^:]+):/, "https://$1/")
    .replace(/\.git$/, "");
  /* The shorthand forms npm accepts: "user/repo" and "github:user/repo". */
  if (!/^https?:\/\//.test(url)) {
    const shorthand = url.replace(/^github:/, "");
    url = /^[\w.-]+\/[\w.-]+$/.test(shorthand)
      ? `https://github.com/${shorthand}`
      : homepage || "";
  }
  return url;
}

function licenseTextFor(pkgPath) {
  let entries;
  try {
    entries = fs.readdirSync(pkgPath, { withFileTypes: true });
  } catch {
    return "";
  }
  /* A package can ship LICENSE and LICENSE.md, or a LICENSE plus a NOTICE that
     Apache-2.0 requires be passed along. Concatenate every match so nothing an
     author chose to include is dropped. */
  const files = entries
    .filter((e) => e.isFile() && LICENSE_FILE.test(e.name))
    .map((e) => e.name)
    .sort();
  const parts = [];
  for (const name of files) {
    const text = fs.readFileSync(path.join(pkgPath, name), "utf8").trim();
    if (text) parts.push(text);
  }
  return parts.join("\n\n");
}

const raw = execFileSync("pnpm", ["licenses", "list", "--prod", "--json"], {
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
});

const byLicense = JSON.parse(raw);

/* Group by license text, not by SPDX id: every MIT package carries its own
   copyright line, so collapsing them all under one "MIT" heading would drop
   the very notices the licence asks us to keep. Packages that ship byte
   identical texts do collapse, which is what keeps the page readable. */
const groups = new Map();
let packageCount = 0;

for (const [license, pkgs] of Object.entries(byLicense)) {
  for (const pkg of pkgs) {
    if (DEV_ONLY.has(pkg.name)) continue;
    packageCount += 1;
    const pkgPath = pkg.paths?.[0] ?? "";
    const text = licenseTextFor(pkgPath);
    /* NUL as the key separator, written as an escape rather than the literal
       byte it used to be: a raw NUL made git classify this file as binary, so
       every future change to the script governing our licence compliance would
       have reached review as "Bin 5397 bytes" with no diff to read. */
    const key = `${license}\u0000${text}`;
    if (!groups.has(key)) groups.set(key, { license, text, packages: [] });
    groups.get(key).packages.push({
      name: canonicalName(pkg.name),
      version: (pkg.versions ?? []).join(", "),
      homepage: pkg.homepage ?? "",
      source: sourceUrlFor(pkgPath, pkg.homepage ?? ""),
      hostDependent: isHostDependent(pkgPath, pkg.name),
    });
  }
}

const ordered = [...groups.values()]
  .map((g) => ({
    ...g,
    packages: g.packages.sort((a, b) => a.name.localeCompare(b.name)),
  }))
  .sort(
    (a, b) =>
      b.packages.length - a.packages.length ||
      a.license.localeCompare(b.license),
  );

const missing = ordered.filter((g) => !g.text);
const licenseIds = [...new Set(ordered.map((g) => g.license))].sort();

/* ── lib/third-party-notices.generated.ts ── */

const ts = `/* Auto-generated by scripts/generate-notices.mjs — do not edit by hand.
   Verbatim license texts for the packages in this site's production
   dependency tree, read from node_modules at generation time. */

export type NoticeGroup = {
  license: string;
  text: string;
  packages: {
    name: string;
    version: string;
    homepage: string;
    /* Upstream repository, for provenance. The notice above is what discharges
       the licence condition; this is so a reader can check it at source. Empty
       when a package declares neither a repository nor a homepage. */
    source: string;
    /* True for a native binary that installs only on some hosts (it declares
       \`os\`/\`cpu\`, or its name carries a platform triple). The list is a
       superset across the hosts that have generated it, so an entry marked here
       may not be installable on yours. */
    hostDependent: boolean;
  }[];
};

export const noticeSummary = {
  packageCount: ${packageCount},
  licenseCount: ${licenseIds.length},
  licenseIds: ${JSON.stringify(licenseIds)},
};

export const thirdPartyNotices: NoticeGroup[] = ${JSON.stringify(ordered, null, 2)};
`;

/* ── NOTICE.md ── */

const md = [
  "# Third-party notices",
  "",
  "<!-- Auto-generated by scripts/generate-notices.mjs — do not edit by hand. -->",
  "",
  "This project is licensed under GPL-3.0 (see [LICENSE](LICENSE)). It also",
  "redistributes, and builds derivative works from, the open-source packages",
  "listed below. Their licenses grant that right on the condition that these",
  "notices travel with every copy, so they are reproduced here in full.",
  "",
  "Each package links to its upstream repository. The link is provenance, not",
  "discharge: a licence that asks for its notice in every copy is not satisfied",
  "by a pointer into someone else's repository, which is why the texts are here",
  "rather than referenced. Follow a link to compare a notice against its current",
  "upstream — though the notice you are owed is the one shipped by the version",
  "pinned in the lockfile, which does not change when upstream relicenses later",
  "work.",
  "",
  "A platform binary is written as `-{platform}`: one variant installs per build",
  "host, and naming this machine's would misdescribe what the container ships.",
  "",
  "## Lucide icon artwork",
  "",
  "`components/ink-icons.generated.ts` contains icon geometry derived from",
  "[Lucide](https://lucide.dev) (ISC), re-rendered through rough.js into the",
  "brand's ink style. Derivative artwork carries the same notice as the",
  "original; the Lucide license is reproduced with the ISC packages below.",
  "",
  `## Packages (${packageCount} across ${licenseIds.length} licenses)`,
  "",
  ...ordered.flatMap((g) => [
    `### ${g.license}`,
    "",
    g.packages
      .map((p) => {
        const label = `${p.name}${p.version ? ` ${p.version}` : ""}`;
        return p.source ? `- [${label}](${p.source})` : `- ${label}`;
      })
      .join("\n"),
    "",
    g.text ? "```\n" + g.text + "\n```" : "_No license file ships with this package._",
    "",
  ]),
].join("\n");

/* ── Write, or verify ──
   --check exists because `pnpm gen:notices` is a step a human has to remember,
   and an unregenerated notice file is exactly the kind of thing that goes quietly
   wrong: someone adds a dependency and the published notices under-report what
   ships. Wired into prebuild, so the build fails instead.

   It compares COVERAGE, not bytes. A byte comparison was the first attempt and it
   failed on CI for a reason that was not drift: the installed set is
   host-dependent (this machine 192 packages, the Linux runner 191 — fsevents is
   darwin-only), so the generated files legitimately differ by host. What is
   host-independent is the obligation: every package this host can see must appear
   in the committed notices, with the same licence, and — for portable packages —
   the same notice text byte for byte.

   Two deliberate asymmetries, both to avoid false failures:
   — An entry in the file that this host cannot see is an error only when the
     package is portable (a removed dependency leaving a stale notice). A
     host-dependent entry is reported as a note, because the file is a superset
     across the hosts that have generated it.
   — For host-dependent packages only the licence id is compared, not the text: a
     platform family's variants each ship their own copy, and a byte difference
     between the darwin and linux copies would fail the check without any
     obligation having changed. */

function committedGroups() {
  const src = fs.readFileSync(TS_PATH, "utf8");
  const marker = "export const thirdPartyNotices: NoticeGroup[] = ";
  const start = src.indexOf(marker);
  if (start === -1) throw new Error(`${TS_PATH} has no thirdPartyNotices export`);
  const json = src.slice(start + marker.length).replace(/;\s*$/, "");
  return JSON.parse(json);
}

if (CHECK_ONLY) {
  let committed;
  try {
    committed = committedGroups();
  } catch (err) {
    console.error(
      `ERROR notices: cannot read the committed notices (${err.message}).\n` +
        `       Fix: pnpm gen:notices, then commit the result.`,
    );
    process.exit(1);
  }

  const flatten = (groups) =>
    new Map(
      groups.flatMap((g) =>
        g.packages.map((p) => [p.name, { license: g.license, text: g.text, ...p }]),
      ),
    );
  const onDisk = flatten(committed);
  const installed = flatten(ordered);
  const md_ = fs.existsSync(MD_PATH) ? fs.readFileSync(MD_PATH, "utf8") : "";

  const problems = [];
  const notes = [];

  for (const [name, pkg] of installed) {
    const found = onDisk.get(name);
    if (!found) {
      /* A native variant this host installs that the recording host did not is a
         warning, not a failure: sharp alone ships linux, linuxmusl and wasm32
         builds, and a new variant of a family already recorded here carries no
         obligation the family's notice does not already discharge. A portable
         package with no notice is a real gap and fails below. */
      (pkg.hostDependent ? notes : problems).push(
        pkg.hostDependent
          ? `${name} is installed here but not recorded (native variant — regenerate to add it)`
          : `${name} is installed but carries no notice`,
      );
      continue;
    }
    if (found.license !== pkg.license) {
      problems.push(`${name} is ${pkg.license} now, recorded as ${found.license}`);
    }
    if (!pkg.hostDependent && found.text !== pkg.text) {
      problems.push(`${name}'s notice text differs from the installed copy`);
    }
    if (!md_.includes(name)) problems.push(`${name} is missing from ${MD_PATH}`);
  }

  for (const [name, pkg] of onDisk) {
    if (installed.has(name)) continue;
    if (pkg.hostDependent) notes.push(`${name} (not installable on this host)`);
    else problems.push(`${name} carries a notice but is no longer a dependency`);
  }

  if (problems.length) {
    console.error(
      `ERROR notices: the committed notices do not cover the installed tree ` +
        `(${packageCount} packages here).\n` +
        problems.map((p) => `       - ${p}`).join("\n") +
        `\n       Fix: pnpm gen:notices, then commit the result.`,
    );
    process.exit(1);
  }
  console.log(
    `notices: covered — ${installed.size} packages checked against ${onDisk.size} recorded`,
  );
  for (const note of notes) console.log(`       note: ${note}`);
} else {
  fs.writeFileSync(TS_PATH, ts);
  fs.writeFileSync(MD_PATH, md);
  console.log(
    `notices: ${packageCount} packages, ${licenseIds.length} licenses, ${ordered.length} distinct texts`,
  );
}

if (missing.length) {
  console.log(
    `warning: no license file found for ${missing.length} group(s): ` +
      missing
        .map((g) => `${g.license} (${g.packages.map((p) => p.name).join(", ")})`)
        .join("; "),
  );
}
