# Guide de Prévisualisation des Modifications

## Tester les modifications en ligne avant de merger

Ce repository dispose de plusieurs options pour tester vos modifications en ligne avant de les fusionner dans la branche principale.

## Option 1 : Netlify Drop (Recommandé - le plus simple)

C'est la méthode la plus rapide pour obtenir un aperçu en ligne :

1. **Télécharger le build** :
   - Allez dans l'onglet **Actions** de la PR
   - Cliquez sur le workflow "Prévisualisation PR"
   - Téléchargez l'artifact `preview-build`

2. **Déployer sur Netlify** :
   - Allez sur [drop.netlify.com](https://drop.netlify.com)
   - Glissez-déposez le dossier `dist` extrait de l'artifact
   - Netlify vous donnera une URL temporaire (ex: `https://random-name-123456.netlify.app`)
   - L'URL reste active pendant 24 heures

**Avantages** :
- ✅ Gratuit et sans compte requis
- ✅ URL partageable pour montrer aux autres
- ✅ Prévisualisation en ligne en moins de 1 minute

## Option 2 : Déploiement automatique avec Netlify (Configuration requise)

Pour avoir des previews automatiques sur chaque PR, vous pouvez connecter le repository à Netlify :

1. **Créer un compte Netlify** (gratuit) : [app.netlify.com](https://app.netlify.com)

2. **Importer le repository** :
   - New site from Git
   - Sélectionnez GitHub et autorisez l'accès
   - Choisissez le repository `moinniversaire`

3. **Configurer le build** :
   - Build command : `npm run build`
   - Publish directory : `dist`
   - Cliquez sur "Deploy site"

4. **Activer les Deploy Previews** :
   - Site settings > Build & deploy > Deploy contexts
   - Activez "Deploy Previews"
   - Maintenant chaque PR aura automatiquement une URL de preview !

**Avantages** :
- ✅ Previews automatiques sur chaque PR
- ✅ URL unique par PR avec mise à jour automatique
- ✅ Commentaire automatique sur la PR avec l'URL

## Option 3 : GitHub Pages avec branche de test

Vous pouvez tester sur GitHub Pages en créant une branche de test :

1. **Créer une branche de test** :
   ```bash
   git checkout -b test/preview-changes
   git merge copilot/add-couple-anniversary-page
   git push origin test/preview-changes
   ```

2. **Configurer GitHub Pages** :
   - Settings > Pages
   - Source : Deploy from a branch
   - Branch : `test/preview-changes`
   - Folder : `/dist` (après avoir committé le build)

3. **Accéder au site** :
   - URL : `https://thomerdos.github.io/moinniversaire/`

**Note** : Cette méthode nécessite de committer le dossier `dist`, ce qui n'est pas recommandé pour le long terme.

## Option 4 : Test local

Pour tester localement avant de merger :

```bash
# Récupérer la branche de la PR
git fetch origin
git checkout copilot/add-couple-anniversary-page

# Installer et lancer
npm install
npm run dev

# Ouvrir http://localhost:5173/moinniversaire/ dans votre navigateur
```

**Avantages** :
- ✅ Modifications en temps réel
- ✅ Pas besoin de déploiement
- ✅ Outils de développement disponibles

**Inconvénients** :
- ❌ Nécessite Node.js installé
- ❌ Pas partageable facilement

## Recommandation

Pour tester rapidement en ligne : **Utilisez Netlify Drop** (Option 1)
- Aucune configuration requise
- URL en ligne en moins d'1 minute
- Parfait pour les tests rapides avant merge

Pour un workflow automatisé à long terme : **Configurez Netlify** (Option 2)
- Previews automatiques sur chaque PR
- Gain de temps sur le long terme
- URLs partageables automatiquement

## Workflow automatique actuel

Le workflow `.github/workflows/preview.yml` est déjà configuré et :
- ✅ Se déclenche automatiquement sur chaque PR
- ✅ Build le projet et crée un artifact
- ✅ Poste un commentaire sur la PR avec les instructions
- ✅ L'artifact est disponible pendant 7 jours

Il ne reste qu'à télécharger l'artifact et le déployer sur Netlify Drop pour avoir votre preview en ligne !
