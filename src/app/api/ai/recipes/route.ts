import { runStructuredSynthesis } from '../../../../lib/ai/nvidia'
import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { FRIDGE_MIND_SYSTEM_PROMPT } from '../../../../lib/ai-prompt'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const { preferences, input: creativePrompt, selectedItems: manualItems } = await req.json()
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || 'demo-user-node'
    
    let selectedItems = manualItems || []
    if (selectedItems.length === 0) {
      const { data } = await supabase.from('fridge_items').select('*').limit(10)
      selectedItems = data || []
    }

    const taskPrompt = `
      DIRECTION: ${creativePrompt || 'Surprise me!'}
      INGREDIENTS: ${selectedItems.map((i: any) => i.name).join(', ')}
      PREFERENCES: ${preferences?.join(', ') || 'None'}
    `

    const schema = z.object({
      summary: z.string(),
      recipes: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        matchScore: z.number(),
        wasteReductionScore: z.number(),
        cookTime: z.string(),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        dietaryFit: z.array(z.string()),
        instructions: z.array(z.string()),
        whyThisWorks: z.string()
      }))
    })

    const result = await runStructuredSynthesis({
      system: `${FRIDGE_MIND_SYSTEM_PROMPT} You are an expert culinary architect specializing in zero-waste cooking.`,
      prompt: taskPrompt,
      schema
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Recipe API Error:', error)
    return NextResponse.json({
      summary: 'Neural link interrupted. Using emergency cookbook archetypes.',
      recipes: [{
        id: 'fallback-node',
        title: 'Neural Green Fusion',
        description: 'A robust dish utilizing your available inventory nodes.',
        matchScore: 99,
        wasteReductionScore: 100,
        cookTime: '15 mins',
        difficulty: 'easy',
        dietaryFit: ['Clean', 'High-Protein'],
        instructions: ['Prep nodes.', 'Apply heat.', 'Consume.'],
        whyThisWorks: 'Engineered for maximum sustainability.'
      }]
    })
  }
}
