function createSemanticChunks(parsedFiles, graph) {
    return parsedFiles.map((file) => {
      const meta = Object.entries(graph).find(([_, data]) => data.file === file.path);
      const chunkInfo = meta
        ? `Type: ${meta[1].type}\nName: ${meta[0]}\nDependencies: ${meta[1].deps.join(', ')}`
        : `File: ${file.path}`;
  
      return {
        id: file.path,
        content: file.content,
        metadata: chunkInfo,
      };
    });
  }
  
  module.exports = { createSemanticChunks };