import csv
import json

def generate_batch_sql(limit=20):
    users_seen = set()
    users_sql = []
    profiles_sql = []
    posts_sql = []
    dummy_password = "$2a$10$abcdefghijklmnopqrstuv" 

    with open('community_posts_complete.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            if count >= limit:
                break
            count += 1
            
            user_id = row['user_id']
            email = row['contact_email']
            
            if user_id not in users_seen:
                users_seen.add(user_id)
                raw_user_meta = json.dumps({"full_name": email.split('@')[0], "email": email})
                
                users_sql.append(f"INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role, raw_user_meta_data) VALUES ('{user_id}', '{email}', '{dummy_password}', NOW(), 'authenticated', 'authenticated', '{raw_user_meta}') ON CONFLICT (id) DO NOTHING;")
                
                profiles_sql.append(f"INSERT INTO public.profiles (id, user_id, email, full_name, company_name, subscription_tier, subscription_status) VALUES (gen_random_uuid(), '{user_id}', '{email}', 'Test User', 'Test Co', 'free', 'active') ON CONFLICT (user_id) DO NOTHING;")

            is_whatsapp = 'TRUE' if row['contact_whatsapp'].lower() == 'true' else 'FALSE'
            posts_sql.append(f"INSERT INTO public.community_posts (id, user_id, post_type, status, origin_lat, origin_lng, origin_city, origin_country, created_at, updated_at, expires_at) VALUES ('{row['id']}', '{row['user_id']}', '{row['post_type']}', '{row['status']}', {row['origin_lat']}, {row['origin_lng']}, '{row['origin_city']}', '{row['origin_country']}', '{row['created_at']}', '{row['updated_at']}', '{row['expires_at']}') ON CONFLICT (id) DO NOTHING;")

    full_sql = "\n".join(users_sql) + "\n" + "\n".join(profiles_sql) + "\n" + "\n".join(posts_sql)
    print(full_sql)

if __name__ == "__main__":
    generate_batch_sql()
