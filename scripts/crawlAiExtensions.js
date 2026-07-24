/* eslint-disable */
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

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.toString().replace(/'/g, "''")}'`;
}

function escapeSqlArray(arr) {
  if (!arr || arr.length === 0) return 'NULL';
  return `ARRAY[${arr.map(t => escapeSql(t)).join(', ')}]::text[]`;
}

// Concurrency pool helper to run redirect resolution in parallel
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

async function resolveOutboundUrl(url, detailUrl) {
  if (!url) return detailUrl;
  
  let targetUrl = url;
  if (url.startsWith('/')) {
    targetUrl = 'https://www.aixploria.com' + url;
  }

  if (!targetUrl.includes('aixploria.com/out/') && !targetUrl.includes('aixploria.com/en/out/')) {
    return targetUrl;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout
    const res = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeoutId);
    return res.url;
  } catch {
    return targetUrl;
  }
}

async function fetchPage(pageNumber) {
  const url = pageNumber === 1
    ? 'https://www.aixploria.com/en/category/extensions-chatgpt/'
    : `https://www.aixploria.com/en/category/extensions-chatgpt/page/${pageNumber}/`;

  console.log(`Fetching page ${pageNumber}: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.text();
  } catch (err) {
    console.error(`Failed to fetch page ${pageNumber}:`, err.message);
    return null;
  }
}

function parsePageTools(html) {
  if (!html) return [];
  
  const articleRegex = /<article[^>]*id="post-\d+"[^>]*class="[^"]*aix_post-card[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
  let match;
  const parsed = [];

  while ((match = articleRegex.exec(html)) !== null) {
    const cardHtml = match[1];

    // 1. Name
    const nameMatch = cardHtml.match(/class="aix_post-card-titlelink[^"]*"[^>]*>([\s\S]*?)<\/a>/);
    let name = nameMatch ? decodeHtmlEntities(nameMatch[1]) : '';
    if (!name) {
      const altMatch = cardHtml.match(/alt="([^"]+)"/);
      name = altMatch ? decodeHtmlEntities(altMatch[1]) : '';
    }

    // 2. Detail URL
    const detailMatch = cardHtml.match(/class="aix_post-card-titlelink[^"]*"[^>]*href="([^"]+)"/);
    const detailUrl = detailMatch ? detailMatch[1].trim() : '';

    // 3. Outbound Redirect URL
    const outboundMatch = cardHtml.match(/class="[^"]*visit-site-button4[^"]*"[^>]*href="([^"]+)"/) ||
                          cardHtml.match(/href="([^"]+)"[^>]*class="[^"]*visit-site-button4[^"]*"/);
    const outboundUrl = outboundMatch ? outboundMatch[1].trim() : '';

    // 4. Description
    const descMatch = cardHtml.match(/class="aix_post-card-excerpt[^"]*"[^>]*data-title="([^"]+)"/) ||
                      cardHtml.match(/data-title="([^"]+)"[^>]*class="[^"]*aix_post-card-excerpt[^"]*"/);
    const description = descMatch ? decodeHtmlEntities(descMatch[1]) : '';

    // 5. Logo URL
    const logoMatch = cardHtml.match(/class="site-icon"[^>]*src="([^"]+)"/) ||
                      cardHtml.match(/src="([^"]+)"[^>]*class="site-icon"/);
    const logoUrl = logoMatch ? logoMatch[1].trim() : '';

    // 6. Pricing Model
    const pricingMatch = cardHtml.match(/class="aix_post-card-type-name">([^<]+)/);
    const pricingText = pricingMatch ? pricingMatch[1].trim().toLowerCase() : 'unknown';
    
    let pricing_model = 'freemium';
    if (pricingText.includes('free') || pricingText.includes('gratuit')) {
      pricing_model = 'free';
    } else if (pricingText.includes('paid') || pricingText.includes('payant') || pricingText.includes('commercial')) {
      pricing_model = 'paid';
    }

    if (name) {
      parsed.push({
        name,
        detailUrl,
        outboundUrl,
        description,
        logoUrl,
        pricing_model
      });
    }
  }

  return parsed;
}

async function run() {
  // Target Category: "AI Extensions" (ID: fe1ee758-4faf-4b9f-873a-bb95a5939552)
  const TARGET_CATEGORY_ID = "fe1ee758-4faf-4b9f-873a-bb95a5939552";

  console.log("Fetching existing tool URLs from database...");
  const { data: existingTools, error: existingError } = await supabase
    .from('tools')
    .select('url');

  if (existingError) {
    console.error("Error fetching existing tools:", existingError.message);
    process.exit(1);
  }

  const existingUrls = new Set(existingTools.map(t => t.url.toLowerCase().replace(/\/$/, "")));
  console.log(`Retrieved ${existingUrls.size} existing tool URLs.`);

  const allParsedTools = [];
  const TOTAL_PAGES = 9;

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const html = await fetchPage(page);
    if (html) {
      const pageTools = parsePageTools(html);
      console.log(`Parsed ${pageTools.length} extensions from page ${page}.`);
      allParsedTools.push(...pageTools);
    }
    // Delay 1 second between pages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`Total parsed extensions across all pages: ${allParsedTools.length}`);

  // Deduplicate list parsed from different pages
  const uniqueParsedTools = [];
  const seenUrlsInCrawl = new Set();
  
  for (const tool of allParsedTools) {
    const urlKey = (tool.outboundUrl || tool.detailUrl).toLowerCase().replace(/\/$/, "");
    if (!seenUrlsInCrawl.has(urlKey)) {
      seenUrlsInCrawl.add(urlKey);
      uniqueParsedTools.push(tool);
    }
  }
  console.log(`Unique parsed extensions: ${uniqueParsedTools.length}`);

  // Resolve Outbound URLs and map fields
  console.log("Resolving final outbound URLs...");
  const processedTools = await asyncPool(5, uniqueParsedTools, async (tool) => {
    const finalUrl = await resolveOutboundUrl(tool.outboundUrl || tool.detailUrl, tool.detailUrl);
    
    const cleanName = tool.name.replace(/&#038;/g, '&').replace(/&#039;/g, "'");
    const tags = [
      cleanName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      'extension',
      'chatgpt',
      'aixploria'
    ];

    return {
      name: cleanName,
      url: finalUrl,
      short_description: tool.description,
      category_id: TARGET_CATEGORY_ID,
      tags,
      pricing_model: tool.pricing_model,
      logo_url: tool.logoUrl,
      source: 'aixploria_crawler',
      status: 'active',
      last_crawled_at: new Date().toISOString()
    };
  });

  // Filter out those that already exist in DB
  const newTools = processedTools.filter(t => !existingUrls.has(t.url.toLowerCase().replace(/\/$/, "")));
  console.log(`Filtered against database. Found ${newTools.length} new AI extensions to import.`);

  const sqlStatements = [];
  sqlStatements.push("BEGIN;");
  
  if (newTools.length > 0) {
    console.log(`Writing SQL inserts for ${newTools.length} new AI extensions...`);
    for (const tool of newTools) {
      sqlStatements.push(
        `INSERT INTO tools (name, url, short_description, category_id, tags, pricing_model, logo_url, source, status, click_count, last_crawled_at) VALUES (${escapeSql(tool.name)}, ${escapeSql(tool.url)}, ${escapeSql(tool.short_description)}, ${escapeSql(tool.category_id)}, ${escapeSqlArray(tool.tags)}, ${escapeSql(tool.pricing_model)}, ${escapeSql(tool.logo_url)}, ${escapeSql(tool.source)}, ${escapeSql(tool.status)}, 0, ${escapeSql(tool.last_crawled_at)}) ON CONFLICT (url) DO NOTHING;`
      );
    }
  } else {
    console.log("No new AI extensions to write.");
  }

  sqlStatements.push("\nCOMMIT;");

  const targetSqlPath = 'C:\\Users\\badbo\\.gemini\\antigravity-ide\\brain\\cc2384ea-8a29-4e1a-b9ba-a4c02fdba461\\scratch\\insert_extensions.sql';
  fs.mkdirSync(path.dirname(targetSqlPath), { recursive: true });
  fs.writeFileSync(targetSqlPath, sqlStatements.join('\n'), 'utf8');

  console.log(`SQL statements saved to ${targetSqlPath}`);
  console.log("Finished successfully.");
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
