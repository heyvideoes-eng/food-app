import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '../../../../lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { FRIDGE_MIND_SYSTEM_PROMPT } from '../../../../lib/ai-prompt'

export async function POST(req: Request) {
  try {
    const { preferences, input: creativePrompt, selectedIngredientIds, selectedItems: manualItems } = await req.json()
    
    const cookieStore = await cookies()
    // Fix: Only use demo mode if explicitly set or if Supabase URL is completely missing. 
    // Allow localhost Supabase to be used normally.
    const isDemoMode = cookieStore.get('demo-mode')?.value === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL
    
    const supabase = await createClient()
    let user = null
    if (!isDemoMode) {
      const { data } = await supabase.auth.getUser()
      user = data.user
    }

    if (!user && !isDemoMode) {
      console.warn('Recipe API: Unauthorized access attempt (no user and not in demo mode)')
      return new Response('Unauthorized', { status: 401 })
    }

    // Check for AI API Key
    if (!process.env.NVIDIA_API_KEY) {
      console.error('Recipe API: NVIDIA_API_KEY is missing')
      return new Response(JSON.stringify({ error: 'AI Configuration missing' }), { status: 500 })
    }

    const nvidia = createOpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    })

    // Fetch all fridge items if not provided manually and not in demo mode
    let selectedItems = manualItems || []
    let otherItems: any[] = []

    if (!isDemoMode && (!selectedItems || selectedItems.length === 0)) {
      const { data: allFridgeItems } = await supabase
        .from('fridge_items')
        .select('id, name, quantity, unit, expiry_date, category')
        .order('expiry_date', { ascending: true })

      const items = (allFridgeItems as any[]) || []
      selectedItems = items.filter((item: any) => (selectedIngredientIds || []).includes(item.id))
      otherItems = items.filter((item: any) => !(selectedIngredientIds || []).includes(item.id))
    }

    const taskContext = `
TASK TYPE: recipe

DIETARY PREFERENCES: ${preferences?.join(', ') || 'No specific restrictions'}.
USER'S CREATIVE DIRECTION: ${creativePrompt || 'No specific direction provided. Surprise me with something great!'}

AVAILABLE INVENTORY CONTEXT:
- SELECTED ITEMS (Priority): ${selectedItems.length > 0 ? selectedItems.map((i: any) => `${i.name} (${i.quantity} ${i.unit}, Expiry: ${i.expiry_date})`).join(', ') : 'None selected'}
- OTHER AVAILABLE ITEMS: ${otherItems.length > 0 ? otherItems.map((i: any) => i.name).join(', ') : 'None available'}
`

    console.log('Recipe API: Generating with context length:', taskContext.length)

    try {
      const { object } = await generateObject({
        model: nvidia('meta/llama-3.1-70b-instruct'), // Primary: NVIDIA Llama 3.1
        schema: z.object({
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
            usesIngredients: z.array(z.object({
              name: z.string(),
              quantity: z.string(),
              source: z.enum(['inventory', 'pantry']),
              priority: z.enum(['high', 'medium', 'low'])
            })),
            missingIngredients: z.array(z.object({
              name: z.string(),
              optional: z.boolean()
            })),
            substitutions: z.array(z.object({
              insteadOf: z.string(),
              use: z.string()
            })),
            instructions: z.array(z.string()),
            whyThisWorks: z.string(),
            leftoverPrediction: z.string(),
            nextRecipeSuggestion: z.string()
          }))
        }),
        messages: [
          { role: 'system', content: FRIDGE_MIND_SYSTEM_PROMPT },
          { role: 'user', content: taskContext }
        ]
      })

      console.log('Recipe API: Successfully generated', object.recipes?.length, 'recipes')
      return NextResponse.json(object)
    } catch (aiError: any) {
      console.warn('Recipe API: AI failed (quota/limit), using Local Engine fallback.', aiError.message)
      
      // HIGH-QUALITY LOCAL FALLBACK
      const mockRecipes = {
        summary: `AI Engine is in high-demand (Quota Limit). I've prepared these "Rescue Recipes" based on your ${selectedItems.length} ingredients to keep you cooking!`,
        recipes: [
          {
            id: 'mock-1',
            title: creativePrompt?.toLowerCase().includes('spicy') ? 'Spicy Pantry Fusion' : 'Pantry Harvest Bowl',
            description: `A versatile dish designed to use ${selectedItems[0]?.name || 'your ingredients'} and pantry staples.`,
            matchScore: 95,
            wasteReductionScore: 100,
            cookTime: '20 mins',
            difficulty: 'easy',
            dietaryFit: preferences || ['Quick', 'Healthy'],
            usesIngredients: [
              { name: selectedItems[0]?.name || 'Main Ingredient', quantity: '1 unit', source: 'inventory', priority: 'high' },
              { name: 'Olive Oil', quantity: '2 tbsp', source: 'pantry', priority: 'low' },
              { name: 'Spices', quantity: 'to taste', source: 'pantry', priority: 'low' }
            ],
            missingIngredients: [],
            substitutions: [],
            instructions: [
              'Prep your main ingredients by washing and chopping.',
              'Sauté in a pan with olive oil and your favorite spices.',
              'Cook until golden brown and serve immediately.'
            ],
            whyThisWorks: 'This recipe prioritizes your existing inventory to prevent waste during AI maintenance.',
            leftoverPrediction: 'Minimal leftovers; great for immediate consumption.',
            nextRecipeSuggestion: 'Use any remaining greens for a fresh side salad.'
          }
        ]
      }
      
      return NextResponse.json(mockRecipes)
    }
  } catch (error: any) {
    console.error('Recipe API Global Error:', error)
    return new Response(JSON.stringify({ 
      error: 'System error', 
      details: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    })
  }
}
