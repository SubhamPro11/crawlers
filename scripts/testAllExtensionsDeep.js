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
} catch {
  console.error("Could not read .env.local file, trying .env...");
  try {
    envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
  } catch {
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

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let res;
    try {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers
      });
    } catch {
      // Retry HEAD if GET failed due to body size/stream issue
      const headController = new AbortController();
      const headTimeoutId = setTimeout(() => headController.abort(), 8000);
      res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: headController.signal,
        headers
      });
      clearTimeout(headTimeoutId);
    }

    clearTimeout(timeoutId);

    // 2xx and 3xx are healthy.
    if (res.ok || (res.status >= 200 && res.status < 400)) {
      return { ok: true, status: res.status };
    } else if (res.status === 403 || res.status === 429 || res.status === 503) {
      // Re-verify with desktop Chrome UA to avoid bot protection false positives
      try {
        const altRes = await fetch(url, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
          }
        });
        if (altRes.ok || altRes.status < 400) {
          return { ok: true, status: altRes.status };
        }
      } catch {}
      return { ok: false, status: res.status, reason: `HTTP ${res.status}` };
    } else {
      return { ok: false, status: res.status, reason: `HTTP ${res.status}` };
    }
  } catch (err) {
    return { ok: false, status: 0, reason: err.message || 'Network Timeout' };
  }
}

async function run() {
  const CATEGORY_ID = 'fe1ee758-4faf-4b9f-873a-bb95a5939552';

  console.log("Fetching all extension tools from database...");
  
  // Fetch tools from AI Extensions category AND tools tagged or named extension
  let allToolsMap = new Map();

  const { data: catTools } = await supabase
    .from('tools')
    .select('id, name, url, category_id, pricing_model')
    .eq('category_id', CATEGORY_ID);

  if (catTools) {
    catTools.forEach(t => allToolsMap.set(t.id, t));
  }

  const { data: taggedTools } = await supabase
    .from('tools')
    .select('id, name, url, category_id, pricing_model')
    .or('url.ilike.%chromewebstore%,url.ilike.%chrome.google.com%,tags.cs.{"extension"}');

  if (taggedTools) {
    taggedTools.forEach(t => allToolsMap.set(t.id, t));
  }

  const tools = Array.from(allToolsMap.values());
  console.log(`Total extension tools found across database: ${tools.length}`);

  const healthyTools = [];
  const deadTools = [];

  console.log("Testing every extension URL for live availability...");
  await asyncPool(8, tools, async (tool) => {
    const health = await checkUrlHealth(tool.url);
    if (health.ok) {
      healthyTools.push(tool);
      console.log(`[PASS] ${tool.name} -> ${tool.url} (Status: ${health.status})`);
    } else {
      deadTools.push({ ...tool, reason: health.reason });
      console.log(`[FAIL - DEAD] ${tool.name} -> ${tool.url} (Reason: ${health.reason})`);
    }
  });

  console.log("\n================ EXTENSIONS DEEP TEST SUMMARY ================");
  console.log(`Total Extensions Tested: ${tools.length}`);
  console.log(`Working Extensions: ${healthyTools.length}`);
  console.log(`Dead / Broken Extensions: ${deadTools.length}`);

  if (deadTools.length > 0) {
    console.log("\nRemoving broken extensions from database...");
    const deadIds = deadTools.map(t => t.id);

    const { error: deleteError } = await supabase
      .from('tools')
      .delete()
      .in('id', deadIds);

    if (deleteError) {
      console.error("Error deleting dead tools:", deleteError.message);
    } else {
      console.log(`Successfully removed ${deadIds.length} broken/dead extension tools from Supabase database.`);
    }
  } else {
    console.log("All extension tools are 100% working! No dead tools found.");
  }
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
