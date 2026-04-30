import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message, to: customTo } = await req.json()

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_WHATSAPP_FROM
    const to = customTo || process.env.USER_WHATSAPP_NUMBER

    if (!accountSid || !authToken || !from || !to) {
      console.error('Twilio configuration is missing')
      return NextResponse.json({ error: 'Messaging configuration incomplete' }, { status: 500 })
    }

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: from,
          Body: `📦 FridgeMind Intelligence: ${message}`,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Twilio Error:', errorData)
      throw new Error(errorData.message || 'Failed to send WhatsApp message')
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('WhatsApp Notification Route Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
