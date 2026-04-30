import { NextResponse } from 'next/server'

// NOTE: For Twilio WhatsApp Sandbox (free tier), the recipient number MUST first
// opt-in by sending "join <sandbox-name>" to +14155238886 on WhatsApp.
// Otherwise Twilio will return a 63016 error. See: https://twilio.com/console/sms/whatsapp/sandbox
export async function POST(req: Request) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // In a real production app, you would save this OTP to a database with an expiry
    // For this implementation, we'll log it and send it via Twilio
    console.log(`[Auth Engine] Generated OTP ${otp} for ${phone}`)

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_WHATSAPP_FROM

    if (!accountSid || !authToken || !from) {
      console.warn(`[Auth Engine] Twilio keys missing. Entering SIMULATOR MODE for ${phone}`)
      return NextResponse.json({ 
        success: true, 
        simulated: true, 
        debugOtp: otp,
        message: 'Running in Studio Simulator Mode. Use the code provided to login.'
      })
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
          To: `whatsapp:${phone}`,
          From: from,
          Body: `📦 FridgeMind Login Code: ${otp}. Do not share this with anyone.`,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Twilio failed to send OTP')
    }

    // IMPORTANT: In this demo/simulation, we'll return the OTP so the frontend can "simulate" verification
    // In a real app, you would ONLY return success: true
    return NextResponse.json({ success: true, debugOtp: otp })
  } catch (err: any) {
    console.error('WhatsApp OTP Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
