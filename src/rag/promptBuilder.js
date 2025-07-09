function buildPrompt(queryChunk, relatedChunks, routingInfo = "", stateInfo = "") {
    let context = relatedChunks.map(doc => `// From ${doc.metadata.id}\n${doc.pageContent}`).join("\n\n");
  
    return `
  // You are a senior full-stack engineer tasked with migrating AngularJS code to React.
  // The following is the original AngularJS code and some related context.
  
  ${context}
  
  // Additional Routing Info:
  ${routingInfo}
  
  // Global State and Event Info:
  ${stateInfo}
  
  // Now convert the following AngularJS unit into idiomatic React:
  // File: ${queryChunk.id}
  ${queryChunk.content}
  
  // Please output a fully working React version of this file, with routing and shared state preserved.
    `;
  }
  
  module.exports = { buildPrompt };