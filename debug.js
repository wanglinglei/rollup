const path = require("path");
const fs = require("fs");
const rollup = require("./lib/rollup");

// 生成输出文件目录
function createOutPutDir(output) {
  // 判断输出目录是否存在 不存在创建文件目录
  const pathInfo = path.parse(output);
  if (pathInfo.dir) {
    const outputDir = path.resolve(__dirname, pathInfo.dir);
    const idExistDir = fs.existsSync(outputDir);
    if (!idExistDir) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }
}

// 处理文件路径问题
function filterFilePath(filePath) {
  let realPath = "";
  if (path.isAbsolute(filePath)) {
    realPath = path.join(__dirname, filePath);
  } else {
    realPath = filePath;
  }
  return realPath;
}

function createRollupTask(options) {
  const { entry, output } = options;
  const entryFile = filterFilePath(entry);
  const outputFile = filterFilePath(output);
  createOutPutDir(outputFile);
  rollup(entryFile, outputFile);
}

createRollupTask({
  entry: "/src/main.js",
  output: "/dist/bundle.js",
});
