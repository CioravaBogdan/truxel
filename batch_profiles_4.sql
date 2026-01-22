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
                    '86e72b35-3b1b-4455-ae05-3ef5e0b62245', 
                    'jessica.doe67@example.com', 
                    'Jessica Doe', 
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
                    '2d04fb56-6b47-4fc9-b28d-e227579a2d30', 
                    'jessica.smith79@example.com', 
                    'Jessica Smith', 
                    'Smith Freight',
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
                    'b232b973-52f4-4a17-8da0-261300b48ea3', 
                    'tom.brown87@example.com', 
                    'Tom Brown', 
                    'Brown Haulage',
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
                    '735e7747-7e54-44bd-b80f-50f8496f49a5', 
                    'tom.smith84@example.com', 
                    'Tom Smith', 
                    'Smith Solutions',
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
                    '906a8779-bd7c-4adb-9b20-912e12eefef9', 
                    'robert.thomas13@example.com', 
                    'Robert Thomas', 
                    'Thomas Haulage',
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
                    '655fbd17-43bf-4ebf-bbf6-59e2f2af9b7d', 
                    'emma.taylor49@example.com', 
                    'Emma Taylor', 
                    'Taylor Solutions',
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
                    '62d6e19c-0455-401d-ae54-89c6ae8eefc5', 
                    'robert.jackson39@example.com', 
                    'Robert Jackson', 
                    'Jackson Shipping',
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
                    'd2e17292-feb6-40eb-99ed-928269e0188b', 
                    'john.anderson68@example.com', 
                    'John Anderson', 
                    'Anderson Shipping',
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
                    '7147d92f-c2f9-4314-ba36-a1cff23657a9', 
                    'sarah.wilson44@example.com', 
                    'Sarah Wilson', 
                    'Wilson Express',
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
                    'cc48f23c-0440-4068-afa2-95e4f5be5c09', 
                    'robert.smith15@example.com', 
                    'Robert Smith', 
                    'Smith Transport',
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
                    'e8a12493-a0b7-4deb-8016-25dfe4a0da55', 
                    'jessica.smith19@example.com', 
                    'Jessica Smith', 
                    'Smith Solutions',
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
                    '989dee1e-d5ca-4a20-a2a9-fc0a26bb8eae', 
                    'emma.anderson94@example.com', 
                    'Emma Anderson', 
                    'Anderson Lines',
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
                    '7f68de7e-d051-4bb2-95a6-94416379337f', 
                    'tom.anderson87@example.com', 
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
                    '6c8cd568-9b05-465d-bbbe-2dbed3478891', 
                    'jessica.smith12@example.com', 
                    'Jessica Smith', 
                    'Smith Shipping',
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
                    '412447e7-07a9-4432-b9de-9588a493860f', 
                    'mike.taylor81@example.com', 
                    'Mike Taylor', 
                    'Taylor Lines',
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
                    'ecb8b81b-0222-4031-ad6b-2b7b873e2c36', 
                    'jane.doe53@example.com', 
                    'Jane Doe', 
                    'Doe Logistics',
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
                    '8f9f62a5-b255-413b-b976-b3e1f3837481', 
                    'david.smith44@example.com', 
                    'David Smith', 
                    'Smith Solutions',
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
                    '7dc2bd4d-9ae1-4129-afe5-6914bc491786', 
                    'lisa.wilson82@example.com', 
                    'Lisa Wilson', 
                    'Wilson Solutions',
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
                    'fa4b6006-2d46-4ccb-b9f0-a31f6450220a', 
                    'jessica.moore29@example.com', 
                    'Jessica Moore', 
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
                    '494ae31e-b1b2-416b-8546-44493902b340', 
                    'robert.smith10@example.com', 
                    'Robert Smith', 
                    'Smith Trucking',
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
                    'c132344f-6b59-4cb6-8dc5-68f0d4a453a7', 
                    'mike.doe37@example.com', 
                    'Mike Doe', 
                    'Doe Transport',
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
                    '59efd10d-1473-4ce3-a415-809125c77ccc', 
                    'jessica.taylor79@example.com', 
                    'Jessica Taylor', 
                    'Taylor Freight',
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
                    '3aa3fc4d-96a0-48d9-a6e4-132b8ccd0d0f', 
                    'mike.johnson99@example.com', 
                    'Mike Johnson', 
                    'Johnson Haulage',
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
                    '178a4361-00dc-4533-9836-9007a3ce0f39', 
                    'jessica.moore14@example.com', 
                    'Jessica Moore', 
                    'Moore Carriers',
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
                    '2948fada-6902-4f15-b317-d31eb11ffdee', 
                    'emma.jackson77@example.com', 
                    'Emma Jackson', 
                    'Jackson Lines',
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
                    '275809c5-43c8-4e3f-a976-b35f23ae675e', 
                    'sarah.anderson96@example.com', 
                    'Sarah Anderson', 
                    'Anderson Freight',
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
                    'fd30b9a3-dab2-4076-9795-4d3fe9335b11', 
                    'mike.anderson53@example.com', 
                    'Mike Anderson', 
                    'Anderson Freight',
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
                    'd8b5117a-c5a6-44ab-b38f-00f82f3ee56b', 
                    'robert.brown55@example.com', 
                    'Robert Brown', 
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
                    'ffd9af36-5bc7-4934-aece-183c34290c25', 
                    'john.brown44@example.com', 
                    'John Brown', 
                    'Brown Haulage',
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
                    '94ef5323-029c-47c3-8fd6-959e2902e476', 
                    'john.brown40@example.com', 
                    'John Brown', 
                    'Brown Trucking',
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
                    'fdd27a69-b338-46b2-acbe-c0410eada1cf', 
                    'sarah.doe16@example.com', 
                    'Sarah Doe', 
                    'Doe Shipping',
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
                    '5fec168c-0de4-4200-bfdd-0dbe831f6e3d', 
                    'jessica.johnson38@example.com', 
                    'Jessica Johnson', 
                    'Johnson Carriers',
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
                    '468ad0b2-596a-45d0-9f10-65d361fd9c01', 
                    'mike.doe26@example.com', 
                    'Mike Doe', 
                    'Doe Logistics',
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
                    'e3d50f48-9f55-40cf-abd4-fd0a61607152', 
                    'sarah.jackson71@example.com', 
                    'Sarah Jackson', 
                    'Jackson Express',
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
                    '7fe5c961-56ff-4d8b-ab87-e12cde96be8a', 
                    'emma.thomas72@example.com', 
                    'Emma Thomas', 
                    'Thomas Logistics',
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
                    '19794ceb-8b2b-4b46-a39e-f0e2d0f44b85', 
                    'mike.brown87@example.com', 
                    'Mike Brown', 
                    'Brown Transport',
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
                    'cc4b98e8-a525-42a2-8cd9-1f662cef6fb1', 
                    'jane.wilson11@example.com', 
                    'Jane Wilson', 
                    'Wilson Lines',
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
                    'bd3c4790-2ee1-471c-a05a-9540e2f8f518', 
                    'jessica.jackson95@example.com', 
                    'Jessica Jackson', 
                    'Jackson Express',
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
                    '6cf3a51b-4744-4e1c-b603-0c1af2101e55', 
                    'sarah.brown80@example.com', 
                    'Sarah Brown', 
                    'Brown Transport',
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
                    'e0bdda92-a587-4133-9170-f530afdd25a1', 
                    'jane.smith64@example.com', 
                    'Jane Smith', 
                    'Smith Haulage',
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
                    'c413d611-039c-408c-a987-202d0deb7675', 
                    'jane.smith81@example.com', 
                    'Jane Smith', 
                    'Smith Transport',
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
                    '2a46fe4c-91fc-454c-95d2-7ca84de31032', 
                    'robert.anderson41@example.com', 
                    'Robert Anderson', 
                    'Anderson Carriers',
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
                    '2b07a001-0b26-4b96-95f3-deb798e968c0', 
                    'jane.brown54@example.com', 
                    'Jane Brown', 
                    'Brown Lines',
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
                    'a2e5d708-7aa7-453a-bdac-ff35c6c5a292', 
                    'mike.johnson67@example.com', 
                    'Mike Johnson', 
                    'Johnson Trucking',
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
                    '8590a4dd-28b7-4d33-b145-4fd4051f0ada', 
                    'lisa.moore65@example.com', 
                    'Lisa Moore', 
                    'Moore Haulage',
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
                    '4b787e02-f610-4c41-8272-262c8fc2829a', 
                    'tom.brown59@example.com', 
                    'Tom Brown', 
                    'Brown Logistics',
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
                    '18d9748f-ca9f-448b-8d14-72f4b49baab9', 
                    'jessica.moore35@example.com', 
                    'Jessica Moore', 
                    'Moore Lines',
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
                    '3e208ada-9d9d-4d7b-bef1-f691e89c786e', 
                    'john.anderson90@example.com', 
                    'John Anderson', 
                    'Anderson Logistics',
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
                    'ff0d8a4c-4820-4fbe-804a-88c4a3858e1b', 
                    'jessica.smith23@example.com', 
                    'Jessica Smith', 
                    'Smith Haulage',
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
                    'a86098fd-7727-433a-958b-6daeec41caff', 
                    'mike.brown95@example.com', 
                    'Mike Brown', 
                    'Brown Transport',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;