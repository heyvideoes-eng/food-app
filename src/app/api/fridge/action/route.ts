import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { FRIDGE_MIND_SYSTEM_PROMPT } from '../../../../lib/ai-prompt'

export async function POST(req: Request) {
  try {
    const { itemId, action } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check for Google AI API Key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('Fridge Action API: GOOGLE_GENERATIVE_AI_API_KEY is missing')
      return new Response(JSON.stringify({ error: 'AI Configuration missing' }), { status: 500 })
    }

    // 1. Get the item details before acting
    const { data: item, error: fetchError } = await supabase
      .from('fridge_items')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !item) {
      return new Response('Item not found', { status: 404 })
    }

    // 2. Perform the action
    let aiMessage = ""
    let pointsAwarded = 0

    if (action === 'consume') {
      // AI SAVE AUDIT: Calculate positive impact
      const taskContext = `
TASK TYPE: waste_analysis
Analyze the sustainability impact of consuming this item before it expires: ${item.name}. 
Calculate CO2 saved (kg) and provide a reward multiplier (e.g., saving meat is 3x, vegetables 1x). 
Write a very short, encouraging 1-sentence praise message.
`

      const { object: audit } = await generateObject({
        model: google('gemini-1.5-flash'),
        schema: z.object({
          carbon_saved_kg: z.number(),
          reward_multiplier: z.number(), // 1 to 3 based on item importance
          praise_message: z.string()
        }),
        messages: [
          { role: 'system', content: FRIDGE_MIND_SYSTEM_PROMPT },
          { role: 'user', content: taskContext }
        ]
      })

      pointsAwarded = Math.round(25 * audit.reward_multiplier)
      aiMessage = audit.praise_message

      // Log a "Saved" event
      await supabase.from('waste_events').insert({
        user_id: user.id,
        fridge_item_id: item.id,
        outcome: 'saved',
        reason: `AI Save Audit: ${audit.praise_message}`,
        quantity: item.quantity,
        estimated_value: Math.floor(Math.random() * 50) + 10,
        estimated_carbon_kg: audit.carbon_saved_kg
      })

      // Award dynamic points
      const { data: rewards } = await supabase.from('rewards').select('points, current_streak_days, eco_score').eq('user_id', user.id).single()
      if (rewards) {
        await supabase.from('rewards').update({
          points: (rewards.points || 0) + pointsAwarded,
          eco_score: (rewards.eco_score || 0) + (1 * audit.reward_multiplier),
          current_streak_days: (rewards.current_streak_days || 0) + 1,
          last_activity_at: new Date().toISOString()
        }).eq('user_id', user.id)
      }
    } else if (action === 'waste') {
      // Log basic waste (AI Cleanup handles the major batch waste)
      await supabase.from('waste_events').insert({
        user_id: user.id,
        fridge_item_id: item.id,
        outcome: 'wasted',
        reason: 'Manually logged waste',
        quantity: item.quantity,
        estimated_value: 0,
        estimated_carbon_kg: (item.quantity || 1) * 0.5
      })

      // Deduct points
      const { data: rewards } = await supabase.from('rewards').select('points, eco_score').eq('user_id', user.id).single()
      if (rewards) {
        await supabase.from('rewards').update({
          points: Math.max(0, (rewards.points || 0) - 10),
          eco_score: Math.max(0, (rewards.eco_score || 0) - 1),
          last_activity_at: new Date().toISOString()
        }).eq('user_id', user.id)
      }
      aiMessage = "Item logged as waste. Let's try to save the next one!"
    }

    // 3. Remove the item from the fridge
    const { error: deleteError } = await supabase
      .from('fridge_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    return NextResponse.json({ 
      success: true, 
      message: aiMessage,
      pointsAwarded: pointsAwarded
    })
  } catch (error: any) {
    console.error('Fridge Action Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
