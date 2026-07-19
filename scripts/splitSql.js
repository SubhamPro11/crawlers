const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\badbo\\.gemini\\antigravity-ide\\brain\\eacdf494-0bb2-4d17-9933-2c2293492422\\scratch\\insert_all.sql';
let content = '';
try {
  content = fs.readFileSync(srcPath, 'utf8');
} catch (err) {
  console.error("Could not read file:", err.message);
  process.exit(1);
}

const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && l !== 'BEGIN;' && l !== 'COMMIT;');

const categoriesLines = lines.filter(l => l.startsWith('INSERT INTO categories'));
const toolsLines = lines.filter(l => l.startsWith('INSERT INTO tools'));

console.log(`Found ${categoriesLines.length} category inserts and ${toolsLines.length} tool inserts.`);

// Chunk 1: Categories
const outDir = 'C:\\Users\\badbo\\.gemini\\antigravity-ide\\brain\\eacdf494-0bb2-4d17-9933-2c2293492422\\scratch';

if (categoriesLines.length > 0) {
  fs.writeFileSync(path.join(outDir, 'chunk_0_categories.sql'), categoriesLines.join('\n'), 'utf8');
  console.log("Wrote chunk_0_categories.sql");
}

const chunkSize = 100;
let fileIndex = 1;
for (let i = 0; i < toolsLines.length; i += chunkSize) {
  const chunk = toolsLines.slice(i, i + chunkSize);
  fs.writeFileSync(path.join(outDir, `chunk_${fileIndex}_tools.sql`), chunk.join('\n'), 'utf8');
  console.log(`Wrote chunk_${fileIndex}_tools.sql`);
  fileIndex++;
}

console.log("Splitting completed successfully.");
