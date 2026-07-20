const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function findCategoryMatch(aixName, aixUrl, dbCategories) {
  const urlParts = aixUrl.split('/');
  const rawAixSlug = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];
  const aixSlug = rawAixSlug.replace(/-en$/, '').toLowerCase();
  
  const cleanAixName = aixName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanAixSlug = aixSlug.replace(/[^a-z0-9]/g, '');

  // 1. Direct Slug Match
  let match = dbCategories.find(c => c.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAixSlug);
  if (match) return match;

  // 2. Direct Name Match
  match = dbCategories.find(c => c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAixName);
  if (match) return match;

  // 3. Substring/Alias mappings
  const aliases = {
    'e-mail': 'email-assistants',
    'email': 'email-assistants',
    '3d-model': '3d',
    'assistant-code': 'code-assistant',
    'video-edition': 'video-editor',
    'image-ai': 'image-generation',
    'ai-voice-cloning': 'voice-cloning',
    'voice-reading': 'text-to-speech',
    'real-estate-architect': 'real-estate',
    'chatbots': 'chatbots',
    'chatbot-ai': 'chatbots',
    'ai-chat-assistant': 'chatbots',
    'art': 'creative-media'
  };

  const aliasSlug = aliases[aixSlug];
  if (aliasSlug) {
    match = dbCategories.find(c => c.slug === aliasSlug);
    if (match) return match;
  }

  // 4. Fuzzy Substring Match
  match = dbCategories.find(c => 
    c.slug.toLowerCase().includes(cleanAixSlug) || 
    cleanAixSlug.includes(c.slug.toLowerCase()) ||
    c.name.toLowerCase().includes(cleanAixName) ||
    cleanAixName.includes(c.name.toLowerCase())
  );
  
  return match || null;
}

// Concurrency pool helper to run async tasks in parallel with a limit
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

