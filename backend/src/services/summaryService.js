const Groq = require('groq-sdk')

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const summarizeText = async (text) => {
  if (!text || text.trim().length === 0) {
    throw new Error('No text provided for summarization')
  }

  // truncating to 3000 chars to stay within token limits
  const truncatedText = text.slice(0, 3000)

  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that summarizes documents clearly and concisely.'
      },
      {
        role: 'user',
        content: `Please summarize the following document in 4-6 sentences:\n\n${truncatedText}`
      }
    ],
    temperature: 0.3,
    max_tokens: 400
  })

  return response.choices[0].message.content
}

module.exports = { summarizeText }
