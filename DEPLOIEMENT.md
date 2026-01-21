# 📦 Guide de Déploiement - Moinniversaire

Ce document explique comment fonctionnent les déploiements sur GitHub Pages pour ce projet.

## 🎯 Architecture de Déploiement

Le projet utilise **une seule branche `gh-pages`** pour héberger :
1. **La version de production** (branche `main`) à la racine
2. **Les previews des Pull Requests** dans des sous-dossiers `/pr-X/`

### URLs de Déploiement

- **Production** : https://thomerdos.github.io/moinniversaire/
- **Preview PR #123** : https://thomerdos.github.io/moinniversaire/pr-123/

## 🔄 Workflows GitHub Actions

### 1. Déploiement de Production (`deploy.yml`)

**Déclenché par** : Push sur la branche `main`

**Ce qu'il fait** :
- Installe les dépendances
- Build le projet avec `base: '/moinniversaire/'`
- Déploie à la racine de la branche `gh-pages`
- Préserve les dossiers `pr-*` (previews existantes)

**Fichier** : `.github/workflows/deploy.yml`

### 2. Previews de Pull Requests (`preview.yml`)

**Déclenché par** : Ouverture, mise à jour ou fermeture d'une PR vers `main`

**Ce qu'il fait** :
- **Lors de l'ouverture/mise à jour** :
  - Build le projet avec `base: '/moinniversaire/pr-X/'`
  - Déploie dans le dossier `pr-X/` de la branche `gh-pages`
  - Ajoute un commentaire sur la PR avec le lien de preview
  
- **Lors de la fermeture de la PR** :
  - Supprime le dossier `pr-X/` de la branche `gh-pages`
  - Ajoute un commentaire de confirmation

**Fichier** : `.github/workflows/preview.yml`

## ⚙️ Configuration Vite

Le fichier `vite.config.js` utilise une variable d'environnement pour gérer le base path :

```javascript
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/moinniversaire/',
})
```

- **Production** : Utilise `/moinniversaire/` (valeur par défaut)
- **Preview PR** : Utilise `/moinniversaire/pr-X/` (défini par `VITE_BASE_PATH`)

## 📂 Structure de la Branche gh-pages

```
gh-pages/
├── .nojekyll              # Désactive Jekyll
├── index.html             # Page principale (production)
├── assets/                # Assets de production
├── pr-1/                  # Preview de la PR #1
│   ├── index.html
│   └── assets/
├── pr-2/                  # Preview de la PR #2
│   ├── index.html
│   └── assets/
└── README.md             # Documentation
```

## 🚀 Configuration Initiale

### Prérequis

1. **Activer GitHub Pages** dans les paramètres du dépôt :
   - Aller dans `Settings` > `Pages`
   - Source : `Deploy from a branch`
   - Branch : `gh-pages` / `/ (root)`
   - Cliquer sur `Save`

2. **Permissions des workflows** :
   - Aller dans `Settings` > `Actions` > `General`
   - Sous "Workflow permissions", sélectionner "Read and write permissions"
   - Cocher "Allow GitHub Actions to create and approve pull requests"
   - Cliquer sur `Save`

### Premier Déploiement

Le premier push sur `main` ou la première PR créera automatiquement la branche `gh-pages` si elle n'existe pas.

## 🔧 Tests en Local

### Build de production

```bash
npm run build
npm run preview
```

Ouvrir http://localhost:4173/moinniversaire/

### Build de preview (simuler une PR)

```bash
VITE_BASE_PATH=/moinniversaire/pr-test/ npm run build
npm run preview
```

Ouvrir http://localhost:4173/moinniversaire/pr-test/

## 🐛 Dépannage

### Les assets ne chargent pas (404)

**Problème** : Les fichiers JS/CSS retournent 404

**Solutions** :
1. Vérifier que le fichier `.nojekyll` est présent dans `public/`
2. Vérifier que `base` est correctement défini dans `vite.config.js`
3. S'assurer que GitHub Pages est configuré pour utiliser la branche `gh-pages`

### La preview ne se met pas à jour

**Problème** : Les changements sur la PR ne sont pas reflétés dans la preview

**Solutions** :
1. Vérifier que le workflow s'est exécuté sans erreur dans l'onglet Actions
2. Attendre 1-2 minutes pour la propagation de GitHub Pages
3. Vider le cache du navigateur (Ctrl+Shift+R)

### Conflit entre workflows

**Problème** : Les deux workflows tentent de déployer en même temps

**Solution** : Les workflows utilisent un groupe de concurrence différent :
- `deploy.yml` : `pages-deploy`
- `preview.yml` : `pages-preview-pr-X`

Cela permet aux deux de fonctionner en parallèle.

## 📝 Notes Importantes

1. **Vue Router** : Le projet utilise `createWebHashHistory()` qui est compatible avec GitHub Pages sans configuration supplémentaire
2. **Nettoyage automatique** : Les previews sont automatiquement supprimées quand une PR est fermée
3. **Base path** : Toujours utiliser des chemins relatifs ou le helper du router pour la navigation
4. **CNAME** : Si vous utilisez un domaine personnalisé, ajoutez un fichier `CNAME` à `public/`

## 🔗 Liens Utiles

- [Documentation Vite - Base Path](https://vitejs.dev/config/shared-options.html#base)
- [Documentation GitHub Pages](https://docs.github.com/en/pages)
- [Vue Router - Hash Mode](https://router.vuejs.org/guide/essentials/history-mode.html#hash-mode)
