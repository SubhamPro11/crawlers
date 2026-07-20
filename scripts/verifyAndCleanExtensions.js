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

// Concurrency pool helper
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    if (poolLimit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

async function checkUrlHealth(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return { ok: false, status: 0, reason: 'Invalid URL format' };
  }

  // Handle Chrome Web Store / Firefox Addons specially or standard HTTP check
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    // Try HEAD first, fallback to GET if HEAD fails
    let res;
    try {
      res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers
      });
    } catch (e) {
      // Retry with GET
      const getController = new AbortController();
      const getTimeoutId = setTimeout(() => getController.abort(), 8000);
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: getController.signal,
        headers
      });
      clearTimeout(getTimeoutId);
    }

    clearTimeout(timeoutId);

    // 2xx and 3xx are healthy. 404, 410, 500, etc. are dead/broken
    if (res.ok || (res.status >= 200 && res.status < 400)) {
      return { ok: true, status: res.status };
    } else {
      return { ok: false, status: res.status, reason: `HTTP ${res.status}` };
    }
  } catch (err) {
    return { ok: false, status: 0, reason: err.message || 'Fetch error / Timeout' };
  }
}

async function run() {
  const CATEGORY_ID = 'fe1ee758-4faf-4b9f-873a-bb95a5939552'; // AI Extensions category

  console.log("Fetching all tools in AI Extensions category...");
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, name, url')
    .eq('category_id', CATEGORY_ID);

  if (error || !tools) {
    console.error("Error fetching tools:", error?.message);
    process.exit(1);
  }

  console.log(`Found ${tools.length} AI extensions to verify.`);

  const healthyTools = [];
  const deadTools = [];

  console.log("Checking URL health in parallel batches...");
  await asyncPool(10, tools, async (tool) => {
    const health = await checkUrlHealth(tool.url);
    if (health.ok) {
      healthyTools.push(tool);
      console.log(`[OK] ${tool.name} -> ${tool.url} (${health.status})`);
    } else {
      deadTools.push({ ...tool, reason: health.reason });
      console.log(`[DEAD] ${tool.name} -> ${tool.url} (Reason: ${health.reason})`);
    }
  });

  console.log("\n================ VERIFICATION SUMMARY ================");
  console.log(`Total AI Extensions Checked: ${tools.length}`);
  console.log(`Healthy / Working Links: ${healthyTools.length}`);
  console.log(`Broken / Dead Links: ${deadTools.length}`);

  if (deadTools.length > 0) {
    console.log("\nDeleting broken/dead extensions from database...");
    const deadIds = deadTools.map(t => t.id);

    const { error: deleteError, count } = await supabase
      .from('tools')
      .delete()
      .in('id', deadIds);

    if (deleteError) {
      console.error("Error deleting dead tools:", deleteError.message);
    } else {
      console.log(`Successfully deleted ${deadIds.length} broken tools from Supabase database.`);
    }
  } else {
    console.log("All AI extension links are working properly! No deletions needed.");
  }
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
