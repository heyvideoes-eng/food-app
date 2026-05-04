import { runStructuredSynthesis } from '../../../../lib/ai/nvidia'
import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { FRIDGE_MIND_SYSTEM_PROMPT } from '../../../../lib/ai-prompt'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: fridgeItems } = await supabase.from('fridge_items').select('name, category')
    const itemsContext = (fridgeItems as any[])?.map((i: any) => i.name).join(', ') || 'None'

    const schema = z.object({
      suggestions: z.array(z.object({
        name: z.string(),
        reason: z.string()
      }))
    })

    const result = await runStructuredSynthesis({
      system: `${FRIDGE_MIND_SYSTEM_PROMPT} You are a strategic grocery planner.`,
      prompt: `CURRENT INVENTORY: ${itemsContext}`,
      schema
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Shopping API Error:', error)
    return NextResponse.json({
      suggestions: [
        { name: 'Fresh Greens', reason: 'High-vitality staple' },
        { name: 'Organic Eggs', reason: 'Protein node replenishment' }
      ]
    })
  }
}
