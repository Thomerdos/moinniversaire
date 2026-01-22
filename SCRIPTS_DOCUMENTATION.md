# Scripts de Gestion des Images

## Vue d'ensemble

Ce projet utilise des scripts Node.js pour automatiser l'extraction, l'optimisation et l'organisation des images de voyage en albums.

## Scripts disponibles

### 1. `extract-and-optimize.js`

**Objectif**: Extraire tous les fichiers ZIP du dossier `zip/`, optimiser les images en WebP et les organiser par album.

**Utilisation**:
```bash
npm run extract-and-optimize
```

**Fonctionnalités**:
- Extrait automatiquement tous les ZIPs du dossier `zip/`
- Convertit les images en format WebP optimisé (max 1920px, qualité 85%)
- Organise les images dans des sous-dossiers nommés d'après les ZIPs (format slug: minuscules, tirets)
- Nettoie automatiquement les fichiers temporaires
- Gère les doublons en ajoutant des suffixes numériques

**Processus**:
1. Lecture des fichiers ZIP dans le dossier `zip/`
2. Extraction temporaire dans `temp-extract/`
3. Recherche récursive des images (.jpg, .jpeg, .png, .webp)
4. Optimisation en WebP via Sharp
5. Placement dans `img/[album-slug]/`
6. Suppression des fichiers temporaires

**Exemple de structure créée**:
```
img/
├── chatons-en-montagne-partie-1/
│   ├── PXL_20250920_090238049_MP.webp
│   ├── PXL_20250920_090255053_MP.webp
│   └── ... (95 images)
├── chatons-en-montagne-partie-2/
│   └── ... (64 images)
└── ...
```

### 2. `organize-existing-images.js`

**Objectif**: Organiser les images existantes dans le dossier `img/` en sous-dossiers par album, basé sur les dates des images.

**Utilisation**:
```bash
npm run organize-images
```

**Fonctionnalités**:
- Crée les dossiers albums s'ils n'existent pas
- Classe les images par plage de dates correspondant aux albums
- Utilise le format slug pour les noms de dossiers
- Affiche le statut de chaque image (organisée ou non)

**Mapping des albums par date**:
- `vacances-et-bretonnie-chapter-1`: 13 août - 23 août 2025
- `chatons-en-montagne-partie-1`: 18 septembre - 22 septembre 2025
- `chatons-en-montagne-partie-2`: 11 octobre - 12 octobre 2025
- `chatons-en-montagne-partie-3`: 24 octobre - 26 octobre 2025
- `chatons-en-montagne-partie-4`: 8 novembre - 11 novembre 2025

### 3. `optimize-images.js`

**Objectif**: Optimiser les images et créer des miniatures pour la galerie web.

**Utilisation**:
```bash
npm run optimize-images
```

**Fonctionnalités**:
- Crée des versions optimisées en WebP (max 1920px)
- Crée des miniatures (max 600px) dans `public/photos/thumbs/`
- Génère un fichier JSON avec les métadonnées

## Configuration et Dépendances

### Dépendances requises:

```json
{
  "devDependencies": {
    "sharp": "^0.34.5",
    "extract-zip": "^2.0.1"
  }
}
```

**Sharp**: Bibliothèque de traitement d'images haute performance
**extract-zip**: Extraction native de fichiers ZIP

### Configuration Node.js:

- **Version recommandée**: Node.js 20.11.1 ou supérieure
- **Type de module**: ES Modules (type: "module" dans package.json)

## Workflow recommandé

1. **Première utilisation**: Placer les ZIPs dans le dossier `zip/`
   ```bash
   npm run extract-and-optimize
   ```

2. **Mises à jour**: Si vous ajoutez de nouveaux ZIPs
   ```bash
   npm run extract-and-optimize
   ```

3. **Images existantes**: Si les images sont déjà extraites mais désorganisées
   ```bash
   npm run organize-images
   ```

4. **Pour la galerie web**: Créer les miniatures optimisées
   ```bash
   npm run optimize-images
   ```

## .gitignore

Le projet est configuré pour ignorer:
- `zip/` - Fichiers ZIP sources (volumineux)
- `img/` - Images non optimisées (volumineux)
- `temp-extract/` - Fichiers temporaires

Seuls les `.gitkeep` sont versionnés pour maintenir la structure des dossiers.

## Détails techniques

### Optimisation des images

**Sharp - Paramètres d'optimisation**:
- **Format**: WebP (meilleure compression)
- **Taille max**: 1920px (haute qualité pour affichage)
- **Qualité**: 85% (bon équilibre qualité/taille)
- **Mode resize**: `inside` (respecte les proportions, sans agrandissement)

**Exemple de réduction de taille**:
- Image originale JPEG: ~2MB
- Image optimisée WebP: ~200-400KB
- Miniature: ~30-50KB

### Gestion des doublons

Si plusieurs images ont le même nom:
```
image.webp       → image.webp
image.webp       → image_1.webp
image.webp       → image_2.webp
```

### Slugification des noms

La fonction `toSlug()` convertit les noms en slugs:
- Minuscules: `CHATONS` → `chatons`
- Espaces en tirets: `chatons en montagne` → `chatons-en-montagne`
- Caractères spéciaux supprimés: `é` → `e`
- Tirets multiples fusionnés: `chatons--en` → `chatons-en`

## Troubleshooting

### Erreur Sharp "linux-x64"
```
Error: Could not load the "sharp" module using the linux-x64 runtime
```

**Solution**:
```bash
nvm use 20.11.1  # Utiliser une version Node.js compatible
npm install --include=optional sharp
```

### Images non extraites

Vérifier que:
1. Les ZIPs sont dans le dossier `zip/`
2. Les images sont dans les sous-dossiers des ZIPs (recherche récursive)
3. L'extension est `.jpg`, `.jpeg`, `.png`, ou `.webp`

### Dossier img trop volumineux

Si `img/` occupe beaucoup d'espace:
- Ces dossiers ne sont pas versionnés (dans `.gitignore`)
- Les images originales peuvent être supprimées après optimisation
- Les ZIPs source peuvent être archivés ailleurs

## Performance

**Temps d'exécution estimé**:
- 515 images: ~30-60 secondes
- Dépend de: résolution, nombre de ZIPs, puissance CPU

**Espace disque**:
- ZIP source: ~6GB
- Images extraites: ~300MB-1GB
- Images optimisées WebP: ~150-300MB

## Voir aussi

- [Configuration Vite](vite.config.js)
- [Configuration UnoCSS](uno.config.js)
- [Structure du projet](README.md)
