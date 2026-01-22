import re
import os
import json

# Valid User IDs fetched from production on 2025-01-22
VALID_USER_IDS = [
    "2590e03d-5871-482b-9603-db83a9963917", "172db8ec-f79a-4b22-a483-d0038cc66e1e", "43a31cda-f2dd-4a30-aebe-c50a0661fe18", "02c864ca-93ea-474e-b4a9-eab812a1307c",
    "c4b6c24f-3f49-49f2-9d79-152fcc4f7656", "ebc8d872-f31e-45d4-8031-b099af8920dc", "256fcebe-6c47-413b-8ceb-7cdcc2aedf61", "75754f61-309a-4f01-b777-cb303664085d",
    "4715f785-3b5f-4b8f-b504-7d7a2227d1d8", "46c7733c-7d25-4326-b63d-1deabf708de5", "202711ab-85b8-422a-bb4d-36790c301743", "4337c714-0fb6-477a-97c2-bfdeae5a549d",
    "ef7e3591-dda3-4d0d-8745-bbb7a06ddd4d", "29a3b269-c84b-4812-b7b3-9cb7ce5d0caf", "ee79fe6c-303f-45d4-8031-b099af8920dc", "705868e7-e80c-4252-8861-05f0ad7e6700",
    "31ff12f3-13a3-4ede-8504-42d91b353b85", "a61b6112-bec7-4f2c-aa37-89e0a7773b6f", "b62fe23e-cfe2-4af8-9b78-630d34e616ee", "4f17f734-11c7-4b04-ad2a-71c8fee923c7",
    "a8d7b5c7-f5a0-473b-84fd-ff999227f4ee", "f140ddf2-41bc-4aa4-9ae2-40dcca547702", "9d086936-a422-4375-ad56-27a1904ced14", "fb006d0a-e07a-4187-978a-e163ff58dd97",
    "6b998f84-0259-49cb-8dbf-02751336cd5d", "640d96eb-8b98-4223-8aa6-64b9b0f281a2", "d5a4b99b-4312-4ed8-8029-35335d9a848c", "57c9dd89-47d2-4ceb-be05-95d8dc7cb82e",
    "ffbb00ca-21d5-4c44-8c3f-8cc045e6341e", "638d110f-3c1c-4762-8b83-37fbc111f4e5", "858753d6-55b3-4aa5-9bca-27199d3f14ab", "ad4267bb-6658-412f-83f0-f94cee0e9411",
    "82bc624c-ac43-4474-9233-e7963ca6d35a", "de930aef-e802-4dba-8360-fb7fcd2ab4cc", "c2bc4b5e-1fd2-4a10-ba9b-8ad41a3e44ce", "8ba8ffbe-3528-4063-b9bd-45360115b181",
    "7b416389-ab7a-4ffc-94b2-c8cbd2af7d23", "4f0e90a8-3bfd-4bd5-bac6-dcbfa095ef38", "2bc4e542-c5b9-4668-8c24-06e54a73dafc", "ce86fbcf-4681-45eb-b58c-e69dbd35f109",
    "6e9369e0-2e05-4200-9dcc-8d7f6eeac7c6", "c1c526e9-e422-46c3-aec3-2e67f6f6e6d9", "7842aac3-7899-4e12-96e1-803a63a3a8d6", "c0ecdbfd-c406-49ce-b2b7-30aa3a3acf0f",
    "86e72b35-3b1b-4455-ae05-3ef5e0b62245", "56eb073f-ff14-4cd6-b38a-a4205eaac6d8", "0cdebfcd-17a2-48d7-b5dd-831904acdf4c", "253c74fa-cef5-469b-a242-8fbc6d805e37",
    "2d04fb56-6b47-4fc9-b28d-e227579a2d30", "b232b973-52f4-4a17-8da0-261300b48ea3", "fee16571-30b0-4bc5-9acd-a698ba52c527", "735e7747-7e54-44bd-b80f-50f8496f49a5",
    "be3e28c5-f5da-4101-b0b6-5ce58b116c56", "19a12fc6-3700-4a28-b0ac-8aebbb429ade", "9da408f2-c570-4b05-9efd-aa5ad7a9a6f7", "0d67fd31-1059-451b-8f62-f76b1ae18c87",
    "b43530b2-10b1-4396-bb14-c1f18e1e1961", "e4653c77-0672-44b9-af1f-d41221cd142d", "ddbded9b-24e6-48a1-8f8c-40dca771a621", "59e1519c-6753-4f79-b14e-67fe7fe1b991",
    "e2cf98ec-7141-4623-9cae-c01bda9c00bd", "93d7bd55-49f2-4320-bc93-93ac36994d89", "8c50b9b0-4f12-4734-a340-2f5f95235545", "9ef63f58-9d6a-4e7f-b60c-e4a8c63f58ff",
    "9c38fc97-38f4-4db8-92e3-a8eea1896ed1", "6398f75a-9378-4e7d-bf93-d38d4e246d0f", "9d6dafed-c87f-40b3-94fd-6af087532ee3", "3e6b1b97-ed03-4f65-a4e3-81cdd3d404a2",
    "3ce1dd6a-0a6e-416d-baa2-a15424c05413", "08cf3b7c-327f-4ddd-af6f-b04e0a220056", "906a8779-bd7c-4adb-9b20-912e12eefef9", "655fbd17-43bf-4ebf-bbf6-59e2f2af9b7d",
    "62d6e19c-0455-401d-ae54-89c6ae8eefc5", "d2e17292-feb6-40eb-99ed-928269e0188b", "b5c8045d-f07e-489e-ac13-0f6d460034ce", "1aeb84e9-74bd-4b2f-b2ac-7b151462076b",
    "fd37a389-be3c-42c3-8a15-fdb11b2a0f71", "52834ebc-d57c-47ca-b926-32a6614f18e3", "4b1acd29-495b-4e17-aee7-4fef8a87e7c9", "a4972f66-66a8-418d-b20a-71fa2d34f262",
    "4e4a13d9-1ebc-4481-a765-1ee0724e69d8", "d12b7a17-e15a-4128-a562-78f5c29398ea", "0e8a3571-d364-4ce5-9a07-d464e7b18c91", "4c23f348-810b-410b-a088-a687ec733eae",
    "66e2071f-cecd-4437-9168-f1e6b0546a06", "dea456dc-776e-43c8-9e49-edb0c1cea4f1", "17766136-5157-465a-aa49-c62790520f6f", "9c20a267-18ba-4652-93bd-23d45c428df2",
    "e43fe466-7feb-4361-8105-b43c5c01dc4e", "ffd954f7-01e6-4b06-8b90-e903729b07e6", "93716344-44f8-4963-8cea-8cfa2623e527", "939b3665-e2ee-479c-9463-934fd1f8e55f",
    "c98ca671-ec51-4f09-85a4-5160a84fc05c", "ee6a3623-690f-4fdb-b849-ed726f53f2f0", "8b6b119d-ddc9-4ff1-a50e-66ba0ba885d8", "3a765e7d-493f-463b-8a31-946c451fa6ca",
    "7147d92f-c2f9-4314-ba36-a1cff23657a9", "cc48f23c-0440-4068-afa2-95e4f5be5c09", "e8a12493-a0b7-4deb-8016-25dfe4a0da55", "b302c75a-b8dc-47c0-bfe3-fc452e0949df"
]

