#!/usr/bin/env node

/**
 * Script to extract ZIP files from zip/ folder, optimize images to WebP,
 * and organize them in the img/ folder by album (ZIP name)
 * 
 * Usage: node scripts/extract-and-optimize.js
 */

import extract from 'extract-zip';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ZIP_DIR = path.join(__dirname, '../zip');
const TEMP_EXTRACT_DIR = path.join(__dirname, '../temp-extract');
const IMG_DIR = path.join(__dirname, '../img');

// Create directories if they don't exist
fs.mkdirSync(IMG_DIR, { recursive: true });

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
 * Sanitize folder name from ZIP filename
 */
function sanitizeFolderName(zipName) {
  return zipName
    .replace(/-3(-001)?$/, '')  // Remove "-3-001" or "-3" at the end
    .trim();
}

/**
 * Get all ZIP files from the zip directory
 */
function getZipFiles() {
  if (!fs.existsSync(ZIP_DIR)) {
    console.log(`ℹ️  ZIP directory not found: ${ZIP_DIR}`);
    return [];
  }

  const files = fs.readdirSync(ZIP_DIR).filter(file => file.endsWith('.zip'));
  return files.map(file => path.join(ZIP_DIR, file));
}

/**
 * Optimize an image to WebP format
 */
async function optimizeImage(inputPath, outputPath, baseName) {
  try {
    const metadata = await sharp(inputPath).metadata();

    // Create optimized WebP (max 1920px)
    await sharp(inputPath)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`  ✓ ${baseName}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error optimizing ${baseName}:`, error.message);
    return false;
  }
}

/**
 * Extract a ZIP file
 */
async function extractZip(zipPath) {
  const zipName = path.basename(zipPath, '.zip');
  const extractPath = path.join(TEMP_EXTRACT_DIR, zipName);

  console.log(`📦 Extracting: ${zipName}...`);

  try {
    await extract(zipPath, { dir: extractPath });
    console.log(`✅ Extracted: ${zipName}`);
    return extractPath;
  } catch (error) {
    console.error(`❌ Error extracting ${zipName}:`, error.message);
    return null;
  }
}

/**
 * Sanitize folder name from ZIP filename
 */
function sanitizeFolderName(zipName) {
  // Remove trailing "-3-001" or "-3" patterns that indicate part numbers
  return zipName
    .replace(/-3(-001)?$/, '')  // Remove "-3-001" or "-3" at the end
    .trim();
}

/**
 * Clean up temporary extraction directory
 */
function cleanupTempDir() {
  if (fs.existsSync(TEMP_EXTRACT_DIR)) {
    console.log('🧹 Cleaning up temporary files...');
    fs.rmSync(TEMP_EXTRACT_DIR, { recursive: true, force: true });
    console.log('✅ Temporary files cleaned');
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting image extraction and optimization process...\n');

  const zipFiles = getZipFiles();

  if (zipFiles.length === 0) {
    console.log('ℹ️  No ZIP files found in the zip/ directory');
    return;
  }

  console.log(`📊 Found ${zipFiles.length} ZIP file(s) to process\n`);

  let totalImages = 0;
  let successCount = 0;

  // Create temp extraction directory
  fs.mkdirSync(TEMP_EXTRACT_DIR, { recursive: true });

  try {
    // Extract all ZIP files
    for (const zipPath of zipFiles) {
      const extractPath = await extractZip(zipPath);
      if (!extractPath) continue;

      // Get ZIP filename without extension for album folder
      const zipFilename = path.basename(zipPath, '.zip');
      const albumName = toSlug(sanitizeFolderName(zipFilename));
      const albumPath = path.join(IMG_DIR, albumName);
      
      // Create album folder
      fs.mkdirSync(albumPath, { recursive: true });

      // Get all images from extracted directory
      const images = getImageFilesRecursive(extractPath);

      if (images.length === 0) {
        console.log(`  ℹ️  No images found in this ZIP`);
        continue;
      }

      console.log(`  📸 Processing ${images.length} image(s)...`);

      // Optimize each image
      for (const imagePath of images) {
        totalImages++;
        const originalName = path.basename(imagePath, path.extname(imagePath));
        const baseName = originalName.replace(/[^a-zA-Z0-9-_]/g, '_');
        const outputName = `${baseName}.webp`;
        const outputPath = path.join(albumPath, outputName);

        // Avoid overwriting, add suffix if needed
        let finalOutputPath = outputPath;
        let counter = 1;
        while (fs.existsSync(finalOutputPath)) {
          const baseFinal = baseName.replace(/_\d+$/, '');
          finalOutputPath = path.join(albumPath, `${baseFinal}_${counter}.webp`);
          counter++;
        }

        if (await optimizeImage(imagePath, finalOutputPath, path.basename(finalOutputPath))) {
          successCount++;
        }
      }

      console.log('');
    }
  } finally {
    // Always clean up temp directory
    cleanupTempDir();
  }

  // Summary
  console.log('📋 Summary:');
  console.log(`  Total images processed: ${totalImages}`);
  console.log(`  Successfully optimized: ${successCount}`);
  console.log(`  Failed: ${totalImages - successCount}`);
  console.log(`\n✨ Images saved to: ${IMG_DIR}`);
}

// Run the script
main().catch(error => {
  console.error('💥 Fatal error:', error);
  cleanupTempDir();
  process.exit(1);
});
