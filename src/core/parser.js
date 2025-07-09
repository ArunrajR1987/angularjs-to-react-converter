const babelParser = require("@babel/parser");
const htmlparser2 = require("htmlparser2");

function parseFile(file) {
  if (file.type === "js") {
    try {
      const ast = babelParser.parse(file.content, {
        sourceType: "module",
        plugins: ["jsx"]
      });
      return { ...file, ast };
    } catch (err) {
      console.error("Error parsing JS:", file.path);
      return { ...file, error: true };
    }
  } else if (file.type === "html") {
    try {
      const dom = htmlparser2.parseDocument(file.content);
      return { ...file, dom };
    } catch (err) {
      console.error("Error parsing HTML:", file.path);
      return { ...file, error: true };
    }
  }
  return file;
}

module.exports = { parseFile };