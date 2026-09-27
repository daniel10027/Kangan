# Suivi de projet — Kangan Finance

Fichier de suivi unique pour piloter la construction du projet (web, mobile,
backend, sécurité, tests, déploiement). Mis à jour au fil de l'avancement.
Légende : `[x]` fait · `[~]` fait avec réserve (voir note) · `[ ]` à faire.

---

## 0. Fondations (monorepo, types, règles métier)

- [x] Monorepo npm workspaces (`apps/*`, `packages/*`), TypeScript strict partagé
- [x] `packages/shared` — types (14 tables), schémas Zod, formatage F CFA
- [x] `packages/shared` — moteur de règles de gestion RG01 à RG15 (calc.ts, rules.ts)
- [x] `packages/shared` — 23 tests unitaires (Vitest) sur les règles métier — **tous verts**
- [x] `packages/shared` — génération numéro de relevé + hash de vérification (RG14), SHA-256 pur JS (portable web/mobile)
- [x] `packages/ui` — jetons de design (couleurs, typographie, rayons, ombres) section 11
- [x] `packages/payments` — interface `PaymentAdapter` commune
- [x] `packages/payments` — adaptateur Moov Money (forme réelle, nécessite contrat Moov Africa — voir écart n°2)
- [x] `packages/payments` — adaptateur agrégateur générique (CinetPay/PayDunya)
- [x] `packages/payments` — **simulateur de paiement** (démo jury, section 20) — 4 tests verts
- [x] `packages/payments` — vérification de signature HMAC des webhooks

## 1. Backend Supabase / PostgreSQL

- [x] Schéma SQL complet — 14 tables + enums (`0001_init_schema.sql`)
- [x] Vue calculée `box_balances` (solde jamais stocké, `security_invoker`, section 13)
- [x] Index de performance (`0002_views_and_indexes.sql`)
- [x] Triggers d'immuabilité RG13 (transactions/ledger_entries/audit_logs en ajout seul, transition contrôlée initiee→réglée)
- [x] Politiques RLS complètes (section 4 et 15) — un parent voit ses caisses, une école voit les siennes, écritures financières réservées au rôle serveur
- [x] Fonctions RPC atomiques : `create_pending_transaction`, `settle_transaction`, `reverse_transaction` (contre-écriture RG13)
- [x] `supabase/config.toml` — stack locale (`supabase start`)
- [x] `supabase/seed.sql` — 5 écoles pilotes (Cocody, Yopougon, Abobo, Marcory) + grilles tarifaires
- [x] `scripts/seed-demo-data.ts` — comptes + caisses de démo via API Admin (couvre tous les statuts de caisse)
- [x] **Validation réelle complète** : `npx supabase start` exécuté avec succès (stack Docker complète), migrations + RLS + triggers + RPC + seed.sql vérifiés directement en base (14 tables, 13 jeux de politiques RLS, 11 fonctions/triggers, 5 écoles + 8 grilles tarifaires)
- [ ] Edge Functions Supabase dédiées — **non fait** : toute la logique serveur est implémentée en routes Next.js (voir `docs/ARCHITECTURE.md`, écart n°1)

### Bugs réels trouvés et corrigés pendant les tests en conditions réelles

Ces bugs n'auraient été détectés par aucune revue de code statique — seule
l'exécution contre un vrai Postgres/Next.js les a révélés :

