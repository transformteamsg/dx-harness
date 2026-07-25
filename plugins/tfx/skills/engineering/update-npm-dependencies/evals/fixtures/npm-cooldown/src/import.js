const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser({ ignoreAttributes: false });

exports.parseGradebook = function parseGradebook(xml) {
  return parser.parse(xml);
};
