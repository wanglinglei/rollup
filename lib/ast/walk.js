function walk(ast, { enter, leave }) {
  visit(ast, null, enter, leave);
}

/**
 * @description:
 * @param {*} node 当前节点
 * @param {*} parent 父节点
 * @param {*} enter
 * @param {*} leave
 * @return {*}
 */
function visit(node, parent, enter, leave) {
  if (enter) {
    enter(node, parent);
  }

  // 遍历子节点 找到是对象的子节点
  let childKeys = Object.keys(node).filter(
    (key) => typeof node[key] === "object"
  );
  childKeys.forEach((childKey) => {
    let value = node[childKey];
    if (Array.isArray(value)) {
      value.forEach((val) => {
        visit(val, node, enter, leave);
      });
    } else if (value && value.type) {
      // 只遍历有type的对象
      visit(value, node, enter, leave);
    }
  });

  if (leave) {
    leave(node, parent);
  }
}

module.exports = walk;
