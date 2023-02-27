let Bundle = require("./bundle");

function rollup(entry, outputFilename) {
  const bundle = new Bundle({ entry });
  bundle.build(outputFilename);
}

module.exports = rollup;
