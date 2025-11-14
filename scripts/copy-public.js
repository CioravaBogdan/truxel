const fs = require('fs');
const path = require('path');

// Copy public/ directory contents to dist/ after web build
const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const distDir = path.join(projectRoot, 'dist');

if (fs.existsSync(publicDir) && fs.existsSync(distDir)) {
  const files = fs.readdirSync(publicDir);
  files.forEach(file => {
    const src = path.join(publicDir, file);
    const dest = path.join(distDir, file);
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${file} to dist/`);
  });
  console.log('✅ All public files copied successfully');
} else {
  console.log('⚠️ public/ or dist/ directory not found');
}
