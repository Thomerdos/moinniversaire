# Configuration de la Galerie Google Photos

Ce guide explique comment configurer la synchronisation automatique des photos depuis un album Google Photos.

## Prérequis

1. Un compte Google avec accès à Google Photos
2. Un album Google Photos contenant les photos à afficher

## Étape 1 : Créer un projet Google Cloud

1. Rendez-vous sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API "Photos Library API" dans la bibliothèque d'API

## Étape 2 : Configurer l'écran de consentement OAuth

1. Allez dans "APIs & Services" → "OAuth consent screen"
2. Choisissez "External" comme type d'utilisateur
3. Remplissez les informations requises (nom de l'application, email)
4. Ajoutez le scope : `https://www.googleapis.com/auth/photoslibrary.readonly`
5. Ajoutez votre adresse email comme utilisateur de test

## Étape 3 : Créer des identifiants OAuth 2.0

1. Allez dans "APIs & Services" → "Credentials"
2. Cliquez sur "Create Credentials" → "OAuth client ID"
3. Choisissez "Desktop app" comme type d'application
4. Téléchargez le fichier JSON des identifiants

## Étape 4 : Obtenir un Refresh Token

Utilisez le [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) :

1. Cliquez sur l'icône d'engrenage (⚙️) en haut à droite
2. Cochez "Use your own OAuth credentials"
3. Entrez votre Client ID et Client Secret
4. Dans la liste des scopes, sélectionnez "Photos Library API v1" → `photoslibrary.readonly`
5. Cliquez sur "Authorize APIs"
6. Autorisez l'accès avec votre compte Google
7. Cliquez sur "Exchange authorization code for tokens"
8. Copiez le "Refresh token"

## Étape 5 : Trouver l'ID de votre album

Vous pouvez lister vos albums avec une requête API. Utilisez le OAuth Playground pour faire une requête GET à :
```
https://photoslibrary.googleapis.com/v1/albums
```

L'ID de l'album sera dans la réponse JSON.

## Étape 6 : Configurer les secrets GitHub

Ajoutez ces secrets dans votre repository GitHub (Settings → Secrets and variables → Actions) :

| Secret | Description |
|--------|-------------|
| `GOOGLE_CLIENT_ID` | Client ID OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Client Secret OAuth 2.0 |
| `GOOGLE_REFRESH_TOKEN` | Refresh token obtenu à l'étape 4 |
| `GOOGLE_PHOTOS_ALBUM_ID` | ID de l'album à synchroniser |

## Étape 7 : Déclencher la synchronisation

La synchronisation s'exécute automatiquement :
- **Quotidiennement** à 3h UTC
- **Manuellement** via l'onglet "Actions" de GitHub

Pour déclencher manuellement :
1. Allez dans l'onglet "Actions" de votre repository
2. Sélectionnez le workflow "Sync Google Photos"
3. Cliquez sur "Run workflow"

## Notes importantes

⚠️ **Les URLs des photos Google sont temporaires** (elles expirent après environ 1 heure). C'est pourquoi la synchronisation est programmée quotidiennement pour maintenir des URLs valides.

📷 **Taille des images** : Les images sont redimensionnées automatiquement :
- Vignettes : 400x300 pixels
- Pleine taille : 2048x2048 pixels max

🔒 **Sécurité** : Vos identifiants sont stockés de manière sécurisée dans les secrets GitHub et ne sont jamais exposés dans le code.
