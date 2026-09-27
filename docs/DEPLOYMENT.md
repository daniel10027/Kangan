# Guide de déploiement — Kangan Finance

Ce guide couvre l'installation locale, le déploiement web sur Vercel, le
backend sur Supabase, le build mobile via EAS, et l'usage de Docker pour
lancer toute la plateforme en une seule commande. Correspond à la section 17
du cahier des charges ("Déploiement gratuit et exigences non fonctionnelles").

## 1. Prérequis

- Node.js 20+
- Docker Desktop (pour la stack Supabase locale)
- Un compte [Supabase](https://supabase.com) (offre Free)
- Un compte [Vercel](https://vercel.com) (offre Hobby)
- Un compte [Expo](https://expo.dev) (offre Free, pour les builds EAS)
- La CLI Supabase : `npx supabase --version` (pas d'installation globale requise)

## 2. Installation locale

```bash
git clone <votre-dépôt> kangan-finance
cd kangan-finance
npm install                # installe tous les workspaces (web, mobile, packages)
cp .env.example apps/web/.env.local
cp .env.example .env       # utilisé par scripts/seed-demo-data.ts
```

### 2.1 Démarrer le backend Supabase local

```bash
npx supabase start
```

Cette commande applique automatiquement `supabase/migrations/*.sql` (schéma,
RLS, triggers d'immuabilité RG13, fonctions RPC) puis `supabase/seed.sql`
(écoles et grilles tarifaires de démonstration). Elle affiche les clés
`anon` et `service_role` à copier dans `apps/web/.env.local` et `.env`
(les valeurs par défaut du dépôt correspondent déjà aux clés de
démonstration fixes utilisées par la CLI Supabase en local).

Studio (interface d'administration de la base) : http://localhost:54323

### 2.2 Créer les comptes de démonstration

```bash
npm run seed:demo
```

Crée 3 comptes parents, 2 comptes établissement et 1 super-admin Kangan,
ainsi qu'une dizaine de caisses couvrant tous les statuts. Les numéros de
test et les OTP (visibles dans les logs Supabase en local) sont affichés en
fin de script.

### 2.3 Lancer le web

```bash
npm run dev:web
```

→ http://localhost:3000

### 2.4 Lancer le mobile

```bash
cp apps/mobile/.env.example apps/mobile/.env   # si présent, sinon voir ci-dessous
npm run dev:mobile
```

Variables d'environnement mobile attendues (`apps/mobile/.env` ou export shell) :

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<clé anon affichée par supabase start>
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Scanner le QR code avec Expo Go, ou lancer un simulateur iOS/Android.

## 3. Tout lancer d'un coup avec Docker

```bash
npx supabase start        # backend (une fois, tourne en tâche de fond)
npm run seed:demo
docker compose up --build             # web (port 3000)
docker compose --profile mobile up    # + bundler Expo (port 19006), optionnel
```

Le `docker-compose.yml` construit l'image de production du web
(`apps/web/Dockerfile`, build Next.js "standalone") et, avec le profil
`mobile`, démarre le bundler Metro/Expo pour un accès web au client mobile.
Un build APK/IPA réel passe par EAS (section 4), pas par Docker — Docker
sert ici la démonstration et le développement, pas le packaging natif.

## 4. Build mobile (Android/iOS) via EAS

```bash
cd apps/mobile
npx eas login
npx eas build:configure
npx eas build -p android --profile preview   # génère un APK installable, QR code fourni
```

Le profil `preview` (voir `eas.json`) produit un APK direct (pas d'App
Bundle), idéal pour une installation manuelle par le jury ou les
établissements pilotes. Le profil `production` est prêt pour la soumission
aux stores (Play Store / App Store) une fois la période de test terminée.

## 5. Déploiement du backend (Supabase, projet hébergé)

1. Créer un projet sur [supabase.com](https://supabase.com) (offre Free).
2. Lier le projet local : `npx supabase link --project-ref <ref>`.
3. Pousser le schéma : `npx supabase db push` (applique les migrations).
4. Exécuter `supabase/seed.sql` depuis le SQL Editor de Supabase Studio (ou
   `npx supabase db execute -f supabase/seed.sql`).
5. Copier l'URL du projet et les clés `anon`/`service_role` dans les
   variables d'environnement Vercel (étape suivante).
6. Activer l'authentification par téléphone (Authentication → Providers →
   Phone) et brancher un fournisseur SMS réel (Twilio ou équivalent) avant
   le lancement commercial — en local/pilote, Supabase affiche l'OTP dans
   les logs sans envoi réel.

## 6. Déploiement du web sur Vercel

1. Importer le dépôt GitHub dans Vercel.
2. **Root Directory** : `apps/web` (paramètre du projet Vercel).
3. Activer *"Include files outside the root directory"* (nécessaire pour
   que Vercel voie `packages/*` et le `package-lock.json` racine).
4. Renseigner les variables d'environnement (Production + Preview) :

   | Variable | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase hébergé |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé anon du projet |
   | `SUPABASE_SERVICE_ROLE_KEY` | clé service_role (secret) |
   | `PAYMENT_MODE` | `simulator` pour la démo, `live` en production réelle |
   | `NEXT_PUBLIC_PAYMENT_MODE` | même valeur que `PAYMENT_MODE` |
   | `NEXT_PUBLIC_APP_URL` | URL Vercel du déploiement |
   | `JWT_AUDIT_SALT` | chaîne aléatoire longue (secret) |
   | `MOOV_MONEY_*` | uniquement en mode `live`, fournies par Moov Africa |

5. Déployer. Chaque branche obtient une URL de prévisualisation ; `main` est
   la production (section 17, procédure de déploiement).

## 7. Vérification post-déploiement

- [ ] `/` (landing) répond et affiche le simulateur.
- [ ] `/parent/login` envoie un OTP (vérifier les logs Supabase si SMS non
      branché).
- [ ] Un parent peut créer une caisse, verser l'acompte (mode simulateur),
      et voir la jauge canari se remplir.
- [ ] `/ecole/dashboard` affiche les indicateurs pour un compte établissement.
- [ ] `/admin/dashboard` est bloqué pour un rôle non-Kangan.
- [ ] `/api/v1/schools` répond en JSON (endpoint public).
- [ ] Le relevé PDF se télécharge et son QR renvoie vers `/verify/{number}`.

## 8. Offres gratuites utilisées (section 17)

| Service | Offre | Rôle |
|---|---|---|
| Vercel | Hobby | Landing, espaces parent/école/admin, API |
| Supabase | Free | PostgreSQL, Auth, Storage |
| Expo EAS | Free | Builds Android (APK) et iOS |
| GitHub Actions | Free (repos publics) / inclus | Tests et déploiement continu |

Les limites exactes des offres gratuites évoluent : les vérifier sur le
site de chaque service avant le dépôt de candidature. L'offre Vercel Hobby
est réservée à un usage non commercial ; le passage en offre Pro est prévu
au lancement commercial (voir section 19 du cahier des charges, business
plan).
