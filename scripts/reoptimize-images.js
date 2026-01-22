#!/usr/bin/env node

/**
 * Script to re-optimize existing images with better compression
 * Reduces file size by lowering quality and max dimensions
 * 
 * Usage: node scripts/reoptimize-images.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHOTOS_DIR = path.join(__dirname, '../public/photos');
const TEMP_DIR = path.join(__dirname, '../temp-reoptimize');

// Nombre de fichiers à traiter en parallèle
const PARALLEL_LIMIT = 5;

/**
 * Get all WebP images recursively (excluding thumbs/)
 */
function getImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'thumbs' && file !== 'photos-data.json') {
      getImageFiles(filePath, fileList);
    } else if (file.endsWith('.webp')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Re-optimize an image
 */
async function reoptimizeImage(imagePath) {
  try {
    const originalSize = fs.statSync(imagePath).size;
    const tempPath = path.join(TEMP_DIR, path.basename(imagePath));

    // Re-optimize with better compression
    await sharp(imagePath)
      .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(tempPath);

    const newSize = fs.statSync(tempPath).size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    // Replace original with optimized version
    fs.copyFileSync(tempPath, imagePath);
    fs.unlinkSync(tempPath);

    return {
      path: imagePath,
      originalSize,
      newSize,
      savings: parseFloat(savings)
    };
  } catch (error) {
    console.error(`  ✗ Error re-optimizing ${path.basename(imagePath)}:`, error.message);
    return null;
  }
}

/**
 * Process images in batches
 */
async function processInBatches(images, batchSize) {
  const results = [];
  
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(images.length / batchSize);
    
    console.log(`\n📦 Traitement du lot ${batchNumber}/${totalBatches} (${batch.length} images)...`);
    
    const batchResults = await Promise.all(
      batch.map(img => reoptimizeImage(img))
    );
    
    const successful = batchResults.filter(r => r !== null);
    results.push(...successful);
    
    // Progress update
    const processed = results.length;
    const totalSavings = results.reduce((sum, r) => sum + (r.originalSize - r.newSize), 0);
    const totalSavingsMB = (totalSavings / 1024 / 1024).toFixed(2);
    
    console.log(`  ✓ ${successful.length}/${batch.length} images optimisées`);
    console.log(`  💾 Économie totale jusqu'ici: ${totalSavingsMB} MB`);
  }
  
  return results;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Ré-optimisation des images existantes...\n');

  // Create temp directory
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  try {
    // Get all images
    const images = getImageFiles(PHOTOS_DIR);
    
    if (images.length === 0) {
      console.log('ℹ️  Aucune image trouvée');
      return;
    }

    console.log(`📊 ${images.length} images à ré-optimiser\n`);
    console.log(`⚙️  Nouveaux paramètres:`);
    console.log(`   - Taille max: 1400px (au lieu de 1920px)`);
    console.log(`   - Qualité WebP: 75 (au lieu de 85)`);

    // Process images
    const results = await processInBatches(images, PARALLEL_LIMIT);

    // Summary
    const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalNewSize = results.reduce((sum, r) => sum + r.newSize, 0);
    const totalSavings = totalOriginalSize - totalNewSize;
    const avgSavings = results.reduce((sum, r) => sum + r.savings, 0) / results.length;

    console.log('\n📋 Résumé:');
    console.log(`  Total images traitées: ${results.length}`);
    console.log(`  Taille originale: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Nouvelle taille: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Économie totale: ${(totalSavings / 1024 / 1024).toFixed(2)} MB (${avgSavings.toFixed(1)}% en moyenne)`);
    console.log(`\n✨ Optimisation terminée!`);

  } finally {
    // Cleanup temp directory
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Erreur fatale:', error);
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  process.exit(1);
});
