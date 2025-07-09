const fs = require("fs/promises");
const path = require("path");

async function writeOutputFile(outputDir, originalPath, reactCode) {
    const outPath = path.join(outputDir, originalPath.replace(/.*\/(.*)\.(js|html)/, "$1.jsx"));
    const folder = path.dirname(outPath);
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(outPath, reactCode, "utf-8");
    console.log("💾 Saved:", outPath); // <-- Add this
    return outPath;
  }

module.exports = { writeOutputFile };