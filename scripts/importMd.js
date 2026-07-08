const fs = require('fs');
const path = require('path');

const cleanEnvValue = (val) => val.replace(/['"\r]/g, '').trim();

// Read env variables
const envPath = path.join(__dirname, '../.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  console.error("Could not read .env.local file:", err.message);
  process.exit(1);
}

const rawUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
const rawKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1];

if (!rawUrl || !rawKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabaseUrl = cleanEnvValue(rawUrl);
const supabaseAnonKey = cleanEnvValue(rawKey);

console.log("Connecting to Supabase URL:", supabaseUrl);

// Read markdown data
const mdPath = path.join(__dirname, '../ers/ttrs.md');
let mdContent = '';
try {
  mdContent = fs.readFileSync(mdPath, 'utf8');
} catch (err) {
  console.error("Could not read ttrs.md file:", err.message);
  process.exit(1);
}

const lines = mdContent.split('\n');
const categories = [];
const tools = [];

let currentCategory = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Match category: ## [Category Name](https://bestofai.io/categories/slug/)
  const catMatch = line.match(/^##\s+\[([^\]]+)\]\(https:\/\/bestofai\.io\/categories\/([^/)]+)\/?\)/i);
  if (catMatch) {
    const name = catMatch[1].trim();
    const slug = catMatch[2].trim();
    
    // Check next lines for description blockquote
    let description = '';
    for (let j = 1; j <= 3; j++) {
      const nextLine = lines[i + j]?.trim() || '';
      if (nextLine.startsWith('>')) {
        description = nextLine.replace(/^>\s*/, '').trim();
        break;
      }
    }
    
    currentCategory = { name, slug, description };
    categories.push(currentCategory);
    continue;
  }
  
  // Match tool bullet point: - **[Name](URL)** — Description
  const toolMatch = line.match(/^-\s+\*\*\[([^\]]+)\]\(([^)]+)\)\*\*\s*—\s*(.+)/);
  if (toolMatch && currentCategory) {
    const name = toolMatch[1].trim();
    const url = toolMatch[2].trim();
    let remainder = toolMatch[3].trim();
    
    // Skip placeholder / navigation items
    if (name.toLowerCase().includes('view all') || remainder.toLowerCase().includes('view all')) {
      continue;
    }
    
    // Clean review prefix
    remainder = remainder.replace(/^\[review\]\([^)]+\)\s*—\s*/i, '');
    
    // Determine pricing model from badges or text
    let pricing_model = 'unknown';
    const cleanRemainder = remainder.toLowerCase();
    if (cleanRemainder.includes('freemium')) {
      pricing_model = 'freemium';
    } else if (cleanRemainder.includes('free') && !cleanRemainder.includes('free-trial')) {
      pricing_model = 'free';
    } else if (cleanRemainder.includes('paid') || cleanRemainder.includes('subscription')) {
      pricing_model = 'paid';
    }
    
    // Clean pricing badge markdown e.g. ![Freemium](...) or ![Free](...)
    let short_description = remainder.replace(/!\[[^\]]+\]\([^)]+\)/g, '').trim();
    
    // Clean up trailing dashes/spaces
    short_description = short_description.replace(/\s*—\s*$/, '').trim();
    
    // Limit to 140 characters for card views
    if (short_description.length > 140) {
      short_description = short_description.substring(0, 137) + '...';
    }

    // Generate tags
    const tags = [
      currentCategory.slug,
      ...name.toLowerCase().split(/\s+/).filter(t => t.length > 2).slice(0, 3)
    ].map(t => t.replace(/[^a-z0-9-]/g, '')).filter(t => t.length > 0);
    
    tools.push({
      name,
      url,
      short_description,
      category_slug: currentCategory.slug,
      pricing_model,
      tags,
      source: 'best_of_ai_import',
      status: 'active'
    });
  }
}

console.log(`Parsed ${categories.length} categories and ${tools.length} tools from ttrs.md.`);

async function run() {
  if (categories.length === 0) {
    console.log("No categories parsed. Exiting.");
    return;
  }

  // 1. Insert Categories
  console.log("Inserting categories to Supabase...");
  const catPayload = categories.map(c => ({
    name: c.name,
    slug: c.slug,
    description: c.description || null
  }));

  const catRes = await fetch(`${supabaseUrl}/rest/v1/categories?on_conflict=slug`, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(catPayload)
  });

  if (!catRes.ok) {
    const errText = await catRes.text();
    console.error("Failed to insert categories:", errText);
    process.exit(1);
  }
  console.log("Categories inserted/merged successfully.");

  // 2. Fetch all categories to build slug -> id map
  console.log("Fetching categories database IDs...");
  const fetchCatsRes = await fetch(`${supabaseUrl}/rest/v1/categories`, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  });

  if (!fetchCatsRes.ok) {
    console.error("Failed to retrieve categories map");
    process.exit(1);
  }

  const allCats = await fetchCatsRes.json();
  const categoryMap = {};
  allCats.forEach(c => {
    categoryMap[c.slug] = c.id;
  });

  // 3. Map and Insert Tools in batches
  console.log("Mapping tools to category IDs...");
  const toolsPayload = tools.map(t => {
    const category_id = categoryMap[t.category_slug];
    return {
      name: t.name,
      url: t.url,
      short_description: t.short_description,
      category_id: category_id,
      pricing_model: t.pricing_model,
      tags: t.tags,
      source: t.source,
      status: t.status,
      click_count: 0,
      last_crawled_at: new Date().toISOString()
    };
  }).filter(t => t.category_id);

  console.log(`Prepared ${toolsPayload.length} tools for insertion. Starting database sync...`);

  const BATCH_SIZE = 100;
  let insertedCount = 0;

  for (let i = 0; i < toolsPayload.length; i += BATCH_SIZE) {
    const batch = toolsPayload.slice(i, i + BATCH_SIZE);
    
    const insertToolsRes = await fetch(`${supabaseUrl}/rest/v1/tools?on_conflict=url`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(batch)
    });
    
    if (!insertToolsRes.ok) {
      const errText = await insertToolsRes.text();
      console.error(`Error inserting tools batch ${i / BATCH_SIZE + 1}:`, errText);
    } else {
      insertedCount += batch.length;
      console.log(`Inserted batch ${i / BATCH_SIZE + 1} (${insertedCount}/${toolsPayload.length}).`);
    }
  }

  console.log("Database import completed successfully!");
}

run().catch(err => {
  console.error("Import execution failed:", err);
});
