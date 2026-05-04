import { nvidiaClient } from '../../../../lib/ai/nvidia'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { addDays } from 'date-fns'
import { FRIDGE_MIND_SYSTEM_PROMPT } from '../../../../lib/ai-prompt'

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || 'demo-user-node'
    
    const { object } = await generateObject({
      model: nvidiaClient('meta/llama-3.2-11b-vision-instruct'),
      schema: z.object({
        items: z.array(z.object({
          name: z.string(),
          quantity: z.number(),
          unit: z.string(),
          category: z.string(),
          estimated_expiry_days: z.number()
        }))
      }),
      messages: [
        { role: 'system', content: `${FRIDGE_MIND_SYSTEM_PROMPT} You are a high-speed vision node capable of extracting grocery data from images.` },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract item details and estimate shelf life.' },
            { type: 'image', image: imageUrl }
          ]
        }
      ]
    })

    if (userId) {
      const itemsToInsert = object.items.map((item: any) => ({
        user_id: userId === 'demo-user-node' ? null : userId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        expiry_date: addDays(new Date(), item.estimated_expiry_days).toISOString().split('T')[0],
        source_type: 'receipt_scan',
        storage_area: 'Fridge'
      }))
      await supabase.from('fridge_items').insert(itemsToInsert)
    }

    return NextResponse.json({ ...object, persisted: !!userId })
  } catch (error) {
    console.error('Vision API Error:', error)
    return new Response(JSON.stringify({ error: 'Failed to analyze receipt' }), { status: 500 })
  }
}
