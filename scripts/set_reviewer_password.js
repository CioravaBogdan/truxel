/*
  One-off helper: set App Review demo user's password and (optionally) confirm email.

  Reads Supabase admin credentials from local env files (.env/.env.backup):
    - EXPO_PUBLIC_SUPABASE_URL or TRUXEL_SUPABASE_URL
    - TRUXEL_SUPABASE_SERVICE_ROLE_KEY (service role)

  Usage (PowerShell):
    cd e:\truxel
    node .\scripts\set_reviewer_password.js

  Safety:
    - Never prints keys/tokens.
    - Only targets review@truxel.app.
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

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

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

  const supabaseAdmin = createClient(resolved.supabaseUrl, resolved.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const demoEmail = 'review@truxel.app';
  const newPassword = 'Apple2025';

  const userId = await findUserIdByEmail(supabaseAdmin, demoEmail);
  if (!userId) {
    console.error(`Demo user not found in auth.users: ${demoEmail}`);
    process.exitCode = 1;
    return;
  }

  // Set password and confirm email to reduce App Review friction.
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
    email_confirm: true,
  });

  if (error) {
    console.error('Failed to update demo user password:', error.message);
    process.exitCode = 1;
    return;
  }

  console.log('Reviewer password updated:', {
    userId,
    email: data && data.user ? data.user.email : demoEmail,
    email_confirmed: !!(data && data.user && data.user.email_confirmed_at),
  });
}

main().catch((e) => {
  console.error('Unexpected error:', e && e.message ? e.message : String(e));
  process.exitCode = 1;
});
