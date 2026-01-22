import os

def chunk_file(filename, output_prefix, set_size=50):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    statements = content.split(';')
    statements = [s.strip() + ';' for s in statements if s.strip()]
    
    print(f"Found {len(statements)} statements in {filename}")
    
    for i in range(0, len(statements), set_size):
        chunk = statements[i:i+set_size]
        chunk_sql = "\n".join(chunk)
        out_name = f"{output_prefix}_{i//set_size + 1}.sql"
        with open(out_name, 'w', encoding='utf-8') as out:
            out.write(chunk_sql)
        print(f"Created {out_name} with {len(chunk)} statements")

if __name__ == "__main__":
    if os.path.exists('populate_users.sql'):
        chunk_file('populate_users.sql', 'batch_users')
    if os.path.exists('populate_profiles.sql'):
        chunk_file('populate_profiles.sql', 'batch_profiles')
    if os.path.exists('populate_posts.sql'):
        chunk_file('populate_posts.sql', 'batch_posts')
