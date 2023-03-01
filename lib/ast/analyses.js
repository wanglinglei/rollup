const Scope = require("./scope");
const walk = require("./walk");
/**
 * @description:  找出当前模块使用的变量  区分当前模块内部变量 外部导入变量
 * @param {*} ast   语法树
 * @param {*} magicString  源代码
 * @param {*} module 模块
 * @return {*}
 */
function analyses(ast, magicString, module) {
  // 模块内的顶级作用域
  let scope = new Scope();
  // @note 添加作用域方法  var let const function
  function addScope(declaration, statement) {
    const name = declaration.id.name; // 获得声明的变量
    scope.add(name); // 添加这个变量到全局作用域
    if (!scope.parent) {
      // 如果当前作用域是是全局作用域
      statement._defines[name] = true;
    }
  }

  ast.body.forEach((statement) => {
    // 从代码中截取当前节点的内容
    Object.defineProperties(statement, {
      _source: { value: magicString.snip(statement.start, statement.end) },
      // 当前模块内部定义的全局变量
      _defines: { value: {} },
      // 当前模块依赖的外部变量
      _dependsOn: { value: {} },
      // 当前语句是否已经包含到打包结果中
      _included: { value: false, writable: true },
    });

    // 构建作用域链
    walk(statement, {
      enter: (node) => {
        let newScope;
        switch (node.type) {
          case "FunctionDeclaration":
            // 函数生成新的作用域
            const params = node.params.map((Identifier) => Identifier.name);
            addScope(node, statement);
            newScope = new Scope({
              parent: scope,
              params,
            });
            break;
          case "VariableDeclaration":
            // 不会生成新的作用域
            node.declarations.forEach((declaration) => {
              addScope(declaration, statement);
            });
        }

        if (newScope) {
          // 如果当前节点生成了一个新的作用域  当前节点指向新的作用域
          Object.defineProperty(node, "_scope", { value: newScope });
          scope = newScope;
        }
      },

      leave: (node) => {
        // 如果当前节点产生了新的作用域 离开节点时  scope 回到父作用域
        if (node._scope) {
          scope = scope.parent;
        }
      },
    });
  });

  // 处理外部依赖变量 _dependsOn

  ast.body.forEach((statement) => {
    walk(statement, {
      enter: (node) => {
        if (node._scope) {
          // 如果产生了新的作用域
          scope = node._scope;
        }

        if (node.type === "Identifier") {
          // 从当前作用域内向父级作用域找当前变量 如果没有则为外部依赖
          const defineScope = scope.findDefiningScope(node.name);
          if (!defineScope) {
            statement._dependsOn[node.name] = true;
          }
        }
      },

      leave: (node) => {
        if (node._scope) {
          scope = scope.parent;
        }
      },
    });
  });
}

module.exports = analyses;

/**  读取get 时会生成一个函数作用域 此时scope 为函数作用域  内部有 a, b 变量
 *   离开时 需要重置 scope 为函数作用域的父级作用域
 *   读取 const c=3; 时才是正确的作用域
 * 
function get(){
  var a=1,b=2,
}

const c=3;

 */
