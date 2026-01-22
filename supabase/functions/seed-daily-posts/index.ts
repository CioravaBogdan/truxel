import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
// CRITICAL: Must use SERVICE_ROLE_KEY to bypass RLS
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Configuration
const POSTS_PER_CITY = 1 // 1 post per city per run (approx 445 posts daily)
const DB_BATCH_SIZE = 100 // Batch inserts to avoid timeouts

// Metadata generator
function generateMetadata() {
    const directions = ["north", "south", "east", "west", "local", "long_haul"]
    const truckTypes = ["20T", "Flatbed", "Box Truck", "Refrigerated", "Van"]
    const hours = Math.floor(Math.random() * 72) + 1
    
    return {
        direction: directions[Math.floor(Math.random() * directions.length)],
        truck_type: truckTypes[Math.floor(Math.random() * truckTypes.length)],
        available_hours: hours
    }
}

function getRandomItem(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)]
}

Deno.serve(async (req) => {
    try {
        console.log("Starting daily seed process (Per City Mode)...")

        // 1. Fetch ALL cities from the database
        const { data: dbCities, error: cityError } = await supabase
            .from('cities')
            .select('id, name, lat, lng, country_name')
        
        if (cityError) throw cityError
        if (!dbCities || dbCities.length === 0) {
            throw new Error("No cities found in database")
        }

        // 2. Fetch available "bot" users
        const { data: botProfiles, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, email')
            .ilike('email', '%@example.com')
            .limit(2000)

        if (profileError) throw profileError
        if (!botProfiles || botProfiles.length === 0) {
            throw new Error("No bot users found (email ending in @example.com)")
        }

        console.log(`Processing ${dbCities.length} cities using ${botProfiles.length} bots...`)

        const allPosts = []
        const now = new Date()

        // 3. Generate posts for EACH city
        for (const originCity of dbCities) {
            for (let i = 0; i < POSTS_PER_CITY; i++) {
                
                // Pick random user
                const user = getRandomItem(botProfiles)
                
                // Pick random destination (different from origin)
                let destCity = getRandomItem(dbCities)
                while (destCity.id === originCity.id && dbCities.length > 1) {
                    destCity = getRandomItem(dbCities)
                }

                // Random offsets
                const latOffset = (Math.random() * 0.1) - 0.05
                const lngOffset = (Math.random() * 0.1) - 0.05
                // Expiration set to exactly 24 hours from now
                const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000)

                const post = {
                    user_id: user.user_id,
                    post_type: "DRIVER_AVAILABLE",
                    status: "active",
                    origin_lat: Number(originCity.lat) + latOffset,
                    origin_lng: Number(originCity.lng) + lngOffset,
                    origin_city: originCity.name,
                    origin_country: originCity.country_name || "Romania", 
                    dest_city: destCity.name,
                    dest_country: destCity.country_name || "Romania",
                    dest_lat: Number(destCity.lat),
                    dest_lng: Number(destCity.lng),
                    template_key: ["north", "south", "local", "long_haul"][Math.floor(Math.random() * 4)],
                    metadata: generateMetadata(),
                    contact_phone: "",
                    contact_whatsapp: false,
                    contact_email: user.email,
                    created_at: now.toISOString(),
                    updated_at: now.toISOString(),
                    expires_at: expires.toISOString(),
                    view_count: Math.floor(Math.random() * 15),
                    contact_count: 0
                }

                allPosts.push(post)
            }
        }

        // 4. Batch Insert
        let totalInserted = 0
        for (let i = 0; i < allPosts.length; i += DB_BATCH_SIZE) {
            const batch = allPosts.slice(i, i + DB_BATCH_SIZE)
            const { error: insertError } = await supabase
                .from('community_posts')
                .insert(batch)
            
            if (insertError) {
                console.error(`Batch insert error at index ${i}:`, insertError)
            } else {
                totalInserted += batch.length
            }
        }

        return new Response(JSON.stringify({ 
            message: `Successfully generated content for ${dbCities.length} cities.`,
            cities_processed: dbCities.length,
            posts_created: totalInserted,
            bots_used: botProfiles.length
        }), { 
            headers: { "Content-Type": "application/json" } 
        })

    } catch (error) {
        console.error("Error seeding daily posts:", error)
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" } 
        })
    }
})