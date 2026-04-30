import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: fridgeItems } = await supabase.from('fridge_items').select('name, category')

  const itemsContext = (fridgeItems as any[])?.map((i: any) => i.name).join(', ') || 'None'

  const { object } = await generateObject({
    model: google('gemini-1.5-flash-latest'),
    schema: z.object({
      suggestions: z.array(z.object({
        name: z.string(),
        reason: z.string()
      }))
    }),
    prompt: `Based on the following items currently in the fridge: ${itemsContext}. 
Suggest 3-5 grocery items they might need to buy soon to maintain a healthy diet or replenish staples.
Consider what goes well with these items or what might be missing (e.g. if they have eggs, maybe they need bread).
Keep the reason very short (under 5 words).`
  })

  return NextResponse.json(object)
}
