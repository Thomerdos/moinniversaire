# Configuration de la Galerie Google Photos

Guide détaillé pour configurer la synchronisation automatique des photos depuis un album Google Photos vers votre galerie.

**Temps estimé : 15-20 minutes**

---

## 📋 Sommaire

1. [Créer un projet Google Cloud](#étape-1--créer-un-projet-google-cloud)
2. [Activer l'API Photos Library](#étape-2--activer-lapi-photos-library)
3. [Configurer l'écran de consentement OAuth](#étape-3--configurer-lécran-de-consentement-oauth)
4. [Créer les identifiants OAuth](#étape-4--créer-les-identifiants-oauth)
5. [Obtenir le Refresh Token](#étape-5--obtenir-le-refresh-token)
6. [Trouver l'ID de votre album](#étape-6--trouver-lid-de-votre-album)
7. [Configurer les secrets GitHub](#étape-7--configurer-les-secrets-github)
8. [Tester la configuration](#étape-8--tester-la-configuration)

---

## Étape 1 : Créer un projet Google Cloud

1. Ouvrez [Google Cloud Console](https://console.cloud.google.com/)

2. Connectez-vous avec le **même compte Google** que celui de vos photos

3. En haut de la page, cliquez sur le sélecteur de projet (à côté de "Google Cloud")

4. Dans la fenêtre popup, cliquez sur **"NOUVEAU PROJET"** (en haut à droite)

5. Configurez le projet :
   - **Nom du projet** : `moinniversaire-photos` (ou un nom de votre choix)
   - **Organisation** : laissez vide si vous n'en avez pas
   - Cliquez sur **"CRÉER"**

6. Attendez quelques secondes que le projet soit créé, puis sélectionnez-le

---

## Étape 2 : Activer l'API Photos Library

1. Dans le menu de gauche (☰), allez dans **"API et services"** → **"Bibliothèque"**

2. Dans la barre de recherche, tapez : `Photos Library API`

3. Cliquez sur **"Photos Library API"** dans les résultats

4. Cliquez sur le bouton bleu **"ACTIVER"**

5. Attendez que l'API soit activée (vous serez redirigé vers la page de l'API)

---

## Étape 3 : Configurer l'écran de consentement OAuth

C'est l'écran que vous verrez quand vous autoriserez l'accès à vos photos.

1. Dans le menu de gauche, allez dans **"API et services"** → **"Écran de consentement OAuth"**

2. Choisissez le type d'utilisateur :
   - Sélectionnez **"Externe"**
   - Cliquez sur **"CRÉER"**

3. Remplissez les informations de l'application (page 1) :
   - **Nom de l'application** : `Moinniversaire Gallery`
   - **Adresse e-mail d'assistance utilisateur** : votre email
   - **Logo de l'application** : laissez vide (optionnel)
   - Descendez tout en bas
   - **Adresses e-mail du développeur** : votre email
   - Cliquez sur **"ENREGISTRER ET CONTINUER"**

4. Scopes (page 2) :
   - Cliquez sur **"AJOUTER OU SUPPRIMER DES CHAMPS D'APPLICATION"**
   - Dans le filtre, tapez : `photoslibrary.readonly`
   - Cochez la case à côté de `.../auth/photoslibrary.readonly`
   - Cliquez sur **"METTRE À JOUR"** en bas
   - Cliquez sur **"ENREGISTRER ET CONTINUER"**

5. Utilisateurs de test (page 3) :
   - Cliquez sur **"+ ADD USERS"**
   - Entrez votre adresse email Gmail
   - Cliquez sur **"AJOUTER"**
   - Cliquez sur **"ENREGISTRER ET CONTINUER"**

6. Résumé (page 4) :
   - Vérifiez les informations
   - Cliquez sur **"RETOUR AU TABLEAU DE BORD"**

---

## Étape 4 : Créer les identifiants OAuth

1. Dans le menu de gauche, allez dans **"API et services"** → **"Identifiants"**

2. En haut, cliquez sur **"+ CRÉER DES IDENTIFIANTS"**

3. Sélectionnez **"ID client OAuth"**

4. Configurez l'ID client :
   - **Type d'application** : sélectionnez **"Application de bureau"**
   - **Nom** : `Moinniversaire Sync`
   - Cliquez sur **"CRÉER"**

5. Une fenêtre popup apparaît avec vos identifiants :
   - 📝 **Copiez le "ID client"** → gardez-le de côté
   - 📝 **Copiez le "Code secret du client"** → gardez-le de côté
   - Cliquez sur **"OK"**

> ⚠️ **Important** : Gardez ces identifiants en sécurité ! Ne les partagez jamais publiquement.

---

## Étape 5 : Obtenir le Refresh Token

Le refresh token permet à l'application de se connecter automatiquement sans intervention manuelle.

1. Ouvrez [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) dans un nouvel onglet

2. Configurez vos propres identifiants :
   - Cliquez sur l'icône **⚙️ (engrenage)** en haut à droite
   - Cochez la case **"Use your own OAuth credentials"**
   - Remplissez :
     - **OAuth Client ID** : collez votre ID client (de l'étape 4)
     - **OAuth Client secret** : collez votre code secret (de l'étape 4)
   - Fermez le panneau de configuration

3. Sélectionnez le scope Photos :
   - Dans le panneau de gauche **"Step 1: Select & authorize APIs"**
   - Descendez et trouvez **"Photos Library API v1"**
   - Cliquez dessus pour déplier
   - Cochez **`https://www.googleapis.com/auth/photoslibrary.readonly`**

4. Autorisez l'accès :
   - Cliquez sur **"Authorize APIs"** (bouton bleu)
   - Sélectionnez votre compte Google
   - Vous verrez un avertissement "Cette application n'est pas validée" :
     - Cliquez sur **"Paramètres avancés"** (ou "Advanced")
     - Cliquez sur **"Accéder à Moinniversaire Gallery (non sécurisé)"**
   - Cliquez sur **"Continuer"** pour autoriser l'accès aux photos

5. Obtenez le refresh token :
   - Vous êtes redirigé vers OAuth Playground
   - Dans **"Step 2: Exchange authorization code for tokens"**
   - Cliquez sur **"Exchange authorization code for tokens"**
   - Dans la réponse JSON à droite, trouvez la ligne `"refresh_token"`
   - 📝 **Copiez la valeur du refresh_token** (sans les guillemets)

> 💡 **Conseil** : Le refresh token ressemble à `1//0e...` et fait environ 200 caractères

---

## Étape 6 : Trouver l'ID de votre album

1. Toujours dans OAuth Playground, vous pouvez tester l'API :
   - Dans **"Step 3: Configure request to API"**
   - **HTTP Method** : `GET`
   - **Request URI** : `https://photoslibrary.googleapis.com/v1/albums`
   - Cliquez sur **"Send the request"**

2. Dans la réponse JSON à droite :
   - Cherchez l'album souhaité par son `"title"`
   - 📝 **Copiez la valeur `"id"`** de cet album

> 💡 **Alternative** : L'ID de l'album est visible dans l'URL quand vous ouvrez un album sur photos.google.com

---

## Étape 7 : Configurer les secrets GitHub

1. Allez sur votre repository GitHub

2. Cliquez sur **"Settings"** (onglet en haut)

3. Dans le menu de gauche, cliquez sur **"Secrets and variables"** → **"Actions"**

4. Ajoutez chaque secret en cliquant sur **"New repository secret"** :

   | Nom du secret | Valeur |
   |---------------|--------|
   | `GOOGLE_CLIENT_ID` | L'ID client de l'étape 4 |
   | `GOOGLE_CLIENT_SECRET` | Le code secret de l'étape 4 |
   | `GOOGLE_REFRESH_TOKEN` | Le refresh token de l'étape 5 |
   | `GOOGLE_PHOTOS_ALBUM_ID` | L'ID de l'album de l'étape 6 |

---

## Étape 8 : Tester la configuration

### Test manuel du workflow

1. Allez dans l'onglet **"Actions"** de votre repository

2. Dans la liste de gauche, cliquez sur **"Sync Google Photos"**

3. Cliquez sur **"Run workflow"** → **"Run workflow"** (bouton vert)

4. Attendez que le workflow se termine (environ 30 secondes)

5. Vérifiez le résultat :
   - ✅ **Succès** : Le fichier `public/photos-data.json` a été créé/mis à jour
   - ❌ **Échec** : Cliquez sur le workflow pour voir les logs d'erreur

### Erreurs courantes

| Erreur | Solution |
|--------|----------|
| `401 Unauthorized` | Vérifiez que le refresh token est correct |
| `403 Forbidden` | Vérifiez que l'API Photos Library est activée |
| `404 Not Found` | Vérifiez l'ID de l'album |
| `invalid_grant` | Le refresh token a expiré, refaites l'étape 5 |

### Vérifier les photos

Après un sync réussi :
1. Allez dans votre repository
2. Ouvrez `public/photos-data.json`
3. Vous devriez voir la liste des photos avec leurs URLs

---

## 🔄 Synchronisation automatique

Une fois configuré, le workflow s'exécute automatiquement :
- **Tous les jours à 3h UTC** (5h heure de Paris en été, 4h en hiver)
- Les URLs des photos sont rafraîchies (elles expirent après ~1 heure)

---

## ⚠️ Notes importantes

- **Les URLs des photos expirent** : C'est pourquoi le sync est quotidien
- **Application "non vérifiée"** : C'est normal, votre app est en mode test
- **Refresh token** : Il reste valide tant que vous ne révoquez pas l'accès
- **Sécurité** : Vos secrets GitHub ne sont jamais exposés dans le code
