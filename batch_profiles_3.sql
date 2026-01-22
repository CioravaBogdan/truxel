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
                    '6380f19d-83e8-43da-92b8-954374af6c74', 
                    'lisa.thomas54@example.com', 
                    'Lisa Thomas', 
                    'Thomas Trucking',
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
                    'b5b3d473-874b-47b7-b1f6-16287e7201e9', 
                    'david.johnson40@example.com', 
                    'David Johnson', 
                    'Johnson Carriers',
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
                    '736f73f9-9d8e-463e-8fdf-4094d60dc83b', 
                    'tom.wilson97@example.com', 
                    'Tom Wilson', 
                    'Wilson Trucking',
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
                    '38a4f5cd-998b-479e-be90-d051137ae694', 
                    'mike.smith75@example.com', 
                    'Mike Smith', 
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
                    '0368e968-a56c-4c42-81c6-6bd252dc583d', 
                    'jessica.smith64@example.com', 
                    'Jessica Smith', 
                    'Smith Shipping',
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
                    '9fe408ed-5b25-4bfa-93b0-a7242195a8ad', 
                    'emma.jackson75@example.com', 
                    'Emma Jackson', 
                    'Jackson Freight',
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
                    '0a1c0615-29ed-4a50-9ffa-5efa40d1b333', 
                    'john.brown47@example.com', 
                    'John Brown', 
                    'Brown Lines',
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
                    '995c8673-ffb6-444e-9b5d-ec6435c3a32c', 
                    'david.johnson58@example.com', 
                    'David Johnson', 
                    'Johnson Shipping',
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
                    'edb98a71-3e94-49af-9ec0-0ad49ebaa067', 
                    'jessica.jackson63@example.com', 
                    'Jessica Jackson', 
                    'Jackson Lines',
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
                    '0f41cce6-a1be-4ccf-aee2-627c522d2c74', 
                    'lisa.thomas12@example.com', 
                    'Lisa Thomas', 
                    'Thomas Carriers',
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
                    '85828621-95e7-4bd7-ad35-b8923813883f', 
                    'emma.smith73@example.com', 
                    'Emma Smith', 
                    'Smith Carriers',
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
                    'ba135b49-ef38-4833-962a-3355efb983c1', 
                    'john.jackson58@example.com', 
                    'John Jackson', 
                    'Jackson Shipping',
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
                    '84f25660-5dee-4fff-88c4-51c32844f188', 
                    'jessica.brown68@example.com', 
                    'Jessica Brown', 
                    'Brown Trucking',
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
                    '068556ae-8621-4b43-b119-8019c0a935b9', 
                    'john.brown94@example.com', 
                    'John Brown', 
                    'Brown Solutions',
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
                    'b33ceacf-32b1-4748-8422-98f67e0aba7f', 
                    'sarah.jackson14@example.com', 
                    'Sarah Jackson', 
                    'Jackson Lines',
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
                    '6ec22b06-984d-44a1-bc7d-4ed9254a9884', 
                    'lisa.smith86@example.com', 
                    'Lisa Smith', 
                    'Smith Haulage',
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
                    '2ff2eed8-0a1e-4465-9fd2-0f962b1036a4', 
                    'jessica.moore85@example.com', 
                    'Jessica Moore', 
                    'Moore Transport',
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
                    'ed59f643-3a4b-468a-829d-792d200b2214', 
                    'sarah.taylor45@example.com', 
                    'Sarah Taylor', 
                    'Taylor Solutions',
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
                    '1df14abc-3b11-4697-b829-98fc57f82085', 
                    'robert.thomas50@example.com', 
                    'Robert Thomas', 
                    'Thomas Lines',
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
                    'ef9e03c7-4ddb-4cd7-bc02-37503bacafdf', 
                    'jessica.smith37@example.com', 
                    'Jessica Smith', 
                    'Smith Express',
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
                    '850f8f85-a4b0-41e3-a122-4739ec58d2fa', 
                    'jane.anderson97@example.com', 
                    'Jane Anderson', 
                    'Anderson Transport',
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
                    '108cac40-8755-498c-8f67-bc8085c578f9', 
                    'jane.doe24@example.com', 
                    'Jane Doe', 
                    'Doe Solutions',
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
                    'dcf7efee-7c7c-4f91-9bae-e9ce464a1dd9', 
                    'jessica.brown67@example.com', 
                    'Jessica Brown', 
                    'Brown Freight',
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
                    'ff96bf5d-b616-40ec-abce-21014ec97c3d', 
                    'sarah.thomas59@example.com', 
                    'Sarah Thomas', 
                    'Thomas Freight',
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
                    'afd43784-b865-4568-be21-90b9889452da', 
                    'john.thomas93@example.com', 
                    'John Thomas', 
                    'Thomas Carriers',
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
                    '57796275-2b56-4de2-b2ab-5d96b394c65f', 
                    'john.brown76@example.com', 
                    'John Brown', 
                    'Brown Carriers',
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
                    '32344b19-97d6-423e-af30-6ed23b5f59fb', 
                    'tom.johnson35@example.com', 
                    'Tom Johnson', 
                    'Johnson Express',
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
                    'da05e715-382d-4d1d-97cf-8e1d85563eb2', 
                    'jessica.thomas71@example.com', 
                    'Jessica Thomas', 
                    'Thomas Freight',
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
                    '4b109f15-b79f-4493-a63e-726e5ce6b93a', 
                    'jessica.wilson93@example.com', 
                    'Jessica Wilson', 
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
                    '6ef5a481-fdb8-49a9-80eb-38498619201c', 
                    'sarah.jackson31@example.com', 
                    'Sarah Jackson', 
                    'Jackson Freight',
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
                    '8d83b33a-1ea0-46ce-9748-aee65004b8f5', 
                    'tom.moore72@example.com', 
                    'Tom Moore', 
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
                    'c4edb486-d92c-411c-95a7-cf2e6df29944', 
                    'emma.moore82@example.com', 
                    'Emma Moore', 
                    'Moore Trucking',
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
                    '70da139b-ed4c-4f19-ac6e-3c6f7efd2efc', 
                    'sarah.anderson52@example.com', 
                    'Sarah Anderson', 
                    'Anderson Solutions',
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
                    'a54f3888-9a5d-4b3a-97f3-2e8f30145528', 
                    'robert.wilson59@example.com', 
                    'Robert Wilson', 
                    'Wilson Haulage',
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
                    '4385c5c4-2544-41cd-8ee8-2c1b8b830f95', 
                    'mike.moore40@example.com', 
                    'Mike Moore', 
                    'Moore Carriers',
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
                    '5f84ef2c-b9ec-4c27-95de-8bc228302c94', 
                    'jane.jackson11@example.com', 
                    'Jane Jackson', 
                    'Jackson Trucking',
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
                    '71141975-98fd-42aa-8527-c84c2965753a', 
                    'tom.johnson42@example.com', 
                    'Tom Johnson', 
                    'Johnson Logistics',
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
                    '0c3df06b-f67a-436e-996f-593736ee4c35', 
                    'tom.moore10@example.com', 
                    'Tom Moore', 
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
                    '4cce49a1-21ec-4324-8ef0-6137ff461457', 
                    'lisa.smith39@example.com', 
                    'Lisa Smith', 
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
                    'd0c07870-579d-4aa2-ae00-235dc5731713', 
                    'lisa.taylor33@example.com', 
                    'Lisa Taylor', 
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
                    '071af515-5379-4513-86b2-a15a7291ba08', 
                    'robert.taylor20@example.com', 
                    'Robert Taylor', 
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
                    '88d15810-4a3a-4812-ab39-fdd664c8fdd3', 
                    'robert.doe21@example.com', 
                    'Robert Doe', 
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
                    'cd86f3a3-7bfb-42ed-8959-858202945a64', 
                    'jessica.smith35@example.com', 
                    'Jessica Smith', 
                    'Smith Haulage',
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
                    '6b8c37f8-b263-44f9-8b59-281aec6fea15', 
                    'robert.moore43@example.com', 
                    'Robert Moore', 
                    'Moore Logistics',
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
                    '6c9fd7e1-e9aa-433a-a5b1-e4697cb10235', 
                    'mike.moore91@example.com', 
                    'Mike Moore', 
                    'Moore Freight',
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
                    '612bdabf-fd4c-461d-947b-f2523e961efe', 
                    'john.moore36@example.com', 
                    'John Moore', 
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
                    'fd9297ea-0040-4001-9c65-145da05cf9a8', 
                    'mike.brown91@example.com', 
                    'Mike Brown', 
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
                    '6111029d-7480-4c22-9dd8-2b8549db8631', 
                    'sarah.doe39@example.com', 
                    'Sarah Doe', 
                    'Doe Trucking',
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
                    'dafa417b-81b1-4e70-acf7-d8a03cd40d1d', 
                    'robert.wilson55@example.com', 
                    'Robert Wilson', 
                    'Wilson Carriers',
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
                    'a96bd99e-a58d-4dae-a598-da7f40d65756', 
                    'jessica.thomas30@example.com', 
                    'Jessica Thomas', 
                    'Thomas Shipping',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                ) ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;