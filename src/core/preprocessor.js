const globby = require("globby");
const fs = require("fs/promises");

async function preprocessFiles(srcPath) {
  const paths = await globby([`${srcPath}/**/*.{js,html,css}`]);
  const files = await Promise.all(
    paths.map(async (path) => ({
      path,
      type: getFileType(path),
      content: await fs.readFile(path, "utf-8"),
    }))
  );
  return files;
}

function getFileType(path) {
  if (path.endsWith(".js")) return "js";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".css")) return "css";
  return "unknown";
}

module.exports = { preprocessFiles };