import { LegalPage } from "@/components/legal/LegalPage";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="26 septembre 2026">
      <p>
        Kangan Finance traite des données personnelles de parents, d'enfants bénéficiaires et de
        personnels d'établissement afin d'assurer le fonctionnement de la caisse scolaire digitale.
      </p>

      <h2>Déclaration réglementaire</h2>
      <p>
        Le traitement est déclaré auprès de l'Autorité de Régulation des Télécommunications de Côte
        d'Ivoire (ARTCI), conformément à la loi n° 2013-450 du 19 juin 2013 relative à la protection
        des données à caractère personnel.
      </p>

      <h2>Données collectées</h2>
      <ul>
        <li>Identité et numéro de téléphone du parent (vérifié par OTP)</li>
        <li>Identité de l'enfant bénéficiaire (photo facultative)</li>
        <li>Historique des versements et des caisses scolaires</li>
        <li>Pièce d'identité, au-delà d'un certain plafond (niveaux KYC 2 et 3)</li>
      </ul>

      <h2>Minimisation et consentement</h2>
      <p>
        Seules les données utiles à l'ouverture et au suivi d'une caisse sont collectées. Le
        consentement explicite du parent, titulaire de l'autorité parentale, est requis pour les
        données de l'enfant.
      </p>

      <h2>Vos droits</h2>
      <p>
        Droits d'accès, de rectification et de suppression exerçables depuis l'application, avec une
        réponse sous 30 jours. Les données financières sont conservées selon les obligations
        comptables et de lutte anti-blanchiment ; les données de profil sont supprimées après
        fermeture du compte, hors obligation légale contraire.
      </p>

      <h2>Partage des données</h2>
      <p>
        Aucune revente de données. Les statistiques partagées avec nos partenaires (établissements,
        partenaire financier, Moov Africa) le sont sous forme agrégée et anonyme uniquement.
      </p>
    </LegalPage>
  );
}
