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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'John Jackson', 
                    'Jackson Solutions',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'john.jackson68@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Sarah Jackson', 
                    'Jackson Solutions',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'sarah.jackson81@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Mike Thomas', 
                    'Thomas Shipping',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.thomas59@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'David Smith', 
                    'Smith Trucking',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.smith94@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Emma Brown', 
                    'Brown Carriers',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'emma.brown20@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Sarah Wilson', 
                    'Wilson Lines',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'sarah.wilson28@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Emma Johnson', 
                    'Johnson Trucking',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'emma.johnson30@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Mike Brown', 
                    'Brown Trucking',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.brown19@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Robert Thomas', 
                    'Thomas Transport',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'robert.thomas50@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Sarah Jackson', 
                    'Jackson Express',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'sarah.jackson59@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Mike Thomas', 
                    'Thomas Transport',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.thomas49@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Mike Doe', 
                    'Doe Lines',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.doe90@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Mike Taylor', 
                    'Taylor Lines',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.taylor77@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Sarah Smith', 
                    'Smith Transport',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'sarah.smith15@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Jane Johnson', 
                    'Johnson Express',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jane.johnson10@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Emma Moore', 
                    'Moore Shipping',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'emma.moore18@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Jessica Johnson', 
                    'Johnson Trucking',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jessica.johnson24@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'John Moore', 
                    'Moore Lines',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'john.moore33@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Jessica Thomas', 
                    'Thomas Trucking',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jessica.thomas87@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'John Doe', 
                    'Doe Haulage',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'john.doe15@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Emma Anderson', 
                    'Anderson Haulage',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'emma.anderson63@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Tom Brown', 
                    'Brown Shipping',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.brown64@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Tom Anderson', 
                    'Anderson Carriers',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.anderson71@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Tom Thomas', 
                    'Thomas Carriers',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.thomas26@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'David Moore', 
                    'Moore Logistics',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.moore76@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'John Jackson', 
                    'Jackson Express',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'john.jackson55@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'David Smith', 
                    'Smith Lines',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.smith79@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Sarah Brown', 
                    'Brown Shipping',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'sarah.brown57@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'David Jackson', 
                    'Jackson Trucking',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.jackson96@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Mike Jackson', 
                    'Jackson Trucking',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.jackson16@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Mike Wilson', 
                    'Wilson Transport',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.wilson26@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Emma Moore', 
                    'Moore Lines',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'emma.moore92@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Tom Thomas', 
                    'Thomas Carriers',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.thomas26@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Lisa Anderson', 
                    'Anderson Solutions',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'lisa.anderson46@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Lisa Jackson', 
                    'Jackson Trucking',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'lisa.jackson40@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Mike Doe', 
                    'Doe Trucking',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.doe40@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Lisa Brown', 
                    'Brown Transport',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'lisa.brown74@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Jessica Taylor', 
                    'Taylor Transport',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jessica.taylor32@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Robert Moore', 
                    'Moore Express',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'robert.moore33@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Mike Thomas', 
                    'Thomas Freight',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.thomas51@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Mike Jackson', 
                    'Jackson Shipping',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.jackson63@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'David Taylor', 
                    'Taylor Trucking',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.taylor27@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'David Jackson', 
                    'Jackson Haulage',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.jackson66@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Robert Brown', 
                    'Brown Logistics',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'robert.brown43@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'John Jackson', 
                    'Jackson Shipping',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'john.jackson55@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Sarah Smith', 
                    'Smith Freight',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'sarah.smith71@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Sarah Brown', 
                    'Brown Shipping',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'sarah.brown96@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Lisa Jackson', 
                    'Jackson Shipping',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'lisa.jackson89@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Robert Moore', 
                    'Moore Lines',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'robert.moore13@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
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
                ) SELECT
                    gen_random_uuid(),
                    auth.users.id, 
                    auth.users.email, 
                    'Emma Thomas', 
                    'Thomas Freight',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'emma.thomas18@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;