import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  const migrations = [
    '001_create_base_tables.sql',
    '002_create_triggers.sql',
    '003_add_indexes.sql',
    '004_create_functions.sql',
    '005_add_rls_policies.sql'
  ];

  for (const migration of migrations) {
    console.log(`Running migration: ${migration}`);
    const sql = readFileSync(
      join(__dirname, '..', 'migrations', migration),
      'utf8'
    );

    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error(`Error running migration ${migration}:`, error);
      process.exit(1);
    }
  }

  console.log('All migrations completed successfully');
}

runMigrations().catch(console.error);
