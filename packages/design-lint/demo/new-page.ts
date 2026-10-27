/* Writes a demo page that passes every rule that exists, by construction: the
   standard head (viewport, title, description, canonical, design system), the
   header with the search form, the navigation, and the language switcher.

     node demo/new-page.ts <path> --title <t> --description <d> --main <file>

   <path> is relative to demo/site, for example wp/images.html. --main is a file
   that holds the HTML for <main>. Add the page to pages.all in your config
   fragment, so that the rendered rules cover it. */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    title: { type: "string" },
    description: { type: "string" },
    main: { type: "string" },
    lang: { type: "string", default: "en" },
    account: { type: "boolean", default: false },
    footer: { type: "boolean", default: false },
  },
});

const [target] = positionals;
if (!target || !values.title || !values.description || !values.main) {
  console.error("Usage: new-page <path> --title <t> --description <d> --main <file> [--account] [--footer]");
  process.exit(2);
}
/* BD-5a limits. A page that breaks them would fail a rule that exists. */
if (values.title.length < 10 || values.title.length > 60) throw new Error(`The title is ${values.title.length} characters. BD-5a needs 10 to 60.`);
if (values.description.length < 50 || values.description.length > 160) {
  throw new Error(`The description is ${values.description.length} characters. BD-5a needs 50 to 160.`);
}

const site = path.resolve(import.meta.dirname, "site");
const file = path.join(site, target);
const main = fs.readFileSync(path.resolve(values.main), "utf8").replace(/\n$/, "");
const url = `/${target.replace(/index\.html$/, "")}`;

const page = `<!doctype html>
<html lang="${values.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${values.title}</title>
  <meta name="description" content="${values.description}">
  <link rel="canonical" href="https://example.gov.sg${url}">
  <link rel="stylesheet" href="/ds.css">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header>
    <a href="/">Community Grants</a>
    <form role="search" action="/search.html">
      <label for="q">Search</label>
      <input id="q" type="search" name="q">
      <button type="submit">Search</button>
    </form>
    <nav><a href="/apply.html">Apply</a> <a href="/about.html">About</a></nav>
    <nav data-language-switcher><a hreflang="en" href="/">English</a> <a hreflang="zh" href="/zh/">中文</a></nav>
${values.account ? "    <span data-account-name>Alex Tan</span>\n" : ""}  </header>
  <main>
${main}
  </main>
${values.footer ? '  <footer>\n    <p>Questions? <a href="mailto:help@example.gov.sg">help@example.gov.sg</a></p>\n  </footer>\n' : ""}</body>
</html>
`;
fs.mkdirSync(path.dirname(file), { recursive: true });
if (fs.existsSync(file)) throw new Error(`${target} exists. Choose another path.`);
fs.writeFileSync(file, page);
console.log(`wrote demo/site/${target}. Add "${url}" to pages.all in your config fragment.`);
