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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Connecting to Supabase at:', url);

if (!url || !key) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const client = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const tables = ['branches', 'units', 'bookings', 'blocked_dates', 'payment_transactions', 'addon_services'];
  const summary = {};
  
  for (const t of tables) {
    const { data, count, error } = await client.from(t).select('*', { count: 'exact' });
    if (error) {
      summary[t] = { error: error.message };
    } else {
      summary[t] = { count, sample: data.slice(0, 2) };
    }
  }

  // Check RPC function
  const { error: rpcError } = await client.rpc('create_booking_if_available', {
    p_booking: {},
    p_total_units: 1
  });
  
  const rpcStatus = rpcError ? rpcError.message : 'EXISTS';

  console.log('\n--- SUPABASE CURRENT TABLE STATUS ---');
  for (const [t, info] of Object.entries(summary)) {
    if (info.error) {
      console.log(`Table ${t}: Error (${info.error})`);
    } else {
      console.log(`Table ${t}: ${info.count} rows`);
    }
  }

  console.log('\n--- RPC FUNCTION STATUS ---');
  console.log('create_booking_if_available:', rpcStatus);
}

run().catch(console.error);
