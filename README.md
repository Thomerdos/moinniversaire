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
- **CSS Animations** - Animations fluides

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
├── index.html                       # Template HTML
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
