const fs = require('fs-extra');
const path = require('path');

// Define paths
const staticSrcDir = path.join(__dirname, 'src', 'static');
const staticDestDir = path.join(__dirname, 'dist', 'static');

// Ensure the destination directory exists
fs.ensureDirSync(staticDestDir);

// Copy static files if the source directory exists
if (fs.existsSync(staticSrcDir)) {
  console.log('Copying static files to dist folder...');
  fs.copySync(staticSrcDir, staticDestDir);
  console.log('Static files copied successfully!');
} else {
  console.log('Static source directory not found. Skipping copy.');
}

// Copy static directory from project root if it exists
const rootStaticDir = path.join(__dirname, 'static');
if (fs.existsSync(rootStaticDir)) {
  console.log('Copying root static files to dist folder...');
  fs.copySync(rootStaticDir, path.join(__dirname, 'dist', 'static'));
  console.log('Root static files copied successfully!');
} else {
  console.log('Root static directory not found. Skipping copy.');
}

console.log('Build post-processing completed!');