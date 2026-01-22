# Scripts de Gestion des Images

## Vue d'ensemble

Ce projet utilise des scripts Node.js pour automatiser l'extraction, l'optimisation et l'organisation des images de voyage en albums.

## 🚀 Workflow Complet (Recommandé)

Pour traiter de nouveaux ZIPs en une seule commande :

```bash
npm run process-photos
```

Cette commande exécute séquentiellement :
1. **Extraction et optimisation** des ZIPs → images WebP organisées par album
2. **Génération des miniatures** 400px pour la galerie
3. **Création du JSON** metadata pour l'application

## Scripts disponibles

### 1. `extract-and-optimize.js` ⭐ Principal

**Objectif**: Extraire tous les fichiers ZIP du dossier `zip/`, optimiser les images en WebP et les organiser par album.

**Utilisation**:
```bash
npm run extract-and-optimize
```

**Fonctionnalités**:
- Extrait automatiquement tous les ZIPs du dossier `zip/` en parallèle
- Convertit les images en format WebP optimisé (max 1400px, qualité 75%)
- Organise les images dans `public/photos/[album-slug]/`
- Nettoie automatiquement les fichiers temporaires
- Gère les doublons en ajoutant des suffixes numériques

**Processus**:
1. Lecture des fichiers ZIP dans le dossier `zip/`
2. Extraction parallèle temporaire dans `temp-extract/`
3. Recherche récursive des images (.jpg, .jpeg, .png, .webp)
4. Optimisation parallèle (5 images à la fois) en WebP via Sharp
5. Placement dans `public/photos/[album-slug]/`
6. Suppression automatique des fichiers temporaires

**Exemple de structure créée**:
```
public/photos/
├── chatons-en-montagne-partie-1/
│   ├── PXL_20250920_090238049_MP.webp
│   ├── PXL_20250920_090255053_MP.webp
│   └── ... (95 images)
├── chatons-en-montagne-partie-2/
│   └── ... (64 images)
└── ...
```

### 2. `generate-thumbnails.js`

**Objectif**: Générer les miniatures (400px) pour toutes les images optimisées.

**Utilisation**:
```bash
npm run generate-thumbs
```

**Fonctionnalités**:
- Parcourt tous les albums dans `public/photos/`
- Crée des miniatures 400px (qualité 80%) dans `public/photos/thumbs/[album]/`
- Traitement parallèle (5 images à la fois) pour plus de rapidité
- Saute les miniatures déjà existantes
- Affiche la progression par batch

**Structure créée**:
```
public/photos/thumbs/
├── chatons-en-montagne-partie-1/
│   ├── image001.webp (400px max)
│   └── ...
└── ...
```

### 3. `generate-photos-json.js`

**Objectif**: Créer le fichier `photos-data.json` avec la liste de toutes les images organisées par album.

**Utilisation**:
```bash
npm run generate-photos-json
```

**Fonctionnalités**:
- Lit récursivement tous les albums dans `public/photos/`
- Liste tous les fichiers `.webp` par album
- Génère `public/photos/photos-data.json`
- **Exécuté automatiquement** lors du `npm run build`

**Format JSON généré**:
```json
{
  "chatons-en-montagne-partie-1": [
    "image001.webp",
    "image002.webp",
    ...
  ],
  "chatons-en-montagne-partie-2": [...],
  ...
}
```

### 4. `reoptimize-images.js` 🔧 Utilitaire

**Objectif**: Ré-optimiser les images existantes avec de meilleurs paramètres de compression (one-time utility).

**Utilisation**:
```bash
npm run reoptimize
```

**Fonctionnalités**:
- Ré-optimise toutes les images WebP existantes
- Réduit la taille max à 1400px (au lieu de 1920px)
- Baisse la qualité à 75% (au lieu de 85%)
- Traitement par batches de 5 images en parallèle
- Affiche les économies d'espace réalisées
- **Utilisation ponctuelle** : après changement des paramètres d'optimisation

**Résultat typique**:
```
Total images traitées: 515
Taille originale: 312.24 MB
Nouvelle taille: 105.51 MB
Économie totale: 206.73 MB (66.3% en moyenne)
```

## 📋 Workflow Recommandé

