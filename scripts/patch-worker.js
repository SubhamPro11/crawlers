const fs = require('fs');
const path = require('path');

const workerDir = path.join(__dirname, '../.vercel/output/static/_worker.js');
const indexPath = path.join(workerDir, 'index.js');
const originalPath = path.join(workerDir, 'original_index.js');

function patch() {
  console.log('Patching Cloudflare Worker to capture runtime errors...');

  if (!fs.existsSync(indexPath)) {
    console.error('Error: index.js not found at', indexPath);
    return;
  }

  // Rename original index.js to original_index.js
  if (fs.existsSync(originalPath)) {
    fs.unlinkSync(originalPath);
  }
  fs.renameSync(indexPath, originalPath);

  // Write new index.js wrapper
  const wrapperCode = `
import original from './original_index.js';

export default {
  async fetch(request, env, ctx) {
    try {
      return await original.fetch(request, env, ctx);
    } catch (e) {
      const errorText = "WORKER RUNTIME ERROR:\\n" + (e.stack || e.message || String(e));
      console.error(errorText);
      return new Response(errorText, {
        status: 200,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
`;

  fs.writeFileSync(indexPath, wrapperCode.trim());
  console.log('Worker successfully patched with try-catch diagnostic wrapper.');
}

patch();
