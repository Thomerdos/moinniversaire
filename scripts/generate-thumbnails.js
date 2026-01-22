#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgDir = path.join(__dirname, '..', 'img');
const thumbsDir = path.join(__dirname, '..', 'public', 'photos', 'thumbs');

// Configuration des thumbnails
const THUMB_WIDTH = 400; // Largeur max pour les miniatures
const THUMB_QUALITY = 80; // Qualité WebP pour les miniatures

// Créer le dossier des thumbnails s'il n'existe pas
if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true });
  console.log(`✅ Dossier créé: ${thumbsDir}`);
}

let totalProcessed = 0;
let totalSkipped = 0;

// Traiter chaque album
const albums = fs.readdirSync(imgDir).filter(album => {
  const albumPath = path.join(imgDir, album);
  return fs.statSync(albumPath).isDirectory() && album !== '.gitkeep';
});

console.log(`📸 Génération des thumbnails pour ${albums.length} albums...\n`);

for (const album of albums) {
  const albumPath = path.join(imgDir, album);
  const albumThumbsDir = path.join(thumbsDir, album);
  
  // Créer le sous-dossier pour l'album
  if (!fs.existsSync(albumThumbsDir)) {
    fs.mkdirSync(albumThumbsDir, { recursive: true });
  }
  
  const files = fs.readdirSync(albumPath).filter(file => file.endsWith('.webp'));
  
  console.log(`📁 ${album}: ${files.length} images`);
  
  for (const file of files) {
    const inputPath = path.join(albumPath, file);
    const outputPath = path.join(albumThumbsDir, file);
    
    // Skip si le thumbnail existe déjà
    if (fs.existsSync(outputPath)) {
      totalSkipped++;
      continue;
    }
    
    try {
      await sharp(inputPath)
        .resize(THUMB_WIDTH, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: THUMB_QUALITY })
        .toFile(outputPath);
      
      totalProcessed++;
      
      if (totalProcessed % 10 === 0) {
        process.stdout.write(`   Traité: ${totalProcessed}/${files.length}\r`);
      }
    } catch (error) {
      console.error(`   ❌ Erreur pour ${file}:`, error.message);
    }
  }
  
  console.log(`   ✅ ${totalProcessed} thumbnails créés\n`);
}

console.log(`\n🎉 Terminé!`);
console.log(`   • ${totalProcessed} nouveaux thumbnails créés`);
console.log(`   • ${totalSkipped} thumbnails existants conservés`);
console.log(`   • Taille des thumbnails: ${THUMB_WIDTH}px de large @ ${THUMB_QUALITY}% qualité\n`);
