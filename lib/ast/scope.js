class Scope {
  constructor(options = {}) {
    this.name = options.name;
    this.parent = options.parent; // 父级作用域
    this.names = options.names || []; // 当前作用域内有哪些变量
  }

  add(name) {
    this.names.push(name);
  }

  findDefiningScope(name) {
    if (this.names.includes(name)) {
      return this;
    }
    if (this.parent) {
      return this.parent.findDefiningScope(name);
    }
    return null;
  }
}

module.exports = Scope;
