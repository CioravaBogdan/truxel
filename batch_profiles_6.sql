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
                    '4b01747f-dbb8-4f82-a238-02f466895c20', 
                    'tom.smith22@example.com', 
                    'Tom Smith', 
                    'Smith Trucking',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'fdb369d3-7160-47ac-96fe-c34c67732147', 
                    'emma.anderson74@example.com', 
                    'Emma Anderson', 
                    'Anderson Shipping',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '308b4a85-3634-41b4-af3f-216c2232a112', 
                    'john.jackson21@example.com', 
                    'John Jackson', 
                    'Jackson Haulage',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'd71b3023-36f7-49a5-8fd6-f20845c23417', 
                    'tom.doe88@example.com', 
                    'Tom Doe', 
                    'Doe Lines',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '29b85d29-8a32-4959-af5b-d81848c9167c', 
                    'sarah.johnson79@example.com', 
                    'Sarah Johnson', 
                    'Johnson Express',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'a8a43b97-100a-45ad-bf84-d7ab1f446c03', 
                    'john.wilson73@example.com', 
                    'John Wilson', 
                    'Wilson Shipping',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '684fb28a-d4e2-496a-8e4d-75ec6a1b1bc2', 
                    'robert.anderson42@example.com', 
                    'Robert Anderson', 
                    'Anderson Freight',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'cc808e07-3ee3-41c1-869f-49d25aa2c0ef', 
                    'jane.moore42@example.com', 
                    'Jane Moore', 
                    'Moore Express',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '9031761b-f36d-43a7-8d0d-7fba3c268c14', 
                    'tom.johnson29@example.com', 
                    'Tom Johnson', 
                    'Johnson Shipping',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'f8388ead-ea2a-4019-abb8-323725ae0419', 
                    'jane.smith44@example.com', 
                    'Jane Smith', 
                    'Smith Lines',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '3203fb48-a200-461e-8629-7a0745b04cc4', 
                    'david.thomas19@example.com', 
                    'David Thomas', 
                    'Thomas Haulage',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '80b8f09c-a78f-4724-9152-48ff00e1d6c7', 
                    'jane.wilson82@example.com', 
                    'Jane Wilson', 
                    'Wilson Carriers',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'eef00239-7bd5-42a2-8bc9-5b22777d279a', 
                    'robert.jackson15@example.com', 
                    'Robert Jackson', 
                    'Jackson Shipping',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '476fc42b-d98b-4382-becc-3f3c2ca32a68', 
                    'lisa.moore29@example.com', 
                    'Lisa Moore', 
                    'Moore Express',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '836f8f39-62a0-40ee-b254-8319536fae73', 
                    'sarah.taylor72@example.com', 
                    'Sarah Taylor', 
                    'Taylor Transport',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '1f1e311a-f1f0-4adf-ade8-5ad8370c7da9', 
                    'emma.thomas71@example.com', 
                    'Emma Thomas', 
                    'Thomas Shipping',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'dfc122ee-0d82-47d3-a503-7dc36fe8cbb6', 
                    'mike.taylor61@example.com', 
                    'Mike Taylor', 
                    'Taylor Freight',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'fe22ae05-18b2-4e66-a5f4-08359b108a5c', 
                    'mike.moore21@example.com', 
                    'Mike Moore', 
                    'Moore Carriers',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'faca9f35-deca-4b8c-b9c6-70c18a5275ff', 
                    'jessica.thomas90@example.com', 
                    'Jessica Thomas', 
                    'Thomas Logistics',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '2ed51bef-d0cc-4351-bd41-134a7b776f81', 
                    'tom.jackson24@example.com', 
                    'Tom Jackson', 
                    'Jackson Solutions',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '685998f3-9c26-43a7-8be0-700f14826847', 
                    'mike.moore17@example.com', 
                    'Mike Moore', 
                    'Moore Shipping',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '1d717b72-176e-4a0a-8880-231452e90550', 
                    'tom.anderson86@example.com', 
                    'Tom Anderson', 
                    'Anderson Carriers',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '5f105a10-8b16-4c51-a3b0-5a2e432f52d3', 
                    'robert.jackson11@example.com', 
                    'Robert Jackson', 
                    'Jackson Lines',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'f4cc7d52-e2df-4822-adbf-42bf3a19e717', 
                    'jessica.thomas52@example.com', 
                    'Jessica Thomas', 
                    'Thomas Express',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'f8d744c0-7bf9-4bcd-a859-811a406225f0', 
                    'david.wilson56@example.com', 
                    'David Wilson', 
                    'Wilson Logistics',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '4f37ec1b-d06b-4df8-9c48-238a0583102c', 
                    'david.moore65@example.com', 
                    'David Moore', 
                    'Moore Transport',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '1d3d17cb-47ce-46a4-b46e-54850a6e6e65', 
                    'lisa.taylor40@example.com', 
                    'Lisa Taylor', 
                    'Taylor Freight',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'e1c19c78-24b8-4489-9c26-88dddcf36305', 
                    'emma.anderson93@example.com', 
                    'Emma Anderson', 
                    'Anderson Trucking',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'bef989bb-4638-4470-805e-5f3dbf797479', 
                    'john.thomas54@example.com', 
                    'John Thomas', 
                    'Thomas Shipping',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'be216e25-c220-4a55-9c48-7ccae32c578e', 
                    'lisa.jackson64@example.com', 
                    'Lisa Jackson', 
                    'Jackson Freight',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '90e99108-53df-4a1f-bd1f-27a72b83f8e4', 
                    'lisa.doe86@example.com', 
                    'Lisa Doe', 
                    'Doe Freight',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '845f4039-3841-49a6-9f44-5b5cd3b57747', 
                    'lisa.johnson50@example.com', 
                    'Lisa Johnson', 
                    'Johnson Shipping',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '20c894aa-eda5-4cc8-8f79-238eb739ff31', 
                    'lisa.wilson56@example.com', 
                    'Lisa Wilson', 
                    'Wilson Express',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '81c0e702-993b-4e01-b502-1afb6966cc15', 
                    'john.smith45@example.com', 
                    'John Smith', 
                    'Smith Solutions',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '22133812-bac8-4574-805d-ae0958d95990', 
                    'jane.brown70@example.com', 
                    'Jane Brown', 
                    'Brown Logistics',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'e7fc0d44-2c72-4e88-be5c-60ffb5d5f2a0', 
                    'john.brown43@example.com', 
                    'John Brown', 
                    'Brown Lines',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '9666887e-8bd7-48c4-8645-d242fe1253d7', 
                    'john.taylor40@example.com', 
                    'John Taylor', 
                    'Taylor Shipping',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'c4c521bb-f9a7-4c62-9bb9-e35024e17ae4', 
                    'jessica.brown79@example.com', 
                    'Jessica Brown', 
                    'Brown Lines',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '1d551c87-bd50-4bf1-a350-3e102323c468', 
                    'jane.anderson82@example.com', 
                    'Jane Anderson', 
                    'Anderson Transport',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'df53985d-8f88-445d-8f74-156029468954', 
                    'tom.doe68@example.com', 
                    'Tom Doe', 
                    'Doe Carriers',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'ae577db5-5de4-432a-a64c-ff0ca94289cd', 
                    'jessica.smith34@example.com', 
                    'Jessica Smith', 
                    'Smith Express',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '1e00cb18-9462-4d29-bf8c-077d26f075b8', 
                    'mike.moore15@example.com', 
                    'Mike Moore', 
                    'Moore Shipping',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '71e2026a-fe47-46d5-9f2d-cdc01af89f1f', 
                    'david.taylor55@example.com', 
                    'David Taylor', 
                    'Taylor Solutions',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '01cf6a9f-211f-4c3e-be66-8e7151feec0c', 
                    'robert.moore63@example.com', 
                    'Robert Moore', 
                    'Moore Carriers',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'b1989cec-4c41-49d9-b084-5f3a3b49ba6b', 
                    'john.doe43@example.com', 
                    'John Doe', 
                    'Doe Express',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '3c1f1f3d-715e-4801-97a6-f70323a31f79', 
                    'emma.taylor51@example.com', 
                    'Emma Taylor', 
                    'Taylor Freight',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '0107224e-6465-460f-b313-221dbd58cdc9', 
                    'jane.wilson45@example.com', 
                    'Jane Wilson', 
                    'Wilson Solutions',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '3482f56c-0cc3-47d0-9954-7dbf9e0bed5f', 
                    'emma.jackson62@example.com', 
                    'Emma Jackson', 
                    'Jackson Carriers',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    'adf2067e-15ce-42cc-ab83-c55626adc9ed', 
                    'john.jackson31@example.com', 
                    'John Jackson', 
                    'Jackson Shipping',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;
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
                    '70a36451-3df8-45a5-b23e-7929dc5e43aa', 
                    'jessica.thomas60@example.com', 
                    'Jessica Thomas', 
                    'Thomas Lines',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;