def fix_batch_file(batch_number, start_user_index=0):
    input_filename = f"batch_posts_{batch_number}_fixed.sql"
    output_filename = f"batch_posts_{batch_number}_valid_users.sql"
    
    if not os.path.exists(input_filename):
        print(f"File {input_filename} not found.")
        return start_user_index

    with open(input_filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into individual INSERT statements
    statements = content.split(';')
    
    new_statements = []
    current_user_index = start_user_index

    for stmt in statements:
        if not stmt.strip():
            continue
            
        # Regex to capture the SELECT block content BEFORE the "FROM auth.users"
        match = re.search(r'(INSERT INTO .*? SELECT\s+)(.*?)(?:\s+FROM\s+auth\.users)', stmt, re.DOTALL | re.IGNORECASE)
        
        if match:
            insert_part = match.group(1)
            select_columns = match.group(2)
            
            # Get next valid user ID
            user_id = VALID_USER_IDS[current_user_index % len(VALID_USER_IDS)]
            current_user_index += 1
            
            # Replace auth.users.id with the literal UUID
            fixed_columns = select_columns.replace('auth.users.id', f"'{user_id}'")
            
            # Reconstruct the statement without the FROM clause
            new_stmt = f"{insert_part}{fixed_columns}\n"
            new_statements.append(new_stmt)
        else:
            if 'auth.users.id' in stmt:
                 user_id = VALID_USER_IDS[current_user_index % len(VALID_USER_IDS)]
                 current_user_index += 1
                 
                 # Remove FROM clause
                 stmt_cleaned = re.sub(r'FROM\s+auth\.users\s+WHERE\s+email\s*=\s*\'[^\']+\'', '', stmt, flags=re.IGNORECASE)
                 stmt_fixed = stmt_cleaned.replace('auth.users.id', f"'{user_id}'")
                 new_statements.append(stmt_fixed)
            else:
                 new_statements.append(stmt)

    # Write output
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(';\n'.join(new_statements) + ';\n')
    
    print(f"Generated {output_filename}")
    return current_user_index

# Run for all batches
next_user_idx = 0
for i in range(1, 10):
    next_user_idx = fix_batch_file(i, next_user_idx)
