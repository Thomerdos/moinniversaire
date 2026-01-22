#!/usr/bin/env node

/**
 * Script to detect and remove duplicate images based on filename similarity
 * Finds images with the same base name (ignoring -2, -retouche, -edit suffixes and extensions)
 * Keeps the first occurrence and removes subsequent ones
 * 
 * Usage: node scripts/detect-duplicates.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMG_DIR = path.join(__dirname, '../img');

/**
 * Extract base name from filename (without version suffixes or extensions)
 * Examples:
 *   photo_001.jpg -> photo_001
 *   photo_001-2.jpg -> photo_001
 *   photo_001-retouche.jpg -> photo_001
 *   photo_001-edit.jpg -> photo_001
 *   photo_001.webp -> photo_001
 */
function getBaseName(filename) {
  // Remove extension
  let name = filename.replace(/\.[^.]+$/, '');
  
  // Remove common suffixes that indicate versions/edits
  name = name
    .replace(/-\d+$/, '')           // Remove -2, -3, etc.
    .replace(/-(retouche|edit|copy|backup|v\d+)$/i, '')  // Remove common edit markers
    .replace(/_\d+$/, '');          // Remove _2, _3, etc.
  
  return name;
}

/**
 * Get all image files recursively from a directory
 */
function getImageFilesRecursive(dir) {
  let images = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recurse into subdirectories (albums)
      images = images.concat(getImageFilesRecursive(fullPath));
    } else if (entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
      images.push(fullPath);
    }
  }

  return images;
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Starting filename-based duplicate detection...\n');

  if (!fs.existsSync(IMG_DIR)) {
    console.log('❌ Image directory not found: ' + IMG_DIR);
    return;
  }

  // Get all images
  const allImages = getImageFilesRecursive(IMG_DIR);

  if (allImages.length === 0) {
    console.log('ℹ️  No images found in img/ directory');
    return;
  }

  console.log(`📸 Found ${allImages.length} images\n`);

  // Map of base name -> array of file paths
  const baseNameMap = new Map();

  // Group images by base name
  for (const imagePath of allImages) {
    const filename = path.basename(imagePath);
    const baseName = getBaseName(filename);
    
    if (!baseNameMap.has(baseName)) {
      baseNameMap.set(baseName, []);
    }
    baseNameMap.get(baseName).push(imagePath);
  }

  // Find duplicates
  let duplicatesFound = 0;
  let duplicateFiles = [];

  for (const [baseName, filePaths] of baseNameMap) {
    if (filePaths.length > 1) {
      duplicatesFound++;
      console.log(`\n🔴 DUPLICATE SET #${duplicatesFound} (base: "${baseName}")`);
      console.log(`   Found ${filePaths.length} similar files:`);

      // Sort by path for consistent behavior
      filePaths.sort();

      filePaths.forEach((filePath, index) => {
        const stat = fs.statSync(filePath);
        const sizeKb = (stat.size / 1024).toFixed(1);
        const filename = path.basename(filePath);
        const keep = index === 0 ? ' ✓ [KEEP]' : ' ✗ [DELETE]';
        console.log(`   ${index + 1}. ${filename} (${sizeKb} KB)${keep}`);

        // Add to delete list if not the first occurrence
        if (index > 0) {
          duplicateFiles.push(filePath);
        }
      });
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 Summary:');
  console.log(`  Total images: ${allImages.length}`);
  console.log(`  Duplicate sets found: ${duplicatesFound}`);
  console.log(`  Duplicate files to remove: ${duplicateFiles.length}`);

  if (duplicateFiles.length === 0) {
    console.log('\n✨ No duplicates found! Your gallery is clean.');
    return;
  }

  // Ask for confirmation
  console.log('\n⚠️  WARNING: The files listed above with [DELETE] will be permanently removed.');
  console.log('Continuing will delete these duplicate images.\n');

  // Auto-delete duplicates
  console.log('🗑️  Removing duplicate files...\n');

  let deletedCount = 0;
  for (const filePath of duplicateFiles) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✓ Deleted: ${path.basename(filePath)}`);
      deletedCount++;
    } catch (error) {
      console.error(`✗ Error deleting ${filePath}:`, error.message);
    }
  }

  console.log(`\n✨ Process complete!`);
  console.log(`  Successfully deleted: ${deletedCount}/${duplicateFiles.length} duplicates`);
  console.log(`  Total images remaining: ${allImages.length - deletedCount}`);
}

// Run the script
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

