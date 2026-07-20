const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to clean environment values
const cleanEnvValue = (val) => val.replace(/['"\r]/g, '').trim();

// Read env variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  console.error("Could not read .env.local file, trying .env...");
  try {
    envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
  } catch (e) {
    console.error("Could not read .env file either. Exiting.");
    process.exit(1);
  }
}

const rawUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
const rawKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1];

if (!rawUrl || !rawKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env files");
  process.exit(1);
}

const supabaseUrl = cleanEnvValue(rawUrl);
const supabaseAnonKey = cleanEnvValue(rawKey);

console.log("Initializing Supabase Client...");
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const sqlPath = 'C:\\Users\\badbo\\.gemini\\antigravity-ide\\brain\\cc2384ea-8a29-4e1a-b9ba-a4c02fdba461\\scratch\\insert_all.sql';
  console.log(`Reading SQL script from ${sqlPath}...`);
  let sqlContent = '';
  try {
    sqlContent = fs.readFileSync(sqlPath, 'utf8');
  } catch (err) {
    console.error("Failed to read SQL script:", err.message);
    process.exit(1);
  }

  // Remove transaction control statements since RPC executes in a transaction context
  sqlContent = sqlContent
    .split('\n')
    .filter(line => line.trim() !== 'BEGIN;' && line.trim() !== 'COMMIT;')
    .join('\n');

  console.log("Executing SQL transaction in Supabase...");
  const { data, error } = await supabase.rpc('exec_sql', { query_text: sqlContent });

  if (error) {
    console.error("Error executing SQL via RPC:", error.message);
    process.exit(1);
  }

  console.log("SQL transaction executed successfully!");
}

run().catch(err => {
  console.error("Fatal error:", err);
});
