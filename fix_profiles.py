import re
import os

# Process files batch_profiles_1.sql to batch_profiles_9.sql
for i in range(1, 10):
    input_filename = f"batch_profiles_{i}.sql"
    output_filename = f"batch_profiles_{i}_fixed.sql"
    
    if not os.path.exists(input_filename):
        print(f"Skipping {input_filename}, not found.")
        continue

    print(f"Processing {input_filename}...")
    
    with open(input_filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find the INSERT structure
    # We look for VALUES ( ... )
    # structure:
    # VALUES (
    #    gen_random_uuid(),
    #    'USER_ID', 
    #    'EMAIL', 
    #    REMAINING_VALUES...
    # ) ON CONFLICT
    
    # We want to replace it with:
    # SELECT
    #    gen_random_uuid(),
    #    auth.users.id,
    #    auth.users.email,
    #    REMAINING_VALUES...
    # FROM auth.users WHERE email = 'EMAIL'
    # ON CONFLICT
    
    pattern = re.compile(
        r"VALUES \(\s*gen_random_uuid\(\),\s*'([0-9a-fA-F-]+)',\s*'([^']+)',\s*(.*?)\s*\) ON CONFLICT", 
        re.DOTALL
    )
    
    def replacer(match):
        old_uuid = match.group(1)
        email = match.group(2)
        remaining = match.group(3) # This contains full_name, company_name etc.
        
        # Construct the SELECT statement
        # Note: We must be careful about quoting for remaining values, they are already quoted in source.
        
        replacement = f"""SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    {remaining}
                FROM auth.users WHERE email = '{email}'
                ON CONFLICT"""
        return replacement

    new_content = pattern.sub(replacer, content)
    
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Created {output_filename}")

print("Done.")
