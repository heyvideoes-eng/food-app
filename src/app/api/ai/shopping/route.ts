import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { FRIDGE_MIND_SYSTEM_PROMPT } from '@/lib/ai-prompt'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: fridgeItems } = await supabase.from('fridge_items').select('name, category')

  const itemsContext = (fridgeItems as any[])?.map((i: any) => i.name).join(', ') || 'None'

  const taskContext = `
TASK TYPE: shopping
CURRENT FRIDGE ITEMS: ${itemsContext}

Based on the current fridge items, suggest 3-5 grocery items they might need to buy soon to maintain a healthy diet or replenish staples.
Consider what goes well with these items or what might be missing (e.g. if they have eggs, maybe they need bread).
Keep the reason very short (under 5 words).
`

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      suggestions: z.array(z.object({
        name: z.string(),
        reason: z.string()
      }))
    }),
    messages: [
      { role: 'system', content: FRIDGE_MIND_SYSTEM_PROMPT },
      { role: 'user', content: taskContext }
    ]
  })

  return NextResponse.json(object)
}
