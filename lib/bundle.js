const fs = require("fs");
const { default: MagicString } = require("magic-string");
const Module = require("./module");
class Bundle {
  constructor(options) {
    // 入口文件的路径
    this.entryPath = options.entry.replace(/\.js$/, "") + ".js";
    // 入口文件和依赖模块
    this.modules = {};
  }

  build(outputFilename) {
    // 从入口文件找依赖的模块
    let entryModule = this.fetchModule(this.entryPath);
    // 把这个入口模块所有语句展开 返回所有的语句组成的数组
    this.statements = entryModule.expandAllStatements();
    const { code } = this.generate();
    fs.writeFileSync(outputFilename, code, "utf-8");
  }

  // 获取模块信息
  fetchModule(importEe) {
    let route = importEe;
    if (route) {
      // 读取文件内容
      const code = fs.readFileSync(route, "utf-8");
      let module = new Module({
        code, // 模块源代码
        path: route, //模块的绝度路径
        bundle: this, // 模块输出的bundle
      });
      return module;
    }
  }

  // this.statements 生成源代码
  generate() {
    let magicString = new MagicString.Bundle();
    this.statements.forEach((statement) => {
      const source = statement[0]._source.clone();
      console.log(source.toString(), "string");

      magicString.addSource({
        content: source,
        separator: "\n",
      });
    });
    return { code: magicString.toString() };
  }
}

module.exports = Bundle;
