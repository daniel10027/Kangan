import { LegalPage } from "@/components/legal/LegalPage";

export default function SecurityPolicyPage() {
  return (
    <LegalPage title="Politique de sécurité" updated="26 septembre 2026">
      <p>Kangan Finance manipule l'argent des familles et les données de mineurs : la sécurité est une exigence de conception, pas une option ajoutée après coup.</p>

      <h2>Accès et authentification</h2>
      <ul>
        <li>Inscription par numéro de téléphone vérifié par OTP.</li>
        <li>Code PIN à 4 chiffres, verrouillage après 5 essais infructueux.</li>
        <li>Comptes établissement et back-office protégés par un contrôle de rôle strict.</li>
      </ul>

      <h2>Données et base de données</h2>
      <ul>
        <li>Chiffrement en transit (TLS 1.2 minimum) et au repos.</li>
        <li>Sécurité au niveau des lignes (Row Level Security) sur toutes les tables sensibles : un parent ne voit que ses caisses, un établissement ne voit que les siennes.</li>
        <li>Les écritures financières (transactions, grand livre) sont en ajout seul : aucune modification ni suppression n'est possible, y compris techniquement, en dehors d'une contre-écriture motivée.</li>
      </ul>

      <h2>Paiements</h2>
      <ul>
        <li>Vérification de signature (HMAC) de tous les webhooks opérateurs.</li>
        <li>Clé d'idempotence sur chaque demande de paiement pour éviter tout double débit en cas de réseau instable.</li>
        <li>Plafonds de versement selon le niveau de vérification d'identité (KYC).</li>
      </ul>

      <h2>Traçabilité</h2>
      <p>
        Un journal d'audit immuable enregistre qui a fait quoi, quand, sur quelle ressource, pour
        toutes les actions sensibles du back-office.
      </p>

      <h2>Revue de sécurité</h2>
      <p>
        Une revue OWASP Top 10 (web) et OWASP MASVS (mobile) est planifiée avant le lancement
        commercial. Le code source et les politiques d'accès sont conçus pour la faciliter dès
        aujourd'hui (voir SUIVI.md du dépôt technique).
      </p>
    </LegalPage>
  );
}
