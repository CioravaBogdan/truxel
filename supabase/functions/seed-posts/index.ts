import { createClient } from 'jsr:@supabase/supabase-js@2'
import data from './data.json' with { type: 'json' }

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Dummy password hash
const DUMMY_PASSWORD = "$2a$10$abcdefghijklmnopqrstuv"

Deno.serve(async (req) => {
  try {
    const { mode } = await req.json().catch(() => ({ mode: 'all' }));
    
    console.log(`Starting seed process... Mode: ${mode}`)
    
    // Calculate Timestamps
    const now = new Date()
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
    
    let usersCreated = 0
    let postsCreated = 0
    
    // Process in batches of 20 to avoid timeouts
    const BATCH_SIZE = 20
    
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE)
      
      const usersBatch = []
      const profilesBatch = []
      const postsBatch = []
      
      for (const row of batch) {
        // Prepare User Data
        const rawUserMeta = {
          full_name: row.contact_email.split('@')[0].replace('.', ' '),
          company_name: "Independent Carrier",
          email: row.contact_email,
          email_verified: true
        }

        // We push to batch arrays
        // NOTE: supabase-js auth.admin.createUser doesn't support bulk insert nicely for 'on conflict'
        // So for Users, we might need to do one by one or ignore errors? 
        // Actually, for speed, direct DB insert via RPC or SQL is better, but supabase-js is safer.
        // Let's rely on upsert if possible? auth.users is hard to upsert via JS client.
        // We will skip user creation if they exist (handled nicely by just ignoring error or checking first)
        // But checking 450 users is slow. 
        // Strategy: Assume users exist from previous run OR try to create. 
        // For Automation: Users likely exist. 
      }
      
      // OPTIMIZED BATCH INSERT STRATEGY
      // 1. Posts are the main thing to refresh.
      // 2. Users/Profiles only strictly needed if missing.
      
      const postInserts = batch.map(row => ({
        // Use a deterministic UUID if we want to update, or random for new?
        // User wants "generate new". 
        // If we use random UUID, we get duplicate posts if we run updates without cleanup.
        // But user said Supabase deletes old ones. So acceptable.
        // id: crypto.randomUUID(), --> Let DB handle it or gen here.
        
        user_id: row.user_id,
        post_type: row.post_type,
        status: row.status,
        origin_lat: parseFloat(row.origin_lat),
        origin_lng: parseFloat(row.origin_lng),
        origin_city: row.origin_city,
        origin_country: row.origin_country,
        dest_city: row.dest_city,
        dest_country: row.dest_country,
        dest_lat: parseFloat(row.dest_lat),
        dest_lng: parseFloat(row.dest_lng),
        template_key: row.template_key,
        metadata: JSON.parse(row.metadata),
        contact_phone: row.contact_phone,
        contact_whatsapp: row.contact_whatsapp.toLowerCase() === 'true',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        expires_at: expires.toISOString(),
        view_count: parseInt(row.view_count),
        contact_count: parseInt(row.contact_count)
      }))

      const { error: postError } = await supabase
        .from('community_posts')
        .insert(postInserts)
        
      if (postError) {
        console.error('Error inserting posts batch:', postError)
      } else {
        postsCreated += postInserts.length
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Data seed complete', 
        posts_created: postsCreated, 
        expires_at: expires.toISOString() 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
