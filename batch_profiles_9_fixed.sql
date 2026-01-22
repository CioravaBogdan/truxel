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
                    'Brown Transport',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.brown80@example.com'
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
                    'Brown Lines',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.brown20@example.com'
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
                    'Tom Wilson', 
                    'Wilson Logistics',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.wilson16@example.com'
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
                    'Anderson Solutions',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'emma.anderson71@example.com'
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
                    'Taylor Trucking',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jessica.taylor58@example.com'
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
                    'David Brown', 
                    'Brown Transport',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.brown41@example.com'
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
                    'David Brown', 
                    'Brown Solutions',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.brown31@example.com'
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
                    'John Brown', 
                    'Brown Express',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'john.brown35@example.com'
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
                    'Robert Wilson', 
                    'Wilson Shipping',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'robert.wilson52@example.com'
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
                    'Emma Doe', 
                    'Doe Express',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'emma.doe13@example.com'
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
                    'Jane Jackson', 
                    'Jackson Haulage',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jane.jackson45@example.com'
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
                    'Tom Johnson', 
                    'Johnson Transport',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.johnson71@example.com'
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
                    'Jane Brown', 
                    'Brown Carriers',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jane.brown63@example.com'
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
                FROM auth.users WHERE email = 'sarah.jackson35@example.com'
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
                    'Taylor Haulage',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jessica.taylor91@example.com'
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
                    'David Brown', 
                    'Brown Logistics',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.brown85@example.com'
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
                    'Jane Doe', 
                    'Doe Express',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jane.doe51@example.com'
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
                    'John Wilson', 
                    'Wilson Solutions',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'john.wilson53@example.com'
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
                FROM auth.users WHERE email = 'david.taylor93@example.com'
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
                    'Wilson Freight',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'sarah.wilson91@example.com'
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
                    'Emma Wilson', 
                    'Wilson Freight',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'emma.wilson69@example.com'
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
                    'David Johnson', 
                    'Johnson Transport',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.johnson60@example.com'
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
                    'Robert Wilson', 
                    'Wilson Shipping',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'robert.wilson86@example.com'
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
                    'Emma Wilson', 
                    'Wilson Express',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'emma.wilson27@example.com'
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
                    'Jane Moore', 
                    'Moore Shipping',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jane.moore48@example.com'
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
                    'Lisa Johnson', 
                    'Johnson Express',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'lisa.johnson99@example.com'
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
                    'Tom Doe', 
                    'Doe Express',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.doe48@example.com'
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
                    'Tom Jackson', 
                    'Jackson Haulage',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.jackson99@example.com'
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
                    'David Johnson', 
                    'Johnson Freight',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.johnson53@example.com'
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
                    'Tom Wilson', 
                    'Wilson Carriers',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.wilson22@example.com'
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
                    'David Thomas', 
                    'Thomas Express',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.thomas65@example.com'
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
                    'Anderson Lines',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.anderson34@example.com'
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
                    'Wilson Logistics',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.wilson84@example.com'
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
                    'Moore Trucking',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'john.moore56@example.com'
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
                    'Jane Smith', 
                    'Smith Carriers',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jane.smith76@example.com'
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
                    'Jessica Wilson', 
                    'Wilson Transport',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jessica.wilson86@example.com'
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
                    'Tom Taylor', 
                    'Taylor Logistics',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.taylor12@example.com'
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
                    'Mike Smith', 
                    'Smith Trucking',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.smith13@example.com'
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
                    'David Doe', 
                    'Doe Carriers',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'david.doe49@example.com'
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
                    'Taylor Carriers',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.taylor35@example.com'
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
                    'Wilson Carriers',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'sarah.wilson12@example.com'
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
                    'Tom Wilson', 
                    'Wilson Freight',
                    '20T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.wilson70@example.com'
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
                    'John Taylor', 
                    'Taylor Express',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'john.taylor35@example.com'
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
                    'Sarah Thomas', 
                    'Thomas Logistics',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'sarah.thomas90@example.com'
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
                    'Johnson Haulage',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'jane.johnson52@example.com'
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
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'mike.doe73@example.com'
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
                    'Moore Shipping',
                    'Frigo',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'robert.moore75@example.com'
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
                    'Robert Taylor', 
                    'Taylor Transport',
                    'BoxTruck',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'robert.taylor92@example.com'
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
                    'Tom Moore', 
                    'Moore Logistics',
                    '3.5T',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'tom.moore13@example.com'
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
                    'Anderson Shipping',
                    'Flatbed',
                    'trial',
                    'active',
                    '2026-01-22T09:32:00.500819',
                    '2026-01-22T09:32:00.500819'
                FROM auth.users WHERE email = 'lisa.anderson19@example.com'
                ON CONFLICT (user_id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    company_name = EXCLUDED.company_name,
                    truck_type = EXCLUDED.truck_type;