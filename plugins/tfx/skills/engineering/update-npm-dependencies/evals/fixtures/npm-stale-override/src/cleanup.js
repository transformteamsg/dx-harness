const { rimraf } = require("rimraf");

exports.clearCache = function clearCache(dir) {
  return rimraf(dir);
};
