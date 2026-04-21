# AGC Space — Plateforme E-Commerce Intelligente

> Construisez, vendez et automatisez vos tunnels de vente avec un builder visuel, un système d'affiliation sécurisé et un suivi en temps réel.

**Frontend déployé** → [https://ecom-git-main-gillesto66s-projects.vercel.app](https://ecom-git-main-gillesto66s-projects.vercel.app)

---

## Présentation

AGC Space est une plateforme e-commerce fullstack pensée pour les vendeurs indépendants. Elle permet de créer des pages de vente personnalisées sans écrire une ligne de code, de gérer un réseau d'affiliés avec des commissions traçables, et de suivre chaque vente en temps réel depuis un tableau de bord unifié.

Trois types d'utilisateurs coexistent sur la plateforme :

- **E-commerçant** — crée ses produits, construit ses pages de vente, gère ses affiliés et consulte ses revenus
- **Affilié** — génère des liens signés pour promouvoir des produits et suit ses commissions
- **Client** — navigue sur la marketplace, ajoute au panier et passe commande

---

## Le Smart Builder — L'atout central

Le builder est l'élément différenciant d'AGC Space. C'est un éditeur visuel WYSIWYG qui permet de composer une page de vente complète par glisser-déposer, avec aperçu en temps réel.

### Ce que vous pouvez construire

17 types de blocs sont disponibles, organisés par objectif :

| Catégorie | Blocs |
|---|---|
| Structure | Hero, Texte riche, Image, Vidéo |
| Galerie | Galerie d'images, Vidéo YouTube/Vimeo |
| Conversion | Bouton d'achat, Compte à rebours, Statut du stock, Bannière CTA |
| Preuve sociale | Témoignages, Carrousel de témoignages, Preuve sociale (ventes récentes) |
| Information | Fonctionnalités, FAQ/Accordéon, Tableau de tarification, Formulaire de contact |

### Fonctionnalités du builder

**Drag & drop natif**
Réordonnez vos blocs en les glissant. L'ordre est sauvegardé automatiquement.

**Aperçu temps réel**
Chaque modification est reflétée instantanément dans la prévisualisation de la page, sans rechargement.

**Auto-save intelligent**
Les modifications sont sauvegardées automatiquement après 800ms d'inactivité (debounce). Aucune perte de données.

**Templates prédéfinis**
Démarrez en quelques secondes avec 5 templates optimisés :

- *Landing Page SaaS* — Hero, fonctionnalités, CTA, FAQ
- *Produit Physique* — Hero, galerie, preuve sociale, bouton d'achat
- *eBook / Digital* — Hero, tarification, témoignages, bouton d'achat
- *Haute Conversion* — Urgence, preuve sociale, compte à rebours, stock, CTA
- *Formation / Cours* — Hero, programme, vidéo, carrousel, tarification

**Visibilité conditionnelle**
Chaque bloc peut être affiché ou masqué selon des règles :
- Niveau de stock (afficher un bloc "urgence" si stock < 10)
- Appareil (mobile uniquement, desktop uniquement)

**Paramètres de page globaux**
- Fond : couleur, dégradé CSS ou image de fond
- SEO : titre, description, og:image pour les réseaux sociaux

**Thème personnalisable**
Couleurs, polices, espacements et rayons de bordure sont définis une fois et appliqués à tous les blocs via des variables CSS injectées sur `:root`.

**Critical CSS automatique**
Le CSS critique est généré et injecté directement dans le HTML à la sauvegarde, éliminant tout flash de contenu non stylé (FOUC).

**Lazy loading des blocs**
Les blocs hors écran sont chargés au scroll via `IntersectionObserver`, garantissant des performances optimales même sur les pages longues.

---

## Architecture technique

### Frontend

| Technologie | Rôle |
|---|---|
| **Next.js 14** (App Router) | Framework React, SSR, routing |
| **React 18** | UI, Suspense, transitions |
| **TypeScript** | Typage strict sur tout le projet |
| **Tailwind CSS** | Styles utilitaires |
| **Zustand** | État global (auth, panier, affiliation) avec persistance localStorage SSR-safe |
| **TanStack Query** | Fetching, cache, mutations et auto-save |
| **Axios** | Client HTTP avec intercepteurs JWT et refresh automatique |
| **dnd-kit** | Drag & drop accessible pour le builder |
| **Vitest + Playwright** | Tests unitaires et end-to-end |

### Backend

| Technologie | Rôle |
|---|---|
| **Django 4** | Framework web Python |
| **Django REST Framework** | API REST |
| **PostgreSQL** | Base de données principale (JSONB pour les configs de blocs) |
| **Redis** | Cache des pages de vente et des thèmes |
| **djangorestframework-simplejwt** | Authentification JWT avec rotation des refresh tokens |
| **django-cors-headers** | Gestion CORS multi-origines |
| **Stripe** | Paiement en ligne (Hosted Checkout) |

### Infrastructure

| Composant | Service |
|---|---|
| Frontend | Vercel |
| Backend | Local + tunnel Ngrok |
| Base de données | PostgreSQL local |
| Cache | Redis local |

---

## Système d'affiliation

Le système d'affiliation est sécurisé de bout en bout par signature HMAC-SHA256.

### Flow complet

```
1. Affilié génère un lien signé
   POST /affiliations/links/<id>/signed-url/
   → URL : /?ref=<code>&sig=<hmac>&exp=<timestamp>

2. Visiteur clique sur le lien
   GET /affiliations/validate/?ref=...&sig=...&exp=...
   → Backend vérifie la signature (temps constant, anti timing-attack)
   → Cookie agc_ref posé côté client (30 jours)

3. Client passe commande
   POST /orders/create/ { referral_code: <code> }
   → Transaction atomique : commande + décrément stock + commission

4. Commission créée automatiquement
   → Statut : pending → validated (après 14 jours) → paid
```

### Sécurité

- La signature couvre `tracking_code + product_id + expires_at` — impossible de falsifier le taux ou le produit ciblé
- Comparaison en temps constant (`hmac.compare_digest`) — protection contre les timing attacks
- Liens valides 30 jours, configurables
- Throttling sur la validation : 30 requêtes/minute par IP

---

## Transactions atomiques

Chaque commande est créée dans une transaction `@transaction.atomic` qui garantit :

1. Vérification du stock disponible
2. Création de la commande et des lignes
3. Décrément du stock (via `F()` expression — sans race condition)
4. Résolution du code d'affiliation
5. Création de la commission

Si une étape échoue, tout est annulé. Aucune commande sans stock, aucune commission sans commande.

---

## Tableau de bord

Chaque rôle dispose d'une vue dédiée :

**Vue E-commerçant**
- Chiffre d'affaires, nombre de produits actifs, affiliés actifs
- Gestion des produits et des pages de vente
- Suivi des commandes et des commissions versées
- Gestion de l'écosystème affilié (taux max par produit)

**Vue Affilié**
- Liens actifs avec statistiques de clics
- Commissions en attente, validées et versées
- Taux de conversion par lien

**Vue Client**
- Historique des commandes
- Statut de livraison

---

## Lancer le projet en local

### Prérequis

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Redis

### Backend

```bash
cd backend
cp .env.example .env
# Remplir les variables dans .env

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Remplir NEXT_PUBLIC_API_URL=http://localhost:8000

npm install
npm run dev
```

### Variables d'environnement clés

**Backend `.env`**
```
SECRET_KEY=...
DEBUG=True
DB_NAME=agc_space
CORS_ALLOWED_ORIGINS=http://localhost:3000
HMAC_SECRET_KEY=...
```

**Frontend `.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AFFILIATION_COOKIE_DAYS=30
NEXT_PUBLIC_BUILDER_V2=true
```

---

## Tests

```bash
# Tests unitaires frontend
cd frontend && npm run test

# Tests end-to-end
cd frontend && npm run test:e2e

# Tests backend
cd backend && pytest
```

---

## Structure du projet

```
agc-space/
├── frontend/                  # Next.js 14
│   ├── app/                   # Routes (App Router)
│   │   ├── (auth)/            # Login, Register
│   │   ├── (dashboard)/       # Tableau de bord
│   │   ├── (shop)/            # Marketplace
│   │   └── checkout/          # Tunnel de paiement
│   └── src/
│       ├── modules/
│       │   ├── builder/       # Smart Builder (éditeur + renderer)
│       │   ├── auth/          # Authentification
│       │   ├── cart/          # Panier
│       │   ├── affiliation/   # Tracking affilié
│       │   ├── stripe/        # Paiement
│       │   └── dashboard/     # Vues vendeur/affilié/client
│       ├── components/ui/     # Composants réutilisables
│       ├── lib/               # API client, utils
│       └── types/             # Types TypeScript globaux
│
└── backend/                   # Django REST Framework
    ├── products/              # Produits, thèmes, templates
    ├── affiliations/          # Liens, commissions, HMAC
    ├── orders/                # Commandes, transactions atomiques
    ├── users/                 # Auth, rôles
    └── agc_core/              # Settings, middleware, URLs
```

---

*Projet développé par Gilles — AGC Space © 2026*
