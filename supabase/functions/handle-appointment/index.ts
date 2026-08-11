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
    const { data: appointmentData } = body

    if (!appointmentData) {
      throw new Error('No appointment data provided')
    }

    console.log('Received appointment data:', appointmentData)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the current user from the request (if authenticated)
    const authHeader = req.headers.get('Authorization')
    let currentUser = null
    
    if (authHeader && authHeader.startsWith('Bearer ') && !authHeader.includes(Deno.env.get('SUPABASE_ANON_KEY'))) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
        if (!userError && user) {
          currentUser = user
          console.log('🔐 Authenticated user found:', user.id, user.email)
        }
      } catch (error) {
        console.log('⚠️ Could not get user from token:', error)
      }
    }
    // Save appointment to database with PENDING status and service information
    const { data, error: dbError } = await supabaseClient
      .from('appointments')
      .insert([{
        user_id: currentUser?.id || null,
        user_name: appointmentData.name,
        user_email: appointmentData.email,
        user_phone: appointmentData.phone,
        service_id: appointmentData.serviceId,
        service_name: appointmentData.serviceName,
        service_price: appointmentData.servicePrice,
        services_data: appointmentData.servicesData || null,
        barber_id: appointmentData.barberId,
        appointment_date: appointmentData.date,
        appointment_time: appointmentData.time,
        location_id: appointmentData.locationId,
        status: 'pending'
      }])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }

    console.log('Appointment saved successfully:', data)

    try {
      console.log('📧 Email notifications would be sent here (Resend not configured)')
      console.log('✅ Appointment saved successfully without email notifications')
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Continue execution even if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: 'Appointment created successfully and is pending confirmation'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error processing appointment:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred while processing the appointment'
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