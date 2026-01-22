#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgDir = path.join(__dirname, '..', 'img');
const albums = {};

// Lire tous les dossiers d'albums
fs.readdirSync(imgDir).forEach(album => {
  const albumPath = path.join(imgDir, album);
  if (fs.statSync(albumPath).isDirectory() && album !== '.gitkeep') {
    albums[album] = fs.readdirSync(albumPath)
      .filter(file => file.endsWith('.webp'))
      .sort();
  }
});

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

console.log('✅ photos-data.json créé');
console.log('Albums trouvés:', Object.keys(albums));
Object.entries(albums).forEach(([album, files]) => {
  console.log(`  - ${album}: ${files.length} images`);
});
