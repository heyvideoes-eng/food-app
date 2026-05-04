import { createOpenAI } from '@ai-sdk/openai'
import { generateText, generateObject } from 'ai'
import { z } from 'zod'

/**
 * FridgeMind Zero: Shared NVIDIA NIM Client
 * Configured for integrate.api.nvidia.com/v1
 */

if (!process.env.NVIDIA_API_KEY) {
  console.warn('NVIDIA_API_KEY is missing from environment nodes.')
}

export const nvidiaClient = createOpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

export const DEFAULT_MODEL = 'meta/llama-3.1-70b-instruct'

interface ChatOptions {
  system: string
  prompt: string
  temperature?: number
}

export async function runNeuralCompletion({ system, prompt, temperature = 0.5 }: ChatOptions) {
  try {
    const { text } = await generateText({
      model: nvidiaClient(DEFAULT_MODEL),
      system,
      prompt,
      temperature,
    })
    return text
  } catch (error) {
    console.error('Neural Completion Error:', error)
    throw error
  }
}

export async function runStructuredSynthesis<T extends z.ZodTypeAny>({ system, prompt, schema }: { system: string, prompt: string, schema: T }) {
  try {
    // We use generateText + manual parse for maximum compatibility with NVIDIA NIM
    const fullPrompt = `
      ${system}
      
      USER DATA: ${prompt}
      
      RESPONSE FORMAT: Return a valid JSON object matching the requested schema. Do not include markdown formatting or prose.
    `
    
    const { text } = await generateText({
      model: nvidiaClient(DEFAULT_MODEL),
      prompt: fullPrompt,
      temperature: 0.2,
    })
    
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch (error) {
    console.error('Structured Synthesis Error:', error)
    throw error
  }
}
