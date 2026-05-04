import { runNeuralCompletion } from '../../../../lib/ai/nvidia'
import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { FRIDGE_MIND_SYSTEM_PROMPT } from '../../../../lib/ai-prompt'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1].content
    
    const supabase = await createClient()
    const { data: fridgeItems } = await supabase.from('fridge_items').select('name, quantity, expiry_date')
    const inventoryContext = (fridgeItems as any[])?.map(i => `${i.name} (exp: ${i.expiry_date})`).join(', ') || 'Empty'

    const system = `
      ${FRIDGE_MIND_SYSTEM_PROMPT}
      You are the FridgeMind Zero AI Assistant. You have full access to the user's inventory telemetry.
      CURRENT INVENTORY: ${inventoryContext}
      Provide helpful, tactical advice on cooking, waste reduction, and kitchen management.
    `

    const response = await runNeuralCompletion({
      system,
      prompt: lastMessage
    })

    return NextResponse.json({ role: 'assistant', content: response })
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response('Neural Link Error', { status: 500 })
  }
}
