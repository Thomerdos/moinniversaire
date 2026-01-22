# 📸 Scripts de Gestion des Photos

## Utilisation Rapide

### 🚀 Workflow Complet (Recommandé)

Pour traiter de nouveaux ZIPs en une seule commande :

```bash
npm run process-photos
```

### Scripts Individuels

```bash
# Extraire ZIPs + optimiser + organiser en albums
npm run extract-and-optimize

# Générer les miniatures 400px
npm run generate-thumbs

# Créer le JSON metadata
npm run generate-photos-json

# Ré-optimiser les images existantes (utility)
npm run reoptimize
```

## Description des Scripts

### 1. **extract-and-optimize.js** ⭐ Principal
- Extrait tous les ZIPs de `zip/` en parallèle
- Optimise en WebP (1400px max, qualité 75%)
- Organise dans `public/photos/[album-slug]/`
- Nettoie automatiquement les fichiers temporaires

### 2. **generate-thumbnails.js**
- Crée miniatures 400px (qualité 80%)
- Sortie : `public/photos/thumbs/[album]/`
- Traitement parallèle (5 à la fois)

### 3. **generate-photos-json.js**
- Génère `public/photos/photos-data.json`
- Liste les images par album
- **Auto-exécuté** lors du `npm run build`

### 4. **reoptimize-images.js** 🔧 Utilitaire
- Ré-optimise les images existantes
- Utile après changement des paramètres d'optimisation
- Affiche les économies d'espace

## Structure Créée

```
public/photos/
├── album-1/
│   ├── image001.webp        # 1400px max, qualité 75%
│   └── image002.webp
├── album-2/
│   └── ...
├── thumbs/
│   ├── album-1/
│   │   ├── image001.webp    # 400px max, qualité 80%
│   │   └── image002.webp
│   └── album-2/
│       └── ...
└── photos-data.json          # Metadata JSON
```

## Paramètres d'Optimisation

- **Images optimisées** : Max 1400px, WebP qualité 75%
- **Miniatures** : Max 400px, WebP qualité 80%
- **Parallélisme** : 5 images simultanées

## Voir Documentation Complète

📖 Consultez [../SCRIPTS_DOCUMENTATION.md](../SCRIPTS_DOCUMENTATION.md) pour plus de détails.
