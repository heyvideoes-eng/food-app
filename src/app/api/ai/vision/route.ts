import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { addDays } from 'date-fns'

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()
    
    const cookieStore = await cookies()
    const isDemoMode = cookieStore.get('demo-mode')?.value === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost')
    
    const supabase = await createClient()
    let user = null
    if (!isDemoMode) {
      const { data } = await supabase.auth.getUser()
      user = data.user
    }

    if (!user && !isDemoMode) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Gemini Vision call with the receipt image
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
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
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract grocery items from this receipt image. For each item, provide the name, quantity, unit (e.g., kg, units, liters), and category. Also estimate the shelf life in days from today based on its category (e.g., fresh vegetables 5 days, dairy 7-10 days, frozen 90 days, pantry 365 days).' },
            { type: 'image', image: new URL(imageUrl) }
          ]
        }
      ]
    })

    // AUTOMATION: Persist to Database if not in demo mode
    if (!isDemoMode && user) {
      const itemsToInsert = object.items.map(item => ({
        user_id: user.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        expiry_date: addDays(new Date(), item.estimated_expiry_days).toISOString().split('T')[0],
        source_type: 'receipt_scan',
        storage_area: 'Fridge'
      }))

      const { error } = await supabase.from('fridge_items').insert(itemsToInsert)
      if (error) {
        console.error('Supabase Insert Error:', error)
        // We still return the object so the UI can show what was found
      }
    }

    return NextResponse.json({
      ...object,
      persisted: !isDemoMode && !!user
    })
  } catch (error) {
    console.error('Vision API Error:', error)
    return new Response(JSON.stringify({ error: 'Failed to analyze receipt' }), { status: 500 })
  }
}
