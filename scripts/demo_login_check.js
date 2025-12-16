/*
  Local smoke test for the App Review demo account.
  - Reads TRUXEL_SUPABASE_URL / TRUXEL_SUPABASE_ANON_KEY from .env/.env.backup files in repo root
  - Attempts email/password sign-in for review@truxel.app

  Usage (PowerShell):
    cd e:\truxel
    node .\scripts\demo_login_check.js

  Notes:
  - This script never prints secrets (URL/key/access token).
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

    if (startsDq) {
      if (endsDq) value = value.slice(1, -1);
    } else if (startsSq) {
      if (endsSq) value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function resolveEnv() {
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

  for (const candidate of candidates) {
    const env = loadEnvFile(candidate);

    const url = env.EXPO_PUBLIC_SUPABASE_URL || env.TRUXEL_SUPABASE_URL || env.SUPABASE_URL;
    const anonKey =
      env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      env.TRUXEL_SUPABASE_ANON_KEY ||
      env.SUPABASE_ANON_KEY;

    if (url && anonKey) {
      return { url, anonKey };
    }
  }

  return null;
}

async function main() {
  const resolved = resolveEnv();
  if (!resolved) {
    console.error('Missing TRUXEL_SUPABASE_URL / TRUXEL_SUPABASE_ANON_KEY in local env files.');
    process.exitCode = 2;
    return;
  }

  const supabase = createClient(resolved.url, resolved.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const email = 'review@truxel.app';
  const password = 'Apple2025';

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('DEMO LOGIN FAILED:', error.message);
    process.exitCode = 1;
    return;
  }

  console.log('DEMO LOGIN OK:', {
    userId: data && data.user ? data.user.id : null,
    email: data && data.user ? data.user.email : null,
  });
}

main().catch((e) => {
  console.error('Unexpected error:', e && e.message ? e.message : String(e));
  process.exitCode = 1;
});
