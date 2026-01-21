# Configuration de la Galerie Google Photos

Ce guide explique comment configurer la synchronisation automatique des photos depuis un album Google Photos.

## ⚠️ Important : Limitation de l'API Google Photos

L'API Google Photos Library **ne supporte pas nativement les comptes de service** pour les comptes Gmail personnels. Les comptes de service fonctionnent uniquement avec **Google Workspace** via la délégation au niveau du domaine.

### Option A : Compte Google Workspace (avec Service Account)

Si vous avez un compte Google Workspace, suivez les instructions ci-dessous pour utiliser un compte de service.

### Option B : Compte Gmail personnel

Pour les comptes Gmail personnels, vous devrez utiliser OAuth 2.0. Voir la section "Configuration OAuth 2.0 (Alternative)" en bas de ce document.

---

## Configuration avec Service Account (Google Workspace uniquement)

### Prérequis

1. Un compte **Google Workspace** (pas un compte Gmail personnel)
2. Accès à la console d'administration Google Workspace
3. Un album Google Photos contenant les photos à afficher

### Étape 1 : Créer un projet Google Cloud

1. Rendez-vous sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API "Photos Library API" dans la bibliothèque d'API

### Étape 2 : Créer un compte de service

1. Allez dans "APIs & Services" → "Credentials"
2. Cliquez sur "Create Credentials" → "Service Account"
3. Donnez un nom au compte de service
4. Cliquez sur "Create and Continue"
5. Pas besoin d'ajouter de rôles, cliquez sur "Continue" puis "Done"
6. Cliquez sur le compte de service créé
7. Allez dans l'onglet "Keys"
8. Cliquez sur "Add Key" → "Create new key" → "JSON"
9. Téléchargez le fichier JSON (gardez-le en sécurité !)
10. Notez le "Client ID" du compte de service (visible dans les détails)

### Étape 3 : Configurer la délégation au niveau du domaine

1. Connectez-vous à [Google Admin Console](https://admin.google.com/)
2. Allez dans "Security" → "API Controls" → "Domain-wide delegation"
3. Cliquez sur "Add new"
4. Entrez le **Client ID** du compte de service
5. Ajoutez le scope OAuth : `https://www.googleapis.com/auth/photoslibrary.readonly`
6. Cliquez sur "Authorize"

### Étape 4 : Trouver l'ID de votre album

Utilisez l'API Explorer ou OAuth Playground pour lister vos albums :
```
GET https://photoslibrary.googleapis.com/v1/albums
```

L'ID de l'album sera dans la réponse JSON.

### Étape 5 : Configurer les secrets GitHub

Ajoutez ces secrets dans votre repository GitHub (Settings → Secrets and variables → Actions) :

| Secret | Description |
|--------|-------------|
| `SERVICE_ACCOUNT_KEY` | Contenu complet du fichier JSON du compte de service |
| `GOOGLE_USER_EMAIL` | Email de l'utilisateur dont les photos seront accessibles |
| `GOOGLE_PHOTOS_ALBUM_ID` | ID de l'album à synchroniser |

### Étape 6 : Déclencher la synchronisation

La synchronisation s'exécute automatiquement :
- **Quotidiennement** à 3h UTC
- **Manuellement** via l'onglet "Actions" de GitHub

Pour déclencher manuellement :
1. Allez dans l'onglet "Actions" de votre repository
2. Sélectionnez le workflow "Sync Google Photos"
3. Cliquez sur "Run workflow"

---

## Configuration OAuth 2.0 (Alternative pour comptes Gmail personnels)

Si vous n'avez pas Google Workspace, vous pouvez utiliser OAuth 2.0 en modifiant le script.

### Prérequis

1. Un compte Google avec accès à Google Photos
2. Un album Google Photos contenant les photos à afficher

### Étape 1 : Créer des identifiants OAuth

1. Dans Google Cloud Console, allez dans "APIs & Services" → "Credentials"
2. Cliquez sur "Create Credentials" → "OAuth client ID"
3. Choisissez "Desktop app" comme type d'application
4. Téléchargez le fichier JSON des identifiants

### Étape 2 : Obtenir un Refresh Token

Utilisez le [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) :

1. Cliquez sur l'icône d'engrenage (⚙️) en haut à droite
2. Cochez "Use your own OAuth credentials"
3. Entrez votre Client ID et Client Secret
4. Dans la liste des scopes, sélectionnez "Photos Library API v1" → `photoslibrary.readonly`
5. Cliquez sur "Authorize APIs"
6. Autorisez l'accès avec votre compte Google
7. Cliquez sur "Exchange authorization code for tokens"
8. Copiez le "Refresh token"

### Étape 3 : Modifier le workflow

Modifiez `.github/workflows/sync-google-photos.yml` pour utiliser OAuth au lieu du compte de service.

---

## Notes importantes

⚠️ **Les URLs des photos Google sont temporaires** (elles expirent après environ 1 heure). C'est pourquoi la synchronisation est programmée quotidiennement pour maintenir des URLs valides.

📷 **Taille des images** : Les images sont redimensionnées automatiquement :
- Vignettes : 400x300 pixels
- Pleine taille : 2048x2048 pixels max

🔒 **Sécurité** : Vos identifiants sont stockés de manière sécurisée dans les secrets GitHub et ne sont jamais exposés dans le code.
