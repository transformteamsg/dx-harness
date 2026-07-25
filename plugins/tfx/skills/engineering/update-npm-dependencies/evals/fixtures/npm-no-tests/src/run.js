const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser();

process.stdin.on("data", (chunk) => {
  console.log(JSON.stringify(parser.parse(chunk.toString())));
});
