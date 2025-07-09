const { JSDOM } = require("jsdom");
const fs = require("fs/promises");
const path = require("path");

function normalizeHTML(html) {
  const dom = new JSDOM(html);
  return dom.window.document.body.innerHTML.replace(/\s+/g, " ").trim();
}

function extractLogicSignatures(code) {
  const eventMatches = [...code.matchAll(/\$\w+\.(on|emit|broadcast)\((.*?)\)/g)].map(m => m[0]);
  const methodDefs = [...code.matchAll(/function\s+(\w+)/g)].map(m => m[1]);
  return [...eventMatches, ...methodDefs];
}

async function compareAngularAndReact(originalPath, angularDir, reactDir) {
  const origPath = path.join(angularDir, originalPath);
  const convertedPath = path.join(reactDir, originalPath.replace(/\.js|\.html/, ".jsx"));

  try {
    const angularHTML = await fs.readFile(origPath, "utf-8");
    const reactHTML = await fs.readFile(convertedPath, "utf-8");

    const normAngular = normalizeHTML(angularHTML);
    const normReact = normalizeHTML(reactHTML);

    const sameHTML = normAngular === normReact;
    const angularLogic = extractLogicSignatures(angularHTML);
    const reactLogic = extractLogicSignatures(reactHTML);
    const sameLogic = angularLogic.every(sig => reactLogic.includes(sig));

    return { file: originalPath, sameHTML, sameLogic };
  } catch (err) {
    return { file: originalPath, error: true, message: err.message };
  }
}

module.exports = { compareAngularAndReact };