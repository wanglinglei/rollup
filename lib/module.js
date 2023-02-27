let MagicString = require("magic-string");
const path = require("path");
const { parse } = require("acorn");
const analyses = require("./ast/analyses");

/**
 * @description:  每个文件都是一个模块 每个模块都对应一个module实例
 * @return {*}
 */
class Module {
  constructor({ code, path, bundle }) {
    this.code = new MagicString(code, { filename: path });
    this.path = path;
    this.bundle = bundle;
    // 源代码转成抽象语法树
    this.ast = parse(code, {
      ecmaVersion: 7,
      sourceType: "module",
    });
    this.analyses();
  }
  analyses() {
    analyses(this.ast, this.code, this);
  }
  // 展开模块的语句 -> 拿到外部依赖变量
  expandAllStatements() {
    let allStatements = [];
    this.ast.body.forEach((statement) => {
      let currentStatement = this.expandStatement(statement);
      allStatements.push(currentStatement);
    });
    return allStatements;
  }

  // 展开一个节点
  // 找到当前节点依赖的变量
  expandStatement(statement) {
    let result = [];

    //@note tree-shaking 核心
    if (!statement._include) {
      //  被引用标记  不需要重复添加
      statement._include = true;
      result.push(statement);
    }
    return result;
  }
}

module.exports = Module;
