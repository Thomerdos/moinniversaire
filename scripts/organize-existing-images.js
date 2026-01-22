#!/usr/bin/env node

/**
 * Script to organize existing images in img/ folder by album name
 * Simply reorganizes flat img/ into subdirectories per album (ZIP name)
 * 
 * Usage: node scripts/organize-existing-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ZIP_DIR = path.join(__dirname, '../zip');
const IMG_DIR = path.join(__dirname, '../img');

/**
 * Sanitize folder name from ZIP filename
 */
function sanitizeFolderName(zipName) {
  return zipName
    .replace(/-3(-001)?$/, '')  // Remove "-3-001" or "-3" at the end
    .trim();
}

/**
 * Convert string to slug (lowercase, no spaces, no special chars)
 */
function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .replace(/[^a-z0-9]+/g, '-')       // Replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, '')            // Remove leading/trailing dashes
    .trim();
}

/**
 * Get all image files from a directory (non-recursive, top level only)
 */
function getImageFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir)
    .filter(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      return stat.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(file) && file !== '.gitkeep';
    });
}

/**
 * Interactively organize images by album
 */
async function main() {
  console.log('🚀 Starting interactive image organization process...\n');

  // Get ZIP file names as album names
  const zipFiles = fs.readdirSync(ZIP_DIR)
    .filter(f => f.endsWith('.zip'))
    .map(f => path.basename(f, '.zip'));

  if (zipFiles.length === 0) {
    console.log('❌ No ZIP files found in zip/ directory');
    return;
  }

  const albums = zipFiles.map(z => toSlug(sanitizeFolderName(z)));
  
  console.log('📦 Available albums:');
  albums.forEach((album, i) => {
    console.log(`  ${i + 1}. ${album}`);
  });

  const imageFiles = getImageFiles(IMG_DIR);

  if (imageFiles.length === 0) {
    console.log('ℹ️  No images found in img/ directory');
    return;
  }

  console.log(`\n📸 Found ${imageFiles.length} images to organize\n`);

  // Batch assignment approach - assign all to one album
  console.log('All images will be organized into album subdirectories.');
  console.log('Images with dates are sorted by approximate travel dates.\n');

  let organized = 0;

  // For each album, create folder and collect images
  for (const album of albums) {
    const albumPath = path.join(IMG_DIR, album);
    fs.mkdirSync(albumPath, { recursive: true });
    console.log(`📁 Created: ${album}/`);
  }

  console.log('\n💡 Guide:');
  console.log('  vacances-et-bretonnie-chapter-1 = August 2025 images');
  console.log('  chatons-en-montagne-partie-1 = September 2025 images');
  console.log('  chatons-en-montagne-partie-2 = October 2025 images  ');
  console.log('  chatons-en-montagne-partie-3 = October 2025 images');
  console.log('  chatons-en-montagne-partie-4 = November 2025 images\n');

  // Simple date-based organization with album display names and slugs
  const albumDateRanges = {
    'vacances-et-bretonnie-chapter-1': { start: '20250813', end: '20250823', display: 'Vacances et Bretonnie chapter 1' },
    'chatons-en-montagne-partie-1': { start: '20250918', end: '20250922', display: 'Chatons en montagne partie 1' },
    'chatons-en-montagne-partie-2': { start: '20251011', end: '20251012', display: 'Chatons en montagne partie 2' },
    'chatons-en-montagne-partie-3': { start: '20251024', end: '20251026', display: 'Chatons en montagne partie 3' },
    'chatons-en-montagne-partie-4': { start: '20251108', end: '20251111', display: 'Chatons en montagne partie 4' }
  };

  for (const imageFile of imageFiles) {
    let placed = false;
    
    // Extract date from filename
    const dateMatch = imageFile.match(/20\d{6}/);
    const imageDate = dateMatch ? dateMatch[0] : null;

    if (imageDate) {
      // Find album by date range
      for (const [album, range] of Object.entries(albumDateRanges)) {
        if (imageDate >= range.start && imageDate <= range.end) {
          const imagePath = path.join(IMG_DIR, imageFile);
          const newPath = path.join(IMG_DIR, album, imageFile);
          
          if (imagePath !== newPath && !fs.existsSync(newPath)) {
            fs.renameSync(imagePath, newPath);
            console.log(`✓ ${imageFile} → ${album}/`);
            organized++;
            placed = true;
            break;
          }
        }
      }
    }

    if (!placed) {
      console.log(`❓ ${imageFile} (couldn't auto-assign)`);
    }
  }

  console.log('\n📋 Summary:');
  console.log(`  Organized: ${organized}/${imageFiles.length}`);
  console.log(`  Unorganized: ${imageFiles.length - organized}`);
  console.log('\n✨ Organization complete!');
}

// Run the script
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
