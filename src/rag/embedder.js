const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { Chroma } = require("langchain/vectorstores/chroma");
const { Document } = require("langchain/document");

async function embedChunks(chunks, collectionName = "angular-react-rag") {
  const docs = chunks.map(
    (chunk) => new Document({
      pageContent: chunk.content,
      metadata: {
        id: chunk.id,
        info: chunk.metadata,
      },
    })
  );

  const vectorstore = await Chroma.fromDocuments(docs, new OpenAIEmbeddings(), {
    collectionName,
  });

  return vectorstore;
}

module.exports = { embedChunks };