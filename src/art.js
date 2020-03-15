const figlet = require("figlet");

/**
 * @param {string} message
 */
module.exports = function convert(message) {
  const asciiArt = figlet.textSync(message, "3x5");
  const output = asciiArt.replace(/[ \t]/g, ":herb:").replace(/#/g, ":fire:");
  return output;
};
