# Politique et checklist de sécurité — Kangan Finance

Référence : cahier des charges v1.0, section 15. Ce document est la version
technique destinée à l'équipe et aux auditeurs ; la version grand public est
publiée sur `/legal/securite`.

## Mesures implémentées

| Domaine | Mesure | Implémentation |
|---|---|---|
| Accès parent | OTP à l'inscription | Supabase Auth (téléphone), `supabase.auth.signInWithOtp` |
| Accès parent | PIN à 4 chiffres | Haché (scrypt + sel), `apps/web/src/server/pin.ts` — jamais stocké en clair |
| Accès parent | Biométrie à l'ouverture (mobile) | `expo-local-authentication`, opt-in après création du PIN |
| Données | Chiffrement en transit | TLS géré par Vercel/Supabase (HTTPS partout) |
| Base de données | RLS sur toutes les tables sensibles | `supabase/migrations/0004_rls_policies.sql` |
| Base de données | Écritures financières réservées au serveur | Aucune politique INSERT/UPDATE pour `authenticated` sur `transactions`/`ledger_entries` |
| Webhooks | Vérification de signature | HMAC-SHA256, `packages/payments/src/webhook-signature.ts` |
| Webhooks | Anti-rejeu | Clé d'idempotence unique par transaction (contrainte SQL `unique`) |
| Fraude | Plafonds par niveau KYC | `isWithinKycLimit()`, `packages/shared/src/rules.ts` |
| Traçabilité | Journal d'audit immuable | Table `audit_logs`, triggers interdisant UPDATE/DELETE |
| Immuabilité | Transactions en ajout seul | Trigger `guard_transaction_settlement` (RG13) |
| API | Limitation de débit | `apps/web/src/server/rate-limit.ts` (60 req/min/utilisateur, 5 OTP/heure/numéro) |
| API | Validation stricte des entrées | Schémas Zod partagés (`packages/shared/src/schemas.ts`) |

## Mesures documentées mais non implémentées dans ce dépôt

Ces points nécessitent soit un contrat tiers, soit une décision produit
hors du périmètre du code :

- **Double authentification (MFA/TOTP)** pour les rôles établissement et
  back-office (voir `docs/ARCHITECTURE.md`, écart n°2).
- **Verrouillage après 5 essais PIN** : les colonnes `failed_pin_attempts`
  et `locked_until` existent dans `profiles`, la logique d'incrémentation
  et de verrouillage reste à câbler dans la route de vérification du PIN
  (non implémentée : le PIN local n'est actuellement utilisé qu'à la
  création de profil, pas encore comme verrou d'ouverture d'app séparé de
  la session Supabase).
- **Détection d'appareil rooté/jailbreaké** (mobile) : à ajouter avant le
  lancement commercial (ex. `expo-device` + heuristiques, ou une librairie
  dédiée).
- **Déclaration ARTCI** effective (démarche administrative, pas du code) —
  modèle de traitement documenté dans `/legal/confidentialite`.
- **Revue OWASP Top 10 / OWASP MASVS formelle** par un tiers, avant le
  lancement commercial (voir grille ci-dessous pour l'auto-évaluation).

## Auto-évaluation OWASP Top 10 (Web, 2021)

| Risque | Statut | Notes |
|---|---|---|
| A01 Broken Access Control | Traité | RLS + vérification de rôle applicative sur toutes les routes serveur |
| A02 Cryptographic Failures | Traité | PIN haché (scrypt), HTTPS, secrets hors code (variables d'environnement) |
| A03 Injection | Traité | Requêtes via client Supabase paramétré, aucune concaténation SQL manuelle |
| A04 Insecure Design | Traité | Grand livre en double écriture, idempotence, immuabilité en base |
| A05 Security Misconfiguration | À vérifier | Revoir les en-têtes de sécurité HTTP (CSP, HSTS) avant lancement commercial |
| A06 Vulnerable Components | Suivi continu | `npm audit` en CI recommandé (voir `.github/workflows/ci.yml`) |
| A07 Identification/Auth Failures | Partiel | OTP + PIN en place ; MFA établissement/admin non fait (écart n°2) |
| A08 Software/Data Integrity | Traité | Triggers d'immuabilité, clé d'idempotence, signature des webhooks |
| A09 Logging/Monitoring Failures | Partiel | `audit_logs` en place ; Sentry recommandé en production (non branché ici) |
| A10 SSRF | Non applicable | Aucun appel serveur vers une URL fournie par l'utilisateur |

## Auto-évaluation OWASP MASVS (Mobile)

| Catégorie | Statut | Notes |
|---|---|---|
| MASVS-STORAGE | Partiel | Session Supabase via AsyncStorage (standard officiel) ; migrer vers `expo-secure-store` pour les tokens en production |
| MASVS-CRYPTO | Traité | Aucune crypto maison pour l'auth ; PIN haché côté serveur |
| MASVS-AUTH | Partiel | OTP + PIN + biométrie opt-in ; verrouillage après échecs à implémenter |
| MASVS-NETWORK | Traité | HTTPS uniquement vers l'API et Supabase |
| MASVS-PLATFORM | À faire | Détection root/jailbreak non implémentée |
| MASVS-CODE | Traité | Pas de `eval`, dépendances via npm officiel |
| MASVS-RESILIENCE | À faire | Pas d'obfuscation/anti-tampering — à évaluer selon le niveau de risque réel avant lancement commercial |

## Procédure en cas d'incident

1. Isoler : suspendre le compte ou l'établissement concerné via le
   back-office (`/admin/etablissements`, `/admin/litiges`).
2. Documenter : toute action de correction passe par une contre-écriture
   motivée (jamais une modification directe), tracée dans `audit_logs`.
3. Notifier : information du parent/établissement concerné, délai légal de
   notification à respecter selon la loi n° 2013-450.
