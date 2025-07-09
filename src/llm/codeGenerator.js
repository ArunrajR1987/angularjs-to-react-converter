const { OpenAI } = require("langchain/llms/openai");

async function generateReactCode(prompt) {
  const model = new OpenAI({ modelName: "gpt-4o", temperature: 0 });
  return await model.call(prompt);
}

module.exports = { generateReactCode };