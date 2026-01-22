import csv
import json

def escape_sql(val):
    if val is None: return 'NULL'
    return "'" + str(val).replace("'", "''") + "'"

def generate_batch_sql(limit=50):
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
                profiles_sql.append(f"INSERT INTO public.profiles (id, user_id, email, full_name, company_name, subscription_tier, subscription_status) VALUES (gen_random_uuid(), '{user_id}', '{email}', 'Fake User', 'Fake Co', 'trial', 'active') ON CONFLICT (user_id) DO NOTHING;")

            is_whatsapp = 'TRUE' if row['contact_whatsapp'].lower() == 'true' else 'FALSE'
            posts_sql.append(f"INSERT INTO public.community_posts (id, user_id, post_type, status, origin_lat, origin_lng, origin_city, origin_country, dest_city, dest_country, dest_lat, dest_lng, template_key, metadata, contact_phone, contact_whatsapp, created_at, updated_at, expires_at, view_count, contact_count) VALUES ('{row['id']}', '{row['user_id']}', '{row['post_type']}', '{row['status']}', {row['origin_lat']}, {row['origin_lng']}, {escape_sql(row['origin_city'])}, {escape_sql(row['origin_country'])}, {escape_sql(row['dest_city'])}, {escape_sql(row['dest_country'])}, {row['dest_lat']}, {row['dest_lng']}, {escape_sql(row['template_key'])}, '{row['metadata']}', {escape_sql(row['contact_phone'])}, {is_whatsapp}, '{row['created_at']}', '{row['updated_at']}', '{row['expires_at']}', {row['view_count']}, {row['contact_count']}) ON CONFLICT (id) DO NOTHING;")

    with open('populate_test.sql', 'w', encoding='utf-8') as f:
        f.write("\n".join(users_sql) + "\n")
        f.write("\n".join(profiles_sql) + "\n")
        f.write("\n".join(posts_sql) + "\n")

if __name__ == "__main__":
    generate_batch_sql()
