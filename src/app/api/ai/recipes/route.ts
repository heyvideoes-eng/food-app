import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { preferences, input: creativePrompt, selectedIngredientIds, selectedItems: manualItems } = await req.json()
    
    const cookieStore = await cookies()
    const isDemoMode = cookieStore.get('demo-mode')?.value === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !isDemoMode) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Fetch all fridge items if not provided manually
    let selectedItems = manualItems
    let otherItems = []

    if (!selectedItems || selectedItems.length === 0) {
      const { data: allFridgeItems } = await supabase
        .from('fridge_items')
        .select('id, name, quantity, unit, expiry_date, category')
        .order('expiry_date', { ascending: true })

      selectedItems = (allFridgeItems as any[])?.filter((item: any) => selectedIngredientIds.includes(item.id)) || []
      otherItems = (allFridgeItems as any[])?.filter((item: any) => !selectedIngredientIds.includes(item.id)) || []
    }

    const systemPrompt = `You are FridgeMind's Intelligent Recipe Engine, a world-class culinary expert focused on food waste reduction and smart home cooking.
Your mission is to generate realistic, delicious, and highly contextual recipes based on what the user has in their kitchen.

CORE PRIORITIES:
1. WASTE REDUCTION: Favor recipes that use highly perishable items (leafy greens, dairy, berries) and ingredients nearing their expiry date.
2. ACCURACY: Clearly distinguish between "Ingredients You Have" and "Missing Ingredients".
3. DIETARY COMPLIANCE: Strictly honor all selected dietary preferences.
4. PRACTICALITY: Suggest practical, home-cook friendly meals that can be made quickly or with minimal extra shopping.

DIETARY PREFERENCES: ${preferences?.join(', ') || 'No specific restrictions'}.
USER'S CREATIVE DIRECTION: ${creativePrompt || 'No specific direction provided. Surprise me with something great!'}

AVAILABLE INVENTORY CONTEXT:
- SELECTED ITEMS (Priority): ${selectedItems.map((i: any) => `${i.name} (${i.quantity} ${i.unit}, Expiry: ${i.expiry_date})`).join(', ')}
- OTHER AVAILABLE ITEMS: ${otherItems.map((i: any) => i.name).join(', ')}

WASTE REDUCTION INTELLIGENCE:
- Leafy greens, berries, herbs, dairy, and cooked food are VERY PERISHABLE.
- Tomatoes, mushrooms, bread, and opened sauces are MEDIUM PERISHABLE.
- Onions, potatoes, dry grains, and spices are LOW PERISHABLE.

RESPONSE FORMAT:
You must return a structured JSON response containing 3-5 ranked recipe recommendations.
Each recipe must include a wasteReductionScore (0-100) based on how many perishable/expiring items it uses.`

    const { object } = await generateObject({
      model: google('gemini-1.5-pro'),
      schema: z.object({
        summary: z.string().describe("A short summary of the recommendations and how they help reduce waste."),
        recipes: z.array(z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          matchScore: z.number().min(0).max(100),
          wasteReductionScore: z.number().min(0).max(100),
          cookTime: z.string(),
          difficulty: z.enum(['easy', 'medium', 'hard']),
          dietaryFit: z.array(z.string()),
          usesIngredients: z.array(z.object({
            name: z.string(),
            quantity: z.string(),
            source: z.enum(['inventory', 'pantry']),
            priority: z.enum(['high', 'medium', 'low']).describe("High priority means it's nearing expiry.")
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
          whyThisWorks: z.string().describe("Reasoning for why this recipe was chosen based on ingredients and waste reduction."),
          leftoverPrediction: z.string().describe("What ingredients will be left after cooking this recipe."),
          nextRecipeSuggestion: z.string().describe("A suggested next recipe to use up the remaining ingredients.")
        }))
      }),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: creativePrompt || "Suggest the best recipes using my selected ingredients to minimize waste." }
      ]
    })

    return NextResponse.json(object)
  } catch (error: any) {
    console.error('Recipe Generation Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to generate recipes',
      details: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
