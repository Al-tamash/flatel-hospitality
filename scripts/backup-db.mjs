import fs from 'fs';
import path from 'path';
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

if (!url || !key) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const client = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createBackup() {
  const backupDir = path.resolve('backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `supabase-backup-${timestamp}.json`);

  const tables = ['branches', 'units', 'bookings', 'blocked_dates', 'payment_transactions', 'addon_services'];
  const fullBackup = {
    metadata: {
      timestamp: new Date().toISOString(),
      supabaseUrl: url,
    },
    tables: {}
  };

  console.log('--- STARTING COMPLETE SUPABASE DATA BACKUP ---');

  for (const table of tables) {
    const { data, count, error } = await client.from(table).select('*', { count: 'exact' });
    if (error) {
      console.warn(`[WARN] Table ${table}: ${error.message}`);
      fullBackup.tables[table] = { error: error.message, rows: [] };
    } else {
      console.log(`[OK] Table ${table}: Backed up ${data.length} rows (total count: ${count})`);
      fullBackup.tables[table] = { count, rows: data };
    }
  }

  fs.writeFileSync(backupFile, JSON.stringify(fullBackup, null, 2), 'utf8');
  console.log(`\nSUCCESS: Complete backup safely written to:\n${backupFile}`);
}

createBackup().catch(console.error);
