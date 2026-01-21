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

Ce projet est configuré pour un déploiement automatique sur GitHub Pages via GitHub Actions.

### Configuration initiale

1. Allez dans **Settings** > **Pages** de votre dépôt GitHub
2. Sous **Source**, sélectionnez **GitHub Actions**
3. Le workflow se déclenchera automatiquement à chaque push sur la branche `main`

### Déploiement manuel

Vous pouvez aussi déclencher le déploiement manuellement :
1. Allez dans l'onglet **Actions** de votre dépôt
2. Sélectionnez le workflow "Déploiement sur GitHub Pages"
3. Cliquez sur **Run workflow**

Une fois déployé, votre application sera accessible à l'adresse :
`https://thomerdos.github.io/moinniversaire/`

## 📁 Structure du Projet

```
moinniversaire/
├── src/
│   ├── components/
│   │   └── AnniversaryDisplay.vue  # Composant d'affichage des anniversaires
│   ├── App.vue                      # Composant principal
│   ├── main.js                      # Point d'entrée
│   └── style.css                    # Styles globaux
├── public/                          # Fichiers statiques
├── .github/
│   └── workflows/
│       └── deploy.yml               # Workflow GitHub Actions pour le déploiement
├── index.html                       # Template HTML
├── uno.config.js                    # Configuration UnoCSS
├── vite.config.js                   # Configuration Vite
└── package.json                     # Dépendances et scripts
```

## ⚙️ Configuration

Pour personnaliser la date de début du couple, modifiez la constante `COUPLE_START_DATE` dans `src/App.vue`:

```javascript
const COUPLE_START_DATE = new Date(2025, 6, 18) // 18 juillet 2025
```

## 📝 License

MIT
