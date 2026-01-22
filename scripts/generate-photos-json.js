#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (error) {
  console.error('⚠️  Sharp n\'est pas disponible. Installation des dimensions par défaut.');
  console.error('   Pour inclure les vraies dimensions, installez sharp: npm install sharp');
  sharp = null;
}

const imgDir = path.join(__dirname, '..', 'public', 'photos');
const albums = {};

// Fonction pour obtenir les dimensions d'une image
async function getImageDimensions(imagePath) {
  if (!sharp) {
    // Si sharp n'est pas disponible, retourner des dimensions par défaut
    return { width: 1920, height: 1440 };
  }
  
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height
    };
  } catch (error) {
    console.error(`⚠️  Erreur lors de la lecture des dimensions de ${imagePath}:`, error.message);
    // Dimensions par défaut en cas d'erreur
    return { width: 1920, height: 1440 };
  }
}

// Lire tous les dossiers d'albums et obtenir les dimensions
async function processAlbums() {
  const albumDirs = fs.readdirSync(imgDir).filter(album => {
    const albumPath = path.join(imgDir, album);
    return fs.statSync(albumPath).isDirectory() && album !== '.gitkeep' && album !== 'thumbs';
  });

  for (const album of albumDirs) {
    const albumPath = path.join(imgDir, album);
    const files = fs.readdirSync(albumPath)
      .filter(file => file.endsWith('.webp'))
      .sort();
    
    albums[album] = [];
    
    for (const file of files) {
      const filePath = path.join(albumPath, file);
      const dimensions = await getImageDimensions(filePath);
      albums[album].push({
        filename: file,
        width: dimensions.width,
        height: dimensions.height
      });
    }
  }

  // Créer le dossier public/photos s'il n'existe pas
  const photosDir = path.join(__dirname, '..', 'public', 'photos');
  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
  }

  // Écrire le JSON
  fs.writeFileSync(
    path.join(photosDir, 'photos-data.json'),
    JSON.stringify(albums, null, 2)
  );

  console.log('✅ photos-data.json créé avec les dimensions des images');
  console.log('Albums trouvés:', Object.keys(albums));
  Object.entries(albums).forEach(([album, files]) => {
    console.log(`  - ${album}: ${files.length} images`);
  });
}

// Exécuter le traitement
processAlbums().catch(error => {
  console.error('❌ Erreur lors de la génération du JSON:', error);
  process.exit(1);
});
