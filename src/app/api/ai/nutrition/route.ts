import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { FRIDGE_MIND_SYSTEM_PROMPT } from '@/lib/ai-prompt'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    
    const cookieStore = await cookies()
    // Fix: Allow localhost Supabase usage
    const isDemoMode = cookieStore.get('demo-mode')?.value === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL
    
    const supabase = await createClient()
    let user = null
    if (!isDemoMode) {
      const { data } = await supabase.auth.getUser()
      user = data.user
    }

    if (!user && !isDemoMode) {
      console.warn('Nutrition API: Unauthorized access attempt')
      return new Response('Unauthorized', { status: 401 })
    }

    // Check for Google AI API Key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('Nutrition API: GOOGLE_GENERATIVE_AI_API_KEY is missing')
      return new Response(JSON.stringify({ error: 'AI Configuration missing' }), { status: 500 })
    }

    // Fetch fridge items for context
    let inventoryContext = 'No items in fridge.'
    if (!isDemoMode) {
      const { data: fridgeItems } = await supabase
        .from('fridge_items')
        .select('name, quantity, unit, expiry_date')
        .order('expiry_date', { ascending: true })
      
      if (fridgeItems && fridgeItems.length > 0) {
        inventoryContext = fridgeItems.map((i: any) => `- ${i.name} (${i.quantity} ${i.unit}), Expiry: ${i.expiry_date}`).join('\n')
      }
    }

    const taskContext = `
TASK TYPE: chat
CURRENT INVENTORY CONTEXT:
${inventoryContext}
`

    try {
      const result = await streamText({
        model: google('gemini-1.5-flash'), 
        system: FRIDGE_MIND_SYSTEM_PROMPT + '\n' + taskContext,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content
        })),
      })

      return result.toTextStreamResponse()
    } catch (aiError: any) {
      console.warn('Nutrition API: AI failed (quota/limit), using Local Engine fallback.', aiError.message)
      
      const mockResponse = `Hello! It looks like our AI Nutritionist is currently handling a high volume of requests (Quota Limit). 

Based on your current inventory of **${inventoryContext.split('\n').length} items**, I recommend focusing on your soon-to-expire ingredients. For example, if you have fresh produce, consider a quick stir-fry or salad to maximize nutrient density while minimizing waste.

Feel free to ask about specific food safety tips or general cooking advice while our AI systems reset!`

      return new Response(mockResponse, {
        headers: { 'Content-Type': 'text/plain' }
      })
    }
  } catch (error: any) {
    console.error('Nutrition Route Global Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to generate response', 
      details: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
