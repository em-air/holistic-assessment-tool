const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Get all TypeScript files in src directory
function getEntryPoints(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getEntryPoints(fullPath));
    } else if (item.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const entryPoints = getEntryPoints('./src');

esbuild.buildSync({
  entryPoints,
  outdir: 'dist',
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  sourcemap: true,
  bundle: false,
});

console.log('Build completed successfully!');
