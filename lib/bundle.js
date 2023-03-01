const fs = require("fs");
const { default: MagicString } = require("magic-string");
const Module = require("./module");
const path = require("path");
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
  fetchModule(importEe, importer) {
    let route;
    // 判断是否是入口模块
    if (!importer) {
      route = importEe;
    } else {
      if (path.isAbsolute(importEe)) {
        // 绝对路径
        route = importEe;
      } else if (importEe[0] === ".") {
        // 相对路径
        route = path.resolve(
          path.dirname(importer),
          importEe.replace(/\.js$/, "") + ".js"
        );
      }
    }
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
      const source = statement._source.clone();
      if (statement.type === "ExportNamedDeclaration") {
        //如果是导出语句 裁剪掉export   export const a='1' => const a='1'
        source.remove(statement.start, statement.declaration.start);
      }
      magicString.addSource({
        content: source,
        separator: "\n",
      });
    });
    return { code: magicString.toString() };
  }
}

module.exports = Bundle;
