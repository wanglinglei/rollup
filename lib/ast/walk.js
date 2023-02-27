function walk(ast, { enter, leave }) {
  visit(ast, null, enter, leave);
}

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
    } else {
      visit(value, node, enter, leave);
    }
  });

  if (leave) {
    leave(node, parent);
  }
}

module.exports = walk;
