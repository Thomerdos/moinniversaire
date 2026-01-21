# Architecture de Déploiement GitHub Pages

```
┌─────────────────────────────────────────────────────────────────┐
│                    Repository moinniversaire                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Branch: main                                                    │
│  ├── src/                                                        │
│  ├── vite.config.js                                             │
│  ├── .github/workflows/                                         │
│  │   ├── deploy.yml      ─────┐                                 │
│  │   └── preview.yml     ──┐  │                                 │
│  └── public/.nojekyll       │  │                                 │
│                             │  │                                 │
│  Branch: copilot/*          │  │                                 │
│  └── (Pull Requests)        │  │                                 │
│                             │  │                                 │
└─────────────────────────────┼──┼─────────────────────────────────┘
                              │  │
                              │  │
            ┌─────────────────┘  └─────────────────┐
            │                                       │
            ▼                                       ▼
    ┌──────────────┐                      ┌──────────────┐
    │   Preview    │                      │    Deploy    │
    │  Workflow    │                      │   Workflow   │
    │              │                      │              │
    │ Trigger: PR  │                      │ Trigger:     │
    │   opened/    │                      │   push to    │
    │   updated    │                      │    main      │
    └──────┬───────┘                      └──────┬───────┘
           │                                     │
           │ Build with                          │ Build with
           │ VITE_BASE_PATH=                     │ base:
           │ /moinniversaire/pr-X/               │ /moinniversaire/
           │                                     │
           └──────────┬────────────┬─────────────┘
                      │            │
                      ▼            ▼
            ┌─────────────────────────────┐
            │    Branch: gh-pages         │
            │                             │
            │  / (root)                   │
            │  ├── index.html ───────────►│ Production
            │  ├── assets/                │ https://thomerdos.github.io/moinniversaire/
            │  ├── .nojekyll              │
            │  │                           │
            │  ├── pr-1/                  │
            │  │   ├── index.html ────────►│ Preview PR #1
            │  │   └── assets/            │ .../moinniversaire/pr-1/
            │  │                           │
            │  ├── pr-2/                  │
            │  │   ├── index.html ────────►│ Preview PR #2
            │  │   └── assets/            │ .../moinniversaire/pr-2/
            │  │                           │
            │  └── pr-N/                  │
            │      ├── index.html ────────►│ Preview PR #N
            │      └── assets/            │ .../moinniversaire/pr-N/
            │                             │
            └─────────────────────────────┘
                      │
                      │ Served by GitHub Pages
                      │
                      ▼
            ┌─────────────────────────────┐
            │  https://thomerdos.github.io│
            │         /moinniversaire/     │
            └─────────────────────────────┘
```

## Flux de Déploiement

### 1. Déploiement Production (main → gh-pages root)

```
Push sur main
    │
    ├─► Workflow deploy.yml se déclenche
    │
    ├─► npm ci && npm run build
    │   (base: /moinniversaire/)
    │
    ├─► Checkout branche gh-pages
    │
    ├─► Supprimer fichiers à la racine (sauf pr-*)
    │
    ├─► Copier dist/* vers racine gh-pages
    │
    ├─► git push origin gh-pages
    │
    └─► Disponible sur https://thomerdos.github.io/moinniversaire/
```

### 2. Déploiement Preview (PR → gh-pages/pr-X/)

```
Ouverture/Mise à jour PR
    │
    ├─► Workflow preview.yml se déclenche
    │
    ├─► npm ci && npm run build
    │   (VITE_BASE_PATH=/moinniversaire/pr-123/)
    │
    ├─► Checkout branche gh-pages
    │
    ├─► Créer/vider dossier pr-123/
    │
    ├─► Copier dist/* vers gh-pages/pr-123/
    │
    ├─► git push origin gh-pages
    │
    ├─► Commenter sur la PR avec l'URL
    │
    └─► Disponible sur https://thomerdos.github.io/moinniversaire/pr-123/


Fermeture PR
    │
    ├─► Workflow preview.yml (cleanup) se déclenche
    │
    ├─► Checkout branche gh-pages
    │
    ├─► Supprimer dossier pr-123/
    │
    ├─► git push origin gh-pages
    │
    └─► Commenter sur la PR (nettoyage effectué)
```

## Configuration Vite Dynamique

```javascript
// vite.config.js
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/moinniversaire/',
})
```

| Contexte          | Variable VITE_BASE_PATH | Base Path Résultant       |
|-------------------|-------------------------|---------------------------|
| Build Production  | (non définie)           | `/moinniversaire/`        |
| Build Preview PR  | `/moinniversaire/pr-X/` | `/moinniversaire/pr-X/`   |
| Dev Local         | (non définie)           | `/moinniversaire/`        |

## Résultat Final

```
https://thomerdos.github.io/moinniversaire/
├── / ──────────────────────► Version de production (main)
├── /pr-1/ ────────────────► Preview de la PR #1
├── /pr-2/ ────────────────► Preview de la PR #2
└── /pr-N/ ────────────────► Preview de la PR #N
```

Chaque déploiement est **isolé** et **indépendant**, permettant de tester les PRs sans affecter la production.
