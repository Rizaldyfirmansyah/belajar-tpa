import Groq from 'groq-sdk'
import { delay, parseJsonSafe } from '@/lib/utils'

const MODEL = 'llama-3.3-70b-versatile'

let groqClient: Groq | null = null

function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqClient
}

export async function callGroq(prompt: string, retries = 3): Promise<string> {
  const groq = getGroqClient()

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      })
      return response.choices[0]?.message?.content ?? ''
    } catch (err) {
      if (attempt === retries - 1) throw err
      await delay(2000 * (attempt + 1))
    }
  }
  throw new Error('Max Groq retries exceeded')
}

export async function callGroqJson<T>(prompt: string, retries = 3): Promise<T | null> {
  const text = await callGroq(prompt, retries)
  return parseJsonSafe<T>(text)
}
