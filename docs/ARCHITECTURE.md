# Architecture technique — Kangan Finance

Référence : cahier des charges v1.0, section 12. Ce document explicite les
choix d'implémentation et les écarts assumés par rapport au texte du cahier
des charges (voir aussi `SUIVI.md`, section "Écarts assumés").

## Vue d'ensemble

```
apps/
  web/        Next.js 15 (App Router) — landing, espace parent, espace
              école, back-office Kangan, API REST /api/v1/*
  mobile/     Expo (React Native + Expo Router) — application parent

packages/
  shared/     Types, schémas Zod, règles de gestion RG01–RG15, calculs
              financiers, formatage — un seul contrat de données pour
              le web, le mobile et l'API.
  ui/         Jetons de design (couleurs, typographie, rayons) partagés.
  payments/   Interface PaymentAdapter + implémentations (Moov Money,
              agrégateur générique, simulateur de démonstration).

supabase/
  migrations/ Schéma SQL, RLS, triggers d'immuabilité, fonctions RPC.
  seed.sql    Données de référence publiques (écoles, grilles tarifaires).

scripts/
  seed-demo-data.ts   Comptes et caisses de démonstration (API Admin).
```

## Écart n°1 — Un seul runtime serveur (Next.js), pas d'Edge Functions Supabase

Le cahier des charges mentionne "Route handlers Next.js **et** Edge
Functions Supabase" pour l'API et les webhooks. Ce dépôt implémente
l'intégralité de la logique serveur — y compris les webhooks opérateurs —
en routes Next.js (`apps/web/src/app/api/v1/**`).

**Pourquoi :** un seul runtime signifie un seul dépôt à déployer (Vercel),
un seul langage de logique métier, et des fonctions serveur qui peuvent
appeler directement `packages/payments` et `packages/shared` sans
duplication. Fonctionnellement équivalent : les routes utilisent le client
`service_role` (`src/server/supabase-admin.ts`) pour les écritures
protégées, exactement comme le ferait une Edge Function.

**Si une migration vers des Edge Functions Supabase s'avérait nécessaire**
(par exemple pour rapprocher le traitement des webhooks de la base de
données et réduire la latence), la logique de `src/server/payments-service.ts`
et des routes `api/v1/webhooks/*` est déjà isolée et porterait sans
réécriture majeure.

## Écart n°2 — Authentification unifiée par téléphone/OTP pour tous les rôles

Le cahier des charges section 15 prévoit "mot de passe fort et double
authentification obligatoire" pour les comptes établissement et back-office,
par opposition à l'OTP téléphone des parents. Ce dépôt utilise
l'authentification Supabase par téléphone/OTP pour **tous** les rôles
(parent, école, agent Kangan), afin de garder un unique mécanisme
d'authentification pour le pilote.

**Prochaine étape documentée (non implémentée) :** activer
`supabase.auth.mfa.enroll()` (TOTP) pour les rôles `ecole_admin`,
`ecole_comptable`, `kangan_agent` et `kangan_super_admin`, avec une
politique RLS/applicative qui exige un facteur AAL2 pour ces rôles.

## Flux d'un versement (section 10)

```
Parent (web/mobile)
  → POST /api/v1/boxes/{id}/payments   [Idempotency-Key obligatoire]
      → create_pending_transaction()   (RPC Postgres, statut "initiee")
      → PaymentAdapter.initiate()      (Moov Money réel, ou simulateur)
  ← 202 { transaction, initiation }

Opérateur (ou bouton "Confirmer" en mode simulateur)
  → POST /api/v1/webhooks/moov-money   [signature HMAC vérifiée]
      → settle_transaction()           (RPC Postgres, atomique) :
          - transaction: "initiee" → "reussie" | "echouee"
          - si "reussie" : écriture au grand livre (ledger_entries)
          - si type="deposit" et succès : caisse "en_attente" → "active" (RG03)
          - si 100% atteint : caisse → "completee"
```

Le simulateur (`packages/payments/src/simulator.ts`) emprunte exactement le
même chemin de code : `SimulatorAdapter.buildFakeWebhook()` produit un corps
et une signature rejoués sur `POST /api/v1/dev/simulate-confirm`, qui appelle
la même fonction `settlePayment()` que le webhook réel. La démonstration
devant le jury exerce donc le code de production, pas un chemin parallèle.

## Authentification web ↔ mobile partagée

`src/server/authed-supabase.ts` résout un client Supabase respectant RLS
à partir soit des cookies (navigateur web), soit d'un en-tête
`Authorization: Bearer <access_token>` (mobile, qui ne peut pas s'appuyer
sur les cookies). Toutes les routes protégées utilisent cette résolution
unique — c'est ce qui permet au mobile et au web de consommer exactement
la même API REST (section 12 : "un seul contrat de données").

## Immuabilité et grand livre (RG13)

- `transactions` et `ledger_entries` ne sont jamais modifiées côté client.
- Un trigger PostgreSQL (`guard_transaction_settlement`) autorise une seule
  transition de statut (`initiee` → `reussie`/`echouee`/`annulee`) et
  rejette toute tentative de modifier un montant, un opérateur ou une
  transaction déjà réglée.
- Toute correction passe par `reverse_transaction()` (RPC), qui insère une
  **nouvelle** transaction de type `reversal` avec l'écriture comptable
  inverse — jamais une modification de l'original.
- Le solde d'une caisse (`box_balances`, vue SQL) est **toujours** recalculé
  depuis `ledger_entries`, jamais stocké sur `savings_boxes`.

## Sécurité — RLS (section 15)

Voir `supabase/migrations/0004_rls_policies.sql`. Principe : un parent ne
voit que les caisses de ses propres enfants (via `students.parent_id`), un
membre d'établissement ne voit que les ressources liées à son
`school_id`. Les écritures financières n'ont **aucune** politique
`insert`/`update` pour le rôle `authenticated` : seul le client
`service_role` (routes serveur, après vérification applicative) peut y
écrire.
