/*
  One-off helper: prefill the App Review demo user's profile so reviewers land in the app.

  Reads from repo root `.env`:
    - EXPO_PUBLIC_SUPABASE_URL
    - TRUXEL_SUPABASE_SERVICE_ROLE_KEY

  Usage (PowerShell):
    cd e:\truxel
    node .\scripts\set_reviewer_profile.js

  Safety:
    - Never prints keys/tokens.
    - Only targets the specific demo email.
*/

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const txt = fs.readFileSync(filePath, 'utf8');
  const env = {};

  for (const line of txt.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const key = match[1];
    let value = match[2];

    const startsDq = value.startsWith('"');
    const endsDq = value.endsWith('"');
    const startsSq = value.startsWith("'");
    const endsSq = value.endsWith("'");

    if (startsDq && endsDq) value = value.slice(1, -1);
    if (startsSq && endsSq) value = value.slice(1, -1);

    env[key] = value;
  }

  return env;
}

function resolveSupabaseAdminEnv() {
  const root = path.join(__dirname, '..');
  const candidates = [
    path.join(root, '.env'),
    path.join(root, '.env.backup'),
    ...fs
      .readdirSync(root)
      .filter((f) => f.startsWith('.env.backup.'))
      .map((f) => path.join(root, f)),
    path.join(root, '.env.example'),
  ];

  let supabaseUrl;
  let serviceRoleKey;

  for (const candidate of candidates) {
    const env = loadEnvFile(candidate);

    supabaseUrl =
      supabaseUrl ||
      env.EXPO_PUBLIC_SUPABASE_URL ||
      env.TRUXEL_SUPABASE_URL ||
      env.SUPABASE_URL;

    serviceRoleKey =
      serviceRoleKey ||
      env.TRUXEL_SUPABASE_SERVICE_ROLE_KEY ||
      env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) break;
  }

  if (!supabaseUrl || !serviceRoleKey) return null;
  return { supabaseUrl, serviceRoleKey };
}

async function findUserIdByEmail(supabase, email) {
  // Supabase Auth Admin API lists users with pagination.
  let page = 1;
  const perPage = 200;

  for (let i = 0; i < 50; i++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data && data.users ? data.users : [];
    const found = users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (found) return found.id;

    if (users.length < perPage) return null;
    page += 1;
  }

  return null;
}

async function main() {
  const resolved = resolveSupabaseAdminEnv();
  if (!resolved) {
    console.error('Missing Supabase URL and/or service role key in local env files (.env/.env.backup).');
    process.exitCode = 2;
    return;
  }

  const supabase = createClient(resolved.supabaseUrl, resolved.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const demoEmail = 'review@truxel.app';

  const userId = await findUserIdByEmail(supabase, demoEmail);
  if (!userId) {
    console.error(`Demo user not found in auth.users: ${demoEmail}`);
    process.exitCode = 1;
    return;
  }

  const now = new Date().toISOString();

  // Minimal requirements to bypass app gate in app/_layout.tsx:
  //   profile.phone_number && profile.company_name
  // We also set a reasonable subset of onboarding fields.
  const profilePatch = {
    user_id: userId,
    email: demoEmail,
    full_name: 'Truxel Reviewer',
    company_name: 'Truxel Review',
    phone_number: '+40700000000',
    truck_type: 'Trailer',
    preferred_distance_unit: 'km',
    search_radius_km: 10,
    notification_radius_km: 25,
    preferred_industries: ['Logistics'],
    updated_at: now,
  };

  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert(profilePatch, { onConflict: 'user_id' });

  if (upsertError) {
    console.error('Failed to upsert profiles row:', upsertError.message);
    process.exitCode = 1;
    return;
  }

  const { data: profile, error: selectError } = await supabase
    .from('profiles')
    .select('user_id, company_name, phone_number, truck_type, preferred_industries')
    .eq('user_id', userId)
    .maybeSingle();

  if (selectError) {
    console.error('Updated profile, but failed to read it back:', selectError.message);
    process.exitCode = 0;
    return;
  }

  console.log('Reviewer profile updated:', {
    userId: profile ? profile.user_id : userId,
    company_name: profile ? profile.company_name : null,
    phone_number_set: !!(profile && profile.phone_number),
    truck_type: profile ? profile.truck_type : null,
    preferred_industries: profile ? profile.preferred_industries : null,
  });
}

main().catch((e) => {
  console.error('Unexpected error:', e && e.message ? e.message : String(e));
  process.exitCode = 1;
});
