function analyses(ast, magicString, module) {
  ast.body.forEach((statement) => {
    // statement._source = magicString.snip(statement.start, magicString.end);
    Object.defineProperty(statement, "_source", {
      value: magicString.snip(statement.start, statement.end),
    });
  });
}

module.exports = analyses;
