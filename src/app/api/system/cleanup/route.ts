import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString().split('T')[0]

    // 1. Fetch all expired items across all users
    const { data: expiredItems, error: fetchError } = await supabase
      .from('fridge_items')
      .select('*')
      .lt('expiry_date', now)

    if (fetchError) throw fetchError

    if (!expiredItems || expiredItems.length === 0) {
      return NextResponse.json({ message: 'No expired items found for cleanup.' })
    }

    // 2. AI WASTE AUDIT: Use Gemini to analyze the impact
    const { object: audit } = await generateObject({
      model: google('gemini-1.5-flash-latest'),
      schema: z.object({
        total_value_loss: z.number(),
        total_carbon_kg: z.number(),
        impact_summary: z.string(),
        items_analysis: z.array(z.object({
          name: z.string(),
          penalty_multiplier: z.number(), // 1 to 5 based on carbon footprint
          reason: z.string()
        }))
      }),
      messages: [
        {
          role: 'user',
          content: `Perform a sustainability audit on these wasted food items: ${(expiredItems as any[]).map((i: any) => i.name).join(', ')}. 
          Calculate total financial loss (estimate in USD) and total CO2 impact (kg). 
          For each item, provide a penalty multiplier based on how environmentally expensive it is to produce (e.g., meat is 5, vegetables are 1).`
        }
      ]
    })

    // 3. Log them as waste events with AI data
    const wasteEvents = (expiredItems as any[]).map((item: any) => {
      const itemAudit = audit.items_analysis.find((a: any) => a.name === item.name) || { penalty_multiplier: 1, reason: 'Standard waste' }
      return {
        user_id: item.user_id,
        fridge_item_id: item.id,
        outcome: 'wasted',
        reason: `AI Audit: ${itemAudit.reason}`,
        quantity: item.quantity,
        estimated_value: Math.floor(audit.total_value_loss / expiredItems.length),
        estimated_carbon_kg: Math.floor(audit.total_carbon_kg / expiredItems.length),
        logged_at: new Date().toISOString()
      }
    })

    const { error: wasteError } = await supabase.from('waste_events').insert(wasteEvents)
    if (wasteError) throw wasteError

    // 4. Update Rewards with AI Dynamic Penalties
    for (const item of (expiredItems as any[])) {
      const itemAudit = audit.items_analysis.find((a: any) => a.name === item.name) || { penalty_multiplier: 1 }
      const penalty = 5 * itemAudit.penalty_multiplier

      const { data: rewards } = await supabase
        .from('rewards')
        .select('eco_score, points')
        .eq('user_id', item.user_id)
        .single()

      if (rewards) {
        await supabase
          .from('rewards')
          .update({ 
            eco_score: Math.max(0, rewards.eco_score - (1 * itemAudit.penalty_multiplier)),
            points: Math.max(0, rewards.points - penalty),
            last_activity_at: new Date().toISOString()
          })
          .eq('user_id', item.user_id)
      }
    }

    // 5. Delete the expired items from inventory
    const { error: deleteError } = await supabase
      .from('fridge_items')
      .delete()
      .in('id', (expiredItems as any[]).map((i: any) => i.id))

    if (deleteError) throw deleteError

    return NextResponse.json({
      message: `AI Cleanup Complete. Processed ${expiredItems.length} items.`,
      audit_summary: audit.impact_summary,
      total_carbon_kg: audit.total_carbon_kg
    })
  } catch (error: any) {
    console.error('AI Cleanup Service Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
