import { LegalPage } from "@/components/legal/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation" updated="26 septembre 2026">
      <p>
        Les présentes conditions régissent l'usage de Kangan Finance par les parents (titulaires de
        caisse), les contributeurs et les établissements partenaires.
      </p>

      <h2>Nature du service</h2>
      <p>
        Kangan Finance est un opérateur technique. L'argent versé transite par des opérateurs de
        Mobile Money agréés et repose sur un compte de cantonnement ouvert chez un partenaire
        financier agréé par la BCEAO. Kangan ne détient jamais les fonds en propre.
      </p>

      <h2>Règles de fonctionnement d'une caisse</h2>
      <ul>
        <li>Le montant cible est la somme des frais publiés par l'établissement pour le niveau et l'année scolaire choisis.</li>
        <li>L'acompte, fixé en pourcentage par l'établissement, active la caisse une fois confirmé par l'opérateur de paiement.</li>
        <li>Le versement minimum est de 500 F CFA ; un versement supérieur au solde restant dû est plafonné à ce solde.</li>
        <li>À la date limite, le solde de la caisse est reversé à l'établissement, que l'objectif soit atteint ou non.</li>
        <li>En cas de refus d'inscription, de fermeture de l'établissement ou de force majeure documentée, le parent est remboursé à 100 %, hors frais d'opérateur, sous 7 jours ouvrés.</li>
      </ul>

      <h2>Frais</h2>
      <p>
        Kangan perçoit une commission de 2 % sur les montants reversés à l'établissement et des frais
        d'ouverture de 1 000 F CFA par caisse et par année scolaire. Les frais de l'opérateur Mobile
        Money restent à la charge du payeur et sont affichés avant chaque validation.
      </p>

      <h2>Immuabilité des écritures</h2>
      <p>
        Aucune transaction confirmée n'est modifiée ni supprimée. Toute correction fait l'objet d'une
        contre-écriture motivée, tracée dans le journal d'audit.
      </p>

      <h2>Résiliation</h2>
      <p>
        Un parent peut clôturer son compte à tout moment ; les données de profil sont supprimées hors
        obligation légale de conservation des données financières.
      </p>
    </LegalPage>
  );
}