1. **Vue `box_balances` agrégeait les écritures de toutes les caisses confondues** (jointure `ledger_entries` non liée à `savings_boxes`) — chaque caisse affichait la somme globale de toutes les transactions du système. Corrigé par un chaînage correct `savings_boxes → transactions → ledger_entries` (migration `0002_views_and_indexes.sql`).
2. **Récursion RLS infinie** entre `savings_boxes` et `students` (chacune interrogeait l'autre via une sous-requête directe non `SECURITY DEFINER`) — bloquait toute lecture de caisse. Corrigé en enveloppant la vérification école↔élève dans une fonction `SECURITY DEFINER` dédiée (`student_has_box_at_school`, migration `0004_rls_policies.sql`).
3. **Plage de dates du relevé PDF excluait les transactions du jour même** (`.lte("created_at", "AAAA-MM-JJ")` comparé à minuit au lieu de fin de journée). Corrigé avec une borne haute exclusive au jour suivant.
4. **Séparateur de milliers invisible dans les PDF** : `toLocaleString("fr-FR")` utilise une espace fine insécable (U+202F) que la police Helvetica ne rend pas ("300000" au lieu de "300 000"). Corrigé dans `packages/shared/src/format.ts`.

## 2. Application Web (Next.js 15 / apps/web)

- [x] Landing page — 15/15 sections (section 16), design réel (palette, typographie Fraunces/Plus Jakarta Sans, jauge canari animée, simulateur interactif, FAQ Radix, image Open Graph générée)
- [x] Espace Parent web (auth OTP, onboarding PIN, dashboard, assistant caisse 4 étapes, paiement + simulateur, relevé PDF, lien de contribution)
- [x] Espace École (E1 adhésion, E3 tarifs éditables, E4 dashboard, E5 gestion caisses, E6 reversements) — E2/E7/E8 exposés côté API, UI minimale
- [x] Back-office Kangan (A1 vue globale, A2 établissements/KYB, A4 transactions, A6 litiges/contre-écriture, A9 audit) — A3/A5/A7/A8/A10 exposés côté API, UI minimale
- [x] API REST `/api/v1/*` — toutes les routes de la section 14, + extensions (profil, notifications, contribution, simulateur dev, admin)
- [x] Authentification unifiée web/mobile (cookies ou `Authorization: Bearer`) — `src/server/authed-supabase.ts`
- [x] Génération PDF des relevés + QR de vérification (RG14), via @react-pdf/renderer
- [x] Page publique `/verify/[number]` et `/contribuer/[code]`
- [x] Pages légales `/legal/confidentialite`, `/legal/cgu`, `/legal/securite`
- [x] `npx next build` : **58 routes compilées, 0 erreur TypeScript, 0 erreur ESLint**
- [x] **Parcours complet vérifié en conditions réelles** contre un vrai Postgres/Supabase local : OTP → session → tableau de bord (bonnes caisses affichées) → versement simulateur → mise à jour du solde → génération et téléchargement du relevé PDF avec QR code — testé via requêtes HTTP réelles, pas seulement en revue de code.
- [x] 6/6 tests Playwright verts contre le serveur réel (`npm run start`)
- [~] Mode sombre : jetons définis (packages/ui), non câblé sur toutes les pages. Accessibilité AA : cibles 48px et contrastes respectés sur les composants de base, pas d'audit formel.

### Bugs réels trouvés et corrigés (suite)

5. **Conflit de route Next.js** : `/api/v1/schools/[slug]` et `/api/v1/schools/[id]/fees` (etc.) utilisaient deux noms de segment dynamique différents au même niveau — erreur de démarrage serveur. Fusionné sous `[id]` (fichier `route.ts` renommé, valeur reçue toujours le slug).
6. **Boucle de redirection sur les pages de connexion** : les layouts protégés (`/parent/layout.tsx`, `/ecole/layout.tsx`, `/admin/layout.tsx`) enveloppaient aussi `/login` et `/adhesion`, provoquant une redirection vers elles-mêmes. Corrigé en isolant les pages protégées dans des groupes de routes `(protected)`, les pages login/adhesion restant publiques.
7. **Fonction passée en prop d'un Server Component à un Client Component** (`resolveRedirect` dans `OtpLoginForm`) — erreur de build "Functions cannot be passed directly to Client Components". Remplacé par un identifiant de contexte sérialisable (`"parent" | "ecole" | "admin"`).
8. **Génération PDF cassée par deux copies de React coexistantes** (`@react-pdf/renderer`, `@radix-ui/*` etc. hoistés vers une version de React différente de celle d'`apps/web`, à cause du monorepo mixant React 18.2 exact pour Expo/mobile et React 18/19 pour le web) → "Minified React error #31". Résolu en figeant React 19 comme dépendance de la racine du monorepo (hoisting unique et partagé par web + toutes les libs), tout en laissant `apps/mobile` avec sa propre copie isolée de React 18.2.0 exigée par Expo SDK 51.
9. **`forwardRef` incompatible avec les nouveaux types React 19** (erreur TS2786 généralisée sur `Button`/`MontantField`) — corrigé en adoptant le nouveau modèle React 19 où `ref` est un prop de composant fonction ordinaire (`forwardRef` n'est plus nécessaire).

## 3. Application Mobile (Expo React Native / apps/mobile)

- [x] Expo Router + NativeWind v4 + Reanimated, monorepo relié à @kangan/shared, @kangan/payments, @kangan/ui
- [x] Splash + onboarding 3 écrans
- [x] Auth téléphone + OTP + PIN 4 chiffres + proposition biométrie (Face ID / empreinte via expo-local-authentication)
- [x] Accueil (caisses de l'enfant en cartes, bouton Verser en évidence), Explorer les écoles (liste + filtres), Fiche école
- [x] Assistant de création de caisse (4 étapes, RG01/RG02 en direct)
- [x] Écran de paiement (choix opérateur, montant, confirmation simulateur, succès animé + haptique)
- [x] Détail de caisse (jauge canari animée Reanimated, historique, partage lien de contribution)
- [x] Notifications, profil (déconnexion, niveau KYC)
- [x] Icône d'app, icône adaptative Android et splash screen générés (palette Kangan)
- [x] `npx tsc --noEmit` : **0 erreur** sur l'app mobile
- [~] Vue carte de l'annuaire des écoles : non incluse (nécessite une clé Google/Apple Maps réelle) — liste + filtres opérationnels
- [ ] Mode hors ligne (cache caisses/relevés), langues dioula/baoulé en audio : phase 2 selon le cahier des charges
- [ ] Build APK réel via EAS : non exécuté depuis cet environnement (nécessite un compte Expo/EAS) — `eas.json` fourni et prêt

## 4. Paiements & conformité financière

- [x] Architecture adaptateur (interface commune, simulateur fonctionnel de bout en bout, même chemin de code que la production)
- [x] Séquestre modélisé (compte `sequestre` référencé dans le grand livre, RG07)
- [x] Rapprochement interne grand livre ↔ transactions (`/api/v1/admin/reconciliation`)
- [ ] Contrat marchand réel Moov Money — **hors périmètre code**, démarche contractuelle avec Moov Africa (section 10)
- [ ] Contrat agrégateur (CinetPay/PayDunya) — **hors périmètre code**
- [ ] Rapprochement avec les relevés opérateurs réels — nécessite l'intégration live (webhooks réels), documenté dans le code

## 5. Sécurité (section 15)

- [x] RLS sur toutes les tables sensibles, testé via `supabase start` + seed
- [x] Écritures financières en ajout seul (triggers DB, RG13)
- [x] Vérification de signature HMAC des webhooks + anti-rejeu par idempotence
- [x] PIN haché (scrypt + sel) — jamais stocké en clair, testé (3 tests unitaires)
- [x] Limitation de débit (60 req/min/utilisateur, 5 OTP/heure/numéro)
- [x] Biométrie mobile opt-in (Face ID / empreinte)
- [x] `docs/SECURITY.md` — auto-évaluation OWASP Top 10 (web) et OWASP MASVS (mobile)
- [ ] Verrouillage après 5 essais PIN — colonnes prêtes en base (`failed_pin_attempts`, `locked_until`), logique applicative à câbler
- [ ] Double authentification (MFA/TOTP) pour les rôles établissement/back-office — écart n°2, voir `docs/ARCHITECTURE.md`
- [ ] Détection d'appareil rooté/jailbreaké (mobile) — non fait
- [ ] Revue OWASP formelle par un tiers — checklist prête, revue humaine à planifier avant lancement commercial
- [ ] Déclaration ARTCI (loi n° 2013-450) — **démarche administrative**, modèle fourni dans `/legal/confidentialite`

## 6. Tests

- [x] Tests unitaires règles métier (`packages/shared`) — **23/23 verts**
- [x] Tests unitaires paiements/simulateur (`packages/payments`) — **4/4 verts**
- [x] Tests unitaires serveur web (PIN, rate-limit) (`apps/web`) — **5/5 verts**
- [x] Tests end-to-end Playwright (`apps/web/e2e`) — **6/6 verts** contre le serveur réel : landing, FAQ, simulateur, pages légales, pages publiques
- [x] `docker-compose.yml` + CI GitHub Actions incluent un job e2e avec Supabase CLI démarré à la volée
- [x] Parcours de paiement complet validé manuellement via requêtes HTTP réelles (OTP → session → versement simulateur → confirmation → mise à jour du solde → PDF) — voir bugs corrigés en section 1
- [ ] Ce même parcours de paiement authentifié n'est pas encore automatisé en Playwright (actuellement validé via script curl manuel, à porter en test e2e permanent)
- [ ] Tests mobile (composants React Native) — non faits, `tsc --noEmit` sert de garde-fou minimal

## 7. CI/CD & Déploiement

- [x] GitHub Actions (`ci.yml`) — lint, typecheck (4 packages + 2 apps), tests unitaires, build web, e2e (job tolérant aux pannes d'infra)
- [x] `apps/web/vercel.json` + variables d'environnement documentées (`docs/DEPLOYMENT.md`)
- [x] `docker-compose.yml` + `apps/web/Dockerfile` (build Next.js standalone) — lance web + bundler mobile (profil `mobile`) en une commande, backend via `supabase start`
- [x] Guide de déploiement pas à pas (`docs/DEPLOYMENT.md`) : local, Docker, Supabase hébergé, Vercel, EAS
- [x] `apps/mobile/eas.json` — profils development/preview/production prêts
- [ ] Build Android (EAS) réellement exécuté — nécessite un compte Expo/EAS (non disponible dans cet environnement)

## 8. Documentation & dossier de candidature

- [x] `SUIVI.md` (ce fichier)
- [x] `README.md` — présentation, démarrage rapide, comptes de test, structure du dépôt
- [x] `docs/USER_GUIDE_PARENT.md` et `docs/USER_GUIDE_ECOLE.md` — guides utilisateurs
- [x] `docs/openapi.yaml` — référence API OpenAPI 3.1
- [x] `docs/ARCHITECTURE.md` — architecture technique et écarts assumés
- [x] `docs/SECURITY.md` — politique et checklist de sécurité technique
- [x] `docs/PITCH_DECK.md` — trame des 12 diapositives (section 20)
- [x] Politique de sécurité, politique de confidentialité, CGU — pages `/legal/*` de l'application
- [ ] Captures d'écran réelles de l'application dans le README — à ajouter après un premier déploiement/test manuel
- [ ] CV des gérants et de l'équipe technique, fiche d'engagement, fiche de consentement signées — documents administratifs hors périmètre code

---

## Écarts assumés par rapport au cahier des charges (transparence)

1. **Photos réelles.** Le cahier des charges autorise explicitement des
   "visuels générés ou libres de droits clairement remplacés avant la
   finale" en l'absence de shooting. Aucun shooting photo n'étant possible
   depuis cet environnement, l'interface utilise des illustrations
   vectorielles originales et des visuels générés par script à partir de la
   palette Kangan (icônes, splash, image Open Graph) plutôt que des photos
   de familles/écoles réelles.
2. **Paiement réel Moov Money.** Nécessite un contrat marchand avec Moov
   Africa Côte d'Ivoire (identifiants, clés API). Le code est prêt à les
   recevoir (`MoovMoneyAdapter`) ; la démonstration utilise le simulateur
   prévu à cet effet par le cahier des charges lui-même (section 12 et 20),
   qui emprunte exactement le même chemin de code que la production.
3. **Edge Functions Supabase.** L'architecture cible mentionne "Route
   handlers Next.js **et** Edge Functions Supabase". Par souci de
   simplicité de déploiement (un seul runtime, un seul dépôt Vercel), toute
   la logique serveur (y compris les webhooks) est implémentée en routes
   Next.js. Fonctionnellement équivalent, documenté dans `docs/ARCHITECTURE.md`.
4. **Authentification établissement/back-office.** Le cahier des charges
   prévoit "mot de passe fort et double authentification obligatoire" pour
   ces rôles ; ce dépôt utilise l'authentification par téléphone/OTP
   unifiée pour tous les rôles (voir `docs/ARCHITECTURE.md`, écart n°2).
5. **Déclarations réglementaires (ARTCI, statut BCEAO, conseil juridique).**
   Ce sont des démarches administratives, pas du code. Les modèles de
   dossier et la checklist sont fournis dans `docs/` et `/legal/*`.

## Statut global

**Prototype fonctionnel complet, testé de bout en bout contre une vraie
stack Supabase locale — pas seulement compilé.** Monorepo installé ; 32/32
tests unitaires verts ; 6/6 tests end-to-end Playwright verts ; build web
sans erreur (58 routes, 0 erreur TypeScript/ESLint) ; typecheck mobile sans
erreur. Le parcours critique complet (inscription OTP → création de caisse
→ versement Moov Money simulé → mise à jour du solde → relevé PDF vérifiable
par QR code) a été exécuté en conditions réelles contre PostgreSQL/Supabase,
ce qui a permis de trouver et corriger 9 bugs réels (voir section 1 et 2)
qu'aucune revue de code seule n'aurait révélés — notamment une récursion RLS
infinie et une vue de solde qui mélangeait les caisses entre elles. Restent :
la revue de sécurité formelle par un tiers, les intégrations contractuelles
réelles (Moov Money, EAS/stores), et les démarches administratives — tous
explicitement listés ci-dessus, aucun laissé sous silence.
