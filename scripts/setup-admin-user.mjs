import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim().replace(/^['"]|['"]$/g, '');
    process.env[key] = val;
  }
});

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const adminEmail = 'reservation@flatel.in';
const defaultPassword = process.argv[2] || 'Admin@Flatel2026!';

async function setupAdmin() {
  console.log(`Checking if ${adminEmail} exists in Supabase Auth...`);
  const { data: listData, error: listErr } = await client.auth.admin.listUsers();
  if (listErr) {
    console.error('Failed to list users:', listErr.message);
    process.exit(1);
  }

  const existing = listData.users.find(u => u.email?.toLowerCase() === adminEmail.toLowerCase());

  if (existing) {
    console.log(`User ${adminEmail} exists (ID: ${existing.id}). Updating password...`);
    const { error: updateErr } = await client.auth.admin.updateUserById(existing.id, {
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { role: 'admin', full_name: 'Flatel Admin' }
    });
    if (updateErr) {
      console.error('Failed to update password:', updateErr.message);
      process.exit(1);
    }
    console.log(`SUCCESS: Password updated for ${adminEmail}!`);
  } else {
    console.log(`User ${adminEmail} not found. Creating new admin user...`);
    const { data: createData, error: createErr } = await client.auth.admin.createUser({
      email: adminEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { role: 'admin', full_name: 'Flatel Admin' }
    });
    if (createErr) {
      console.error('Failed to create user:', createErr.message);
      process.exit(1);
    }
    console.log(`SUCCESS: Admin user created (ID: ${createData.user.id})!`);
  }

  console.log('\n--- ADMIN LOGIN CREDENTIALS ---');
  console.log(`URL:      http://localhost:3000/admin`);
  console.log(`Email:    ${adminEmail}`);
  console.log(`Password: ${defaultPassword}`);
  console.log('-------------------------------\n');
}

setupAdmin();
