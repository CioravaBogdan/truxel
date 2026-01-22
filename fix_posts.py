import re
import os

def load_user_map():
    uuid_map = {} # Old UUID -> Email
    
    # Process all profiles batch files
    for i in range(1, 10):
        filename = f"batch_profiles_{i}.sql"
        print(f"Reading {filename}...")
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Regex to find UUID and Email in profiles
            # VALUES (gen_random_uuid(), 'UUID', 'EMAIL', ...
            matches = re.findall(r"VALUES\s*\(\s*gen_random_uuid\(\),\s*'([0-9a-fA-F-]+)',\s*'([^']+)'", content)
            
            for uuid, email in matches:
                uuid_map[uuid] = email
                
            print(f"  Found {len(matches)} mappings in {filename}")
            
        except FileNotFoundError:
            print(f"  Warning: {filename} not found")

    return uuid_map

def fix_posts(uuid_map):
    for i in range(1, 10):
        in_file = f"batch_posts_{i}.sql"
        out_file = f"batch_posts_{i}_fixed.sql"
        
        print(f"Processing {in_file} -> {out_file}...")
        
        try:
            with open(in_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Pattern: 
            # INSERT INTO public.community_posts (...) VALUES (
            #    gen_random_uuid(),
            #    'OLD_UUID',
            #    ...
            # )
            
            # We want to replace this structure with INSERT INTO ... SELECT ...
            
            # First, let's identify the blocks.
            # Using regex to capture the whole VALUES block is tricky across lines.
            # But the structure is repetitive.
            
            # Splitting by "INSERT INTO" might be safer.
            statements = content.split("INSERT INTO public.community_posts")
            
            new_content = []
            
            # The first chunk might be empty or comments
            if statements[0].strip():
                new_content.append(statements[0])
            
            count = 0
            for stmt in statements[1:]:
                # Re-add the split string
                stmt_full = "INSERT INTO public.community_posts" + stmt
                
                # Extract the Old UUID
                # It is the second argument in VALUES
                match = re.search(r"VALUES\s*\(\s*gen_random_uuid\(\),\s*'([0-9a-fA-F-]+)',", stmt_full)
                
                if match:
                    old_uuid = match.group(1)
                    email = uuid_map.get(old_uuid)
                    
                    if email:
                        # Replace VALUES (...) with SELECT ...
                        
                        # Find the start of VALUES
                        values_idx = stmt_full.find("VALUES (")
                        if values_idx == -1:
                             # Fallback for spacing
                             values_idx = stmt_full.find("VALUES(")
                        
                        if values_idx != -1:
                            header = stmt_full[:values_idx]
                            
                            # Extract the rest of the values after the UUID
                            # The match end gives us the position after 'UUID',
                            # VALUES (gen_random_uuid(), 'UUID',
                            rest_of_values_start = match.end()
                            
                            # The rest of the string contains the other values and closing );
                            rest_of_values = stmt_full[rest_of_values_start:]
                            
                            # We need to strip the final ); and maybe the closest ) if it's nested (unlikely here)
                            # Actually, SQL structure here is simple.
                            # rest_of_values starts with specific params.
                            
                            # Let's construct the SELECT
                            # SELECT gen_random_uuid(), auth.users.id, [REST OF VALUES] FROM auth.users WHERE email = '...'
                            
                            # But wait, the [REST OF VALUES] contains text values enclosed in quotes, numbers, etc.
                            # We can keep them as is.
                            
                            # The 'rest_of_values' string starts with something like:
                            #   'DRIVER_AVAILABLE',
                            #   'active',
                            #   ...
                            #   );
                            
                            # We just need to replace the last ); with a WHERE clause
                            # But replacing the last ); with FROM... is tricky if there are multiple ); in json inputs.
                            # However, the INSERT is one statement per post (based on previous files).
                            
                            # Let's look at the end of the statement.
                            # It usually ends with );\n
                            
                            last_paren_idx = rest_of_values.rfind(");")
                            if last_paren_idx != -1:
                                values_data = rest_of_values[:last_paren_idx] # Everything up to the final );
                                
                                new_stmt = f"""{header} SELECT
                gen_random_uuid(),
                auth.users.id,
                {values_data}
            FROM auth.users WHERE email = '{email}';
"""
                                new_content.append(new_stmt)
                                count += 1
                            else:
                                print(f"    Error parsing end of statement for UUID {old_uuid}")
                                new_content.append(stmt_full) # Keep original if parse fail
                        else:
                             print(f"    Error finding VALUES for UUID {old_uuid}")
                             new_content.append(stmt_full)
                    else:
                        print(f"    Warning: No email found for UUID {old_uuid}")
                        new_content.append(stmt_full)
                else:
                    # Could not match UUID pattern
                    new_content.append(stmt_full)
                    
            print(f"  Fixed {count} posts in {out_file}")
            
            with open(out_file, 'w', encoding='utf-8') as f:
                f.write("".join(new_content))
                
        except FileNotFoundError:
            print(f"  Warning: {in_file} not found")

if __name__ == "__main__":
    print("Loading user map...")
    m = load_user_map()
    print(f"Loaded {len(m)} users.")
    fix_posts(m)
