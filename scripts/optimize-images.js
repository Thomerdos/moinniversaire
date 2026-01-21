/**
 * Script to optimize images from img/ folder
 * Creates optimized versions in public/photos/
 * - Full size: max 1920px, quality 85%
 * - Thumbnail: max 600px, quality 80%
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const INPUT_DIR = 'img';
const OUTPUT_DIR = 'public/photos';
const THUMBS_DIR = 'public/photos/thumbs';

// Create output directories
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(THUMBS_DIR, { recursive: true });

// Get all image files
const imageFiles = fs.readdirSync(INPUT_DIR).filter(file => 
  /\.(jpg|jpeg|png|webp)$/i.test(file)
);

console.log(`Found ${imageFiles.length} images to optimize...`);

const photosData = [];

for (const file of imageFiles) {
  const inputPath = path.join(INPUT_DIR, file);
  const baseName = file.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
  const outputName = `${baseName}.webp`;
  const outputPath = path.join(OUTPUT_DIR, outputName);
  const thumbPath = path.join(THUMBS_DIR, outputName);

  try {
    // Get original image metadata
    const metadata = await sharp(inputPath).metadata();
    
    // Create optimized full-size image (max 1920px)
    await sharp(inputPath)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Create thumbnail (max 600px)
    await sharp(inputPath)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    // Get optimized image dimensions
    const optimizedMeta = await sharp(outputPath).metadata();

    // Extract date from filename (PXL_YYYYMMDD_...)
    const dateMatch = file.match(/PXL_(\d{4})(\d{2})(\d{2})/);
    const date = dateMatch 
      ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
      : null;

    photosData.push({
      id: baseName,
      src: `./photos/${outputName}`,
      thumbnail: `./photos/thumbs/${outputName}`,
      width: optimizedMeta.width,
      height: optimizedMeta.height,
      date: date,
      title: ''
    });

    const originalSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);
    
    console.log(`✓ ${file} → ${outputName} (${savings}% smaller)`);
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
}

// Sort by date (newest first)
photosData.sort((a, b) => {
  if (!a.date) return 1;
  if (!b.date) return -1;
  return b.date.localeCompare(a.date);
});

// Write photos data JSON
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'photos-data.json'),
  JSON.stringify({ photos: photosData, lastUpdate: new Date().toISOString() }, null, 2)
);

console.log(`\n✅ Optimized ${photosData.length} images`);
console.log(`📁 Output: ${OUTPUT_DIR}/`);
console.log(`📄 Data: ${OUTPUT_DIR}/photos-data.json`);
