# Moinniversaire

Une application moderne en Vue.js pour vérifier si c'est le 18 du mois et suivre les anniversaires de couple.

## 🚀 Fonctionnalités

- Vérification en temps réel si c'est le 18 du mois
- Compte à rebours jusqu'au prochain 18
- Suivi des mois ensemble depuis le début de la relation
- Célébration des anniversaires annuels
- Interface moderne et animée avec Vue 3
- Design responsive

## 🛠️ Technologies

- **Vue 3** - Framework JavaScript progressif
- **Vite** - Build tool ultra-rapide
- **Composition API** - API moderne de Vue 3
- **UnoCSS** - Moteur CSS atomique instantané, alternative moderne à Tailwind
- **Animations CSS** - Animations fluides

## 📦 Installation

```bash
# Installer les dépendances
npm install
```

## 🔧 Développement

```bash
# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🏗️ Build

```bash
# Créer un build de production
npm run build

# Prévisualiser le build de production
npm run preview
```

## 🚀 Déploiement sur GitHub Pages

Ce projet utilise une architecture de déploiement avancée qui permet :
- **Déploiement automatique de la production** (branche `main`)
- **Previews automatiques des Pull Requests**

### 🎯 URLs

- **Production** : https://thomerdos.github.io/moinniversaire/
- **Preview PR #X** : https://thomerdos.github.io/moinniversaire/pr-X/

### Configuration initiale

1. Allez dans **Settings** > **Pages** de votre dépôt GitHub
2. Sous **Source**, sélectionnez **Deploy from a branch**
3. Sélectionnez la branche **gh-pages** et le dossier **/ (root)**
4. Cliquez sur **Save**

5. Allez dans **Settings** > **Actions** > **General**
6. Sous "Workflow permissions", sélectionnez **Read and write permissions**
7. Cochez **Allow GitHub Actions to create and approve pull requests**
8. Cliquez sur **Save**

### Comment ça marche ?

#### Déploiement de Production
- Se déclenche automatiquement à chaque push sur `main`
- Déploie l'application à la racine de https://thomerdos.github.io/moinniversaire/

#### Previews de Pull Requests
- Se déclenche automatiquement à l'ouverture ou la mise à jour d'une PR
- Crée une preview accessible à https://thomerdos.github.io/moinniversaire/pr-X/
- Ajoute automatiquement un commentaire sur la PR avec le lien de preview
- Supprime automatiquement la preview quand la PR est fermée

### Déploiement manuel

Vous pouvez déclencher le déploiement manuellement :
1. Allez dans l'onglet **Actions** de votre dépôt
2. Sélectionnez le workflow "Déploiement sur GitHub Pages"
3. Cliquez sur **Run workflow**

### 📚 Documentation Détaillée

Pour plus de détails sur l'architecture de déploiement :
- [DEPLOIEMENT.md](./DEPLOIEMENT.md) - Guide complet de déploiement
- [ARCHITECTURE_DEPLOIEMENT.md](./ARCHITECTURE_DEPLOIEMENT.md) - Schémas d'architecture

## 📁 Structure du Projet

```
moinniversaire/
├── src/
│   ├── components/
│   │   └── AnniversaryDisplay.vue  # Composant d'affichage des anniversaires
│   ├── views/
│   │   ├── IsItThe18th.vue         # Page principale "Est-ce le 18 ?"
│   │   └── TimeTogether.vue        # Page "Temps ensemble"
│   ├── router/
│   │   └── index.js                # Configuration Vue Router
│   ├── App.vue                     # Composant principal avec navigation
│   ├── main.js                     # Point d'entrée
│   └── style.css                   # Styles globaux
├── public/
│   └── .nojekyll                   # Désactive Jekyll pour GitHub Pages
├── .github/
│   └── workflows/
│       ├── deploy.yml              # Workflow de déploiement production
│       └── preview.yml             # Workflow de previews PR
├── index.html                      # Template HTML
├── uno.config.js                   # Configuration UnoCSS
├── vite.config.js                  # Configuration Vite avec base path dynamique
├── DEPLOIEMENT.md                  # Guide détaillé de déploiement
├── ARCHITECTURE_DEPLOIEMENT.md     # Diagrammes d'architecture
└── package.json                    # Dépendances et scripts
```

## ⚙️ Configuration

Pour personnaliser la date de début du couple, modifiez la constante `COUPLE_START_DATE` dans `src/App.vue`:

```javascript
const COUPLE_START_DATE = new Date(2025, 6, 18) // 18 juillet 2025
```

## 📝 License

MIT
