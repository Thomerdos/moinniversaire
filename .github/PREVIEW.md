# Guide de Prévisualisation des Modifications

## Tester les modifications en ligne avant de merger

Ce repository dispose d'un système automatique de preview sur GitHub Pages pour chaque Pull Request.

## 🚀 Configuration initiale (IMPORTANT)

### Option 1 : Laisser le workflow créer la branche automatiquement

**C'est la méthode la plus simple !** Quand vous créerez votre première PR vers `main`, le workflow détectera que la branche `gh-pages` n'existe pas et la créera automatiquement.

Après que la première PR ait créé la branche :
1. Allez dans **Settings** > **Pages**
2. Sous **Build and deployment** > **Source**, sélectionnez **Deploy from a branch**
3. Sous **Branch**, sélectionnez **gh-pages** et **/ (root)**
4. Cliquez sur **Save**

### Option 2 : Créer la branche manuellement avec un workflow

Si vous préférez initialiser la branche avant de créer des PR :

1. Allez dans l'onglet **Actions** du repository
2. Sélectionnez le workflow **"Initialiser gh-pages"** dans la liste à gauche
3. Cliquez sur **"Run workflow"** > **"Run workflow"**
4. Attendez ~30 secondes que le workflow se termine
5. La branche `gh-pages` est maintenant créée !
6. Allez dans **Settings** > **Pages** et configurez comme ci-dessus

## Preview Automatique sur GitHub Pages

Une fois la configuration initiale faite, chaque PR déploie automatiquement une preview.

### Comment ça fonctionne :

1. **Créez ou mettez à jour une PR** vers la branche `main`
2. **Le workflow se déclenche automatiquement** et déploie votre preview
3. **Un commentaire est posté sur la PR** avec l'URL de la preview
4. **URL de la preview** : `https://thomerdos.github.io/moinniversaire/pr-[NUMERO]/`

### Exemple :
- PR #5 → `https://thomerdos.github.io/moinniversaire/pr-5/`
- PR #12 → `https://thomerdos.github.io/moinniversaire/pr-12/`

### Avantages :
- ✅ **Automatique** : Aucune action manuelle requise
- ✅ **Mise à jour automatique** : Chaque nouveau commit met à jour la preview
- ✅ **URL stable** : L'URL reste la même pendant toute la durée de la PR
- ✅ **Partageable** : Vous pouvez partager l'URL avec d'autres pour obtenir des retours
- ✅ **Nettoyage automatique** : La preview est supprimée quand la PR est fermée/mergée
- ✅ **Gratuit** : Hébergé sur GitHub Pages, aucun compte externe requis

### Configuration requise :

**Important** : Pour que les previews fonctionnent, GitHub Pages doit être configuré :

1. Allez dans **Settings** > **Pages**
2. Sous **Build and deployment** > **Source**, sélectionnez **Deploy from a branch**
3. Sous **Branch**, sélectionnez **gh-pages** et **/ (root)**
4. Cliquez sur **Save**

Le workflow créera et gérera automatiquement la branche `gh-pages` avec les previews.

## Alternative : Netlify Drop (Sans configuration)

Si vous préférez ne pas utiliser GitHub Pages, vous pouvez toujours utiliser Netlify Drop :

1. **Télécharger le build** :
   - Allez dans l'onglet **Actions** de la PR
   - ⚠️ Note : Le workflow actuel déploie directement sur GitHub Pages
   - Pour télécharger un artifact, vous devrez exécuter `npm run build` localement

2. **Déployer sur Netlify** :
   - Allez sur [drop.netlify.com](https://drop.netlify.com)
   - Glissez-déposez le dossier `dist`
   - Netlify vous donne une URL temporaire (valide 24h)

## Test local

Pour tester localement avant de créer une PR :

```bash
# Récupérer la branche
git fetch origin
git checkout [nom-de-la-branche]

# Installer et lancer
npm install
npm run dev

# Ouvrir http://localhost:5173/moinniversaire/ dans votre navigateur
```

## Workflow de développement recommandé

1. **Développez localement** avec `npm run dev`
2. **Créez une PR** vers `main`
3. **Attendez le déploiement automatique** (environ 1-2 minutes)
4. **Testez en ligne** via l'URL de la preview GitHub Pages
5. **Partagez l'URL** si vous voulez des retours
6. **Mergez** quand tout est validé
7. **La preview est automatiquement nettoyée** après le merge

## Monitoring des previews

Toutes les previews actives sont accessibles depuis :
- Le commentaire automatique sur chaque PR
- La branche `gh-pages` qui contient tous les dossiers `pr-X/`

## Résolution de problèmes

### Le workflow échoue
- Vérifiez que GitHub Pages est activé dans Settings > Pages
- Vérifiez les logs dans l'onglet **Actions**
- Assurez-vous que la branche `gh-pages` existe

### La preview affiche une erreur 404
- Attendez 1-2 minutes après le déploiement (propagation)
- Vérifiez que l'URL contient le bon numéro de PR
- Vérifiez que GitHub Pages est configuré sur la branche `gh-pages`

### La preview ne se met pas à jour
- Vérifiez que le workflow s'est exécuté dans l'onglet **Actions**
- Essayez un hard refresh (Ctrl+F5 ou Cmd+Shift+R)
- Videz le cache du navigateur