// Function to resolve redirects to get final tool URL
async function resolveOutboundUrl(url, detailUrl) {
  if (!url) return detailUrl;
  
  let targetUrl = url;
  if (url.startsWith('/')) {
    targetUrl = 'https://www.aixploria.com' + url;
  }

  // If it's already an external non-AIxploria link, no need to resolve
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
  } catch (err) {
    // If it fails, return the original targetUrl or the detailUrl as fallback
    return targetUrl;
  }
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.toString().replace(/'/g, "''")}'`;
}

function escapeSqlArray(arr) {
  if (!arr || arr.length === 0) return 'NULL';
  return `ARRAY[${arr.map(t => escapeSql(t)).join(', ')}]::text[]`;
}

async function run() {
  console.log("Reading AIxploria HTML from local file...");
  const localHtmlPath = 'C:\\Users\\badbo\\.gemini\\antigravity-ide\\brain\\cc2384ea-8a29-4e1a-b9ba-a4c02fdba461\\.system_generated\\steps\\129\\content.md';
  let html = '';
  try {
    html = fs.readFileSync(localHtmlPath, 'utf8');
  } catch (error) {
    console.error("Failed to read local HTML file, trying network fetch...");
    const listUrl = "https://www.aixploria.com/en/ultimate-list-ai/";
    const response = await fetch(listUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    html = await response.text();
  }

  // Parse Categories and Tools
  console.log("Parsing HTML content...");
  const blockRegex = /<a target="_blank" style="text-decoration: none;" href="([^"]+)">\s*<span class="title-list">[\s\S]*?<span data-title="([^"]+)">([\s\S]*?)<\/span>\s*<\/span>\s*<\/a>\s*<div class="link-list">([\s\S]*?)<\/ol>/g;

  let match;
  const parsedCategories = [];
  let totalToolsCount = 0;

  while ((match = blockRegex.exec(html)) !== null) {
    const categoryUrl = match[1].trim();
    const categoryName = decodeHtmlEntities(match[2].trim());
    const listHtml = match[4];
    
    const toolLiRegex = /<li>([\s\S]*?)<\/li>/g;
    let liMatch;
    const tools = [];
    
    while ((liMatch = toolLiRegex.exec(listHtml)) !== null) {
      const liHtml = liMatch[1];
      
      const nameMatch = liHtml.match(/class="stop-wordy"[^>]*>([^<]+)/);
      const name = nameMatch ? decodeHtmlEntities(nameMatch[1].trim()) : '';
      
      const descMatch = liHtml.match(/data-tooltip="([^"]+)"/);
      const description = descMatch ? decodeHtmlEntities(descMatch[1].trim()) : '';
      
      const logoMatch = liHtml.match(/data-src="([^"]+)"/) || liHtml.match(/src="([^"]+)"/);
      const logoUrl = logoMatch ? logoMatch[1].trim() : '';
      
      const outboundMatch = liHtml.match(/class="site-review2"[^>]*href="([^"]+)"/);
      const outboundUrl = outboundMatch ? outboundMatch[1].trim() : '';
      
      const detailMatch = liHtml.match(/class="hourly-tooltip"[^>]*href="([^"]+)"/);
      const detailUrl = detailMatch ? detailMatch[1].trim() : '';
      
      const pricingMatch = liHtml.match(/websites-type-([^"]+)"/) || liHtml.match(/websites-ground-type-([^"]+)"/);
      const pricingText = pricingMatch ? pricingMatch[1].trim().toLowerCase() : 'unknown';
      
      let pricing_model = 'unknown';
      if (pricingText.includes('gratuit') || pricingText === 'free') {
        pricing_model = 'free';
      } else if (pricingText.includes('freemium') || pricingText.includes('essai')) {
        pricing_model = 'freemium';
      } else if (pricingText.includes('payant') || pricingText === 'paid') {
        pricing_model = 'paid';
      }
      
      if (name) {
        tools.push({
          name,
          description,
          logoUrl,
          outboundUrl,
          detailUrl,
          pricing_model
        });
        totalToolsCount++;
      }
    }
    
    parsedCategories.push({
      name: categoryName,
      url: categoryUrl,
      tools
    });
  }

  console.log(`Parsed ${parsedCategories.length} categories and ${totalToolsCount} tools.`);

  // Fetch DB categories
  console.log("Fetching categories from database...");
  const { data: dbCategories, error: dbCatError } = await supabase
    .from('categories')
    .select('*');

  if (dbCatError) {
    console.error("Error fetching categories:", dbCatError.message);
    process.exit(1);
  }

  console.log(`Retrieved ${dbCategories.length} categories from DB.`);

  // Map and prepare categories
  const categoryMap = {}; // mapping aixCategoryName -> dbCategoryId
  const newCategoriesSql = [];
  
  for (const cat of parsedCategories) {
    let dbMatch = findCategoryMatch(cat.name, cat.url, dbCategories);
    
    if (dbMatch) {
      console.log(`Mapped AIxploria category "${cat.name}" to DB category "${dbMatch.name}" (${dbMatch.slug})`);
      categoryMap[cat.name] = dbMatch.id;
    } else {
      // Prepare new category SQL
      const urlParts = cat.url.split('/');
      const rawSlug = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];
      const newSlug = rawSlug.replace(/-en$/, '').toLowerCase();
      const generatedId = crypto.randomUUID();
      
      console.log(`Preparing new category insertion: "${cat.name}" (slug: ${newSlug}) -> ID ${generatedId}`);
      categoryMap[cat.name] = generatedId;
      
      newCategoriesSql.push(
        `INSERT INTO categories (id, name, slug, description) VALUES (${escapeSql(generatedId)}, ${escapeSql(cat.name)}, ${escapeSql(newSlug)}, ${escapeSql(`AI tools and bots for ${cat.name}`)}) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;`
      );
    }
  }

  // Collect all tools to process
  const toolsToProcess = [];
  for (const cat of parsedCategories) {
    const categoryId = categoryMap[cat.name];
    if (!categoryId) continue;

    for (const tool of cat.tools) {
      toolsToProcess.push({
        ...tool,
        categoryId
      });
    }
  }

  console.log(`Resolving redirect URLs and preparing ${toolsToProcess.length} tools for insertion...`);

  // Process redirect resolution with concurrency of 5
  let resolvedCount = 0;
  const processedTools = await asyncPool(5, toolsToProcess, async (tool) => {
    let finalUrl = tool.outboundUrl || tool.detailUrl;
    
    // Resolve redirect if it's a redirect URL
    if (finalUrl.includes('/out/') || finalUrl.includes('aixploria.com/out/') || finalUrl.includes('aixploria.com/en/out/')) {
      finalUrl = await resolveOutboundUrl(tool.outboundUrl, tool.detailUrl);
    }
    
    resolvedCount++;
    if (resolvedCount % 50 === 0 || resolvedCount === toolsToProcess.length) {
      console.log(`Resolved redirects: ${resolvedCount}/${toolsToProcess.length}...`);
    }

    return {
      name: tool.name,
      url: finalUrl,
      short_description: tool.description.substring(0, 140),
      category_id: tool.categoryId,
      pricing_model: tool.pricing_model,
      logo_url: tool.logoUrl,
      source: 'aixploria_crawler',
      status: 'active',
      click_count: 0,
      last_crawled_at: new Date().toISOString(),
      tags: [slugify(tool.name).split('-')[0], 'aixploria'].filter(t => t.length > 2)
    };
  });

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

  const newTools = processedTools.filter(t => !existingUrls.has(t.url.toLowerCase().replace(/\/$/, "")));
  console.log(`Filtered out duplicates. Found ${newTools.length} new tools to import.`);

  const sqlStatements = [];
  sqlStatements.push("BEGIN;");
  
  if (newTools.length > 0) {
    console.log(`Writing SQL inserts for ${newTools.length} new tools...`);
    for (const tool of newTools) {
      sqlStatements.push(
        `INSERT INTO tools (name, url, short_description, category_id, tags, pricing_model, logo_url, source, status, click_count, last_crawled_at) VALUES (${escapeSql(tool.name)}, ${escapeSql(tool.url)}, ${escapeSql(tool.short_description)}, ${escapeSql(tool.category_id)}, ${escapeSqlArray(tool.tags)}, ${escapeSql(tool.pricing_model)}, ${escapeSql(tool.logo_url)}, ${escapeSql(tool.source)}, ${escapeSql(tool.status)}, 0, ${escapeSql(tool.last_crawled_at)}) ON CONFLICT (url) DO NOTHING;`
      );
    }
  } else {
    console.log("No new tools to write.");
  }

  sqlStatements.push("\nCOMMIT;");

  const targetSqlPath = 'C:\\Users\\badbo\\.gemini\\antigravity-ide\\brain\\cc2384ea-8a29-4e1a-b9ba-a4c02fdba461\\scratch\\insert_all.sql';
  
  try {
    fs.mkdirSync(path.dirname(targetSqlPath), { recursive: true });
  } catch (err) {}

  fs.writeFileSync(targetSqlPath, sqlStatements.join('\n'), 'utf8');
  console.log(`SQL statements for new tools saved to ${targetSqlPath}`);

  console.log(`Crawler script finished successfully.`);
}

run().catch(err => {
  console.error("Fatal error running crawler:", err);
});
