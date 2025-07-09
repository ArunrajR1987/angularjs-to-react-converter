const babelTraverse = require("@babel/traverse").default;

function buildSemanticGraph(parsedFiles) {
  const graph = {};

  parsedFiles.forEach((file) => {
    if (file.type === "js" && file.ast && !file.error) {
      babelTraverse(file.ast, {
        CallExpression(path) {
          const callee = path.node.callee;
          if (
            callee.type === "MemberExpression" &&
            callee.property.name === "controller"
          ) {
            const nameNode = path.node.arguments[0];
            const funcNode = path.node.arguments[1];

            if (nameNode && funcNode && funcNode.params) {
              const name = nameNode.value;
              const deps = funcNode.params.map((p) => p.name);
              graph[name] = {
                file: file.path,
                deps,
                type: "controller",
              };
            }
          }
        },
      });
    }
  });

  return graph;
}

module.exports = { buildSemanticGraph };