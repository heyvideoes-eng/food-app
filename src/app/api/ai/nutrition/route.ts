import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    
    const cookieStore = await cookies()
    const isDemoMode = cookieStore.get('demo-mode')?.value === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !isDemoMode) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Fetch fridge items for context
    const { data: fridgeItems } = await supabase
      .from('fridge_items')
      .select('name, quantity, unit, expiry_date')
      .order('expiry_date', { ascending: true })

    const inventoryContext = (fridgeItems as any[])?.map((i: any) => `- ${i.name} (${i.quantity} ${i.unit}), Expiry: ${i.expiry_date}`).join('\n') || 'No items in fridge.'

    const systemMessage = `You are FridgeMind's AI Nutritionist and Global Food Assistant. 
You provide healthy eating advice, analyze meal descriptions, and give calorie/macro estimates.

CURRENT INVENTORY CONTEXT:
${inventoryContext}

GOALS:
1. Provide personalized nutrition advice based on what the user has.
2. Suggest ways to use up expiring items in healthy meals.
3. Keep responses friendly, encouraging, and concise.
4. Use Markdown for formatting.

If asked about recipes, give high-level suggestions. If they want detailed recipes, point them to the 'Recipes' studio.`

    const result = await streamText({
      model: google('gemini-1.5-flash-latest'),
      system: systemMessage,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Nutrition Route Error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
