const { Chroma } = require("langchain/vectorstores/chroma");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");

async function retrieveSimilarChunks(query, collectionName = "angular-react-rag") {
  const vectorStore = await Chroma.fromExistingCollection(
    new OpenAIEmbeddings(),
    { collectionName }
  );
  return await vectorStore.similaritySearch(query, 5);
}

module.exports = { retrieveSimilarChunks };