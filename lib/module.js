let MagicString = require("magic-string");
const path = require("path");
const { parse } = require("acorn");
const analyses = require("./ast/analyses");
const util = require("./util");

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
    this.imports = {};
    this.exports = {};
    this.ast.body.forEach((node) => {
      // 处理导入语句
      if (node.type === "ImportDeclaration") {
        // 导入路径
        let source = node.source.value;
        let specifiers = node.specifiers;
        specifiers.forEach((specifier) => {
          const name = specifier.imported.name;
          const localName = specifier.local.name;
          // 记录模块内变量的来源
          this.imports[localName] = { name, localName, source };
        });
      } else if (/^Export/.test(node.type)) {
        // 处理导出
        let declaration = node.declaration;
        if (declaration.type === "VariableDeclaration") {
          const declarations = declaration.declarations;
          declarations.forEach((declarationNode) => {
            const name = declarationNode.id.name;
            // 记录当前模块导出变量的 创建来源
            this.exports[name] = {
              node,
              localName: name,
              expression: declaration,
            };
          });
        } else if (declaration.type === "FunctionExpression") {
          const name = declaration.id.name;
          this.exports[name] = {
            node,
            localName: name,
            expression: declaration,
          };
        }
      }
    });
    analyses(this.ast, this.code, this);
    // 所有全局变量的定义语句
    this.definitions = {};
    this.ast.body.forEach((statement) => {
      Object.keys(statement._defines).forEach((name) => {
        this.definitions[name] = statement;
      });
    });
  }
  // 展开模块的语句 -> 拿到外部依赖变量
  expandAllStatements() {
    let allStatements = [];
    this.ast.body.forEach((statement) => {
      // 打包时 引入语句不需要打包
      if (statement.type === "ImportDeclaration") return;
      let currentStatement = this.expandStatement(statement);
      allStatements.push(...currentStatement);
    });
    return allStatements;
  }

  // 展开一个节点
  // 找到当前节点依赖的变量
  expandStatement(statement) {
    let result = [];

    //@note tree-shaking 核心

    // 拿到外部依赖
    const dependencies = Object.keys(statement._dependsOn);
    dependencies.forEach((name) => {
      // 找到定义变量的声明节点  1. 在当前模块内 2. 在外部依赖内
      let definition = this.define(name);
      result.push(...definition);
    });

    if (!statement._include) {
      //  被引用标记  不需要重复添加
      statement._include = true;
      result.push(statement);
    }
    return result;
  }

  define(name) {
    // 查找导入变量里有没有name 有为外部依赖
    if (util.hasOwn(this.imports, name)) {
      // this.imports[name]= {name: 'value',localName:'value',source:'path'}
      const importData = this.imports[name];
      const module = this.bundle.fetchModule(importData.source, this.path);
      // this.imports[name]= {node,localName,expression}
      const exportData = module.exports[importData.name];

      // 调用被依赖模块的define 方法  返回外部依赖的变量声明
      return module.define(exportData.localName);
    } else {
      // 模块内部变量
      let statement = this.definitions[name];
      if (statement && !statement._include) {
        return this.expandStatement(statement);
      } else {
        return [];
      }
    }
  }
}

module.exports = Module;