### Ajouter de nouveaux albums (nouveaux ZIPs)

1. **Placer les ZIPs** dans le dossier `zip/`
2. **Exécuter le workflow complet**:
   ```bash
   npm run process-photos
   ```
   Cela va :
   - Extraire et optimiser les images (1400px, qualité 75%)
   - Générer les miniatures 400px
   - Mettre à jour le JSON metadata

3. **Tester localement**:
   ```bash
   npm run dev
   ```

4. **Builder pour production**:
   ```bash
   npm run build
   ```
   (Le JSON sera automatiquement régénéré)

### Modifier les paramètres d'optimisation

Si vous modifiez les paramètres dans `extract-and-optimize.js` et voulez ré-optimiser les images existantes :

```bash
npm run reoptimize
npm run generate-thumbs  # Régénérer aussi les miniatures si nécessaire
```

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

- **Version recommandée**: Node.js 16+ ou supérieure
- **Type de module**: ES Modules (`"type": "module"` dans package.json)

### Paramètres d'optimisation actuels:

- **Images optimisées**: Max 1400px, qualité WebP 75%
- **Miniatures**: Max 400px, qualité WebP 80%
- **Parallélisme**: 5 images traitées simultanément

## Structure des Dossiers

```
moinniversaire/
├── zip/                          # 📦 Fichiers ZIP sources (gitignored)
│   ├── Album 1.zip
│   ├── Album 2.zip
│   └── .gitkeep
├── public/
│   └── photos/                   # ✅ Images optimisées (committed in git)
│       ├── album-1/              # Albums organisés
│       │   ├── image001.webp
│       │   └── image002.webp
│       ├── thumbs/               # Miniatures 400px
│       │   └── album-1/
│       │       ├── image001.webp
│       │       └── image002.webp
│       └── photos-data.json      # Metadata JSON
├── temp-extract/                 # 🗑️ Extraction temporaire (gitignored, auto-cleaned)
└── scripts/
    ├── extract-and-optimize.js   # ⭐ Script principal
    ├── generate-thumbnails.js    # Génération miniatures
    ├── generate-photos-json.js   # Génération JSON
    └── reoptimize-images.js      # Utilitaire ré-optimisation
```

## .gitignore

Le projet est configuré pour ignorer:
- `zip/` - Fichiers ZIP sources (très volumineux, non nécessaires en production)
- `temp-extract/` - Fichiers temporaires d'extraction (auto-nettoyés)

Les images optimisées dans `public/photos/` sont **incluses dans Git** (~ 110 MB après optimisation).

## 🎯 Scripts NPM Disponibles

```bash
# Workflow complet (recommandé pour nouveaux ZIPs)
npm run process-photos

# Scripts individuels
npm run extract-and-optimize   # Extraire ZIPs → optimiser → organiser
npm run generate-thumbs         # Générer miniatures 400px
npm run generate-photos-json    # Créer le JSON metadata
npm run reoptimize              # Ré-optimiser images existantes (utility)

# Développement
npm run dev                     # Serveur de développement
npm run build                   # Build production (inclut generate-photos-json)
npm run preview                 # Preview du build
```

## 📝 Notes Importantes

1. **Les images sont dans Git** : Les images optimisées (~ 110 MB) sont commitées pour simplifier le déploiement
2. **Build automatique** : Le JSON est régénéré automatiquement lors du `npm run build`
3. **Workflow simplifié** : Un seul script `process-photos` pour tout traiter
4. **Pas de redondance** : Scripts obsolètes supprimés (`optimize-images.js`, `organize-existing-images.js`)

## 🐛 Troubleshooting

**Problème**: `Error: Cannot find module 'sharp'`
```bash
npm install
```

**Problème**: Images trop volumineuses dans Git
```bash
npm run reoptimize  # Ré-optimise avec compression accrue
```

**Problème**: Miniatures manquantes
```bash
npm run generate-thumbs
```

**Problème**: JSON metadata obsolète
```bash
npm run generate-photos-json
```

## 📚 Références

- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [WebP Format](https://developers.google.com/speed/webp)
- [Extract-Zip GitHub](https://github.com/max-mapper/extract-zip)
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
