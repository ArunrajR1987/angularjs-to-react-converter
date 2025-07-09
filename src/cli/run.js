const { preprocessFiles } = require("../core/preprocessor");
const { parseFile } = require("../core/parser");
const { buildSemanticGraph } = require("../core/semanticGraph");
const { createSemanticChunks } = require("../rag/chunker");
const { embedChunks } = require("../rag/embedder");
const { retrieveSimilarChunks } = require("../rag/retriever");
const { buildPrompt } = require("../rag/promptBuilder");
const { generateReactCode } = require("../llm/codeGenerator");
const { writeOutputFile } = require("../output/reactProjectBuilder");
const { compareAngularAndReact } = require("../tools/diffTool");
require("dotenv").config();

function extractRoutingInfo(files) {
  const routes = [];
  for (const file of files) {
    if (file.type === 'js' && file.content.includes("$routeProvider")) {
      const lines = file.content.split("\n");
      lines.forEach(line => {
        const match = line.match(/\.when\(['"](.*?)['"],\s*(\{.*?\})/);
        if (match) routes.push({ path: match[1], config: match[2] });
      });
    }
  }
  return routes.map(r => `Route: ${r.path}\nConfig: ${r.config}`).join("\n");
}

function extractStateInfo(files) {
  const stateLines = [];
  for (const file of files) {
    if (file.type === 'js' && file.content.includes("$rootScope")) {
      const lines = file.content.split("\n");
      lines.forEach(line => {
        if (line.includes("$broadcast") || line.includes("$emit") || line.includes("$on")) {
          stateLines.push(`State Event: ${line.trim()}`);
        }
      });
    }
  }
  return stateLines.join("\n");
}

(async function () {
  const SRC_DIR = "angularjs-src";
  const OUT_DIR = "react-output";

  console.log("🔍 Scanning source files...");
  const files = await preprocessFiles(SRC_DIR);
  console.log(`✅ Found ${files.length} files.`);

  console.log("🧠 Parsing files...");
  const parsed = files.map(parseFile);

  console.log("🧭 Building semantic dependency graph...");
  const graph = buildSemanticGraph(parsed);

  console.log("🧩 Creating semantic chunks...");
  const chunks = createSemanticChunks(parsed, graph);

  console.log("📚 Embedding chunks into vector DB...");
  await embedChunks(chunks);

  const routingInfo = extractRoutingInfo(parsed);
  const stateInfo = extractStateInfo(parsed);

  console.log("🤖 Generating React code using RAG...");
  for (const chunk of chunks) {
    const related = await retrieveSimilarChunks(chunk.content);
    const prompt = buildPrompt(chunk, related, routingInfo, stateInfo);
    const reactCode = await generateReactCode(prompt);
    await writeOutputFile(OUT_DIR, chunk.id, reactCode);
  }

  console.log("🧪 Running visual/logic diff comparisons...");
  for (const chunk of chunks) {
    const result = await compareAngularAndReact(chunk.id, SRC_DIR, OUT_DIR);
    console.log("📁", result.file, result.error ? `❌ ${result.message}` : `✅ HTML: ${result.sameHTML}, Logic: ${result.sameLogic}`);
  }

  console.log("✅ All files converted, tested, and saved to react-output/");
})();
