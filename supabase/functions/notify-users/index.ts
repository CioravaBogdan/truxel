
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the webhook payload
    const payload = await req.json()
    const { record, type, table } = payload

    // Handle INSERT on notifications (Single User Push)
    if (type === 'INSERT' && table === 'notifications') {
      // Skip if this is a community alert (already handled by the community_posts logic)
      if (record.type === 'community_alert') {
        return new Response(JSON.stringify({ message: 'Skipped community_alert' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      const userId = record.user_id
      if (!userId) {
        return new Response(JSON.stringify({ message: 'No user_id in notification' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      // Get user's push token
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('expo_push_token')
        .eq('user_id', userId)
        .single()

      if (userError || !user?.expo_push_token || !user.expo_push_token.startsWith('ExponentPushToken')) {
        console.log(`No valid token for user ${userId}`)
        return new Response(JSON.stringify({ message: 'No valid token' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      // Send Push Notification
      const pushMessage = {
        to: user.expo_push_token,
        sound: 'default',
        title: record.title,
        body: record.message,
        data: record.data || {},
      }

      const resp = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([pushMessage]),
      })
      
      const pushResult = await resp.json()
      console.log('Single Push Result:', pushResult)

      return new Response(JSON.stringify({ success: true, pushResult }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Handle INSERT on community_posts (Bulk Push)
    if (type === 'INSERT' && table === 'community_posts') {
      const post = record
    const originCity = post.origin_city
    const posterUserId = post.user_id

    if (!originCity) {
      return new Response(JSON.stringify({ message: 'No origin city' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`New post in ${originCity} by ${posterUserId}`)

    // 1. Find users in this city (excluding the poster)
    // We need to handle "City - Distance" format if present in profiles, 
    // but usually profiles.last_known_city is just the city name.
    // We'll do a simple match for now.
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, expo_push_token, last_known_city')
      .eq('last_known_city', originCity)
      .neq('user_id', posterUserId)

    if (usersError) {
      throw usersError
    }

    if (!users || users.length === 0) {
      console.log('No matching users found')
      return new Response(JSON.stringify({ message: 'No users to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`Found ${users.length} users to notify`)

    // 2. Prepare notifications
    const notifications = []
    const pushMessages = []

    // Get poster company name for the message
    const { data: posterProfile } = await supabase
      .from('profiles')
      .select('company_name')
      .eq('user_id', posterUserId)
      .single()

    const companyName = posterProfile?.company_name || 'Someone'
    const cargoInfo = post.cargo_type 
      ? `${post.cargo_type}${post.cargo_weight ? ` (${post.cargo_weight}t)` : ''}`
      : 'New Load'

    const title = `🚛 New load in ${originCity}`
    const message = `${companyName} posted: ${cargoInfo}`

    for (const user of users) {
      // Database Notification (Persistent Inbox)
      notifications.push({
        user_id: user.user_id,
        title: title,
        message: message,
        type: 'community_alert',
        data: { post_id: post.id, city: originCity },
        is_read: false
      })

      // Push Notification (System Tray)
      if (user.expo_push_token && user.expo_push_token.startsWith('ExponentPushToken')) {
        pushMessages.push({
          to: user.expo_push_token,
          sound: 'default',
          title: title,
          body: message,
          data: { post_id: post.id, url: '/(tabs)/community' },
        })
      }
    }

    // 3. Insert into notifications table
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications)
      
      if (insertError) {
        console.error('Error inserting notifications:', insertError)
      } else {
        console.log('Inserted notifications into DB')
      }
    }

    // 4. Send Push Notifications to Expo
    if (pushMessages.length > 0) {
      const resp = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pushMessages),
      })
      
      const pushResult = await resp.json()
      console.log('Expo Push Result:', pushResult)
    }

    return new Response(JSON.stringify({ success: true, usersCount: users.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
    }

    return new Response(JSON.stringify({ message: 'Ignored event' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
