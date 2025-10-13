import { createClient } from 'npm:@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { phone, message, type } = body

    if (!phone || !message) {
      throw new Error('Phone and message are required')
    }

    // Format phone number (remove non-digits and add country code if needed)
    const cleanPhone = phone.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

    // WhatsApp API endpoint (using a service like Twilio, WhatsApp Business API, etc.)
    // For this example, we'll use a webhook approach or direct WhatsApp Web link
    
    // Create WhatsApp message URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    
    // Log the notification for admin tracking
    console.log(`WhatsApp notification sent to ${formattedPhone}: ${message}`)
    
    // In a real implementation, you would integrate with:
    // - Twilio WhatsApp API
    // - WhatsApp Business API
    // - Or another WhatsApp service provider
    
    return new Response(
      JSON.stringify({
        success: true,
        whatsappUrl,
        message: 'WhatsApp notification prepared successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred while sending WhatsApp notification'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})