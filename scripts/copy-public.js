const fs = require('fs');
const path = require('path');

// Copy public/ directory contents (including subdirectories) to dist/ after web build
const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const distDir = path.join(projectRoot, 'dist');

if (fs.existsSync(publicDir) && fs.existsSync(distDir)) {
  const entries = fs.readdirSync(publicDir);
  entries.forEach(entry => {
    const src = path.join(publicDir, entry);
    const dest = path.join(distDir, entry);
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`✅ Copied ${entry} to dist/`);
  });
  console.log('✅ All public files copied successfully');
} else {
  console.log('⚠️ public/ or dist/ directory not found');
}
