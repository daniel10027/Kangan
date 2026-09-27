# Kangan Finance

**La rentrée se prépare pièce par pièce.**

Kangan Finance est une caisse scolaire digitale pour la Côte d'Ivoire : les
parents épargnent progressivement les frais scolaires de leurs enfants via
Mobile Money (Moov Money en priorité), les établissements reçoivent un
acompte anticipé et un suivi de trésorerie en temps réel.

Projet réalisé pour le **Moov Startup Challenge 2026** (Fin-Tech / Ed-Tech).
Cahier des charges complet : `Kangan_Finance_Cahier_des_charges.pdf`.
Suivi détaillé de toutes les tâches (web, mobile, backend, sécurité, tests,
déploiement) : [`SUIVI.md`](./SUIVI.md).

## Aperçu

| | |
|---|---|
| **Web** | Landing page, espace parent, espace établissement, back-office Kangan |
| **Mobile** | Application parent (Expo / React Native), Android et iOS |
| **Backend** | Supabase (PostgreSQL, Auth, Storage), API REST partagée web + mobile |
| **Paiements** | Moov Money (adaptateur prêt), agrégateur multi-opérateurs, **simulateur de démonstration** |
| **Statut** | Prototype fonctionnel — voir `SUIVI.md` pour le détail par domaine |

## Démarrage rapide

```bash
npm install
npx supabase start        # backend local (Docker) — voir docs/DEPLOYMENT.md
npm run seed:demo         # comptes et caisses de démonstration
npm run dev:web           # http://localhost:3000
npm run dev:mobile        # Expo — scanner le QR code avec Expo Go
```

Ou tout lancer via Docker (backend Supabase démarré séparément) :

```bash
npx supabase start && npm run seed:demo
docker compose up --build
```

Guide complet, variables d'environnement, déploiement Vercel/EAS :
[`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

## Comptes de test (après `npm run seed:demo`)

| Rôle | Téléphone | Notes |
|---|---|---|
| Parent (Aya) | +2250700000001 | 2 enfants, caisses active (50 %) et complétée |
| Parent (Moussa) | +2250700000002 | Caisses en attente et brouillon |
| Parent (Fatou) | +2250700000003 | Caisse active, faible progression |
| École admin (Les Colombes) | +2250700000010 | Espace établissement |
| École comptable (Excellence) | +2250700000011 | Espace établissement |
| Super-admin Kangan | +2250700000099 | Back-office complet |

En local, le code OTP n'est pas envoyé par SMS réel : il apparaît dans les
logs de `supabase start` (Inbucket/logs Auth).

## Structure du dépôt

```
apps/
  web/       Next.js 15 — landing, espaces parent/école/admin, API /api/v1
  mobile/    Expo (React Native) — application parent
packages/
  shared/    Types, schémas Zod, règles de gestion RG01–RG15
  ui/        Jetons de design (couleurs, typographie)
  payments/  Adaptateurs de paiement (Moov Money, agrégateur, simulateur)
supabase/    Schéma SQL, politiques RLS, fonctions RPC, données de seed
scripts/     Scripts opérationnels (seed de démonstration)
docs/        Architecture, déploiement, sécurité, guides utilisateurs, API
```

Détail des choix d'architecture et des écarts assumés par rapport au cahier
des charges : [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Documentation

- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — installation locale, Docker, Vercel, Supabase, EAS
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — architecture technique et écarts assumés
- [`docs/openapi.yaml`](./docs/openapi.yaml) — référence API OpenAPI 3.1
- [`docs/SECURITY.md`](./docs/SECURITY.md) — checklist de sécurité (OWASP Top 10 / MASVS)
- [`docs/USER_GUIDE_PARENT.md`](./docs/USER_GUIDE_PARENT.md) — guide utilisateur parent
- [`docs/USER_GUIDE_ECOLE.md`](./docs/USER_GUIDE_ECOLE.md) — guide utilisateur établissement
- [`SUIVI.md`](./SUIVI.md) — suivi de toutes les tâches, y compris les écarts assumés

## Tests

```bash
npm run test --workspace=@kangan/shared     # règles de gestion RG01–RG15 (23 tests)
npm run test --workspace=@kangan/payments   # adaptateurs de paiement + simulateur (4 tests)
npm run test --workspace=@kangan/web        # helpers serveur (PIN, rate-limit)
cd apps/web && npx playwright test          # bout en bout (landing, pages publiques)
```

## Stack technique

Next.js 15 (App Router, TypeScript), React Native + Expo Router,
Tailwind CSS / NativeWind, Framer Motion / Reanimated, Supabase (PostgreSQL,
Auth, Storage, RLS), Zod, @react-pdf/renderer, GitHub Actions, Docker,
Vercel, Expo EAS.

## Licence et confidentialité

Document confidentiel — Moov Startup Challenge 2026. Voir
[`docs/openapi.yaml`](./docs/openapi.yaml) et les pages `/legal/*` de
l'application pour les conditions d'utilisation et la politique de
confidentialité.
