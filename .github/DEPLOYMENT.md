# Guide de Déploiement GitHub Pages

## Configuration requise dans GitHub

Pour activer le déploiement automatique sur GitHub Pages, vous devez configurer les paramètres suivants dans votre dépôt GitHub :

### 1. Activer GitHub Pages

1. Allez dans **Settings** (Paramètres) de votre dépôt
2. Dans le menu latéral, cliquez sur **Pages**
3. Sous **Build and deployment** > **Source**, sélectionnez **GitHub Actions**

### 2. Permissions du Workflow

Les permissions sont déjà configurées dans le fichier `.github/workflows/deploy.yml` :
- `contents: read` - pour lire le code source
- `pages: write` - pour écrire sur GitHub Pages
- `id-token: write` - pour l'authentification

### 3. Déclenchement du Déploiement

Le workflow se déclenchera automatiquement :
- À chaque push sur la branche `main`
- Manuellement via l'onglet **Actions** avec **Run workflow**

## Vérification du Déploiement

1. Allez dans l'onglet **Actions** de votre dépôt
2. Vérifiez que le workflow "Déploiement sur GitHub Pages" s'exécute correctement
3. Une fois terminé, votre site sera accessible à l'adresse :
   ```
   https://thomerdos.github.io/moinniversaire/
   ```

## Résolution de Problèmes

### Le workflow échoue
- Vérifiez les logs dans l'onglet **Actions**
- Assurez-vous que GitHub Pages est activé dans les paramètres
- Vérifiez que les permissions sont correctement configurées

### Le site affiche une erreur 404
- Vérifiez que le base path dans `vite.config.js` correspond au nom du dépôt
- Attendez quelques minutes après le déploiement (propagation DNS)
- Videz le cache de votre navigateur

### Les assets ne se chargent pas
- Vérifiez que le base path est correctement défini : `/moinniversaire/`
- Vérifiez les chemins dans le fichier `dist/index.html` généré

## Structure du Workflow

Le workflow se compose de deux jobs :

1. **build** : Construit l'application
   - Checkout du code
   - Installation de Node.js
   - Installation des dépendances
   - Build du projet avec Vite
   - Upload de l'artifact

2. **deploy** : Déploie sur GitHub Pages
   - Télécharge l'artifact
   - Déploie sur GitHub Pages

## Personnalisation

Pour modifier le comportement du déploiement, éditez le fichier `.github/workflows/deploy.yml` :

- Changer la branche de déploiement : modifiez `branches: ['main']`
- Changer la version de Node.js : modifiez `node-version: '20'`
- Ajouter des étapes de test : ajoutez des steps avant le build
