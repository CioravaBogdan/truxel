import csv
import json
import re
import random
from datetime import datetime, timedelta

# Escape single quotes for SQL
def escape_sql(val):
    if val is None:
        return 'NULL'
    if isinstance(val, bool):
        return 'TRUE' if val else 'FALSE'
    return "'" + str(val).replace("'", "''") + "'"

def generate_sql():
    users_seen = set()
    users_sql = []
    profiles_sql = []
    posts_sql = []

    # Calculate timestamps for FRESH data relative to NOW
    now = datetime.now()
    expires = now + timedelta(hours=24) # Set expiration to 24 hours from now
    
    # Format for PostgreSQL
    now_str = now.isoformat()
    expires_str = expires.isoformat()

    # Dummy password hash (bcrypt for "password")
    dummy_password = "$2a$10$abcdefghijklmnopqrstuv"
    
    company_suffixes = ['Logistics', 'Transport', 'Freight', 'Shipping', 'Carriers', 'Express', 'Lines', 'Trucking', 'Haulage', 'Solutions']

    with open('community_posts_complete.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            user_id = row['user_id']
            email = row['contact_email']
            
            # --- 1. PREPARE REALISTIC DATA ---
            
            # Clean Name: Remove digits from email-derived name
            # e.g. "mike.brown99" -> "Mike Brown"
            raw_name = email.split('@')[0].replace('.', ' ').title()
            real_name = re.sub(r'\d+', '', raw_name).strip()
            
            # Generate Company Name
            # e.g. "Brown Logistics"
            last_name = real_name.split()[-1] if real_name else "Carrier"
            company_name = f"{last_name} {random.choice(company_suffixes)}"
            
            # Extract Truck Type from metadata and Map to Valid DB Enums
            truck_type = '3.5T' # Default
            valid_map = {
                'Van': '3.5T',
                'Box Truck': 'BoxTruck',
                'Refrigerated': 'Frigo',
                'Flatbed': 'Flatbed',
                '20T': '20T'
            }
            
            try:
                # The CSV might contain double quotes for JSON escaping, standard csv reader handles it usually
                # If row['metadata'] looks like: "{""direction"":...}" python csv might load it as '{"direction":...}'
                meta = json.loads(row['metadata'])
                if 'truck_type' in meta:
                    raw_type = meta['truck_type']
                    truck_type = valid_map.get(raw_type, '3.5T') # Default to 3.5T if unknown
            except Exception as e:
                # print(f"Error parsing metadata for {user_id}: {e}")
                pass

            # --- 2. AUTH USERS ---
            if user_id not in users_seen:
                users_seen.add(user_id)
                
                # auth.users
                raw_user_meta = json.dumps({
                    "full_name": real_name,
                    "company_name": company_name,
                    "email": email,
                    "email_verified": True
                })
                
                users_sql.append(f"""
                INSERT INTO auth.users (
                    id, 
                    email, 
                    encrypted_password, 
                    email_confirmed_at, 
                    aud, 
                    role,
                    raw_user_meta_data,
                    created_at,
                    updated_at,
                    confirmation_token,
                    recovery_token
                ) VALUES (
                    '{user_id}', 
                    '{email}', 
                    '{dummy_password}', 
                    '{now_str}', 
                    'authenticated', 
                    'authenticated',
                    '{raw_user_meta}',
                    '{now_str}',
                    '{now_str}',
                    '',
                    ''
                ) ON CONFLICT (id) DO NOTHING;
                """)

                # --- 3. PUBLIC PROFILES ---
                profiles_sql.append(f"""
                INSERT INTO public.profiles (
                    id,
                    user_id, 
                    email, 
                    full_name, 
                    company_name,
                    truck_type,
                    subscription_tier,
                    subscription_status,
                    created_at,
                    updated_at
                ) VALUES (
                    gen_random_uuid(),
                    '{user_id}', 
                    '{email}', 
                    {escape_sql(real_name)}, 
                    {escape_sql(company_name)},
                    {escape_sql(truck_type)},
                    'trial',
                    'active',
                    '{now_str}',
                    '{now_str}'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
                """) 
            
            # --- 4. COMMUNITY POSTS ---
            is_whatsapp = 'TRUE' if row['contact_whatsapp'].lower() == 'true' else 'FALSE'
            
            posts_sql.append(f"""
            INSERT INTO public.community_posts (
                id,
                user_id,
                post_type,
                status,
                origin_lat,
                origin_lng,
                origin_city,
                origin_country,
                dest_city,
                dest_country,
                dest_lat,
                dest_lng,
                template_key,
                metadata,
                contact_phone,
                contact_whatsapp,
                created_at,
                updated_at,
                expires_at,
                view_count,
                contact_count
            ) VALUES (
                gen_random_uuid(),
                '{row['user_id']}',
                '{row['post_type']}',
                '{row['status']}',
                {row['origin_lat']},
                {row['origin_lng']},
                {escape_sql(row['origin_city'])},
                {escape_sql(row['origin_country'])},
                {escape_sql(row['dest_city'])},
                {escape_sql(row['dest_country'])},
                {row['dest_lat']},
                {row['dest_lng']},
                {escape_sql(row['template_key'])},
                '{row['metadata']}',
                {escape_sql(row['contact_phone'])},
                {is_whatsapp},
                '{now_str}',
                '{now_str}',
                '{expires_str}',
                {row['view_count']},
                {row['contact_count']}
            );
            """)

    # Combine into separate files for safer MCP execution
    
    with open('populate_users.sql', 'w', encoding='utf-8') as f:
        f.write("\n".join(users_sql))

    with open('populate_profiles.sql', 'w', encoding='utf-8') as f:
        f.write("\n".join(profiles_sql))

    with open('populate_posts.sql', 'w', encoding='utf-8') as f:
        f.write("\n".join(posts_sql))

    print(f"Generated SQL files: {len(users_sql)} users, {len(profiles_sql)} profiles, {len(posts_sql)} posts.")

if __name__ == "__main__":
    generate_sql()
